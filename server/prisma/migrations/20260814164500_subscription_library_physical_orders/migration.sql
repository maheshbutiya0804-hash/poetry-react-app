ALTER TABLE `subscription`
  ADD COLUMN `stripeCustomerId` VARCHAR(191) NULL,
  ADD COLUMN `stripeSubscriptionId` VARCHAR(191) NULL,
  ADD UNIQUE INDEX `subscription_stripeCustomerId_key` (`stripeCustomerId`),
  ADD UNIQUE INDEX `subscription_stripeSubscriptionId_key` (`stripeSubscriptionId`);

ALTER TABLE `cardorder`
  ADD COLUMN `cardId` VARCHAR(191) NULL,
  ADD COLUMN `cardPrice` DECIMAL(10,2) NOT NULL DEFAULT 7.99,
  ADD COLUMN `printingFee` DECIMAL(10,2) NOT NULL DEFAULT 7.00,
  ADD COLUMN `subtotal` DECIMAL(10,2) NULL,
  ADD COLUMN `shippingNote` TEXT NULL,
  ADD INDEX `cardorder_cardId_idx` (`cardId`),
  ADD CONSTRAINT `cardorder_cardId_fkey` FOREIGN KEY (`cardId`) REFERENCES `card`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

CREATE TABLE `savedcard` (
  `id` VARCHAR(191) NOT NULL,
  `userId` VARCHAR(191) NOT NULL,
  `cardId` VARCHAR(191) NOT NULL,
  `usedAt` DATETIME(3) NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL,
  UNIQUE INDEX `savedcard_userId_cardId_key` (`userId`, `cardId`),
  INDEX `savedcard_userId_createdAt_idx` (`userId`, `createdAt`),
  INDEX `savedcard_cardId_idx` (`cardId`),
  PRIMARY KEY (`id`),
  CONSTRAINT `savedcard_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `savedcard_cardId_fkey` FOREIGN KEY (`cardId`) REFERENCES `card`(`id`) ON DELETE CASCADE ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
