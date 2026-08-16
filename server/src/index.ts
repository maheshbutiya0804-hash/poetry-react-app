import 'dotenv/config'
import cors from 'cors'
import express from 'express'
import multer from 'multer'
import path from 'node:path'
import fs from 'node:fs/promises'
import { createReadStream, existsSync } from 'node:fs'
import { randomUUID } from 'node:crypto'
import { fileURLToPath } from 'node:url'
import { prisma } from "./lib/prisma.js";
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib'
import { z } from 'zod'
import { createLoginSession, destroyLoginSession, getAuthenticatedUser, hashPassword, normalizeEmail, passwordPolicyError, requireAdmin, safeUser, verifyPassword } from './lib/auth.js'
import { OAuth2Client } from 'google-auth-library'
import unzipper from 'unzipper'
import Stripe from 'stripe'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const serverRoot = path.resolve(__dirname, '..')
const storageRoot = process.env.STORAGE_ROOT?.trim() || path.join(serverRoot, 'storage')
const cardsRoot = path.join(storageRoot, 'cards')
const challengesRoot = path.join(storageRoot, 'challenges')
const importsRoot = path.join(storageRoot, 'imports')

const app = express()
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 25 * 1024 * 1024 },
})

const bulkZipUpload = multer({
  storage: multer.diskStorage({
    destination: async (_req, _file, cb) => {
      try { await fs.mkdir(importsRoot, { recursive: true }); cb(null, importsRoot) } catch (error) { cb(error as Error, importsRoot) }
    },
    filename: (_req, file, cb) => cb(null, `${randomUUID()}-${path.basename(file.originalname).replace(/[^a-zA-Z0-9._-]+/g, '-')}`),
  }),
  limits: { fileSize: 750 * 1024 * 1024, files: 1 },
  fileFilter: (_req, file, cb) => {
    const ok = file.originalname.toLowerCase().endsWith('.zip') || ['application/zip','application/x-zip-compressed'].includes(file.mimetype)
    cb(ok ? null : new Error('Only ZIP files are allowed.'), ok)
  },
})

const allowedOrigins = [
  'http://localhost:5173',
  'https://laurentine.co',
  'https://www.laurentine.co',
]

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true)
    } else {
      callback(new Error(`CORS blocked origin: ${origin}`))
    }
  },
  credentials: true,
}))


function paginationFromQuery(req: express.Request, defaultPageSize = 10) {
  const page = Math.max(1, Number.parseInt(String(req.query.page ?? '1'), 10) || 1)
  const pageSize = Math.min(100, Math.max(5, Number.parseInt(String(req.query.pageSize ?? defaultPageSize), 10) || defaultPageSize))
  return { page, pageSize, skip: (page - 1) * pageSize }
}

function paginationMeta(page: number, pageSize: number, total: number) {
  return { page, pageSize, total, totalPages: Math.max(1, Math.ceil(total / pageSize)) }
}

function stripeDashboardUrl(id: string | null | undefined) {
  if (!id) return null
  const testMode = process.env.STRIPE_SECRET_KEY?.trim().startsWith('sk_test_')
  const root = `https://dashboard.stripe.com/${testMode ? 'test/' : ''}`
  if (id.startsWith('in_')) return `${root}invoices/${id}`
  if (id.startsWith('pi_') || id.startsWith('ch_') || id.startsWith('py_')) return `${root}payments/${id}`
  if (id.startsWith('sub_')) return `${root}subscriptions/${id}`
  if (id.startsWith('cus_')) return `${root}customers/${id}`
  return `${root}search?query=${encodeURIComponent(id)}`
}

async function upsertSuccessfulStripeInvoice(userId: string, invoice: any) {
  if (!invoice?.id) return null
  return prisma.paymentTransaction.upsert({
    where: { providerTransactionId: String(invoice.id) },
    create: {
      userId,
      providerTransactionId: String(invoice.id),
      description: 'Laurentine monthly subscription',
      amount: Number(invoice.amount_paid ?? invoice.amount_due ?? 0) / 100,
      currency: String(invoice.currency ?? 'usd').toUpperCase(),
      status: 'SUCCESS',
      occurredAt: invoice.status_transitions?.paid_at ? new Date(Number(invoice.status_transitions.paid_at) * 1000) : new Date(),
    },
    update: {
      status: 'SUCCESS',
      amount: Number(invoice.amount_paid ?? invoice.amount_due ?? 0) / 100,
      occurredAt: invoice.status_transitions?.paid_at ? new Date(Number(invoice.status_transitions.paid_at) * 1000) : undefined,
    },
  })
}

function stripeClient() {
  const key = process.env.STRIPE_SECRET_KEY?.trim()
  if (!key) throw new Error('STRIPE_SECRET_KEY is not configured.')
  return new Stripe(key)
}

function stripeSubscriptionStatus(status: string) {
  if (status === 'active' || status === 'trialing') return 'ACTIVE'
  if (status === 'canceled') return 'CANCELLED'
  if (['past_due', 'unpaid', 'paused'].includes(status)) return 'PAYMENT_ISSUE'
  return 'INCOMPLETE'
}

function stripePeriodEnd(subscription: any) {
  const seconds = subscription?.current_period_end ?? subscription?.items?.data?.[0]?.current_period_end
  return seconds ? new Date(Number(seconds) * 1000) : null
}

async function syncStripeSubscription(userId: string, subscription: any, paymentStatus?: string) {
  const status = stripeSubscriptionStatus(String(subscription?.status ?? 'incomplete'))
  const customerId = typeof subscription?.customer === 'string' ? subscription.customer : subscription?.customer?.id
  const subscriptionId = subscription?.id ? String(subscription.id) : undefined
  const startedSeconds = subscription?.start_date ?? subscription?.created
  return prisma.subscription.upsert({
    where: { userId },
    create: {
      userId,
      planName: 'Monthly Access',
      monthlyPrice: 8.99,
      status,
      paymentStatus: paymentStatus ?? (status === 'ACTIVE' ? 'PAID' : 'NONE'),
      startedAt: startedSeconds ? new Date(Number(startedSeconds) * 1000) : new Date(),
      currentPeriodEnd: stripePeriodEnd(subscription),
      cancelledAt: status === 'CANCELLED' ? new Date() : null,
      cancelAtPeriodEnd: Boolean(subscription?.cancel_at_period_end),
      stripeCustomerId: customerId ?? null,
      stripeSubscriptionId: subscriptionId ?? null,
    },
    update: {
      status,
      ...(paymentStatus ? { paymentStatus } : {}),
      currentPeriodEnd: stripePeriodEnd(subscription),
      cancelledAt: status === 'CANCELLED' ? new Date() : null,
      cancelAtPeriodEnd: Boolean(subscription?.cancel_at_period_end),
      ...(customerId ? { stripeCustomerId: customerId } : {}),
      ...(subscriptionId ? { stripeSubscriptionId: subscriptionId } : {}),
    },
  })
}

async function userIdForStripeSubscription(subscriptionId: string | null | undefined) {
  if (!subscriptionId) return null
  const existing = await prisma.subscription.findUnique({ where: { stripeSubscriptionId: subscriptionId } })
  if (existing) return existing.userId
  try {
    const sub: any = await stripeClient().subscriptions.retrieve(subscriptionId)
    return sub?.metadata?.userId || null
  } catch { return null }
}

// Stripe requires the unmodified request body for webhook signature verification.
app.post('/billing/stripe-webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET?.trim()
  const signature = req.headers['stripe-signature']
  if (!endpointSecret || typeof signature !== 'string') return res.status(400).send('Stripe webhook is not configured.')
  let event: Stripe.Event
  try {
    event = stripeClient().webhooks.constructEvent(req.body, signature, endpointSecret)
  } catch (error) {
    console.error('Stripe webhook signature verification failed:', error)
    return res.status(400).send('Invalid webhook signature.')
  }

  try {
    const object: any = event.data.object
    if (event.type === 'checkout.session.completed' && object?.mode === 'subscription') {
      const userId = object?.metadata?.userId || object?.client_reference_id
      const subscriptionId = typeof object?.subscription === 'string' ? object.subscription : object?.subscription?.id
      if (userId && subscriptionId) {
        const subscription: any = await stripeClient().subscriptions.retrieve(subscriptionId, { expand: ['latest_invoice'] })
        await syncStripeSubscription(String(userId), subscription, object.payment_status === 'paid' ? 'PAID' : undefined)
        if (object.payment_status === 'paid' && subscription?.latest_invoice && typeof subscription.latest_invoice !== 'string') {
          await upsertSuccessfulStripeInvoice(String(userId), subscription.latest_invoice)
        }
      }
    } else if (event.type === 'customer.subscription.updated' || event.type === 'customer.subscription.deleted' || event.type === 'customer.subscription.created') {
      const subscription: any = object
      const userId = subscription?.metadata?.userId || await userIdForStripeSubscription(subscription?.id)
      if (userId) await syncStripeSubscription(String(userId), subscription)
    } else if (event.type === 'invoice.paid') {
      const invoice: any = object
      const subscriptionId = typeof invoice?.subscription === 'string'
        ? invoice.subscription
        : invoice?.parent?.subscription_details?.subscription ?? null
      const userId = await userIdForStripeSubscription(typeof subscriptionId === 'string' ? subscriptionId : subscriptionId?.id)
      if (userId) {
        if (subscriptionId) {
          const sid = typeof subscriptionId === 'string' ? subscriptionId : subscriptionId.id
          const subscription: any = await stripeClient().subscriptions.retrieve(sid)
          await syncStripeSubscription(userId, subscription, 'PAID')
        }
await upsertSuccessfulStripeInvoice(userId, invoice)
      }
    } else if (event.type === 'invoice.payment_failed') {
      const invoice: any = object
      const subscriptionId = typeof invoice?.subscription === 'string'
        ? invoice.subscription
        : invoice?.parent?.subscription_details?.subscription ?? null
      const sid = typeof subscriptionId === 'string' ? subscriptionId : subscriptionId?.id
      const userId = await userIdForStripeSubscription(sid)
      if (userId) {
        await prisma.subscription.updateMany({ where: { userId }, data: { paymentStatus: 'FAILED', status: 'PAYMENT_ISSUE' } })
        await prisma.paymentTransaction.upsert({
          where: { providerTransactionId: String(invoice.id) },
          create: { userId, providerTransactionId: String(invoice.id), description: 'Subscription payment failed', amount: Number(invoice.amount_due ?? 0) / 100, currency: String(invoice.currency ?? 'usd').toUpperCase(), status: 'FAILED' },
          update: { status: 'FAILED' },
        })
      }
    }
    return res.json({ received: true })
  } catch (error) {
    console.error('Stripe webhook processing failed:', error)
    return res.status(500).json({ message: 'Webhook processing failed.' })
  }
})

app.use(express.json())
// Public assets are intentionally limited. Original card PDFs and ZIP imports stay private.
app.use('/uploads/cards',
  (req, res, next) => {
    // Never expose original PDFs through the public /uploads route.
    if (req.path.toLowerCase().endsWith('.pdf')) return res.status(403).json({ message: 'Subscription required.' })
    next()
  },
  express.static(cardsRoot, { fallthrough: true })
)
app.use('/uploads/profiles', express.static(path.join(storageRoot, 'profiles')))
app.use('/uploads/challenges', express.static(challengesRoot))

const publicCardSelect = {
  id: true,
  slug: true,
  collectionId: true,
  categoryId: true,
  category: { select: { id: true, name: true, slug: true } },
  collection: { select: { id: true, name: true, slug: true } },
  title: true,
  description: true,
  pdfPath: true,
  previewPath: true,
  widthInches: true,
  heightInches: true,
  orientation: true,
  sideCount: true,
  pageCount: true,
  isPublished: true,
  poemText: true,
  adminNotes: true,
  isFeatured: true,
  templateKey: true,
  frontLayout: true,
  backLayout: true,
  updatedAt: true,
} as const

function absoluteAssetUrl(req: express.Request, relativePath: string | null) {
  if (!relativePath) return null
  return `${req.protocol}://${req.get('host')}/uploads/${relativePath.replaceAll('\\', '/')}`
}

function cardDto(req: express.Request, card: any) {
  return {
    id: card.id,
    slug: card.slug,
    collectionId: card.collectionId,
    categoryId: card.categoryId ?? null,
    categoryName: card.category?.name ?? null,
    collectionName: card.collection?.name ?? null,
    title: card.title,
    excerpt: card.description,
    previewImageUrl: absoluteAssetUrl(req, card.previewPath) ?? '',
    // Original PDF is subscriber-only and is never exposed as a public storage URL.
    pdfUrl: null,
    poemText: card.poemText ?? '',
    adminNotes: card.adminNotes ?? '',
    isFeatured: card.isFeatured ?? false,
    templateKey: card.templateKey ?? 'botanical-cream',
    frontLayout: card.frontLayout ?? null,
    backLayout: card.backLayout ?? null,
    published: card.isPublished,
    widthInches: card.widthInches,
    heightInches: card.heightInches,
    orientation: card.orientation,
    sideCount: card.sideCount,
    pageCount: card.pageCount,
    updatedAt: card.updatedAt,
  }
}

app.get('/health', (_req, res) => res.json({ ok: true }))

// Stripe-hosted Checkout for the Laurentine Love Notes monthly subscription.
app.post('/billing/subscription-checkout', async (req, res) => {
  const auth = await getAuthenticatedUser(req)
  if (!auth) return res.status(401).json({ message: 'Please sign in before subscribing.' })
  const priceId = process.env.STRIPE_MONTHLY_PRICE_ID?.trim()
  const frontendUrl = (process.env.FRONTEND_URL || 'https://laurentine.co').replace(/\/$/, '')
  if (!priceId) return res.status(500).json({ message: 'Subscription checkout is not configured.' })

  const requestedReturn = typeof req.body?.returnPath === 'string' ? req.body.returnPath : '/love-notes'
  const returnPath = requestedReturn.startsWith('/') && !requestedReturn.startsWith('//') ? requestedReturn.split('?')[0] : '/love-notes'
  try {
    const existing = await prisma.subscription.findUnique({ where: { userId: auth.id } })
    const session = await stripeClient().checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [{ price: priceId, quantity: 1 }],
      customer: existing?.stripeCustomerId || undefined,
      customer_email: existing?.stripeCustomerId ? undefined : auth.email,
      client_reference_id: auth.id,
      metadata: { userId: auth.id, returnPath },
      subscription_data: { metadata: { userId: auth.id } },
      success_url: `${frontendUrl}${returnPath}?checkout=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${frontendUrl}${returnPath}?checkout=cancelled`,
    })
    res.json({ sessionId: session.id, url: session.url })
  } catch (error: any) {
    console.error('Stripe checkout error:', error)
    res.status(500).json({ message: error?.message || 'Could not start subscription checkout.' })
  }
})

app.get('/billing/confirm-subscription', async (req, res) => {
  const auth = await getAuthenticatedUser(req)
  if (!auth) return res.status(401).json({ message: 'Authentication required.' })
  const sessionId = String(req.query.session_id ?? '').trim()
  if (!sessionId) return res.status(400).json({ message: 'Missing checkout session.' })
  try {
    const session: any = await stripeClient().checkout.sessions.retrieve(sessionId, { expand: ['subscription', 'subscription.latest_invoice'] })
    const sessionUserId = session?.metadata?.userId || session?.client_reference_id
    if (sessionUserId !== auth.id) return res.status(403).json({ message: 'This checkout belongs to another account.' })
    const subscription: any = typeof session.subscription === 'string' ? await stripeClient().subscriptions.retrieve(session.subscription) : session.subscription
    if (!subscription) return res.status(409).json({ active: false, message: 'Stripe has not attached the subscription yet.' })
    const dbSub = await syncStripeSubscription(auth.id, subscription, session.payment_status === 'paid' ? 'PAID' : undefined)
    if (session.payment_status === 'paid' && subscription?.latest_invoice && typeof subscription.latest_invoice !== 'string') {
      await upsertSuccessfulStripeInvoice(auth.id, subscription.latest_invoice)
    }
    res.json({ active: dbSub.status === 'ACTIVE', subscription: { status: dbSub.status, currentPeriodEnd: dbSub.currentPeriodEnd, monthlyPrice: Number(dbSub.monthlyPrice) } })
  } catch (error: any) {
    console.error('Stripe subscription confirmation failed:', error)
    res.status(502).json({ message: error?.message || 'Could not confirm subscription.' })
  }
})

app.post('/billing/portal', async (req, res) => {
  const auth = await getAuthenticatedUser(req)
  if (!auth) return res.status(401).json({ message: 'Authentication required.' })
  const subscription = await prisma.subscription.findUnique({ where: { userId: auth.id } })
  if (!subscription?.stripeCustomerId) return res.status(400).json({ message: 'No Stripe billing profile is available yet.' })
  const frontendUrl = (process.env.FRONTEND_URL || 'https://laurentine.co').replace(/\/$/, '')
  try {
    const portal = await stripeClient().billingPortal.sessions.create({ customer: subscription.stripeCustomerId, return_url: `${frontendUrl}/profile` })
    res.json({ url: portal.url })
  } catch (error: any) {
    res.status(500).json({ message: error?.message || 'Could not open subscription management.' })
  }
})

app.get('/collections', async (_req, res) => {
  const collections = await prisma.collection.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: 'asc' },
    include: { _count: { select: { cards: { where: { isPublished: true } } } } },
  })
  res.json(collections.map(c => ({ ...c, cardCount: c._count.cards, _count: undefined })))
})

app.get('/collections/:collectionId/cards', async (req, res) => {
  const cards = await prisma.card.findMany({
    where: { collectionId: req.params.collectionId, isPublished: true },
    orderBy: { createdAt: 'desc' },
    select: publicCardSelect,
  })
  res.json(cards.map(card => cardDto(req, card)))
})

app.get('/categories', async (_req, res) => {
  try {
    const categories = await prisma.category.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },

      // Explicit select avoids the date-field problems we encountered earlier.
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        isActive: true,
        sortOrder: true,
      },
    })

    
    res.json(categories)
  } catch (error) {
    console.error('GET /categories failed:', error)

    res.status(500).json({
      message: 'Could not load categories.',
    })
  }
})

async function requireActiveSubscription(req: express.Request, res: express.Response) {
  const auth = await getAuthenticatedUser(req)
  if (!auth) {
    res.status(401).json({ message: 'Sign in to access this card.' })
    return null
  }
  const subscription = await prisma.subscription.findUnique({ where: { userId: auth.id } })
  const active = subscription?.status === 'ACTIVE' && (!subscription.currentPeriodEnd || subscription.currentPeriodEnd > new Date())
  if (!active) {
    res.status(403).json({ message: 'An active subscription is required to access the original PDF.' })
    return null
  }
  return auth
}

app.get('/cards/:cardId/pdf', async (req, res) => {
  const auth = await requireActiveSubscription(req, res)
  if (!auth) return
  const card = await prisma.card.findFirst({
    where: { id: req.params.cardId, isPublished: true },
    select: { id: true, slug: true, title: true, pdfPath: true, originalFileName: true },
  })
  if (!card?.pdfPath) return res.status(404).json({ message: 'PDF not found.' })
  const absolute = path.resolve(storageRoot, card.pdfPath)
  const allowedRoot = path.resolve(cardsRoot) + path.sep
  if (!absolute.startsWith(allowedRoot) || !existsSync(absolute)) return res.status(404).json({ message: 'PDF not found.' })
  const download = String(req.query.download || '') === '1'
  const safeName = (card.originalFileName || `${card.slug || card.id}.pdf`).replace(/[\r\n"\\/]/g, '-')
  res.setHeader('Content-Type', 'application/pdf')
  res.setHeader('Cache-Control', 'private, no-store')
  res.setHeader('Content-Disposition', `${download ? 'attachment' : 'inline'}; filename="${safeName}"`)
  createReadStream(absolute).pipe(res)
})

app.get('/cards/:cardId', async (req, res) => {
  const card = await prisma.card.findFirst({
    where: { id: req.params.cardId, isPublished: true },
    select: publicCardSelect,
  })
  if (!card) return res.status(404).json({ message: 'Card not found' })
  res.json(cardDto(req, card))
})

const registerSchema = z.object({
  fullName: z.string().trim().min(2).max(191),
  email: z.string().email().max(191),
  phone: z.string().trim().max(50).optional().default(''),
  password: z.string().min(8).max(200),
})

const loginSchema = z.object({
  email: z.string().email().max(191),
  password: z.string().min(1).max(200),
})

const googleLoginSchema = z.object({
  credential: z.string().min(20),
})

const googleClient = new OAuth2Client()

app.post('/auth/register', async (req, res) => {
  const parsed = registerSchema.safeParse(req.body)
  if (!parsed.success) return res.status(400).json({ message: 'Please check the registration form.', issues: parsed.error.issues })
  const email = normalizeEmail(parsed.data.email)
  const policyError = passwordPolicyError(parsed.data.password)
  if (policyError) return res.status(400).json({ message: policyError })
  try {
    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) return res.status(409).json({ message: 'An account with this email already exists.' })
    const passwordHash = await hashPassword(parsed.data.password)
    const user = await prisma.user.create({
      data: {
        fullName: parsed.data.fullName,
        email,
        phone: parsed.data.phone || null,
        passwordHash,
        role: 'USER',
        status: 'ACTIVE',
      },
    })
    await createLoginSession(res, user.id)
    res.status(201).json({ user: safeUser(user) })
  } catch (error) {
    console.error('Register failed:', error)
    res.status(500).json({ message: 'Could not create your account.' })
  }
})

app.post('/auth/login', async (req, res) => {
  const parsed = loginSchema.safeParse(req.body)
  if (!parsed.success) return res.status(400).json({ message: 'Email and password are required.' })
  const email = normalizeEmail(parsed.data.email)
  try {
    const user = await prisma.user.findUnique({ where: { email } })
    // Keep the public response identical for missing users and bad passwords.
    if (!user?.passwordHash || !(await verifyPassword(parsed.data.password, user.passwordHash))) {
      return res.status(401).json({ message: 'Invalid email or password.' })
    }
    if (user.status !== 'ACTIVE') return res.status(403).json({ message: 'This account is not active.' })
    await prisma.authSession.deleteMany({ where: { userId: user.id, expiresAt: { lt: new Date() } } })
    await createLoginSession(res, user.id)
    const updated = await prisma.user.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } })
    res.json({ user: safeUser(updated) })
  } catch (error) {
    console.error('Login failed:', error)
    res.status(500).json({ message: 'Could not sign in.' })
  }
})

app.post('/auth/google', async (req, res) => {
  const parsed = googleLoginSchema.safeParse(req.body)

  if (!parsed.success) {
    return res.status(400).json({
      message: 'Google credential is required.',
    })
  }

  const googleClientId = process.env.GOOGLE_CLIENT_ID?.trim()

  if (!googleClientId) {
    console.error('GOOGLE_CLIENT_ID is not configured.')

    return res.status(500).json({
      message: 'Google sign-in is not configured.',
    })
  }

  try {
    const ticket = await googleClient.verifyIdToken({
      idToken: parsed.data.credential,
      audience: googleClientId,
    })

    const payload = ticket.getPayload()

    const googleSubject = payload?.sub
    const email = payload?.email
      ? normalizeEmail(payload.email)
      : ''

    if (
      !googleSubject ||
      !email ||
      payload?.email_verified !== true
    ) {
      return res.status(401).json({
        message: 'Google could not verify this email address.',
      })
    }

    /*
     * Find existing Google account first.
     */
    let user = await prisma.user.findUnique({
      where: {
        googleSubject,
      },
    })

    /*
     * If Google account is not linked yet,
     * check for an existing HeartString account
     * using the verified email.
     */
    if (!user) {
      user = await prisma.user.findUnique({
        where: {
          email,
        },
      })

      if (
        user?.googleSubject &&
        user.googleSubject !== googleSubject
      ) {
        return res.status(409).json({
          message:
            'This email is already linked to another Google account.',
        })
      }
    }

    /*
     * CREATE NEW USER
     */
    if (!user) {
      const fallbackName =
        email.split('@')[0] || 'HeartString Member'

      user = await prisma.user.create({
        data: {
          fullName:
            payload?.name?.trim() || fallbackName,

          email,

          phone: null,
          passwordHash: null,

          googleSubject,

          profileImageUrl:
            payload?.picture || null,

          role: 'USER',
          status: 'ACTIVE',

          lastLoginAt: new Date(),
        },
      })
    }

    /*
     * UPDATE EXISTING USER
     */
    else {
      if (user.status !== 'ACTIVE') {
        return res.status(403).json({
          message: 'This account is not active.',
        })
      }

      const updateData = {
        googleSubject:
          user.googleSubject || googleSubject,

        profileImageUrl:
          payload?.picture || user.profileImageUrl,

        lastLoginAt: new Date(),
      }

      /*
       * Bluehost/MySQL may occasionally return:
       *
       * 1615 - Prepared statement needs to be re-prepared
       *
       * Retry once after a short delay.
       */
      try {
        user = await prisma.user.update({
          where: {
            id: user.id,
          },

          data: updateData,
        })
      } catch (updateError: any) {
        const errorText =
          `${updateError?.message || ''} ${updateError?.meta?.driverAdapterError?.message || ''}`

        const isPreparedStatementError =
          errorText.includes('1615') ||
          errorText.includes(
            'Prepared statement needs to be re-prepared',
          )

        if (!isPreparedStatementError) {
          throw updateError
        }

        console.warn(
          'MySQL prepared statement expired. Retrying user update...',
        )

        await new Promise((resolve) =>
          setTimeout(resolve, 250),
        )

        user = await prisma.user.update({
          where: {
            id: user.id,
          },

          data: updateData,
        })
      }
    }

    /*
     * Remove expired sessions.
     */
    await prisma.authSession.deleteMany({
      where: {
        userId: user.id,

        expiresAt: {
          lt: new Date(),
        },
      },
    })

    /*
     * Create login session.
     */
    await createLoginSession(
      res,
      user.id,
    )

    return res.json({
      user: safeUser(user),

      isNewUser:
        user.passwordHash === null &&
        user.googleSubject === googleSubject,
    })
  } catch (error) {
    console.error(
      'GOOGLE AUTH ERROR:',
      error,
    )

    /*
     * Don't return internal database details
     * to the browser in production.
     */
    return res.status(401).json({
      message:
        'Google sign-in could not be completed.',
    })
  }
})

app.get('/auth/me', async (req, res) => {
  try {
    const user = await getAuthenticatedUser(req)
    if (!user) return res.status(401).json({ message: 'Not signed in.' })
    res.json({ user })
  } catch (error) {
    console.error('Session lookup failed:', error)
    res.status(500).json({ message: 'Could not load session.' })
  }
})

app.post('/auth/logout', async (req, res) => {
  try {
    await destroyLoginSession(req, res)
    res.status(204).end()
  } catch (error) {
    console.error('Logout failed:', error)
    res.status(500).json({ message: 'Could not sign out.' })
  }
})

const profileSchema = z.object({ fullName: z.string().trim().min(2).max(191), phone: z.string().trim().max(50).default('') })
const profilePasswordSchema = z.object({ currentPassword: z.string().optional(), newPassword: z.string().min(8).max(200) })
const profilePhotoUpload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } })

app.get('/profile', async (req, res) => {
  const auth = await getAuthenticatedUser(req)
  if (!auth) return res.status(401).json({ message: 'Authentication required.' })
  const user = await prisma.user.findUnique({ where: { id: auth.id }, include: { subscription: true } })
  if (!user) return res.status(404).json({ message: 'User not found.' })
  const userDto=safeUser(user); if(userDto.profileImageUrl && !/^https?:/i.test(userDto.profileImageUrl)) userDto.profileImageUrl=absoluteAssetUrl(req,userDto.profileImageUrl)
  res.json({ user: userDto, subscription: user.subscription ? { planName:user.subscription.planName, status:user.subscription.status, monthlyPrice:Number(user.subscription.monthlyPrice), currentPeriodEnd:user.subscription.currentPeriodEnd, cancelAtPeriodEnd:user.subscription.cancelAtPeriodEnd } : null })
})

app.patch('/profile', async (req, res) => {
  const auth = await getAuthenticatedUser(req); if (!auth) return res.status(401).json({ message:'Authentication required.' })
  const parsed=profileSchema.safeParse(req.body); if(!parsed.success) return res.status(400).json({message:'Please enter a valid name and phone number.'})
  const user=await prisma.user.update({where:{id:auth.id},data:{fullName:parsed.data.fullName,phone:parsed.data.phone||null}})
  res.json({user:safeUser(user)})
})

app.patch('/profile/password', async (req,res)=>{
  const auth=await getAuthenticatedUser(req); if(!auth)return res.status(401).json({message:'Authentication required.'})
  const parsed=profilePasswordSchema.safeParse(req.body); if(!parsed.success)return res.status(400).json({message:'Please enter a valid new password.'})
  const policy=passwordPolicyError(parsed.data.newPassword); if(policy)return res.status(400).json({message:policy})
  const user=await prisma.user.findUnique({where:{id:auth.id}}); if(!user)return res.status(404).json({message:'User not found.'})
  if(user.passwordHash){ if(!parsed.data.currentPassword || !(await verifyPassword(parsed.data.currentPassword,user.passwordHash))) return res.status(400).json({message:'Current password is incorrect.'}) }
  await prisma.user.update({where:{id:user.id},data:{passwordHash:await hashPassword(parsed.data.newPassword)}}); res.json({ok:true})
})

app.post('/profile/photo', profilePhotoUpload.single('photo'), async (req,res)=>{
  const auth=await getAuthenticatedUser(req); if(!auth)return res.status(401).json({message:'Authentication required.'})
  if(!req.file)return res.status(400).json({message:'Choose a profile photo.'})
  const allowed:{[key:string]:string}={'image/jpeg':'.jpg','image/png':'.png','image/webp':'.webp'}; const ext=allowed[req.file.mimetype]
  if(!ext)return res.status(400).json({message:'Use a JPG, PNG, or WebP image.'})
  const dir=path.join(storageRoot,'profiles'); await fs.mkdir(dir,{recursive:true}); const filename=`${auth.id}-${Date.now()}${ext}`; await fs.writeFile(path.join(dir,filename),req.file.buffer)
  const relative=`profiles/${filename}`; const user=await prisma.user.update({where:{id:auth.id},data:{profileImageUrl:relative}}); const dto=safeUser(user); dto.profileImageUrl=absoluteAssetUrl(req,relative); res.json({user:dto})
})

app.delete('/profile/photo', async(req,res)=>{ const auth=await getAuthenticatedUser(req); if(!auth)return res.status(401).json({message:'Authentication required.'}); const user=await prisma.user.update({where:{id:auth.id},data:{profileImageUrl:null}}); res.json({user:safeUser(user)}) })

// Everything below /admin requires a current ACTIVE administrator session.

async function hasActiveSubscription(userId: string) {
  const subscription = await prisma.subscription.findUnique({ where: { userId } })
  return Boolean(subscription?.status === 'ACTIVE' && (!subscription.currentPeriodEnd || subscription.currentPeriodEnd > new Date()))
}

app.get('/library', async (req, res) => {
  const auth = await getAuthenticatedUser(req)
  if (!auth) return res.status(401).json({ message: 'Authentication required.' })
  if (!(await hasActiveSubscription(auth.id))) return res.status(403).json({ message: 'An active subscription is required to access your Library.' })
  const saved = await prisma.savedCard.findMany({
    where: { userId: auth.id },
    orderBy: { createdAt: 'desc' },
    include: { card: { select: publicCardSelect } },
  })
  res.json(saved.map(item => ({ id: item.id, savedAt: item.createdAt, usedAt: item.usedAt, card: cardDto(req, item.card) })))
})

app.post('/library/:cardId', async (req, res) => {
  const auth = await getAuthenticatedUser(req)
  if (!auth) return res.status(401).json({ message: 'Authentication required.' })
  if (!(await hasActiveSubscription(auth.id))) return res.status(403).json({ message: 'An active subscription is required to save cards.' })
  const card = await prisma.card.findFirst({ where: { id: req.params.cardId, isPublished: true } })
  if (!card) return res.status(404).json({ message: 'Card not found.' })
  const saved = await prisma.savedCard.upsert({
    where: { userId_cardId: { userId: auth.id, cardId: card.id } },
    create: { userId: auth.id, cardId: card.id },
    update: {},
  })
  res.status(201).json(saved)
})

app.delete('/library/:cardId', async (req, res) => {
  const auth = await getAuthenticatedUser(req)
  if (!auth) return res.status(401).json({ message: 'Authentication required.' })
  await prisma.savedCard.deleteMany({ where: { userId: auth.id, cardId: req.params.cardId } })
  res.status(204).end()
})

app.patch('/library/:cardId/used', async (req, res) => {
  const auth = await getAuthenticatedUser(req)
  if (!auth) return res.status(401).json({ message: 'Authentication required.' })
  const parsed = z.object({ used: z.boolean() }).safeParse(req.body)
  if (!parsed.success) return res.status(400).json({ message: 'Invalid used value.' })
  try {
    const saved = await prisma.savedCard.update({
      where: { userId_cardId: { userId: auth.id, cardId: req.params.cardId } },
      data: { usedAt: parsed.data.used ? new Date() : null },
    })
    res.json(saved)
  } catch { res.status(404).json({ message: 'Saved card not found.' }) }
})



const communityCreateSchema = z.object({
  cardId: z.string().trim().min(1),
  title: z.string().trim().min(2).max(255),
  body: z.string().trim().min(10).max(10000),
  anonymous: z.boolean().optional().default(false),
})

app.get('/community', async (req, res) => {
  const search = String(req.query.search ?? '').trim()
  const collectionId = String(req.query.collectionId ?? '').trim()
  const where: any = { status: 'PUBLISHED' }
  if (collectionId) where.collectionId = collectionId
  if (search) where.OR = [
    { title: { contains: search } },
    { body: { contains: search } },
    { authorName: { contains: search } },
    { category: { contains: search } },
  ]
  const posts = await prisma.communityPost.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    take: 100,
    include: {
      card: { select: publicCardSelect },
      collection: { select: { id: true, name: true, slug: true, description: true } },
    },
  })
  res.json(posts.map(post => ({
    id: post.id,
    authorName: post.isAnonymous ? 'Anonymous' : post.authorName,
    anonymous: post.isAnonymous,
    title: post.title,
    body: post.body,
    category: post.category,
    collectionId: post.collectionId,
    collection: post.collection,
    card: post.card ? cardDto(req, post.card) : null,
    createdAt: post.createdAt,
  })))
})

app.post('/community', async (req, res) => {
  const auth = await getAuthenticatedUser(req)
  if (!auth) return res.status(401).json({ message: 'Authentication required.' })
  if (!(await hasActiveSubscription(auth.id))) return res.status(403).json({ message: 'An active subscription is required to share a story.' })
  const parsed = communityCreateSchema.safeParse(req.body)
  if (!parsed.success) return res.status(400).json({ message: 'Choose a saved card and enter your story title and details.' })

  const saved = await prisma.savedCard.findUnique({
    where: { userId_cardId: { userId: auth.id, cardId: parsed.data.cardId } },
    include: { card: { include: { collection: true } } },
  })
  if (!saved || !saved.card.isPublished) return res.status(400).json({ message: 'Select one of your saved cards before publishing your story.' })

  const post = await prisma.communityPost.create({
    data: {
      authorId: auth.id,
      authorName: auth.fullName,
      isAnonymous: parsed.data.anonymous,
      collectionId: saved.card.collectionId,
      cardId: saved.card.id,
      category: saved.card.collection.name,
      title: parsed.data.title,
      body: parsed.data.body,
      status: 'PUBLISHED',
    },
    include: {
      card: { select: publicCardSelect },
      collection: { select: { id: true, name: true, slug: true, description: true } },
    },
  })
  res.status(201).json({
    id: post.id,
    authorName: post.isAnonymous ? 'Anonymous' : post.authorName,
    anonymous: post.isAnonymous,
    title: post.title,
    body: post.body,
    category: post.category,
    collectionId: post.collectionId,
    collection: post.collection,
    card: post.card ? cardDto(req, post.card) : null,
    createdAt: post.createdAt,
  })
})

app.use('/admin', requireAdmin)


const taxonomySchema = z.object({
  name: z.string().trim().min(2).max(191),
  slug: z.string().trim().min(1).max(191).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  description: z.string().max(4000).optional().nullable().default(''),
  isActive: z.boolean().optional().default(true),
  sortOrder: z.coerce.number().int().min(0).max(9999).optional().default(0),
})

