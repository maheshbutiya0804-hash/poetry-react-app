-- phpMyAdmin SQL Dump
-- version 5.2.3
-- https://www.phpmyadmin.net/
--
-- Host: localhost:3306
-- Generation Time: Aug 13, 2026 at 07:47 AM
-- Server version: 8.0.46-37
-- PHP Version: 8.4.24

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `laurentine_notes`
--

-- --------------------------------------------------------

--
-- Table structure for table `authsession`
--

CREATE TABLE `authsession` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `userId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `tokenHash` char(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `expiresAt` datetime(3) NOT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `lastSeenAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `authsession`
--

INSERT INTO `authsession` (`id`, `userId`, `tokenHash`, `expiresAt`, `createdAt`, `lastSeenAt`) VALUES
('cmsisqs7w00002kubs59mcbap', 'cmsir00pf00002kubujszi8tq', 'dc627dc48344159acb8683ca66d78bada569bd886562b354f26f08d6e20fb633', '2026-08-14 10:23:05.557', '2026-08-07 10:23:05.564', '2026-08-07 10:23:05.564'),
('cmsiss09z00022kubwoxsuvfp', 'cmsiss09s00012kubdyxz0da5', '8bc7d1c4c2ce7b85e47acfa404ca31918e59411ff40b810f6e4c1d47a7a15375', '2026-08-14 10:24:02.662', '2026-08-07 10:24:02.663', '2026-08-07 10:24:02.663'),
('cmsisskuf00032kubvh6v40el', 'cmsiss09s00012kubdyxz0da5', 'd1ca1d09d41b80545ab5033abf841271ee2498906541bc136449c70699dbd091', '2026-08-14 10:24:29.318', '2026-08-07 10:24:29.319', '2026-08-08 03:33:09.916'),
('cmsjtsk0s00002subo6sfmwiq', 'cmsiss09s00012kubdyxz0da5', '6533b14f23d8e1c273fc5c580f173f557ea1132f3a7ee751b45d3c9ac1559d91', '2026-08-15 03:40:14.033', '2026-08-08 03:40:14.044', '2026-08-08 03:40:14.044'),
('cmsjtv7yg00022subx7f5189e', 'cmsjtv7y600012subeou7txwu', 'fd9f1b8ab3e8fb1870a5eeb8f426d9fde060fa66c68d02a90f766a815c253cfe', '2026-08-15 03:42:18.375', '2026-08-08 03:42:18.376', '2026-08-08 03:57:37.066'),
('cmsjvxmws0001zwubvz3eylx2', 'cmsir00pf00002kubujszi8tq', '83f112172d15006dc0ec8d730171d2fe38e0329e126744dd8889bf0340dbe484', '2026-08-15 04:40:10.297', '2026-08-08 04:40:10.300', '2026-08-08 06:34:46.228'),
('cmsoevzru000010msk3k734hg', 'cmsiss09s00012kubdyxz0da5', 'bc954427ad1b9382055d82c019378d610db7337f8d61339e1ac9b4a47a29221d', '2026-08-18 08:41:50.769', '2026-08-11 08:41:51.066', '2026-08-11 08:41:51.066'),
('cmsof1y64000110ms8hwaf47a', 'cmsiss09s00012kubdyxz0da5', '9dd80715ae124be176dcd777300c92d2320d0f67ebf4bf98be57110865f6a0ab', '2026-08-18 08:46:28.622', '2026-08-11 08:46:28.924', '2026-08-11 08:46:28.924'),
('cmsof3c8i000210msq9qj34mr', 'cmsiss09s00012kubdyxz0da5', '7febb5b7f7137bf5c42c1f64c795e090eba4ae3a4b80df2f80f8e8361540fd7a', '2026-08-18 08:47:33.516', '2026-08-11 08:47:33.810', '2026-08-11 08:47:33.810'),
('cmsof6dfj000310ms37623by5', 'cmsir00pf00002kubujszi8tq', '37a58fd7f14675fa81e845f6bc330dc8ff9bed2069c91c3be69d6309d9afa83b', '2026-08-18 08:49:55.043', '2026-08-11 08:49:55.327', '2026-08-11 08:49:55.327'),
('cmsof7rcr000410msxkwu9blc', 'cmsiss09s00012kubdyxz0da5', '55b4aa36edbd5cb39ae7b6189e89b755d17af64e336c3a52edaf38d314ba9385', '2026-08-18 08:50:59.743', '2026-08-11 08:51:00.027', '2026-08-11 08:51:00.027'),
('cmsoh04q5000110p7frvzf1xe', 'cmsir00pf00002kubujszi8tq', '7c10afa040458cefc348e2a059a9172a9d99fdf82e10f28479762e3911d0f251', '2026-08-18 09:41:03.054', '2026-08-11 09:41:03.342', '2026-08-11 12:16:41.286'),
('cmsom0r0l000010mvlonz8qlo', 'cmsiss09s00012kubdyxz0da5', '1274dfae579fe772e009f468b20c2ab4909c620c43b8b4c4f3d33f62e0767a16', '2026-08-18 12:01:30.005', '2026-08-11 12:01:30.309', '2026-08-11 12:01:30.309'),
('cmsr19m7o000010k34qjgf8fx', 'cmsiss09s00012kubdyxz0da5', 'eefa9d1ab149b276bda0ff075077ceee4779c1e64af44ff16d41ffd64aad99e1', '2026-08-20 04:43:50.290', '2026-08-13 04:43:50.580', '2026-08-13 06:29:02.650'),
('cmsr22qi1000010pu6qf5pjny', 'cmsiss09s00012kubdyxz0da5', 'a47c38ebb7adb5803205703124b0a3c97a8bcf950d9082f46e90d022da8baab7', '2026-08-20 05:06:29.139', '2026-08-13 05:06:29.161', '2026-08-13 11:56:15.074'),
('cmsrjip9b000110nuflouqiwx', 'cmsir00pf00002kubujszi8tq', 'cd3f9f8dbbaa5f4647968b5bc222465dc9682b0dc707072725b7b7c6f93a8007', '2026-08-20 13:14:47.477', '2026-08-13 13:14:47.519', '2026-08-13 13:30:41.579');

-- --------------------------------------------------------

--
-- Table structure for table `card`
--

CREATE TABLE `card` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `slug` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `collectionId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `title` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `pdfPath` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `previewPath` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `originalFileName` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `widthInches` double NOT NULL DEFAULT '7',
  `heightInches` double NOT NULL DEFAULT '5',
  `orientation` varchar(32) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'landscape',
  `sideCount` int NOT NULL DEFAULT '1',
  `pageCount` int NOT NULL DEFAULT '1',
  `isPublished` tinyint(1) NOT NULL DEFAULT '0',
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL,
  `adminNotes` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `backLayout` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin,
  `frontLayout` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin,
  `isFeatured` tinyint(1) NOT NULL DEFAULT '0',
  `poemText` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `templateKey` varchar(80) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'botanical-cream',
  `categoryId` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL
) ;

--
-- Dumping data for table `card`
--

INSERT INTO `card` (`id`, `slug`, `collectionId`, `title`, `description`, `pdfPath`, `previewPath`, `originalFileName`, `widthInches`, `heightInches`, `orientation`, `sideCount`, `pageCount`, `isPublished`, `createdAt`, `updatedAt`, `adminNotes`, `backLayout`, `frontLayout`, `isFeatured`, `poemText`, `templateKey`, `categoryId`) VALUES
('card_believe_in_you', 'i-believe-in-you', 'col_encouragement', 'I Believe in You', 'Remind someone of their strength when they need it.', NULL, NULL, NULL, 7, 5, 'landscape', 1, 1, 1, '2026-08-11 07:39:00.000', '2026-08-11 07:39:00.000', '', NULL, NULL, 0, 'Even on the days when you doubt yourself, I hope you can borrow some of my belief in you. You are stronger and more capable than this moment makes you feel.', 'botanical-cream', 'cat_thinking_of_you'),
('card_best_decision', 'still-my-best-decision', 'col_anniversary', 'Still My Best Decision', 'A romantic anniversary message with a playful touch.', NULL, NULL, NULL, 7, 5, 'landscape', 1, 1, 1, '2026-08-11 07:39:00.000', '2026-08-11 07:39:00.000', '', NULL, NULL, 0, 'Of all the choices life has asked me to make, loving you remains the easiest and best one.', 'botanical-cream', 'cat_anniversary'),
('card_birthday_amazing', 'another-year-more-amazing', 'col_birthday_wishes', 'Another Year, More Amazing', 'A joyful birthday note celebrating who they have become.', NULL, NULL, NULL, 7, 5, 'landscape', 1, 1, 1, '2026-08-11 07:39:00.000', '2026-08-11 07:39:00.000', '', NULL, NULL, 1, 'Another year older, wiser, stronger, and somehow even more wonderful. I hope this next chapter gives you more reasons to smile than you can count.', 'botanical-cream', 'cat_birthday'),
('card_brighter_day', 'you-made-my-day-brighter', 'col_gratitude_thanks', 'You Made My Day Brighter', 'A cheerful note of appreciation.', NULL, NULL, NULL, 7, 5, 'landscape', 1, 1, 1, '2026-08-11 07:39:00.000', '2026-08-11 07:39:00.000', '', NULL, NULL, 0, 'You showed up with kindness exactly when it mattered. Thank you for making a difficult day feel a little lighter.', 'botanical-cream', 'cat_thank_you'),
('card_butterflies', 'you-still-give-me-butterflies', 'col_love_romance', 'You Still Give Me Butterflies', 'For the person who still makes your heart skip a beat.', NULL, NULL, NULL, 7, 5, 'landscape', 1, 1, 1, '2026-08-11 07:39:00.000', '2026-08-11 07:39:00.000', '', NULL, NULL, 1, 'Somehow, after all this time, you can still make an ordinary moment feel special. One smile from you, one look across the room, and there it is again—that little spark that reminds me how lucky I am to love you. Still falling for you.', 'botanical-cream', 'cat_love'),
('card_choose_you', 'i-choose-you-every-day', 'col_love_romance', 'I Choose You, Every Day', 'Simple words for a love you keep choosing.', NULL, NULL, NULL, 7, 5, 'landscape', 1, 1, 1, '2026-08-11 07:39:00.000', '2026-08-11 07:39:00.000', '', NULL, NULL, 0, 'Love is not only one big promise. It is a thousand small choices, made again and again. And every day, in all the little ways that matter, I choose you.', 'botanical-cream', 'cat_love'),
('card_favorite_place', 'my-favorite-place-is-with-you', 'col_love_romance', 'My Favorite Place Is With You', 'A warm reminder that home can be a person.', NULL, NULL, NULL, 7, 5, 'landscape', 1, 1, 1, '2026-08-11 07:39:00.000', '2026-08-11 07:39:00.000', '', NULL, NULL, 0, 'No matter where life takes us, my favorite place will always be wherever you are. You make ordinary days feel softer, brighter, and more like home.', 'botanical-cream', 'cat_love'),
('card_grateful_words', 'more-grateful-than-words-can-say', 'col_gratitude_thanks', 'More Grateful Than Words Can Say', 'A sincere thank-you for someone who made a difference.', NULL, NULL, NULL, 7, 5, 'landscape', 1, 1, 1, '2026-08-11 07:39:00.000', '2026-08-11 07:39:00.000', '', NULL, NULL, 1, 'Some kindness stays with you long after the moment has passed. Thank you for being one of those people whose goodness leaves a lasting mark.', 'botanical-cream', 'cat_thank_you'),
('card_heres_to_us', 'heres-to-us', 'col_anniversary', 'Here\'s to Us', 'Celebrate everything you have built together.', NULL, NULL, NULL, 7, 5, 'landscape', 1, 1, 1, '2026-08-11 07:39:00.000', '2026-08-11 07:39:00.000', '', NULL, NULL, 0, 'Here\'s to every memory behind us, every adventure still ahead, and every ordinary day in between that we get to share together.', 'botanical-cream', 'cat_anniversary'),
('card_life_better_friend', 'life-is-better-with-you', 'col_friendship', 'Life Is Better With You In It', 'For the friend who makes ordinary days better.', NULL, NULL, NULL, 7, 5, 'landscape', 1, 1, 1, '2026-08-11 07:39:00.000', '2026-08-11 07:39:00.000', '', NULL, NULL, 1, 'Some people simply make life better by being in it. Thank you for the laughs, the honesty, the memories, and the friendship I never take for granted.', 'botanical-cream', 'cat_just_because'),
('card_lucky_friend', 'lucky-to-call-you-my-friend', 'col_friendship', 'Lucky to Call You My Friend', 'A genuine reminder of how much their friendship means.', NULL, NULL, NULL, 7, 5, 'landscape', 1, 1, 1, '2026-08-11 07:39:00.000', '2026-08-11 07:39:00.000', '', NULL, NULL, 0, 'There are people you meet, and then there are people you are genuinely grateful life brought your way. I am lucky to call you my friend.', 'botanical-cream', 'cat_just_because'),
('card_one_day', 'one-day-at-a-time', 'col_encouragement', 'One Day at a Time', 'Gentle encouragement when everything feels overwhelming.', NULL, NULL, NULL, 7, 5, 'landscape', 1, 1, 1, '2026-08-11 07:39:00.000', '2026-08-11 07:39:00.000', '', NULL, NULL, 0, 'You do not need to solve everything at once. Today only asks you to take the next small step. Tomorrow can wait.', 'botanical-cream', 'cat_thinking_of_you'),
('card_showing_up', 'thanks-for-always-showing-up', 'col_friendship', 'Thanks for Always Showing Up', 'For the friend who is there through everything.', NULL, NULL, NULL, 7, 5, 'landscape', 1, 1, 1, '2026-08-11 07:39:00.000', '2026-08-11 07:39:00.000', '', NULL, NULL, 0, 'Thank you for being there in the good moments, the messy moments, and all the ordinary moments in between.', 'botanical-cream', 'cat_thank_you'),
('card_thank_you_you', 'thank-you-for-being-you', 'col_gratitude_thanks', 'Thank You for Being You', 'Sometimes the person matters even more than what they did.', NULL, NULL, NULL, 7, 5, 'landscape', 1, 1, 1, '2026-08-11 07:39:00.000', '2026-08-11 07:39:00.000', '', NULL, NULL, 0, 'Thank you not only for what you do, but for who you are. Your warmth, patience, and heart mean more than you probably realize.', 'botanical-cream', 'cat_thank_you'),
('card_unforgettable_year', 'make-this-year-unforgettable', 'col_birthday_wishes', 'Make This Year Unforgettable', 'An uplifting wish for the year ahead.', NULL, NULL, NULL, 7, 5, 'landscape', 1, 1, 1, '2026-08-11 07:39:00.000', '2026-08-11 07:39:00.000', '', NULL, NULL, 0, 'May this year bring bold dreams, unexpected laughter, meaningful adventures, and plenty of moments worth remembering.', 'botanical-cream', 'cat_birthday'),
('card_world_better', 'world-got-better-when-you-arrived', 'col_birthday_wishes', 'The World Got Better When You Arrived', 'A heartfelt way to make their birthday feel special.', NULL, NULL, NULL, 7, 5, 'landscape', 1, 1, 1, '2026-08-11 07:39:00.000', '2026-08-11 07:39:00.000', '', NULL, NULL, 0, 'The world became a little brighter the day you arrived. I hope today reminds you just how loved, appreciated, and unforgettable you are.', 'botanical-cream', 'cat_birthday'),
('card_yes_again', 'id-say-yes-all-over-again', 'col_anniversary', 'I\'d Say Yes All Over Again', 'For celebrating a love you would choose all over again.', NULL, NULL, NULL, 7, 5, 'landscape', 1, 1, 1, '2026-08-11 07:39:00.000', '2026-08-11 07:39:00.000', '', NULL, NULL, 1, 'If I could go back to the beginning, knowing everything I know now, I would still choose you. I would still say yes. Every single time.', 'botanical-cream', 'cat_anniversary'),
('card_you_got_this', 'youve-got-this', 'col_encouragement', 'You\'ve Got This', 'A little confidence boost for a difficult day.', NULL, NULL, NULL, 7, 5, 'landscape', 1, 1, 1, '2026-08-11 07:39:00.000', '2026-08-11 07:39:00.000', '', NULL, NULL, 1, 'You do not have to have every answer today. Keep moving, keep trusting yourself, and remember how many hard things you have already made it through.', 'botanical-cream', 'cat_thinking_of_you');

-- --------------------------------------------------------

--
-- Table structure for table `cardorder`
--

CREATE TABLE `cardorder` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `orderNumber` varchar(80) COLLATE utf8mb4_unicode_ci NOT NULL,
  `userId` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `customerName` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `customerEmail` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `cardTitle` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `cardCategory` varchar(120) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `quantity` int NOT NULL DEFAULT '1',
  `shippingFee` decimal(10,2) DEFAULT NULL,
  `totalAmount` decimal(10,2) DEFAULT NULL,
  `status` varchar(32) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'PLACED',
  `reviewed` tinyint(1) NOT NULL DEFAULT '0',
  `shippingName` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `shippingAddress` text COLLATE utf8mb4_unicode_ci,
  `trackingNumber` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `placedAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `shippedAt` datetime(3) DEFAULT NULL,
  `deliveredAt` datetime(3) DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `cardorder`
--

INSERT INTO `cardorder` (`id`, `orderNumber`, `userId`, `customerName`, `customerEmail`, `cardTitle`, `cardCategory`, `quantity`, `shippingFee`, `totalAmount`, `status`, `reviewed`, `shippingName`, `shippingAddress`, `trackingNumber`, `placedAt`, `shippedAt`, `deliveredAt`, `createdAt`, `updatedAt`) VALUES
('cmsirlj940000qgubm6zqk2wr', 'HSN-DEMO-0001', 'cmsir00po00012kubomju7paq', 'Demo Member', 'member@heartstringnotes.local', 'Moonlit Vow', 'Love', 1, NULL, NULL, 'PLACED', 0, NULL, NULL, NULL, '2026-08-07 09:51:01.048', NULL, NULL, '2026-08-07 09:51:01.048', '2026-08-07 09:51:01.048');

-- --------------------------------------------------------

--
-- Table structure for table `category`
--

CREATE TABLE `category` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `slug` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `isActive` tinyint(1) NOT NULL DEFAULT '1',
  `sortOrder` int NOT NULL DEFAULT '0',
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `category`
--

INSERT INTO `category` (`id`, `name`, `slug`, `description`, `isActive`, `sortOrder`, `createdAt`, `updatedAt`) VALUES
('cat_anniversary', 'Anniversary', 'anniversary', NULL, 1, 1, '2026-08-11 06:20:40.000', '2026-08-11 06:20:40.000'),
('cat_birthday', 'Birthday', 'birthday', '', 1, 2, '2026-08-11 06:20:40.000', '2026-08-11 13:10:14.152'),
('cat_congratulations', 'Congratulations', 'congratulations', NULL, 1, 6, '2026-08-11 06:20:40.000', '2026-08-11 06:20:40.000'),
('cat_just_because', 'Just Because', 'just-because', NULL, 1, 9, '2026-08-11 06:20:40.000', '2026-08-11 06:20:40.000'),
('cat_love', 'Love', 'love', NULL, 1, 3, '2026-08-11 06:20:40.000', '2026-08-11 06:20:40.000'),
('cat_other', 'Other', 'other', NULL, 1, 10, '2026-08-11 06:20:40.000', '2026-08-11 06:20:40.000'),
('cat_sympathy', 'Sympathy', 'sympathy', NULL, 1, 8, '2026-08-11 06:20:40.000', '2026-08-11 06:20:40.000'),
('cat_thank_you', 'Thank You', 'thank-you', NULL, 1, 5, '2026-08-11 06:20:40.000', '2026-08-11 06:20:40.000'),
('cat_thinking_of_you', 'Thinking of You', 'thinking-of-you', NULL, 1, 7, '2026-08-11 06:20:40.000', '2026-08-11 06:20:40.000'),
('cat_wedding', 'Wedding', 'wedding', NULL, 1, 4, '2026-08-11 06:20:40.000', '2026-08-11 06:20:40.000');

-- --------------------------------------------------------

--
-- Table structure for table `challenge`
--

CREATE TABLE `challenge` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `title` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `challengeMonth` datetime(3) NOT NULL,
  `overview` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `goal` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `howToComplete` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `relationshipBenefit` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `imagePath` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` varchar(32) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'DRAFT',
  `publishedAt` datetime(3) DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `challengereminder`
--

CREATE TABLE `challengereminder` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `challengeId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `dayOfMonth` int NOT NULL,
  `timeOfDay` varchar(10) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '09:00',
  `channel` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'EMAIL',
  `isActive` tinyint(1) NOT NULL DEFAULT '1',
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `collection`
--

CREATE TABLE `collection` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `slug` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `sortOrder` int NOT NULL DEFAULT '0',
  `isActive` tinyint(1) NOT NULL DEFAULT '1',
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `collection`
--

INSERT INTO `collection` (`id`, `slug`, `name`, `description`, `sortOrder`, `isActive`, `createdAt`, `updatedAt`) VALUES
('', 'happly_birthday', 'Happy Birthday', '', 0, 1, '2026-08-11 07:45:19.000', '2026-08-11 07:45:19.000'),
('col_anniversary', 'anniversary', 'Anniversary', 'Celebrate another chapter of love together.', 3, 1, '2026-08-11 07:39:00.000', '2026-08-11 07:39:00.000'),
('col_birthday_wishes', 'birthday-wishes', 'Birthday Wishes', 'Thoughtful birthday messages worth remembering.', 2, 1, '2026-08-11 07:39:00.000', '2026-08-11 07:39:00.000'),
('col_encouragement', 'encouragement', 'Encouragement', 'A few heartfelt words when someone needs them most.', 6, 1, '2026-08-11 07:39:00.000', '2026-08-11 07:39:00.000'),
('col_friendship', 'friendship', 'Friendship', 'Meaningful notes for the friends who make life better.', 5, 1, '2026-08-11 07:39:00.000', '2026-08-11 07:39:00.000'),
('col_gratitude_thanks', 'gratitude-thanks', 'Gratitude & Thanks', 'Beautiful ways to say thank you from the heart.', 4, 1, '2026-08-11 07:39:00.000', '2026-08-11 07:39:00.000'),
('col_love_romance', 'love-romance', 'Love & Romance', 'Heartfelt notes for the one who means everything.', 1, 1, '2026-08-11 07:39:00.000', '2026-08-11 07:39:00.000');

-- --------------------------------------------------------

--
-- Table structure for table `communitypost`
--

CREATE TABLE `communitypost` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `authorId` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `authorName` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `category` varchar(120) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'General',
  `title` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `body` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `status` varchar(32) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'PUBLISHED',
  `isReported` tinyint(1) NOT NULL DEFAULT '0',
  `reportCount` int NOT NULL DEFAULT '0',
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `communityresponse`
--

CREATE TABLE `communityresponse` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `postId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `authorName` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `body` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `status` varchar(32) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'PUBLISHED',
  `isReported` tinyint(1) NOT NULL DEFAULT '0',
  `reportCount` int NOT NULL DEFAULT '0',
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `notificationjob`
--

CREATE TABLE `notificationjob` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `channel` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'EMAIL',
  `audience` varchar(32) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'SINGLE_USER',
  `selectedUserId` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `recipientEmail` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `subject` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `message` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `status` varchar(32) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'QUEUED',
  `totalRecipients` int NOT NULL DEFAULT '0',
  `sentCount` int NOT NULL DEFAULT '0',
  `failedCount` int NOT NULL DEFAULT '0',
  `sentAt` datetime(3) DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `paymenttransaction`
--

CREATE TABLE `paymenttransaction` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `userId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `providerTransactionId` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `description` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'Subscription update',
  `amount` decimal(10,2) NOT NULL,
  `currency` varchar(10) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'USD',
  `status` varchar(32) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'SUCCESS',
  `occurredAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `paymenttransaction`
--

INSERT INTO `paymenttransaction` (`id`, `userId`, `providerTransactionId`, `description`, `amount`, `currency`, `status`, `occurredAt`, `createdAt`) VALUES
('cmsir00q400032kubj44a7211', 'cmsir00po00012kubomju7paq', 'demo-payment-001', 'Subscription update', 8.99, 'USD', 'FAILED', '2026-08-07 09:34:17.260', '2026-08-07 09:34:17.260');

-- --------------------------------------------------------

--
-- Table structure for table `poetryrequest`
--

CREATE TABLE `poetryrequest` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `userId` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `requesterName` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `requesterEmail` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `category` varchar(120) COLLATE utf8mb4_unicode_ci NOT NULL,
  `occasion` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `prompt` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `status` varchar(32) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'PENDING',
  `adminNotes` text COLLATE utf8mb4_unicode_ci,
  `completedAt` datetime(3) DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `subscription`
--

CREATE TABLE `subscription` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `userId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `planName` varchar(120) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'Monthly Access',
  `status` varchar(32) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'INCOMPLETE',
  `paymentStatus` varchar(32) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'NONE',
  `monthlyPrice` decimal(10,2) NOT NULL DEFAULT '8.99',
  `startedAt` datetime(3) DEFAULT NULL,
  `currentPeriodEnd` datetime(3) DEFAULT NULL,
  `cancelledAt` datetime(3) DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL,
  `cancelAtPeriodEnd` tinyint(1) NOT NULL DEFAULT '0'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `subscription`
--

INSERT INTO `subscription` (`id`, `userId`, `planName`, `status`, `paymentStatus`, `monthlyPrice`, `startedAt`, `currentPeriodEnd`, `cancelledAt`, `createdAt`, `updatedAt`, `cancelAtPeriodEnd`) VALUES
('cmsir00pv00022kubvyt86cup', 'cmsir00po00012kubomju7paq', 'Monthly Access', 'INCOMPLETE', 'FAILED', 8.99, NULL, NULL, NULL, '2026-08-07 09:34:17.251', '2026-08-07 09:34:17.251', 0);

-- --------------------------------------------------------

--
-- Table structure for table `systemsetting`
--

CREATE TABLE `systemsetting` (
  `id` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'platform',
  `defaultPrintingFee` decimal(10,2) NOT NULL DEFAULT '7.00',
  `orderFeedbackEmail` tinyint(1) NOT NULL DEFAULT '1',
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `systemsetting`
--

INSERT INTO `systemsetting` (`id`, `defaultPrintingFee`, `orderFeedbackEmail`, `createdAt`, `updatedAt`) VALUES
('platform', 7.00, 1, '2026-08-07 10:11:32.356', '2026-08-07 10:12:03.691');

-- --------------------------------------------------------

--
-- Table structure for table `user`
--

CREATE TABLE `user` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `fullName` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `phone` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `role` varchar(32) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'USER',
  `status` varchar(32) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'ACTIVE',
  `joinedAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL,
  `lastLoginAt` datetime(3) DEFAULT NULL,
  `passwordHash` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `googleSubject` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `profileImageUrl` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `user`
--

INSERT INTO `user` (`id`, `fullName`, `email`, `phone`, `role`, `status`, `joinedAt`, `createdAt`, `updatedAt`, `lastLoginAt`, `passwordHash`, `googleSubject`, `profileImageUrl`) VALUES
('cmsir00pf00002kubujszi8tq', 'Heartstring Admin', 'admin@heartstringnotes.local', NULL, 'ADMIN', 'ACTIVE', '2026-08-07 09:34:17.235', '2026-08-07 09:34:17.235', '2026-08-13 13:14:47.700', '2026-08-13 13:14:47.623', 'scrypt$ccdf4496d2c2763a8030f44f59f2a1e1$97b331d4470b73ee628001a809cb33936be24becb1a16c60b3b12f95f5faf67a0c6b6abf8c647e4c26080bb47d73913cae44729f468fa8af763386928c234566', NULL, NULL),
('cmsir00po00012kubomju7paq', 'Demo Member', 'member@heartstringnotes.local', NULL, 'USER', 'ACTIVE', '2026-08-07 09:34:17.244', '2026-08-07 09:34:17.244', '2026-08-07 09:35:16.610', NULL, NULL, NULL, NULL),
('cmsiss09s00012kubdyxz0da5', 'Mahesh Butiya', 'butiyam@gmail.com', '+918140959764', 'USER', 'ACTIVE', '2026-08-07 10:24:02.656', '2026-08-07 10:24:02.656', '2026-08-13 12:02:52.118', '2026-08-13 12:02:51.791', 'scrypt$d894e5876b4b7fbabbcc508727a5fe5e$3538c0fb8d9b419763c9098bc3bdb6fff06196295c35f4b3288d6e052083278143c1626e9ec79b8937a4c32085f8978bc0c04616998ce3b8dcd0c8d092649fa7', '102336979861420334588', 'https://lh3.googleusercontent.com/a/ACg8ocJrlf2t0-cPBqOuET258sZEm1iIvuJ4vXORgVCuSUQuLpu0tWz3=s96-c'),
('cmsjtv7y600012subeou7txwu', 'Butiya Mahesh', 'butiya.mahesh8@gmail.com', NULL, 'USER', 'ACTIVE', '2026-08-08 03:42:18.366', '2026-08-08 03:42:18.366', '2026-08-08 03:42:18.366', '2026-08-08 03:42:18.363', NULL, '110899448327196064966', 'https://lh3.googleusercontent.com/a/ACg8ocJsD6abkAt5UH3u4WAbgX1exfhx-2JGuW952qkY26OsLS-hkQ=s96-c');

-- --------------------------------------------------------

--
-- Table structure for table `_prisma_migrations`
--

CREATE TABLE `_prisma_migrations` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `checksum` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `finished_at` datetime(3) DEFAULT NULL,
  `migration_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `logs` text COLLATE utf8mb4_unicode_ci,
  `rolled_back_at` datetime(3) DEFAULT NULL,
  `started_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `applied_steps_count` int UNSIGNED NOT NULL DEFAULT '0'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `_prisma_migrations`
--

INSERT INTO `_prisma_migrations` (`id`, `checksum`, `finished_at`, `migration_name`, `logs`, `rolled_back_at`, `started_at`, `applied_steps_count`) VALUES
('2b40b837-2276-4fa0-aae0-ed8e08640c9b', 'bde00ca1431256dfe5721384267973e0e91be1693db961821bf1f522eff75cd3', '2026-08-08 03:39:39.996', '20260808033939_add_google_auth_fields', NULL, NULL, '2026-08-08 03:39:39.969', 1),
('33a1d084-0414-4bd4-959d-67c3c838a90f', 'ff7f0c957bab7e0606db4a2541c2cfeb814fa770bac8d3f797cb3128529a5653', '2026-08-07 09:50:55.819', '20260807095055_add_requests_orders', NULL, NULL, '2026-08-07 09:50:55.722', 1),
('3ea25dbd-2c89-4d14-9f50-0c9c3934c67d', 'c7d0c10136ed63c6ea566dfd13cb0063006e6bb2c9658a14edbf203b9a9bc025', '2026-08-07 10:19:55.572', '20260807101955_add_auth_sessions', NULL, NULL, '2026-08-07 10:19:55.526', 1),
('5c0cf776-49a7-4a25-8df6-d8cd0f374545', '6bd1b02ad6167263adffdd3cefaff7342c7ec6eff60f6e4c9a91eff7f735b424', '2026-08-11 12:36:08.575', '20260811094851_add_categories', '', NULL, '2026-08-11 12:36:08.575', 0),
('608acfa3-a0c6-4990-92b3-ce5cbefe5112', 'a392f48141d4afd9296477f5cc98e1fc2db982fe9f5d4c41b90859f969a7c590', '2026-08-11 13:07:38.533', '20260811180000_add_card_category_relation', NULL, NULL, '2026-08-11 13:07:37.678', 1),
('8a0d0775-e8c2-40c5-95b8-ea05c8c98966', '7724ac43b4e411f9a2ca31af797da10fc13ce46bece9119a5b9b06aa3bab2c06', '2026-08-07 10:10:56.699', '20260807101056_add_notifications_community_settings', NULL, NULL, '2026-08-07 10:10:56.599', 1),
('9d2bbce7-f62b-4814-9b40-f8bda0c92a06', 'd86676b7eea73d9998d44a59773571df1d39f43bb72bfedda8faf50d70dc8f2c', '2026-08-07 09:43:54.635', '20260807094354_add_challenges_and_user_detail', NULL, NULL, '2026-08-07 09:43:54.567', 1),
('b1651b2a-ae5f-428b-aafa-0735417be000', '843054ee85b20fd25c47163c7bfbd4f48aa4ac9d49133ccfdb464d174d0bca97', '2026-08-07 09:58:30.381', '20260807095830_add_card_editor_fields', NULL, NULL, '2026-08-07 09:58:30.357', 1),
('c7b3e557-7669-4597-9cc2-a991addc9e07', 'a82cf9bfdd0f3e9490a02362764035d64b4f7c0e8c4ef3298e166b24715eb4ed', '2026-08-07 08:56:53.163', '20260807085653_init_mysql', NULL, NULL, '2026-08-07 08:56:53.084', 1),
('e0c0a44a-f92e-4082-8dd3-5197bbed1653', '2e51dd616b870cdf7e72ad3bf67788b03f8aa579ed481f2e47ed46a75594867a', '2026-08-07 09:34:08.701', '20260807093408_add_users_subscriptions', NULL, NULL, '2026-08-07 09:34:08.562', 1),
('e7d294ba-a875-4102-b934-e1dd997644df', '6bd1b02ad6167263adffdd3cefaff7342c7ec6eff60f6e4c9a91eff7f735b424', NULL, '20260811094851_add_categories', 'A migration failed to apply. New migrations cannot be applied before the error is recovered from. Read more about how to resolve migration issues in a production database: https://pris.ly/d/migrate-resolve\n\nMigration name: 20260811094851_add_categories\n\nDatabase error code: 1061\n\nDatabase error:\nDuplicate key name \'authsession_expiresAt_idx\'\n\nPlease check the query number 20 from the migration file.\n\n   0: sql_schema_connector::apply_migration::apply_script\n           with migration_name=\"20260811094851_add_categories\"\n             at schema-engine/connectors/sql-schema-connector/src/apply_migration.rs:113\n   1: schema_commands::commands::apply_migrations::Applying migration\n           with migration_name=\"20260811094851_add_categories\"\n             at schema-engine/commands/src/commands/apply_migrations.rs:95\n   2: schema_core::state::ApplyMigrations\n             at schema-engine/core/src/state.rs:255', '2026-08-11 12:36:08.051', '2026-08-11 09:54:30.026', 0);

--
-- Indexes for dumped tables
--

--
-- Indexes for table `authsession`
--
ALTER TABLE `authsession`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `AuthSession_tokenHash_key` (`tokenHash`),
  ADD KEY `AuthSession_userId_expiresAt_idx` (`userId`,`expiresAt`),
  ADD KEY `AuthSession_expiresAt_idx` (`expiresAt`);

--
-- Indexes for table `card`
--
ALTER TABLE `card`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `Card_slug_key` (`slug`),
  ADD KEY `Card_collectionId_isPublished_idx` (`collectionId`,`isPublished`),
  ADD KEY `Card_isPublished_createdAt_idx` (`isPublished`,`createdAt`),
  ADD KEY `card_categoryId_idx` (`categoryId`);

--
-- Indexes for table `cardorder`
--
ALTER TABLE `cardorder`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `CardOrder_orderNumber_key` (`orderNumber`),
  ADD KEY `CardOrder_status_placedAt_idx` (`status`,`placedAt`),
  ADD KEY `CardOrder_reviewed_idx` (`reviewed`),
  ADD KEY `CardOrder_userId_idx` (`userId`);

--
-- Indexes for table `category`
--
ALTER TABLE `category`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `category_name_key` (`name`),
  ADD UNIQUE KEY `category_slug_key` (`slug`),
  ADD KEY `category_isActive_sortOrder_idx` (`isActive`,`sortOrder`);

--
-- Indexes for table `challenge`
--
ALTER TABLE `challenge`
  ADD PRIMARY KEY (`id`),
  ADD KEY `Challenge_status_challengeMonth_idx` (`status`,`challengeMonth`);

--
-- Indexes for table `challengereminder`
--
ALTER TABLE `challengereminder`
  ADD PRIMARY KEY (`id`),
  ADD KEY `ChallengeReminder_challengeId_dayOfMonth_idx` (`challengeId`,`dayOfMonth`);

--
-- Indexes for table `collection`
--
ALTER TABLE `collection`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `Collection_slug_key` (`slug`),
  ADD KEY `Collection_isActive_sortOrder_idx` (`isActive`,`sortOrder`);

--
-- Indexes for table `communitypost`
--
ALTER TABLE `communitypost`
  ADD PRIMARY KEY (`id`),
  ADD KEY `CommunityPost_status_createdAt_idx` (`status`,`createdAt`),
  ADD KEY `CommunityPost_isReported_createdAt_idx` (`isReported`,`createdAt`);

--
-- Indexes for table `communityresponse`
--
ALTER TABLE `communityresponse`
  ADD PRIMARY KEY (`id`),
  ADD KEY `CommunityResponse_postId_createdAt_idx` (`postId`,`createdAt`),
  ADD KEY `CommunityResponse_isReported_createdAt_idx` (`isReported`,`createdAt`);

--
-- Indexes for table `notificationjob`
--
ALTER TABLE `notificationjob`
  ADD PRIMARY KEY (`id`),
  ADD KEY `NotificationJob_status_createdAt_idx` (`status`,`createdAt`),
  ADD KEY `NotificationJob_audience_createdAt_idx` (`audience`,`createdAt`),
  ADD KEY `NotificationJob_selectedUserId_idx` (`selectedUserId`);

--
-- Indexes for table `paymenttransaction`
--
ALTER TABLE `paymenttransaction`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `PaymentTransaction_providerTransactionId_key` (`providerTransactionId`),
  ADD KEY `PaymentTransaction_userId_occurredAt_idx` (`userId`,`occurredAt`),
  ADD KEY `PaymentTransaction_status_occurredAt_idx` (`status`,`occurredAt`);

--
-- Indexes for table `poetryrequest`
--
ALTER TABLE `poetryrequest`
  ADD PRIMARY KEY (`id`),
  ADD KEY `PoetryRequest_status_createdAt_idx` (`status`,`createdAt`),
  ADD KEY `PoetryRequest_category_idx` (`category`),
  ADD KEY `PoetryRequest_userId_idx` (`userId`);

--
-- Indexes for table `subscription`
--
ALTER TABLE `subscription`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `Subscription_userId_key` (`userId`),
  ADD KEY `Subscription_status_idx` (`status`),
  ADD KEY `Subscription_paymentStatus_idx` (`paymentStatus`);

--
-- Indexes for table `systemsetting`
--
ALTER TABLE `systemsetting`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `user`
--
ALTER TABLE `user`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `User_email_key` (`email`),
  ADD UNIQUE KEY `User_googleSubject_key` (`googleSubject`),
  ADD KEY `User_role_status_idx` (`role`,`status`),
  ADD KEY `User_joinedAt_idx` (`joinedAt`);

--
-- Indexes for table `_prisma_migrations`
--
ALTER TABLE `_prisma_migrations`
  ADD PRIMARY KEY (`id`);

--
-- Constraints for dumped tables
--

--
-- Constraints for table `authsession`
--
ALTER TABLE `authsession`
  ADD CONSTRAINT `authsession_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `user` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `card`
--
ALTER TABLE `card`
  ADD CONSTRAINT `card_categoryId_fkey` FOREIGN KEY (`categoryId`) REFERENCES `category` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `card_collectionId_fkey` FOREIGN KEY (`collectionId`) REFERENCES `collection` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `cardorder`
--
ALTER TABLE `cardorder`
  ADD CONSTRAINT `cardorder_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `user` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `challengereminder`
--
ALTER TABLE `challengereminder`
  ADD CONSTRAINT `challengereminder_challengeId_fkey` FOREIGN KEY (`challengeId`) REFERENCES `challenge` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `communityresponse`
--
ALTER TABLE `communityresponse`
  ADD CONSTRAINT `communityresponse_postId_fkey` FOREIGN KEY (`postId`) REFERENCES `communitypost` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `notificationjob`
--
ALTER TABLE `notificationjob`
  ADD CONSTRAINT `notificationjob_selectedUserId_fkey` FOREIGN KEY (`selectedUserId`) REFERENCES `user` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `paymenttransaction`
--
ALTER TABLE `paymenttransaction`
  ADD CONSTRAINT `paymenttransaction_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `user` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `poetryrequest`
--
ALTER TABLE `poetryrequest`
  ADD CONSTRAINT `poetryrequest_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `user` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `subscription`
--
ALTER TABLE `subscription`
  ADD CONSTRAINT `subscription_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `user` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
