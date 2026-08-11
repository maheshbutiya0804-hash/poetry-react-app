import 'dotenv/config'
import cors from 'cors'
import express from 'express'
import multer from 'multer'
import path from 'node:path'
import fs from 'node:fs/promises'
import { existsSync } from 'node:fs'
import { randomUUID } from 'node:crypto'
import { fileURLToPath } from 'node:url'
import { prisma } from "./lib/prisma.js";
import { PDFDocument } from 'pdf-lib'
import { z } from 'zod'
import { createLoginSession, destroyLoginSession, getAuthenticatedUser, hashPassword, normalizeEmail, passwordPolicyError, requireAdmin, safeUser, verifyPassword } from './lib/auth.js'
import { OAuth2Client } from 'google-auth-library'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const serverRoot = path.resolve(__dirname, '..')
const storageRoot = path.join(serverRoot, 'storage')
const cardsRoot = path.join(storageRoot, 'cards')
const challengesRoot = path.join(storageRoot, 'challenges')

const app = express()
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 25 * 1024 * 1024 },
})

app.use(cors({ origin: process.env.CLIENT_ORIGIN ?? 'http://localhost:5173', credentials: true }))
app.use(express.json())
app.use('/uploads', express.static(storageRoot))

const publicCardSelect = {
  id: true,
  slug: true,
  collectionId: true,
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
    title: card.title,
    excerpt: card.description,
    previewImageUrl: absoluteAssetUrl(req, card.previewPath) ?? absoluteAssetUrl(req, card.pdfPath),
    pdfUrl: absoluteAssetUrl(req, card.pdfPath),
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
  }
}

app.get('/api/health', (_req, res) => res.json({ ok: true }))

app.get('/api/collections', async (_req, res) => {
  const collections = await prisma.collection.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: 'asc' },
    include: { _count: { select: { cards: { where: { isPublished: true } } } } },
  })
  res.json(collections.map(c => ({ ...c, cardCount: c._count.cards, _count: undefined })))
})

app.get('/api/collections/:collectionId/cards', async (req, res) => {
  const cards = await prisma.card.findMany({
    where: { collectionId: req.params.collectionId, isPublished: true },
    orderBy: { createdAt: 'desc' },
    select: publicCardSelect,
  })
  res.json(cards.map(card => cardDto(req, card)))
})

