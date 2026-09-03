ALTER TABLE `user`
  ADD COLUMN `challengeEmailEnabled` BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN `challengeSmsEnabled` BOOLEAN NOT NULL DEFAULT true;
