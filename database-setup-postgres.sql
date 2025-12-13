-- CineSnap Database Setup for PostgreSQL/Supabase
-- Run this in Supabase SQL Editor

-- Create ENUM types
CREATE TYPE role_type AS ENUM ('USER', 'ADMIN');
CREATE TYPE seat_type AS ENUM ('STANDARD', 'PREMIUM', 'VIP');
CREATE TYPE booking_status AS ENUM ('PENDING', 'CONFIRMED', 'CANCELLED');

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

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS "idx_showtime_movie" ON "Showtime"("movieId");
CREATE INDEX IF NOT EXISTS "idx_showtime_screen" ON "Showtime"("screenId");
CREATE INDEX IF NOT EXISTS "idx_booking_user" ON "Booking"("userId");
CREATE INDEX IF NOT EXISTS "idx_booking_showtime" ON "Booking"("showtimeId");
CREATE INDEX IF NOT EXISTS "idx_seatlock_showtime_seat" ON "SeatLock"("showtimeId", "seatId");

