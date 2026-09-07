ALTER TABLE `cardorder`
  ADD COLUMN `estimatedDeliveryDate` DATETIME(3) NULL,
  ADD COLUMN `feedbackRating` INTEGER NULL,
  ADD COLUMN `feedbackText` TEXT NULL,
  ADD COLUMN `paymentStatus` VARCHAR(32) NOT NULL DEFAULT 'UNPAID',
  ADD COLUMN `paymentReceipt` VARCHAR(500) NULL,
  ADD COLUMN `paymentDate` DATETIME(3) NULL,
  ADD COLUMN `paymentMethod` VARCHAR(80) NULL,
  ADD COLUMN `refundStatus` VARCHAR(80) NULL,
  ADD COLUMN `stripePaymentId` VARCHAR(191) NULL;
