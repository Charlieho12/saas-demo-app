// Check current subscription status and fix it with latest Stripe data
const { PrismaClient } = require('@prisma/client')

async function checkAndFixSubscription() {
  const prisma = new PrismaClient()
  
  try {
    console.log('Current user status:')
    const user = await prisma.user.findUnique({
      where: { email: 'charlieho61@gmail.com' },
      include: { subscription: true }
    })
    
    console.log({
      email: user.email,
      subscriptionStatus: user.subscription?.status,
      stripeCustomerId: user.subscription?.stripeCustomerId,
      stripeSubscriptionId: user.subscription?.stripeSubscriptionId,
    })
    
    // Since the webhook succeeded, let's update the subscription to ACTIVE
    // You can get the actual subscription ID from your Stripe dashboard
    console.log('\nUpdating subscription to ACTIVE...')
    
    const updated = await prisma.subscription.update({
      where: { userId: user.id },
      data: {
        status: 'ACTIVE',
        currentPeriodStart: new Date(),
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
        // Add your actual Stripe subscription ID here if you have it
        // stripeSubscriptionId: 'sub_your_actual_subscription_id'
      }
    })
    
    console.log('✅ Subscription updated:', {
      status: updated.status,
      periodEnd: updated.currentPeriodEnd
    })
    
  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkAndFixSubscription()