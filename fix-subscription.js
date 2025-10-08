// Update the new user's subscription to ACTIVE
const { PrismaClient } = require('@prisma/client')

async function updateUserSubscription() {
  const prisma = new PrismaClient()
  
  try {
    // Update Charlie Ho's subscription to ACTIVE
    const result = await prisma.subscription.update({
      where: { 
        userId: 'cmghs8ie40000lb098s67tfl1' // Charlie Ho's user ID
      },
      data: {
        status: 'ACTIVE',
        currentPeriodStart: new Date(),
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      }
    })
    
    console.log('✅ Subscription updated for Charlie Ho:', result)
    
    // Verify the update
    const user = await prisma.user.findUnique({
      where: { id: 'cmghs8ie40000lb098s67tfl1' },
      include: { subscription: true }
    })
    
    console.log('✅ Updated user with subscription:', {
      email: user.email,
      subscriptionStatus: user.subscription.status,
      periodEnd: user.subscription.currentPeriodEnd
    })
    
  } catch (error) {
    console.error('❌ Error updating subscription:', error)
  } finally {
    await prisma.$disconnect()
  }
}

updateUserSubscription()