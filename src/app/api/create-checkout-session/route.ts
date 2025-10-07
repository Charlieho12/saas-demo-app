import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { stripe, getStripeCustomer, createStripeCustomer } from '@/lib/stripe'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }
    
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { subscription: true }
    })
    
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }
    
    // Check if user already has an active subscription
    if (user.subscription?.status === 'ACTIVE') {
      return NextResponse.json(
        { error: 'User already has an active subscription' },
        { status: 400 }
      )
    }

    // Development mode: Check if we have valid Stripe keys
    const hasValidStripeKeys = process.env.STRIPE_SECRET_KEY?.startsWith('sk_test_') && 
                               process.env.STRIPE_PUBLISHABLE_KEY?.startsWith('pk_test_') &&
                               process.env.STRIPE_PRICE_ID?.startsWith('price_') &&
                               !process.env.STRIPE_SECRET_KEY.includes('your_stripe_secret_key') &&
                               !process.env.STRIPE_PUBLISHABLE_KEY.includes('your_stripe_publishable_key') &&
                               !process.env.STRIPE_PRICE_ID.includes('your_price_id')

    if (!hasValidStripeKeys && process.env.NODE_ENV === 'development') {
      // Development mode without Stripe: Simulate successful subscription
      console.log('Development mode activated. NEXTAUTH_URL:', process.env.NEXTAUTH_URL)
      
      // Generate unique IDs for development mode
      const devCustomerId = `cus_dev_${user.id}`
      const devSubscriptionId = `sub_dev_${user.id}_${Date.now()}`
      
      await prisma.subscription.upsert({
        where: { userId: user.id },
        update: {
          status: 'ACTIVE',
          stripeCustomerId: devCustomerId,
          stripeSubscriptionId: devSubscriptionId,
          stripePriceId: 'price_dev_mode',
          currentPeriodStart: new Date(),
          currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
        },
        create: {
          userId: user.id,
          status: 'ACTIVE',
          stripeCustomerId: devCustomerId,
          stripeSubscriptionId: devSubscriptionId,
          stripePriceId: 'price_dev_mode',
          currentPeriodStart: new Date(),
          currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
        },
      })

      return NextResponse.json({ 
        url: `${process.env.NEXTAUTH_URL}/dashboard?success=true&dev_mode=true`,
        dev_mode: true 
      })
    }

    // Production mode: Use actual Stripe
    if (!stripe) {
      return NextResponse.json(
        { error: 'Stripe is not configured' },
        { status: 500 }
      )
    }
    
    // Get or create Stripe customer
    let customer = await getStripeCustomer(user.email)
    
    if (!customer) {
      customer = await createStripeCustomer(user.email, user.name || undefined)
    }
    
    // Create checkout session
    const checkoutSession = await stripe.checkout.sessions.create({
      customer: customer.id,
      payment_method_types: ['card'],
      line_items: [
        {
          price: process.env.STRIPE_PRICE_ID!,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${process.env.NEXTAUTH_URL}/dashboard?success=true`,
      cancel_url: `${process.env.NEXTAUTH_URL}/dashboard?canceled=true`,
      metadata: {
        userId: user.id,
      },
    })
    
    // Update or create subscription record
    await prisma.subscription.upsert({
      where: { userId: user.id },
      update: {
        stripeCustomerId: customer.id,
      },
      create: {
        userId: user.id,
        stripeCustomerId: customer.id,
        status: 'INACTIVE',
      },
    })
    
    return NextResponse.json({ url: checkoutSession.url })
  } catch (error) {
    console.error('Checkout error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}