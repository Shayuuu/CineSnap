-- =====================================================
-- CineSnap Complete MySQL Database Setup Script
-- =====================================================
-- Run this entire script in MySQL Workbench
-- This script creates all tables, indexes, and triggers
-- =====================================================

-- Create database if it doesn't exist
CREATE DATABASE IF NOT EXISTS bookmyseat CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE bookmyseat;

-- =====================================================
-- STEP 1: Create Tables
-- =====================================================

-- User table
CREATE TABLE IF NOT EXISTS User (
  id VARCHAR(191) PRIMARY KEY,
  email VARCHAR(191) NOT NULL UNIQUE,
  name VARCHAR(191),
  role ENUM('USER', 'ADMIN') NOT NULL DEFAULT 'USER',
  INDEX idx_user_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Movie table
CREATE TABLE IF NOT EXISTS Movie (
  id VARCHAR(191) PRIMARY KEY,
  title VARCHAR(191) NOT NULL,
  posterUrl TEXT NOT NULL,
  duration INT NOT NULL,
  genre VARCHAR(191) NOT NULL,
  releaseDate DATETIME NOT NULL,
  trailerUrl VARCHAR(500),
  INDEX idx_movie_release (releaseDate)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Theater table
CREATE TABLE IF NOT EXISTS Theater (
  id VARCHAR(191) PRIMARY KEY,
  name VARCHAR(191) NOT NULL,
  location VARCHAR(191) NOT NULL,
  INDEX idx_theater_location (location)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Screen table
CREATE TABLE IF NOT EXISTS Screen (
  id VARCHAR(191) PRIMARY KEY,
  name VARCHAR(191) NOT NULL,
  theaterId VARCHAR(191) NOT NULL,
  FOREIGN KEY (theaterId) REFERENCES Theater(id) ON DELETE CASCADE,
  INDEX idx_screen_theater (theaterId)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Seat table
CREATE TABLE IF NOT EXISTS Seat (
  id VARCHAR(191) PRIMARY KEY,
  row VARCHAR(191) NOT NULL,
  number INT NOT NULL,
  type ENUM('STANDARD', 'PREMIUM', 'VIP') NOT NULL DEFAULT 'STANDARD',
  screenId VARCHAR(191) NOT NULL,
  FOREIGN KEY (screenId) REFERENCES Screen(id) ON DELETE CASCADE,
  INDEX idx_seat_screen (screenId)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Showtime table
CREATE TABLE IF NOT EXISTS Showtime (
  id VARCHAR(191) PRIMARY KEY,
  movieId VARCHAR(191) NOT NULL,
  screenId VARCHAR(191) NOT NULL,
  startTime DATETIME NOT NULL,
  price INT NOT NULL,
  FOREIGN KEY (movieId) REFERENCES Movie(id) ON DELETE CASCADE,
  FOREIGN KEY (screenId) REFERENCES Screen(id) ON DELETE CASCADE,
  INDEX idx_showtime_movie (movieId),
  INDEX idx_showtime_screen (screenId),
  INDEX idx_showtime_start (startTime)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Booking table
CREATE TABLE IF NOT EXISTS Booking (
  id VARCHAR(191) PRIMARY KEY,
  userId VARCHAR(191) NOT NULL,
  showtimeId VARCHAR(191) NOT NULL,
  totalAmount INT NOT NULL,
  status ENUM('PENDING', 'CONFIRMED', 'CANCELLED') NOT NULL DEFAULT 'PENDING',
  razorpayOrderId VARCHAR(191),
  razorpayPaymentId VARCHAR(191),
  stripeSessionId VARCHAR(191) UNIQUE,
  loyaltyPointsEarned INT NOT NULL DEFAULT 0,
  cancelledAt DATETIME,
  cancellationReason VARCHAR(500),
  refundAmount INT NOT NULL DEFAULT 0,
  refundStatus ENUM('NONE', 'PENDING', 'PROCESSED', 'FAILED') NOT NULL DEFAULT 'NONE',
  refundTransactionId VARCHAR(191),
  createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (userId) REFERENCES User(id) ON DELETE CASCADE,
  FOREIGN KEY (showtimeId) REFERENCES Showtime(id) ON DELETE CASCADE,
  INDEX idx_booking_user (userId),
  INDEX idx_booking_showtime (showtimeId),
  INDEX idx_booking_status (status),
  INDEX idx_booking_created (createdAt)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Booking Seats junction table
CREATE TABLE IF NOT EXISTS _BookingSeats (
  A VARCHAR(191) NOT NULL,
  B VARCHAR(191) NOT NULL,
  PRIMARY KEY (A, B),
  FOREIGN KEY (A) REFERENCES Booking(id) ON DELETE CASCADE,
  FOREIGN KEY (B) REFERENCES Seat(id) ON DELETE CASCADE,
  INDEX idx_booking_seats_booking (A),
  INDEX idx_booking_seats_seat (B)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- SeatLock table
CREATE TABLE IF NOT EXISTS SeatLock (
  id VARCHAR(191) PRIMARY KEY,
  showtimeId VARCHAR(191) NOT NULL,
  seatId VARCHAR(191) NOT NULL,
  expiresAt DATETIME NOT NULL,
  FOREIGN KEY (showtimeId) REFERENCES Showtime(id) ON DELETE CASCADE,
  FOREIGN KEY (seatId) REFERENCES Seat(id) ON DELETE CASCADE,
  INDEX idx_seatlock_showtime_seat (showtimeId, seatId),
  INDEX idx_seatlock_expires (expiresAt)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Reviews Table
CREATE TABLE IF NOT EXISTS Review (
  id VARCHAR(191) PRIMARY KEY,
  movieId VARCHAR(191) NOT NULL,
  userId VARCHAR(191) NOT NULL,
  rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
  reviewText TEXT,
  createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY unique_user_movie (userId, movieId),
  FOREIGN KEY (movieId) REFERENCES Movie(id) ON DELETE CASCADE,
  FOREIGN KEY (userId) REFERENCES User(id) ON DELETE CASCADE,
  INDEX idx_review_movie (movieId),
  INDEX idx_review_user (userId),
  INDEX idx_review_created (createdAt DESC)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- BookingGroup table
CREATE TABLE IF NOT EXISTS BookingGroup (
  id VARCHAR(191) PRIMARY KEY,
  name VARCHAR(191) NOT NULL,
  showtimeId VARCHAR(191) NOT NULL,
  createdBy VARCHAR(191) NOT NULL,
  joinToken VARCHAR(191) UNIQUE,
  status ENUM('ACTIVE', 'INACTIVE') NOT NULL DEFAULT 'ACTIVE',
  createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (showtimeId) REFERENCES Showtime(id) ON DELETE CASCADE,
  FOREIGN KEY (createdBy) REFERENCES User(id) ON DELETE CASCADE,
  INDEX idx_group_showtime (showtimeId),
  INDEX idx_group_creator (createdBy)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- GroupMember table
CREATE TABLE IF NOT EXISTS GroupMember (
  id VARCHAR(191) PRIMARY KEY,
  groupId VARCHAR(191) NOT NULL,
  userId VARCHAR(191) NOT NULL,
  joinedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY unique_group_user (groupId, userId),
  FOREIGN KEY (groupId) REFERENCES BookingGroup(id) ON DELETE CASCADE,
  FOREIGN KEY (userId) REFERENCES User(id) ON DELETE CASCADE,
  INDEX idx_group_member_group (groupId),
  INDEX idx_group_member_user (userId)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- GroupMessage table
CREATE TABLE IF NOT EXISTS GroupMessage (
  id VARCHAR(191) PRIMARY KEY,
  groupId VARCHAR(191) NOT NULL,
  userId VARCHAR(191) NOT NULL,
  message TEXT NOT NULL,
  createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (groupId) REFERENCES BookingGroup(id) ON DELETE CASCADE,
  FOREIGN KEY (userId) REFERENCES User(id) ON DELETE CASCADE,
  INDEX idx_group_message_group (groupId),
  INDEX idx_group_message_created (createdAt DESC)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- GroupPoll table
CREATE TABLE IF NOT EXISTS GroupPoll (
  id VARCHAR(191) PRIMARY KEY,
  groupId VARCHAR(191) NOT NULL,
  createdBy VARCHAR(191) NOT NULL,
  question TEXT NOT NULL,
  createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (groupId) REFERENCES BookingGroup(id) ON DELETE CASCADE,
  FOREIGN KEY (createdBy) REFERENCES User(id) ON DELETE CASCADE,
  INDEX idx_group_poll_group (groupId)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- GroupPollOption table
CREATE TABLE IF NOT EXISTS GroupPollOption (
  id VARCHAR(191) PRIMARY KEY,
  pollId VARCHAR(191) NOT NULL,
  option TEXT NOT NULL,
  FOREIGN KEY (pollId) REFERENCES GroupPoll(id) ON DELETE CASCADE,
  INDEX idx_poll_option_poll (pollId)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- GroupPollVote table
CREATE TABLE IF NOT EXISTS GroupPollVote (
  id VARCHAR(191) PRIMARY KEY,
  pollId VARCHAR(191) NOT NULL,
  optionId VARCHAR(191) NOT NULL,
  userId VARCHAR(191) NOT NULL,
  createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY unique_poll_user (pollId, userId),
  FOREIGN KEY (pollId) REFERENCES GroupPoll(id) ON DELETE CASCADE,
  FOREIGN KEY (optionId) REFERENCES GroupPollOption(id) ON DELETE CASCADE,
  FOREIGN KEY (userId) REFERENCES User(id) ON DELETE CASCADE,
  INDEX idx_poll_vote_poll (pollId)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Wishlist Table
CREATE TABLE IF NOT EXISTS Wishlist (
  id VARCHAR(191) PRIMARY KEY,
  userId VARCHAR(191) NOT NULL,
  movieId VARCHAR(191) NOT NULL,
  createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY unique_user_movie (userId, movieId),
  FOREIGN KEY (userId) REFERENCES User(id) ON DELETE CASCADE,
  FOREIGN KEY (movieId) REFERENCES Movie(id) ON DELETE CASCADE,
  INDEX idx_wishlist_user (userId),
  INDEX idx_wishlist_movie (movieId)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Loyalty Points Table
CREATE TABLE IF NOT EXISTS LoyaltyPoints (
  id VARCHAR(191) PRIMARY KEY,
  userId VARCHAR(191) NOT NULL UNIQUE,
  points INT NOT NULL DEFAULT 0,
  totalEarned INT NOT NULL DEFAULT 0,
  totalRedeemed INT NOT NULL DEFAULT 0,
  tier ENUM('BRONZE', 'SILVER', 'GOLD', 'PLATINUM') NOT NULL DEFAULT 'BRONZE',
  updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (userId) REFERENCES User(id) ON DELETE CASCADE,
  INDEX idx_loyalty_points_user (userId)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Loyalty Points History
CREATE TABLE IF NOT EXISTS LoyaltyPointsHistory (
  id VARCHAR(191) PRIMARY KEY,
  userId VARCHAR(191) NOT NULL,
  points INT NOT NULL,
  type ENUM('EARNED', 'REDEEMED', 'EXPIRED') NOT NULL,
  description VARCHAR(500),
  bookingId VARCHAR(191),
  createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (userId) REFERENCES User(id) ON DELETE CASCADE,
  FOREIGN KEY (bookingId) REFERENCES Booking(id) ON DELETE SET NULL,
  INDEX idx_loyalty_history_user (userId),
  INDEX idx_loyalty_history_created (createdAt DESC)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Food Items Table
CREATE TABLE IF NOT EXISTS FoodItem (
  id VARCHAR(191) PRIMARY KEY,
  name VARCHAR(191) NOT NULL,
  description TEXT,
  price INT NOT NULL,
  category ENUM('POPCORN', 'DRINKS', 'SNACKS', 'COMBO') NOT NULL,
  imageUrl VARCHAR(500),
  available BOOLEAN NOT NULL DEFAULT TRUE,
  createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_food_category (category),
  INDEX idx_food_available (available)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Food Orders Table
CREATE TABLE IF NOT EXISTS FoodOrder (
  id VARCHAR(191) PRIMARY KEY,
  bookingId VARCHAR(191) NOT NULL,
  totalAmount INT NOT NULL,
  status ENUM('PENDING', 'PREPARING', 'READY', 'COLLECTED') NOT NULL DEFAULT 'PENDING',
  createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (bookingId) REFERENCES Booking(id) ON DELETE CASCADE,
  INDEX idx_food_order_booking (bookingId)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Food Order Items
CREATE TABLE IF NOT EXISTS FoodOrderItem (
  id VARCHAR(191) PRIMARY KEY,
  foodOrderId VARCHAR(191) NOT NULL,
  foodItemId VARCHAR(191) NOT NULL,
  quantity INT NOT NULL DEFAULT 1,
  price INT NOT NULL,
  FOREIGN KEY (foodOrderId) REFERENCES FoodOrder(id) ON DELETE CASCADE,
  FOREIGN KEY (foodItemId) REFERENCES FoodItem(id) ON DELETE CASCADE,
  INDEX idx_food_order_item_order (foodOrderId)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- CancellationRequest Table
CREATE TABLE IF NOT EXISTS CancellationRequest (
  id VARCHAR(191) PRIMARY KEY,
  bookingId VARCHAR(191) NOT NULL,
  userId VARCHAR(191) NOT NULL,
  reason VARCHAR(500),
  requestedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  status VARCHAR(50) NOT NULL DEFAULT 'PENDING',
  processedAt DATETIME,
  FOREIGN KEY (bookingId) REFERENCES Booking(id) ON DELETE CASCADE,
  FOREIGN KEY (userId) REFERENCES User(id) ON DELETE CASCADE,
  INDEX idx_cancellation_request_booking (bookingId)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- RefundTransaction Table
CREATE TABLE IF NOT EXISTS RefundTransaction (
  id VARCHAR(191) PRIMARY KEY,
  bookingId VARCHAR(191) NOT NULL,
  userId VARCHAR(191) NOT NULL,
  amount INT NOT NULL,
  paymentMethod ENUM('RAZORPAY', 'STRIPE', 'WALLET') NOT NULL,
  status ENUM('PENDING', 'PROCESSED', 'FAILED') NOT NULL DEFAULT 'PENDING',
  transactionId VARCHAR(191),
  processedAt DATETIME,
  createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (bookingId) REFERENCES Booking(id) ON DELETE CASCADE,
  FOREIGN KEY (userId) REFERENCES User(id) ON DELETE CASCADE,
  INDEX idx_refund_transaction_booking (bookingId)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- UserWallet Table
CREATE TABLE IF NOT EXISTS UserWallet (
  id VARCHAR(191) PRIMARY KEY,
  userId VARCHAR(191) NOT NULL UNIQUE,
  balance INT NOT NULL DEFAULT 0,
  updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (userId) REFERENCES User(id) ON DELETE CASCADE,
  INDEX idx_user_wallet_user (userId)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- WalletTransaction Table
CREATE TABLE IF NOT EXISTS WalletTransaction (
  id VARCHAR(191) PRIMARY KEY,
  walletId VARCHAR(191) NOT NULL,
  userId VARCHAR(191) NOT NULL,
  amount INT NOT NULL,
  type ENUM('CREDIT', 'DEBIT') NOT NULL,
  description VARCHAR(500),
  bookingId VARCHAR(191),
  refundTransactionId VARCHAR(191),
  createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (walletId) REFERENCES UserWallet(id) ON DELETE CASCADE,
  FOREIGN KEY (userId) REFERENCES User(id) ON DELETE CASCADE,
  FOREIGN KEY (bookingId) REFERENCES Booking(id) ON DELETE SET NULL,
  INDEX idx_wallet_transaction_wallet (walletId),
  INDEX idx_wallet_transaction_user (userId)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- VERIFICATION
-- =====================================================

-- Check all tables were created
SHOW TABLES;

-- =====================================================
-- DONE!
-- =====================================================
-- All tables, indexes, and foreign keys have been created.
-- Next: Run populate-mumbai-theaters.sql to add theaters and seats
-- =====================================================

