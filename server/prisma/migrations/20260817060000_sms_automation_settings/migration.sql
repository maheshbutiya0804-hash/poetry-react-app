ALTER TABLE `systemsetting`
  ADD COLUMN `automaticSmsEnabled` BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN `smsPoetryRequestReceived` BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN `smsPoetryRequestCompleted` BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN `smsCardOrderUpdates` BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN `smsChallengeReminders` BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN `smsSubscriptionNotifications` BOOLEAN NOT NULL DEFAULT true;

ALTER TABLE `challengereminder`
  ADD COLUMN `lastSmsSentAt` DATETIME(3) NULL;
