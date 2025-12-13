-- Wishlist, Loyalty, and Food Tables for PostgreSQL/Supabase

-- Create ENUM types
CREATE TYPE loyalty_tier AS ENUM ('BRONZE', 'SILVER', 'GOLD', 'PLATINUM');
CREATE TYPE loyalty_points_type AS ENUM ('EARNED', 'REDEEMED', 'EXPIRED');
CREATE TYPE food_category AS ENUM ('POPCORN', 'DRINKS', 'SNACKS', 'COMBO');
CREATE TYPE food_order_status AS ENUM ('PENDING', 'PREPARING', 'READY', 'COLLECTED');
CREATE TYPE refund_status_type AS ENUM ('NONE', 'PENDING', 'PROCESSED', 'FAILED');
CREATE TYPE payment_method_type AS ENUM ('RAZORPAY', 'STRIPE', 'WALLET');
CREATE TYPE refund_transaction_status AS ENUM ('PENDING', 'PROCESSED', 'FAILED');
CREATE TYPE wallet_transaction_type AS ENUM ('CREDIT', 'DEBIT');

-- Wishlist Table
CREATE TABLE IF NOT EXISTS "Wishlist" (
  id VARCHAR(191) PRIMARY KEY,
  "userId" VARCHAR(191) NOT NULL,
  "movieId" VARCHAR(191) NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE ("userId", "movieId"),
  CONSTRAINT "Wishlist_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"(id) ON DELETE CASCADE,
  CONSTRAINT "Wishlist_movieId_fkey" FOREIGN KEY ("movieId") REFERENCES "Movie"(id) ON DELETE CASCADE
);

-- Loyalty Points Table
CREATE TABLE IF NOT EXISTS "LoyaltyPoints" (
  id VARCHAR(191) PRIMARY KEY,
  "userId" VARCHAR(191) NOT NULL UNIQUE,
  points INTEGER NOT NULL DEFAULT 0,
  "totalEarned" INTEGER NOT NULL DEFAULT 0,
  "totalRedeemed" INTEGER NOT NULL DEFAULT 0,
  tier loyalty_tier NOT NULL DEFAULT 'BRONZE',
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "LoyaltyPoints_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"(id) ON DELETE CASCADE
);

-- Loyalty Points History
CREATE TABLE IF NOT EXISTS "LoyaltyPointsHistory" (
  id VARCHAR(191) PRIMARY KEY,
  "userId" VARCHAR(191) NOT NULL,
  points INTEGER NOT NULL,
  type loyalty_points_type NOT NULL,
  description VARCHAR(500),
  "bookingId" VARCHAR(191),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "LoyaltyPointsHistory_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"(id) ON DELETE CASCADE,
  CONSTRAINT "LoyaltyPointsHistory_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "Booking"(id) ON DELETE SET NULL
);

-- Food Items Table
CREATE TABLE IF NOT EXISTS "FoodItem" (
  id VARCHAR(191) PRIMARY KEY,
  name VARCHAR(191) NOT NULL,
  description TEXT,
  price INTEGER NOT NULL,
  category food_category NOT NULL,
  "imageUrl" VARCHAR(500),
  available BOOLEAN NOT NULL DEFAULT TRUE,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Food Orders Table
CREATE TABLE IF NOT EXISTS "FoodOrder" (
  id VARCHAR(191) PRIMARY KEY,
  "bookingId" VARCHAR(191) NOT NULL,
  "totalAmount" INTEGER NOT NULL,
  status food_order_status NOT NULL DEFAULT 'PENDING',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "FoodOrder_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "Booking"(id) ON DELETE CASCADE
);

-- Food Order Items
CREATE TABLE IF NOT EXISTS "FoodOrderItem" (
  id VARCHAR(191) PRIMARY KEY,
  "foodOrderId" VARCHAR(191) NOT NULL,
  "foodItemId" VARCHAR(191) NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  price INTEGER NOT NULL,
  CONSTRAINT "FoodOrderItem_foodOrderId_fkey" FOREIGN KEY ("foodOrderId") REFERENCES "FoodOrder"(id) ON DELETE CASCADE,
  CONSTRAINT "FoodOrderItem_foodItemId_fkey" FOREIGN KEY ("foodItemId") REFERENCES "FoodItem"(id) ON DELETE CASCADE
);

-- Update Booking table refund fields (if not already added)
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'Booking' AND column_name = 'refundStatus') THEN
    ALTER TABLE "Booking" ADD COLUMN "refundStatus" refund_status_type NOT NULL DEFAULT 'NONE';
  END IF;
END $$;

-- CancellationRequest Table
CREATE TABLE IF NOT EXISTS "CancellationRequest" (
  id VARCHAR(191) PRIMARY KEY,
  "bookingId" VARCHAR(191) NOT NULL,
  "userId" VARCHAR(191) NOT NULL,
  reason VARCHAR(500),
  "requestedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  status VARCHAR(50) NOT NULL DEFAULT 'PENDING',
  "processedAt" TIMESTAMP(3),
  CONSTRAINT "CancellationRequest_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "Booking"(id) ON DELETE CASCADE,
  CONSTRAINT "CancellationRequest_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"(id) ON DELETE CASCADE
);

-- RefundTransaction Table
CREATE TABLE IF NOT EXISTS "RefundTransaction" (
  id VARCHAR(191) PRIMARY KEY,
  "bookingId" VARCHAR(191) NOT NULL,
  "userId" VARCHAR(191) NOT NULL,
  amount INTEGER NOT NULL,
  "paymentMethod" payment_method_type NOT NULL,
  status refund_transaction_status NOT NULL DEFAULT 'PENDING',
  "transactionId" VARCHAR(191),
  "processedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "RefundTransaction_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "Booking"(id) ON DELETE CASCADE,
  CONSTRAINT "RefundTransaction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"(id) ON DELETE CASCADE
);

-- UserWallet Table
CREATE TABLE IF NOT EXISTS "UserWallet" (
  id VARCHAR(191) PRIMARY KEY,
  "userId" VARCHAR(191) NOT NULL UNIQUE,
  balance INTEGER NOT NULL DEFAULT 0,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "UserWallet_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"(id) ON DELETE CASCADE
);

-- WalletTransaction Table
CREATE TABLE IF NOT EXISTS "WalletTransaction" (
  id VARCHAR(191) PRIMARY KEY,
  "walletId" VARCHAR(191) NOT NULL,
  "userId" VARCHAR(191) NOT NULL,
  amount INTEGER NOT NULL,
  type wallet_transaction_type NOT NULL,
  description VARCHAR(500),
  "bookingId" VARCHAR(191),
  "refundTransactionId" VARCHAR(191),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "WalletTransaction_walletId_fkey" FOREIGN KEY ("walletId") REFERENCES "UserWallet"(id) ON DELETE CASCADE,
  CONSTRAINT "WalletTransaction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"(id) ON DELETE CASCADE,
  CONSTRAINT "WalletTransaction_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "Booking"(id) ON DELETE SET NULL
);