app.get('/admin/collections', async (_req,res)=>{
  const items=await prisma.collection.findMany({orderBy:[{sortOrder:'asc'},{name:'asc'}],include:{_count:{select:{cards:true}}}})
  res.json(items.map(i=>({...i,cardCount:i._count.cards,_count:undefined})))
})
app.post('/admin/collections', async(req,res)=>{const parsed=taxonomySchema.safeParse(req.body);if(!parsed.success)return res.status(400).json({message:'Please enter valid collection details.'});try{const item=await prisma.collection.create({data:{...parsed.data,description:parsed.data.description??''}});res.status(201).json({...item,cardCount:0})}catch(e){console.error(e);res.status(409).json({message:'Collection name or slug already exists.'})}})
app.put('/admin/collections/:id', async(req,res)=>{const parsed=taxonomySchema.safeParse(req.body);if(!parsed.success)return res.status(400).json({message:'Please enter valid collection details.'});try{const item=await prisma.collection.update({where:{id:req.params.id},data:{...parsed.data,description:parsed.data.description??''},include:{_count:{select:{cards:true}}}});res.json({...item,cardCount:item._count.cards,_count:undefined})}catch(e){console.error(e);res.status(409).json({message:'Could not update collection. Check name and slug.'})}})
app.delete('/admin/collections/:id', async(req,res)=>{const count=await prisma.card.count({where:{collectionId:req.params.id}});if(count)return res.status(409).json({message:`This collection is used by ${count} card${count===1?'':'s'}. Reassign those cards before deleting it.`});try{await prisma.collection.delete({where:{id:req.params.id}});res.status(204).end()}catch{res.status(404).json({message:'Collection not found.'})}})

app.get('/admin/categories', async (_req,res)=>{
  const items=await prisma.category.findMany({orderBy:[{sortOrder:'asc'},{name:'asc'}],include:{_count:{select:{cards:true}}}})
  res.json(items.map(i=>({...i,cardCount:i._count.cards,_count:undefined})))
})
app.post('/admin/categories', async(req,res)=>{const parsed=taxonomySchema.safeParse(req.body);if(!parsed.success)return res.status(400).json({message:'Please enter valid category details.'});try{const item=await prisma.category.create({data:parsed.data});res.status(201).json({...item,cardCount:0})}catch(e){console.error(e);res.status(409).json({message:'Category name or slug already exists.'})}})
app.put('/admin/categories/:id', async(req,res)=>{const parsed=taxonomySchema.safeParse(req.body);if(!parsed.success)return res.status(400).json({message:'Please enter valid category details.'});try{const item=await prisma.category.update({where:{id:req.params.id},data:parsed.data,include:{_count:{select:{cards:true}}}});res.json({...item,cardCount:item._count.cards,_count:undefined})}catch(e){console.error(e);res.status(409).json({message:'Could not update category. Check name and slug.'})}})
app.delete('/admin/categories/:id', async(req,res)=>{const count=await prisma.card.count({where:{categoryId:req.params.id}});if(count)return res.status(409).json({message:`This category is used by ${count} card${count===1?'':'s'}. Reassign those cards before deleting it.`});try{await prisma.category.delete({where:{id:req.params.id}});res.status(204).end()}catch{res.status(404).json({message:'Category not found.'})}})

function titleFromPdfFilename(filename: string) {
  return path.basename(filename, path.extname(filename))
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/\b\w/g, c => c.toUpperCase())
    .slice(0, 140) || 'Untitled Card'
}

async function generatePdfPreview(pdfBuffer: Buffer, outputPath: string) {
  // pdfjs-dist renders the first PDF page; @napi-rs/canvas provides a native canvas
  // without requiring Chromium or ImageMagick on Railway.
  const canvasModule = await import('@napi-rs/canvas')
  const pdfjs = await import('pdfjs-dist/legacy/build/pdf.mjs')
  const globals = globalThis as any
  globals.DOMMatrix ??= canvasModule.DOMMatrix
  globals.ImageData ??= canvasModule.ImageData
  globals.Path2D ??= canvasModule.Path2D

  const loadingTask = pdfjs.getDocument({ data: new Uint8Array(pdfBuffer), disableWorker: true })
  let pdf: any = null
  let page: any = null
  try {
    pdf = await loadingTask.promise
    page = await pdf.getPage(1)
    const natural = page.getViewport({ scale: 1 })
    const maxWidth = 1200
    const maxHeight = 1600
    const scale = Math.min(maxWidth / natural.width, maxHeight / natural.height, 2)
    const viewport = page.getViewport({ scale })
    const canvas = canvasModule.createCanvas(Math.max(1, Math.ceil(viewport.width)), Math.max(1, Math.ceil(viewport.height)))
    const context = canvas.getContext('2d')
    context.fillStyle = '#ffffff'
    context.fillRect(0, 0, canvas.width, canvas.height)
    await page.render({ canvasContext: context as any, viewport }).promise

    // Build a protected public teaser from the rendered first page.
    // The upper portion remains clear while blur fades in around the midpoint
    // and becomes fully opaque toward the bottom. master.pdf is never modified.
    const blurredCanvas = canvasModule.createCanvas(canvas.width, canvas.height)
    const blurredContext = blurredCanvas.getContext('2d')
    blurredContext.save()
    blurredContext.filter = 'blur(22px)'
    // Slight overscan prevents transparent/white blur edges around the card.
    const overscan = 30
    blurredContext.drawImage(canvas, -overscan, -overscan, canvas.width + overscan * 2, canvas.height + overscan * 2)
    blurredContext.restore()

    // Keep only the lower part of the blurred copy with a smooth alpha ramp.
    blurredContext.globalCompositeOperation = 'destination-in'
    const blurMask = blurredContext.createLinearGradient(0, canvas.height * 0.42, 0, canvas.height * 0.72)
    blurMask.addColorStop(0, 'rgba(0,0,0,0)')
    blurMask.addColorStop(0.35, 'rgba(0,0,0,0.38)')
    blurMask.addColorStop(0.7, 'rgba(0,0,0,0.82)')
    blurMask.addColorStop(1, 'rgba(0,0,0,1)')
    blurredContext.fillStyle = blurMask
    blurredContext.fillRect(0, canvas.height * 0.42, canvas.width, canvas.height * 0.58)
    blurredContext.globalCompositeOperation = 'source-over'

    context.drawImage(blurredCanvas, 0, 0)

    // JPEG keeps previews lightweight and is universally supported by browsers.
    const jpeg = await canvas.encode('jpeg', 82)
    await fs.writeFile(outputPath, jpeg)
  } finally {
    // Cleanup must never turn a successfully-rendered preview into a failed import.
    // pdfjs-dist exposes cleanup/destroy differently across builds, so guard every call.
    try {
      if (page && typeof page.cleanup === 'function') page.cleanup()
    } catch (cleanupError) {
      console.warn('PDF page cleanup warning:', cleanupError)
    }
    try {
      if (pdf && typeof pdf.cleanup === 'function') await pdf.cleanup()
    } catch (cleanupError) {
      console.warn('PDF document cleanup warning:', cleanupError)
    }
    try {
      if (pdf && typeof pdf.destroy === 'function') await pdf.destroy()
      else if (loadingTask && typeof (loadingTask as any).destroy === 'function') await (loadingTask as any).destroy()
    } catch (cleanupError) {
      console.warn('PDF loading-task cleanup warning:', cleanupError)
    }
  }
}

async function processBulkPdfImport(jobId: string) {
  const job = await prisma.cardImportJob.findUnique({ where: { id: jobId } })
  if (!job) return
  try {
    await prisma.cardImportJob.update({ where: { id: jobId }, data: { status: 'PROCESSING', errorMessage: null } })
    const zipAbsolute = path.join(storageRoot, job.zipPath)
    const archive = await unzipper.Open.file(zipAbsolute)
    const pdfEntries = archive.files.filter(entry => entry.type === 'File' && entry.path.toLowerCase().endsWith('.pdf') && !entry.path.includes('__MACOSX'))
    if (!pdfEntries.length) throw new Error('No PDF files were found in this ZIP.')
    if (pdfEntries.length > 2000) throw new Error('A ZIP can contain at most 2,000 PDF files.')
    await prisma.cardImportJob.update({ where: { id: jobId }, data: { totalFiles: pdfEntries.length } })

    for (const entry of pdfEntries) {
      const originalFilename = path.basename(entry.path)
      const title = titleFromPdfFilename(originalFilename)
      const item = await prisma.cardImportItem.create({ data: { jobId, originalFilename, title, status: 'PROCESSING' } })
      try {
        const buffer = await entry.buffer()
        if (buffer.length > 40 * 1024 * 1024) throw new Error('PDF exceeds the 40 MB per-file limit.')
        const pdfDoc = await PDFDocument.load(buffer)
        const pages = pdfDoc.getPages()
        if (!pages.length) throw new Error('PDF contains no pages.')
        const { width, height } = pages[0].getSize()
        const widthInches = width / 72
        const heightInches = height / 72
        const id = randomUUID()
        const folderRelative = path.join('cards', id)
        const folderAbsolute = path.join(cardsRoot, id)
        await fs.mkdir(folderAbsolute, { recursive: true })
        const pdfRelative = path.join(folderRelative, 'master.pdf')
        const previewRelative = path.join(folderRelative, 'preview.jpg')
        await fs.writeFile(path.join(folderAbsolute, 'master.pdf'), buffer)
        await generatePdfPreview(buffer, path.join(folderAbsolute, 'preview.jpg'))
        const slugBase = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'love-note'
        await prisma.card.create({ data: {
          id, slug: `${slugBase}-${id.slice(0,8)}`, collectionId: job.collectionId, categoryId: null,
          title, description: '', pdfPath: pdfRelative, previewPath: previewRelative, originalFileName: originalFilename,
          widthInches, heightInches, orientation: width >= height ? 'landscape' : 'portrait', sideCount: 1,
          pageCount: pages.length, isPublished: job.publishOnImport,
        }})
        await prisma.cardImportItem.update({ where: { id: item.id }, data: { cardId: id, pdfPath: pdfRelative, previewPath: previewRelative, pageCount: pages.length, status: 'READY' } })
        await prisma.cardImportJob.update({ where: { id: jobId }, data: { processedFiles: { increment: 1 }, successCount: { increment: 1 } } })
      } catch (error) {
        await prisma.cardImportItem.update({ where: { id: item.id }, data: { status: 'FAILED', errorMessage: error instanceof Error ? error.message : 'Unknown PDF error' } })
        await prisma.cardImportJob.update({ where: { id: jobId }, data: { processedFiles: { increment: 1 }, failedCount: { increment: 1 } } })
      }
    }
    await prisma.cardImportJob.update({ where: { id: jobId }, data: { status: 'COMPLETE' } })
    await fs.unlink(zipAbsolute).catch(() => undefined)
  } catch (error) {
    console.error('Bulk PDF import failed', error)
    await prisma.cardImportJob.update({ where: { id: jobId }, data: { status: 'FAILED', errorMessage: error instanceof Error ? error.message : 'Import failed.' } }).catch(() => undefined)
  }
}

app.post('/admin/cards/bulk-import', bulkZipUpload.single('zip'), async (req, res) => {
  try {
    const collectionId = String(req.body.collectionId || '').trim()
    if (!collectionId) return res.status(400).json({ message: 'Choose a collection.' })
    if (!req.file) return res.status(400).json({ message: 'Choose a ZIP containing PDF cards.' })
    const collection = await prisma.collection.findUnique({ where: { id: collectionId } })
    if (!collection || !collection.isActive) { await fs.unlink(req.file.path).catch(() => undefined); return res.status(400).json({ message: 'Invalid collection.' }) }
    const relativeZip = path.relative(storageRoot, req.file.path)
    const job = await prisma.cardImportJob.create({ data: {
      collectionId, originalZipName: req.file.originalname, zipPath: relativeZip,
      publishOnImport: String(req.body.publish || 'false') === 'true', status: 'QUEUED',
    }})
    res.status(202).json({ id: job.id, status: job.status })
    setImmediate(() => void processBulkPdfImport(job.id))
  } catch (error) {
    console.error(error)
    if (req.file) await fs.unlink(req.file.path).catch(() => undefined)
    res.status(500).json({ message: 'Could not start bulk PDF import.' })
  }
})

app.get('/admin/cards/bulk-import/:jobId', async (req, res) => {
  const { page, pageSize, skip } = paginationFromQuery(req, 10)
  const job = await prisma.cardImportJob.findUnique({ where: { id: req.params.jobId } })
  if (!job) return res.status(404).json({ message: 'Import job not found.' })
  const [items,total] = await Promise.all([
    prisma.cardImportItem.findMany({ where:{jobId:job.id}, orderBy:{createdAt:'asc'}, skip, take:pageSize }),
    prisma.cardImportItem.count({ where:{jobId:job.id} }),
  ])
  res.json({ ...job, items, pagination: paginationMeta(page,pageSize,total) })
})

