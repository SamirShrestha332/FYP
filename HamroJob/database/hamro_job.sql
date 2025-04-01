-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Apr 01, 2025 at 09:12 PM
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
-- Database: `hamro_job`
--

DELIMITER $$
--
-- Procedures
--
CREATE DEFINER=`root`@`localhost` PROCEDURE `change_user_password` (IN `user_id` INT, IN `new_password` VARCHAR(255))   BEGIN
  UPDATE users 
  SET password = new_password,
    updated_at = CURRENT_TIMESTAMP
  WHERE id = user_id;
END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `update_user_profile` (IN `user_id` INT, IN `user_username` VARCHAR(255), IN `user_phone` VARCHAR(20), IN `user_location` VARCHAR(100), IN `user_bio` TEXT, IN `user_skills` TEXT)   BEGIN
  UPDATE users 
  SET 
    username = user_username,
    phone = user_phone,
    location = user_location,
    bio = user_bio,
    skills = user_skills,
    updated_at = CURRENT_TIMESTAMP
  WHERE id = user_id;
END$$

DELIMITER ;

-- --------------------------------------------------------

--
-- Table structure for table `admin_users`
--

CREATE TABLE `admin_users` (
  `id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `admin_users`
--

INSERT INTO `admin_users` (`id`, `name`, `email`, `password`, `created_at`) VALUES
(1, 'Admin', 'admin@hamrojob.com', 'Admin@123', '2025-03-18 11:41:44'),
(3, 'Admin', 'admin1@hamrojob.com', 'Admin1@123', '2025-03-18 12:07:29'),
(4, 'admin21', 'admin21@gmail.co', 'admin@12344', '2025-04-01 19:04:46'),
(5, 'admin311', 'admin311@gmail.com', 'Admin@12344', '2025-04-01 19:06:15'),
(6, 'Samir', 'samiradmin@gmail.com', 'samir21', '2025-04-01 19:11:21');

-- --------------------------------------------------------

--
-- Table structure for table `applications`
--

CREATE TABLE `applications` (
  `id` int(11) NOT NULL,
  `job_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `resume` varchar(255) DEFAULT NULL,
  `cover_letter` text DEFAULT NULL,
  `status` enum('pending','reviewed','accepted','rejected') NOT NULL DEFAULT 'pending',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT NULL ON UPDATE current_timestamp(),
  `videoresume` varchar(20) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `jobs`
--

CREATE TABLE `jobs` (
  `id` int(11) NOT NULL,
  `title` varchar(255) NOT NULL,
  `company` varchar(255) NOT NULL,
  `location` varchar(255) NOT NULL,
  `description` text NOT NULL,
  `requirements` text NOT NULL,
  `status` enum('active','closed') NOT NULL DEFAULT 'active',
  `user_id` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT NULL ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `username` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role` enum('seeker','recruiter') NOT NULL DEFAULT 'seeker',
  `status` enum('active','inactive') NOT NULL DEFAULT 'active',
  `profile_image` varchar(255) DEFAULT NULL,
  `resume` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT NULL ON UPDATE current_timestamp(),
  `phone` varchar(20) DEFAULT NULL,
  `location` varchar(100) DEFAULT NULL,
  `bio` text DEFAULT NULL,
  `skills` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `username`, `email`, `password`, `role`, `status`, `profile_image`, `resume`, `created_at`, `updated_at`, `phone`, `location`, `bio`, `skills`) VALUES
(1, 'Samir samxt', 'magarsamir243@gmail.com', '$2b$10$A9tFUwmQUOPE.WPFB6pwbuxhLDeG8W8uOBSq4.MEqFhqook.l5FTS', 'seeker', 'active', NULL, NULL, '2025-03-18 11:44:12', NULL, NULL, NULL, NULL, NULL),
(2, 'Samir Magar', 'magarsamir2434@gmail.com', '$2b$10$/9o/DDR0skAioZYPh9tXWebw9h7YPsRfrFoA5m8pONG6JoZ9eUaxS', 'seeker', 'active', NULL, NULL, '2025-03-18 11:44:12', NULL, NULL, NULL, NULL, NULL),
(4, 'Samir Shrestha', 'shresthasamir223@gmail.com', '$2b$10$Soyx25ZvwiASEidp09Uiqu4PwXWPektmuCCuFo70dfxzPzJDkrOgO', 'seeker', 'active', NULL, NULL, '2025-03-18 11:44:12', NULL, NULL, NULL, NULL, NULL),
(5, 'Sam dev fkahdkfjhakjhsdfk', 'sadjfkah1213@gmail.com', '$2b$10$31rV1KEt6cqtH6Kj9XLUwO.DmsUNedmhz0/A13Y5nPJmc8y8eVS1e', 'seeker', 'active', NULL, NULL, '2025-03-18 11:44:12', NULL, NULL, NULL, NULL, NULL),
(6, 'Samir Shretha', 'samir234@gmail.com', '$2b$10$a89SxowivY7Kc32DzFnLb.w5rQ5KYlUb4o4KtQURHsRYM9pn7WHu.', 'seeker', 'active', NULL, NULL, '2025-03-19 05:23:01', NULL, NULL, NULL, NULL, NULL),
(7, 'João Souza Silva', 'shresthasamir2235@gmail.com', '$2b$10$5QWgh4Z/qUOy0eQkSSHf3.dh6gr22mBtX22gR/Gb1ldpZNzr7MINy', 'seeker', 'active', NULL, NULL, '2025-03-19 05:23:54', NULL, NULL, NULL, NULL, NULL),
(8, 'Juan Francisco García Flores', 'shresthasamir223c@gmail.com', '$2b$10$dai5NEHRaYon0AWbp5EKYOWNif0Ubj4nuUOC129TK7A88k5uBBeQ2', 'seeker', 'active', NULL, NULL, '2025-03-19 05:24:33', NULL, NULL, NULL, NULL, NULL),
(9, 'Samir  Shrestha ', 'sthasamir234@gmail.com', '$2b$10$k6aHHldxsduQ7U3B3fnP4uSce0TXgC26wfFSpv2GOUYlVc5xxXokm', 'seeker', 'active', NULL, NULL, '2025-03-24 07:10:48', NULL, NULL, NULL, NULL, NULL),
(10, 'Nijal  Shankar ', 'shankarbolanat@gmail.com', '$2b$10$2U60sfM/i4QECgvFQtRfseP5OrvxEJ.dMfDu3vatWFrNdCV0pgQ.e', 'seeker', 'active', NULL, NULL, '2025-03-24 10:58:27', NULL, NULL, NULL, NULL, NULL),
(11, 'Samir  Shrestha', 'sthasamir324@gmail.com', '$2b$10$elgRT6TaZy4JKYgd4w8HeOJnM9L7dwozpUGD8n/PjOxj1YyVikCZy', 'seeker', 'active', NULL, NULL, '2025-04-01 16:27:36', NULL, NULL, NULL, NULL, NULL),
(15, 'samir Samir Shrestha', 'np03cs4a220138@heraldcollege.edu.np', '$2b$10$SReGU/EuljsebVkIDcTrZu1x8G3oK/bnbF5cBx0UxCOUyAJAhNkf.', 'seeker', 'active', NULL, NULL, '2025-04-01 18:13:17', NULL, NULL, NULL, NULL, NULL),
(17, 'Samir  Shrestha', 'samirxtha098@gmail.com', '$2b$10$mwqk7cb2f3gKh3MwuPlvnODSKuFWuEOlEQvS0jA9WB8Pq2hvBqvN6', 'seeker', 'active', NULL, NULL, '2025-04-01 18:42:41', '2025-04-01 18:46:10', '9819721210', 'Kathmandu ', 'My Name is Samir and i love coding \n', 'React,Nodejs,Mysql\n');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `admin_users`
--
ALTER TABLE `admin_users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- Indexes for table `applications`
--
ALTER TABLE `applications`
  ADD PRIMARY KEY (`id`),
  ADD KEY `job_id` (`job_id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `jobs`
--
ALTER TABLE `jobs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`);

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
-- AUTO_INCREMENT for table `admin_users`
--
ALTER TABLE `admin_users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `applications`
--
ALTER TABLE `applications`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `jobs`
--
ALTER TABLE `jobs`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=18;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `applications`
--
ALTER TABLE `applications`
  ADD CONSTRAINT `applications_ibfk_1` FOREIGN KEY (`job_id`) REFERENCES `jobs` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `applications_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `jobs`
--
ALTER TABLE `jobs`
  ADD CONSTRAINT `jobs_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
