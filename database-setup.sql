-- BookMySeat Database Setup
-- Run this in MySQL Workbench after creating the 'bookmyseat' database

USE bookmyseat;

-- Create tables
CREATE TABLE IF NOT EXISTS `User` (
  `id` VARCHAR(191) PRIMARY KEY,
  `email` VARCHAR(191) NOT NULL UNIQUE,
  `name` VARCHAR(191),
  `role` ENUM('USER','ADMIN') NOT NULL DEFAULT 'USER'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `Movie` (
  `id` VARCHAR(191) PRIMARY KEY,
  `title` VARCHAR(191) NOT NULL,
  `posterUrl` TEXT NOT NULL,
  `duration` INT NOT NULL,
  `genre` VARCHAR(191) NOT NULL,
  `releaseDate` DATETIME(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `Theater` (
  `id` VARCHAR(191) PRIMARY KEY,
  `name` VARCHAR(191) NOT NULL,
  `location` VARCHAR(191) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `Screen` (
  `id` VARCHAR(191) PRIMARY KEY,
  `name` VARCHAR(191) NOT NULL,
  `theaterId` VARCHAR(191) NOT NULL,
  CONSTRAINT `Screen_theaterId_fkey`
    FOREIGN KEY (`theaterId`) REFERENCES `Theater`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `Seat` (
  `id` VARCHAR(191) PRIMARY KEY,
  `row` VARCHAR(191) NOT NULL,
  `number` INT NOT NULL,
  `type` ENUM('STANDARD','PREMIUM','VIP') NOT NULL DEFAULT 'STANDARD',
  `screenId` VARCHAR(191) NOT NULL,
  CONSTRAINT `Seat_screenId_fkey`
    FOREIGN KEY (`screenId`) REFERENCES `Screen`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `Showtime` (
  `id` VARCHAR(191) PRIMARY KEY,
  `movieId` VARCHAR(191) NOT NULL,
  `screenId` VARCHAR(191) NOT NULL,
  `startTime` DATETIME(3) NOT NULL,
  `price` INT NOT NULL,
  CONSTRAINT `Showtime_movieId_fkey`
    FOREIGN KEY (`movieId`) REFERENCES `Movie`(`id`) ON DELETE CASCADE,
  CONSTRAINT `Showtime_screenId_fkey`
    FOREIGN KEY (`screenId`) REFERENCES `Screen`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `Booking` (
  `id` VARCHAR(191) PRIMARY KEY,
  `userId` VARCHAR(191) NOT NULL,
  `showtimeId` VARCHAR(191) NOT NULL,
  `totalAmount` INT NOT NULL,
  `status` ENUM('PENDING','CONFIRMED','CANCELLED') NOT NULL DEFAULT 'PENDING',
  `razorpayOrderId` VARCHAR(191),
  `razorpayPaymentId` VARCHAR(191),
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  CONSTRAINT `Booking_userId_fkey`
    FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE,
  CONSTRAINT `Booking_showtimeId_fkey`
    FOREIGN KEY (`showtimeId`) REFERENCES `Showtime`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `_BookingSeats` (
  `A` VARCHAR(191) NOT NULL,
  `B` VARCHAR(191) NOT NULL,
  PRIMARY KEY (`A`,`B`),
  CONSTRAINT `_BookingSeats_A_fkey`
    FOREIGN KEY (`A`) REFERENCES `Booking`(`id`) ON DELETE CASCADE,
  CONSTRAINT `_BookingSeats_B_fkey`
    FOREIGN KEY (`B`) REFERENCES `Seat`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `SeatLock` (
  `id` VARCHAR(191) PRIMARY KEY,
  `showtimeId` VARCHAR(191) NOT NULL,
  `seatId` VARCHAR(191) NOT NULL,
  `expiresAt` DATETIME(3) NOT NULL,
  CONSTRAINT `SeatLock_showtimeId_fkey`
    FOREIGN KEY (`showtimeId`) REFERENCES `Showtime`(`id`) ON DELETE CASCADE,
  CONSTRAINT `SeatLock_seatId_fkey`
    FOREIGN KEY (`seatId`) REFERENCES `Seat`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Create indexes for better performance
-- Note: If you get "Duplicate key name" errors, the indexes already exist - that's fine, just continue
CREATE INDEX `idx_showtime_movie` ON `Showtime`(`movieId`);
CREATE INDEX `idx_showtime_screen` ON `Showtime`(`screenId`);
CREATE INDEX `idx_booking_user` ON `Booking`(`userId`);
CREATE INDEX `idx_booking_showtime` ON `Booking`(`showtimeId`);
CREATE INDEX `idx_seatlock_showtime_seat` ON `SeatLock`(`showtimeId`, `seatId`);