app.get('/admin/cards', async (req, res) => {
  // Backward compatibility: older admin bundles expect this endpoint to return
  // a plain array and call Array.filter() on it. Newer bundles pass page/pageSize
  // and expect the paginated object shape below. This avoids a deploy-order/cache
  // mismatch causing `filter is not a function`.
  const wantsPagination = req.query.page !== undefined || req.query.pageSize !== undefined || req.query.search !== undefined || req.query.status !== undefined || req.query.collectionId !== undefined || req.query.featured !== undefined
  if (!wantsPagination) {
    const cards = await prisma.card.findMany({ orderBy: { createdAt: 'desc' }, select: publicCardSelect })
    return res.json(cards.map(card => cardDto(req, card)))
  }

  const { page, pageSize, skip } = paginationFromQuery(req)
  const search = String(req.query.search ?? '').trim()
  const status = String(req.query.status ?? '').trim()
  const collectionId = String(req.query.collectionId ?? '').trim()
  const featuredFilter = String(req.query.featured ?? '').trim()
  const where: any = {}
  if (search) where.OR = [{ title: { contains: search } }, { description: { contains: search } }]
  if (status === 'published') where.isPublished = true
  if (status === 'draft') where.isPublished = false
  if (collectionId) where.collectionId = collectionId
  if (featuredFilter === 'true') where.isFeatured = true
  const [cards, filteredTotal, total, drafts, published, featured] = await Promise.all([
    prisma.card.findMany({ where, orderBy: { createdAt: 'desc' }, skip, take: pageSize, select: publicCardSelect }),
    prisma.card.count({ where }),
    prisma.card.count(),
    prisma.card.count({ where: { isPublished: false } }),
    prisma.card.count({ where: { isPublished: true } }),
    prisma.card.count({ where: { isFeatured: true } }),
  ])
  return res.json({
    summary: { total, drafts, published, featured },
    cards: cards.map(card => cardDto(req, card)),
    pagination: paginationMeta(page, pageSize, filteredTotal),
  })
})

app.get('/admin/cards/:cardId', async (req, res) => {
  const card = await prisma.card.findUnique({ where: { id: req.params.cardId }, select: publicCardSelect })
  if (!card) return res.status(404).json({ message: 'Card not found' })
  res.json(cardDto(req, card))
})

const cardFieldsSchema = z.object({
  collectionId: z.string().min(1),
  categoryId: z.string().optional().default(''),
  title: z.string().min(2).max(140),
  description: z.string().max(1000).optional().default(''),
  published: z.enum(['true', 'false']).optional().default('false'),
})

app.post('/admin/cards', upload.fields([
  { name: 'pdf', maxCount: 1 },
  { name: 'preview', maxCount: 1 },
]), async (req, res) => {
  try {
    const fields = cardFieldsSchema.parse(req.body)
    const files = req.files as { [fieldname: string]: Express.Multer.File[] } | undefined
    const pdf = files?.pdf?.[0]
    const preview = files?.preview?.[0]

    if (!pdf || pdf.mimetype !== 'application/pdf') {
      return res.status(400).json({ message: 'A PDF master file is required.' })
    }
    if (preview && !['image/png', 'image/jpeg', 'image/webp'].includes(preview.mimetype)) {
      return res.status(400).json({ message: 'Preview must be PNG, JPEG, or WebP.' })
    }

    const collection = await prisma.collection.findUnique({ where: { id: fields.collectionId } })
    if (!collection) return res.status(400).json({ message: 'Invalid collection.' })

    const pdfDoc = await PDFDocument.load(pdf.buffer)
    const pages = pdfDoc.getPages()
    if (pages.length !== 1) {
      return res.status(400).json({ message: 'Card PDFs must contain exactly one page.' })
    }

    const { width, height } = pages[0].getSize()
    const widthInches = width / 72
    const heightInches = height / 72
    const tolerance = 0.08
    const validSize = Math.abs(widthInches - 7) <= tolerance && Math.abs(heightInches - 5) <= tolerance
    if (!validSize) {
      return res.status(400).json({
        message: `PDF must be 7 × 5 inches landscape. Received ${widthInches.toFixed(2)} × ${heightInches.toFixed(2)} inches.`,
      })
    }

    const id = randomUUID()
    const folderRelative = path.join('cards', id)
    const folderAbsolute = path.join(cardsRoot, id)
    await fs.mkdir(folderAbsolute, { recursive: true })

    const pdfRelative = path.join(folderRelative, 'master.pdf')
    await fs.writeFile(path.join(folderAbsolute, 'master.pdf'), pdf.buffer)

    let previewRelative: string | null = null
    if (preview) {
      const ext = preview.mimetype === 'image/png' ? '.png' : preview.mimetype === 'image/webp' ? '.webp' : '.jpg'
      previewRelative = path.join(folderRelative, `preview${ext}`)
      await fs.writeFile(path.join(folderAbsolute, `preview${ext}`), preview.buffer)
    }

    const slugBase = fields.title.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'love-note'
    const slug = `${slugBase}-${id.slice(0, 8)}`

    const card = await prisma.card.create({
      data: {
        id,
        slug,
        collectionId: fields.collectionId,
        categoryId: fields.categoryId || null,
        title: fields.title,
        description: fields.description,
        pdfPath: pdfRelative,
        previewPath: previewRelative,
        originalFileName: pdf.originalname,
        widthInches,
        heightInches,
        orientation: 'landscape',
        sideCount: 1,
        pageCount: 1,
        isPublished: fields.published === 'true',
      },
      select: publicCardSelect,
    })

    res.status(201).json(cardDto(req, card))
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: 'Invalid card data.', issues: error.issues })
    }
    console.error(error)
    res.status(500).json({ message: 'Could not save card.' })
  }
})


const designedCardSchema = z.object({
  collectionId: z.string().min(1),
  categoryId: z.string().optional().default(''),
  title: z.string().min(2).max(140),
  description: z.string().max(1000).optional().default(''),
  poemText: z.string().min(1).max(12000),
  adminNotes: z.string().max(5000).optional().default(''),
  published: z.enum(['true','false']).optional().default('false'),
  featured: z.enum(['true','false']).optional().default('false'),
  templateKey: z.string().max(80).optional().default('botanical-cream'),
  frontLayout: z.string().optional(),
  backLayout: z.string().optional(),
})

app.post('/admin/cards/design', upload.none(), async (req, res) => {
  try {
    const fields = designedCardSchema.parse(req.body)
    const collection = await prisma.collection.findUnique({ where: { id: fields.collectionId } })
    if (!collection) return res.status(400).json({ message: 'Invalid collection.' })
    const id = randomUUID()
    const slugBase = fields.title.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'love-note'
    const parseJson = (v?:string) => { if(!v) return undefined; try { return JSON.parse(v) } catch { return undefined } }
    const card = await prisma.card.create({
      data: {
        id,
        slug: `${slugBase}-${id.slice(0,8)}`,
        collectionId: fields.collectionId,
        categoryId: fields.categoryId || null,
        title: fields.title,
        description: fields.description,
        poemText: fields.poemText,
        adminNotes: fields.adminNotes,
        isPublished: fields.published === 'true',
        isFeatured: fields.featured === 'true',
        templateKey: fields.templateKey,
        frontLayout: parseJson(fields.frontLayout),
        backLayout: parseJson(fields.backLayout),
        widthInches: 7,
        heightInches: 5,
        orientation: 'landscape',
        sideCount: 1,
        pageCount: 1,
      },
      select: publicCardSelect,
    })
    res.status(201).json(cardDto(req, card))
  } catch (error) {
    if (error instanceof z.ZodError) return res.status(400).json({ message:'Invalid card data.', issues:error.issues })
    console.error(error)
    res.status(500).json({ message:'Could not save designed card.' })
  }
})

app.put('/admin/cards/:cardId/design', upload.none(), async (req, res) => {
  try {
    const fields = designedCardSchema.parse(req.body)
    const [collection, existing] = await Promise.all([
      prisma.collection.findUnique({ where: { id: fields.collectionId } }),
      prisma.card.findUnique({ where: { id: req.params.cardId } }),
    ])
    if (!collection) return res.status(400).json({ message: 'Invalid collection.' })
    if (!existing) return res.status(404).json({ message: 'Card not found' })
    const parseJson = (v?: string) => { if (!v) return undefined; try { return JSON.parse(v) } catch { return undefined } }
    const frontLayout = parseJson(fields.frontLayout)
    const backLayout = parseJson(fields.backLayout)
    const card = await prisma.card.update({
      where: { id: req.params.cardId },
      data: {
        collectionId: fields.collectionId,
        categoryId: fields.categoryId || null,
        title: fields.title,
        description: fields.description,
        poemText: fields.poemText,
        adminNotes: fields.adminNotes,
        isPublished: fields.published === 'true',
        isFeatured: fields.featured === 'true',
        templateKey: fields.templateKey,
        ...(frontLayout !== undefined ? { frontLayout } : {}),
        ...(backLayout !== undefined ? { backLayout } : {}),
      },
      select: publicCardSelect,
    })
    res.json(cardDto(req, card))
  } catch (error) {
    if (error instanceof z.ZodError) return res.status(400).json({ message: 'Invalid card data.', issues: error.issues })
    console.error(error)
    res.status(500).json({ message: 'Could not update designed card.' })
  }
})

app.patch('/admin/cards/:cardId/publish', async (req, res) => {
  const body = z.object({ published: z.boolean() }).safeParse(req.body)
  if (!body.success) return res.status(400).json({ message: 'published must be boolean' })
  try {
    const card = await prisma.card.update({
      where: { id: req.params.cardId },
      data: { isPublished: body.data.published },
      select: publicCardSelect,
    })
    res.json(cardDto(req, card))
  } catch {
    res.status(404).json({ message: 'Card not found' })
  }
})

app.delete('/admin/cards/:cardId', async (req, res) => {
  try {
    const card = await prisma.card.delete({ where: { id: req.params.cardId } })
    const folder = path.join(cardsRoot, card.id)
    if (existsSync(folder)) await fs.rm(folder, { recursive: true, force: true })
    res.status(204).end()
  } catch {
    res.status(404).json({ message: 'Card not found' })
  }
})



const userStatusSchema = z.object({ status: z.enum(['ACTIVE', 'BLOCKED']) })

app.get('/admin/overview', async (_req, res) => {
  const startOfMonth = new Date()
  startOfMonth.setDate(1)
  startOfMonth.setHours(0, 0, 0, 0)
  const [totalUsers, activeSubscribers, revenue, pendingRequests, ordersInProgress, recentRequests, recentOrders] = await Promise.all([
    prisma.user.count(),
    prisma.subscription.count({ where: { status: 'ACTIVE' } }),
    prisma.paymentTransaction.aggregate({
      where: { status: 'SUCCESS', occurredAt: { gte: startOfMonth } },
      _sum: { amount: true },
    }),
    prisma.poetryRequest.count({ where: { status: 'PENDING' } }),
    prisma.cardOrder.count({ where: { status: { in: ['PLACED', 'QUOTED', 'IN_PROGRESS', 'SHIPPED'] } } }),
    prisma.poetryRequest.findMany({ orderBy: { createdAt: 'desc' }, take: 5 }),
    prisma.cardOrder.findMany({ orderBy: { placedAt: 'desc' }, take: 5 }),
  ])
  res.json({
    totalUsers,
    activeSubscribers,
    revenueThisMonth: Number(revenue._sum.amount ?? 0),
    pendingRequests,
    ordersInProgress,
    recentRequests: recentRequests.map(r => ({ id:r.id, requesterName:r.requesterName, category:r.category, status:r.status, createdAt:r.createdAt })),
    recentOrders: recentOrders.map(o => ({ id:o.id, orderNumber:o.orderNumber, customerName:o.customerName, quantity:o.quantity, status:o.status, shippingFee:o.shippingFee == null ? null : Number(o.shippingFee), totalAmount:o.totalAmount == null ? null : Number(o.totalAmount), placedAt:o.placedAt })),
  })
})

app.get('/admin/users', async (req, res) => {
  const search = String(req.query.search ?? '').trim()
  const role = String(req.query.role ?? '').trim()
  const status = String(req.query.status ?? '').trim()
  const subscription = String(req.query.subscription ?? '').trim()
  const { page, pageSize, skip } = paginationFromQuery(req)
  const where: any = {
    ...(search ? { OR: [{ fullName: { contains: search } }, { email: { contains: search } }] } : {}),
    ...(role ? { role } : {}),
    ...(status ? { status } : {}),
    ...(subscription ? { subscription: subscription === 'NONE' ? { is: null } : { is: { status: subscription } } } : {}),
  }
  const [users, filteredTotal, totalUsers, activeSubscribers, blockedUsers] = await Promise.all([
    prisma.user.findMany({ where, orderBy: { joinedAt: 'desc' }, skip, take: pageSize, include: { subscription: true } }),
    prisma.user.count({ where }),
    prisma.user.count(),
    prisma.subscription.count({ where: { status: 'ACTIVE' } }),
    prisma.user.count({ where: { status: 'BLOCKED' } }),
  ])
  res.json({
    summary: { totalUsers, activeSubscribers, freeUsers: Math.max(totalUsers - activeSubscribers, 0), blockedUsers },
    pagination: paginationMeta(page, pageSize, filteredTotal),
    users: users.map(user => ({
      id: user.id, fullName: user.fullName, email: user.email, phone: user.phone, role: user.role,
      status: user.status, joinedAt: user.joinedAt, subscriptionStatus: user.subscription?.status ?? 'NONE',
      paymentStatus: user.subscription?.paymentStatus ?? 'NONE',
    })),
  })
})

