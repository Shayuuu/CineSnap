-- Neon PostgreSQL Schema for CineSnap
-- Run this in your Neon SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- User table
CREATE TABLE IF NOT EXISTS "User" (
  id VARCHAR(191) PRIMARY KEY,
  email VARCHAR(191) NOT NULL UNIQUE,
  name VARCHAR(191),
  role VARCHAR(20) NOT NULL DEFAULT 'USER' CHECK (role IN ('USER', 'ADMIN')),
  password VARCHAR(255),
  "passwordHash" VARCHAR(255),
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_user_email ON "User"(email);

-- Movie table
CREATE TABLE IF NOT EXISTS "Movie" (
  id VARCHAR(191) PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  "posterUrl" TEXT,
  duration INTEGER DEFAULT 120,
  genre VARCHAR(100),
  "releaseDate" DATE,
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Theater table
CREATE TABLE IF NOT EXISTS "Theater" (
  id VARCHAR(191) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  location VARCHAR(255) NOT NULL,
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Screen table
CREATE TABLE IF NOT EXISTS "Screen" (
  id VARCHAR(191) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  "theaterId" VARCHAR(191) NOT NULL,
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY ("theaterId") REFERENCES "Theater"(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_screen_theater ON "Screen"("theaterId");

-- Seat table
CREATE TABLE IF NOT EXISTS "Seat" (
  id VARCHAR(191) PRIMARY KEY,
  "row" VARCHAR(10) NOT NULL,
  "number" INTEGER NOT NULL,
  type VARCHAR(20) DEFAULT 'STANDARD' CHECK (type IN ('STANDARD', 'PREMIUM', 'VIP')),
  "screenId" VARCHAR(191) NOT NULL,
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY ("screenId") REFERENCES "Screen"(id) ON DELETE CASCADE,
  UNIQUE ("screenId", "row", "number")
);

CREATE INDEX IF NOT EXISTS idx_seat_screen ON "Seat"("screenId");

-- Showtime table
CREATE TABLE IF NOT EXISTS "Showtime" (
  id VARCHAR(191) PRIMARY KEY,
  "movieId" VARCHAR(191) NOT NULL,
  "screenId" VARCHAR(191) NOT NULL,
  "startTime" TIMESTAMP NOT NULL,
  price INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY ("movieId") REFERENCES "Movie"(id) ON DELETE CASCADE,
  FOREIGN KEY ("screenId") REFERENCES "Screen"(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_showtime_movie ON "Showtime"("movieId");
CREATE INDEX IF NOT EXISTS idx_showtime_screen ON "Showtime"("screenId");
CREATE INDEX IF NOT EXISTS idx_showtime_start ON "Showtime"("startTime");

-- Booking table
CREATE TABLE IF NOT EXISTS "Booking" (
  id VARCHAR(191) PRIMARY KEY,
  "userId" VARCHAR(191) NOT NULL,
  "showtimeId" VARCHAR(191) NOT NULL,
  "totalAmount" INTEGER NOT NULL DEFAULT 0,
  status VARCHAR(20) DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'CONFIRMED', 'CANCELLED')),
  "razorpayOrderId" VARCHAR(255),
  "razorpayPaymentId" VARCHAR(255),
  "loyaltyPointsEarned" INTEGER DEFAULT 0,
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY ("userId") REFERENCES "User"(id) ON DELETE CASCADE,
  FOREIGN KEY ("showtimeId") REFERENCES "Showtime"(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_booking_user ON "Booking"("userId");
CREATE INDEX IF NOT EXISTS idx_booking_showtime ON "Booking"("showtimeId");
CREATE INDEX IF NOT EXISTS idx_booking_status ON "Booking"(status);

-- BookingSeats junction table (many-to-many)
CREATE TABLE IF NOT EXISTS "_BookingSeats" (
  "A" VARCHAR(191) NOT NULL,
  "B" VARCHAR(191) NOT NULL,
  PRIMARY KEY ("A", "B"),
  FOREIGN KEY ("A") REFERENCES "Booking"(id) ON DELETE CASCADE,
  FOREIGN KEY ("B") REFERENCES "Seat"(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_bookingseats_booking ON "_BookingSeats"("A");
CREATE INDEX IF NOT EXISTS idx_bookingseats_seat ON "_BookingSeats"("B");

-- SeatLock table
CREATE TABLE IF NOT EXISTS "SeatLock" (
  id VARCHAR(191) PRIMARY KEY,
  "showtimeId" VARCHAR(191) NOT NULL,
  "seatId" VARCHAR(191) NOT NULL,
  "expiresAt" TIMESTAMP NOT NULL,
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY ("showtimeId") REFERENCES "Showtime"(id) ON DELETE CASCADE,
  FOREIGN KEY ("seatId") REFERENCES "Seat"(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_seatlock_showtime ON "SeatLock"("showtimeId");
CREATE INDEX IF NOT EXISTS idx_seatlock_seat ON "SeatLock"("seatId");
CREATE INDEX IF NOT EXISTS idx_seatlock_expires ON "SeatLock"("expiresAt");

-- Review table (optional)
CREATE TABLE IF NOT EXISTS "Review" (
  id VARCHAR(191) PRIMARY KEY,
  "movieId" VARCHAR(191) NOT NULL,
  "userId" VARCHAR(191) NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY ("movieId") REFERENCES "Movie"(id) ON DELETE CASCADE,
  FOREIGN KEY ("userId") REFERENCES "User"(id) ON DELETE CASCADE,
  UNIQUE ("movieId", "userId")
);

CREATE INDEX IF NOT EXISTS idx_review_movie ON "Review"("movieId");
CREATE INDEX IF NOT EXISTS idx_review_user ON "Review"("userId");

-- FoodItem table (optional)
CREATE TABLE IF NOT EXISTS "FoodItem" (
  id VARCHAR(191) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  price INTEGER NOT NULL DEFAULT 0,
  category VARCHAR(100),
  imageUrl TEXT,
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_fooditem_category ON "FoodItem"(category);

-- FoodOrder table (optional)
CREATE TABLE IF NOT EXISTS "FoodOrder" (
  id VARCHAR(191) PRIMARY KEY,
  "bookingId" VARCHAR(191) NOT NULL,
  "totalAmount" INTEGER NOT NULL DEFAULT 0,
  status VARCHAR(20) DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'CONFIRMED', 'CANCELLED')),
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY ("bookingId") REFERENCES "Booking"(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_foodorder_booking ON "FoodOrder"("bookingId");

-- FoodOrderItems junction table
CREATE TABLE IF NOT EXISTS "_FoodOrderItems" (
  "A" VARCHAR(191) NOT NULL,
  "B" VARCHAR(191) NOT NULL,
  quantity INTEGER DEFAULT 1,
  PRIMARY KEY ("A", "B"),
  FOREIGN KEY ("A") REFERENCES "FoodOrder"(id) ON DELETE CASCADE,
  FOREIGN KEY ("B") REFERENCES "FoodItem"(id) ON DELETE CASCADE
);

-- GroupBooking table (optional)
CREATE TABLE IF NOT EXISTS "GroupBooking" (
  id VARCHAR(191) PRIMARY KEY,
  "showtimeId" VARCHAR(191) NOT NULL,
  "createdById" VARCHAR(191) NOT NULL,
  name VARCHAR(255) NOT NULL,
  "joinToken" VARCHAR(255) UNIQUE NOT NULL,
  "maxMembers" INTEGER DEFAULT 10,
  status VARCHAR(20) DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'COMPLETED', 'CANCELLED')),
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY ("showtimeId") REFERENCES "Showtime"(id) ON DELETE CASCADE,
  FOREIGN KEY ("createdById") REFERENCES "User"(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_groupbooking_showtime ON "GroupBooking"("showtimeId");
CREATE INDEX IF NOT EXISTS idx_groupbooking_token ON "GroupBooking"("joinToken");

-- GroupMember table
CREATE TABLE IF NOT EXISTS "GroupMember" (
  id VARCHAR(191) PRIMARY KEY,
  "groupId" VARCHAR(191) NOT NULL,
  "userId" VARCHAR(191) NOT NULL,
  role VARCHAR(20) DEFAULT 'MEMBER' CHECK (role IN ('CREATOR', 'MEMBER')),
  "joinedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY ("groupId") REFERENCES "GroupBooking"(id) ON DELETE CASCADE,
  FOREIGN KEY ("userId") REFERENCES "User"(id) ON DELETE CASCADE,
  UNIQUE ("groupId", "userId")
);

CREATE INDEX IF NOT EXISTS idx_groupmember_group ON "GroupMember"("groupId");
CREATE INDEX IF NOT EXISTS idx_groupmember_user ON "GroupMember"("userId");

