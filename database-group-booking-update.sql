USE bookmyseat;

-- Add joinToken column to BookingGroup table
ALTER TABLE `BookingGroup` 
ADD COLUMN `joinToken` VARCHAR(50) UNIQUE NULL AFTER `status`,
ADD INDEX `idx_join_token` (`joinToken`);

-- Generate join tokens for existing groups
UPDATE `BookingGroup` 
SET `joinToken` = CONCAT('GB', SUBSTRING(MD5(CONCAT(id, createdAt)), 1, 12))
WHERE `joinToken` IS NULL;