app.patch('/admin/users/:userId/status', async (req, res) => {
  const parsed = userStatusSchema.safeParse(req.body)
  if (!parsed.success) return res.status(400).json({ message: 'status must be ACTIVE or BLOCKED' })
  try {
    const user = await prisma.user.update({
      where: { id: req.params.userId },
      data: { status: parsed.data.status },
      include: { subscription: true },
    })
    res.json({
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      role: user.role,
      status: user.status,
      joinedAt: user.joinedAt,
      subscriptionStatus: user.subscription?.status ?? 'NONE',
      paymentStatus: user.subscription?.paymentStatus ?? 'NONE',
    })
  } catch {
    res.status(404).json({ message: 'User not found' })
  }
})

app.get('/admin/subscriptions', async (req, res) => {
  const search = String(req.query.search ?? '').trim()
  const status = String(req.query.status ?? '').trim()
  const { page, pageSize, skip } = paginationFromQuery(req)
  const transactionPage = Math.max(1, Number.parseInt(String(req.query.transactionPage ?? '1'), 10) || 1)
  const transactionPageSize = Math.min(100, Math.max(5, Number.parseInt(String(req.query.transactionPageSize ?? '10'), 10) || 10))
  const transactionSkip = (transactionPage - 1) * transactionPageSize
  const where: any = {
    ...(status ? { status } : {}),
    ...(search ? { user: { OR: [{ fullName: { contains: search } }, { email: { contains: search } }] } } : {}),
  }
  const startOfMonth = new Date(); startOfMonth.setDate(1); startOfMonth.setHours(0,0,0,0)
  const [subscriptions, filteredTotal, totalSubscribers, activeSubscriptions, successfulThisMonth, transactions, transactionTotal, failedPayments] = await Promise.all([
    prisma.subscription.findMany({
      where, orderBy: { updatedAt: 'desc' }, skip, take: pageSize,
      include: { user: { include: { payments: { orderBy: { occurredAt: 'desc' }, take: 1 } } } },
    }),
    prisma.subscription.count({ where }),
    prisma.subscription.count(),
    prisma.subscription.count({ where: { status: 'ACTIVE' } }),
    prisma.paymentTransaction.aggregate({ where: { status: 'SUCCESS', occurredAt: { gte: startOfMonth } }, _sum: { amount: true } }),
    prisma.paymentTransaction.findMany({ orderBy: { occurredAt: 'desc' }, skip: transactionSkip, take: transactionPageSize, include: { user: true } }),
    prisma.paymentTransaction.count(),
    prisma.paymentTransaction.findMany({ where: { status: 'FAILED' }, orderBy: { occurredAt: 'desc' }, take: 10, include: { user: true } }),
  ])
  const monthlyPrice = subscriptions[0]?.monthlyPrice ?? 8.99
  res.json({
    summary: { totalSubscribers, monthlyRevenue: Number(successfulThisMonth._sum.amount ?? 0), activeSubscriptions, monthlyPrice: Number(monthlyPrice) },
    pagination: paginationMeta(page, pageSize, filteredTotal),
    transactionPagination: paginationMeta(transactionPage, transactionPageSize, transactionTotal),
    subscribers: subscriptions.map(sub => {
      const latest = sub.user.payments[0]
      const detailId = latest?.providerTransactionId || sub.stripeSubscriptionId || sub.stripeCustomerId
      return {
        id: sub.id, userId: sub.userId, fullName: sub.user.fullName, email: sub.user.email, planName: sub.planName,
        status: sub.status, paymentStatus: sub.paymentStatus, monthlyPrice: Number(sub.monthlyPrice), startedAt: sub.startedAt,
        currentPeriodEnd: sub.currentPeriodEnd, createdAt: sub.createdAt, stripeDashboardUrl: stripeDashboardUrl(detailId),
      }
    }),
    transactions: transactions.map(tx => ({
      id: tx.id, providerTransactionId: tx.providerTransactionId ?? tx.id, fullName: tx.user.fullName, date: tx.occurredAt,
      amount: Number(tx.amount), status: tx.status, description: tx.description,
      stripeDashboardUrl: stripeDashboardUrl(tx.providerTransactionId ?? tx.id),
    })),
    failedPayments: failedPayments.map(tx => ({ id: tx.id, fullName: tx.user.fullName, email: tx.user.email, date: tx.occurredAt, amount: Number(tx.amount), status: tx.status })),
  })
})

app.get('/admin/users/:userId', async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.params.userId },
    include: {
      subscription: true,
      payments: { orderBy: { occurredAt: 'desc' }, take: 50 },
    },
  })
  if (!user) return res.status(404).json({ message: 'User not found' })
  res.json({
    id: user.id,
    fullName: user.fullName,
    email: user.email,
    phone: user.phone,
    role: user.role,
    status: user.status,
    joinedAt: user.joinedAt,
    updatedAt: user.updatedAt,
    subscription: user.subscription ? {
      id: user.subscription.id,
      planName: user.subscription.planName,
      status: user.subscription.status,
      paymentStatus: user.subscription.paymentStatus,
      monthlyPrice: Number(user.subscription.monthlyPrice),
      startedAt: user.subscription.startedAt,
      currentPeriodEnd: user.subscription.currentPeriodEnd,
      cancelledAt: user.subscription.cancelledAt,
      cancelAtPeriodEnd: user.subscription.cancelAtPeriodEnd,
      hasAccess: user.subscription.status === 'ACTIVE',
    } : null,
    payments: user.payments.map(tx => ({
      id: tx.id,
      providerTransactionId: tx.providerTransactionId ?? tx.id,
      description: tx.description,
      amount: Number(tx.amount),
      currency: tx.currency,
      status: tx.status,
      occurredAt: tx.occurredAt,
    })),
  })
})

const challengeSchema = z.object({
  title: z.string().min(2).max(191),
  challengeMonth: z.string().min(7),
  overview: z.string().min(1).max(10000),
  goal: z.string().min(1).max(10000),
  howToComplete: z.string().min(1).max(10000),
  relationshipBenefit: z.string().min(1).max(10000),
  status: z.enum(['DRAFT', 'PUBLISHED']).optional().default('DRAFT'),
  reminders: z.string().optional().default('[]'),
})

function challengeDto(req: express.Request, challenge: any) {
  return {
    id: challenge.id,
    title: challenge.title,
    challengeMonth: challenge.challengeMonth,
    overview: challenge.overview,
    goal: challenge.goal,
    howToComplete: challenge.howToComplete,
    relationshipBenefit: challenge.relationshipBenefit,
    imageUrl: absoluteAssetUrl(req, challenge.imagePath),
    status: challenge.status,
    publishedAt: challenge.publishedAt,
    reminders: challenge.reminders ?? [],
    createdAt: challenge.createdAt,
    updatedAt: challenge.updatedAt,
  }
}

app.get('/admin/challenges', async (req, res) => {
  const search = String(req.query.search ?? '').trim()
  const status = String(req.query.status ?? '').trim()
  const month = String(req.query.month ?? '').trim()
  const year = Number(req.query.year ?? 0)
  const { page, pageSize, skip } = paginationFromQuery(req)
  const where: any = {}
  if (search) where.title = { contains: search }
  if (status) where.status = status
  if (month || year) {
    const y = year || new Date().getFullYear(); const m = month ? Number(month) - 1 : 0
    const start = new Date(Date.UTC(y,m,1)); const end = month ? new Date(Date.UTC(y,m+1,1)) : new Date(Date.UTC(y+1,0,1))
    where.challengeMonth = { gte: start, lt: end }
  }
  const [challenges, filteredTotal, total, drafts, published] = await Promise.all([
    prisma.challenge.findMany({ where, orderBy: [{ challengeMonth: 'desc' }, { createdAt: 'desc' }], skip, take: pageSize, include: { reminders: { orderBy: { dayOfMonth: 'asc' } } } }),
    prisma.challenge.count({ where }), prisma.challenge.count(), prisma.challenge.count({ where: { status: 'DRAFT' } }), prisma.challenge.count({ where: { status: 'PUBLISHED' } }),
  ])
  res.json({ summary: { total, drafts, published }, challenges: challenges.map(c => challengeDto(req,c)), pagination: paginationMeta(page,pageSize,filteredTotal) })
})

app.get('/admin/challenges/:challengeId', async (req, res) => {
  const challenge = await prisma.challenge.findUnique({
    where: { id: req.params.challengeId },
    include: { reminders: { orderBy: { dayOfMonth: 'asc' } } },
  })
  if (!challenge) return res.status(404).json({ message: 'Challenge not found' })
  res.json(challengeDto(req, challenge))
})

app.post('/admin/challenges', upload.single('image'), async (req, res) => {
  try {
    const fields = challengeSchema.parse(req.body)
    const image = req.file
    if (image && !['image/png', 'image/jpeg', 'image/webp'].includes(image.mimetype)) {
      return res.status(400).json({ message: 'Challenge image must be PNG, JPEG, or WebP.' })
    }
    const reminderInput = z.array(z.object({
      dayOfMonth: z.number().int().min(1).max(31),
      timeOfDay: z.string().regex(/^\d{2}:\d{2}$/),
      channel: z.enum(['EMAIL', 'SMS']),
      isActive: z.boolean().optional().default(true),
      emailSubject: z.string().max(255).optional().default(''),
      emailMessage: z.string().max(10000).optional().default(''),
      smsMessage: z.string().max(2000).optional().default(''),
    })).parse(JSON.parse(fields.reminders || '[]'))

    const id = randomUUID()
    let imageRelative: string | null = null
    if (image) {
      const folderRelative = path.join('challenges', id)
      const folderAbsolute = path.join(challengesRoot, id)
      await fs.mkdir(folderAbsolute, { recursive: true })
      const ext = image.mimetype === 'image/png' ? '.png' : image.mimetype === 'image/webp' ? '.webp' : '.jpg'
      imageRelative = path.join(folderRelative, `artwork${ext}`)
      await fs.writeFile(path.join(folderAbsolute, `artwork${ext}`), image.buffer)
    }

    const challenge = await prisma.challenge.create({
      data: {
        id,
        title: fields.title,
        challengeMonth: new Date(`${fields.challengeMonth}-01T00:00:00.000Z`),
        overview: fields.overview,
        goal: fields.goal,
        howToComplete: fields.howToComplete,
        relationshipBenefit: fields.relationshipBenefit,
        imagePath: imageRelative,
        status: fields.status,
        publishedAt: fields.status === 'PUBLISHED' ? new Date() : null,
        reminders: { create: reminderInput },
      },
      include: { reminders: { orderBy: { dayOfMonth: 'asc' } } },
    })
    res.status(201).json(challengeDto(req, challenge))
  } catch (error) {
    if (error instanceof z.ZodError) return res.status(400).json({ message: 'Invalid challenge data.', issues: error.issues })
    if (error instanceof SyntaxError) return res.status(400).json({ message: 'Invalid reminder rules.' })
    console.error(error)
    res.status(500).json({ message: 'Could not create challenge.' })
  }
})

app.patch('/admin/challenges/:challengeId/status', async (req, res) => {
  const parsed = z.object({ status: z.enum(['DRAFT', 'PUBLISHED']) }).safeParse(req.body)
  if (!parsed.success) return res.status(400).json({ message: 'Invalid challenge status.' })
  try {
    const challenge = await prisma.challenge.update({
      where: { id: req.params.challengeId },
      data: {
        status: parsed.data.status,
        publishedAt: parsed.data.status === 'PUBLISHED' ? new Date() : null,
      },
      include: { reminders: { orderBy: { dayOfMonth: 'asc' } } },
    })
    res.json(challengeDto(req, challenge))
  } catch {
    res.status(404).json({ message: 'Challenge not found' })
  }
})

