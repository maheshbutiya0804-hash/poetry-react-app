ALTER TABLE `challengereminder`
  ADD COLUMN `emailSubject` VARCHAR(255) NULL,
  ADD COLUMN `emailMessage` TEXT NULL,
  ADD COLUMN `smsMessage` TEXT NULL;
