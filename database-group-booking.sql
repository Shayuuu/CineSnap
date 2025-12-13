USE bookmyseat;

-- Group Booking Tables
CREATE TABLE IF NOT EXISTS `BookingGroup` (
  `id` VARCHAR(191) PRIMARY KEY,
  `name` VARCHAR(191) NOT NULL,
  `createdBy` VARCHAR(191) NOT NULL,
  `showtimeId` VARCHAR(191) NOT NULL,
  `status` ENUM('ACTIVE', 'BOOKING', 'COMPLETED', 'CANCELLED') DEFAULT 'ACTIVE',
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  CONSTRAINT `BookingGroup_createdBy_fkey`
    FOREIGN KEY (`createdBy`) REFERENCES `User`(`id`) ON DELETE CASCADE,
  CONSTRAINT `BookingGroup_showtimeId_fkey`
    FOREIGN KEY (`showtimeId`) REFERENCES `Showtime`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `GroupMember` (
  `id` VARCHAR(191) PRIMARY KEY,
  `groupId` VARCHAR(191) NOT NULL,
  `userId` VARCHAR(191) NOT NULL,
  `joinedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  CONSTRAINT `GroupMember_groupId_fkey`
    FOREIGN KEY (`groupId`) REFERENCES `BookingGroup`(`id`) ON DELETE CASCADE,
  CONSTRAINT `GroupMember_userId_fkey`
    FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE,
  CONSTRAINT `GroupMember_groupId_userId_key` UNIQUE (`groupId`, `userId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `GroupMessage` (
  `id` VARCHAR(191) PRIMARY KEY,
  `groupId` VARCHAR(191) NOT NULL,
  `userId` VARCHAR(191) NOT NULL,
  `message` TEXT NOT NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  CONSTRAINT `GroupMessage_groupId_fkey`
    FOREIGN KEY (`groupId`) REFERENCES `BookingGroup`(`id`) ON DELETE CASCADE,
  CONSTRAINT `GroupMessage_userId_fkey`
    FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `GroupPoll` (
  `id` VARCHAR(191) PRIMARY KEY,
  `groupId` VARCHAR(191) NOT NULL,
  `question` VARCHAR(500) NOT NULL,
  `options` JSON NOT NULL, -- Array of {id, text, votes}
  `createdBy` VARCHAR(191) NOT NULL,
  `status` ENUM('ACTIVE', 'CLOSED') DEFAULT 'ACTIVE',
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  CONSTRAINT `GroupPoll_groupId_fkey`
    FOREIGN KEY (`groupId`) REFERENCES `BookingGroup`(`id`) ON DELETE CASCADE,
  CONSTRAINT `GroupPoll_createdBy_fkey`
    FOREIGN KEY (`createdBy`) REFERENCES `User`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `PollVote` (
  `id` VARCHAR(191) PRIMARY KEY,
  `pollId` VARCHAR(191) NOT NULL,
  `userId` VARCHAR(191) NOT NULL,
  `optionId` VARCHAR(191) NOT NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  CONSTRAINT `PollVote_pollId_fkey`
    FOREIGN KEY (`pollId`) REFERENCES `GroupPoll`(`id`) ON DELETE CASCADE,
  CONSTRAINT `PollVote_userId_fkey`
    FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE,
  CONSTRAINT `PollVote_pollId_userId_key` UNIQUE (`pollId`, `userId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE INDEX `idx_group_member_group` ON `GroupMember`(`groupId`);
CREATE INDEX `idx_group_member_user` ON `GroupMember`(`userId`);
CREATE INDEX `idx_group_message_group` ON `GroupMessage`(`groupId`);
CREATE INDEX `idx_group_poll_group` ON `GroupPoll`(`groupId`);
CREATE INDEX `idx_poll_vote_poll` ON `PollVote`(`pollId`);