app.delete('/admin/challenges/:challengeId', async (req, res) => {
  try {
    const challenge = await prisma.challenge.delete({ where: { id: req.params.challengeId } })
    const folder = path.join(challengesRoot, challenge.id)
    if (existsSync(folder)) await fs.rm(folder, { recursive: true, force: true })
    res.status(204).end()
  } catch {
    res.status(404).json({ message: 'Challenge not found' })
  }
})


const requestStatusSchema = z.object({ status: z.enum(['PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED']) })
const orderStatusSchema = z.object({ status: z.enum(['PLACED', 'QUOTED', 'IN_PROGRESS', 'SHIPPED', 'DELIVERED', 'CANCELLED']) })

app.get('/admin/requests', async (req, res) => {
  const search = String(req.query.search ?? '').trim(), status = String(req.query.status ?? '').trim(), category = String(req.query.category ?? '').trim(), collection = String(req.query.collection ?? '').trim()
  const { page, pageSize, skip } = paginationFromQuery(req)
  const where:any = {}
  if(status) where.status=status; if(category) where.category=category; if(collection) where.collectionId=collection
  if(search) where.OR=[{requesterName:{contains:search}},{requesterEmail:{contains:search}},{occasion:{contains:search}},{prompt:{contains:search}}]
  const [requests,filteredTotal,total,pending,inProgress,completed,cancelled,categories,collections]=await Promise.all([
    prisma.poetryRequest.findMany({where,orderBy:{createdAt:'desc'},skip,take:pageSize}), prisma.poetryRequest.count({where}), prisma.poetryRequest.count(),
    prisma.poetryRequest.count({where:{status:'PENDING'}}), prisma.poetryRequest.count({where:{status:'IN_PROGRESS'}}), prisma.poetryRequest.count({where:{status:'COMPLETED'}}), prisma.poetryRequest.count({where:{status:'CANCELLED'}}),
    prisma.poetryRequest.findMany({distinct:['category'],select:{category:true},orderBy:{category:'asc'}}),
    prisma.collection.findMany({where:{isActive:true},select:{id:true,name:true,slug:true},orderBy:{sortOrder:'asc'}}),
  ])
  res.json({summary:{total,pending,inProgress,completed,cancelled},categories:categories.map(c=>c.category),collections,requests,pagination:paginationMeta(page,pageSize,filteredTotal)})
})

app.patch('/admin/requests/:requestId/status', async (req, res) => {
  const parsed = requestStatusSchema.safeParse(req.body)
  if (!parsed.success) return res.status(400).json({ message: 'Invalid request status.' })
  try {
    const request = await prisma.poetryRequest.update({
      where: { id: req.params.requestId },
      data: { status: parsed.data.status, completedAt: parsed.data.status === 'COMPLETED' ? new Date() : null },
    })
    res.json(request)
  } catch {
    res.status(404).json({ message: 'Request not found' })
  }
})

app.get('/admin/orders', async (req, res) => {
  const search=String(req.query.search??'').trim(), status=String(req.query.status??'').trim(), reviewedOnly=String(req.query.reviewedOnly??'')==='true'
  const { page, pageSize, skip } = paginationFromQuery(req)
  const where:any={}; if(status)where.status=status;if(reviewedOnly)where.reviewed=true
  if(search)where.OR=[{orderNumber:{contains:search}},{customerName:{contains:search}},{customerEmail:{contains:search}},{cardTitle:{contains:search}}]
  const [orders,filteredTotal,total,placed,quoted,inProgress,shipped,delivered,cancelled]=await Promise.all([
    prisma.cardOrder.findMany({where,orderBy:{placedAt:'desc'},skip,take:pageSize}), prisma.cardOrder.count({where}), prisma.cardOrder.count(),
    prisma.cardOrder.count({where:{status:'PLACED'}}), prisma.cardOrder.count({where:{status:'QUOTED'}}), prisma.cardOrder.count({where:{status:'IN_PROGRESS'}}),
    prisma.cardOrder.count({where:{status:'SHIPPED'}}), prisma.cardOrder.count({where:{status:'DELIVERED'}}), prisma.cardOrder.count({where:{status:'CANCELLED'}}),
  ])
  res.json({summary:{total,placed,quoted,inProgress,shipped,delivered,cancelled},orders:orders.map(orderDto),pagination:paginationMeta(page,pageSize,filteredTotal)})
})

app.get('/admin/orders/:orderId', async (req, res) => {
  const order = await prisma.cardOrder.findUnique({ where: { id: req.params.orderId } })
  if (!order) return res.status(404).json({ message: 'Order not found' })
  res.json(orderDto(order))
})

app.patch('/admin/orders/:orderId/status', async (req, res) => {
  const parsed = orderStatusSchema.safeParse(req.body)
  if (!parsed.success) return res.status(400).json({ message: 'Invalid order status.' })
  try {
    const status = parsed.data.status
    const order = await prisma.cardOrder.update({
      where: { id: req.params.orderId },
      data: { status, shippedAt: status === 'SHIPPED' ? new Date() : undefined, deliveredAt: status === 'DELIVERED' ? new Date() : undefined },
    })
    res.json(orderDto(order))
  } catch {
    res.status(404).json({ message: 'Order not found' })
  }
})


app.patch('/admin/orders/:orderId/quote', async (req, res) => {
  const parsed = z.object({ shippingFee: z.coerce.number().min(0).max(9999) }).safeParse(req.body)
  if (!parsed.success) return res.status(400).json({ message: 'Invalid shipping fee.' })
  const existing = await prisma.cardOrder.findUnique({ where: { id: req.params.orderId } })
  if (!existing) return res.status(404).json({ message: 'Order not found' })
  const beforeShipping = Number(existing.subtotal ?? 0) + Number(existing.printingFee ?? 0)
  const updated = await prisma.cardOrder.update({
    where: { id: existing.id },
    data: { shippingFee: parsed.data.shippingFee, totalAmount: Number((beforeShipping + parsed.data.shippingFee).toFixed(2)), status: existing.status === 'PLACED' ? 'QUOTED' : existing.status },
  })
  res.json(orderDto(updated))
})

app.patch('/admin/orders/:orderId/reviewed', async (req, res) => {
  const parsed = z.object({ reviewed: z.boolean() }).safeParse(req.body)
  if (!parsed.success) return res.status(400).json({ message: 'Invalid reviewed value.' })
  try {
    const order = await prisma.cardOrder.update({ where: { id: req.params.orderId }, data: { reviewed: parsed.data.reviewed } })
    res.json(orderDto(order))
  } catch {
    res.status(404).json({ message: 'Order not found' })
  }
})



// Phase 7 – Notifications, Community, and Settings
const notificationSchema = z.object({
  channel: z.enum(['EMAIL', 'SMS']),
  audience: z.enum(['SINGLE_USER', 'SUBSCRIBERS_ONLY', 'ALL_USERS']),
  selectedUserId: z.string().optional().nullable(),
  recipientEmail: z.string().email().optional().nullable(),
  subject: z.string().max(255).optional().nullable(),
  message: z.string().min(1).max(20000),
})

app.get('/admin/notifications', async (req, res) => {
  const search=String(req.query.search??'').trim(),status=String(req.query.status??'').trim(),audience=String(req.query.audience??'').trim()
  const { page, pageSize, skip } = paginationFromQuery(req)
  const where:any={}; if(status)where.status=status;if(audience)where.audience=audience
  if(search)where.OR=[{subject:{contains:search}},{message:{contains:search}},{recipientEmail:{contains:search}}]
  const [jobs,total]=await Promise.all([
    prisma.notificationJob.findMany({where,orderBy:{createdAt:'desc'},skip,take:pageSize,include:{selectedUser:{select:{id:true,fullName:true,email:true,phone:true}}}}),
    prisma.notificationJob.count({where}),
  ])
  res.json({jobs,pagination:paginationMeta(page,pageSize,total)})
})

app.post('/admin/notifications', async (req, res) => {
  const parsed = notificationSchema.safeParse(req.body)
  if (!parsed.success) return res.status(400).json({ message: 'Invalid notification data.', issues: parsed.error.issues })
  const data = parsed.data
  if (data.channel === 'EMAIL' && !data.subject?.trim()) return res.status(400).json({ message: 'Email subject is required.' })

  let selectedUser: any = null
  let totalRecipients = 0
  let recipientEmail = data.recipientEmail?.trim() || null
  if (data.audience === 'SINGLE_USER') {
    if (data.selectedUserId) {
      selectedUser = await prisma.user.findUnique({ where: { id: data.selectedUserId } })
      if (!selectedUser) return res.status(400).json({ message: 'Selected user was not found.' })
      recipientEmail = recipientEmail || selectedUser.email
    }
    if (!selectedUser && !recipientEmail) return res.status(400).json({ message: 'Choose a user or enter a recipient email.' })
    totalRecipients = 1
  } else if (data.audience === 'SUBSCRIBERS_ONLY') {
    totalRecipients = await prisma.subscription.count({ where: { status: 'ACTIVE', user: { status: 'ACTIVE' } } })
  } else {
    totalRecipients = await prisma.user.count({ where: { status: 'ACTIVE' } })
  }

  // Provider delivery (SMTP/SMS) is intentionally not simulated here. This creates a real queue/history record.
  const job = await prisma.notificationJob.create({
    data: {
      channel: data.channel,
      audience: data.audience,
      selectedUserId: selectedUser?.id ?? null,
      recipientEmail,
      subject: data.subject?.trim() || null,
      message: data.message,
      status: 'QUEUED',
      totalRecipients,
    },
    include: { selectedUser: { select: { id: true, fullName: true, email: true, phone: true } } },
  })
  res.status(201).json(job)
})

app.patch('/admin/notifications/:jobId/status', async (req, res) => {
  const parsed = z.object({ status: z.enum(['QUEUED','SENDING','SENT','FAILED','CANCELLED']) }).safeParse(req.body)
  if (!parsed.success) return res.status(400).json({ message: 'Invalid notification status.' })
  try {
    const status = parsed.data.status
    const job = await prisma.notificationJob.update({
      where: { id: req.params.jobId },
      data: { status, sentAt: status === 'SENT' ? new Date() : undefined },
    })
    res.json(job)
  } catch {
    res.status(404).json({ message: 'Notification job not found.' })
  }
})

app.get('/admin/community', async (req, res) => {
  const search=String(req.query.search??'').trim(),status=String(req.query.status??'').trim(),reportedOnly=String(req.query.reportedOnly??'')==='true'
  const { page, pageSize, skip } = paginationFromQuery(req)
  const where:any={};if(status)where.status=status;if(reportedOnly)where.isReported=true
  if(search)where.OR=[{authorName:{contains:search}},{category:{contains:search}},{title:{contains:search}},{body:{contains:search}}]
  const [posts,filteredTotal,totalPosts,reportedPosts,reportedResponses]=await Promise.all([
    prisma.communityPost.findMany({where,orderBy:{createdAt:'desc'},include:{responses:{orderBy:{createdAt:'asc'}}},skip,take:pageSize}),
    prisma.communityPost.count({where}), prisma.communityPost.count({where:{status:'PUBLISHED'}}), prisma.communityPost.count({where:{isReported:true}}), prisma.communityResponse.count({where:{isReported:true}}),
  ])
  res.json({summary:{totalPosts,reportedPosts,reportedResponses},posts,pagination:paginationMeta(page,pageSize,filteredTotal)})
})

app.patch('/admin/community/posts/:postId', async (req, res) => {
  const parsed = z.object({
    status: z.enum(['PUBLISHED','HIDDEN','REMOVED']).optional(),
    clearReport: z.boolean().optional(),
  }).safeParse(req.body)
  if (!parsed.success) return res.status(400).json({ message: 'Invalid moderation action.' })
  try {
    const post = await prisma.communityPost.update({
      where: { id: req.params.postId },
      data: {
        ...(parsed.data.status ? { status: parsed.data.status } : {}),
        ...(parsed.data.clearReport ? { isReported: false, reportCount: 0 } : {}),
      },
      include: { responses: true },
    })
    res.json(post)
  } catch {
    res.status(404).json({ message: 'Community post not found.' })
  }
})

app.patch('/admin/community/responses/:responseId', async (req, res) => {
  const parsed = z.object({
    status: z.enum(['PUBLISHED','HIDDEN','REMOVED']).optional(),
    clearReport: z.boolean().optional(),
  }).safeParse(req.body)
  if (!parsed.success) return res.status(400).json({ message: 'Invalid moderation action.' })
  try {
    const response = await prisma.communityResponse.update({
      where: { id: req.params.responseId },
      data: {
        ...(parsed.data.status ? { status: parsed.data.status } : {}),
        ...(parsed.data.clearReport ? { isReported: false, reportCount: 0 } : {}),
      },
    })
    res.json(response)
  } catch {
    res.status(404).json({ message: 'Community response not found.' })
  }
})