app.get('/api/cards/:cardId', async (req, res) => {
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

app.post('/api/auth/register', async (req, res) => {
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

app.post('/api/auth/login', async (req, res) => {
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

app.post('/api/auth/google', async (req, res) => {
  const parsed = googleLoginSchema.safeParse(req.body)
  if (!parsed.success) return res.status(400).json({ message: 'Google credential is required.' })

  const googleClientId = process.env.GOOGLE_CLIENT_ID?.trim()
  if (!googleClientId) {
    console.error('GOOGLE_CLIENT_ID is not configured.')
    return res.status(500).json({ message: 'Google sign-in is not configured.' })
  }

  try {
    const ticket = await googleClient.verifyIdToken({
      idToken: parsed.data.credential,
      audience: googleClientId,
    })
    const payload = ticket.getPayload()
    const googleSubject = payload?.sub
    const email = payload?.email ? normalizeEmail(payload.email) : ''

    if (!googleSubject || !email || payload?.email_verified !== true) {
      return res.status(401).json({ message: 'Google could not verify this email address.' })
    }

    // Google recommends using the token's `sub` claim as the stable Google account identifier.
    // If this Google account has not been linked yet, a verified email may link it to an
    // existing HeartString account so users do not end up with duplicate accounts.
    let user = await prisma.user.findUnique({ where: { googleSubject } })
    if (!user) {
      user = await prisma.user.findUnique({ where: { email } })
      if (user?.googleSubject && user.googleSubject !== googleSubject) {
        return res.status(409).json({ message: 'This email is already linked to another Google account.' })
      }
    }

    if (!user) {
      const fallbackName = email.split('@')[0] || 'HeartString Member'
      user = await prisma.user.create({
        data: {
          fullName: payload?.name?.trim() || fallbackName,
          email,
          phone: null,
          passwordHash: null,
          googleSubject,
          profileImageUrl: payload?.picture || null,
          role: 'USER',
          status: 'ACTIVE',
          lastLoginAt: new Date(),
        },
      })
    } else {
      if (user.status !== 'ACTIVE') return res.status(403).json({ message: 'This account is not active.' })
      user = await prisma.user.update({
        where: { id: user.id },
        data: {
          googleSubject: user.googleSubject || googleSubject,
          profileImageUrl: payload?.picture || user.profileImageUrl,
          lastLoginAt: new Date(),
        },
      })
    }

    await prisma.authSession.deleteMany({ where: { userId: user.id, expiresAt: { lt: new Date() } } })
    await createLoginSession(res, user.id)
    res.json({ user: safeUser(user), isNewUser: user.passwordHash === null && user.googleSubject === googleSubject })
  } catch (error) {
  console.error("GOOGLE AUTH ERROR:", error);

  res.status(401).json({
    message: "Google sign-in could not be verified.",
    error: error instanceof Error ? error.message : String(error),
  });
}
})

app.get('/api/auth/me', async (req, res) => {
  try {
    const user = await getAuthenticatedUser(req)
    if (!user) return res.status(401).json({ message: 'Not signed in.' })
    res.json({ user })
  } catch (error) {
    console.error('Session lookup failed:', error)
    res.status(500).json({ message: 'Could not load session.' })
  }
})

app.post('/api/auth/logout', async (req, res) => {
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

app.get('/api/profile', async (req, res) => {
  const auth = await getAuthenticatedUser(req)
  if (!auth) return res.status(401).json({ message: 'Authentication required.' })
  const user = await prisma.user.findUnique({ where: { id: auth.id }, include: { subscription: true } })
  if (!user) return res.status(404).json({ message: 'User not found.' })
  const userDto=safeUser(user); if(userDto.profileImageUrl && !/^https?:/i.test(userDto.profileImageUrl)) userDto.profileImageUrl=absoluteAssetUrl(req,userDto.profileImageUrl)
  res.json({ user: userDto, subscription: user.subscription ? { planName:user.subscription.planName, status:user.subscription.status, monthlyPrice:Number(user.subscription.monthlyPrice), currentPeriodEnd:user.subscription.currentPeriodEnd, cancelAtPeriodEnd:user.subscription.cancelAtPeriodEnd } : null })
})

app.patch('/api/profile', async (req, res) => {
  const auth = await getAuthenticatedUser(req); if (!auth) return res.status(401).json({ message:'Authentication required.' })
  const parsed=profileSchema.safeParse(req.body); if(!parsed.success) return res.status(400).json({message:'Please enter a valid name and phone number.'})
  const user=await prisma.user.update({where:{id:auth.id},data:{fullName:parsed.data.fullName,phone:parsed.data.phone||null}})
  res.json({user:safeUser(user)})
})

app.patch('/api/profile/password', async (req,res)=>{
  const auth=await getAuthenticatedUser(req); if(!auth)return res.status(401).json({message:'Authentication required.'})
  const parsed=profilePasswordSchema.safeParse(req.body); if(!parsed.success)return res.status(400).json({message:'Please enter a valid new password.'})
  const policy=passwordPolicyError(parsed.data.newPassword); if(policy)return res.status(400).json({message:policy})
  const user=await prisma.user.findUnique({where:{id:auth.id}}); if(!user)return res.status(404).json({message:'User not found.'})
  if(user.passwordHash){ if(!parsed.data.currentPassword || !(await verifyPassword(parsed.data.currentPassword,user.passwordHash))) return res.status(400).json({message:'Current password is incorrect.'}) }
  await prisma.user.update({where:{id:user.id},data:{passwordHash:await hashPassword(parsed.data.newPassword)}}); res.json({ok:true})
})

app.post('/api/profile/photo', profilePhotoUpload.single('photo'), async (req,res)=>{
  const auth=await getAuthenticatedUser(req); if(!auth)return res.status(401).json({message:'Authentication required.'})
  if(!req.file)return res.status(400).json({message:'Choose a profile photo.'})
  const allowed:{[key:string]:string}={'image/jpeg':'.jpg','image/png':'.png','image/webp':'.webp'}; const ext=allowed[req.file.mimetype]
  if(!ext)return res.status(400).json({message:'Use a JPG, PNG, or WebP image.'})
  const dir=path.join(storageRoot,'profiles'); await fs.mkdir(dir,{recursive:true}); const filename=`${auth.id}-${Date.now()}${ext}`; await fs.writeFile(path.join(dir,filename),req.file.buffer)
  const relative=`profiles/${filename}`; const user=await prisma.user.update({where:{id:auth.id},data:{profileImageUrl:relative}}); const dto=safeUser(user); dto.profileImageUrl=absoluteAssetUrl(req,relative); res.json({user:dto})
})

app.delete('/api/profile/photo', async(req,res)=>{ const auth=await getAuthenticatedUser(req); if(!auth)return res.status(401).json({message:'Authentication required.'}); const user=await prisma.user.update({where:{id:auth.id},data:{profileImageUrl:null}}); res.json({user:safeUser(user)}) })

// Everything below /api/admin requires a current ACTIVE administrator session.
app.use('/api/admin', requireAdmin)

app.get('/api/admin/cards', async (req, res) => {
  const cards = await prisma.card.findMany({ orderBy: { createdAt: 'desc' }, select: publicCardSelect })
  res.json(cards.map(card => cardDto(req, card)))
})

app.get('/api/admin/cards/:cardId', async (req, res) => {
  const card = await prisma.card.findUnique({ where: { id: req.params.cardId }, select: publicCardSelect })
  if (!card) return res.status(404).json({ message: 'Card not found' })
  res.json(cardDto(req, card))
})

const cardFieldsSchema = z.object({
  collectionId: z.string().min(1),
  title: z.string().min(2).max(140),
  description: z.string().max(1000).optional().default(''),
  published: z.enum(['true', 'false']).optional().default('false'),
})

app.post('/api/admin/cards', upload.fields([
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

app.post('/api/admin/cards/design', upload.none(), async (req, res) => {
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

app.put('/api/admin/cards/:cardId/design', upload.none(), async (req, res) => {
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

app.patch('/api/admin/cards/:cardId/publish', async (req, res) => {
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

app.delete('/api/admin/cards/:cardId', async (req, res) => {
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

app.get('/api/admin/overview', async (_req, res) => {
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

app.get('/api/admin/users', async (req, res) => {
  const search = String(req.query.search ?? '').trim()
  const role = String(req.query.role ?? '').trim()
  const status = String(req.query.status ?? '').trim()
  const subscription = String(req.query.subscription ?? '').trim()

  const users = await prisma.user.findMany({
    where: {
      ...(search ? { OR: [
        { fullName: { contains: search } },
        { email: { contains: search } },
      ] } : {}),
      ...(role ? { role } : {}),
      ...(status ? { status } : {}),
      ...(subscription ? {
        subscription: subscription === 'NONE'
          ? { is: null }
          : { is: { status: subscription } },
      } : {}),
    },
    orderBy: { joinedAt: 'desc' },
    include: { subscription: true },
  })

  const [totalUsers, activeSubscribers, blockedUsers] = await Promise.all([
    prisma.user.count(),
    prisma.subscription.count({ where: { status: 'ACTIVE' } }),
    prisma.user.count({ where: { status: 'BLOCKED' } }),
  ])

  res.json({
    summary: {
      totalUsers,
      activeSubscribers,
      freeUsers: Math.max(totalUsers - activeSubscribers, 0),
      blockedUsers,
    },
    users: users.map(user => ({
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      phone: user.phone,
      role: user.role,
      status: user.status,
      joinedAt: user.joinedAt,
      subscriptionStatus: user.subscription?.status ?? 'NONE',
      paymentStatus: user.subscription?.paymentStatus ?? 'NONE',
    })),
  })
})

app.patch('/api/admin/users/:userId/status', async (req, res) => {
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

app.get('/api/admin/subscriptions', async (req, res) => {
  const search = String(req.query.search ?? '').trim()
  const status = String(req.query.status ?? '').trim()

  const subscriptions = await prisma.subscription.findMany({
    where: {
      ...(status ? { status } : {}),
      ...(search ? { user: { OR: [
        { fullName: { contains: search } },
        { email: { contains: search } },
      ] } } : {}),
    },
    orderBy: { updatedAt: 'desc' },
    include: { user: true },
  })

  const startOfMonth = new Date()
  startOfMonth.setDate(1)
  startOfMonth.setHours(0, 0, 0, 0)

  const [totalSubscribers, activeSubscriptions, successfulThisMonth, transactions, failedPayments] = await Promise.all([
    prisma.subscription.count(),
    prisma.subscription.count({ where: { status: 'ACTIVE' } }),
    prisma.paymentTransaction.aggregate({
      where: { status: 'SUCCESS', occurredAt: { gte: startOfMonth } },
      _sum: { amount: true },
    }),
    prisma.paymentTransaction.findMany({
      orderBy: { occurredAt: 'desc' },
      take: 10,
      include: { user: true },
    }),
    prisma.paymentTransaction.findMany({
      where: { status: 'FAILED' },
      orderBy: { occurredAt: 'desc' },
      take: 10,
      include: { user: true },
    }),
  ])

  const monthlyPrice = subscriptions[0]?.monthlyPrice ?? 8.99

  res.json({
    summary: {
      totalSubscribers,
      monthlyRevenue: Number(successfulThisMonth._sum.amount ?? 0),
      activeSubscriptions,
      monthlyPrice: Number(monthlyPrice),
    },
    subscribers: subscriptions.map(sub => ({
      id: sub.id,
      userId: sub.userId,
      fullName: sub.user.fullName,
      email: sub.user.email,
      planName: sub.planName,
      status: sub.status,
      paymentStatus: sub.paymentStatus,
      monthlyPrice: Number(sub.monthlyPrice),
      startedAt: sub.startedAt,
      currentPeriodEnd: sub.currentPeriodEnd,
      createdAt: sub.createdAt,
    })),
    transactions: transactions.map(tx => ({
      id: tx.id,
      providerTransactionId: tx.providerTransactionId ?? tx.id,
      fullName: tx.user.fullName,
      date: tx.occurredAt,
      amount: Number(tx.amount),
      status: tx.status,
      description: tx.description,
    })),
    failedPayments: failedPayments.map(tx => ({
      id: tx.id,
      fullName: tx.user.fullName,
      email: tx.user.email,
      date: tx.occurredAt,
      amount: Number(tx.amount),
      status: tx.status,
    })),
  })
})



app.get('/api/admin/users/:userId', async (req, res) => {
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

app.get('/api/admin/challenges', async (req, res) => {
  const search = String(req.query.search ?? '').trim()
  const status = String(req.query.status ?? '').trim()
  const month = String(req.query.month ?? '').trim()
  const year = Number(req.query.year ?? 0)
  const where: any = {}
  if (search) where.title = { contains: search }
  if (status) where.status = status
  if (month || year) {
    const y = year || new Date().getFullYear()
    const m = month ? Number(month) - 1 : 0
    const start = new Date(Date.UTC(y, m, 1))
    const end = month ? new Date(Date.UTC(y, m + 1, 1)) : new Date(Date.UTC(y + 1, 0, 1))
    where.challengeMonth = { gte: start, lt: end }
  }
  const challenges = await prisma.challenge.findMany({
    where,
    orderBy: [{ challengeMonth: 'desc' }, { createdAt: 'desc' }],
    include: { reminders: { orderBy: { dayOfMonth: 'asc' } } },
  })
  const [total, drafts, published] = await Promise.all([
    prisma.challenge.count(),
    prisma.challenge.count({ where: { status: 'DRAFT' } }),
    prisma.challenge.count({ where: { status: 'PUBLISHED' } }),
  ])
  res.json({ summary: { total, drafts, published }, challenges: challenges.map(c => challengeDto(req, c)) })
})

app.get('/api/admin/challenges/:challengeId', async (req, res) => {
  const challenge = await prisma.challenge.findUnique({
    where: { id: req.params.challengeId },
    include: { reminders: { orderBy: { dayOfMonth: 'asc' } } },
  })
  if (!challenge) return res.status(404).json({ message: 'Challenge not found' })
  res.json(challengeDto(req, challenge))
})

app.post('/api/admin/challenges', upload.single('image'), async (req, res) => {
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

app.patch('/api/admin/challenges/:challengeId/status', async (req, res) => {
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

app.delete('/api/admin/challenges/:challengeId', async (req, res) => {
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

app.get('/api/admin/requests', async (req, res) => {
  const search = String(req.query.search ?? '').trim()
  const status = String(req.query.status ?? '').trim()
  const category = String(req.query.category ?? '').trim()
  const where: any = {}
  if (status) where.status = status
  if (category) where.category = category
  if (search) where.OR = [
    { requesterName: { contains: search } },
    { requesterEmail: { contains: search } },
    { occasion: { contains: search } },
    { prompt: { contains: search } },
  ]
  const [requests, total, pending, inProgress, completed, cancelled, categories] = await Promise.all([
    prisma.poetryRequest.findMany({ where, orderBy: { createdAt: 'desc' } }),
    prisma.poetryRequest.count(),
    prisma.poetryRequest.count({ where: { status: 'PENDING' } }),
    prisma.poetryRequest.count({ where: { status: 'IN_PROGRESS' } }),
    prisma.poetryRequest.count({ where: { status: 'COMPLETED' } }),
    prisma.poetryRequest.count({ where: { status: 'CANCELLED' } }),
    prisma.poetryRequest.findMany({ distinct: ['category'], select: { category: true }, orderBy: { category: 'asc' } }),
  ])
  res.json({
    summary: { total, pending, inProgress, completed, cancelled },
    categories: categories.map(c => c.category),
    requests,
  })
})

app.patch('/api/admin/requests/:requestId/status', async (req, res) => {
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

app.get('/api/admin/orders', async (req, res) => {
  const search = String(req.query.search ?? '').trim()
  const status = String(req.query.status ?? '').trim()
  const reviewedOnly = String(req.query.reviewedOnly ?? '') === 'true'
  const where: any = {}
  if (status) where.status = status
  if (reviewedOnly) where.reviewed = true
  if (search) where.OR = [
    { orderNumber: { contains: search } },
    { customerName: { contains: search } },
    { customerEmail: { contains: search } },
    { cardTitle: { contains: search } },
  ]
  const [orders, total, placed, quoted, inProgress, shipped, delivered, cancelled] = await Promise.all([
    prisma.cardOrder.findMany({ where, orderBy: { placedAt: 'desc' } }),
    prisma.cardOrder.count(),
    prisma.cardOrder.count({ where: { status: 'PLACED' } }),
    prisma.cardOrder.count({ where: { status: 'QUOTED' } }),
    prisma.cardOrder.count({ where: { status: 'IN_PROGRESS' } }),
    prisma.cardOrder.count({ where: { status: 'SHIPPED' } }),
    prisma.cardOrder.count({ where: { status: 'DELIVERED' } }),
    prisma.cardOrder.count({ where: { status: 'CANCELLED' } }),
  ])
  res.json({
    summary: { total, placed, quoted, inProgress, shipped, delivered, cancelled },
    orders: orders.map(o => ({ ...o, shippingFee: o.shippingFee == null ? null : Number(o.shippingFee), totalAmount: o.totalAmount == null ? null : Number(o.totalAmount) })),
  })
})

app.get('/api/admin/orders/:orderId', async (req, res) => {
  const order = await prisma.cardOrder.findUnique({ where: { id: req.params.orderId } })
  if (!order) return res.status(404).json({ message: 'Order not found' })
  res.json({ ...order, shippingFee: order.shippingFee == null ? null : Number(order.shippingFee), totalAmount: order.totalAmount == null ? null : Number(order.totalAmount) })
})

app.patch('/api/admin/orders/:orderId/status', async (req, res) => {
  const parsed = orderStatusSchema.safeParse(req.body)
  if (!parsed.success) return res.status(400).json({ message: 'Invalid order status.' })
  try {
    const status = parsed.data.status
    const order = await prisma.cardOrder.update({
      where: { id: req.params.orderId },
      data: { status, shippedAt: status === 'SHIPPED' ? new Date() : undefined, deliveredAt: status === 'DELIVERED' ? new Date() : undefined },
    })
    res.json({ ...order, shippingFee: order.shippingFee == null ? null : Number(order.shippingFee), totalAmount: order.totalAmount == null ? null : Number(order.totalAmount) })
  } catch {
    res.status(404).json({ message: 'Order not found' })
  }
})

app.patch('/api/admin/orders/:orderId/reviewed', async (req, res) => {
  const parsed = z.object({ reviewed: z.boolean() }).safeParse(req.body)
  if (!parsed.success) return res.status(400).json({ message: 'Invalid reviewed value.' })
  try {
    const order = await prisma.cardOrder.update({ where: { id: req.params.orderId }, data: { reviewed: parsed.data.reviewed } })
    res.json({ ...order, shippingFee: order.shippingFee == null ? null : Number(order.shippingFee), totalAmount: order.totalAmount == null ? null : Number(order.totalAmount) })
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

app.get('/api/admin/notifications', async (req, res) => {
  const search = String(req.query.search ?? '').trim()
  const status = String(req.query.status ?? '').trim()
  const audience = String(req.query.audience ?? '').trim()
  const where: any = {}
  if (status) where.status = status
  if (audience) where.audience = audience
  if (search) where.OR = [
    { subject: { contains: search } },
    { message: { contains: search } },
    { recipientEmail: { contains: search } },
  ]
  const jobs = await prisma.notificationJob.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    take: 100,
    include: { selectedUser: { select: { id: true, fullName: true, email: true, phone: true } } },
  })
  res.json({ jobs })
})

app.post('/api/admin/notifications', async (req, res) => {
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

app.patch('/api/admin/notifications/:jobId/status', async (req, res) => {
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

app.get('/api/admin/community', async (req, res) => {
  const search = String(req.query.search ?? '').trim()
  const status = String(req.query.status ?? '').trim()
  const reportedOnly = String(req.query.reportedOnly ?? '') === 'true'
  const where: any = {}
  if (status) where.status = status
  if (reportedOnly) where.isReported = true
  if (search) where.OR = [
    { authorName: { contains: search } },
    { category: { contains: search } },
    { title: { contains: search } },
    { body: { contains: search } },
  ]
  const [posts, totalPosts, reportedPosts, reportedResponses] = await Promise.all([
    prisma.communityPost.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: { responses: { orderBy: { createdAt: 'asc' } } },
      take: 100,
    }),
    prisma.communityPost.count({ where: { status: 'PUBLISHED' } }),
    prisma.communityPost.count({ where: { isReported: true } }),
    prisma.communityResponse.count({ where: { isReported: true } }),
  ])
  res.json({ summary: { totalPosts, reportedPosts, reportedResponses }, posts })
})

app.patch('/api/admin/community/posts/:postId', async (req, res) => {
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

app.patch('/api/admin/community/responses/:responseId', async (req, res) => {
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

app.get('/api/admin/settings', async (_req, res) => {
  const settings = await prisma.systemSetting.upsert({
    where: { id: 'platform' },
    update: {},
    create: { id: 'platform', defaultPrintingFee: 7, orderFeedbackEmail: true },
  })
  res.json({ ...settings, defaultPrintingFee: Number(settings.defaultPrintingFee) })
})

app.put('/api/admin/settings', async (req, res) => {
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

const port = Number(process.env.PORT ?? 4000)
await fs.mkdir(cardsRoot, { recursive: true })
await fs.mkdir(challengesRoot, { recursive: true })
app.listen(port, () => {
  console.log(`HeartString API running at http://localhost:${port}`)
})

// Authenticated customer order tracking
app.get('/api/orders', async (req,res)=>{
  const auth=await getAuthenticatedUser(req); if(!auth)return res.status(401).json({message:'Authentication required.'})
  const search=String(req.query.search??'').trim(), status=String(req.query.status??'').trim()
  const where:any={userId:auth.id}; if(status)where.status=status
  if(search)where.OR=[{orderNumber:{contains:search}},{cardTitle:{contains:search}},{shippingName:{contains:search}}]
  const [orders,all]=await Promise.all([prisma.cardOrder.findMany({where,orderBy:{placedAt:'desc'}}),prisma.cardOrder.findMany({where:{userId:auth.id},orderBy:{placedAt:'desc'}})])
  const cards=await prisma.card.findMany({where:{title:{in:[...new Set(orders.map(o=>o.cardTitle))]}},select:{title:true,previewPath:true}})
  const previews=new Map(cards.map(c=>[c.title,c.previewPath?absoluteAssetUrl(req,c.previewPath):null]))
  const dto=(o:any)=>({...o,shippingFee:o.shippingFee==null?null:Number(o.shippingFee),totalAmount:o.totalAmount==null?null:Number(o.totalAmount),previewUrl:previews.get(o.cardTitle)??null})
  res.json({summary:{activeOrders:all.filter(o=>!['DELIVERED','CANCELLED'].includes(o.status)).length,totalCardsOrdered:all.reduce((n,o)=>n+o.quantity,0),deliveredTotal:all.filter(o=>o.status==='DELIVERED').reduce((n,o)=>n+o.quantity,0)},orders:orders.map(dto)})
})
app.get('/api/orders/:orderId',async(req,res)=>{
 const auth=await getAuthenticatedUser(req); if(!auth)return res.status(401).json({message:'Authentication required.'})
 const o=await prisma.cardOrder.findFirst({where:{id:req.params.orderId,userId:auth.id}}); if(!o)return res.status(404).json({message:'Order not found.'})
 res.json({...o,shippingFee:o.shippingFee==null?null:Number(o.shippingFee),totalAmount:o.totalAmount==null?null:Number(o.totalAmount)})
})
app.patch('/api/orders/:orderId/cancel',async(req,res)=>{
 const auth=await getAuthenticatedUser(req); if(!auth)return res.status(401).json({message:'Authentication required.'})
 const o=await prisma.cardOrder.findFirst({where:{id:req.params.orderId,userId:auth.id}}); if(!o)return res.status(404).json({message:'Order not found.'})
 if(!['PLACED','QUOTED'].includes(o.status))return res.status(400).json({message:'This order can no longer be cancelled.'})
 const updated=await prisma.cardOrder.update({where:{id:o.id},data:{status:'CANCELLED'}})
 res.json({...updated,shippingFee:updated.shippingFee==null?null:Number(updated.shippingFee),totalAmount:updated.totalAmount==null?null:Number(updated.totalAmount)})
})
