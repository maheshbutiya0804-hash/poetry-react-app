CREATE TABLE `cardimportjob` (
  `id` VARCHAR(191) NOT NULL,
  `collectionId` VARCHAR(191) NOT NULL,
  `originalZipName` VARCHAR(255) NOT NULL,
  `zipPath` VARCHAR(500) NOT NULL,
  `totalFiles` INTEGER NOT NULL DEFAULT 0,
  `processedFiles` INTEGER NOT NULL DEFAULT 0,
  `successCount` INTEGER NOT NULL DEFAULT 0,
  `failedCount` INTEGER NOT NULL DEFAULT 0,
  `status` VARCHAR(32) NOT NULL DEFAULT 'QUEUED',
  `errorMessage` TEXT NULL,
  `publishOnImport` BOOLEAN NOT NULL DEFAULT false,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL,
  INDEX `cardimportjob_status_createdAt_idx`(`status`, `createdAt`),
  INDEX `cardimportjob_collectionId_createdAt_idx`(`collectionId`, `createdAt`),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `cardimportitem` (
  `id` VARCHAR(191) NOT NULL,
  `jobId` VARCHAR(191) NOT NULL,
  `originalFilename` VARCHAR(500) NOT NULL,
  `title` VARCHAR(191) NOT NULL,
  `cardId` VARCHAR(191) NULL,
  `pdfPath` VARCHAR(500) NULL,
  `previewPath` VARCHAR(500) NULL,
  `pageCount` INTEGER NULL,
  `status` VARCHAR(32) NOT NULL DEFAULT 'QUEUED',
  `errorMessage` TEXT NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL,
  INDEX `cardimportitem_jobId_status_idx`(`jobId`, `status`),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

ALTER TABLE `cardimportitem` ADD CONSTRAINT `cardimportitem_jobId_fkey`
FOREIGN KEY (`jobId`) REFERENCES `cardimportjob`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
