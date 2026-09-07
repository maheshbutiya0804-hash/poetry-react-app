CREATE TABLE `challengeparticipation` (
  `id` VARCHAR(191) NOT NULL,
  `userId` VARCHAR(191) NOT NULL,
  `challengeId` VARCHAR(191) NOT NULL,
  `selectedLocation` VARCHAR(191) NULL,
  `selectedCardId` VARCHAR(191) NULL,
  `status` VARCHAR(32) NOT NULL DEFAULT 'STARTED',
  `startedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `completedAt` DATETIME(3) NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL,
  UNIQUE INDEX `challengeparticipation_userId_challengeId_key`(`userId`, `challengeId`),
  INDEX `challengeparticipation_challengeId_status_idx`(`challengeId`, `status`),
  INDEX `challengeparticipation_userId_status_idx`(`userId`, `status`),
  INDEX `challengeparticipation_selectedCardId_idx`(`selectedCardId`),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

ALTER TABLE `challengeparticipation`
  ADD CONSTRAINT `challengeparticipation_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `challengeparticipation_challengeId_fkey` FOREIGN KEY (`challengeId`) REFERENCES `challenge`(`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `challengeparticipation_selectedCardId_fkey` FOREIGN KEY (`selectedCardId`) REFERENCES `card`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
