import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@example.com'
  const adminPassword = process.env.ADMIN_PASSWORD || 'admin123'
  
  // Check if admin already exists
  const existingAdmin = await prisma.user.findUnique({
    where: { email: adminEmail }
  })
  
  if (existingAdmin) {
    console.log('Admin user already exists')
    return
  }
  
  // Hash password
  const hashedPassword = await bcrypt.hash(adminPassword, 12)
  
  // Create admin user
  const admin = await prisma.user.create({
    data: {
      email: adminEmail,
      password: hashedPassword,
      name: 'Admin User',
      role: 'ADMIN'
    }
  })
  
  console.log('Admin user created:', { id: admin.id, email: admin.email, role: admin.role })
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })