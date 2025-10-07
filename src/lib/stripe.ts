import Stripe from 'stripe'

// Only initialize Stripe if we have a secret key
const secretKey = process.env.STRIPE_SECRET_KEY
export const stripe = secretKey ? new Stripe(secretKey, {
  apiVersion: '2025-09-30.clover'
}) : null

export const getStripeCustomer = async (email: string) => {
  if (!stripe) {
    throw new Error('Stripe is not configured')
  }
  
  const customers = await stripe.customers.list({
    email,
    limit: 1
  })
  
  return customers.data[0]
}

export const createStripeCustomer = async (email: string, name?: string) => {
  if (!stripe) {
    throw new Error('Stripe is not configured')
  }
  
  return await stripe.customers.create({
    email,
    name
  })
}