-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: May 04, 2025 at 05:14 PM
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
(8, 'Samxtha', 'samxtha098@gmail.com', '$2b$10$Tcr1p/K2Xne.NiuzHGzAzOoRZr.pQwFQgRMb3lOYkq1MpJ4fPI47m', '2025-04-23 09:57:23'),
(9, 'Admin', 'admin1@hamrojob.com', 'admin123', '2025-04-24 08:42:12');

-- --------------------------------------------------------

--
-- Table structure for table `applications`
--

CREATE TABLE `applications` (
  `id` int(11) NOT NULL,
  `job_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `resume` varchar(255) DEFAULT NULL,
  `resume_public_id` varchar(255) DEFAULT NULL,
  `cover_letter` text DEFAULT NULL,
  `status` enum('pending','reviewed','accepted','rejected') NOT NULL DEFAULT 'pending',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT NULL ON UPDATE current_timestamp(),
  `video_url` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `applications`
--

INSERT INTO `applications` (`id`, `job_id`, `user_id`, `resume`, `resume_public_id`, `cover_letter`, `status`, `created_at`, `updated_at`, `video_url`) VALUES
(10, 23, 19, 'https://res.cloudinary.com/dfplmkziu/image/upload/v1745307845/CV_resume/resume_19_1745307843528.pdf', NULL, 'asdfasdfsdfs', 'pending', '2025-04-22 07:44:22', NULL, 'https://res.cloudinary.com/dfplmkziu/video/upload/v1745307847/video_resumes/video_19_1745307847838.mp4'),
(14, 15, 19, 'https://res.cloudinary.com/dfplmkziu/raw/upload/v1745340927/CV_resume/resume_19_1745340928561.docx', NULL, 'gfhgfghfhgfhfhf', 'reviewed', '2025-04-22 16:55:46', '2025-04-30 16:01:12', 'https://res.cloudinary.com/dfplmkziu/video/upload/v1745340931/video_resumes/video_19_1745340930110.mp4'),
(15, 17, 19, 'https://res.cloudinary.com/dfplmkziu/raw/upload/v1745374842/CV_resume/resume_19_1745374843606.docx', NULL, 'k;l;lll', 'rejected', '2025-04-23 02:20:59', '2025-04-30 12:14:34', 'https://res.cloudinary.com/dfplmkziu/video/upload/v1745374845/video_resumes/video_19_1745374845244.mp4'),
(16, 20, 19, 'https://res.cloudinary.com/dfplmkziu/raw/upload/v1745410788/CV_resume/resume_19_1745410787331.docx', NULL, 'hsdjfkjhassssssssssssssssss', 'reviewed', '2025-04-23 12:20:05', '2025-04-30 16:01:10', 'https://res.cloudinary.com/dfplmkziu/video/upload/v1745410791/video_resumes/video_19_1745410788862.mp4'),
(17, 21, 21, 'https://res.cloudinary.com/dfplmkziu/raw/upload/v1746013736/CV_resume/resume_21_1746013737341.docx', NULL, 'dkfhakshfkjaskjfhfhfhfhfhfhfhfhfhfhfhfhfhfhfhfhfhfhfhfhfhfhfhfhfhfhfhfhfhfhfhfhfhfhfhfhfhfhfhfhfhfhfhfhfhfhfhfhfhfhfhfhfhfhfhfhfhfhfhfhfhfhfhfhfhfhfhfhfhakslakslakslakslaksl', 'reviewed', '2025-04-30 11:49:18', '2025-04-30 12:14:38', 'https://res.cloudinary.com/dfplmkziu/video/upload/v1746013739/video_resumes/video_21_1746013739580.mp4');

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
  `recruiter_id` int(11) NOT NULL,
  `job_type` varchar(50) DEFAULT 'job',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT NULL ON UPDATE current_timestamp(),
  `visibility` enum('yes','no') DEFAULT NULL,
  `payment_required` tinyint(1) DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `jobs`
--

INSERT INTO `jobs` (`id`, `title`, `company`, `location`, `description`, `requirements`, `status`, `recruiter_id`, `job_type`, `created_at`, `updated_at`, `visibility`, `payment_required`) VALUES
(15, 'Backend  Developer', 'Hamro job', 'Kathmandu ', 'Job  Describtion details ', 'need a quality person', 'active', 1, 'internship', '2025-04-08 06:19:30', '2025-04-09 02:34:36', 'yes', 1),
(16, 'Frontend  developer', 'HIrely', 'Shivapuri,kathmnadu', 'you have a make a basic website  for the client requirement.', 'Must know about react,\nfor styling must know about talwin css as well,', 'active', 1, 'part-time', '2025-04-08 06:24:43', '2025-04-09 02:34:36', 'yes', 1),
(17, 'Hr', 'Tech solution', 'Bhaktapur,Nepal', 'alsfjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjj', 'asdfaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa.,,asdfffffffffffffffffffffffffffff,asdfffffffffffffffffffff', 'active', 1, 'internship', '2025-04-08 17:09:04', '2025-04-12 05:41:08', 'yes', 1),
(18, 'Product maanaegr ', 'Hamro job', 'Lalitpur, Nepal', 'Job is to work for managing according to company policy ', 'Much   have a knowledge to do works and having 5 years experience in product company ', 'active', 1, 'job', '2025-04-11 10:35:10', '2025-04-11 16:19:14', 'yes', 1),
(19, 'Software developer ', 'Hamro job', 'Software developer ', 'Software developer Software developer Software developer ', 'Software developer Software developer Software developer Software developer ', 'closed', 1, 'full-time', '2025-04-11 16:20:55', '2025-04-12 04:28:18', 'no', 1),
(20, 'salaksjahsd', 'Hamro jobas', 'adas', 'Hamro HaHamro jobasmro jobasHamro jobasHamro jobasjobasHamro jobas', 'Hamro jobasHamro jobasHamro jobasHamro jobasHamro jobasHamro jobasHamro jobasHamro jobasHamro jobasHamro jobasHamro jobasHamro jobas', 'active', 1, 'full-time', '2025-04-11 16:35:31', '2025-04-23 12:22:56', 'yes', 1),
(21, 'Hotel manager ', 'Saliman Hotel', 'Putalisadak, Nepal', 'We are seeking a dedicated and experienced Hotel Manager to lead and oversee the daily operations of our hotel. The ideal candidate should be passionate about hospitality, possess excellent leadership skills, and ensure the highest standards of guest satisfaction. As a Hotel Manager, you will be responsible for managing staff, budgeting, marketing, and ensuring smooth and efficient operations of the hotel.\n\n', 'We are seeking a dedicated and experienced Hotel Manager to lead and oversee the daily operations of our hotel. The ideal candidate should be passionate about hospitality, possess excellent leadership skills, and ensure the highest standards of guest satisfaction. As a Hotel Manager, you will be responsible for managing staff, budgeting, marketing, and ensuring smooth and efficient operations of the hotel.\n\n', 'active', 1, 'full-time', '2025-04-11 16:43:50', '2025-04-12 05:41:28', 'yes', 1),
(22, 'Frontend developer', 'Compa', 'Frontend developer', 'Frontend developerFrontend developerFrontend developerFrontend developer', 'Frontend developerFrontend developerFronte', 'active', 2, 'part-time', '2025-04-12 11:46:23', '2025-04-12 11:49:27', 'yes', 1),
(23, 'Designer ', 'DOt net Designer ', 'Bhaktapur,Kathmandu', 'We are seeking a creative and detail-oriented Designer to join our team. The ideal candidate should have a strong eye for aesthetics and be passionate about creating visually appealing and user-friendly designs. You will work closely with our marketing, development, and product teams to bring ideas to life through design.', 'Proven experience as a designer (portfolio required)\n\nProficiency in tools like Adobe Creative Suite (Photoshop, Illustrator, XD, etc.), Figma, or Sketch\n\nStrong understanding of color theory, typography, and layout design\n\nGood communication and collaboration skills\n\nAbility to work independently and manage multiple projects', 'active', 2, 'Fulltime', '2025-04-22 07:41:23', '2025-04-22 19:26:08', 'yes', 1),
(24, 'Full stack developer ', 'Compa', 'Patan,Nepal', '- experiense in Html,Css,Js for frontend\n-experiense in backend  language like Php , Node and so on \n- must have  some awsome projects', 'cadidate must know about the basic css and backend logic like backend authentication and  so on ', 'active', 2, 'job', '2025-04-23 07:16:08', NULL, NULL, 1);

-- --------------------------------------------------------

--
-- Table structure for table `payments`
--

CREATE TABLE `payments` (
  `id` int(11) NOT NULL,
  `recruiter_id` int(11) NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  `plan_type` varchar(50) NOT NULL,
  `job_id` int(11) DEFAULT NULL,
  `payment_method` varchar(50) NOT NULL,
  `card_last_four` varchar(4) DEFAULT NULL,
  `payment_status` varchar(20) NOT NULL,
  `transaction_id` varchar(100) DEFAULT NULL,
  `payment_date` datetime NOT NULL,
  `updated_at` datetime DEFAULT NULL,
  `job_posts_allowed` int(11) DEFAULT 1,
  `job_posts_used` int(11) DEFAULT 0,
  `expiry_date` date DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `payments`
--

INSERT INTO `payments` (`id`, `recruiter_id`, `amount`, `plan_type`, `job_id`, `payment_method`, `card_last_four`, `payment_status`, `transaction_id`, `payment_date`, `updated_at`, `job_posts_allowed`, `job_posts_used`, `expiry_date`) VALUES
(39, 2, 2110.00, 'standard', NULL, 'esewa', NULL, 'success', 'manual-1746028013815-i897bhx4', '2025-04-30 21:31:53', '2025-04-30 21:31:53', 3, 0, '2025-05-15'),
(43, 3, 2110.00, 'standard', NULL, 'esewa', NULL, 'success', 'manual-1745395634370-esvyaiw3', '2025-04-23 13:52:14', NULL, 3, 0, '2025-05-08'),
(65, 1, 2110.00, 'standard', NULL, 'esewa', NULL, 'success', 'manual-1746029060609-ilo92xqf', '2025-04-30 21:49:20', '2025-04-30 21:49:20', 3, 0, '2025-05-15'),
(67, 4, 2110.00, 'standard', NULL, 'esewa', NULL, 'success', 'manual-1746013336236-gsyf1n31', '2025-04-30 17:27:16', '2025-04-30 17:27:16', 3, 0, '2025-05-15');

-- --------------------------------------------------------

--
-- Table structure for table `payment_plans`
--

CREATE TABLE `payment_plans` (
  `id` int(11) NOT NULL,
  `plan_name` varchar(50) NOT NULL,
  `description` text DEFAULT NULL,
  `price` decimal(10,2) NOT NULL,
  `job_posts_allowed` int(11) NOT NULL,
  `validity_days` int(11) NOT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `payment_plans`
--

INSERT INTO `payment_plans` (`id`, `plan_name`, `description`, `price`, `job_posts_allowed`, `validity_days`, `is_active`, `created_at`, `updated_at`) VALUES
(1, 'basic', 'Post 1 job with 7-day visibility.', 1000.00, 1, 7, 1, '2025-04-12 06:31:42', '2025-04-12 06:31:42'),
(2, 'standard', 'Post up to 3 jobs with 15-day visibility + featured badge.', 2000.00, 3, 15, 1, '2025-04-12 06:31:42', '2025-04-12 06:31:42'),
(3, 'premium', 'Unlimited job posts, 30-day visibility + top placement.', 3000.00, -1, 30, 1, '2025-04-12 06:31:42', '2025-04-12 06:31:42');

-- --------------------------------------------------------

--
-- Table structure for table `recruiter`
--

CREATE TABLE `recruiter` (
  `id` int(11) NOT NULL,
  `username` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role` enum('seeker','recruiter') NOT NULL DEFAULT 'recruiter',
  `status` enum('active','inactive') NOT NULL DEFAULT 'active',
  `profile_image` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT NULL ON UPDATE current_timestamp(),
  `phone` varchar(20) DEFAULT NULL,
  `location` varchar(100) DEFAULT NULL,
  `bio` text DEFAULT NULL,
  `company_name` varchar(255) DEFAULT NULL,
  `subscription_id` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `recruiter`
--

INSERT INTO `recruiter` (`id`, `username`, `email`, `password`, `role`, `status`, `profile_image`, `created_at`, `updated_at`, `phone`, `location`, `bio`, `company_name`, `subscription_id`) VALUES
(1, 'Samir Shrestha', 'samirxtha098@gmail.com', '$2b$10$kUavxjE/AbR5R3YnBOToCeXfZ94YC6EixyoOf0c4kgeqVLmUlcAky', 'recruiter', 'active', NULL, '2025-04-07 15:59:35', '2025-04-30 15:34:14', NULL, NULL, NULL, 'Hamro job', NULL),
(2, 'sadikshya munankarmi', 'sadikshyamunankarmi7@gmail.com', '$2b$10$PILo8HTntC7pCG7nl2KfiuisyCws3WTSfQ/cjnPEW.jZ4js3becYS', 'recruiter', 'active', NULL, '2025-04-12 11:44:18', '2025-04-12 17:20:53', NULL, NULL, NULL, 'Compa', NULL),
(3, 'Nijal Shankar', 'np03cs4a220139@heraldcollege.edu.np', '$2b$10$8PeN9eQOBoV9zA146KxYtOqxWaqUqiKYd8APYENlGtavN1sqQnsIS', 'recruiter', 'active', NULL, '2025-04-12 12:13:55', '2025-04-12 12:45:25', NULL, NULL, NULL, 'Bajya', NULL),
(4, 'sam stha', 'elegantsammet@ysosirius.com', '$2b$10$llNXkj5FyqOeAEOzqmcliOys7XWrsu8z5nDwpQ/tl8FGpylTKmgKu', 'recruiter', 'active', NULL, '2025-04-23 12:24:59', '2025-04-30 10:34:24', NULL, NULL, NULL, 'elegantsammet', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `recruiter_subscriptions`
--

CREATE TABLE `recruiter_subscriptions` (
  `id` int(11) NOT NULL,
  `recruiter_id` int(11) NOT NULL,
  `plan_type` varchar(50) NOT NULL,
  `expiry_date` date NOT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
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
(18, 'Samir magar', 'magarsamir243@gmail.com', '$2b$10$IokkgaEl6Rfb9ibCbKI00uW30I3aJMUKjKUymwfFtXIHdkfSirQJS', 'seeker', 'active', NULL, NULL, '2025-04-07 11:21:50', '2025-04-07 11:24:41', '9819721210', 'Kathmandu,Nepal', 'I am student currently study in herald college ', 'Html,Css,Javascript \n'),
(19, 'Samir Shrestha', 'samirxtha098@gmail.com', '$2b$10$hv53eSiijRnQcY5YCWTcm.PI11IX9Vaaahdawgxdn0NRNE2tdIuf2', 'seeker', 'active', NULL, NULL, '2025-04-08 04:51:20', '2025-04-11 09:48:40', '9819721219', 'kathmandu nepal', 'i am student  and i am currently study in herald college located at naxal', 'Html,CSS,JS ,React '),
(20, 'Sadikshya Munankarmi', 'sadikshyamunankarmi7@gmail.com', '$2b$10$gSIsRW5E1DQF3nWSg8CafeZQwCu9R91UptAIt1BYQlur1/BMnuRVG', 'seeker', 'active', NULL, NULL, '2025-04-11 09:54:01', '2025-04-11 09:56:45', '9861044040', 'Shrijananagar ,Bhaktapur', 'I am  sadikshya munankarmi . I am from bhaktapur', 'Html ,  Css, Js ,Php , My SQL\n'),
(21, 'Sujal Basnet', 'sujal.basnet6002@gmail.com', '$2b$10$f/bjNVGXo9J1UZ8zMzzd4.b9xl9LeP29DgEpOEWaC885ftzVWQtOu', 'seeker', 'active', NULL, NULL, '2025-04-13 04:03:00', '2025-04-13 04:03:43', '98918928911', 'Kathmandu', 'lorem', 'alskjflkasjf,jadkahskg'),
(22, 'samir shrestha', 'nostalgicchaum6@justzeus.com', '$2b$10$ww/Y7mYs/xByt2XVl0qe3O4MEvcW/GXOx2gyo0uV5XQifRCvupQ1u', 'seeker', 'active', NULL, NULL, '2025-04-13 05:01:57', NULL, NULL, NULL, NULL, NULL),
(23, 'thirstyyalow8txa', 'thirstyyalow8@tomorjerry.com', '$2b$10$BNlzbQpGJP8ydMW6kt.8zuBU6yTDHxlshQRhRSh9f7rASCHv0EFQi', 'seeker', 'active', NULL, NULL, '2025-04-23 10:06:39', NULL, NULL, NULL, NULL, NULL);

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
  ADD KEY `fk_recruiter` (`recruiter_id`);

--
-- Indexes for table `payments`
--
ALTER TABLE `payments`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `recruiter_id` (`recruiter_id`),
  ADD KEY `idx_payments_recruiter_id` (`recruiter_id`),
  ADD KEY `idx_payments_transaction_id` (`transaction_id`);

--
-- Indexes for table `payment_plans`
--
ALTER TABLE `payment_plans`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `recruiter`
--
ALTER TABLE `recruiter`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_recruiter_subscription` (`subscription_id`);

--
-- Indexes for table `recruiter_subscriptions`
--
ALTER TABLE `recruiter_subscriptions`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_recruiter` (`recruiter_id`);

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
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT for table `applications`
--
ALTER TABLE `applications`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=18;

--
-- AUTO_INCREMENT for table `jobs`
--
ALTER TABLE `jobs`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=25;

--
-- AUTO_INCREMENT for table `payments`
--
ALTER TABLE `payments`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=68;

--
-- AUTO_INCREMENT for table `payment_plans`
--
ALTER TABLE `payment_plans`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `recruiter`
--
ALTER TABLE `recruiter`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `recruiter_subscriptions`
--
ALTER TABLE `recruiter_subscriptions`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=24;

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
  ADD CONSTRAINT `fk_recruiter` FOREIGN KEY (`recruiter_id`) REFERENCES `recruiter` (`id`);

--
-- Constraints for table `payments`
--
ALTER TABLE `payments`
  ADD CONSTRAINT `payments_ibfk_1` FOREIGN KEY (`recruiter_id`) REFERENCES `recruiter` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `payments_ibfk_2` FOREIGN KEY (`job_id`) REFERENCES `jobs` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `recruiter`
--
ALTER TABLE `recruiter`
  ADD CONSTRAINT `fk_recruiter_subscription` FOREIGN KEY (`subscription_id`) REFERENCES `recruiter_subscriptions` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `recruiter_subscriptions`
--
ALTER TABLE `recruiter_subscriptions`
  ADD CONSTRAINT `recruiter_subscriptions_ibfk_1` FOREIGN KEY (`recruiter_id`) REFERENCES `recruiter` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
