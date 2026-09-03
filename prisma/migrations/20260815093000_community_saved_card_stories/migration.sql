ALTER TABLE `communitypost`
  ADD COLUMN `isAnonymous` BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN `collectionId` VARCHAR(191) NULL,
  ADD COLUMN `cardId` VARCHAR(191) NULL;

CREATE INDEX `communitypost_collectionId_createdAt_idx` ON `communitypost`(`collectionId`, `createdAt`);
CREATE INDEX `communitypost_cardId_idx` ON `communitypost`(`cardId`);

ALTER TABLE `communitypost`
  ADD CONSTRAINT `communitypost_collectionId_fkey`
  FOREIGN KEY (`collectionId`) REFERENCES `collection`(`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `communitypost_cardId_fkey`
  FOREIGN KEY (`cardId`) REFERENCES `card`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
