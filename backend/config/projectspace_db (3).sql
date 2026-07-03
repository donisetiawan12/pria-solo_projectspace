-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Jul 03, 2026 at 08:37 PM
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
(17, 6, 3, '2026-07-03 18:06:38'),
(18, 6, 6, '2026-07-03 18:06:48'),
(23, 5, 6, '2026-07-03 18:29:31'),
(24, 5, 3, '2026-07-03 18:29:37'),
(25, 6, 7, '2026-07-03 18:31:43'),
(26, 7, 3, '2026-07-03 18:33:52'),
(27, 7, 7, '2026-07-03 18:33:58'),
(28, 7, 6, '2026-07-03 18:34:23');

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
(2, 6, 6, 'keren mas itu website nya', '2026-07-03 16:13:51', NULL),
(3, 6, 3, 'kok gbsa ya', '2026-07-03 16:14:37', NULL),
(4, 6, 6, 'keren cuy', '2026-07-03 16:26:46', NULL),
(5, 5, 6, 'Keren mas itu project nya bisa berguna buat ruang lingkup kampus', '2026-07-03 17:20:16', NULL),
(6, 5, 6, 'test kak', '2026-07-03 17:58:14', NULL),
(7, 5, 6, 'anjay', '2026-07-03 18:12:54', NULL),
(8, 5, 6, 'gokil don', '2026-07-03 18:16:15', NULL),
(9, 6, 7, 'Keren Mas Ini cocok buat mahasiswa yang ga suka bulak balik ke kampus', '2026-07-03 18:31:41', NULL),
(10, 7, 7, 'Keren Mas tapi ui nya belum maksimal mas hehe', '2026-07-03 18:34:16', NULL);

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
(12, 5, 6, '2026-07-03 18:13:32'),
(13, 6, 5, '2026-07-03 18:21:58');

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
(28, 6, 6, '2026-07-03 18:06:53'),
(29, 6, 3, '2026-07-03 18:07:11'),
(30, 5, 3, '2026-07-03 18:12:27'),
(32, 5, 6, '2026-07-03 18:18:49'),
(33, 6, 7, '2026-07-03 18:31:16'),
(34, 7, 3, '2026-07-03 18:33:51'),
(35, 7, 7, '2026-07-03 18:33:57'),
(36, 7, 6, '2026-07-03 18:34:25');

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
  `is_read` tinyint(1) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `notifications`
--

INSERT INTO `notifications` (`id`, `recipient_id`, `sender_id`, `type`, `project_id`, `is_read`, `created_at`) VALUES
(1, 6, 5, 'like', 6, 1, '2026-07-03 17:57:12'),
(2, 6, 5, 'comment', 6, 1, '2026-07-03 17:58:14'),
(3, 6, 5, 'like', 6, 1, '2026-07-03 17:59:48'),
(4, 5, 6, 'like', 3, 1, '2026-07-03 18:07:11'),
(5, 6, 5, 'like', 6, 1, '2026-07-03 18:12:43'),
(6, 6, 5, 'bookmark', 6, 1, '2026-07-03 18:13:18'),
(7, 6, 5, 'follow', NULL, 1, '2026-07-03 18:13:32'),
(8, 6, 5, 'comment', 6, 1, '2026-07-03 18:16:15'),
(9, 6, 5, 'like', 6, 1, '2026-07-03 18:18:49'),
(10, 5, 6, 'follow', NULL, 1, '2026-07-03 18:21:58'),
(11, 6, 5, 'bookmark', 6, 0, '2026-07-03 18:24:25'),
(12, 6, 5, 'bookmark', 6, 0, '2026-07-03 18:28:15'),
(13, 6, 5, 'bookmark', 6, 0, '2026-07-03 18:29:30'),
(14, 6, 5, 'bookmark', 6, 0, '2026-07-03 18:29:31'),
(15, 5, 6, 'like', 7, 0, '2026-07-03 18:31:16'),
(16, 5, 6, 'comment', 7, 0, '2026-07-03 18:31:41'),
(17, 5, 6, 'bookmark', 7, 0, '2026-07-03 18:31:43'),
(18, 5, 7, 'like', 3, 0, '2026-07-03 18:33:51'),
(19, 5, 7, 'bookmark', 3, 0, '2026-07-03 18:33:52'),
(20, 5, 7, 'like', 7, 0, '2026-07-03 18:33:57'),
(21, 5, 7, 'bookmark', 7, 0, '2026-07-03 18:33:58'),
(22, 5, 7, 'comment', 7, 0, '2026-07-03 18:34:16'),
(23, 6, 7, 'bookmark', 6, 0, '2026-07-03 18:34:23'),
(24, 6, 7, 'like', 6, 0, '2026-07-03 18:34:25');

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
(3, 5, 'Website Aplikasi Manajemen Keuangan', 'project ini adalah untuk memanajemen keuangan yang baru di bangun untuk memperbanyak portofolio saya menggunakan beberapa teknologi', '1783099053435-892206398.png', 'https://github.com', 'https://orderly.web.id', '2026-07-03 13:52:53', 1, 'Web App', 'React.js, Html, Css, php, Tailwinds CSS', 0),
(6, 6, 'Website Orderly', 'Website Pre Order Mahasiswa Berbagai Produk , Banyak Fitur yang dapat di coba...\r\n\r\nFitur :\r\n\r\n1. Login/Register\r\n2. CO Produk\r\n3. Manajemen Produk Untuk yang ingin Jualan\r\n4. Proses tracking Secara Terstruktur\r\n5. Pembayaran Digital\r\n\r\n#webap', '1783093708113-988765554.png', 'https://github.com', 'https://orderly.web.id', '2026-07-03 15:48:28', 0, 'Web App', 'React.js, Html, Css, php, Tailwinds CSS', 0),
(7, 5, 'Web APP', 'Website ini di bangun untuk membantu mahasiswa untuk meminjam buku di perpustakaan kampus ', '1783103432556-276159730.png', NULL, 'https://orderly.web.id', '2026-07-03 18:30:32', 0, 'Web App', 'React.js, Html, Css, php, Tailwinds CSS', 0);

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
  `university` varchar(100) DEFAULT NULL,
  `bio` text DEFAULT NULL,
  `about` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `avatar` varchar(255) DEFAULT NULL,
  `role` enum('user','admin') DEFAULT 'user'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `name`, `email`, `password`, `university`, `bio`, `about`, `created_at`, `avatar`, `role`) VALUES
(1, 'User1', 'user1@gmail.com', '$2b$10$2sPTjuRqT4Oek18U4h6Q2erK9ueBpNlxBMkhkElQyaFir1ZoecisW', NULL, NULL, NULL, '2026-05-02 17:30:29', NULL, 'user'),
(2, 'User2', 'user2@gmail.com', '$2b$10$fap/EK5/dLyFv4hsYHYZ.Ooqs2JKeDKwzhKdDeQG3rDn0lrqdINGa', NULL, NULL, NULL, '2026-05-02 17:31:01', NULL, 'user'),
(3, 'User3', 'user3@gmail.com', '$2b$10$6rVU5KJICsSoVcG2aUSUEeNUrdAMFGRs/DcMyzovGrZ9OQLTnLtay', NULL, NULL, NULL, '2026-05-02 17:36:22', NULL, 'user'),
(4, 'tompel', 'tompel@gmail.com', '$2b$10$25Pmc2gLOu6ZsJ5cLlgB..DeLuoHgb8dd7vB3gwF0JRn10Kt05YLW', '023123', 'uiux aja dah', NULL, '2026-07-03 13:36:35', 'avatar-1783086221038.png', 'user'),
(5, 'Yordan Al Zisky', 'tes@gmail.com', '$2b$10$Ysmx2nKxq44Ewph9AbrHIulwhaJPgw5MGPcSjBMdk7ybcUgcw/hsK', '0110213213123', 'Developer ', NULL, '2026-07-03 13:50:31', 'avatar-1783098941547.png', 'user'),
(6, 'Doni Setiawan', 'doni@gmail.com', '$2b$10$IfiNvTndihNUUCfbFaPgFOvfom5bHAEtGs/JxddTdyCILLR60U/qW', '0110224010', 'Development', NULL, '2026-07-03 15:38:20', 'avatar-1783093534138.webp', 'user'),
(7, 'Reza', 'reza@gmail.com', '$2b$10$HnFDt02r0zzGE8HdZ/ZcWO.wbfzt/rAfy70UmcCRDVvVhU.9k.ATC', '011021232', 'UIUX', NULL, '2026-07-03 18:32:19', NULL, 'user');

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
  ADD KEY `idx_comments_project` (`project_id`);

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
  ADD KEY `sender_id` (`sender_id`),
  ADD KEY `project_id` (`project_id`);

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
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=29;

--
-- AUTO_INCREMENT for table `comments`
--
ALTER TABLE `comments`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT for table `follows`
--
ALTER TABLE `follows`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=14;

--
-- AUTO_INCREMENT for table `likes`
--
ALTER TABLE `likes`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=37;

--
-- AUTO_INCREMENT for table `notifications`
--
ALTER TABLE `notifications`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=25;

--
-- AUTO_INCREMENT for table `projects`
--
ALTER TABLE `projects`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `project_images`
--
ALTER TABLE `project_images`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

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
  ADD CONSTRAINT `comments_ibfk_2` FOREIGN KEY (`project_id`) REFERENCES `projects` (`id`) ON DELETE CASCADE;

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
  ADD CONSTRAINT `notifications_ibfk_2` FOREIGN KEY (`sender_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `notifications_ibfk_3` FOREIGN KEY (`project_id`) REFERENCES `projects` (`id`) ON DELETE CASCADE;

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
