-- Booking Cancellation & Refunds Schema

-- Add cancellation fields to Booking table
ALTER TABLE `Booking`
ADD COLUMN `cancelledAt` DATETIME NULL AFTER `createdAt`,
ADD COLUMN `cancellationReason` VARCHAR(500) NULL AFTER `cancelledAt`,
ADD COLUMN `refundAmount` INT NOT NULL DEFAULT 0 AFTER `cancellationReason`,
ADD COLUMN `refundStatus` ENUM('NONE', 'PENDING', 'PROCESSED', 'FAILED') NOT NULL DEFAULT 'NONE' AFTER `refundAmount`,
ADD COLUMN `refundTransactionId` VARCHAR(191) NULL AFTER `refundStatus`;

-- Cancellation Requests Table (for tracking cancellation requests)
CREATE TABLE IF NOT EXISTS `CancellationRequest` (
  `id` VARCHAR(191) NOT NULL PRIMARY KEY,
  `bookingId` VARCHAR(191) NOT NULL,
  `userId` VARCHAR(191) NOT NULL,
  `reason` VARCHAR(500),
  `requestedAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `status` ENUM('PENDING', 'APPROVED', 'REJECTED', 'PROCESSED') NOT NULL DEFAULT 'PENDING',
  `processedAt` DATETIME NULL,
  CONSTRAINT `CancellationRequest_bookingId_fkey` FOREIGN KEY (`bookingId`) REFERENCES `Booking`(`id`) ON DELETE CASCADE,
  CONSTRAINT `CancellationRequest_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Refund Transactions Table (for tracking refund history)
CREATE TABLE IF NOT EXISTS `RefundTransaction` (
  `id` VARCHAR(191) NOT NULL PRIMARY KEY,
  `bookingId` VARCHAR(191) NOT NULL,
  `userId` VARCHAR(191) NOT NULL,
  `amount` INT NOT NULL,
  `paymentMethod` ENUM('RAZORPAY', 'STRIPE', 'WALLET') NOT NULL,
  `status` ENUM('PENDING', 'PROCESSED', 'FAILED') NOT NULL DEFAULT 'PENDING',
  `transactionId` VARCHAR(191) NULL,
  `processedAt` DATETIME NULL,
  `createdAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT `RefundTransaction_bookingId_fkey` FOREIGN KEY (`bookingId`) REFERENCES `Booking`(`id`) ON DELETE CASCADE,
  CONSTRAINT `RefundTransaction_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- User Wallet Table (for storing refunds as wallet balance)
CREATE TABLE IF NOT EXISTS `UserWallet` (
  `id` VARCHAR(191) NOT NULL PRIMARY KEY,
  `userId` VARCHAR(191) NOT NULL UNIQUE,
  `balance` INT NOT NULL DEFAULT 0,
  `updatedAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `UserWallet_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Wallet Transactions Table (for tracking wallet transactions)
CREATE TABLE IF NOT EXISTS `WalletTransaction` (
  `id` VARCHAR(191) NOT NULL PRIMARY KEY,
  `walletId` VARCHAR(191) NOT NULL,
  `userId` VARCHAR(191) NOT NULL,
  `amount` INT NOT NULL,
  `type` ENUM('CREDIT', 'DEBIT') NOT NULL,
  `description` VARCHAR(500),
  `bookingId` VARCHAR(191) NULL,
  `refundTransactionId` VARCHAR(191) NULL,
  `createdAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT `WalletTransaction_walletId_fkey` FOREIGN KEY (`walletId`) REFERENCES `UserWallet`(`id`) ON DELETE CASCADE,
  CONSTRAINT `WalletTransaction_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE,
  CONSTRAINT `WalletTransaction_bookingId_fkey` FOREIGN KEY (`bookingId`) REFERENCES `Booking`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

