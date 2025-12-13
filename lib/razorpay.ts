import Razorpay from 'razorpay'

// Only initialize Razorpay if keys are provided
let razorpayInstance: Razorpay | null = null

if (process.env.RAZORPAY_KEY && process.env.RAZORPAY_SECRET) {
  razorpayInstance = new Razorpay({
    key_id: process.env.RAZORPAY_KEY,
    key_secret: process.env.RAZORPAY_SECRET,
  })
}

export const razorpay = razorpayInstance as Razorpay

