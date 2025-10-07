import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { prisma } from '@/lib/prisma'
import Stripe from 'stripe'

export async function POST(request: NextRequest) {
  const body = await request.text()
  const signature = request.headers.get('stripe-signature')

  if (!signature) {
    return NextResponse.json(
      { error: 'No signature found' },
      { status: 400 }
    )
  }

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (error) {
    console.error('Webhook signature verification failed:', error)
    return NextResponse.json(
      { error: 'Invalid signature' },
      { status: 400 }
    )
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        const userId = session.metadata?.userId

        if (!userId) {
          console.error('No userId in session metadata')
          return NextResponse.json({ error: 'No userId' }, { status: 400 })
        }

        // Get the subscription from Stripe
        const stripeSubscription = await stripe.subscriptions.retrieve(
          session.subscription as string
        )

        await prisma.subscription.upsert({
          where: { userId },
          update: {
            stripeSubscriptionId: stripeSubscription.id,
            stripeCustomerId: stripeSubscription.customer as string,
            status: 'ACTIVE',
            currentPeriodStart: new Date(((stripeSubscription as unknown) as Record<string, unknown>).current_period_start as number * 1000),
            currentPeriodEnd: new Date(((stripeSubscription as unknown) as Record<string, unknown>).current_period_end as number * 1000),
            stripePriceId: stripeSubscription.items.data[0]?.price.id,
          },
          create: {
            userId,
            stripeSubscriptionId: stripeSubscription.id,
            stripeCustomerId: stripeSubscription.customer as string,
            status: 'ACTIVE',
            currentPeriodStart: new Date(((stripeSubscription as unknown) as Record<string, unknown>).current_period_start as number * 1000),
            currentPeriodEnd: new Date(((stripeSubscription as unknown) as Record<string, unknown>).current_period_end as number * 1000),
            stripePriceId: stripeSubscription.items.data[0]?.price.id,
          },
        })

        console.log(`Subscription activated for user ${userId}`)
        break
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription
        const customerId = subscription.customer as string

        // Find user by Stripe customer ID
        const userSubscription = await prisma.subscription.findUnique({
          where: { stripeCustomerId: customerId }
        })

        if (!userSubscription) {
          console.error('No subscription found for customer:', customerId)
          return NextResponse.json({ error: 'Subscription not found' }, { status: 404 })
        }

        let status: 'ACTIVE' | 'INACTIVE' | 'PAST_DUE' | 'CANCELED' | 'UNPAID' = 'INACTIVE'
        
        switch (subscription.status) {
          case 'active':
            status = 'ACTIVE'
            break
          case 'past_due':
            status = 'PAST_DUE'
            break
          case 'canceled':
            status = 'CANCELED'
            break
          case 'unpaid':
            status = 'UNPAID'
            break
          default:
            status = 'INACTIVE'
        }

        await prisma.subscription.update({
          where: { stripeCustomerId: customerId },
          data: {
            status,
            currentPeriodStart: new Date(((subscription as unknown) as Record<string, unknown>).current_period_start as number * 1000),
            currentPeriodEnd: new Date(((subscription as unknown) as Record<string, unknown>).current_period_end as number * 1000),
          },
        })

        console.log(`Subscription updated for customer ${customerId}: ${status}`)
        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription
        const customerId = subscription.customer as string

        await prisma.subscription.updateMany({
          where: { stripeCustomerId: customerId },
          data: { status: 'CANCELED' },
        })

        console.log(`Subscription canceled for customer ${customerId}`)
        break
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice
        const customerId = invoice.customer as string

        await prisma.subscription.updateMany({
          where: { stripeCustomerId: customerId },
          data: { status: 'PAST_DUE' },
        })

        console.log(`Payment failed for customer ${customerId}`)
        break
      }

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Webhook processing error:', error)
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    )
  }
}