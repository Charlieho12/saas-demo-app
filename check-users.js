// Check all users and their subscriptions
const { PrismaClient } = require('@prisma/client')

async function checkUsers() {
  const prisma = new PrismaClient()
  
  try {
    console.log('All users in database:')
    const users = await prisma.user.findMany({
      include: { subscription: true }
    })
    
    users.forEach((user, index) => {
      console.log(`\n${index + 1}. User:`, {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        hasSubscription: !!user.subscription,
        subscriptionStatus: user.subscription?.status || 'No subscription'
      })
    })
    
  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkUsers()