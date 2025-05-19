-- --------------------------------------------------------
-- 호스트:                          127.0.0.1
-- 서버 버전:                        8.0.40 - MySQL Community Server - GPL
-- 서버 OS:                        Win64
-- HeidiSQL 버전:                  12.10.0.7000
-- --------------------------------------------------------

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET NAMES utf8 */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;



-- 테이블 sample1.tbl_chat_rooms 구조 내보내기
CREATE TABLE IF NOT EXISTS `tbl_chat_rooms` (
  `id` int NOT NULL AUTO_INCREMENT,
  `roomName` varchar(255) DEFAULT NULL,
  `createdAt` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=24 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- 테이블 데이터 sample1.tbl_chat_rooms:~8 rows (대략적) 내보내기
INSERT INTO `tbl_chat_rooms` (`id`, `roomName`, `createdAt`) VALUES
	(1, '대한님과의 1:1 채팅', '2025-05-12 12:06:35'),
	(2, '구글 유저님과의 1:1 채팅', '2025-05-12 12:06:36'),
	(3, '테스트유저님과의 1:1 채팅', '2025-05-12 12:06:37'),
	(4, '방대한님과의 1:1 채팅', '2025-05-12 13:02:15'),
	(5, '구글 유저님과의 1:1 채팅', '2025-05-13 12:08:39'),
	(16, '대한님과의 1:1 채팅', '2025-05-15 19:32:47'),
	(17, '방대한님과의 1:1 채팅', '2025-05-15 19:33:16'),
	(23, '이철수님과의 1:1 채팅', '2025-05-15 20:01:35');

-- 테이블 sample1.tbl_chat_room_users 구조 내보내기
CREATE TABLE IF NOT EXISTS `tbl_chat_room_users` (
  `roomId` int NOT NULL,
  `userId` int NOT NULL,
  `muted` tinyint(1) DEFAULT '0',
  `lastReadMessageId` int DEFAULT NULL,
  PRIMARY KEY (`roomId`,`userId`),
  KEY `userId` (`userId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- 테이블 데이터 sample1.tbl_chat_room_users:~46 rows (대략적) 내보내기
INSERT INTO `tbl_chat_room_users` (`roomId`, `userId`, `muted`, `lastReadMessageId`) VALUES
	(1, 3, 0, NULL),
	(1, 13, 0, NULL),
	(2, 2, 0, NULL),
	(2, 3, 0, NULL),
	(3, 1, 0, NULL),
	(3, 3, 0, NULL),
	(4, 3, 0, NULL),
	(4, 10, 0, NULL),
	(5, 2, 0, NULL),
	(5, 13, 0, NULL),
	(6, 3, 0, NULL),
	(6, 7, 0, NULL),
	(7, 3, 0, NULL),
	(7, 7, 0, NULL),
	(8, 3, 0, NULL),
	(8, 7, 0, NULL),
	(9, 3, 0, NULL),
	(9, 7, 0, NULL),
	(10, 3, 0, NULL),
	(10, 7, 0, NULL),
	(11, 3, 0, NULL),
	(11, 7, 0, NULL),
	(12, 3, 0, NULL),
	(12, 7, 0, NULL),
	(13, 3, 0, NULL),
	(13, 7, 0, NULL),
	(14, 3, 0, NULL),
	(14, 7, 0, NULL),
	(15, 3, 0, NULL),
	(15, 7, 0, NULL),
	(16, 13, 0, NULL),
	(16, 14, 0, NULL),
	(17, 3, 0, NULL),
	(17, 14, 0, NULL),
	(18, 3, 0, NULL),
	(18, 7, 0, NULL),
	(19, 3, 0, NULL),
	(19, 7, 0, NULL),
	(20, 3, 0, NULL),
	(20, 7, 0, NULL),
	(21, 3, 0, NULL),
	(21, 7, 0, NULL),
	(22, 3, 0, NULL),
	(22, 7, 0, NULL),
	(23, 3, 0, NULL),
	(23, 7, 0, NULL);

-- 테이블 sample1.tbl_comment 구조 내보내기
CREATE TABLE IF NOT EXISTS `tbl_comment` (
  `commentId` int NOT NULL AUTO_INCREMENT,
  `postId` int NOT NULL,
  `userId` int NOT NULL,
  `parentId` int DEFAULT NULL,
  `content` text NOT NULL,
  `createdAt` datetime DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`commentId`),
  KEY `postId` (`postId`),
  KEY `userId` (`userId`),
  KEY `parentId` (`parentId`),
  CONSTRAINT `tbl_comment_ibfk_1` FOREIGN KEY (`postId`) REFERENCES `tbl_post` (`postId`) ON DELETE CASCADE,
  CONSTRAINT `tbl_comment_ibfk_2` FOREIGN KEY (`userId`) REFERENCES `tbl_users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `tbl_comment_ibfk_3` FOREIGN KEY (`parentId`) REFERENCES `tbl_comment` (`commentId`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=44 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- 테이블 데이터 sample1.tbl_comment:~18 rows (대략적) 내보내기
INSERT INTO `tbl_comment` (`commentId`, `postId`, `userId`, `parentId`, `content`, `createdAt`, `updatedAt`) VALUES
	(1, 1, 3, NULL, '이건 첫 번째 댓글이에요', '2025-05-07 15:22:21', '2025-05-07 15:22:21'),
	(4, 3, 6, NULL, '와! 저도 가고 싶어요 🏖', '2025-05-07 15:50:29', '2025-05-07 15:51:43'),
	(7, 7, 3, NULL, '11', '2025-05-08 11:11:43', '2025-05-08 11:11:43'),
	(8, 7, 3, NULL, '11', '2025-05-08 11:21:02', '2025-05-08 11:21:02'),
	(9, 9, 3, NULL, '11', '2025-05-08 11:30:21', '2025-05-08 11:30:21'),
	(12, 20, 3, NULL, '11', '2025-05-08 12:20:31', '2025-05-08 12:20:31'),
	(13, 3, 3, NULL, 'ㅈㄷㅈㄷ', '2025-05-08 12:38:32', '2025-05-08 12:38:32'),
	(14, 20, 3, NULL, '댓글테스트11', '2025-05-08 12:48:41', '2025-05-09 11:27:15'),
	(16, 20, 10, NULL, 't', '2025-05-08 13:01:07', '2025-05-08 13:01:07'),
	(22, 20, 3, NULL, '223332432', '2025-05-09 12:34:03', '2025-05-09 12:39:00'),
	(24, 23, 3, NULL, '11', '2025-05-09 12:53:39', '2025-05-09 12:53:39'),
	(25, 24, 3, NULL, '11', '2025-05-12 17:48:34', '2025-05-12 17:48:34'),
	(31, 24, 13, 25, '234', '2025-05-13 11:16:27', '2025-05-13 11:16:27'),
	(32, 20, 13, NULL, '11', '2025-05-13 12:04:59', '2025-05-13 12:04:59'),
	(33, 20, 13, 32, '543', '2025-05-13 12:15:44', '2025-05-13 12:15:44'),
	(34, 25, 3, NULL, '433', '2025-05-13 14:44:14', '2025-05-13 14:44:14'),
	(42, 25, 3, 34, '332', '2025-05-13 18:22:27', '2025-05-13 18:56:34'),
	(43, 25, 3, NULL, '>', '2025-05-14 18:48:58', '2025-05-14 18:48:58');

-- 테이블 sample1.tbl_feed 구조 내보내기
CREATE TABLE IF NOT EXISTS `tbl_feed` (
  `id` int NOT NULL AUTO_INCREMENT,
  `userId` varchar(100) DEFAULT NULL,
  `title` varchar(200) DEFAULT NULL,
  `content` text,
  `cdatetime` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=47 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- 테이블 데이터 sample1.tbl_feed:~2 rows (대략적) 내보내기
INSERT INTO `tbl_feed` (`id`, `userId`, `title`, `content`, `cdatetime`) VALUES
	(45, 'test@test.com', '썸네일 테스트', 'ㅌㅅㅌ', '2025-05-02 02:15:51'),
	(46, 'test@test.com', 'ㅌㅅㅌ', '3343', '2025-05-02 06:06:42');

-- 테이블 sample1.tbl_feed_comments 구조 내보내기
CREATE TABLE IF NOT EXISTS `tbl_feed_comments` (
  `commentId` bigint NOT NULL AUTO_INCREMENT,
  `feedId` bigint NOT NULL,
  `userId` varchar(100) NOT NULL DEFAULT '',
  `content` text NOT NULL,
  `parentId` bigint DEFAULT NULL,
  `createdAt` datetime DEFAULT (now()),
  `updatedAt` datetime DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
  `isDeleted` char(1) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT 'N',
  PRIMARY KEY (`commentId`) USING BTREE
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- 테이블 데이터 sample1.tbl_feed_comments:~3 rows (대략적) 내보내기
INSERT INTO `tbl_feed_comments` (`commentId`, `feedId`, `userId`, `content`, `parentId`, `createdAt`, `updatedAt`, `isDeleted`) VALUES
	(1, 45, 'test@test.com', '첫 번째 댓글입니다.', NULL, '2025-05-02 14:40:32', '2025-05-02 14:41:09', 'N'),
	(2, 45, 'test@test.com', '두 번째 댓글입니다.', NULL, '2025-05-02 14:40:32', '2025-05-02 14:41:10', 'N'),
	(3, 45, 'test@test.com', '세 번째 댓글입니다.', NULL, '2025-05-02 14:40:32', '2025-05-02 14:41:10', 'N');

-- 테이블 sample1.tbl_feed_img 구조 내보내기
CREATE TABLE IF NOT EXISTS `tbl_feed_img` (
  `imgNo` int NOT NULL AUTO_INCREMENT,
  `feedId` int NOT NULL,
  `imgName` varchar(255) NOT NULL,
  `imgPath` varchar(500) NOT NULL,
  `thumbnailYn` varchar(1) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  PRIMARY KEY (`imgNo`)
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- 테이블 데이터 sample1.tbl_feed_img:~3 rows (대략적) 내보내기
INSERT INTO `tbl_feed_img` (`imgNo`, `feedId`, `imgName`, `imgPath`, `thumbnailYn`) VALUES
	(11, 45, 'photo-1521747116042-5a810fda9664.jfif', 'uploads\\photo-1521747116042-5a810fda9664-1746152151575.jfif', 'Y'),
	(12, 45, 'Lodingdog.png', 'uploads\\Lodingdog-1746152151593.png', 'N'),
	(13, 46, 'Lodingdog.png', 'uploads\\Lodingdog-1746166002063.png', 'Y');

-- 테이블 sample1.tbl_follow 구조 내보내기
CREATE TABLE IF NOT EXISTS `tbl_follow` (
  `id` int NOT NULL AUTO_INCREMENT,
  `followerId` int NOT NULL,
  `followedId` int NOT NULL,
  `createdAt` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=56 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- 테이블 데이터 sample1.tbl_follow:~10 rows (대략적) 내보내기
INSERT INTO `tbl_follow` (`id`, `followerId`, `followedId`, `createdAt`) VALUES
	(33, 3, 2, '2025-05-09 16:55:18'),
	(37, 10, 3, '2025-05-12 13:02:09'),
	(38, 13, 2, '2025-05-12 19:22:59'),
	(39, 13, 3, '2025-05-12 19:23:11'),
	(47, 3, 13, '2025-05-15 11:23:18'),
	(48, 3, 7, '2025-05-15 19:12:38'),
	(49, 14, 13, '2025-05-15 19:32:43'),
	(50, 14, 3, '2025-05-15 19:33:14'),
	(51, 3, 14, '2025-05-15 19:37:45'),
	(54, 3, 10, '2025-05-17 17:48:55');

-- 테이블 sample1.tbl_hashtag 구조 내보내기
CREATE TABLE IF NOT EXISTS `tbl_hashtag` (
  `hashtagId` int NOT NULL AUTO_INCREMENT,
  `tag` varchar(100) NOT NULL,
  PRIMARY KEY (`hashtagId`),
  UNIQUE KEY `tag` (`tag`)
) ENGINE=InnoDB AUTO_INCREMENT=27 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- 테이블 데이터 sample1.tbl_hashtag:~26 rows (대략적) 내보내기
INSERT INTO `tbl_hashtag` (`hashtagId`, `tag`) VALUES
	(19, '#23'),
	(24, '#234'),
	(11, '#234243'),
	(10, '#24323'),
	(12, '#32ㅈㄷ'),
	(18, '#332'),
	(7, '#423'),
	(8, '#5435'),
	(9, '#etrewt'),
	(23, '#rew'),
	(26, '#te'),
	(25, '#twert'),
	(15, '#ㄱ'),
	(17, '#ㄷ'),
	(2, '#두 번째 해시태그'),
	(20, '#몰라'),
	(22, '#싫어'),
	(14, '#ㅈㄷ45'),
	(1, '#첫 번째 해시태그'),
	(16, '#테슽'),
	(3, '#해운대'),
	(21, '#힘들어'),
	(13, '#ㄳㄱㅈㄷㅅ'),
	(4, '232'),
	(5, '3245'),
	(6, 'test');

-- 테이블 sample1.tbl_mention 구조 내보내기
CREATE TABLE IF NOT EXISTS `tbl_mention` (
  `mentionId` int NOT NULL AUTO_INCREMENT,
  `postId` int NOT NULL,
  `mentionedUserId` int NOT NULL,
  `createdAt` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`mentionId`),
  KEY `postId` (`postId`),
  KEY `mentionedUserId` (`mentionedUserId`),
  CONSTRAINT `tbl_mention_ibfk_1` FOREIGN KEY (`postId`) REFERENCES `tbl_post` (`postId`) ON DELETE CASCADE,
  CONSTRAINT `tbl_mention_ibfk_2` FOREIGN KEY (`mentionedUserId`) REFERENCES `tbl_users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- 테이블 데이터 sample1.tbl_mention:~7 rows (대략적) 내보내기
INSERT INTO `tbl_mention` (`mentionId`, `postId`, `mentionedUserId`, `createdAt`) VALUES
	(2, 1, 3, '2025-05-07 15:22:21'),
	(3, 13, 1, '2025-05-08 11:35:26'),
	(4, 13, 3, '2025-05-08 11:35:26'),
	(5, 14, 1, '2025-05-08 11:36:53'),
	(6, 14, 3, '2025-05-08 11:36:53'),
	(7, 20, 3, '2025-05-08 11:55:36'),
	(12, 26, 3, '2025-05-17 17:12:12');

-- 테이블 sample1.tbl_messages 구조 내보내기
CREATE TABLE IF NOT EXISTS `tbl_messages` (
  `id` int NOT NULL AUTO_INCREMENT,
  `roomId` int DEFAULT NULL,
  `senderId` int DEFAULT NULL,
  `content` text,
  `createdAt` datetime DEFAULT CURRENT_TIMESTAMP,
  `fileType` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT 'text',
  `fileUrl` varchar(512) DEFAULT NULL,
  `isDeleted` tinyint(1) DEFAULT '0',
  PRIMARY KEY (`id`),
  KEY `roomId` (`roomId`),
  KEY `senderId` (`senderId`)
) ENGINE=InnoDB AUTO_INCREMENT=212 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- 테이블 데이터 sample1.tbl_messages:~211 rows (대략적) 내보내기
INSERT INTO `tbl_messages` (`id`, `roomId`, `senderId`, `content`, `createdAt`, `fileType`, `fileUrl`, `isDeleted`) VALUES
	(1, 1, 1, '11', '2025-05-12 12:06:49', 'text', NULL, 0),
	(2, 1, 1, 'gd', '2025-05-12 12:07:20', 'text', NULL, 0),
	(3, 1, 1, '2342', '2025-05-12 12:07:23', 'text', NULL, 0),
	(4, 1, 1, '2134324', '2025-05-12 12:07:26', 'text', NULL, 0),
	(5, 1, 1, '1', '2025-05-12 12:09:10', 'text', NULL, 0),
	(6, 1, 1, '1', '2025-05-12 12:09:18', 'text', NULL, 0),
	(7, 1, 3, '1', '2025-05-12 12:13:14', 'text', NULL, 0),
	(8, 1, 13, '1', '2025-05-12 12:13:21', 'text', NULL, 0),
	(9, 1, 3, '1', '2025-05-12 12:13:22', 'text', NULL, 0),
	(10, 1, 13, '1', '2025-05-12 12:13:23', 'text', NULL, 0),
	(11, 1, 3, '11', '2025-05-12 12:13:27', 'text', NULL, 0),
	(12, 1, 13, '뭐임아', '2025-05-12 12:13:36', 'text', NULL, 0),
	(13, 1, 3, 'anj', '2025-05-12 12:13:39', 'text', NULL, 0),
	(14, 1, 3, '뭐', '2025-05-12 12:13:40', 'text', NULL, 0),
	(15, 1, 13, '싫어', '2025-05-12 12:14:28', 'text', NULL, 0),
	(16, 1, 3, '그래', '2025-05-12 12:14:30', 'text', NULL, 0),
	(17, 1, 3, '나도', '2025-05-12 12:14:32', 'text', NULL, 0),
	(18, 1, 3, '싫어', '2025-05-12 12:14:33', 'text', NULL, 0),
	(19, 1, 13, '123', '2025-05-12 12:28:29', 'text', NULL, 0),
	(20, 1, 3, '2342', '2025-05-12 12:28:30', 'text', NULL, 0),
	(21, 1, 13, '2342', '2025-05-12 12:28:31', 'text', NULL, 0),
	(22, 1, 3, '2342', '2025-05-12 12:28:33', 'text', NULL, 0),
	(23, 1, 13, '234234', '2025-05-12 12:28:34', 'text', NULL, 0),
	(24, 1, 13, '15135', '2025-05-12 12:28:35', 'text', NULL, 0),
	(25, 1, 13, '23523424', '2025-05-12 12:28:36', 'text', NULL, 0),
	(26, 1, 3, 'ㅋ423423', '2025-05-12 12:28:37', 'text', NULL, 0),
	(27, 1, 3, '532', '2025-05-12 12:28:37', 'text', NULL, 0),
	(28, 1, 3, 'ㅈㄷㅅㄱㄷㅈ', '2025-05-12 12:28:38', 'text', NULL, 0),
	(29, 1, 3, 'ㅅㅈㅁ', '2025-05-12 12:28:39', 'text', NULL, 0),
	(30, 1, 13, '235435', '2025-05-12 12:28:40', 'text', NULL, 0),
	(31, 1, 3, '23423', '2025-05-12 12:28:41', 'text', NULL, 0),
	(32, 1, 13, '23423', '2025-05-12 12:28:42', 'text', NULL, 0),
	(33, 1, 3, '2342335', '2025-05-12 12:28:44', 'text', NULL, 0),
	(34, 1, 3, '324234', '2025-05-12 12:31:39', 'text', NULL, 0),
	(35, 1, 13, '32423', '2025-05-12 12:31:40', 'text', NULL, 0),
	(36, 1, 3, '111', '2025-05-12 12:49:50', 'text', NULL, 0),
	(37, 1, 13, '111111', '2025-05-12 12:49:56', 'text', NULL, 0),
	(38, 1, 13, '111', '2025-05-12 12:49:57', 'text', NULL, 0),
	(39, 3, 3, '11', '2025-05-12 12:53:22', 'text', NULL, 0),
	(40, 1, 13, '11', '2025-05-12 12:53:30', 'text', NULL, 0),
	(41, 1, 13, '23423', '2025-05-12 12:53:35', 'text', NULL, 0),
	(42, 1, 3, 'ㄱㅈㄷㅈ', '2025-05-12 12:59:39', 'text', NULL, 0),
	(43, 4, 10, '4444', '2025-05-12 13:02:20', 'text', NULL, 0),
	(44, 4, 3, '45', '2025-05-12 13:02:29', 'text', NULL, 0),
	(45, 1, 3, '1', '2025-05-12 14:52:14', 'text', NULL, 0),
	(46, 1, 3, '11', '2025-05-12 14:52:16', 'text', NULL, 0),
	(47, 1, 3, '11', '2025-05-12 14:52:19', 'text', NULL, 0),
	(48, 1, 3, '12', '2025-05-12 14:54:49', 'text', NULL, 0),
	(49, 1, 3, '78', '2025-05-12 14:54:50', 'text', NULL, 0),
	(50, 1, 3, '5', '2025-05-12 14:54:50', 'text', NULL, 0),
	(51, 1, 3, '66', '2025-05-12 14:54:51', 'text', NULL, 0),
	(52, 2, 3, '11', '2025-05-12 14:54:53', 'text', NULL, 0),
	(53, 1, 3, '4', '2025-05-12 14:54:56', 'text', NULL, 0),
	(54, 2, 3, '4', '2025-05-12 14:54:58', 'text', NULL, 0),
	(55, 3, 3, '4', '2025-05-12 14:54:59', 'text', NULL, 0),
	(56, 4, 3, '44', '2025-05-12 14:55:01', 'text', NULL, 0),
	(57, 1, 3, '12', '2025-05-12 15:07:36', 'text', NULL, 0),
	(58, 1, 3, '423423', '2025-05-12 15:11:49', 'text', NULL, 0),
	(59, 1, 3, '3252342', '2025-05-12 15:11:50', 'text', NULL, 0),
	(60, 1, 3, '3423', '2025-05-12 15:11:50', 'text', NULL, 0),
	(61, 1, 3, '4153', '2025-05-12 15:11:50', 'text', NULL, 0),
	(62, 1, 3, '2523', '2025-05-12 15:11:51', 'text', NULL, 0),
	(63, 1, 3, '41234', '2025-05-12 15:11:51', 'text', NULL, 0),
	(64, 1, 3, '1421', '2025-05-12 15:11:52', 'text', NULL, 0),
	(65, 1, 3, '5251', '2025-05-12 15:11:52', 'text', NULL, 0),
	(66, 1, 3, '213', '2025-05-12 15:11:54', 'text', NULL, 0),
	(67, 1, 3, '43534', '2025-05-12 15:11:56', 'text', NULL, 0),
	(68, 1, 3, '232', '2025-05-12 15:14:33', 'text', NULL, 0),
	(69, 1, 3, '14214', '2025-05-12 15:14:33', 'text', NULL, 0),
	(70, 1, 3, '2342', '2025-05-12 15:14:36', 'text', NULL, 0),
	(71, 1, 3, '141', '2025-05-12 15:14:37', 'text', NULL, 0),
	(72, 1, 3, '523', '2025-05-12 15:14:37', 'text', NULL, 0),
	(73, 1, 3, '2431', '2025-05-12 15:14:38', 'text', NULL, 0),
	(74, 1, 3, '51', '2025-05-12 15:14:38', 'text', NULL, 0),
	(75, 1, 3, '5234', '2025-05-12 15:14:38', 'text', NULL, 0),
	(76, 1, 3, '23425', '2025-05-12 15:14:39', 'text', NULL, 0),
	(77, 1, 3, '1251', '2025-05-12 15:14:39', 'text', NULL, 0),
	(78, 1, 3, '3454', '2025-05-12 15:20:51', 'text', NULL, 0),
	(79, 1, 13, '23523', '2025-05-12 15:21:00', 'text', NULL, 0),
	(80, 1, 13, '2342', '2025-05-12 15:21:03', 'text', NULL, 0),
	(81, 1, 3, '2432', '2025-05-12 15:21:04', 'text', NULL, 0),
	(82, 1, 13, '3ㅈ4545ㅅ', '2025-05-12 15:30:28', 'text', NULL, 0),
	(83, 1, 13, '43543', '2025-05-12 15:30:44', 'text', NULL, 0),
	(84, 1, 13, '싫어', '2025-05-12 15:30:53', 'text', NULL, 0),
	(85, 1, 13, '이마', '2025-05-12 15:30:54', 'text', NULL, 0),
	(86, 1, 3, 'gk', '2025-05-12 15:30:56', 'text', NULL, 0),
	(87, 1, 3, '하하', '2025-05-12 15:30:57', 'text', NULL, 0),
	(88, 1, 3, '하', '2025-05-12 15:30:57', 'text', NULL, 0),
	(89, 1, 3, '하', '2025-05-12 15:30:57', 'text', NULL, 0),
	(90, 1, 3, 'ㅅㄷㅎㅈ잦닺ㅁㄱ', '2025-05-12 15:30:57', 'text', NULL, 0),
	(91, 1, 3, 'ㅁㅅ함ㅈ', '2025-05-12 15:30:58', 'text', NULL, 0),
	(92, 1, 3, 'ㅏ', '2025-05-12 15:30:58', 'text', NULL, 0),
	(93, 1, 3, 'ㄱㅁ자', '2025-05-12 15:30:58', 'text', NULL, 0),
	(94, 1, 13, '싫어', '2025-05-12 15:31:00', 'text', NULL, 0),
	(95, 1, 3, '응 그래', '2025-05-12 15:31:03', 'text', NULL, 0),
	(96, 1, 13, '이', '2025-05-12 15:31:07', 'text', NULL, 0),
	(97, 1, 3, '이', '2025-05-12 15:31:07', 'text', NULL, 0),
	(98, 1, 13, '이', '2025-05-12 15:31:08', 'text', NULL, 0),
	(99, 1, 3, '이', '2025-05-12 15:31:09', 'text', NULL, 0),
	(100, 1, 13, 'ㅣㅇ', '2025-05-12 15:31:09', 'text', NULL, 0),
	(101, 1, 13, 'ㅈㄷㅂㄱ디', '2025-05-12 15:31:10', 'text', NULL, 0),
	(102, 1, 3, 'ㄷㅈㅂ긱', '2025-05-12 15:31:10', 'text', NULL, 0),
	(103, 1, 13, 'ㅈㄷ기ㅔ', '2025-05-12 15:31:11', 'text', NULL, 0),
	(104, 1, 3, 'ㅈㄷㅅㅈ', '2025-05-12 15:31:13', 'text', NULL, 0),
	(105, 1, 3, 'ㅁㄷㅅ', '2025-05-12 15:31:13', 'text', NULL, 0),
	(106, 1, 13, 'ㅈㄷㄱㅈㄷㄱㄷㅈ', '2025-05-12 15:31:15', 'text', NULL, 0),
	(107, 1, 3, 'ㅈㄷㄱㅈㄷㄱ', '2025-05-12 15:31:16', 'text', NULL, 0),
	(108, 1, 13, 'ㄷㅈㄱㄷㅈㄳㅈㄷㅅ', '2025-05-12 15:31:18', 'text', NULL, 0),
	(109, 1, 3, 'ㄷㅈㅅㅈㄴㅇㅎㄴㄻㅎㅇ', '2025-05-12 15:31:19', 'text', NULL, 0),
	(110, 1, 13, '실허', '2025-05-12 15:32:49', 'text', NULL, 0),
	(111, 1, 13, '시', '2025-05-12 15:32:50', 'text', NULL, 0),
	(112, 1, 13, '러', '2025-05-12 15:32:51', 'text', NULL, 0),
	(113, 1, 13, '시러', '2025-05-12 15:32:53', 'text', NULL, 0),
	(114, 1, 13, '시러러러러', '2025-05-12 15:32:55', 'text', NULL, 0),
	(115, 1, 13, '퉽웨', '2025-05-12 15:32:57', 'text', NULL, 0),
	(116, 1, 13, '퉤', '2025-05-12 15:32:57', 'text', NULL, 0),
	(117, 1, 13, '퉤', '2025-05-12 15:32:58', 'text', NULL, 0),
	(118, 1, 13, '퉤', '2025-05-12 15:32:58', 'text', NULL, 0),
	(119, 1, 13, '퉤', '2025-05-12 15:32:58', 'text', NULL, 0),
	(120, 1, 13, 'ㅇㅇ', '2025-05-12 15:33:02', 'text', NULL, 0),
	(121, 1, 13, 'ㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇ', '2025-05-12 15:33:03', 'text', NULL, 0),
	(122, 1, 3, 'ㅇㅇㅇㅇㅇㅇㅇ', '2025-05-12 15:33:04', 'text', NULL, 0),
	(123, 1, 3, 'tet', '2025-05-12 17:52:06', 'text', NULL, 0),
	(124, 1, 13, '뭔마', '2025-05-12 17:52:18', 'text', NULL, 0),
	(125, 1, 3, '무섭네', '2025-05-12 17:56:31', 'text', NULL, 0),
	(126, 1, 3, '0', '2025-05-12 18:32:04', 'text', NULL, 0),
	(127, 1, 13, '23342', '2025-05-12 18:32:10', 'text', NULL, 0),
	(128, 1, 3, '23423', '2025-05-12 18:32:11', 'text', NULL, 0),
	(129, 1, 13, '111', '2025-05-13 09:47:35', 'text', NULL, 0),
	(130, 1, 13, '654645', '2025-05-13 18:27:27', 'text', NULL, 0),
	(131, 1, 3, '456456', '2025-05-13 18:27:35', 'text', NULL, 0),
	(132, 1, 3, '머요', '2025-05-13 18:27:39', 'text', NULL, 0),
	(133, 1, 13, 'ajh', '2025-05-13 18:27:42', 'text', NULL, 0),
	(134, 1, 13, '머', '2025-05-13 18:27:43', 'text', NULL, 0),
	(135, 1, 13, '뭐', '2025-05-13 18:27:43', 'text', NULL, 0),
	(136, 1, 13, 'ㅁ갸ㅏㄷ적랴', '2025-05-13 18:27:44', 'text', NULL, 0),
	(137, 1, 13, 'ㅐㅈㅁㅁㄴ', '2025-05-13 18:27:44', 'text', NULL, 0),
	(138, 1, 3, '4354ㅂ3', '2025-05-13 18:27:47', 'text', NULL, 0),
	(139, 1, 3, '5', '2025-05-13 18:27:47', 'text', NULL, 0),
	(140, 1, 3, 'ㅂ5', '2025-05-13 18:27:48', 'text', NULL, 0),
	(141, 1, 3, 'ㅈㄷㄷ', '2025-05-13 18:27:48', 'text', NULL, 0),
	(142, 1, 3, '5ㅈㄷㄷ', '2025-05-13 18:27:48', 'text', NULL, 0),
	(143, 1, 3, 'ㅁㅈㄱ', '2025-05-13 18:27:48', 'text', NULL, 0),
	(144, 1, 3, 'ㄷㅁㅅ', '2025-05-13 18:27:49', 'text', NULL, 0),
	(145, 1, 3, '234', '2025-05-14 12:57:59', 'text', NULL, 0),
	(146, 1, 3, '22', '2025-05-14 13:05:20', 'text', NULL, 0),
	(147, 1, 3, '234', '2025-05-14 13:05:21', 'text', NULL, 1),
	(148, 1, 3, '523', '2025-05-14 13:05:21', 'text', NULL, 1),
	(149, 1, 3, '342', '2025-05-14 13:15:53', 'text', NULL, 1),
	(150, 1, 13, '324235235', '2025-05-14 13:16:40', 'text', NULL, 0),
	(151, 1, 3, '', '2025-05-14 13:18:36', 'text', NULL, 1),
	(152, 1, 3, '', '2025-05-14 14:40:54', 'text', NULL, 1),
	(153, 1, 3, '2342', '2025-05-14 14:48:13', NULL, NULL, 1),
	(154, 1, 3, '2342342', '2025-05-14 14:48:19', NULL, NULL, 0),
	(155, 1, 3, '', '2025-05-14 14:48:22', 'video/mp4', 'http://localhost:3003/uploads/1747201702781-a1frlbp4i1v.mp4', 0),
	(156, 1, 3, '', '2025-05-14 15:14:07', 'image/jpeg', 'http://localhost:3003/uploads/1747203247775-10hyhzj0nyf.jfif', 1),
	(157, 1, 3, '234324', '2025-05-14 15:17:28', 'image/jpeg', 'http://localhost:3003/uploads/1747203448098-x164b3nq52.jfif', 1),
	(158, 1, 3, '22222', '2025-05-14 15:52:31', 'video/mp4', 'http://localhost:3003/uploads/1747205551682-jgd6tqw4td.mp4', 1),
	(159, 1, 3, 'test', '2025-05-14 15:55:19', NULL, NULL, 1),
	(160, 1, 3, 'rwerew', '2025-05-14 15:59:30', NULL, NULL, 0),
	(161, 1, 3, '5555', '2025-05-14 16:26:30', 'image/jpeg', 'http://localhost:3003/uploads/1747207590710-uzwaooiayn.jfif', 0),
	(162, 1, 13, '23423', '2025-05-14 16:36:31', NULL, NULL, 0),
	(163, 1, 13, 'ㄱㄱ', '2025-05-14 16:36:35', 'video/mp4', 'http://localhost:3003/uploads/1747208195588-61ntqgqiw6m.mp4', 0),
	(164, 1, 3, '21111.]', '2025-05-14 17:24:28', 'video/mp4', 'http://localhost:3003/uploads/1747211068152-fzp4a9wo9oi.mp4', 0),
	(165, 1, 3, '...;..', '2025-05-14 17:25:52', NULL, NULL, 0),
	(166, 1, 3, '..', '2025-05-14 17:26:14', NULL, NULL, 0),
	(167, 1, 13, '11', '2025-05-14 17:51:31', NULL, NULL, 0),
	(168, 1, 3, 'd', '2025-05-14 17:54:00', NULL, NULL, 0),
	(169, 1, 3, 'ㅇ', '2025-05-14 17:54:02', NULL, NULL, 0),
	(170, 1, 3, 'ㅇㅇ', '2025-05-14 17:54:03', NULL, NULL, 0),
	(171, 1, 3, 'dd', '2025-05-14 17:54:04', NULL, NULL, 0),
	(172, 3, 3, '25', '2025-05-15 16:34:43', NULL, NULL, 0),
	(173, 3, 3, '11', '2025-05-15 16:34:44', NULL, NULL, 0),
	(174, 1, 3, 'rrrrr', '2025-05-15 18:41:46', NULL, NULL, 0),
	(175, 7, 3, '11', '2025-05-15 19:17:38', NULL, NULL, 0),
	(176, 16, 14, '234234', '2025-05-15 19:32:51', NULL, NULL, 0),
	(177, 17, 14, 'ㄷ', '2025-05-15 19:33:17', NULL, NULL, 0),
	(178, 17, 14, 'ㄷ', '2025-05-15 19:33:18', NULL, NULL, 0),
	(179, 17, 14, 'ㄷ', '2025-05-15 19:33:18', NULL, NULL, 0),
	(180, 17, 14, 'ㄷ', '2025-05-15 19:33:18', NULL, NULL, 0),
	(181, 17, 3, 'ㄷ', '2025-05-15 19:33:27', NULL, NULL, 0),
	(182, 17, 3, 'ㄷ', '2025-05-15 19:33:28', NULL, NULL, 0),
	(183, 17, 14, 'ㄷ', '2025-05-15 19:33:29', NULL, NULL, 0),
	(184, 17, 3, 'ㄷ', '2025-05-15 19:33:29', NULL, NULL, 0),
	(185, 17, 14, 'ㄷ', '2025-05-15 19:33:30', NULL, NULL, 0),
	(186, 17, 3, 'ㄷ', '2025-05-15 19:33:31', NULL, NULL, 0),
	(187, 17, 14, 'ㄷ', '2025-05-15 19:33:32', NULL, NULL, 0),
	(188, 17, 14, 'ㄱㄱㄱㄱ', '2025-05-15 19:33:43', 'video/mp4', 'http://localhost:3003/uploads/1747305223704-jda6h14o2j.mp4', 0),
	(189, 17, 3, 'ㄱㄱㄱ', '2025-05-15 19:33:52', NULL, NULL, 0),
	(190, 17, 3, '싫다', '2025-05-15 19:35:53', NULL, NULL, 0),
	(191, 17, 3, '너', '2025-05-15 19:35:55', NULL, NULL, 0),
	(192, 17, 3, '너무싫다', '2025-05-15 19:38:13', NULL, NULL, 0),
	(193, 17, 3, '너', '2025-05-15 19:38:14', NULL, NULL, 0),
	(194, 18, 3, 'ㅅㅅㄷㄳㄱㄷㅅㄱㄷ', '2025-05-15 19:41:20', NULL, NULL, 0),
	(195, 3, 3, '344', '2025-05-15 19:52:22', NULL, NULL, 0),
	(196, 21, 3, '343', '2025-05-15 19:57:25', NULL, NULL, 0),
	(197, 21, 3, '3453', '2025-05-15 19:57:25', NULL, NULL, 0),
	(198, 21, 3, '345', '2025-05-15 19:57:26', NULL, NULL, 0),
	(199, 22, 3, '5454', '2025-05-15 19:57:45', NULL, NULL, 0),
	(200, 23, 3, '23432', '2025-05-15 20:01:39', NULL, NULL, 0),
	(201, 23, 3, '234', '2025-05-15 20:01:40', NULL, NULL, 0),
	(202, 23, 3, '234', '2025-05-15 20:01:40', NULL, NULL, 0),
	(203, 23, 3, '234234', '2025-05-15 20:01:48', NULL, NULL, 0),
	(204, 17, 14, '/.', '2025-05-15 20:32:57', NULL, NULL, 0),
	(205, 17, 14, '.,', '2025-05-15 20:32:57', NULL, NULL, 0),
	(206, 17, 14, '.', '2025-05-15 20:32:57', NULL, NULL, 0),
	(207, 17, 14, '.325', '2025-05-15 20:32:58', NULL, NULL, 0),
	(208, 17, 14, '.32', '2025-05-15 20:32:58', NULL, NULL, 0),
	(209, 17, 14, '423', '2025-05-15 20:32:58', NULL, NULL, 0),
	(210, 16, 14, '2343', '2025-05-15 20:33:00', NULL, NULL, 0),
	(211, 17, 14, '23423', '2025-05-15 20:33:03', NULL, NULL, 0);

-- 테이블 sample1.tbl_message_reads 구조 내보내기
CREATE TABLE IF NOT EXISTS `tbl_message_reads` (
  `messageId` int NOT NULL,
  `userId` int NOT NULL,
  `readAt` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`messageId`,`userId`),
  KEY `userId` (`userId`),
  CONSTRAINT `tbl_message_reads_ibfk_1` FOREIGN KEY (`messageId`) REFERENCES `tbl_messages` (`id`) ON DELETE CASCADE,
  CONSTRAINT `tbl_message_reads_ibfk_2` FOREIGN KEY (`userId`) REFERENCES `tbl_users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- 테이블 데이터 sample1.tbl_message_reads:~0 rows (대략적) 내보내기

-- 테이블 sample1.tbl_notifications 구조 내보내기
CREATE TABLE IF NOT EXISTS `tbl_notifications` (
  `id` int NOT NULL AUTO_INCREMENT,
  `userId` int NOT NULL,
  `type` varchar(50) NOT NULL,
  `message` text NOT NULL,
  `isRead` tinyint(1) DEFAULT '0',
  `createdAt` datetime DEFAULT CURRENT_TIMESTAMP,
  `relatedFeedId` int DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=92 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- 테이블 데이터 sample1.tbl_notifications:~86 rows (대략적) 내보내기
INSERT INTO `tbl_notifications` (`id`, `userId`, `type`, `message`, `isRead`, `createdAt`, `relatedFeedId`) VALUES
	(1, 2, 'like', '방대한님이 회원님의 게시글을 좋아합니다.', 0, '2025-05-08 11:02:39', 3),
	(2, 2, 'like', '방대한님이 회원님의 게시글을 좋아합니다.', 0, '2025-05-08 11:16:42', 3),
	(3, 1, 'mention', 'undefined님이 당신을 언급했습니다.', 0, '2025-05-08 11:35:26', 13),
	(4, 3, 'mention', 'undefined님이 당신을 언급했습니다.', 1, '2025-05-08 11:35:26', 13),
	(5, 1, 'mention', '테스트유저님이 당신을 언급했습니다.', 0, '2025-05-08 11:36:53', 14),
	(6, 3, 'mention', '방대한님이 당신을 언급했습니다.', 1, '2025-05-08 11:36:53', 14),
	(7, 3, 'mention', '방대한님이 당신을 언급했습니다.', 1, '2025-05-08 11:55:36', 20),
	(8, 2, 'comment', '방대한님이 회원님의 게시글에 댓글을 남겼습니다.', 0, '2025-05-08 12:38:32', 3),
	(10, 3, 'like', '수박님이 회원님의 게시글을 좋아합니다.', 1, '2025-05-08 13:01:09', 20),
	(12, 3, 'like', '방대한님이 회원님의 게시글을 좋아합니다.', 1, '2025-05-08 17:27:20', 20),
	(13, 3, 'mention', '방대한님이 당신을 언급했습니다.', 1, '2025-05-08 17:27:42', 21),
	(14, 1, 'mention', '테스트유저님이 당신을 언급했습니다.', 0, '2025-05-08 17:27:42', 21),
	(15, 3, 'like', '방대한님이 회원님의 게시글을 좋아합니다.', 1, '2025-05-08 17:28:52', 19),
	(16, 3, 'like', '방대한님이 회원님의 게시글을 좋아합니다.', 1, '2025-05-08 17:28:54', 19),
	(17, 3, 'like', '방대한님이 회원님의 게시글을 좋아합니다.', 1, '2025-05-08 17:28:54', 19),
	(18, 13, 'like', '방대한님이 회원님의 게시글을 좋아합니다.', 1, '2025-05-09 11:27:07', 22),
	(19, 2, 'like', '방대한님이 회원님의 게시글을 좋아합니다.', 0, '2025-05-09 16:00:13', 3),
	(20, 2, 'like', '방대한님이 회원님의 게시글을 좋아합니다.', 0, '2025-05-09 16:00:14', 3),
	(21, 3, 'like', '대한님이 회원님의 게시글을 좋아합니다.', 1, '2025-05-12 09:55:40', 20),
	(22, 3, 'like', '대한님이 회원님의 게시글을 좋아합니다.', 1, '2025-05-12 09:55:41', 20),
	(23, 13, 'dm', '방대한님이 채팅을 보냈습니다.', 1, '2025-05-12 14:52:14', 1),
	(24, 13, 'dm', '방대한님이 채팅을 보냈습니다.', 1, '2025-05-12 14:52:16', 1),
	(25, 13, 'dm', '방대한님이 채팅을 보냈습니다.', 1, '2025-05-12 14:52:19', 1),
	(26, 13, 'dm', '방대한님이 채팅을 보냈습니다.', 1, '2025-05-12 14:54:49', 1),
	(27, 13, 'dm', '방대한님이 채팅을 보냈습니다.', 1, '2025-05-12 14:54:50', 1),
	(28, 13, 'dm', '방대한님이 채팅을 보냈습니다.', 1, '2025-05-12 14:54:50', 1),
	(29, 13, 'dm', '방대한님이 채팅을 보냈습니다.', 1, '2025-05-12 14:54:51', 1),
	(30, 2, 'dm', '방대한님이 채팅을 보냈습니다.', 0, '2025-05-12 14:54:53', 2),
	(31, 13, 'dm', '방대한님이 채팅을 보냈습니다.', 1, '2025-05-12 14:54:56', 1),
	(32, 2, 'dm', '방대한님이 채팅을 보냈습니다.', 0, '2025-05-12 14:54:58', 2),
	(33, 1, 'dm', '방대한님이 채팅을 보냈습니다.', 0, '2025-05-12 14:54:59', 3),
	(34, 10, 'dm', '방대한님이 채팅을 보냈습니다.', 0, '2025-05-12 14:55:01', 4),
	(35, 13, 'dm', '방대한님이 채팅을 보냈습니다.', 1, '2025-05-12 15:07:36', 1),
	(36, 13, 'dm', '방대한님이 채팅을 보냈습니다.', 1, '2025-05-12 15:14:33', 1),
	(37, 13, 'dm', '방대한님이 채팅을 보냈습니다.', 1, '2025-05-12 15:20:51', 1),
	(38, 3, 'dm', '대한님이 채팅을 보냈습니다.', 1, '2025-05-12 15:21:00', 1),
	(39, 3, 'dm', '대한님이 채팅을 보냈습니다.', 1, '2025-05-12 15:30:28', 1),
	(40, 13, 'dm', '방대한님이 채팅을 보냈습니다.', 1, '2025-05-12 15:30:56', 1),
	(41, 13, 'dm', '방대한님이 채팅을 보냈습니다.', 1, '2025-05-12 17:52:06', 1),
	(42, 3, 'dm', '대한님이 채팅을 보냈습니다.', 1, '2025-05-12 17:52:18', 1),
	(43, 13, 'dm', '방대한님이 채팅을 보냈습니다.', 1, '2025-05-12 17:56:31', 1),
	(44, 13, 'dm', '방대한님이 채팅을 보냈습니다.', 1, '2025-05-12 18:32:04', 1),
	(45, 3, 'dm', '대한님이 채팅을 보냈습니다.', 1, '2025-05-12 18:32:10', 1),
	(46, 3, 'dm', '대한님이 채팅을 보냈습니다.', 1, '2025-05-13 09:47:35', 1),
	(47, 3, 'comment', '대한님이 회원님의 게시글에 댓글을 남겼습니다.', 1, '2025-05-13 11:16:27', 24),
	(48, 3, 'reply', '대한님이 회원님의 댓글에 대댓글을 남겼습니다.', 1, '2025-05-13 11:16:27', 24),
	(49, 3, 'comment', '대한님이 회원님의 게시글에 댓글을 남겼습니다.', 1, '2025-05-13 12:04:59', 20),
	(50, 3, 'comment', '대한님이 회원님의 게시글에 댓글을 남겼습니다.', 1, '2025-05-13 12:15:44', 20),
	(52, 3, 'reply', '대한님이 회원님의 댓글에 대댓글을 남겼습니다.', 1, '2025-05-13 17:44:30', 25),
	(54, 3, 'reply', '대한님이 회원님의 댓글에 대댓글을 남겼습니다.', 1, '2025-05-13 17:51:43', 25),
	(56, 3, 'reply', '대한님이 회원님의 댓글에 대댓글을 남겼습니다.', 1, '2025-05-13 17:53:20', 25),
	(57, 3, 'dm', '대한님이 채팅을 보냈습니다.', 1, '2025-05-13 18:27:27', 1),
	(58, 13, 'dm', '방대한님이 채팅을 보냈습니다.', 1, '2025-05-13 18:27:35', 1),
	(59, 3, 'like', '대한님이 회원님의 게시글을 좋아합니다.', 1, '2025-05-13 18:36:21', 25),
	(60, 3, 'mention', '방대한님이 당신을 언급했습니다.', 1, '2025-05-14 10:41:40', 26),
	(61, 13, 'dm', '방대한님이 채팅을 보냈습니다.', 1, '2025-05-14 12:57:59', 1),
	(62, 13, 'dm', '방대한님이 채팅을 보냈습니다.', 1, '2025-05-14 13:05:20', 1),
	(63, 13, 'dm', '방대한님이 채팅을 보냈습니다.', 1, '2025-05-14 13:15:53', 1),
	(64, 3, 'dm', '대한님이 채팅을 보냈습니다.', 1, '2025-05-14 13:16:40', 1),
	(65, 13, 'dm', '방대한님이 채팅을 보냈습니다.', 1, '2025-05-14 14:40:54', 1),
	(66, 13, 'dm', '방대한님이 채팅을 보냈습니다.', 1, '2025-05-14 14:48:13', 1),
	(67, 13, 'dm', '방대한님이 채팅을 보냈습니다.', 1, '2025-05-14 15:14:07', 1),
	(68, 13, 'dm', '방대한님이 채팅을 보냈습니다.', 1, '2025-05-14 15:17:28', 1),
	(69, 13, 'dm', '방대한님이 채팅을 보냈습니다.', 1, '2025-05-14 15:52:31', 1),
	(70, 13, 'dm', '방대한님이 채팅을 보냈습니다.', 1, '2025-05-14 15:59:30', 1),
	(71, 13, 'dm', '방대한님이 채팅을 보냈습니다.', 1, '2025-05-14 16:26:30', 1),
	(72, 3, 'dm', '대한님이 채팅을 보냈습니다.', 1, '2025-05-14 16:36:31', 1),
	(73, 13, 'dm', '방대한님이 채팅을 보냈습니다.', 1, '2025-05-14 17:24:28', 1),
	(74, 3, 'dm', '대한님이 채팅을 보냈습니다.', 1, '2025-05-14 17:51:31', 1),
	(75, 13, 'dm', '방대한님이 채팅을 보냈습니다.', 1, '2025-05-14 17:54:00', 1),
	(76, 1, 'dm', '방대한님이 채팅을 보냈습니다.', 0, '2025-05-15 16:34:43', 3),
	(77, 13, 'dm', '방대한님이 채팅을 보냈습니다.', 0, '2025-05-15 18:41:46', 1),
	(78, 7, 'dm', '방대한님이 채팅을 보냈습니다.', 0, '2025-05-15 19:17:38', 7),
	(79, 13, 'dm', '하루님이 채팅을 보냈습니다.', 0, '2025-05-15 19:32:51', 16),
	(80, 3, 'dm', '하루님이 채팅을 보냈습니다.', 1, '2025-05-15 19:33:17', 17),
	(81, 14, 'dm', '방대한님이 채팅을 보냈습니다.', 0, '2025-05-15 19:33:27', 17),
	(82, 14, 'dm', '방대한님이 채팅을 보냈습니다.', 0, '2025-05-15 19:38:13', 17),
	(83, 7, 'dm', '방대한님이 채팅을 보냈습니다.', 0, '2025-05-15 19:41:20', 18),
	(84, 1, 'dm', '방대한님이 채팅을 보냈습니다.', 0, '2025-05-15 19:52:22', 3),
	(85, 7, 'dm', '방대한님이 채팅을 보냈습니다.', 0, '2025-05-15 19:57:25', 21),
	(86, 7, 'dm', '방대한님이 채팅을 보냈습니다.', 0, '2025-05-15 19:57:45', 22),
	(87, 7, 'dm', '방대한님이 채팅을 보냈습니다.', 0, '2025-05-15 20:01:39', 23),
	(88, 3, 'dm', '하루님이 채팅을 보냈습니다.', 1, '2025-05-15 20:32:57', 17),
	(89, 13, 'dm', '하루님이 채팅을 보냈습니다.', 0, '2025-05-15 20:33:00', 16),
	(90, 3, 'mention', '방대한님이 당신을 언급했습니다.', 1, '2025-05-17 17:12:02', 26),
	(91, 3, 'mention', '방대한님이 당신을 언급했습니다.', 1, '2025-05-17 17:12:12', 26);

-- 테이블 sample1.tbl_post 구조 내보내기
CREATE TABLE IF NOT EXISTS `tbl_post` (
  `postId` int NOT NULL AUTO_INCREMENT,
  `userId` int NOT NULL,
  `content` text,
  `location` varchar(255) DEFAULT NULL,
  `createdAt` datetime DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`postId`),
  KEY `userId` (`userId`),
  CONSTRAINT `tbl_post_ibfk_1` FOREIGN KEY (`userId`) REFERENCES `tbl_users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=27 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- 테이블 데이터 sample1.tbl_post:~22 rows (대략적) 내보내기
INSERT INTO `tbl_post` (`postId`, `userId`, `content`, `location`, `createdAt`, `updatedAt`) VALUES
	(1, 3, '첫 번째 피드 내용', '서울 강남구', '2025-05-07 15:19:11', '2025-05-07 15:19:11'),
	(3, 2, '오늘 날씨 너무 좋네요 ☀️', '부산 해운대', '2025-05-07 15:51:04', '2025-05-07 15:51:04'),
	(4, 3, '234234234', '', '2025-05-07 16:44:51', '2025-05-07 16:44:51'),
	(5, 3, '253453543534', '', '2025-05-07 16:47:06', '2025-05-07 16:47:06'),
	(6, 3, '@', '', '2025-05-07 17:35:43', '2025-05-07 17:35:43'),
	(7, 3, '테스트입니다\r\n\r\n@방대한 ', '', '2025-05-07 18:17:39', '2025-05-07 18:17:39'),
	(8, 3, '@방대한 테스트', '', '2025-05-08 11:21:56', '2025-05-08 11:21:56'),
	(9, 3, '알빠야', '몰라', '2025-05-08 11:26:11', '2025-05-08 11:26:11'),
	(10, 3, '@테스트유저  ㅇㅇㅇㅇ @방대한 ', '', '2025-05-08 11:31:46', '2025-05-08 11:31:46'),
	(11, 3, '@테스트유저 @방대한  1111111', '', '2025-05-08 11:33:51', '2025-05-08 11:33:51'),
	(12, 3, '@테스트유저 @방대한  1111111', '', '2025-05-08 11:33:53', '2025-05-08 11:33:53'),
	(13, 3, '@테스트유저 @방대한  1111111', '', '2025-05-08 11:35:26', '2025-05-08 11:35:26'),
	(14, 3, '@테스트유저 @방대한  111111', '', '2025-05-08 11:36:53', '2025-05-08 11:36:53'),
	(15, 3, '3333', '', '2025-05-08 11:38:25', '2025-05-08 11:38:25'),
	(16, 3, '11111', '', '2025-05-08 11:39:03', '2025-05-08 11:39:03'),
	(17, 3, '1111', '', '2025-05-08 11:41:23', '2025-05-08 11:41:23'),
	(18, 3, '111', '', '2025-05-08 11:45:28', '2025-05-08 11:45:28'),
	(19, 3, '23232', '', '2025-05-08 11:46:58', '2025-05-08 11:46:58'),
	(20, 3, '@방대한 234234', '', '2025-05-08 11:55:36', '2025-05-08 11:55:36'),
	(22, 13, '1111111111', '', '2025-05-08 18:17:18', '2025-05-08 18:17:18'),
	(23, 3, '아무일도', '', '2025-05-09 12:40:32', '2025-05-09 12:40:32'),
	(24, 3, 'test', '', '2025-05-12 14:41:42', '2025-05-12 14:41:42'),
	(25, 3, '무슨일 많았지', '', '2025-05-13 11:07:29', '2025-05-13 11:07:29'),
	(26, 3, '342342342342343456345622222\r\n@방대한 ', '', '2025-05-14 10:41:40', '2025-05-15 18:18:27');

-- 테이블 sample1.tbl_post_file 구조 내보내기
CREATE TABLE IF NOT EXISTS `tbl_post_file` (
  `fileId` int NOT NULL AUTO_INCREMENT,
  `postId` int NOT NULL,
  `filePath` varchar(255) NOT NULL,
  `fileType` enum('image','video') DEFAULT 'image',
  `createdAt` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`fileId`),
  KEY `postId` (`postId`),
  CONSTRAINT `tbl_post_file_ibfk_1` FOREIGN KEY (`postId`) REFERENCES `tbl_post` (`postId`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=36 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- 테이블 데이터 sample1.tbl_post_file:~24 rows (대략적) 내보내기
INSERT INTO `tbl_post_file` (`fileId`, `postId`, `filePath`, `fileType`, `createdAt`) VALUES
	(1, 1, '/uploads/file1.jpg', 'image', '2025-05-07 15:19:11'),
	(2, 1, '/uploads/file2.mp4', 'video', '2025-05-07 15:19:11'),
	(8, 3, '/uploads/beach.jpg', 'image', '2025-05-07 15:49:50'),
	(9, 4, 'http://localhost:3003//uploads/1746603891483-rsfwbie8toe.jfif', 'image', '2025-05-07 16:44:51'),
	(10, 4, 'http://localhost:3003/uploads/1746603891502-clblxf3byrf.jfif', 'image', '2025-05-07 16:44:51'),
	(11, 5, 'http://localhost:3003/uploads/1746604026429-b19y2l0zwfi.jfif', 'image', '2025-05-07 16:47:06'),
	(12, 5, 'http://localhost:3003/uploads/1746604026449-c6vbs5uxola.jfif', 'image', '2025-05-07 16:47:06'),
	(13, 7, 'http://localhost:3003/uploads/1746609459821-s8m0fahf4cf.jfif', 'image', '2025-05-07 18:17:39'),
	(14, 8, 'http://localhost:3003/uploads/1746670916307-vesezdvqrdo.jfif', 'image', '2025-05-08 11:21:56'),
	(15, 20, 'http://localhost:3003/uploads/1746672936656-7w6bot8a1bj.gif', 'image', '2025-05-08 11:55:36'),
	(20, 23, 'http://localhost:3003/uploads/1746762032528-fksqzdzz6es.jfif', 'image', '2025-05-09 12:40:32'),
	(21, 23, 'http://localhost:3003/uploads/1746762032529-0vc05w83782.jfif', 'image', '2025-05-09 12:40:32'),
	(22, 23, 'http://localhost:3003/uploads/1746762032530-tkuqvfpla6.jfif', 'image', '2025-05-09 12:40:32'),
	(23, 24, 'http://localhost:3003/uploads/1747028502415-nedeaurd8g.jfif', 'image', '2025-05-12 14:41:42'),
	(24, 24, 'http://localhost:3003/uploads/1747028502432-kwcm1kuu0c9.jfif', 'image', '2025-05-12 14:41:42'),
	(25, 24, 'http://localhost:3003/uploads/1747028502432-fwravbsk1zj.jfif', 'image', '2025-05-12 14:41:42'),
	(26, 24, 'http://localhost:3003/uploads/1747028502432-7qwn1tam719.jfif', 'image', '2025-05-12 14:41:42'),
	(27, 24, 'http://localhost:3003/uploads/1747028502432-mbjwy1mzzxq.jfif', 'image', '2025-05-12 14:41:42'),
	(28, 25, 'http://localhost:3003/uploads/1747102049467-6apqafeqlx9.jfif', 'image', '2025-05-13 11:07:29'),
	(29, 25, 'http://localhost:3003/uploads/1747102049484-g6h9byclu8.jfif', 'image', '2025-05-13 11:07:29'),
	(30, 25, 'http://localhost:3003/uploads/1747102049484-cqgsyhmwfs.jfif', 'image', '2025-05-13 11:07:29'),
	(31, 25, 'http://localhost:3003/uploads/1747102049484-y7mqvrau2y7.jfif', 'image', '2025-05-13 11:07:29'),
	(32, 25, 'http://localhost:3003/uploads/1747102049484-mmtm217hl4h.jfif', 'image', '2025-05-13 11:07:29'),
	(35, 26, 'http://localhost:3003/uploads/1747300944510-6naes32s0es.jfif', 'image', '2025-05-15 18:22:24');

-- 테이블 sample1.tbl_post_hashtag 구조 내보내기
CREATE TABLE IF NOT EXISTS `tbl_post_hashtag` (
  `postId` int NOT NULL,
  `hashtagId` int NOT NULL,
  PRIMARY KEY (`postId`,`hashtagId`),
  KEY `hashtagId` (`hashtagId`),
  CONSTRAINT `tbl_post_hashtag_ibfk_1` FOREIGN KEY (`postId`) REFERENCES `tbl_post` (`postId`) ON DELETE CASCADE,
  CONSTRAINT `tbl_post_hashtag_ibfk_2` FOREIGN KEY (`hashtagId`) REFERENCES `tbl_hashtag` (`hashtagId`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- 테이블 데이터 sample1.tbl_post_hashtag:~22 rows (대략적) 내보내기
INSERT INTO `tbl_post_hashtag` (`postId`, `hashtagId`) VALUES
	(1, 2),
	(18, 4),
	(18, 5),
	(18, 6),
	(19, 7),
	(19, 8),
	(19, 9),
	(19, 10),
	(20, 11),
	(20, 12),
	(20, 13),
	(20, 14),
	(23, 18),
	(23, 19),
	(23, 20),
	(25, 20),
	(26, 20),
	(25, 21),
	(25, 22),
	(26, 23),
	(26, 24),
	(26, 25);

-- 테이블 sample1.tbl_post_like 구조 내보내기
CREATE TABLE IF NOT EXISTS `tbl_post_like` (
  `likeId` int NOT NULL AUTO_INCREMENT,
  `postId` int NOT NULL,
  `userId` int NOT NULL,
  `createdAt` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`likeId`),
  UNIQUE KEY `postId` (`postId`,`userId`),
  KEY `userId` (`userId`),
  CONSTRAINT `tbl_post_like_ibfk_1` FOREIGN KEY (`postId`) REFERENCES `tbl_post` (`postId`) ON DELETE CASCADE,
  CONSTRAINT `tbl_post_like_ibfk_2` FOREIGN KEY (`userId`) REFERENCES `tbl_users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=86 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- 테이블 데이터 sample1.tbl_post_like:~10 rows (대략적) 내보내기
INSERT INTO `tbl_post_like` (`likeId`, `postId`, `userId`, `createdAt`) VALUES
	(3, 3, 5, '2025-05-07 15:50:36'),
	(36, 6, 3, '2025-05-08 11:17:54'),
	(53, 20, 10, '2025-05-08 13:01:09'),
	(62, 7, 3, '2025-05-09 10:09:03'),
	(77, 20, 13, '2025-05-12 09:55:41'),
	(79, 20, 3, '2025-05-12 19:03:37'),
	(80, 24, 3, '2025-05-12 19:09:52'),
	(82, 25, 13, '2025-05-13 18:36:21'),
	(83, 25, 3, '2025-05-13 18:52:37'),
	(84, 22, 13, '2025-05-14 16:39:04');

-- 테이블 sample1.tbl_story 구조 내보내기
CREATE TABLE IF NOT EXISTS `tbl_story` (
  `storyId` int NOT NULL AUTO_INCREMENT,
  `userId` int DEFAULT NULL,
  `mediaType` enum('image','video') NOT NULL,
  `mediaPath` varchar(255) NOT NULL,
  `caption` text,
  `createdAt` datetime DEFAULT CURRENT_TIMESTAMP,
  `expiresAt` datetime DEFAULT NULL,
  PRIMARY KEY (`storyId`),
  KEY `userId` (`userId`),
  CONSTRAINT `tbl_story_ibfk_1` FOREIGN KEY (`userId`) REFERENCES `tbl_users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- 테이블 데이터 sample1.tbl_story:~7 rows (대략적) 내보내기
INSERT INTO `tbl_story` (`storyId`, `userId`, `mediaType`, `mediaPath`, `caption`, `createdAt`, `expiresAt`) VALUES
	(2, 3, 'image', 'http://localhost:3003/uploads/1747116232460-f0dtl5bgipt.jfif', '111', '2025-05-13 15:03:52', '2025-05-14 15:03:52'),
	(3, 3, 'image', 'http://localhost:3003/uploads/1747117098334-bkamnnk0yn6.jfif', '2343234', '2025-05-13 15:18:18', '2025-05-14 15:18:18'),
	(4, 3, 'video', 'http://localhost:3003/uploads/1747117689539-w9obb3b9u6g.mp4', '234234', '2025-05-13 15:28:09', '2025-05-14 15:28:10'),
	(5, 3, 'video', 'http://localhost:3003/uploads/1747117707379-9m87vqp00db.mp4', '333', '2025-05-13 15:28:27', '2025-05-14 15:28:27'),
	(6, 3, 'video', 'http://localhost:3003/uploads/1747212658428-xf0iyjma74f.mp4', 'tttt', '2025-05-14 17:50:58', '2025-05-15 17:50:58'),
	(7, 13, 'image', 'http://localhost:3003/uploads/1747213584163-g6lnlb5dsgi.jfif', '랄라랄ㄹㄹㄹ', '2025-05-14 18:06:24', '2025-05-15 18:06:24'),
	(8, 3, 'video', 'http://localhost:3003/uploads/1747302063512-28jsvo6y5s9.mp4', '11111', '2025-05-15 18:41:03', '2025-05-16 18:41:04');

-- 테이블 sample1.tbl_story_view 구조 내보내기
CREATE TABLE IF NOT EXISTS `tbl_story_view` (
  `storyId` int NOT NULL,
  `viewerId` int NOT NULL,
  `viewedAt` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`storyId`,`viewerId`),
  KEY `viewerId` (`viewerId`),
  CONSTRAINT `tbl_story_view_ibfk_1` FOREIGN KEY (`storyId`) REFERENCES `tbl_story` (`storyId`) ON DELETE CASCADE,
  CONSTRAINT `tbl_story_view_ibfk_2` FOREIGN KEY (`viewerId`) REFERENCES `tbl_users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- 테이블 데이터 sample1.tbl_story_view:~13 rows (대략적) 내보내기
INSERT INTO `tbl_story_view` (`storyId`, `viewerId`, `viewedAt`) VALUES
	(2, 3, '2025-05-13 15:17:30'),
	(2, 13, '2025-05-13 17:15:05'),
	(3, 3, '2025-05-13 15:43:38'),
	(3, 13, '2025-05-13 17:15:04'),
	(4, 3, '2025-05-13 15:38:30'),
	(4, 13, '2025-05-13 17:15:03'),
	(5, 3, '2025-05-13 15:38:13'),
	(5, 13, '2025-05-13 17:15:02'),
	(6, 3, '2025-05-14 19:18:46'),
	(6, 13, '2025-05-14 17:51:02'),
	(7, 3, '2025-05-14 19:19:11'),
	(7, 13, '2025-05-15 09:55:56'),
	(8, 3, '2025-05-15 18:41:08');

-- 테이블 sample1.tbl_users 구조 내보내기
CREATE TABLE IF NOT EXISTS `tbl_users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `username` varchar(100) DEFAULT NULL,
  `provider` varchar(50) DEFAULT 'local',
  `emailVerified` tinyint(1) DEFAULT '0',
  `introduce` varchar(500) DEFAULT NULL,
  `profileImage` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `lastLogin` datetime DEFAULT NULL,
  `createdAt` timestamp NULL DEFAULT (now()),
  `deleteYn` varchar(1) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT 'N',
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=15 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- 테이블 데이터 sample1.tbl_users:~11 rows (대략적) 내보내기
INSERT INTO `tbl_users` (`id`, `email`, `password`, `username`, `provider`, `emailVerified`, `introduce`, `profileImage`, `lastLogin`, `createdAt`, `deleteYn`) VALUES
	(1, 'testuser@example.com', '$2b$10$XplR1lhG0oxMgkxvWGMnReUZ3aBp1nMjO5QXg3TxWv3M3nWR1O7C6', '테스트유저', 'local', 1, NULL, NULL, '2025-05-07 10:48:32', '2025-05-07 01:48:32', 'N'),
	(2, 'googleuser@example.com', NULL, '구글 유저', 'google', 1, NULL, 'https://picsum.photos/200', '2025-05-07 11:57:32', '2025-05-07 01:54:24', 'N'),
	(3, 'suikari@naver.com', '$2b$10$sw6PMpWLgE6n.UJpH7DDyOpAxKNtIyKLnB0nippN4qu6Zk9PJ89I2', '방대한', 'local', 1, '안녕하세요~!', 'http://localhost:3003/uploads/1747134896297-zrkum6m8k3a.png', '2025-05-17 16:25:11', '2025-05-07 03:50:59', 'N'),
	(5, 'hong@naver.com', '1234', '홍길동', 'local', 0, NULL, '/profiles/hong.jpg', NULL, '2025-05-07 06:47:52', 'N'),
	(6, 'young@naver.com', '1234', '김영희', 'local', 0, NULL, '/profiles/young.jpg', NULL, '2025-05-07 06:47:52', 'N'),
	(7, 'chul@naver.com', '1234', '이철수', 'local', 0, NULL, '/profiles/chul.jpg', NULL, '2025-05-07 06:47:52', 'N'),
	(8, 'jimin@naver.com', '1234', '박지민', 'local', 0, NULL, '/profiles/jimin.jpg', NULL, '2025-05-07 06:47:52', 'N'),
	(9, 'sua@naver.com', '1234', '최수아', 'local', 0, NULL, '/profiles/sua.jpg', NULL, '2025-05-07 06:47:52', 'N'),
	(10, 'bds388@naver.com', '$2b$10$n8wknPv9rtjX4/vNmJqRAe7gEbWwBophaBLq8gPAHg/g.HhJS3nsS', '수박', 'local', 1, NULL, 'http://localhost:3003/uploads/1746676790529-lt6h4xtawej.png', '2025-05-12 13:01:01', '2025-05-08 03:59:50', 'N'),
	(13, 'suikari330@gmail.com', '$2b$10$REb2ClSJYFWfFhEWdg6/5eAlmfJWIsVjtNEh0QzyiCUmjfIE3jp5a', '대한', 'local', 1, NULL, 'http://localhost:3003/uploads/1746693774538-rdsio5s9dqi.jfif', '2025-05-15 16:06:40', '2025-05-08 08:42:54', 'N'),
	(14, 'bds377@naver.com', '$2b$10$8uLZsfC4ctaOif.xaDjk7.SS7MjEEgBaDIVxhq85Hc91cuD6tbexy', '하루', 'local', 1, NULL, 'http://localhost:3003/uploads/1747292593016-4ei3bklajtl.jfif', '2025-05-15 16:19:10', '2025-05-15 07:03:13', 'N');
	INSERT INTO tbl_users (email, password, username, provider, emailVerified, introduce, profileImage, lastLogin)
	VALUES
	('alice@example.com', 'hashed_pw1', 'Alice', 'local', TRUE, 'Hi, I am Alice.', '/images/alice.jpg', '2025-05-18 10:00:00'),
	('bob@example.com', 'hashed_pw2', 'Bob', 'google', TRUE, 'Just Bob.', '/images/bob.jpg', '2025-05-17 12:30:00'),
	('carol@example.com', 'hashed_pw3', 'Carol', 'facebook', FALSE, 'Nature lover.', '/images/carol.png', '2025-05-15 09:00:00'),
	('dave@example.com', 'hashed_pw4', 'Dave', 'local', TRUE, 'Developer', '/images/dave.jpg', '2025-05-16 16:45:00'),
	('eve@example.com', 'hashed_pw5', 'Eve', 'local', FALSE, 'Security enthusiast.', '/images/eve.jpg', NULL),
	('frank@example.com', 'hashed_pw6', 'Frank', 'kakao', TRUE, 'Living life.', '/images/frank.png', '2025-05-13 22:15:00'),
	('grace@example.com', 'hashed_pw7', 'Grace', 'local', TRUE, 'Photographer.', '/images/grace.jpg', '2025-05-14 07:50:00'),
	('heidi@example.com', 'hashed_pw8', 'Heidi', 'google', FALSE, 'Coffee addict.', '/images/heidi.jpg', NULL),
	('ivan@example.com', 'hashed_pw9', 'Ivan', 'local', TRUE, 'Crypto guy.', '/images/ivan.jpg', '2025-05-10 18:20:00'),
	('judy@example.com', 'hashed_pw10', 'Judy', 'facebook', FALSE, 'Bookworm.', '/images/judy.jpg', '2025-05-11 14:30:00'),
	('ken@example.com', 'hashed_pw11', 'Ken', 'local', TRUE, 'Musician.', '/images/ken.jpg', '2025-05-09 09:45:00'),
	('laura@example.com', 'hashed_pw12', 'Laura', 'naver', TRUE, 'Traveler.', '/images/laura.png', '2025-05-08 13:10:00'),
	('mallory@example.com', 'hashed_pw13', 'Mallory', 'local', FALSE, 'Just vibes.', '/images/mallory.jpg', NULL),
	('nancy@example.com', 'hashed_pw14', 'Nancy', 'google', TRUE, 'Cat mom.', '/images/nancy.jpg', '2025-05-06 19:30:00'),
	('oscar@example.com', 'hashed_pw15', 'Oscar', 'local', TRUE, 'Web dev.', '/images/oscar.jpg', '2025-05-05 11:11:00'),
	('peggy@example.com', 'hashed_pw16', 'Peggy', 'facebook', FALSE, 'Artist.', '/images/peggy.jpg', '2025-05-04 17:20:00'),
	('quinn@example.com', 'hashed_pw17', 'Quinn', 'kakao', TRUE, 'Student.', '/images/quinn.jpg', '2025-05-03 08:08:00'),
	('rick@example.com', 'hashed_pw18', 'Rick', 'local', TRUE, 'Gamer.', '/images/rick.png', '2025-05-02 21:21:00'),
	('sybil@example.com', 'hashed_pw19', 'Sybil', 'google', FALSE, 'Designer.', '/images/sybil.jpg', '2025-05-01 15:00:00'),
	('trent@example.com', 'hashed_pw20', 'Trent', 'local', TRUE, 'Engineer.', '/images/trent.jpg', '2025-04-30 20:30:00');

/*!40103 SET TIME_ZONE=IFNULL(@OLD_TIME_ZONE, 'system') */;
/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IFNULL(@OLD_FOREIGN_KEY_CHECKS, 1) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40111 SET SQL_NOTES=IFNULL(@OLD_SQL_NOTES, 1) */;
