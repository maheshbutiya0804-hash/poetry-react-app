-- CreateTable
CREATE TABLE `NotificationJob` (
    `id` VARCHAR(191) NOT NULL,
    `channel` VARCHAR(20) NOT NULL DEFAULT 'EMAIL',
    `audience` VARCHAR(32) NOT NULL DEFAULT 'SINGLE_USER',
    `selectedUserId` VARCHAR(191) NULL,
    `recipientEmail` VARCHAR(191) NULL,
    `subject` VARCHAR(255) NULL,
    `message` TEXT NOT NULL,
    `status` VARCHAR(32) NOT NULL DEFAULT 'QUEUED',
    `totalRecipients` INTEGER NOT NULL DEFAULT 0,
    `sentCount` INTEGER NOT NULL DEFAULT 0,
    `failedCount` INTEGER NOT NULL DEFAULT 0,
    `sentAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `NotificationJob_status_createdAt_idx`(`status`, `createdAt`),
    INDEX `NotificationJob_audience_createdAt_idx`(`audience`, `createdAt`),
    INDEX `NotificationJob_selectedUserId_idx`(`selectedUserId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `CommunityPost` (
    `id` VARCHAR(191) NOT NULL,
    `authorId` VARCHAR(191) NULL,
    `authorName` VARCHAR(191) NOT NULL,
    `category` VARCHAR(120) NOT NULL DEFAULT 'General',
    `title` VARCHAR(255) NOT NULL,
    `body` TEXT NOT NULL,
    `status` VARCHAR(32) NOT NULL DEFAULT 'PUBLISHED',
    `isReported` BOOLEAN NOT NULL DEFAULT false,
    `reportCount` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `CommunityPost_status_createdAt_idx`(`status`, `createdAt`),
    INDEX `CommunityPost_isReported_createdAt_idx`(`isReported`, `createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `CommunityResponse` (
    `id` VARCHAR(191) NOT NULL,
    `postId` VARCHAR(191) NOT NULL,
    `authorName` VARCHAR(191) NOT NULL,
    `body` TEXT NOT NULL,
    `status` VARCHAR(32) NOT NULL DEFAULT 'PUBLISHED',
    `isReported` BOOLEAN NOT NULL DEFAULT false,
    `reportCount` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `CommunityResponse_postId_createdAt_idx`(`postId`, `createdAt`),
    INDEX `CommunityResponse_isReported_createdAt_idx`(`isReported`, `createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `SystemSetting` (
    `id` VARCHAR(64) NOT NULL DEFAULT 'platform',
    `defaultPrintingFee` DECIMAL(10, 2) NOT NULL DEFAULT 7.00,
    `orderFeedbackEmail` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `NotificationJob` ADD CONSTRAINT `NotificationJob_selectedUserId_fkey` FOREIGN KEY (`selectedUserId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CommunityResponse` ADD CONSTRAINT `CommunityResponse_postId_fkey` FOREIGN KEY (`postId`) REFERENCES `CommunityPost`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
