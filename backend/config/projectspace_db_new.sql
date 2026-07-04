-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Jul 04, 2026 at 02:01 AM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `projectspace_db`
--

-- --------------------------------------------------------

--
-- Table structure for table `bookmarks`
--

CREATE TABLE `bookmarks` (
  `id` int(11) NOT NULL,
  `user_id` int(11) DEFAULT NULL,
  `project_id` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `bookmarks`
--

INSERT INTO `bookmarks` (`id`, `user_id`, `project_id`, `created_at`) VALUES
(2, 5, 6, '2026-07-03 16:22:50'),
(3, 5, 3, '2026-07-03 16:23:15'),
(9, 6, 3, '2026-07-03 16:51:47'),
(10, 6, 6, '2026-07-03 16:57:32'),
(11, 4, 6, '2026-07-03 17:53:04'),
(12, 7, 6, '2026-07-03 20:16:52'),
(13, 8, 6, '2026-07-03 23:51:50');

-- --------------------------------------------------------

--
-- Table structure for table `comments`
--

CREATE TABLE `comments` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `project_id` int(11) NOT NULL,
  `comment` text NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `parent_id` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `comments`
--

INSERT INTO `comments` (`id`, `user_id`, `project_id`, `comment`, `created_at`, `parent_id`) VALUES
(3, 6, 3, 'kok gbsa ya', '2026-07-03 16:14:37', NULL),
(6, 5, 6, 'Keren anjay', '2026-07-03 21:26:14', NULL),
(7, 6, 6, 'makasih bang', '2026-07-03 21:26:56', 6),
(8, 5, 6, 'sama sama bang', '2026-07-03 21:35:08', 6),
(9, 5, 3, 'gabisa kenapa tuh kak', '2026-07-03 23:04:49', 3),
(10, 8, 6, 'Gokil massss', '2026-07-03 23:58:12', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `follows`
--

CREATE TABLE `follows` (
  `id` int(11) NOT NULL,
  `follower_id` int(11) DEFAULT NULL,
  `following_id` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `follows`
--

INSERT INTO `follows` (`id`, `follower_id`, `following_id`, `created_at`) VALUES
(1, 1, 2, '2026-05-02 17:41:39'),
(3, 5, 3, '2026-07-03 15:03:58'),
(4, 6, 5, '2026-07-03 15:42:46'),
(8, 4, 6, '2026-07-03 19:42:16'),
(9, 7, 6, '2026-07-03 20:03:02'),
(10, 5, 6, '2026-07-03 23:04:32'),
(11, 8, 6, '2026-07-03 23:57:12');

-- --------------------------------------------------------

--
-- Table structure for table `likes`
--

CREATE TABLE `likes` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `project_id` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `likes`
--

INSERT INTO `likes` (`id`, `user_id`, `project_id`, `created_at`) VALUES
(16, 6, 3, '2026-07-03 16:03:18'),
(17, 6, 6, '2026-07-03 16:26:40'),
(20, 5, 6, '2026-07-03 21:18:28'),
(21, 8, 3, '2026-07-03 23:51:58');

-- --------------------------------------------------------

--
-- Table structure for table `notifications`
--

CREATE TABLE `notifications` (
  `id` int(11) NOT NULL,
  `recipient_id` int(11) NOT NULL,
  `sender_id` int(11) NOT NULL,
  `type` enum('like','comment','bookmark','follow') NOT NULL,
  `project_id` int(11) DEFAULT NULL,
  `is_read` tinyint(4) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `notifications`
--

INSERT INTO `notifications` (`id`, `recipient_id`, `sender_id`, `type`, `project_id`, `is_read`, `created_at`) VALUES
(1, 6, 5, 'like', 6, 1, '2026-07-03 21:18:28'),
(2, 5, 6, 'comment', 3, 1, '2026-07-03 21:25:23'),
(3, 6, 5, 'comment', 6, 1, '2026-07-03 21:26:14'),
(4, 6, 5, 'comment', 6, 1, '2026-07-03 21:35:08'),
(5, 6, 5, 'follow', NULL, 1, '2026-07-03 23:04:32'),
(6, 6, 8, 'bookmark', 6, 1, '2026-07-03 23:51:50'),
(7, 5, 8, 'like', 3, 0, '2026-07-03 23:51:58'),
(8, 6, 8, 'follow', NULL, 1, '2026-07-03 23:57:12'),
(9, 6, 8, 'comment', 6, 1, '2026-07-03 23:58:12');

-- --------------------------------------------------------

--
-- Table structure for table `projects`
--

CREATE TABLE `projects` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `title` varchar(200) NOT NULL,
  `description` text DEFAULT NULL,
  `image` varchar(255) DEFAULT NULL,
  `github_link` varchar(255) DEFAULT NULL,
  `demo_link` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `is_free` tinyint(1) DEFAULT 1,
  `tags` varchar(255) DEFAULT NULL,
  `tech_stack` text DEFAULT NULL,
  `views` int(11) DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `projects`
--

INSERT INTO `projects` (`id`, `user_id`, `title`, `description`, `image`, `github_link`, `demo_link`, `created_at`, `is_free`, `tags`, `tech_stack`, `views`) VALUES
(3, 5, 'website Perpustakaan', 'project ini adalah untuk memenajemen perpustakaan', '1783086773004-52676208.png', 'https://github.com', 'https://orderly.web.id', '2026-07-03 13:52:53', 1, 'Web App', NULL, 0),
(6, 6, 'Website Orderly', 'Website Pre Order Mahasiswa Berbagai Produk , Banyak Fitur yang dapat di coba...\r\n\r\nFitur :\r\n\r\n1. Login/Register\r\n2. CO Produk\r\n3. Manajemen Produk Untuk yang ingin Jualan\r\n4. Proses tracking Secara Terstruktur\r\n5. Pembayaran Digital\r\n\r\n#webap', '1783093708113-988765554.png', 'https://github.com', 'https://orderly.web.id', '2026-07-03 15:48:28', 0, 'Web App', 'React.js, Html, Css, php, Tailwinds CSS', 0),
(7, 8, 'Mobile APP Manajemen Keuangan', 'APlikasi ini di bangun untuk membatu kamu memanejemen keuangan khusus nya mahasiswa , silahkan bisa di download melalui link yg sudah tertera gays', '1783122883339-599884586.png', NULL, 'https://orderly.web.id', '2026-07-03 23:54:43', 0, 'Mobile App', 'fluter, html, css', 0),
(8, 6, 'IOT Pararel', 'Project iot yang berhasil saya kembangkan nih gays, minta saran nya dong hehe', '1783123271662-778429640.jpg', 'https://github.com/donisetiawan12', 'https://orderly.web.id', '2026-07-04 00:01:11', 1, 'IoT', 'iot', 0);

-- --------------------------------------------------------

--
-- Table structure for table `project_images`
--

CREATE TABLE `project_images` (
  `id` int(11) NOT NULL,
  `project_id` int(11) DEFAULT NULL,
  `image` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `email` varchar(100) NOT NULL,
  `password` varchar(255) NOT NULL,
  `nim` varchar(50) DEFAULT NULL,
  `bio` text DEFAULT NULL,
  `about` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `avatar` varchar(255) DEFAULT NULL,
  `banner` varchar(255) DEFAULT NULL,
  `role` enum('user','admin') DEFAULT 'user'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `name`, `email`, `password`, `nim`, `bio`, `about`, `created_at`, `avatar`, `banner`, `role`) VALUES
(1, 'User1', 'user1@gmail.com', '$2b$10$2sPTjuRqT4Oek18U4h6Q2erK9ueBpNlxBMkhkElQyaFir1ZoecisW', NULL, NULL, NULL, '2026-05-02 17:30:29', NULL, NULL, 'user'),
(2, 'User2', 'user2@gmail.com', '$2b$10$fap/EK5/dLyFv4hsYHYZ.Ooqs2JKeDKwzhKdDeQG3rDn0lrqdINGa', NULL, NULL, NULL, '2026-05-02 17:31:01', NULL, NULL, 'user'),
(3, 'User3', 'user3@gmail.com', '$2b$10$6rVU5KJICsSoVcG2aUSUEeNUrdAMFGRs/DcMyzovGrZ9OQLTnLtay', NULL, NULL, NULL, '2026-05-02 17:36:22', NULL, NULL, 'user'),
(4, 'robert', 'tompel@gmail.com', '$2b$10$25Pmc2gLOu6ZsJ5cLlgB..DeLuoHgb8dd7vB3gwF0JRn10Kt05YLW', NULL, 'fullstack aaj', '', '2026-07-03 13:36:35', 'avatar-1783101246896.png', 'banner-1783107413725.png', 'user'),
(5, 'Yordan Alzisky', 'tes@gmail.com', '$2b$10$Ysmx2nKxq44Ewph9AbrHIulwhaJPgw5MGPcSjBMdk7ybcUgcw/hsK', '011298980', 'Developer ', NULL, '2026-07-03 13:50:31', 'avatar-1783119818866.png', NULL, 'user'),
(6, 'Doni Setiawan', 'doni@gmail.com', '$2b$10$IfiNvTndihNUUCfbFaPgFOvfom5bHAEtGs/JxddTdyCILLR60U/qW', '00110224101', 'Development', 'syayanjdjkas djvashdkjsadhksabfhdksfbdskh f dskh', '2026-07-03 15:38:20', 'avatar-1783093534138.webp', 'banner-1783115497807.png', 'user'),
(7, 'Davd', 'Davd@gmail.com', '$2b$10$We9x0cnJN9J7h3YXG/aNMe.qfv4nN4NbEmevwl59wLZMI1tJiDWKi', NULL, 'develover', '', '2026-07-03 19:43:26', 'avatar-1783107883151.png', 'banner-1783110492906.png', 'user'),
(8, 'davis', 'davis@gmail.com', '$2b$10$FzzBJnt.4aIVDuMMvte8uutsC/4pIp5.x7LONfAmUZiIheVuJtrlO', '011021321', 'Full Stack', 'saya Adalah mahasiswa semester 5 ', '2026-07-03 23:50:17', 'avatar-1783122702469.jpg', 'banner-1783123060367.png', 'user');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `bookmarks`
--
ALTER TABLE `bookmarks`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_bookmark` (`user_id`,`project_id`),
  ADD KEY `project_id` (`project_id`);

--
-- Indexes for table `comments`
--
ALTER TABLE `comments`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `project_id` (`project_id`),
  ADD KEY `idx_comments_project` (`project_id`),
  ADD KEY `fk_comment_parent` (`parent_id`);

--
-- Indexes for table `follows`
--
ALTER TABLE `follows`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_follow` (`follower_id`,`following_id`),
  ADD KEY `following_id` (`following_id`);

--
-- Indexes for table `likes`
--
ALTER TABLE `likes`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_like` (`user_id`,`project_id`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `project_id` (`project_id`);

--
-- Indexes for table `notifications`
--
ALTER TABLE `notifications`
  ADD PRIMARY KEY (`id`),
  ADD KEY `recipient_id` (`recipient_id`),
  ADD KEY `sender_id` (`sender_id`);

--
-- Indexes for table `projects`
--
ALTER TABLE `projects`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `idx_projects_user` (`user_id`);

--
-- Indexes for table `project_images`
--
ALTER TABLE `project_images`
  ADD PRIMARY KEY (`id`),
  ADD KEY `project_id` (`project_id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `bookmarks`
--
ALTER TABLE `bookmarks`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=14;

--
-- AUTO_INCREMENT for table `comments`
--
ALTER TABLE `comments`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT for table `follows`
--
ALTER TABLE `follows`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- AUTO_INCREMENT for table `likes`
--
ALTER TABLE `likes`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=22;

--
-- AUTO_INCREMENT for table `notifications`
--
ALTER TABLE `notifications`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT for table `projects`
--
ALTER TABLE `projects`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT for table `project_images`
--
ALTER TABLE `project_images`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `bookmarks`
--
ALTER TABLE `bookmarks`
  ADD CONSTRAINT `bookmarks_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `bookmarks_ibfk_2` FOREIGN KEY (`project_id`) REFERENCES `projects` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `comments`
--
ALTER TABLE `comments`
  ADD CONSTRAINT `comments_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `comments_ibfk_2` FOREIGN KEY (`project_id`) REFERENCES `projects` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_comment_parent` FOREIGN KEY (`parent_id`) REFERENCES `comments` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `follows`
--
ALTER TABLE `follows`
  ADD CONSTRAINT `follows_ibfk_1` FOREIGN KEY (`follower_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `follows_ibfk_2` FOREIGN KEY (`following_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `likes`
--
ALTER TABLE `likes`
  ADD CONSTRAINT `likes_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `likes_ibfk_2` FOREIGN KEY (`project_id`) REFERENCES `projects` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `notifications`
--
ALTER TABLE `notifications`
  ADD CONSTRAINT `notifications_ibfk_1` FOREIGN KEY (`recipient_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `notifications_ibfk_2` FOREIGN KEY (`sender_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `projects`
--
ALTER TABLE `projects`
  ADD CONSTRAINT `projects_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `project_images`
--
ALTER TABLE `project_images`
  ADD CONSTRAINT `project_images_ibfk_1` FOREIGN KEY (`project_id`) REFERENCES `projects` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
