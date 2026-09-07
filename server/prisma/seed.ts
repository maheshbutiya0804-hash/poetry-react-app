import 'dotenv/config'
import { prisma } from '../src/lib/prisma.js'
import { hashPassword, normalizeEmail, passwordPolicyError } from '../src/lib/auth.js'

async function main() {
  let adminEmail: string | null = null
  if (process.env.ADMIN_EMAIL && process.env.ADMIN_PASSWORD && process.env.ADMIN_PASSWORD !== 'CHANGE_THIS_BEFORE_BOOTSTRAP') {
    const policyError = passwordPolicyError(process.env.ADMIN_PASSWORD)
    if (policyError) throw new Error(`ADMIN_PASSWORD is not strong enough: ${policyError}`)
    adminEmail = normalizeEmail(process.env.ADMIN_EMAIL)
    const passwordHash = await hashPassword(process.env.ADMIN_PASSWORD)
    await prisma.user.upsert({
      where: { email: adminEmail },
      update: { fullName: process.env.ADMIN_NAME || 'Heartstring Admin', passwordHash, role: 'ADMIN', status: 'ACTIVE' },
      create: { fullName: process.env.ADMIN_NAME || 'Heartstring Admin', email: adminEmail, passwordHash, role: 'ADMIN', status: 'ACTIVE' },
    })
  }

  const member = await prisma.user.upsert({
    where: { email: 'member@heartstringnotes.local' },
    update: {},
    create: { fullName: 'Demo Member', email: 'member@heartstringnotes.local', role: 'USER', status: 'ACTIVE' },
  })

  await prisma.subscription.upsert({ where: { userId: member.id }, update: {}, create: { userId: member.id, planName: 'Monthly Access', status: 'INCOMPLETE', paymentStatus: 'FAILED', monthlyPrice: 8.99 } })
  const existingPayment = await prisma.paymentTransaction.findFirst({ where: { providerTransactionId: 'demo-payment-001' } })
  if (!existingPayment) await prisma.paymentTransaction.create({ data: { userId: member.id, providerTransactionId: 'demo-payment-001', description: 'Subscription update', amount: 8.99, status: 'FAILED' } })
  const demoOrder = await prisma.cardOrder.findUnique({ where: { orderNumber: 'HSN-DEMO-0001' } })
  if (!demoOrder) await prisma.cardOrder.create({ data: { orderNumber: 'HSN-DEMO-0001', userId: member.id, customerName: member.fullName, customerEmail: member.email, cardTitle: 'Moonlit Vow', cardCategory: 'Love', quantity: 1, status: 'PLACED', reviewed: false } })

  console.log(`Seed complete${adminEmail ? `; admin ready at ${adminEmail}` : '; no admin password configured — run npm run admin:bootstrap after setting ADMIN_EMAIL/ADMIN_PASSWORD'}`)
}

main().then(() => prisma.$disconnect()).catch(async error => { console.error(error); await prisma.$disconnect(); process.exit(1) })
