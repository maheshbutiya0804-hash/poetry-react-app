-- Add category assignment to cards. Category table already exists from add_categories.
ALTER TABLE `card` ADD COLUMN `categoryId` VARCHAR(191) NULL;
CREATE INDEX `card_categoryId_idx` ON `card`(`categoryId`);
ALTER TABLE `card` ADD CONSTRAINT `card_categoryId_fkey` FOREIGN KEY (`categoryId`) REFERENCES `category`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