app.get('/admin/settings', async (_req, res) => {
  const settings = await prisma.systemSetting.upsert({
    where: { id: 'platform' },
    update: {},
    create: { id: 'platform', defaultPrintingFee: 7, orderFeedbackEmail: true },
  })
  res.json({ ...settings, defaultPrintingFee: Number(settings.defaultPrintingFee) })
})

app.put('/admin/settings', async (req, res) => {
  const parsed = z.object({
    defaultPrintingFee: z.coerce.number().min(0).max(9999),
    orderFeedbackEmail: z.boolean(),
  }).safeParse(req.body)
  if (!parsed.success) return res.status(400).json({ message: 'Invalid settings.', issues: parsed.error.issues })
  const settings = await prisma.systemSetting.upsert({
    where: { id: 'platform' },
    create: { id: 'platform', ...parsed.data },
    update: parsed.data,
  })
  res.json({ ...settings, defaultPrintingFee: Number(settings.defaultPrintingFee) })
})


const physicalOrderSchema = z.object({
  cardId: z.string().min(1),
  quantity: z.coerce.number().int().min(1).max(25),
  personalizationRecipient: z.string().trim().min(1).max(120),
  personalizationSender: z.string().trim().min(1).max(120),
  recipientName: z.string().min(1).max(191),
  address1: z.string().min(1).max(255),
  address2: z.string().max(255).optional().default(''),
  city: z.string().min(1).max(120),
  state: z.string().min(1).max(120),
  postalCode: z.string().min(1).max(40),
  country: z.string().min(1).max(120),
  shippingNote: z.string().max(2000).optional().default(''),
})

function orderDto(o: any) {
  return {
    ...o,
    cardPrice: Number(o.cardPrice ?? 7.99),
    printingFee: Number(o.printingFee ?? 7),
    subtotal: o.subtotal == null ? null : Number(o.subtotal),
    shippingFee: o.shippingFee == null ? null : Number(o.shippingFee),
    totalAmount: o.totalAmount == null ? null : Number(o.totalAmount),
  }
}

app.get('/orders/pricing', async (_req, res) => {
  const settings = await prisma.systemSetting.upsert({ where: { id: 'platform' }, update: {}, create: { id: 'platform', defaultPrintingFee: 7, orderFeedbackEmail: true } })
  res.json({ cardPrice: 7.99, printingFee: Number(settings.defaultPrintingFee) })
})

app.post('/orders', async (req, res) => {
  const auth = await getAuthenticatedUser(req)
  if (!auth) return res.status(401).json({ message: 'Authentication required.' })
  const parsed = physicalOrderSchema.safeParse(req.body)
  if (!parsed.success) return res.status(400).json({ message: 'Please complete the shipping information.', issues: parsed.error.issues })
  const card = await prisma.card.findFirst({ where: { id: parsed.data.cardId, isPublished: true }, include: { collection: true } })
  if (!card) return res.status(404).json({ message: 'Card not found.' })
  const user = await prisma.user.findUnique({ where: { id: auth.id } })
  if (!user) return res.status(401).json({ message: 'Account not found.' })
  const settings = await prisma.systemSetting.upsert({ where: { id: 'platform' }, update: {}, create: { id: 'platform', defaultPrintingFee: 7, orderFeedbackEmail: true } })
  const cardPrice = 7.99
  const printingFee = Number(settings.defaultPrintingFee)
  const subtotal = Number((cardPrice * parsed.data.quantity).toFixed(2))
  const totalBeforeShipping = Number((subtotal + printingFee).toFixed(2))
  const address = [parsed.data.address1, parsed.data.address2, `${parsed.data.city}, ${parsed.data.state} ${parsed.data.postalCode}`, parsed.data.country].filter(Boolean).join('\n')
  const order = await prisma.cardOrder.create({
    data: {
      orderNumber: `LT-${Date.now().toString(36).toUpperCase()}-${randomUUID().slice(0, 5).toUpperCase()}`,
      userId: auth.id,
      customerName: user.fullName,
      customerEmail: user.email,
      cardId: card.id,
      cardTitle: card.title,
      cardCategory: card.collection.name,
      quantity: parsed.data.quantity,
      cardPrice,
      printingFee,
      subtotal,
      shippingFee: null,
      totalAmount: totalBeforeShipping,
      status: 'PLACED',
      shippingName: parsed.data.recipientName,
      personalizationRecipient: parsed.data.personalizationRecipient,
      personalizationSender: parsed.data.personalizationSender,
      shippingAddress: address,
      shippingNote: parsed.data.shippingNote || null,
    },
  })
  res.status(201).json(orderDto(order))
})


async function buildPersonalizedPdf(card: any, recipient: string, sender: string) {
  if (!card?.pdfPath) throw new Error('Original PDF is not available for this card.')
  const sourcePath = path.resolve(storageRoot, card.pdfPath)
  const allowedRoot = path.resolve(cardsRoot) + path.sep
  if (!sourcePath.startsWith(allowedRoot) || !existsSync(sourcePath)) throw new Error('Original PDF file is missing from storage.')
  const sourceBytes = await fs.readFile(sourcePath)
  const pdfDoc = await PDFDocument.load(sourceBytes)
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica)
  const bold = await pdfDoc.embedFont(StandardFonts.HelveticaBold)
  const page = pdfDoc.getPages()[0]
  const { width, height } = page.getSize()
  const marginX = Math.max(18, width * 0.035)
  const footerY = Math.max(14, height * 0.035)
  const labelSize = Math.max(7.5, Math.min(10, width / 58))
  const valueSize = Math.max(8.5, Math.min(11.5, width / 52))
  const ink = rgb(0.22, 0.20, 0.18)
  const muted = rgb(0.42, 0.39, 0.35)
  const leftLabel = 'For:'
  const rightLabel = 'With Love:'
  const footerHeight = Math.max(26, height * 0.075)
  page.drawLine({ start: { x: marginX, y: footerHeight - 1 }, end: { x: width - marginX, y: footerHeight - 1 }, thickness: 0.5, color: rgb(0.72, 0.68, 0.63), opacity: 0.45 })
  page.drawText(leftLabel, { x: marginX, y: footerY + 1, size: labelSize, font: bold, color: muted })
  page.drawText(recipient, { x: marginX + bold.widthOfTextAtSize(leftLabel, labelSize) + 5, y: footerY, size: valueSize, font, color: ink })
  const senderText = `${rightLabel} ${sender}`
  const senderWidth = bold.widthOfTextAtSize(rightLabel, labelSize) + 5 + font.widthOfTextAtSize(sender, valueSize)
  page.drawText(rightLabel, { x: Math.max(marginX, width - marginX - senderWidth), y: footerY + 1, size: labelSize, font: bold, color: muted })
  page.drawText(sender, { x: Math.max(marginX, width - marginX - font.widthOfTextAtSize(sender, valueSize)), y: footerY, size: valueSize, font, color: ink })
  return pdfDoc.save()
}

app.get('/cards/:cardId/personalized-pdf', async (req, res) => {
  const auth = await getAuthenticatedUser(req)
  if (!auth) return res.status(401).json({ message: 'Authentication required.' })
  const subscription = await prisma.subscription.findUnique({ where: { userId: auth.id } })
  const active = subscription?.status === 'ACTIVE' && (!subscription.currentPeriodEnd || subscription.currentPeriodEnd > new Date())
  if (!active) return res.status(403).json({ message: 'An active subscription is required to download a personalized PDF.' })
  const parsed = z.object({ recipient: z.string().trim().min(1).max(120), sender: z.string().trim().min(1).max(120) }).safeParse(req.query)
  if (!parsed.success) return res.status(400).json({ message: 'Recipient and sender names are required.' })
  const card = await prisma.card.findFirst({ where: { id: req.params.cardId, isPublished: true } })
  if (!card) return res.status(404).json({ message: 'Card not found.' })
  try {
    const bytes = await buildPersonalizedPdf(card, parsed.data.recipient, parsed.data.sender)
    const safeName = `${card.slug || 'laurentine-card'}-personalized.pdf`.replace(/[^a-zA-Z0-9._-]+/g, '-')
    res.setHeader('Content-Type', 'application/pdf')
    res.setHeader('Content-Disposition', `attachment; filename="${safeName}"`)
    res.send(Buffer.from(bytes))
  } catch (error) {
    console.error('PERSONALIZED PDF ERROR', error)
    res.status(500).json({ message: error instanceof Error ? error.message : 'Unable to generate personalized PDF.' })
  }
})

app.get('/admin/orders/:orderId/personalized-pdf', async (req, res) => {
  const order = await prisma.cardOrder.findUnique({ where: { id: req.params.orderId }, include: { card: true } })
  if (!order) return res.status(404).json({ message: 'Order not found.' })
  if (!order.card || !order.personalizationRecipient || !order.personalizationSender) return res.status(400).json({ message: 'This order does not have complete personalization details.' })
  try {
    const bytes = await buildPersonalizedPdf(order.card, order.personalizationRecipient, order.personalizationSender)
    const safeName = `${order.orderNumber}-${order.card.slug || 'card'}-print.pdf`.replace(/[^a-zA-Z0-9._-]+/g, '-')
    res.setHeader('Content-Type', 'application/pdf')
    res.setHeader('Content-Disposition', `attachment; filename="${safeName}"`)
    res.send(Buffer.from(bytes))
  } catch (error) {
    console.error('ORDER PERSONALIZED PDF ERROR', error)
    res.status(500).json({ message: error instanceof Error ? error.message : 'Unable to generate print PDF.' })
  }
})

const port = Number(process.env.PORT ?? 4000)
await fs.mkdir(cardsRoot, { recursive: true })
await fs.mkdir(challengesRoot, { recursive: true })
app.listen(port, () => {
  console.log(`HeartString API running at http://localhost:${port}`)
})

// Authenticated customer order tracking
app.get('/orders', async (req,res)=>{
  const auth=await getAuthenticatedUser(req); if(!auth)return res.status(401).json({message:'Authentication required.'})
  const search=String(req.query.search??'').trim(), status=String(req.query.status??'').trim()
  const where:any={userId:auth.id}; if(status)where.status=status
  if(search)where.OR=[{orderNumber:{contains:search}},{cardTitle:{contains:search}},{shippingName:{contains:search}}]
  const [orders,all]=await Promise.all([prisma.cardOrder.findMany({where,orderBy:{placedAt:'desc'}}),prisma.cardOrder.findMany({where:{userId:auth.id},orderBy:{placedAt:'desc'}})])
  const cards=await prisma.card.findMany({where:{title:{in:[...new Set(orders.map(o=>o.cardTitle))]}},select:{title:true,previewPath:true}})
  const previews=new Map(cards.map(c=>[c.title,c.previewPath?absoluteAssetUrl(req,c.previewPath):null]))
  const dto=(o:any)=>({...orderDto(o),previewUrl:previews.get(o.cardTitle)??null})
  res.json({summary:{activeOrders:all.filter(o=>!['DELIVERED','CANCELLED'].includes(o.status)).length,totalCardsOrdered:all.reduce((n,o)=>n+o.quantity,0),deliveredTotal:all.filter(o=>o.status==='DELIVERED').reduce((n,o)=>n+o.quantity,0)},orders:orders.map(dto)})
})
app.get('/orders/:orderId',async(req,res)=>{
 const auth=await getAuthenticatedUser(req); if(!auth)return res.status(401).json({message:'Authentication required.'})
 const o=await prisma.cardOrder.findFirst({where:{id:req.params.orderId,userId:auth.id}}); if(!o)return res.status(404).json({message:'Order not found.'})
 const card=o.cardId?await prisma.card.findUnique({where:{id:o.cardId},select:{previewPath:true}}):null
 res.json({...orderDto(o),previewUrl:card?.previewPath?absoluteAssetUrl(req,card.previewPath):null})
})
app.patch('/orders/:orderId/cancel',async(req,res)=>{
 const auth=await getAuthenticatedUser(req); if(!auth)return res.status(401).json({message:'Authentication required.'})
 const o=await prisma.cardOrder.findFirst({where:{id:req.params.orderId,userId:auth.id}}); if(!o)return res.status(404).json({message:'Order not found.'})
 if(!['PLACED','QUOTED'].includes(o.status))return res.status(400).json({message:'This order can no longer be cancelled.'})
 const updated=await prisma.cardOrder.update({where:{id:o.id},data:{status:'CANCELLED'}})
 res.json(orderDto(updated))
})
