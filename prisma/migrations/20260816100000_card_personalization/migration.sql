ALTER TABLE `cardorder`
  ADD COLUMN `personalizationRecipient` VARCHAR(120) NULL AFTER `shippingName`,
  ADD COLUMN `personalizationSender` VARCHAR(120) NULL AFTER `personalizationRecipient`;
