-- AlterTable
ALTER TABLE `subscription` ADD COLUMN `cancelAtPeriodEnd` BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE `Challenge` (
    `id` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `challengeMonth` DATETIME(3) NOT NULL,
    `overview` TEXT NOT NULL,
    `goal` TEXT NOT NULL,
    `howToComplete` TEXT NOT NULL,
    `relationshipBenefit` TEXT NOT NULL,
    `imagePath` VARCHAR(500) NULL,
    `status` VARCHAR(32) NOT NULL DEFAULT 'DRAFT',
    `publishedAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `Challenge_status_challengeMonth_idx`(`status`, `challengeMonth`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ChallengeReminder` (
    `id` VARCHAR(191) NOT NULL,
    `challengeId` VARCHAR(191) NOT NULL,
    `dayOfMonth` INTEGER NOT NULL,
    `timeOfDay` VARCHAR(10) NOT NULL DEFAULT '09:00',
    `channel` VARCHAR(20) NOT NULL DEFAULT 'EMAIL',
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `ChallengeReminder_challengeId_dayOfMonth_idx`(`challengeId`, `dayOfMonth`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `ChallengeReminder` ADD CONSTRAINT `ChallengeReminder_challengeId_fkey` FOREIGN KEY (`challengeId`) REFERENCES `Challenge`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
