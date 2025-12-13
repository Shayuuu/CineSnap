-- Add Stripe payment columns to Booking table
ALTER TABLE `Booking`
ADD COLUMN `stripeSessionId` VARCHAR(191) NULL AFTER `razorpayPaymentId`;

