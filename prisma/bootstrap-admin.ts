import 'dotenv/config'
import { prisma } from '../src/lib/prisma.js'
import { hashPassword, normalizeEmail, passwordPolicyError } from '../src/lib/auth.js'

async function main() {
  const fullName = (process.env.ADMIN_NAME || 'Heartstring Admin').trim()
  const email = normalizeEmail(process.env.ADMIN_EMAIL || '')
  const password = process.env.ADMIN_PASSWORD || ''
  if (!email || !password) throw new Error('Set ADMIN_EMAIL and ADMIN_PASSWORD in server/.env before running admin:bootstrap.')
  const policyError = passwordPolicyError(password)
  if (policyError) throw new Error(`ADMIN_PASSWORD is not strong enough: ${policyError}`)
  const passwordHash = await hashPassword(password)
  const user = await prisma.user.upsert({
    where: { email },
    update: { fullName, passwordHash, role: 'ADMIN', status: 'ACTIVE' },
    create: { fullName, email, passwordHash, role: 'ADMIN', status: 'ACTIVE' },
  })
  await prisma.authSession.deleteMany({ where: { userId: user.id } })
  console.log(`Admin account ready: ${user.email}`)
}

main().then(() => prisma.$disconnect()).catch(async error => { console.error(error); await prisma.$disconnect(); process.exit(1) })
