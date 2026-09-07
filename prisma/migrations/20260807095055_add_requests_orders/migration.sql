-- CreateTable
CREATE TABLE `PoetryRequest` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NULL,
    `requesterName` VARCHAR(191) NOT NULL,
    `requesterEmail` VARCHAR(191) NOT NULL,
    `category` VARCHAR(120) NOT NULL,
    `occasion` VARCHAR(191) NULL,
    `prompt` TEXT NOT NULL,
    `status` VARCHAR(32) NOT NULL DEFAULT 'PENDING',
    `adminNotes` TEXT NULL,
    `completedAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `PoetryRequest_status_createdAt_idx`(`status`, `createdAt`),
    INDEX `PoetryRequest_category_idx`(`category`),
    INDEX `PoetryRequest_userId_idx`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `CardOrder` (
    `id` VARCHAR(191) NOT NULL,
    `orderNumber` VARCHAR(80) NOT NULL,
    `userId` VARCHAR(191) NULL,
    `customerName` VARCHAR(191) NOT NULL,
    `customerEmail` VARCHAR(191) NOT NULL,
    `cardTitle` VARCHAR(191) NOT NULL,
    `cardCategory` VARCHAR(120) NULL,
    `quantity` INTEGER NOT NULL DEFAULT 1,
    `shippingFee` DECIMAL(10, 2) NULL,
    `totalAmount` DECIMAL(10, 2) NULL,
    `status` VARCHAR(32) NOT NULL DEFAULT 'PLACED',
    `reviewed` BOOLEAN NOT NULL DEFAULT false,
    `shippingName` VARCHAR(191) NULL,
    `shippingAddress` TEXT NULL,
    `trackingNumber` VARCHAR(191) NULL,
    `placedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `shippedAt` DATETIME(3) NULL,
    `deliveredAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `CardOrder_orderNumber_key`(`orderNumber`),
    INDEX `CardOrder_status_placedAt_idx`(`status`, `placedAt`),
    INDEX `CardOrder_reviewed_idx`(`reviewed`),
    INDEX `CardOrder_userId_idx`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `PoetryRequest` ADD CONSTRAINT `PoetryRequest_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CardOrder` ADD CONSTRAINT `CardOrder_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
