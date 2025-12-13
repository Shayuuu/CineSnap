-- Wishlist Table
CREATE TABLE IF NOT EXISTS `Wishlist` (
  `id` VARCHAR(191) NOT NULL PRIMARY KEY,
  `userId` VARCHAR(191) NOT NULL,
  `movieId` VARCHAR(191) NOT NULL,
  `createdAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY `unique_user_movie` (`userId`, `movieId`),
  CONSTRAINT `Wishlist_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE,
  CONSTRAINT `Wishlist_movieId_fkey` FOREIGN KEY (`movieId`) REFERENCES `Movie`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Loyalty Points Table
CREATE TABLE IF NOT EXISTS `LoyaltyPoints` (
  `id` VARCHAR(191) NOT NULL PRIMARY KEY,
  `userId` VARCHAR(191) NOT NULL UNIQUE,
  `points` INT NOT NULL DEFAULT 0,
  `totalEarned` INT NOT NULL DEFAULT 0,
  `totalRedeemed` INT NOT NULL DEFAULT 0,
  `tier` ENUM('BRONZE', 'SILVER', 'GOLD', 'PLATINUM') NOT NULL DEFAULT 'BRONZE',
  `updatedAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `LoyaltyPoints_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Loyalty Points History
CREATE TABLE IF NOT EXISTS `LoyaltyPointsHistory` (
  `id` VARCHAR(191) NOT NULL PRIMARY KEY,
  `userId` VARCHAR(191) NOT NULL,
  `points` INT NOT NULL,
  `type` ENUM('EARNED', 'REDEEMED', 'EXPIRED') NOT NULL,
  `description` VARCHAR(500),
  `bookingId` VARCHAR(191),
  `createdAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT `LoyaltyPointsHistory_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE,
  CONSTRAINT `LoyaltyPointsHistory_bookingId_fkey` FOREIGN KEY (`bookingId`) REFERENCES `Booking`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Food Items Table
CREATE TABLE IF NOT EXISTS `FoodItem` (
  `id` VARCHAR(191) NOT NULL PRIMARY KEY,
  `name` VARCHAR(191) NOT NULL,
  `description` TEXT,
  `price` INT NOT NULL,
  `category` ENUM('POPCORN', 'DRINKS', 'SNACKS', 'COMBO') NOT NULL,
  `imageUrl` VARCHAR(500),
  `available` BOOLEAN NOT NULL DEFAULT TRUE,
  `createdAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Food Orders Table
CREATE TABLE IF NOT EXISTS `FoodOrder` (
  `id` VARCHAR(191) NOT NULL PRIMARY KEY,
  `bookingId` VARCHAR(191) NOT NULL,
  `totalAmount` INT NOT NULL,
  `status` ENUM('PENDING', 'PREPARING', 'READY', 'COLLECTED') NOT NULL DEFAULT 'PENDING',
  `createdAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT `FoodOrder_bookingId_fkey` FOREIGN KEY (`bookingId`) REFERENCES `Booking`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Food Order Items
CREATE TABLE IF NOT EXISTS `FoodOrderItem` (
  `id` VARCHAR(191) NOT NULL PRIMARY KEY,
  `foodOrderId` VARCHAR(191) NOT NULL,
  `foodItemId` VARCHAR(191) NOT NULL,
  `quantity` INT NOT NULL DEFAULT 1,
  `price` INT NOT NULL,
  CONSTRAINT `FoodOrderItem_foodOrderId_fkey` FOREIGN KEY (`foodOrderId`) REFERENCES `FoodOrder`(`id`) ON DELETE CASCADE,
  CONSTRAINT `FoodOrderItem_foodItemId_fkey` FOREIGN KEY (`foodItemId`) REFERENCES `FoodItem`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Add loyalty points to Booking table
ALTER TABLE `Booking`
ADD COLUMN `loyaltyPointsEarned` INT NOT NULL DEFAULT 0 AFTER `totalAmount`;

-- Add trailer URL to Movie table (if not exists)
ALTER TABLE `Movie`
ADD COLUMN `trailerUrl` VARCHAR(500) NULL AFTER `posterUrl`;

