-- =====================================================
-- CineSnap Complete Supabase Database Setup Script
-- =====================================================
-- Run this entire script in Supabase SQL Editor
-- This script creates all tables, types, indexes, and triggers
-- =====================================================

-- =====================================================
-- STEP 1: Create ENUM Types
-- =====================================================

-- Role type for users
DO $$ BEGIN
    CREATE TYPE role_type AS ENUM ('USER', 'ADMIN');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Seat type
DO $$ BEGIN
    CREATE TYPE seat_type AS ENUM ('STANDARD', 'PREMIUM', 'VIP');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Booking status
DO $$ BEGIN
    CREATE TYPE booking_status AS ENUM ('PENDING', 'CONFIRMED', 'CANCELLED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Loyalty tier
DO $$ BEGIN
    CREATE TYPE loyalty_tier AS ENUM ('BRONZE', 'SILVER', 'GOLD', 'PLATINUM');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Loyalty points type
DO $$ BEGIN
    CREATE TYPE loyalty_points_type AS ENUM ('EARNED', 'REDEEMED', 'EXPIRED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Food category
DO $$ BEGIN
    CREATE TYPE food_category AS ENUM ('POPCORN', 'DRINKS', 'SNACKS', 'COMBO');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Food order status
DO $$ BEGIN
    CREATE TYPE food_order_status AS ENUM ('PENDING', 'PREPARING', 'READY', 'COLLECTED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Refund status
DO $$ BEGIN
    CREATE TYPE refund_status_type AS ENUM ('NONE', 'PENDING', 'PROCESSED', 'FAILED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Payment method
DO $$ BEGIN
    CREATE TYPE payment_method_type AS ENUM ('RAZORPAY', 'STRIPE', 'WALLET');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Refund transaction status
DO $$ BEGIN
    CREATE TYPE refund_transaction_status AS ENUM ('PENDING', 'PROCESSED', 'FAILED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Wallet transaction type
DO $$ BEGIN
    CREATE TYPE wallet_transaction_type AS ENUM ('CREDIT', 'DEBIT');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- =====================================================
-- STEP 2: Create Core Tables
-- =====================================================

-- User table
CREATE TABLE IF NOT EXISTS "User" (
  id VARCHAR(191) PRIMARY KEY,
  email VARCHAR(191) NOT NULL UNIQUE,
  name VARCHAR(191),
  role role_type NOT NULL DEFAULT 'USER'
);

-- Movie table
CREATE TABLE IF NOT EXISTS "Movie" (
  id VARCHAR(191) PRIMARY KEY,
  title VARCHAR(191) NOT NULL,
  "posterUrl" TEXT NOT NULL,
  duration INTEGER NOT NULL,
  genre VARCHAR(191) NOT NULL,
  "releaseDate" TIMESTAMP(3) NOT NULL,
  "trailerUrl" VARCHAR(500)
);

-- Theater table
CREATE TABLE IF NOT EXISTS "Theater" (
  id VARCHAR(191) PRIMARY KEY,
  name VARCHAR(191) NOT NULL,
  location VARCHAR(191) NOT NULL
);

-- Screen table
CREATE TABLE IF NOT EXISTS "Screen" (
  id VARCHAR(191) PRIMARY KEY,
  name VARCHAR(191) NOT NULL,
  "theaterId" VARCHAR(191) NOT NULL,
  CONSTRAINT "Screen_theaterId_fkey"
    FOREIGN KEY ("theaterId") REFERENCES "Theater"(id) ON DELETE CASCADE
);

-- Seat table
CREATE TABLE IF NOT EXISTS "Seat" (
  id VARCHAR(191) PRIMARY KEY,
  row VARCHAR(191) NOT NULL,
  number INTEGER NOT NULL,
  type seat_type NOT NULL DEFAULT 'STANDARD',
  "screenId" VARCHAR(191) NOT NULL,
  CONSTRAINT "Seat_screenId_fkey"
    FOREIGN KEY ("screenId") REFERENCES "Screen"(id) ON DELETE CASCADE
);

-- Showtime table
CREATE TABLE IF NOT EXISTS "Showtime" (
  id VARCHAR(191) PRIMARY KEY,
  "movieId" VARCHAR(191) NOT NULL,
  "screenId" VARCHAR(191) NOT NULL,
  "startTime" TIMESTAMP(3) NOT NULL,
  price INTEGER NOT NULL,
  CONSTRAINT "Showtime_movieId_fkey"
    FOREIGN KEY ("movieId") REFERENCES "Movie"(id) ON DELETE CASCADE,
  CONSTRAINT "Showtime_screenId_fkey"
    FOREIGN KEY ("screenId") REFERENCES "Screen"(id) ON DELETE CASCADE
);

-- Booking table
CREATE TABLE IF NOT EXISTS "Booking" (
  id VARCHAR(191) PRIMARY KEY,
  "userId" VARCHAR(191) NOT NULL,
  "showtimeId" VARCHAR(191) NOT NULL,
  "totalAmount" INTEGER NOT NULL,
  status booking_status NOT NULL DEFAULT 'PENDING',
  "razorpayOrderId" VARCHAR(191),
  "razorpayPaymentId" VARCHAR(191),
  "stripeSessionId" VARCHAR(191) UNIQUE,
  "loyaltyPointsEarned" INTEGER NOT NULL DEFAULT 0,
  "cancelledAt" TIMESTAMP(3),
  "cancellationReason" VARCHAR(500),
  "refundAmount" INTEGER NOT NULL DEFAULT 0,
  "refundStatus" VARCHAR(50) NOT NULL DEFAULT 'NONE',
  "refundTransactionId" VARCHAR(191),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Booking_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "User"(id) ON DELETE CASCADE,
  CONSTRAINT "Booking_showtimeId_fkey"
    FOREIGN KEY ("showtimeId") REFERENCES "Showtime"(id) ON DELETE CASCADE
);

-- Booking Seats junction table
CREATE TABLE IF NOT EXISTS "_BookingSeats" (
  "A" VARCHAR(191) NOT NULL,
  "B" VARCHAR(191) NOT NULL,
  PRIMARY KEY ("A", "B"),
  CONSTRAINT "_BookingSeats_A_fkey"
    FOREIGN KEY ("A") REFERENCES "Booking"(id) ON DELETE CASCADE,
  CONSTRAINT "_BookingSeats_B_fkey"
    FOREIGN KEY ("B") REFERENCES "Seat"(id) ON DELETE CASCADE
);

-- SeatLock table
CREATE TABLE IF NOT EXISTS "SeatLock" (
  id VARCHAR(191) PRIMARY KEY,
  "showtimeId" VARCHAR(191) NOT NULL,
  "seatId" VARCHAR(191) NOT NULL,
  "expiresAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "SeatLock_showtimeId_fkey"
    FOREIGN KEY ("showtimeId") REFERENCES "Showtime"(id) ON DELETE CASCADE,
  CONSTRAINT "SeatLock_seatId_fkey"
    FOREIGN KEY ("seatId") REFERENCES "Seat"(id) ON DELETE CASCADE
);

-- =====================================================
-- STEP 3: Reviews Table
-- =====================================================

CREATE TABLE IF NOT EXISTS "Review" (
  id VARCHAR(191) PRIMARY KEY,
  "movieId" VARCHAR(191) NOT NULL,
  "userId" VARCHAR(191) NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  "reviewText" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE ("userId", "movieId"),
  CONSTRAINT "Review_movieId_fkey" FOREIGN KEY ("movieId") REFERENCES "Movie"(id) ON DELETE CASCADE,
  CONSTRAINT "Review_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"(id) ON DELETE CASCADE
);

-- =====================================================
-- STEP 4: Group Booking Tables
-- =====================================================

CREATE TABLE IF NOT EXISTS "BookingGroup" (
  id VARCHAR(191) PRIMARY KEY,
  name VARCHAR(191) NOT NULL,
  "showtimeId" VARCHAR(191) NOT NULL,
  "createdBy" VARCHAR(191) NOT NULL,
  "joinToken" VARCHAR(191) UNIQUE,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "BookingGroup_showtimeId_fkey" FOREIGN KEY ("showtimeId") REFERENCES "Showtime"(id) ON DELETE CASCADE,
  CONSTRAINT "BookingGroup_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS "GroupMember" (
  id VARCHAR(191) PRIMARY KEY,
  "groupId" VARCHAR(191) NOT NULL,
  "userId" VARCHAR(191) NOT NULL,
  "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE ("groupId", "userId"),
  CONSTRAINT "GroupMember_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "BookingGroup"(id) ON DELETE CASCADE,
  CONSTRAINT "GroupMember_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS "GroupMessage" (
  id VARCHAR(191) PRIMARY KEY,
  "groupId" VARCHAR(191) NOT NULL,
  "userId" VARCHAR(191) NOT NULL,
  message TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "GroupMessage_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "BookingGroup"(id) ON DELETE CASCADE,
  CONSTRAINT "GroupMessage_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS "GroupPoll" (
  id VARCHAR(191) PRIMARY KEY,
  "groupId" VARCHAR(191) NOT NULL,
  "createdBy" VARCHAR(191) NOT NULL,
  question TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "GroupPoll_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "BookingGroup"(id) ON DELETE CASCADE,
  CONSTRAINT "GroupPoll_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS "GroupPollOption" (
  id VARCHAR(191) PRIMARY KEY,
  "pollId" VARCHAR(191) NOT NULL,
  option TEXT NOT NULL,
  CONSTRAINT "GroupPollOption_pollId_fkey" FOREIGN KEY ("pollId") REFERENCES "GroupPoll"(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS "GroupPollVote" (
  id VARCHAR(191) PRIMARY KEY,
  "pollId" VARCHAR(191) NOT NULL,
  "optionId" VARCHAR(191) NOT NULL,
  "userId" VARCHAR(191) NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE ("pollId", "userId"),
  CONSTRAINT "GroupPollVote_pollId_fkey" FOREIGN KEY ("pollId") REFERENCES "GroupPoll"(id) ON DELETE CASCADE,
  CONSTRAINT "GroupPollVote_optionId_fkey" FOREIGN KEY ("optionId") REFERENCES "GroupPollOption"(id) ON DELETE CASCADE,
  CONSTRAINT "GroupPollVote_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"(id) ON DELETE CASCADE
);

-- =====================================================
-- STEP 5: Wishlist, Loyalty, Food Tables
-- =====================================================

CREATE TABLE IF NOT EXISTS "Wishlist" (
  id VARCHAR(191) PRIMARY KEY,
  "userId" VARCHAR(191) NOT NULL,
  "movieId" VARCHAR(191) NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE ("userId", "movieId"),
  CONSTRAINT "Wishlist_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"(id) ON DELETE CASCADE,
  CONSTRAINT "Wishlist_movieId_fkey" FOREIGN KEY ("movieId") REFERENCES "Movie"(id) ON DELETE CASCADE
);

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

CREATE TABLE IF NOT EXISTS "FoodOrder" (
  id VARCHAR(191) PRIMARY KEY,
  "bookingId" VARCHAR(191) NOT NULL,
  "totalAmount" INTEGER NOT NULL,
  status food_order_status NOT NULL DEFAULT 'PENDING',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "FoodOrder_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "Booking"(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS "FoodOrderItem" (
  id VARCHAR(191) PRIMARY KEY,
  "foodOrderId" VARCHAR(191) NOT NULL,
  "foodItemId" VARCHAR(191) NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  price INTEGER NOT NULL,
  CONSTRAINT "FoodOrderItem_foodOrderId_fkey" FOREIGN KEY ("foodOrderId") REFERENCES "FoodOrder"(id) ON DELETE CASCADE,
  CONSTRAINT "FoodOrderItem_foodItemId_fkey" FOREIGN KEY ("foodItemId") REFERENCES "FoodItem"(id) ON DELETE CASCADE
);

-- =====================================================
-- STEP 6: Cancellation & Refunds Tables
-- =====================================================

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

CREATE TABLE IF NOT EXISTS "UserWallet" (
  id VARCHAR(191) PRIMARY KEY,
  "userId" VARCHAR(191) NOT NULL UNIQUE,
  balance INTEGER NOT NULL DEFAULT 0,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "UserWallet_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"(id) ON DELETE CASCADE
);

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

-- =====================================================
-- STEP 7: Create Indexes for Performance
-- =====================================================

CREATE INDEX IF NOT EXISTS "idx_showtime_movie" ON "Showtime"("movieId");
CREATE INDEX IF NOT EXISTS "idx_showtime_screen" ON "Showtime"("screenId");
CREATE INDEX IF NOT EXISTS "idx_booking_user" ON "Booking"("userId");
CREATE INDEX IF NOT EXISTS "idx_booking_showtime" ON "Booking"("showtimeId");
CREATE INDEX IF NOT EXISTS "idx_seatlock_showtime_seat" ON "SeatLock"("showtimeId", "seatId");
CREATE INDEX IF NOT EXISTS "idx_review_movie" ON "Review"("movieId");
CREATE INDEX IF NOT EXISTS "idx_review_user" ON "Review"("userId");
CREATE INDEX IF NOT EXISTS "idx_review_created" ON "Review"("createdAt" DESC);
CREATE INDEX IF NOT EXISTS "idx_group_member_group" ON "GroupMember"("groupId");
CREATE INDEX IF NOT EXISTS "idx_group_member_user" ON "GroupMember"("userId");
CREATE INDEX IF NOT EXISTS "idx_group_message_group" ON "GroupMessage"("groupId");
CREATE INDEX IF NOT EXISTS "idx_group_poll_group" ON "GroupPoll"("groupId");
CREATE INDEX IF NOT EXISTS "idx_poll_vote_poll" ON "GroupPollVote"("pollId");

-- =====================================================
-- STEP 8: Create Triggers
-- =====================================================

-- Trigger to update updatedAt for Review table
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW."updatedAt" = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_review_updated_at ON "Review";
CREATE TRIGGER update_review_updated_at BEFORE UPDATE ON "Review"
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Trigger to update updatedAt for LoyaltyPoints
DROP TRIGGER IF EXISTS update_loyalty_updated_at ON "LoyaltyPoints";
CREATE TRIGGER update_loyalty_updated_at BEFORE UPDATE ON "LoyaltyPoints"
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Trigger to update updatedAt for UserWallet
DROP TRIGGER IF EXISTS update_wallet_updated_at ON "UserWallet";
CREATE TRIGGER update_wallet_updated_at BEFORE UPDATE ON "UserWallet"
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- STEP 9: Disable Row Level Security (RLS) for Development
-- =====================================================
-- Uncomment these lines if you want to disable RLS
-- For production, you should enable RLS and create proper policies

/*
ALTER TABLE "User" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "Movie" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "Theater" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "Screen" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "Seat" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "Showtime" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "Booking" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "_BookingSeats" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "SeatLock" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "Review" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "BookingGroup" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "GroupMember" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "GroupMessage" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "GroupPoll" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "GroupPollOption" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "GroupPollVote" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "Wishlist" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "LoyaltyPoints" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "LoyaltyPointsHistory" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "FoodItem" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "FoodOrder" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "FoodOrderItem" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "CancellationRequest" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "RefundTransaction" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "UserWallet" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "WalletTransaction" DISABLE ROW LEVEL SECURITY;
*/

-- =====================================================
-- STEP 10: Insert Sample Data (Optional)
-- =====================================================
-- Uncomment and run this section if you want sample data

/*
-- Sample Theaters
INSERT INTO "Theater" (id, name, location) VALUES
  ('theater1', 'PVR Cinemas', 'Mumbai'),
  ('theater2', 'INOX', 'Delhi'),
  ('theater3', 'Cinepolis', 'Bangalore'),
  ('theater4', 'PVR Cinemas', 'Pune'),
  ('theater5', 'INOX', 'Hyderabad')
ON CONFLICT (id) DO NOTHING;

-- Sample Screens
INSERT INTO "Screen" (id, name, "theaterId") VALUES
  ('screen1', 'Screen 1', 'theater1'),
  ('screen2', 'Screen 2', 'theater1'),
  ('screen3', 'Screen 1', 'theater2'),
  ('screen4', 'Screen 2', 'theater2'),
  ('screen5', 'Screen 1', 'theater3')
ON CONFLICT (id) DO NOTHING;

-- Sample Seats for Screen 1 (A-H rows, 1-15 seats per row)
INSERT INTO "Seat" (id, row, number, type, "screenId")
SELECT 
  'seat_' || row || '_' || num,
  row,
  num,
  CASE 
    WHEN num <= 5 THEN 'VIP'::seat_type
    WHEN num <= 10 THEN 'PREMIUM'::seat_type
    ELSE 'STANDARD'::seat_type
  END,
  'screen1'
FROM (
  SELECT row, num
  FROM (SELECT unnest(ARRAY['A','B','C','D','E','F','G','H']) as row) r
  CROSS JOIN generate_series(1, 15) as num
) seats
ON CONFLICT (id) DO NOTHING;

-- Sample Seats for Screen 2
INSERT INTO "Seat" (id, row, number, type, "screenId")
SELECT 
  'seat2_' || row || '_' || num,
  row,
  num,
  CASE 
    WHEN num <= 5 THEN 'VIP'::seat_type
    WHEN num <= 10 THEN 'PREMIUM'::seat_type
    ELSE 'STANDARD'::seat_type
  END,
  'screen2'
FROM (
  SELECT row, num
  FROM (SELECT unnest(ARRAY['A','B','C','D','E','F','G','H']) as row) r
  CROSS JOIN generate_series(1, 15) as num
) seats
ON CONFLICT (id) DO NOTHING;

-- Sample Food Items
INSERT INTO "FoodItem" (id, name, description, price, category, available) VALUES
  ('food1', 'Large Popcorn', 'Buttery popcorn, large size', 20000, 'POPCORN', true),
  ('food2', 'Medium Popcorn', 'Buttery popcorn, medium size', 15000, 'POPCORN', true),
  ('food3', 'Coca Cola', '500ml cold drink', 8000, 'DRINKS', true),
  ('food4', 'Pepsi', '500ml cold drink', 8000, 'DRINKS', true),
  ('food5', 'Nachos with Cheese', 'Crispy nachos with cheese dip', 18000, 'SNACKS', true),
  ('food6', 'Combo 1', 'Large Popcorn + 2 Cold Drinks', 35000, 'COMBO', true),
  ('food7', 'Combo 2', 'Medium Popcorn + 1 Cold Drink', 22000, 'COMBO', true),
  ('food8', 'Chocolate Bar', 'Premium chocolate bar', 12000, 'SNACKS', true)
ON CONFLICT (id) DO NOTHING;
*/

-- =====================================================
-- ✅ Setup Complete!
-- =====================================================
-- All tables, types, indexes, and triggers have been created.
-- Your Supabase database is ready to use!
-- 
-- Next steps:
-- 1. Update your DATABASE_URL in Vercel environment variables
-- 2. Test your application
-- 3. (Optional) Uncomment and run sample data section above
-- =====================================================

