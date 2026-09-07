-- AlterTable
ALTER TABLE `card` ADD COLUMN `adminNotes` TEXT NOT NULL DEFAULT '',
    ADD COLUMN `backLayout` JSON NULL,
    ADD COLUMN `frontLayout` JSON NULL,
    ADD COLUMN `isFeatured` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `poemText` TEXT NOT NULL DEFAULT '',
    ADD COLUMN `templateKey` VARCHAR(80) NOT NULL DEFAULT 'botanical-cream',
    MODIFY `pdfPath` VARCHAR(500) NULL,
    MODIFY `originalFileName` VARCHAR(255) NULL;
