-- Add Review table for Letterboxd-style reviews
-- Run this in MySQL Workbench

USE bookmyseat;

CREATE TABLE IF NOT EXISTS `Review` (
  `id` VARCHAR(191) PRIMARY KEY,
  `movieId` VARCHAR(191) NOT NULL,
  `userId` VARCHAR(191) NOT NULL,
  `rating` INT NOT NULL CHECK (`rating` >= 1 AND `rating` <= 5),
  `reviewText` TEXT,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  CONSTRAINT `Review_movieId_fkey`
    FOREIGN KEY (`movieId`) REFERENCES `Movie`(`id`) ON DELETE CASCADE,
  CONSTRAINT `Review_userId_fkey`
    FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE,
  UNIQUE KEY `unique_user_movie_review` (`userId`, `movieId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE INDEX `idx_review_movie` ON `Review`(`movieId`);
CREATE INDEX `idx_review_user` ON `Review`(`userId`);
CREATE INDEX `idx_review_created` ON `Review`(`createdAt` DESC);

