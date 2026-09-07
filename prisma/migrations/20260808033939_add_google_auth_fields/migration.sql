/*
  Warnings:

  - A unique constraint covering the columns `[googleSubject]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE `user` ADD COLUMN `googleSubject` VARCHAR(191) NULL,
    ADD COLUMN `profileImageUrl` VARCHAR(500) NULL;

-- CreateIndex
CREATE UNIQUE INDEX `User_googleSubject_key` ON `User`(`googleSubject`);
