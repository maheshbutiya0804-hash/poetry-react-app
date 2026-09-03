CREATE TABLE `scavengerlocation` (
  `id` VARCHAR(191) NOT NULL,
  `name` VARCHAR(191) NOT NULL,
  `description` VARCHAR(500) NULL,
  `icon` VARCHAR(80) NULL,
  `imagePath` VARCHAR(500) NULL,
  `isActive` BOOLEAN NOT NULL DEFAULT true,
  `sortOrder` INTEGER NOT NULL DEFAULT 0,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL,
  INDEX `scavengerlocation_isActive_sortOrder_idx`(`isActive`, `sortOrder`),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

INSERT INTO `scavengerlocation` (`id`,`name`,`description`,`icon`,`isActive`,`sortOrder`,`createdAt`,`updatedAt`) VALUES
('scavenger_bathroom_mirror','Bathroom mirror','A sweet surprise during their morning or evening routine.','mirror',true,10,NOW(3),NOW(3)),
('scavenger_nightstand','Nightstand','Place the note somewhere they will notice before bed or after waking.','nightstand',true,20,NOW(3),NOW(3)),
('scavenger_fridge','Fridge','A little love waiting in an everyday kitchen spot.','fridge',true,30,NOW(3),NOW(3)),
('scavenger_lunch_bag','Lunch bag','Send an unexpected moment of affection into their day.','lunch',true,40,NOW(3),NOW(3)),
('scavenger_car','Car','Leave a note where they will find it before their next drive.','car',true,50,NOW(3),NOW(3)),
('scavenger_tv','TV area','Hide it near the place where you relax together.','tv',true,60,NOW(3),NOW(3)),
('scavenger_pillow','Pillow','A personal note waiting at the end of the day.','pillow',true,70,NOW(3),NOW(3)),
('scavenger_bedroom_door','Bedroom door','Place it somewhere impossible to miss.','door',true,80,NOW(3),NOW(3)),
('scavenger_coffee_maker','Coffee maker','Add a loving surprise to their morning coffee routine.','coffee',true,90,NOW(3),NOW(3)),
('scavenger_book','Inside a book','Tuck it inside a book they are currently reading.','book',true,100,NOW(3),NOW(3)),
('scavenger_kitchen_drawer','Kitchen drawer','Turn an ordinary everyday spot into a discovery.','drawer',true,110,NOW(3),NOW(3)),
('scavenger_office_desk','Office desk / favorite seat','Choose the place where they naturally settle during the day.','desk',true,120,NOW(3),NOW(3)),
('scavenger_dinner_breakfast','Dinner / Breakfast','Let the note become part of a meal you share.','meal',true,130,NOW(3),NOW(3));
