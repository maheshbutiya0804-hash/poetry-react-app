-- Link personalized poetry requests to the canonical Collection table.
ALTER TABLE `poetryrequest` ADD COLUMN `collectionId` VARCHAR(191) NULL;

-- Preserve existing requests by matching the legacy category text to collection name/slug.
UPDATE `poetryrequest` pr
JOIN `collection` c ON LOWER(TRIM(pr.`category`)) = LOWER(TRIM(c.`name`))
   OR LOWER(TRIM(pr.`category`)) = LOWER(TRIM(c.`slug`))
SET pr.`collectionId` = c.`id`
WHERE pr.`collectionId` IS NULL;

CREATE INDEX `poetryrequest_collectionId_idx` ON `poetryrequest`(`collectionId`);
ALTER TABLE `poetryrequest` ADD CONSTRAINT `poetryrequest_collectionId_fkey` FOREIGN KEY (`collectionId`) REFERENCES `collection`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
