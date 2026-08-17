-- DropForeignKey
ALTER TABLE `authsession` DROP FOREIGN KEY `AuthSession_userId_fkey`;

-- DropForeignKey
ALTER TABLE `card` DROP FOREIGN KEY `Card_collectionId_fkey`;

-- DropForeignKey
ALTER TABLE `cardorder` DROP FOREIGN KEY `CardOrder_userId_fkey`;

-- DropForeignKey
ALTER TABLE `challengereminder` DROP FOREIGN KEY `ChallengeReminder_challengeId_fkey`;

-- DropForeignKey
ALTER TABLE `communityresponse` DROP FOREIGN KEY `CommunityResponse_postId_fkey`;

-- DropForeignKey
ALTER TABLE `notificationjob` DROP FOREIGN KEY `NotificationJob_selectedUserId_fkey`;

-- DropForeignKey
ALTER TABLE `paymenttransaction` DROP FOREIGN KEY `PaymentTransaction_userId_fkey`;

-- DropForeignKey
ALTER TABLE `poetryrequest` DROP FOREIGN KEY `PoetryRequest_userId_fkey`;

-- DropForeignKey
ALTER TABLE `subscription` DROP FOREIGN KEY `Subscription_userId_fkey`;

-- CreateTable
CREATE TABLE `category` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `slug` VARCHAR(191) NOT NULL,
    `description` TEXT NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `sortOrder` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `category_name_key`(`name`),
    UNIQUE INDEX `category_slug_key`(`slug`),
    INDEX `category_isActive_sortOrder_idx`(`isActive`, `sortOrder`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `card` ADD CONSTRAINT `card_collectionId_fkey` FOREIGN KEY (`collectionId`) REFERENCES `collection`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `authsession` ADD CONSTRAINT `authsession_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `subscription` ADD CONSTRAINT `subscription_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `paymenttransaction` ADD CONSTRAINT `paymenttransaction_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `challengereminder` ADD CONSTRAINT `challengereminder_challengeId_fkey` FOREIGN KEY (`challengeId`) REFERENCES `challenge`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `poetryrequest` ADD CONSTRAINT `poetryrequest_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `cardorder` ADD CONSTRAINT `cardorder_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `notificationjob` ADD CONSTRAINT `notificationjob_selectedUserId_fkey` FOREIGN KEY (`selectedUserId`) REFERENCES `user`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `communityresponse` ADD CONSTRAINT `communityresponse_postId_fkey` FOREIGN KEY (`postId`) REFERENCES `communitypost`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- RedefineIndex
CREATE INDEX `authsession_expiresAt_idx` ON `authsession`(`expiresAt`);
DROP INDEX `AuthSession_expiresAt_idx` ON `authsession`;

-- RedefineIndex
CREATE UNIQUE INDEX `authsession_tokenHash_key` ON `authsession`(`tokenHash`);
DROP INDEX `AuthSession_tokenHash_key` ON `authsession`;

-- RedefineIndex
CREATE INDEX `authsession_userId_expiresAt_idx` ON `authsession`(`userId`, `expiresAt`);
DROP INDEX `AuthSession_userId_expiresAt_idx` ON `authsession`;

-- RedefineIndex
CREATE INDEX `card_collectionId_isPublished_idx` ON `card`(`collectionId`, `isPublished`);
DROP INDEX `Card_collectionId_isPublished_idx` ON `card`;

-- RedefineIndex
CREATE INDEX `card_isPublished_createdAt_idx` ON `card`(`isPublished`, `createdAt`);
DROP INDEX `Card_isPublished_createdAt_idx` ON `card`;

-- RedefineIndex
CREATE UNIQUE INDEX `card_slug_key` ON `card`(`slug`);
DROP INDEX `Card_slug_key` ON `card`;

-- RedefineIndex
CREATE UNIQUE INDEX `cardorder_orderNumber_key` ON `cardorder`(`orderNumber`);
DROP INDEX `CardOrder_orderNumber_key` ON `cardorder`;

-- RedefineIndex
CREATE INDEX `cardorder_reviewed_idx` ON `cardorder`(`reviewed`);
DROP INDEX `CardOrder_reviewed_idx` ON `cardorder`;

-- RedefineIndex
CREATE INDEX `cardorder_status_placedAt_idx` ON `cardorder`(`status`, `placedAt`);
DROP INDEX `CardOrder_status_placedAt_idx` ON `cardorder`;

-- RedefineIndex
CREATE INDEX `cardorder_userId_idx` ON `cardorder`(`userId`);
DROP INDEX `CardOrder_userId_idx` ON `cardorder`;

-- RedefineIndex
CREATE INDEX `challenge_status_challengeMonth_idx` ON `challenge`(`status`, `challengeMonth`);
DROP INDEX `Challenge_status_challengeMonth_idx` ON `challenge`;

-- RedefineIndex
CREATE INDEX `challengereminder_challengeId_dayOfMonth_idx` ON `challengereminder`(`challengeId`, `dayOfMonth`);
DROP INDEX `ChallengeReminder_challengeId_dayOfMonth_idx` ON `challengereminder`;

-- RedefineIndex
CREATE INDEX `collection_isActive_sortOrder_idx` ON `collection`(`isActive`, `sortOrder`);
DROP INDEX `Collection_isActive_sortOrder_idx` ON `collection`;

-- RedefineIndex
CREATE UNIQUE INDEX `collection_slug_key` ON `collection`(`slug`);
DROP INDEX `Collection_slug_key` ON `collection`;

-- RedefineIndex
CREATE INDEX `communitypost_isReported_createdAt_idx` ON `communitypost`(`isReported`, `createdAt`);
DROP INDEX `CommunityPost_isReported_createdAt_idx` ON `communitypost`;

-- RedefineIndex
CREATE INDEX `communitypost_status_createdAt_idx` ON `communitypost`(`status`, `createdAt`);
DROP INDEX `CommunityPost_status_createdAt_idx` ON `communitypost`;

-- RedefineIndex
CREATE INDEX `communityresponse_isReported_createdAt_idx` ON `communityresponse`(`isReported`, `createdAt`);
DROP INDEX `CommunityResponse_isReported_createdAt_idx` ON `communityresponse`;

-- RedefineIndex
CREATE INDEX `communityresponse_postId_createdAt_idx` ON `communityresponse`(`postId`, `createdAt`);
DROP INDEX `CommunityResponse_postId_createdAt_idx` ON `communityresponse`;

-- RedefineIndex
CREATE INDEX `notificationjob_audience_createdAt_idx` ON `notificationjob`(`audience`, `createdAt`);
DROP INDEX `NotificationJob_audience_createdAt_idx` ON `notificationjob`;

-- RedefineIndex
CREATE INDEX `notificationjob_selectedUserId_idx` ON `notificationjob`(`selectedUserId`);
DROP INDEX `NotificationJob_selectedUserId_idx` ON `notificationjob`;

-- RedefineIndex
CREATE INDEX `notificationjob_status_createdAt_idx` ON `notificationjob`(`status`, `createdAt`);
DROP INDEX `NotificationJob_status_createdAt_idx` ON `notificationjob`;

-- RedefineIndex
CREATE UNIQUE INDEX `paymenttransaction_providerTransactionId_key` ON `paymenttransaction`(`providerTransactionId`);
DROP INDEX `PaymentTransaction_providerTransactionId_key` ON `paymenttransaction`;

-- RedefineIndex
CREATE INDEX `paymenttransaction_status_occurredAt_idx` ON `paymenttransaction`(`status`, `occurredAt`);
DROP INDEX `PaymentTransaction_status_occurredAt_idx` ON `paymenttransaction`;

-- RedefineIndex
CREATE INDEX `paymenttransaction_userId_occurredAt_idx` ON `paymenttransaction`(`userId`, `occurredAt`);
DROP INDEX `PaymentTransaction_userId_occurredAt_idx` ON `paymenttransaction`;

-- RedefineIndex
CREATE INDEX `poetryrequest_category_idx` ON `poetryrequest`(`category`);
DROP INDEX `PoetryRequest_category_idx` ON `poetryrequest`;

-- RedefineIndex
CREATE INDEX `poetryrequest_status_createdAt_idx` ON `poetryrequest`(`status`, `createdAt`);
DROP INDEX `PoetryRequest_status_createdAt_idx` ON `poetryrequest`;

-- RedefineIndex
CREATE INDEX `poetryrequest_userId_idx` ON `poetryrequest`(`userId`);
DROP INDEX `PoetryRequest_userId_idx` ON `poetryrequest`;

-- RedefineIndex
CREATE INDEX `subscription_paymentStatus_idx` ON `subscription`(`paymentStatus`);
DROP INDEX `Subscription_paymentStatus_idx` ON `subscription`;

-- RedefineIndex
CREATE INDEX `subscription_status_idx` ON `subscription`(`status`);
DROP INDEX `Subscription_status_idx` ON `subscription`;

-- RedefineIndex
CREATE UNIQUE INDEX `subscription_userId_key` ON `subscription`(`userId`);
DROP INDEX `Subscription_userId_key` ON `subscription`;

-- RedefineIndex
CREATE UNIQUE INDEX `user_email_key` ON `user`(`email`);
DROP INDEX `User_email_key` ON `user`;

-- RedefineIndex
CREATE UNIQUE INDEX `user_googleSubject_key` ON `user`(`googleSubject`);
DROP INDEX `User_googleSubject_key` ON `user`;

-- RedefineIndex
CREATE INDEX `user_joinedAt_idx` ON `user`(`joinedAt`);
DROP INDEX `User_joinedAt_idx` ON `user`;

-- RedefineIndex
CREATE INDEX `user_role_status_idx` ON `user`(`role`, `status`);
DROP INDEX `User_role_status_idx` ON `user`;
