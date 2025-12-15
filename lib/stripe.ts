import Stripe from 'stripe'

// Only initialize Stripe if secret key is provided
let stripeInstance: Stripe | null = null

if (process.env.STRIPE_SECRET_KEY) {
  stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2024-12-18.acacia',
  })
}

export const stripe = stripeInstance as Stripe


