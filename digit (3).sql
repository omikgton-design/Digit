-- phpMyAdmin SQL Dump
-- version 5.2.1deb3
-- https://www.phpmyadmin.net/
--
-- Host: localhost:3306
-- Generation Time: Aug 27, 2026 at 02:02 AM
-- Server version: 8.0.46-0ubuntu0.24.04.3
-- PHP Version: 8.3.6

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `digit`
--

-- --------------------------------------------------------

--
-- Table structure for table `auth_group`
--

CREATE TABLE `auth_group` (
  `id` int NOT NULL,
  `name` varchar(150) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `auth_group_permissions`
--

CREATE TABLE `auth_group_permissions` (
  `id` bigint NOT NULL,
  `group_id` int NOT NULL,
  `permission_id` int NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `auth_permission`
--

CREATE TABLE `auth_permission` (
  `id` int NOT NULL,
  `name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `content_type_id` int NOT NULL,
  `codename` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `auth_permission`
--

INSERT INTO `auth_permission` (`id`, `name`, `content_type_id`, `codename`) VALUES
(1, 'Can add log entry', 1, 'add_logentry'),
(2, 'Can change log entry', 1, 'change_logentry'),
(3, 'Can delete log entry', 1, 'delete_logentry'),
(4, 'Can view log entry', 1, 'view_logentry'),
(5, 'Can add permission', 2, 'add_permission'),
(6, 'Can change permission', 2, 'change_permission'),
(7, 'Can delete permission', 2, 'delete_permission'),
(8, 'Can view permission', 2, 'view_permission'),
(9, 'Can add group', 3, 'add_group'),
(10, 'Can change group', 3, 'change_group'),
(11, 'Can delete group', 3, 'delete_group'),
(12, 'Can view group', 3, 'view_group'),
(13, 'Can add user', 4, 'add_user'),
(14, 'Can change user', 4, 'change_user'),
(15, 'Can delete user', 4, 'delete_user'),
(16, 'Can view user', 4, 'view_user'),
(17, 'Can add content type', 5, 'add_contenttype'),
(18, 'Can change content type', 5, 'change_contenttype'),
(19, 'Can delete content type', 5, 'delete_contenttype'),
(20, 'Can view content type', 5, 'view_contenttype'),
(21, 'Can add session', 6, 'add_session'),
(22, 'Can change session', 6, 'change_session'),
(23, 'Can delete session', 6, 'delete_session'),
(24, 'Can view session', 6, 'view_session'),
(25, 'Can add customer', 7, 'add_customer'),
(26, 'Can change customer', 7, 'change_customer'),
(27, 'Can delete customer', 7, 'delete_customer'),
(28, 'Can view customer', 7, 'view_customer'),
(29, 'Can add category', 8, 'add_category'),
(30, 'Can change category', 8, 'change_category'),
(31, 'Can delete category', 8, 'delete_category'),
(32, 'Can view category', 8, 'view_category'),
(33, 'Can add software', 9, 'add_software'),
(34, 'Can change software', 9, 'change_software'),
(35, 'Can delete software', 9, 'delete_software'),
(36, 'Can view software', 9, 'view_software'),
(37, 'Can add software image', 10, 'add_softwareimage'),
(38, 'Can change software image', 10, 'change_softwareimage'),
(39, 'Can delete software image', 10, 'delete_softwareimage'),
(40, 'Can view software image', 10, 'view_softwareimage'),
(41, 'Can add advisory service', 11, 'add_advisoryservice'),
(42, 'Can change advisory service', 11, 'change_advisoryservice'),
(43, 'Can delete advisory service', 11, 'delete_advisoryservice'),
(44, 'Can view advisory service', 11, 'view_advisoryservice'),
(45, 'Can add advisory service image', 12, 'add_advisoryserviceimage'),
(46, 'Can change advisory service image', 12, 'change_advisoryserviceimage'),
(47, 'Can delete advisory service image', 12, 'delete_advisoryserviceimage'),
(48, 'Can view advisory service image', 12, 'view_advisoryserviceimage'),
(49, 'Can add advisory price term', 13, 'add_advisorypriceterm'),
(50, 'Can change advisory price term', 13, 'change_advisorypriceterm'),
(51, 'Can delete advisory price term', 13, 'delete_advisorypriceterm'),
(52, 'Can view advisory price term', 13, 'view_advisorypriceterm'),
(53, 'Can add advisory service type', 14, 'add_advisoryservicetype'),
(54, 'Can change advisory service type', 14, 'change_advisoryservicetype'),
(55, 'Can delete advisory service type', 14, 'delete_advisoryservicetype'),
(56, 'Can view advisory service type', 14, 'view_advisoryservicetype'),
(57, 'Can add advisory like', 15, 'add_advisorylike'),
(58, 'Can change advisory like', 15, 'change_advisorylike'),
(59, 'Can delete advisory like', 15, 'delete_advisorylike'),
(60, 'Can view advisory like', 15, 'view_advisorylike'),
(61, 'Can add article', 16, 'add_article'),
(62, 'Can change article', 16, 'change_article'),
(63, 'Can delete article', 16, 'delete_article'),
(64, 'Can view article', 16, 'view_article'),
(65, 'Can add software rating', 18, 'add_softwarerating'),
(66, 'Can change software rating', 18, 'change_softwarerating'),
(67, 'Can delete software rating', 18, 'delete_softwarerating'),
(68, 'Can view software rating', 18, 'view_softwarerating'),
(69, 'Can add advisory rating', 17, 'add_advisoryrating'),
(70, 'Can change advisory rating', 17, 'change_advisoryrating'),
(71, 'Can delete advisory rating', 17, 'delete_advisoryrating'),
(72, 'Can view advisory rating', 17, 'view_advisoryrating'),
(73, 'Can add customer membership payment', 19, 'add_customermembershippayment'),
(74, 'Can change customer membership payment', 19, 'change_customermembershippayment'),
(75, 'Can delete customer membership payment', 19, 'delete_customermembershippayment'),
(76, 'Can view customer membership payment', 19, 'view_customermembershippayment'),
(77, 'Can add footer menu content', 20, 'add_footermenucontent'),
(78, 'Can change footer menu content', 20, 'change_footermenucontent'),
(79, 'Can delete footer menu content', 20, 'delete_footermenucontent'),
(80, 'Can view footer menu content', 20, 'view_footermenucontent'),
(81, 'Can add partner organization', 21, 'add_partnerorganization'),
(82, 'Can change partner organization', 21, 'change_partnerorganization'),
(83, 'Can delete partner organization', 21, 'delete_partnerorganization'),
(84, 'Can view partner organization', 21, 'view_partnerorganization'),
(85, 'Can add slide', 22, 'add_slide'),
(86, 'Can change slide', 22, 'change_slide'),
(87, 'Can delete slide', 22, 'delete_slide'),
(88, 'Can view slide', 22, 'view_slide'),
(89, 'Can add about section', 23, 'add_aboutsection'),
(90, 'Can change about section', 23, 'change_aboutsection'),
(91, 'Can delete about section', 23, 'delete_aboutsection'),
(92, 'Can view about section', 23, 'view_aboutsection');

-- --------------------------------------------------------

--
-- Table structure for table `auth_user`
--

CREATE TABLE `auth_user` (
  `id` int NOT NULL,
  `password` varchar(128) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `last_login` datetime(6) DEFAULT NULL,
  `is_superuser` tinyint(1) NOT NULL,
  `username` varchar(150) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `first_name` varchar(150) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `last_name` varchar(150) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `email` varchar(254) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `is_staff` tinyint(1) NOT NULL,
  `is_active` tinyint(1) NOT NULL,
  `date_joined` datetime(6) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `auth_user`
--

INSERT INTO `auth_user` (`id`, `password`, `last_login`, `is_superuser`, `username`, `first_name`, `last_name`, `email`, `is_staff`, `is_active`, `date_joined`) VALUES
(4, 'pbkdf2_sha256$720000$D4n1UgQn3jnwAlPHcpzrA3$DCvtJl7ryo7qC1SzjZi9foRNxtAGupN4AarGxX0Xqbk=', '2026-03-11 08:16:13.072978', 0, 'nice.uugan@gmail.com', '', '', 'nice.uugan@gmail.com', 0, 1, '2026-02-26 02:07:25.716596'),
(5, 'pbkdf2_sha256$1200000$gXEkL6M2sMbBg1fa9KF88D$QE/dRh4vBh4O3L77Hrir6oI5KYTspOIzhm1Hc2Hy+M8=', '2026-08-17 02:47:40.411122', 1, 'admin', '', '', 'admin@digit.mn', 1, 1, '2026-02-26 02:47:59.022475'),
(6, '', NULL, 1, 'sampleadmin', '', '', 'sampleadmin@example.com', 1, 1, '2026-02-26 05:30:56.810024'),
(7, '', NULL, 0, 'sampledev01', '', '', 'sampledev01@example.com', 0, 1, '2026-02-26 05:30:57.556383'),
(8, '', NULL, 0, 'sampledev02', '', '', 'sampledev02@example.com', 0, 1, '2026-02-26 05:30:57.627716'),
(9, '', NULL, 0, 'sampledev03', '', '', 'sampledev03@example.com', 0, 1, '2026-02-26 05:30:57.698342'),
(10, '', NULL, 0, 'sampledev04', '', '', 'sampledev04@example.com', 0, 1, '2026-02-26 05:30:57.764483'),
(11, '', NULL, 0, 'sampledev05', '', '', 'sampledev05@example.com', 0, 1, '2026-02-26 05:30:57.846650'),
(12, '', NULL, 0, 'sampledev06', '', '', 'sampledev06@example.com', 0, 1, '2026-02-26 05:30:57.913599'),
(13, '', NULL, 0, 'sampledev07', '', '', 'sampledev07@example.com', 0, 1, '2026-02-26 05:30:57.979265'),
(14, '', NULL, 0, 'sampledev08', '', '', 'sampledev08@example.com', 0, 1, '2026-02-26 05:30:58.045456'),
(15, '', NULL, 0, 'sampledev09', '', '', 'sampledev09@example.com', 0, 1, '2026-02-26 05:30:58.112597'),
(16, '', NULL, 0, 'sampledev10', '', '', 'sampledev10@example.com', 0, 1, '2026-02-26 05:30:58.179064'),
(17, 'pbkdf2_sha256$720000$mu7VDJAAQctnsLf4zWHxFO$rhDI1jwGukTelcao3BRgghyMxwr1w3GPZBZmLPCSx+Y=', NULL, 0, 'uuganbayar.d@ncac.mn', '', '', 'uuganbayar.d@ncac.mn', 0, 1, '2026-03-10 08:21:14.645446'),
(18, '', NULL, 0, 'sampleadvisory01', '', '', 'sampleadvisory01@example.com', 0, 1, '2026-03-11 06:35:33.454556'),
(19, '', NULL, 0, 'sampleadvisory02', '', '', 'sampleadvisory02@example.com', 0, 1, '2026-03-11 06:35:33.537067'),
(20, '', NULL, 0, 'sampleadvisory03', '', '', 'sampleadvisory03@example.com', 0, 1, '2026-03-11 06:35:33.610917'),
(21, '', NULL, 0, 'sampleadvisory04', '', '', 'sampleadvisory04@example.com', 0, 1, '2026-03-11 06:35:33.678587'),
(22, '', NULL, 0, 'sampleadvisory05', '', '', 'sampleadvisory05@example.com', 0, 1, '2026-03-11 06:35:33.800442'),
(23, '', NULL, 0, 'sampleadvisory06', '', '', 'sampleadvisory06@example.com', 0, 1, '2026-03-11 06:35:34.087463'),
(24, '', NULL, 0, 'sampleadvisory07', '', '', 'sampleadvisory07@example.com', 0, 1, '2026-03-11 06:35:34.239417'),
(25, '', NULL, 0, 'sampleadvisory08', '', '', 'sampleadvisory08@example.com', 0, 1, '2026-03-11 06:35:34.346555'),
(26, '', NULL, 0, 'sampleadvisory09', '', '', 'sampleadvisory09@example.com', 0, 1, '2026-03-11 06:35:34.396573'),
(27, '', NULL, 0, 'sampleadvisory10', '', '', 'sampleadvisory10@example.com', 0, 1, '2026-03-11 06:35:34.463235'),
(28, '', NULL, 0, 'samplearticle01', '', '', 'samplearticle01@example.com', 0, 1, '2026-03-11 08:35:58.594248'),
(29, '', NULL, 0, 'samplearticle02', '', '', 'samplearticle02@example.com', 0, 1, '2026-03-11 08:35:58.661371'),
(30, '', NULL, 0, 'samplearticle03', '', '', 'samplearticle03@example.com', 0, 1, '2026-03-11 08:35:58.726206'),
(31, '', NULL, 0, 'samplearticle04', '', '', 'samplearticle04@example.com', 0, 1, '2026-03-11 08:35:58.804462'),
(32, '', NULL, 0, 'samplearticle05', '', '', 'samplearticle05@example.com', 0, 1, '2026-03-11 08:35:58.887370'),
(33, '', NULL, 0, 'samplearticle06', '', '', 'samplearticle06@example.com', 0, 1, '2026-03-11 08:35:58.970257'),
(34, '', NULL, 0, 'samplearticle07', '', '', 'samplearticle07@example.com', 0, 1, '2026-03-11 08:35:59.046103'),
(35, '', NULL, 0, 'samplearticle08', '', '', 'samplearticle08@example.com', 0, 1, '2026-03-11 08:35:59.119869'),
(36, '', NULL, 0, 'samplearticle09', '', '', 'samplearticle09@example.com', 0, 1, '2026-03-11 08:35:59.185141'),
(37, '', NULL, 0, 'samplearticle10', '', '', 'samplearticle10@example.com', 0, 1, '2026-03-11 08:35:59.254158'),
(38, 'pbkdf2_sha256$720000$DoYaoICQancOWjL2LYxl8M$tI8Oh140p1rIa5ueaVvThQdmtuI4oJV2c2KYL//Lfzw=', '2026-03-16 01:16:39.389432', 0, 'shijir@uugan.com', '', '', 'shijir@uugan.com', 0, 1, '2026-03-12 06:54:27.274285'),
(39, 'pbkdf2_sha256$1200000$mlfg4iqCGH2yLa4H8k7xyc$8RiOH3MC2ZahGg+DsP0RCoUWefnfME0xhRZie41CYKE=', '2026-08-04 08:54:38.373923', 0, 'zaya@gmail.com', '', '', 'zaya@gmail.com', 0, 1, '2026-08-04 08:54:38.134309'),
(40, 'pbkdf2_sha256$1200000$rULRtD5RpfmrJlQj60pjhS$w8Gd8SQcYkh8U3FscuGv729vjyJXjmStMm2ntlLfYfs=', '2026-08-05 07:44:09.320943', 0, 'zayaaq@gmail.com', '', '', 'zayaaq@gmail.com', 0, 1, '2026-08-05 07:44:09.079821'),
(41, 'pbkdf2_sha256$1200000$oqE7odDUA5obnLXnRlPiBV$UAmDETmRCZ69QrOQmw/PJ3EI5hEG74iehtVCSFiCHdc=', '2026-08-06 09:33:53.397674', 0, 'yuna@gmail.com', '', '', 'yuna@gmail.com', 0, 1, '2026-08-06 09:33:53.111115'),
(42, 'pbkdf2_sha256$1200000$Msa6KR9rwEqj6Z02ilxroL$knG5tk4ImOVRjbYGSgkIkxkjMC3wW3il54uO3NO2Ykg=', '2026-08-21 09:32:15.511812', 0, 'zayaaa@gmail.com', '', '', 'zayaaa@gmail.com', 0, 1, '2026-08-21 09:32:15.233211'),
(43, 'pbkdf2_sha256$1200000$xwY6sTjyaTcvK8HZk4AFPq$AEfvRrSoktaD9sbpu+Fvvfou1hMwhd73l3Q5xyLOV14=', '2026-08-21 09:38:26.197264', 0, 'digit2@gmail.com', '', '', 'digit2@gmail.com', 0, 1, '2026-08-21 09:38:25.946812');

-- --------------------------------------------------------

--
-- Table structure for table `auth_user_groups`
--

CREATE TABLE `auth_user_groups` (
  `id` bigint NOT NULL,
  `user_id` int NOT NULL,
  `group_id` int NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `auth_user_user_permissions`
--

CREATE TABLE `auth_user_user_permissions` (
  `id` bigint NOT NULL,
  `user_id` int NOT NULL,
  `permission_id` int NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `django_admin_log`
--

CREATE TABLE `django_admin_log` (
  `id` int NOT NULL,
  `action_time` datetime(6) NOT NULL,
  `object_id` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci,
  `object_repr` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `action_flag` smallint UNSIGNED NOT NULL,
  `change_message` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `content_type_id` int DEFAULT NULL,
  `user_id` int NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `django_content_type`
--

CREATE TABLE `django_content_type` (
  `id` int NOT NULL,
  `app_label` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `model` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `django_content_type`
--

INSERT INTO `django_content_type` (`id`, `app_label`, `model`) VALUES
(1, 'admin', 'logentry'),
(3, 'auth', 'group'),
(2, 'auth', 'permission'),
(4, 'auth', 'user'),
(5, 'contenttypes', 'contenttype'),
(6, 'sessions', 'session'),
(23, 'website', 'aboutsection'),
(15, 'website', 'advisorylike'),
(13, 'website', 'advisorypriceterm'),
(17, 'website', 'advisoryrating'),
(11, 'website', 'advisoryservice'),
(12, 'website', 'advisoryserviceimage'),
(14, 'website', 'advisoryservicetype'),
(16, 'website', 'article'),
(8, 'website', 'category'),
(7, 'website', 'customer'),
(19, 'website', 'customermembershippayment'),
(20, 'website', 'footermenucontent'),
(21, 'website', 'partnerorganization'),
(22, 'website', 'slide'),
(9, 'website', 'software'),
(10, 'website', 'softwareimage'),
(18, 'website', 'softwarerating');

-- --------------------------------------------------------

--
-- Table structure for table `django_migrations`
--

CREATE TABLE `django_migrations` (
  `id` bigint NOT NULL,
  `app` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `applied` datetime(6) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `django_migrations`
--

INSERT INTO `django_migrations` (`id`, `app`, `name`, `applied`) VALUES
(1, 'contenttypes', '0001_initial', '2026-02-06 00:48:00.462700'),
(2, 'auth', '0001_initial', '2026-02-06 00:48:04.782316'),
(3, 'admin', '0001_initial', '2026-02-06 00:48:05.387654'),
(4, 'admin', '0002_logentry_remove_auto_add', '2026-02-06 00:48:05.452773'),
(5, 'admin', '0003_logentry_add_action_flag_choices', '2026-02-06 00:48:05.479354'),
(6, 'contenttypes', '0002_remove_content_type_name', '2026-02-06 00:48:05.780973'),
(7, 'auth', '0002_alter_permission_name_max_length', '2026-02-06 00:48:06.052928'),
(8, 'auth', '0003_alter_user_email_max_length', '2026-02-06 00:48:06.127463'),
(9, 'auth', '0004_alter_user_username_opts', '2026-02-06 00:48:06.161095'),
(10, 'auth', '0005_alter_user_last_login_null', '2026-02-06 00:48:06.383633'),
(11, 'auth', '0006_require_contenttypes_0002', '2026-02-06 00:48:06.430988'),
(12, 'auth', '0007_alter_validators_add_error_messages', '2026-02-06 00:48:06.462417'),
(13, 'auth', '0008_alter_user_username_max_length', '2026-02-06 00:48:06.717590'),
(14, 'auth', '0009_alter_user_last_name_max_length', '2026-02-06 00:48:06.970694'),
(15, 'auth', '0010_alter_group_name_max_length', '2026-02-06 00:48:07.038846'),
(16, 'auth', '0011_update_proxy_permissions', '2026-02-06 00:48:07.064300'),
(17, 'auth', '0012_alter_user_first_name_max_length', '2026-02-06 00:48:07.315939'),
(18, 'sessions', '0001_initial', '2026-02-06 00:48:07.568233'),
(19, 'website', '0001_initial', '2026-02-06 01:39:22.475874'),
(20, 'website', '0002_customer_account_type_alter_customer_type', '2026-02-06 03:34:54.698121'),
(21, 'website', '0003_category', '2026-02-06 05:23:26.209298'),
(22, 'website', '0004_software_softwareimage', '2026-02-26 02:47:04.494535'),
(23, 'website', '0005_software_is_featured', '2026-03-04 05:48:03.987068'),
(24, 'website', '0006_advisoryservice_advisoryserviceimage', '2026-03-11 06:35:07.552855'),
(25, 'website', '0007_alter_advisoryservice_service_type', '2026-03-11 07:49:11.448043'),
(26, 'website', '0008_advisoryservice_structure_update', '2026-03-11 07:57:03.242841'),
(27, 'website', '0009_lookup_tables_for_advisory_types', '2026-03-11 07:57:08.777476'),
(28, 'website', '0010_advisorylike', '2026-03-11 08:15:39.020059'),
(29, 'website', '0011_article', '2026-03-11 08:32:36.289368'),
(30, 'website', '0012_approval_status', '2026-03-16 06:04:23.948219'),
(31, 'website', '0013_ratings', '2026-08-04 06:55:36.426767'),
(32, 'website', '0014_customer_membership_dates', '2026-08-05 01:21:00.437747'),
(33, 'website', '0015_customer_membership_payment_history', '2026-08-05 01:27:12.209967'),
(34, 'website', '0016_footer_menu_content', '2026-08-05 01:56:22.536766'),
(35, 'website', '0017_partnerorganization_alter_category_type', '2026-08-05 05:45:55.469537'),
(36, 'website', '0018_slide_alter_category_type', '2026-08-17 02:04:55.760690'),
(37, 'website', '0019_aboutsection_alter_category_type', '2026-08-17 02:42:27.483633');

-- --------------------------------------------------------

--
-- Table structure for table `django_session`
--

CREATE TABLE `django_session` (
  `session_key` varchar(40) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `session_data` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `expire_date` datetime(6) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `django_session`
--

INSERT INTO `django_session` (`session_key`, `session_data`, `expire_date`) VALUES
('019zq6tzezyts7edqngih11murhgm9le', '.eJxVjMsOwiAQRf-FtSHhMQIu3fsNZJgBqRpISrtq_Hdt0oVu7znnbiLiutS4jjzHicVFgDj9bgnpmdsO-IHt3iX1tsxTkrsiDzrkrXN-XQ_376DiqN8ajdaFk_fBK3QhKSCF9gzBAhmFGYlAWwjgTIFEujhizYWcBquUK-L9AeBlN9g:1wrRw7:vuyjlujFub5l2pNSJRVjIb67bW9TU92W086XydLKSE4', '2026-08-19 03:04:55.999690'),
('0vgqowf1zx0fl2i6731cuber9m455wl2', '.eJxVjMsOwiAQRf-FtSHhMQIu3fsNZJgBqRpISrtq_Hdt0oVu7znnbiLiutS4jjzHicVFgDj9bgnpmdsO-IHt3iX1tsxTkrsiDzrkrXN-XQ_376DiqN8ajdaFk_fBK3QhKSCF9gzBAhmFGYlAWwjgTIFEujhizYWcBquUK-L9AeBlN9g:1wrRUM:98dftg8GJDXvYn26760v4pwaBpIvODlxEoKM0Wc58uo', '2026-08-19 02:36:14.680891'),
('1h9832ht3iv6xgd1arnjt944h5yxeaxq', '.eJxVjMsOwiAQRf-FtSHhMQIu3fsNZJgBqRpISrtq_Hdt0oVu7znnbiLiutS4jjzHicVFgDj9bgnpmdsO-IHt3iX1tsxTkrsiDzrkrXN-XQ_376DiqN8ajdaFk_fBK3QhKSCF9gzBAhmFGYlAWwjgTIFEujhizYWcBquUK-L9AeBlN9g:1wrQPt:4IYznWwkNx2MtpZTeW9oqYaLddpHVwVNt_KPRVQh0R8', '2026-08-19 01:27:33.237791'),
('1otkqbjauvdfmwu1368wnunwt9raoyrj', '.eJxVjMsOwiAQRf-FtSHhMQIu3fsNZJgBqRpISrtq_Hdt0oVu7znnbiLiutS4jjzHicVFgDj9bgnpmdsO-IHt3iX1tsxTkrsiDzrkrXN-XQ_376DiqN8ajdaFk_fBK3QhKSCF9gzBAhmFGYlAWwjgTIFEujhizYWcBquUK-L9AeBlN9g:1wuRoN:eIWvyn7LrE915nPnLUp1Cg-y1Cb2MLO9dZ9KJNtQjdY', '2026-08-27 09:33:19.502544'),
('2gw25b0djjxo83olu1mmqu9s32vnkggf', '.eJxVjMsOwiAQRf-FtSHhMQIu3fsNZJgBqRpISrtq_Hdt0oVu7znnbiLiutS4jjzHicVFgDj9bgnpmdsO-IHt3iX1tsxTkrsiDzrkrXN-XQ_376DiqN8ajdaFk_fBK3QhKSCF9gzBAhmFGYlAWwjgTIFEujhizYWcBquUK-L9AeBlN9g:1wrRFd:QLrmOCWBlXDUyG4CUlter9CN9lJIzuKOpKzBXQdnVz8', '2026-08-19 02:21:01.595778'),
('4pbhem5kxfnbhiupwedhf0b88avdj7u4', '.eJxVjMsOwiAQRf-FtSHhMQIu3fsNZJgBqRpISrtq_Hdt0oVu7znnbiLiutS4jjzHicVFgDj9bgnpmdsO-IHt3iX1tsxTkrsiDzrkrXN-XQ_376DiqN8ajdaFk_fBK3QhKSCF9gzBAhmFGYlAWwjgTIFEujhizYWcBquUK-L9AeBlN9g:1wrRpA:CV60LsDHacX7YP_t_p6MUX5Lho_EUhkr-DSmpymCNaQ', '2026-08-19 02:57:44.203894'),
('5569xnjsa8bdtosopknr5xl1scuffh4q', '.eJxVjMsOwiAQRf-FtSHhMQIu3fsNZJgBqRpISrtq_Hdt0oVu7znnbiLiutS4jjzHicVFgDj9bgnpmdsO-IHt3iX1tsxTkrsiDzrkrXN-XQ_376DiqN8ajdaFk_fBK3QhKSCF9gzBAhmFGYlAWwjgTIFEujhizYWcBquUK-L9AeBlN9g:1wrR8q:MKF3BgRVK-ve7h5_yNxokdiXgN6UtCiNW5kHhtJz9fg', '2026-08-19 02:14:00.809999'),
('9a8ucfb7ry9edtl62ooybxks9grdjpiy', '.eJxVjMsOwiAQRf-FtSHhMQIu3fsNZJgBqRpISrtq_Hdt0oVu7znnbiLiutS4jjzHicVFgDj9bgnpmdsO-IHt3iX1tsxTkrsiDzrkrXN-XQ_376DiqN8ajdaFk_fBK3QhKSCF9gzBAhmFGYlAWwjgTIFEujhizYWcBquUK-L9AeBlN9g:1wrRpM:e6YPSdvUzOS6QG3YlNv_K6V3zO3xEudV_H1Vp3Z0EmU', '2026-08-19 02:57:56.592849'),
('9k0dpqt5fv9sqlt6t4jm88m6antjsc6s', '.eJxVjMsOwiAQRf-FtSHhMQIu3fsNZJgBqRpISrtq_Hdt0oVu7znnbiLiutS4jjzHicVFgDj9bgnpmdsO-IHt3iX1tsxTkrsiDzrkrXN-XQ_376DiqN8ajdaFk_fBK3QhKSCF9gzBAhmFGYlAWwjgTIFEujhizYWcBquUK-L9AeBlN9g:1wrRMd:NMpiSzolvVQXxO-Y7pxSajf6wADeM6nrfNal1ZRYY7g', '2026-08-19 02:28:15.812213'),
('aarwpt3exmwhrc5rs2c0atu04yu5vfsx', '.eJxVjMsOwiAQRf-FtSHhMQIu3fsNZJgBqRpISrtq_Hdt0oVu7znnbiLiutS4jjzHicVFgDj9bgnpmdsO-IHt3iX1tsxTkrsiDzrkrXN-XQ_376DiqN8ajdaFk_fBK3QhKSCF9gzBAhmFGYlAWwjgTIFEujhizYWcBquUK-L9AeBlN9g:1wrQKV:8MqCCI7z13fEnfsGeWq_MWyP9XE_GiXomQ2HpWbpmU0', '2026-08-19 01:21:59.555688'),
('aggwpl97awhbggeyemqdnxgis5i241lc', '.eJxVjMsOwiAQRf-FtSHhMQIu3fsNZJgBqRpISrtq_Hdt0oVu7znnbiLiutS4jjzHicVFgDj9bgnpmdsO-IHt3iX1tsxTkrsiDzrkrXN-XQ_376DiqN8ajdaFk_fBK3QhKSCF9gzBAhmFGYlAWwjgTIFEujhizYWcBquUK-L9AeBlN9g:1wrQwl:uq9CA3dLxctfdrFDiMZIaP852ISGD0M9fEoAw_9UsyU', '2026-08-19 02:01:31.089684'),
('di0ju0w0fev4js6jfwcrisx2fx0z3px8', '.eJxVjMsOwiAQRf-FtSHhMQIu3fsNZJgBqRpISrtq_Hdt0oVu7znnbiLiutS4jjzHicVFgDj9bgnpmdsO-IHt3iX1tsxTkrsiDzrkrXN-XQ_376DiqN8ajdaFk_fBK3QhKSCF9gzBAhmFGYlAWwjgTIFEujhizYWcBquUK-L9AeBlN9g:1wrRIw:wsx6fIH3ZUEbyA5c8vyqyscNb6d7t3u68SK3p9ax5Z4', '2026-08-19 02:24:26.829299'),
('duj0c4h0818263nub1qtbcr3pl035dyr', '.eJxVjMsOwiAQRf-FtSHhMQIu3fsNZJgBqRpISrtq_Hdt0oVu7znnbiLiutS4jjzHicVFgDj9bgnpmdsO-IHt3iX1tsxTkrsiDzrkrXN-XQ_376DiqN8ajdaFk_fBK3QhKSCF9gzBAhmFGYlAWwjgTIFEujhizYWcBquUK-L9AeBlN9g:1wrRhG:IsjDAc8HcmmxBP05eeMnwpDkaqJQGYpocVkM8Btk51E', '2026-08-19 02:49:34.623849'),
('ec3kcr0pm150ej838b47sgcq9slf4oj1', '.eJxVjMsOwiAQRf-FtSHhMQIu3fsNZJgBqRpISrtq_Hdt0oVu7znnbiLiutS4jjzHicVFgDj9bgnpmdsO-IHt3iX1tsxTkrsiDzrkrXN-XQ_376DiqN8ajdaFk_fBK3QhKSCF9gzBAhmFGYlAWwjgTIFEujhizYWcBquUK-L9AeBlN9g:1wrQKM:hl5zZVk6e1HkQi0DXJI3VNn4lQQ5UtZus9B48wsGTDo', '2026-08-19 01:21:50.831297'),
('enl91xdhc2lgp050yn2c6pjk7u11vbpb', '.eJxVjMsOwiAQRf-FtSHhMQIu3fsNZJgBqRpISrtq_Hdt0oVu7znnbiLiutS4jjzHicVFgDj9bgnpmdsO-IHt3iX1tsxTkrsiDzrkrXN-XQ_376DiqN8ajdaFk_fBK3QhKSCF9gzBAhmFGYlAWwjgTIFEujhizYWcBquUK-L9AeBlN9g:1wrRdx:BQjE3tmI8GUTs-zbRB688gZqqiFYHs8_5QTVTeLxK9U', '2026-08-19 02:46:09.291358'),
('ezqp5zic24rc2dmbvj9wcuztozcitmts', '.eJxVjMsOwiAQRf-FtSHhMQIu3fsNZJgBqRpISrtq_Hdt0oVu7znnbiLiutS4jjzHicVFgDj9bgnpmdsO-IHt3iX1tsxTkrsiDzrkrXN-XQ_376DiqN8ajdaFk_fBK3QhKSCF9gzBAhmFGYlAWwjgTIFEujhizYWcBquUK-L9AeBlN9g:1wrRwK:JUUo-HDr68UHfi--wNc4ZkTcmEy2BK44h92M17qKm_M', '2026-08-19 03:05:08.763204'),
('f4i7wfvxlpzcoayakh9jqlinmzh8txsp', '.eJxVjMsOwiAQRf-FtSHhMQIu3fsNZJgBqRpISrtq_Hdt0oVu7znnbiLiutS4jjzHicVFgDj9bgnpmdsO-IHt3iX1tsxTkrsiDzrkrXN-XQ_376DiqN8ajdaFk_fBK3QhKSCF9gzBAhmFGYlAWwjgTIFEujhizYWcBquUK-L9AeBlN9g:1wrRX7:kjtXAQkafw-HQ1FNJ5TGdTa_4GRSBvSFdbr-RoK9zss', '2026-08-19 02:39:05.878263'),
('gca37ob2ql115s4uf6mr7bhah0ikd0gx', '.eJxVjMsOwiAQRf-FtSHhMQIu3fsNZJgBqRpISrtq_Hdt0oVu7znnbiLiutS4jjzHicVFgDj9bgnpmdsO-IHt3iX1tsxTkrsiDzrkrXN-XQ_376DiqN8ajdaFk_fBK3QhKSCF9gzBAhmFGYlAWwjgTIFEujhizYWcBquUK-L9AeBlN9g:1wrRYv:sbchY-JwqQXuBM4nd5lBWg5l-wHQ6qdW6lPtrIYHilw', '2026-08-19 02:40:57.780644'),
('gfh00d598obnob81v70qi3vmn3pyjd3f', '.eJxVjMsOwiAQRf-FtSHhMQIu3fsNZJgBqRpISrtq_Hdt0oVu7znnbiLiutS4jjzHicVFgDj9bgnpmdsO-IHt3iX1tsxTkrsiDzrkrXN-XQ_376DiqN8ajdaFk_fBK3QhKSCF9gzBAhmFGYlAWwjgTIFEujhizYWcBquUK-L9AeBlN9g:1wvnO0:sUBs1I5jYBP0X4UAl2jg6MdakZ0rRo5aqsQNJXoAKVk', '2026-08-31 02:47:40.415615'),
('jyn58mk2mcpgs92tu83895g59g4femve', '.eJxVjMsOwiAQRf-FtSHhMQIu3fsNZJgBqRpISrtq_Hdt0oVu7znnbiLiutS4jjzHicVFgDj9bgnpmdsO-IHt3iX1tsxTkrsiDzrkrXN-XQ_376DiqN8ajdaFk_fBK3QhKSCF9gzBAhmFGYlAWwjgTIFEujhizYWcBquUK-L9AeBlN9g:1wrRfU:_OTRkR52ic1kc9DhJzN5oZ1Aut9VE1n4Xg5utm4fgGU', '2026-08-19 02:47:44.825384'),
('k4v0t5oqobg1jkrf0wmgr5w9s4dc7ul2', '.eJxVjEEOwiAQRe_C2hAmIAwu3XsGMjOAVE2blHbVeHdt0oVu_3vvbyrRurS09jKnIauLsqhOvyOTPMu4k_yg8T5pmcZlHljvij5o17cpl9f1cP8OGvX2rU0lRuOAxQs4D8aht46tDzUiBgwCgCwZuFqPZ5szeQclGomh1EDq_QHxije3:1w1wZT:QnaYNSUhxoRGRK1A0Kn1lCybr_7Ufi2FRXTmiNplI2g', '2026-03-30 01:16:39.443152'),
('khgummd85byu20yflvkeypbiyftholi1', '.eJxVjMsOwiAQRf-FtSHhMQIu3fsNZJgBqRpISrtq_Hdt0oVu7znnbiLiutS4jjzHicVFgDj9bgnpmdsO-IHt3iX1tsxTkrsiDzrkrXN-XQ_376DiqN8ajdaFk_fBK3QhKSCF9gzBAhmFGYlAWwjgTIFEujhizYWcBquUK-L9AeBlN9g:1wrRkw:8gWyuZJu5QJscdRyQDL87WjdQsx1wa0P97ohWeyjH9c', '2026-08-19 02:53:22.651973'),
('kta2j8mqk5kbk32zfzd36685faqyft0y', '.eJxVjMsOwiAUBf-FtSEIBa4u3fsN5D6oVA0kpV0Z_12bdKHbMzPnpRKuS0lrz3OaRJ2VVYffjZAfuW5A7lhvTXOryzyR3hS9066vTfLzsrt_BwV7-daDkIucCSATuuAHgwasRB-HwJhdBBMIkEc5hSjWIwqPR8Fg2ApCVO8P-hM4wA:1voCdm:bBeIahKbK9ASG87PArZE4u7P2GdCMWvEKyINsZ_e9vA', '2026-02-20 03:36:18.627611'),
('l4xz4kkfehs4vbfx09jfe3uio07jn7i3', '.eJxVjMsOwiAQRf-FtSHhMQIu3fsNZJgBqRpISrtq_Hdt0oVu7znnbiLiutS4jjzHicVFgDj9bgnpmdsO-IHt3iX1tsxTkrsiDzrkrXN-XQ_376DiqN8ajdaFk_fBK3QhKSCF9gzBAhmFGYlAWwjgTIFEujhizYWcBquUK-L9AeBlN9g:1wrRZ6:CJn3lnAw-0rWlLgSdBLsetd5rZkqYD2B3BHp0JQTjiM', '2026-08-19 02:41:08.479627'),
('nlcmcnxmn841s7ujyu91fg9vjxuu39n9', '.eJxVjMsOwiAQRf-FtSHhMQIu3fsNZJgBqRpISrtq_Hdt0oVu7znnbiLiutS4jjzHicVFgDj9bgnpmdsO-IHt3iX1tsxTkrsiDzrkrXN-XQ_376DiqN8ajdaFk_fBK3QhKSCF9gzBAhmFGYlAWwjgTIFEujhizYWcBquUK-L9AeBlN9g:1wrRCz:MuAc64AK0lAWf0wZ3LMxg4bkNBgMnpEMaQGs1v5lI7g', '2026-08-19 02:18:17.652976'),
('owe5aa2d487rg0e788k5onr06pi3dzng', '.eJxVjMsOwiAQRf-FtSHhMQIu3fsNZJgBqRpISrtq_Hdt0oVu7znnbiLiutS4jjzHicVFgDj9bgnpmdsO-IHt3iX1tsxTkrsiDzrkrXN-XQ_376DiqN8ajdaFk_fBK3QhKSCF9gzBAhmFGYlAWwjgTIFEujhizYWcBquUK-L9AeBlN9g:1wrRmn:GV3ZoB93Pz7YCMYZWzJUXaiO0QmPHliHFMnciOQb_ns', '2026-08-19 02:55:17.387005'),
('oxr9qf09nne5y7i90bri02z7d2fqhled', '.eJxVjMsOwiAQRf-FtSHhMQIu3fsNZJgBqRpISrtq_Hdt0oVu7znnbiLiutS4jjzHicVFgDj9bgnpmdsO-IHt3iX1tsxTkrsiDzrkrXN-XQ_376DiqN8ajdaFk_fBK3QhKSCF9gzBAhmFGYlAWwjgTIFEujhizYWcBquUK-L9AeBlN9g:1wrQrw:-Q41Xss1u4RrVB9LdMFgwREfU6H8LFUxQtFNZOal6iA', '2026-08-19 01:56:32.183583'),
('p1pbam2kc07ac2w42q429bggvjb52b02', '.eJxVjMsOwiAQRf-FtSHhMQIu3fsNZJgBqRpISrtq_Hdt0oVu7znnbiLiutS4jjzHicVFgDj9bgnpmdsO-IHt3iX1tsxTkrsiDzrkrXN-XQ_376DiqN8ajdaFk_fBK3QhKSCF9gzBAhmFGYlAWwjgTIFEujhizYWcBquUK-L9AeBlN9g:1wrQWs:D857Si0e_UetFWbNBTS0DSmD77wVOt2yH3PejkjSBkw', '2026-08-19 01:34:46.994527'),
('sbf4h3y42libcqvnp85ue0f00ae5o7ik', '.eJxVjEEOwiAQAP_C2RCkkGU9evcNhGVXqRpISntq_Lsh6UGvM5PZVUzbWuLWZYkzq4vy6vTLKOWX1CH4meqj6dzqusykR6IP2_WtsbyvR_s3KKmXsQ0ilBJyFjSIxgWexJwNEtDdQvbZokweDFkBZmJHwWUI7CxYEq8-X_-mOHM:1w21Yn:9Q6GvH0I0o6bCYJguRrrUx9vz-2VHcfnnwvfNrcdr_0', '2026-03-30 06:36:17.335672'),
('sdfru4pp5n11twow7y2zn2ua4vhw4p39', '.eJxVjDkOwjAQAP_iGlm210eWkj5vsDbeNQmgRMpRIf6OLKWAdmY0b5Xp2Md8bLLmidVVeVCXXzhQecrcDD9ovi-6LPO-ToNuiT7tpvuF5XU727_BSNvYvtUayylA9SgEwdoSEDBFqrF2PriuUoqYkjBiB459chacYQNSpFT1-QLlsjdk:1wxLhi:S-t4fSy7RMpshZSmRT9J8DB1gFUydzLkfeuOQMwrlX8', '2026-09-04 09:38:26.205373'),
('t427l6fs6xmo2yw1xrrcsqg0m1x16s6v', '.eJxVjMsOwiAQRf-FtSHhMQIu3fsNZJgBqRpISrtq_Hdt0oVu7znnbiLiutS4jjzHicVFgDj9bgnpmdsO-IHt3iX1tsxTkrsiDzrkrXN-XQ_376DiqN8ajdaFk_fBK3QhKSCF9gzBAhmFGYlAWwjgTIFEujhizYWcBquUK-L9AeBlN9g:1wru7v:g_8KDutRZ_WEUV8NJinpyfVEFzh3lFAE0jMllIBObks', '2026-08-20 09:10:59.906864'),
('tjmjjmsr7uzpynxgsqopjxgz3a2973ur', '.eJxVjMsOwiAQRf-FtSHhMQIu3fsNZJgBqRpISrtq_Hdt0oVu7znnbiLiutS4jjzHicVFgDj9bgnpmdsO-IHt3iX1tsxTkrsiDzrkrXN-XQ_376DiqN8ajdaFk_fBK3QhKSCF9gzBAhmFGYlAWwjgTIFEujhizYWcBquUK-L9AeBlN9g:1wrQcF:p6VN2mfVx7UapJIcWMpHS3J-e2x11epwWJXKtJi-2Ro', '2026-08-19 01:40:19.221977'),
('triuane113bkuv4a11zts9l9qzbekzgc', '.eJxVjMsOwiAQRf-FtSHhMQIu3fsNZJgBqRpISrtq_Hdt0oVu7znnbiLiutS4jjzHicVFgDj9bgnpmdsO-IHt3iX1tsxTkrsiDzrkrXN-XQ_376DiqN8ajdaFk_fBK3QhKSCF9gzBAhmFGYlAWwjgTIFEujhizYWcBquUK-L9AeBlN9g:1wrRDA:cQp2O0rz37ZGeF2-jx30iNZOI8TiKDxLD3yzzYOUeb8', '2026-08-19 02:18:28.929818'),
('xas4r5hjuiim8rn0a1b9ujx05qg69fcr', '.eJxVjMsOwiAQRf-FtSHhMQIu3fsNZJgBqRpISrtq_Hdt0oVu7znnbiLiutS4jjzHicVFgDj9bgnpmdsO-IHt3iX1tsxTkrsiDzrkrXN-XQ_376DiqN8ajdaFk_fBK3QhKSCF9gzBAhmFGYlAWwjgTIFEujhizYWcBquUK-L9AeBlN9g:1wrQeu:MpFp-V7qqJljpfkAwtVmr7t7XkgxPLWIq_ah3iv8bnw', '2026-08-19 01:43:04.508732'),
('ybru79l8z51ny7tmo0fnppf3j9a7tc5l', '.eJxVjMsOwiAQRf-FtSHhMQIu3fsNZJgBqRpISrtq_Hdt0oVu7znnbiLiutS4jjzHicVFgDj9bgnpmdsO-IHt3iX1tsxTkrsiDzrkrXN-XQ_376DiqN8ajdaFk_fBK3QhKSCF9gzBAhmFGYlAWwjgTIFEujhizYWcBquUK-L9AeBlN9g:1wrQKF:Ric8RXGNrxPYZbXbY_3GQ5-bnBBEdCyGFBHLlC46LgE', '2026-08-19 01:21:43.311499'),
('ynjoegol07z3wcff94ywd1z5hgrti014', '.eJxVjMsOwiAQRf-FtSHhMQIu3fsNZJgBqRpISrtq_Hdt0oVu7znnbiLiutS4jjzHicVFgDj9bgnpmdsO-IHt3iX1tsxTkrsiDzrkrXN-XQ_376DiqN8ajdaFk_fBK3QhKSCF9gzBAhmFGYlAWwjgTIFEujhizYWcBquUK-L9AeBlN9g:1wrQuK:cegGDoYeuOqchWUJDbYTmmzvZYAfelCYRCsHSf5vxqg', '2026-08-19 01:59:00.186126'),
('zndxphtyxd5k8jczpp3eekag0242u3am', '.eJxVjMsOwiAQRf-FtSHhMQIu3fsNZJgBqRpISrtq_Hdt0oVu7znnbiLiutS4jjzHicVFgDj9bgnpmdsO-IHt3iX1tsxTkrsiDzrkrXN-XQ_376DiqN8ajdaFk_fBK3QhKSCF9gzBAhmFGYlAWwjgTIFEujhizYWcBquUK-L9AeBlN9g:1wvnNs:ki8FYiGg7Dmu3bQkTh5ItxjXG2b4QdSXCgaabdybVSE', '2026-08-31 02:47:32.230164'),
('zysbu0g2dlfzuobs8h3jnilhlf4ofknz', '.eJxVjMsOwiAQRf-FtSHhMQIu3fsNZJgBqRpISrtq_Hdt0oVu7znnbiLiutS4jjzHicVFgDj9bgnpmdsO-IHt3iX1tsxTkrsiDzrkrXN-XQ_376DiqN8ajdaFk_fBK3QhKSCF9gzBAhmFGYlAWwjgTIFEujhizYWcBquUK-L9AeBlN9g:1wrQbq:Rh4TiATN7-GDcLwRaROlxGTR9jpdzvLyjacAs6c5Bbk', '2026-08-19 01:39:54.602554');

-- --------------------------------------------------------

--
-- Table structure for table `website_aboutsection`
--

CREATE TABLE `website_aboutsection` (
  `id` bigint NOT NULL,
  `kicker` varchar(120) COLLATE utf8mb4_general_ci NOT NULL,
  `title` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `description` longtext COLLATE utf8mb4_general_ci NOT NULL,
  `feature_title` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `feature_text` longtext COLLATE utf8mb4_general_ci NOT NULL,
  `button_text` varchar(120) COLLATE utf8mb4_general_ci NOT NULL,
  `button_url` varchar(500) COLLATE utf8mb4_general_ci NOT NULL,
  `circle_right_text` varchar(120) COLLATE utf8mb4_general_ci NOT NULL,
  `circle_left_text` varchar(120) COLLATE utf8mb4_general_ci NOT NULL,
  `top_image` varchar(100) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `bottom_image` varchar(100) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `sort_order` int UNSIGNED NOT NULL,
  `is_active` tinyint(1) NOT NULL,
  `created_date` datetime(6) NOT NULL,
  `update_date` datetime(6) NOT NULL
) ;

--
-- Dumping data for table `website_aboutsection`
--

INSERT INTO `website_aboutsection` (`id`, `kicker`, `title`, `description`, `feature_title`, `feature_text`, `button_text`, `button_url`, `circle_right_text`, `circle_left_text`, `top_image`, `bottom_image`, `sort_order`, `is_active`, `created_date`, `update_date`) VALUES
(1, 'Бидний тухай', 'Бизнесийн шийдлээ нэг дороос сонгоход тусална', 'Digit нь байгууллагуудад тохирох програм хангамж, зөвлөх үйлчилгээ, мэдлэг мэдээллийг нэг платформ дээр цэгцтэй харьцуулж сонгоход тусалдаг.', 'Ил тод, бодит мэдээлэл', 'Шийдэл, үйлчилгээ, нийтлэлийг нэг дороос ойлгомжтой харьцуулна.', 'Дэлгэрэнгүй', '/footer/about', 'Найдвартай мэдээлэл', 'Зөв сонголт', '', '', 0, 1, '2026-08-17 02:42:39.646085', '2026-08-17 02:48:44.054525');

-- --------------------------------------------------------

--
-- Table structure for table `website_advisorylike`
--

CREATE TABLE `website_advisorylike` (
  `id` bigint NOT NULL,
  `created_date` datetime(6) NOT NULL,
  `advisory_service_id` bigint NOT NULL,
  `user_id` int NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `website_advisorylike`
--

INSERT INTO `website_advisorylike` (`id`, `created_date`, `advisory_service_id`, `user_id`) VALUES
(7, '2026-08-21 09:31:14.329754', 102, 5);

-- --------------------------------------------------------

--
-- Table structure for table `website_advisorypriceterm`
--

CREATE TABLE `website_advisorypriceterm` (
  `id` bigint NOT NULL,
  `key` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `sort_order` int UNSIGNED NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `website_advisorypriceterm`
--

INSERT INTO `website_advisorypriceterm` (`id`, `key`, `name`, `sort_order`) VALUES
(1, 'fixed', 'Төслөөр', 1),
(2, 'monthly', 'Сараар', 2),
(3, 'hourly', 'Цагаар', 3),
(4, 'custom', 'Тохиролцоно', 4);

-- --------------------------------------------------------

--
-- Table structure for table `website_advisoryrating`
--

CREATE TABLE `website_advisoryrating` (
  `id` bigint NOT NULL,
  `score` smallint UNSIGNED NOT NULL,
  `created_date` datetime(6) NOT NULL,
  `update_date` datetime(6) NOT NULL,
  `advisory_service_id` bigint NOT NULL,
  `user_id` int NOT NULL
) ;

--
-- Dumping data for table `website_advisoryrating`
--

INSERT INTO `website_advisoryrating` (`id`, `score`, `created_date`, `update_date`, `advisory_service_id`, `user_id`) VALUES
(1, 3, '2026-08-05 02:07:45.586107', '2026-08-05 02:07:48.657306', 96, 5);

-- --------------------------------------------------------

--
-- Table structure for table `website_advisoryservice`
--

CREATE TABLE `website_advisoryservice` (
  `id` bigint NOT NULL,
  `title` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `introduction` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `description` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `is_featured` tinyint(1) NOT NULL,
  `created_date` datetime(6) NOT NULL,
  `update_date` datetime(6) NOT NULL,
  `company_id` bigint NOT NULL,
  `created_by_id` int NOT NULL,
  `client_organizations` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT (_utf8mb3''),
  `price` decimal(14,2) NOT NULL,
  `service_start_year` smallint UNSIGNED NOT NULL,
  `price_terms_id` bigint NOT NULL,
  `service_type_id` bigint NOT NULL,
  `is_approved` tinyint(1) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `website_advisoryservice`
--

INSERT INTO `website_advisoryservice` (`id`, `title`, `introduction`, `description`, `is_featured`, `created_date`, `update_date`, `company_id`, `created_by_id`, `client_organizations`, `price`, `service_start_year`, `price_terms_id`, `service_type_id`, `is_approved`) VALUES
(52, 'хөдөлмөрийн эрүүл мэнд (ХЭМ) ийн менежментийг шинэчлэн сайжруулах зөвлөх үйлчилгээ.', '<ul><li>ҮЙЛЧИЛГЭЭНИЙ АЧ ХОЛБОГДОЛ, ХЭРЭГЦЭЭ</li><li>Аж ахуйн нэгж, байгууллага бүр ажилтныхаа эрүүл мэндийг ажлын байрны сөрөг хүчин зүйлсээс&nbsp; үүрэг хариуцлага хүлээдэг. Ялангуяа уурхай, үйлдвэр зэрэг эрсдэлтэй салбарын байгууллагууд ажлын байрныхаа эрүүл ахуйн нөхцөлийг хэмжиж, үнэлэх, түүнээс үүсэх эрсдэлийг бууруулах, арилгах, ажилтны эрүүл мэндийн үзлэгийг зохион байгуулах зэрэг ХЭМ-ийн арга хэмжээг өдөр тутам хэрэгжүүлдэг.&nbsp;</li></ul>', '<div><br></div><ul><li>Энэ шаардлагын хүрээнд аж ахуйн нэгж, байгууллагууд хөдөлмөрийн эрүүл ахуй, эрүүл мэндийн асуудал хариуцсан нэгж бүтэц байгуулж, ажилтан томилж, зардал төсөвлөж, арга хэмжээг хэрэгжүүлэх зэргээр ХЭМ-ийн тогтолцоотой байх шаардлага тулгардаг.&nbsp;</li><li>Байгууллагын ХЭМ-ийн тогтолцоо нь тухайн байгууллагын онцлогт тохирсон, ажилтны эрүүл мэндийг хамгаалах үр нөлөөтэй, зардал-үр ашгийн зарчимд суурилсан, эрсдэлд чиглэсэн оновчтой байхыг зэрэгцээ хууль тогтоомжийн шаардлагыг хангасан байх шаардлагатай.</li><li>Манай зөвлөх үйлчилгээ байгууллага бүрийн онцлог, хэрэгцээнд үндэслэн “Хөдөлмөрийн эрүүл мэндийн менежмент”-ийг нь сайржуулахад чиглэдэг.</li></ul>', 1, '2026-08-04 06:58:00.832197', '2026-08-06 08:00:05.989419', 32, 6, '<ul><li>Үйлдвэрлэл D</li><li>Худалдааны сүлжээ E</li><li>Санхүүгийн байгууллага F</li></ul>', 1585000.00, 2018, 2, 2, 1),
(53, 'Sample Advisory 002 - Impact Acceleration', 'Удирдлагын түвшний шийдвэр гаргалтад зориулсан бүтэцтэй зөвлөх үйлчилгээ.', 'Одоогийн гүйцэтгэл, байгууллагын нөөц, өсөлтийн саадыг задлан шинжилж, бодит хэрэгжилтэд чиглэсэн зөвлөмж боловсруулна.\n\nЖишээ үйлчилгээний код: 002\nХэрэгжүүлэх чиглэл: Маркетингийн зөвлөх\nЗорилтот байгууллага: өсөлтийн шатандаа яваа ЖДҮ болон дунд хэмжээний компани.', 1, '2026-08-04 06:58:00.953165', '2026-08-04 06:58:00.953185', 15, 6, 'Боловсролын байгууллага G\nЭмнэлэг H\nЛожистикийн компани I', 1670000.00, 2019, 3, 3, 1),
(54, 'Sample Advisory 003 - Prime Optimization', 'Компанийн зорилго, багийн чадавх, хэрэгжилтийг нэг цэгт уялдуулсан зөвлөмж.', 'Шийдвэр гаргагчдад зориулсан товч executive summary болон багийн түвшний нарийвчилсан хэрэгжүүлэлтийн төлөвлөгөө гаргана.\n\nЖишээ үйлчилгээний код: 003\nХэрэгжүүлэх чиглэл: Хүний нөөцийн зөвлөх\nЗорилтот байгууллага: өсөлтийн шатандаа яваа ЖДҮ болон дунд хэмжээний компани.', 1, '2026-08-04 06:58:01.097002', '2026-08-04 06:58:01.097021', 16, 6, 'Барилгын компани J\nТехнологийн компани K\nҮйлчилгээний компани L', 1755000.00, 2020, 4, 4, 1),
(55, 'Sample Advisory 004 - Scale Blueprint', 'Бизнесийн өсөлтөд чиглэсэн практик зөвлөмж, хэрэгжүүлэх төлөвлөгөө.', 'Энэ үйлчилгээ нь нөхцөл байдлын үнэлгээ, эрсдэлийн зураглал, хэрэгжүүлэх roadmap, KPI хяналтын зөвлөмжийг багтаана.\n\nЖишээ үйлчилгээний код: 004\nХэрэгжүүлэх чиглэл: Үйл ажиллагааны зөвлөх\nЗорилтот байгууллага: өсөлтийн шатандаа яваа ЖДҮ болон дунд хэмжээний компани.', 1, '2026-08-04 06:58:01.175002', '2026-08-04 06:58:01.175023', 17, 6, 'Төрийн байгууллага A\nХувийн хэвшлийн компани B\nСтартап C', 1840000.00, 2021, 1, 5, 1),
(56, 'Sample Advisory 005 - Smart Launch', 'Одоогийн процессийг шинжилж, сайжруулах алхамчилсан шийдэл.', 'Салбарын онцлогт тохируулсан оношилгоо хийж, багийн бүтэц, процесс, хэмжүүрийн түвшинд сайжруулалтын санал өгнө.\n\nЖишээ үйлчилгээний код: 005\nХэрэгжүүлэх чиглэл: Дижитал шилжилтийн зөвлөх\nЗорилтот байгууллага: өсөлтийн шатандаа яваа ЖДҮ болон дунд хэмжээний компани.', 1, '2026-08-04 06:58:01.292829', '2026-08-04 06:58:01.292846', 18, 6, 'Үйлдвэрлэл D\nХудалдааны сүлжээ E\nСанхүүгийн байгууллага F', 1925000.00, 2022, 2, 6, 1),
(57, 'Sample Advisory 006 - Core Operations', 'Удирдлагын түвшний шийдвэр гаргалтад зориулсан бүтэцтэй зөвлөх үйлчилгээ.', 'Одоогийн гүйцэтгэл, байгууллагын нөөц, өсөлтийн саадыг задлан шинжилж, бодит хэрэгжилтэд чиглэсэн зөвлөмж боловсруулна.\n\nЖишээ үйлчилгээний код: 006\nХэрэгжүүлэх чиглэл: Удирдлагын зөвлөх\nЗорилтот байгууллага: өсөлтийн шатандаа яваа ЖДҮ болон дунд хэмжээний компани.', 1, '2026-08-04 06:58:01.440281', '2026-08-04 06:58:01.440297', 19, 6, 'Боловсролын байгууллага G\nЭмнэлэг H\nЛожистикийн компани I', 2010000.00, 2023, 3, 1, 1),
(58, 'Sample Advisory 007 - Vertex Expansion', 'Компанийн зорилго, багийн чадавх, хэрэгжилтийг нэг цэгт уялдуулсан зөвлөмж.', 'Шийдвэр гаргагчдад зориулсан товч executive summary болон багийн түвшний нарийвчилсан хэрэгжүүлэлтийн төлөвлөгөө гаргана.\n\nЖишээ үйлчилгээний код: 007\nХэрэгжүүлэх чиглэл: Санхүүгийн зөвлөх\nЗорилтот байгууллага: өсөлтийн шатандаа яваа ЖДҮ болон дунд хэмжээний компани.', 1, '2026-08-04 06:58:01.523564', '2026-08-04 06:58:01.523587', 20, 6, 'Барилгын компани J\nТехнологийн компани K\nҮйлчилгээний компани L', 2095000.00, 2024, 4, 2, 1),
(59, 'Sample Advisory 008 - Agile Transformation', 'Бизнесийн өсөлтөд чиглэсэн практик зөвлөмж, хэрэгжүүлэх төлөвлөгөө.', 'Энэ үйлчилгээ нь нөхцөл байдлын үнэлгээ, эрсдэлийн зураглал, хэрэгжүүлэх roadmap, KPI хяналтын зөвлөмжийг багтаана.\n\nЖишээ үйлчилгээний код: 008\nХэрэгжүүлэх чиглэл: Маркетингийн зөвлөх\nЗорилтот байгууллага: өсөлтийн шатандаа яваа ЖДҮ болон дунд хэмжээний компани.', 1, '2026-08-04 06:58:01.641031', '2026-08-04 06:58:01.641050', 21, 6, 'Төрийн байгууллага A\nХувийн хэвшлийн компани B\nСтартап C', 2180000.00, 2025, 1, 3, 1),
(60, 'Sample Advisory 009 - Next Planning', 'Одоогийн процессийг шинжилж, сайжруулах алхамчилсан шийдэл.', 'Салбарын онцлогт тохируулсан оношилгоо хийж, багийн бүтэц, процесс, хэмжүүрийн түвшинд сайжруулалтын санал өгнө.\n\nЖишээ үйлчилгээний код: 009\nХэрэгжүүлэх чиглэл: Хүний нөөцийн зөвлөх\nЗорилтот байгууллага: өсөлтийн шатандаа яваа ЖДҮ болон дунд хэмжээний компани.', 1, '2026-08-04 06:58:01.793364', '2026-08-04 06:58:01.793386', 22, 6, 'Үйлдвэрлэл D\nХудалдааны сүлжээ E\nСанхүүгийн байгууллага F', 2265000.00, 2017, 2, 4, 1),
(61, 'Sample Advisory 010 - Growth Acceleration', 'Удирдлагын түвшний шийдвэр гаргалтад зориулсан бүтэцтэй зөвлөх үйлчилгээ.', 'Одоогийн гүйцэтгэл, байгууллагын нөөц, өсөлтийн саадыг задлан шинжилж, бодит хэрэгжилтэд чиглэсэн зөвлөмж боловсруулна.\n\nЖишээ үйлчилгээний код: 010\nХэрэгжүүлэх чиглэл: Үйл ажиллагааны зөвлөх\nЗорилтот байгууллага: өсөлтийн шатандаа яваа ЖДҮ болон дунд хэмжээний компани.', 1, '2026-08-04 06:58:01.875333', '2026-08-04 06:58:01.875353', 13, 6, 'Боловсролын байгууллага G\nЭмнэлэг H\nЛожистикийн компани I', 2350000.00, 2018, 3, 5, 1),
(62, 'Sample Advisory 011 - Vision Optimization', 'Компанийн зорилго, багийн чадавх, хэрэгжилтийг нэг цэгт уялдуулсан зөвлөмж.', 'Шийдвэр гаргагчдад зориулсан товч executive summary болон багийн түвшний нарийвчилсан хэрэгжүүлэлтийн төлөвлөгөө гаргана.\n\nЖишээ үйлчилгээний код: 011\nХэрэгжүүлэх чиглэл: Дижитал шилжилтийн зөвлөх\nЗорилтот байгууллага: өсөлтийн шатандаа яваа ЖДҮ болон дунд хэмжээний компани.', 1, '2026-08-04 06:58:01.987612', '2026-08-04 06:58:01.987632', 14, 6, 'Барилгын компани J\nТехнологийн компани K\nҮйлчилгээний компани L', 2435000.00, 2019, 4, 6, 1),
(63, 'Sample Advisory 012 - Impact Blueprint', 'Бизнесийн өсөлтөд чиглэсэн практик зөвлөмж, хэрэгжүүлэх төлөвлөгөө.', 'Энэ үйлчилгээ нь нөхцөл байдлын үнэлгээ, эрсдэлийн зураглал, хэрэгжүүлэх roadmap, KPI хяналтын зөвлөмжийг багтаана.\n\nЖишээ үйлчилгээний код: 012\nХэрэгжүүлэх чиглэл: Удирдлагын зөвлөх\nЗорилтот байгууллага: өсөлтийн шатандаа яваа ЖДҮ болон дунд хэмжээний компани.', 1, '2026-08-04 06:58:02.138686', '2026-08-04 06:58:02.138704', 15, 6, 'Төрийн байгууллага A\nХувийн хэвшлийн компани B\nСтартап C', 2520000.00, 2020, 1, 1, 1),
(64, 'Sample Advisory 013 - Prime Launch', 'Одоогийн процессийг шинжилж, сайжруулах алхамчилсан шийдэл.', 'Салбарын онцлогт тохируулсан оношилгоо хийж, багийн бүтэц, процесс, хэмжүүрийн түвшинд сайжруулалтын санал өгнө.\n\nЖишээ үйлчилгээний код: 013\nХэрэгжүүлэх чиглэл: Санхүүгийн зөвлөх\nЗорилтот байгууллага: өсөлтийн шатандаа яваа ЖДҮ болон дунд хэмжээний компани.', 0, '2026-08-04 06:58:02.227247', '2026-08-04 06:58:02.227267', 16, 6, 'Үйлдвэрлэл D\nХудалдааны сүлжээ E\nСанхүүгийн байгууллага F', 2605000.00, 2021, 2, 2, 1),
(65, 'Sample Advisory 014 - Scale Operations', 'Удирдлагын түвшний шийдвэр гаргалтад зориулсан бүтэцтэй зөвлөх үйлчилгээ.', 'Одоогийн гүйцэтгэл, байгууллагын нөөц, өсөлтийн саадыг задлан шинжилж, бодит хэрэгжилтэд чиглэсэн зөвлөмж боловсруулна.\n\nЖишээ үйлчилгээний код: 014\nХэрэгжүүлэх чиглэл: Маркетингийн зөвлөх\nЗорилтот байгууллага: өсөлтийн шатандаа яваа ЖДҮ болон дунд хэмжээний компани.', 0, '2026-08-04 06:58:02.335221', '2026-08-04 06:58:02.335234', 17, 6, 'Боловсролын байгууллага G\nЭмнэлэг H\nЛожистикийн компани I', 2690000.00, 2022, 3, 3, 1),
(66, 'Sample Advisory 015 - Smart Expansion', 'Компанийн зорилго, багийн чадавх, хэрэгжилтийг нэг цэгт уялдуулсан зөвлөмж.', 'Шийдвэр гаргагчдад зориулсан товч executive summary болон багийн түвшний нарийвчилсан хэрэгжүүлэлтийн төлөвлөгөө гаргана.\n\nЖишээ үйлчилгээний код: 015\nХэрэгжүүлэх чиглэл: Хүний нөөцийн зөвлөх\nЗорилтот байгууллага: өсөлтийн шатандаа яваа ЖДҮ болон дунд хэмжээний компани.', 0, '2026-08-04 06:58:02.485438', '2026-08-04 06:58:02.485477', 18, 6, 'Барилгын компани J\nТехнологийн компани K\nҮйлчилгээний компани L', 2775000.00, 2023, 4, 4, 1),
(67, 'Sample Advisory 016 - Core Transformation', 'Бизнесийн өсөлтөд чиглэсэн практик зөвлөмж, хэрэгжүүлэх төлөвлөгөө.', 'Энэ үйлчилгээ нь нөхцөл байдлын үнэлгээ, эрсдэлийн зураглал, хэрэгжүүлэх roadmap, KPI хяналтын зөвлөмжийг багтаана.\n\nЖишээ үйлчилгээний код: 016\nХэрэгжүүлэх чиглэл: Үйл ажиллагааны зөвлөх\nЗорилтот байгууллага: өсөлтийн шатандаа яваа ЖДҮ болон дунд хэмжээний компани.', 0, '2026-08-04 06:58:02.563996', '2026-08-04 06:58:02.564017', 19, 6, 'Төрийн байгууллага A\nХувийн хэвшлийн компани B\nСтартап C', 2860000.00, 2024, 1, 5, 1),
(68, 'Sample Advisory 017 - Vertex Planning', 'Одоогийн процессийг шинжилж, сайжруулах алхамчилсан шийдэл.', 'Салбарын онцлогт тохируулсан оношилгоо хийж, багийн бүтэц, процесс, хэмжүүрийн түвшинд сайжруулалтын санал өгнө.\n\nЖишээ үйлчилгээний код: 017\nХэрэгжүүлэх чиглэл: Дижитал шилжилтийн зөвлөх\nЗорилтот байгууллага: өсөлтийн шатандаа яваа ЖДҮ болон дунд хэмжээний компани.', 0, '2026-08-04 06:58:02.678420', '2026-08-04 06:58:02.678458', 20, 6, 'Үйлдвэрлэл D\nХудалдааны сүлжээ E\nСанхүүгийн байгууллага F', 2945000.00, 2025, 2, 6, 1),
(69, 'Sample Advisory 018 - Agile Acceleration', 'Удирдлагын түвшний шийдвэр гаргалтад зориулсан бүтэцтэй зөвлөх үйлчилгээ.', 'Одоогийн гүйцэтгэл, байгууллагын нөөц, өсөлтийн саадыг задлан шинжилж, бодит хэрэгжилтэд чиглэсэн зөвлөмж боловсруулна.\n\nЖишээ үйлчилгээний код: 018\nХэрэгжүүлэх чиглэл: Удирдлагын зөвлөх\nЗорилтот байгууллага: өсөлтийн шатандаа яваа ЖДҮ болон дунд хэмжээний компани.', 0, '2026-08-04 06:58:02.831342', '2026-08-04 06:58:02.831363', 21, 6, 'Боловсролын байгууллага G\nЭмнэлэг H\nЛожистикийн компани I', 3030000.00, 2017, 3, 1, 1),
(70, 'Sample Advisory 019 - Next Optimization', 'Компанийн зорилго, багийн чадавх, хэрэгжилтийг нэг цэгт уялдуулсан зөвлөмж.', 'Шийдвэр гаргагчдад зориулсан товч executive summary болон багийн түвшний нарийвчилсан хэрэгжүүлэлтийн төлөвлөгөө гаргана.\n\nЖишээ үйлчилгээний код: 019\nХэрэгжүүлэх чиглэл: Санхүүгийн зөвлөх\nЗорилтот байгууллага: өсөлтийн шатандаа яваа ЖДҮ болон дунд хэмжээний компани.', 0, '2026-08-04 06:58:02.912359', '2026-08-04 06:58:02.912377', 22, 6, 'Барилгын компани J\nТехнологийн компани K\nҮйлчилгээний компани L', 3115000.00, 2018, 4, 2, 1),
(71, 'Sample Advisory 020 - Growth Blueprint', 'Бизнесийн өсөлтөд чиглэсэн практик зөвлөмж, хэрэгжүүлэх төлөвлөгөө.', 'Энэ үйлчилгээ нь нөхцөл байдлын үнэлгээ, эрсдэлийн зураглал, хэрэгжүүлэх roadmap, KPI хяналтын зөвлөмжийг багтаана.\n\nЖишээ үйлчилгээний код: 020\nХэрэгжүүлэх чиглэл: Маркетингийн зөвлөх\nЗорилтот байгууллага: өсөлтийн шатандаа яваа ЖДҮ болон дунд хэмжээний компани.', 0, '2026-08-04 06:58:03.029866', '2026-08-04 06:58:03.029881', 13, 6, 'Төрийн байгууллага A\nХувийн хэвшлийн компани B\nСтартап C', 3200000.00, 2019, 1, 3, 1),
(72, 'Sample Advisory 021 - Vision Launch', 'Одоогийн процессийг шинжилж, сайжруулах алхамчилсан шийдэл.', 'Салбарын онцлогт тохируулсан оношилгоо хийж, багийн бүтэц, процесс, хэмжүүрийн түвшинд сайжруулалтын санал өгнө.\n\nЖишээ үйлчилгээний код: 021\nХэрэгжүүлэх чиглэл: Хүний нөөцийн зөвлөх\nЗорилтот байгууллага: өсөлтийн шатандаа яваа ЖДҮ болон дунд хэмжээний компани.', 0, '2026-08-04 06:58:03.178055', '2026-08-04 06:58:03.178074', 14, 6, 'Үйлдвэрлэл D\nХудалдааны сүлжээ E\nСанхүүгийн байгууллага F', 3285000.00, 2020, 2, 4, 1),
(73, 'Sample Advisory 022 - Impact Operations', 'Удирдлагын түвшний шийдвэр гаргалтад зориулсан бүтэцтэй зөвлөх үйлчилгээ.', 'Одоогийн гүйцэтгэл, байгууллагын нөөц, өсөлтийн саадыг задлан шинжилж, бодит хэрэгжилтэд чиглэсэн зөвлөмж боловсруулна.\n\nЖишээ үйлчилгээний код: 022\nХэрэгжүүлэх чиглэл: Үйл ажиллагааны зөвлөх\nЗорилтот байгууллага: өсөлтийн шатандаа яваа ЖДҮ болон дунд хэмжээний компани.', 0, '2026-08-04 06:58:03.260901', '2026-08-04 06:58:03.260921', 15, 6, 'Боловсролын байгууллага G\nЭмнэлэг H\nЛожистикийн компани I', 3370000.00, 2021, 3, 5, 1),
(74, 'Sample Advisory 023 - Prime Expansion', 'Компанийн зорилго, багийн чадавх, хэрэгжилтийг нэг цэгт уялдуулсан зөвлөмж.', 'Шийдвэр гаргагчдад зориулсан товч executive summary болон багийн түвшний нарийвчилсан хэрэгжүүлэлтийн төлөвлөгөө гаргана.\n\nЖишээ үйлчилгээний код: 023\nХэрэгжүүлэх чиглэл: Дижитал шилжилтийн зөвлөх\nЗорилтот байгууллага: өсөлтийн шатандаа яваа ЖДҮ болон дунд хэмжээний компани.', 0, '2026-08-04 06:58:03.378609', '2026-08-04 06:58:03.378628', 16, 6, 'Барилгын компани J\nТехнологийн компани K\nҮйлчилгээний компани L', 3455000.00, 2022, 4, 6, 1),
(75, 'Sample Advisory 024 - Scale Transformation', 'Бизнесийн өсөлтөд чиглэсэн практик зөвлөмж, хэрэгжүүлэх төлөвлөгөө.', 'Энэ үйлчилгээ нь нөхцөл байдлын үнэлгээ, эрсдэлийн зураглал, хэрэгжүүлэх roadmap, KPI хяналтын зөвлөмжийг багтаана.\n\nЖишээ үйлчилгээний код: 024\nХэрэгжүүлэх чиглэл: Удирдлагын зөвлөх\nЗорилтот байгууллага: өсөлтийн шатандаа яваа ЖДҮ болон дунд хэмжээний компани.', 0, '2026-08-04 06:58:03.525081', '2026-08-04 06:58:03.525098', 17, 6, 'Төрийн байгууллага A\nХувийн хэвшлийн компани B\nСтартап C', 3540000.00, 2023, 1, 1, 1),
(76, 'Sample Advisory 025 - Smart Planning', 'Одоогийн процессийг шинжилж, сайжруулах алхамчилсан шийдэл.', 'Салбарын онцлогт тохируулсан оношилгоо хийж, багийн бүтэц, процесс, хэмжүүрийн түвшинд сайжруулалтын санал өгнө.\n\nЖишээ үйлчилгээний код: 025\nХэрэгжүүлэх чиглэл: Санхүүгийн зөвлөх\nЗорилтот байгууллага: өсөлтийн шатандаа яваа ЖДҮ болон дунд хэмжээний компани.', 0, '2026-08-04 06:58:03.607510', '2026-08-04 06:58:03.607528', 18, 6, 'Үйлдвэрлэл D\nХудалдааны сүлжээ E\nСанхүүгийн байгууллага F', 3625000.00, 2024, 2, 2, 1),
(77, 'Sample Advisory 026 - Core Acceleration', 'Удирдлагын түвшний шийдвэр гаргалтад зориулсан бүтэцтэй зөвлөх үйлчилгээ.', 'Одоогийн гүйцэтгэл, байгууллагын нөөц, өсөлтийн саадыг задлан шинжилж, бодит хэрэгжилтэд чиглэсэн зөвлөмж боловсруулна.\n\nЖишээ үйлчилгээний код: 026\nХэрэгжүүлэх чиглэл: Маркетингийн зөвлөх\nЗорилтот байгууллага: өсөлтийн шатандаа яваа ЖДҮ болон дунд хэмжээний компани.', 0, '2026-08-04 06:58:03.720396', '2026-08-04 06:58:03.720415', 19, 6, 'Боловсролын байгууллага G\nЭмнэлэг H\nЛожистикийн компани I', 3710000.00, 2025, 3, 3, 1),
(78, 'Sample Advisory 027 - Vertex Optimization', 'Компанийн зорилго, багийн чадавх, хэрэгжилтийг нэг цэгт уялдуулсан зөвлөмж.', 'Шийдвэр гаргагчдад зориулсан товч executive summary болон багийн түвшний нарийвчилсан хэрэгжүүлэлтийн төлөвлөгөө гаргана.\n\nЖишээ үйлчилгээний код: 027\nХэрэгжүүлэх чиглэл: Хүний нөөцийн зөвлөх\nЗорилтот байгууллага: өсөлтийн шатандаа яваа ЖДҮ болон дунд хэмжээний компани.', 0, '2026-08-04 06:58:03.861232', '2026-08-04 06:58:03.861244', 20, 6, 'Барилгын компани J\nТехнологийн компани K\nҮйлчилгээний компани L', 3795000.00, 2017, 4, 4, 1),
(79, 'Sample Advisory 028 - Agile Blueprint', 'Бизнесийн өсөлтөд чиглэсэн практик зөвлөмж, хэрэгжүүлэх төлөвлөгөө.', 'Энэ үйлчилгээ нь нөхцөл байдлын үнэлгээ, эрсдэлийн зураглал, хэрэгжүүлэх roadmap, KPI хяналтын зөвлөмжийг багтаана.\n\nЖишээ үйлчилгээний код: 028\nХэрэгжүүлэх чиглэл: Үйл ажиллагааны зөвлөх\nЗорилтот байгууллага: өсөлтийн шатандаа яваа ЖДҮ болон дунд хэмжээний компани.', 0, '2026-08-04 06:58:03.942272', '2026-08-04 06:58:03.942289', 21, 6, 'Төрийн байгууллага A\nХувийн хэвшлийн компани B\nСтартап C', 3880000.00, 2018, 1, 5, 1),
(80, 'Sample Advisory 029 - Next Launch', 'Одоогийн процессийг шинжилж, сайжруулах алхамчилсан шийдэл.', 'Салбарын онцлогт тохируулсан оношилгоо хийж, багийн бүтэц, процесс, хэмжүүрийн түвшинд сайжруулалтын санал өгнө.\n\nЖишээ үйлчилгээний код: 029\nХэрэгжүүлэх чиглэл: Дижитал шилжилтийн зөвлөх\nЗорилтот байгууллага: өсөлтийн шатандаа яваа ЖДҮ болон дунд хэмжээний компани.', 0, '2026-08-04 06:58:04.056760', '2026-08-04 06:58:04.056776', 22, 6, 'Үйлдвэрлэл D\nХудалдааны сүлжээ E\nСанхүүгийн байгууллага F', 3965000.00, 2019, 2, 6, 1),
(81, 'Sample Advisory 030 - Growth Operations', 'Удирдлагын түвшний шийдвэр гаргалтад зориулсан бүтэцтэй зөвлөх үйлчилгээ.', 'Одоогийн гүйцэтгэл, байгууллагын нөөц, өсөлтийн саадыг задлан шинжилж, бодит хэрэгжилтэд чиглэсэн зөвлөмж боловсруулна.\n\nЖишээ үйлчилгээний код: 030\nХэрэгжүүлэх чиглэл: Удирдлагын зөвлөх\nЗорилтот байгууллага: өсөлтийн шатандаа яваа ЖДҮ болон дунд хэмжээний компани.', 0, '2026-08-04 06:58:04.207466', '2026-08-04 06:58:04.207486', 13, 6, 'Боловсролын байгууллага G\nЭмнэлэг H\nЛожистикийн компани I', 4050000.00, 2020, 3, 1, 1),
(82, 'Sample Advisory 031 - Vision Expansion', 'Компанийн зорилго, багийн чадавх, хэрэгжилтийг нэг цэгт уялдуулсан зөвлөмж.', 'Шийдвэр гаргагчдад зориулсан товч executive summary болон багийн түвшний нарийвчилсан хэрэгжүүлэлтийн төлөвлөгөө гаргана.\n\nЖишээ үйлчилгээний код: 031\nХэрэгжүүлэх чиглэл: Санхүүгийн зөвлөх\nЗорилтот байгууллага: өсөлтийн шатандаа яваа ЖДҮ болон дунд хэмжээний компани.', 0, '2026-08-04 06:58:04.291870', '2026-08-04 06:58:04.291889', 14, 6, 'Барилгын компани J\nТехнологийн компани K\nҮйлчилгээний компани L', 4135000.00, 2021, 4, 2, 1),
(83, 'Sample Advisory 032 - Impact Transformation', 'Бизнесийн өсөлтөд чиглэсэн практик зөвлөмж, хэрэгжүүлэх төлөвлөгөө.', 'Энэ үйлчилгээ нь нөхцөл байдлын үнэлгээ, эрсдэлийн зураглал, хэрэгжүүлэх roadmap, KPI хяналтын зөвлөмжийг багтаана.\n\nЖишээ үйлчилгээний код: 032\nХэрэгжүүлэх чиглэл: Маркетингийн зөвлөх\nЗорилтот байгууллага: өсөлтийн шатандаа яваа ЖДҮ болон дунд хэмжээний компани.', 0, '2026-08-04 06:58:04.407924', '2026-08-04 06:58:04.407948', 15, 6, 'Төрийн байгууллага A\nХувийн хэвшлийн компани B\nСтартап C', 4220000.00, 2022, 1, 3, 1),
(84, 'Sample Advisory 033 - Prime Planning', 'Одоогийн процессийг шинжилж, сайжруулах алхамчилсан шийдэл.', 'Салбарын онцлогт тохируулсан оношилгоо хийж, багийн бүтэц, процесс, хэмжүүрийн түвшинд сайжруулалтын санал өгнө.\n\nЖишээ үйлчилгээний код: 033\nХэрэгжүүлэх чиглэл: Хүний нөөцийн зөвлөх\nЗорилтот байгууллага: өсөлтийн шатандаа яваа ЖДҮ болон дунд хэмжээний компани.', 0, '2026-08-04 06:58:04.557541', '2026-08-04 06:58:04.557557', 16, 6, 'Үйлдвэрлэл D\nХудалдааны сүлжээ E\nСанхүүгийн байгууллага F', 4305000.00, 2023, 2, 4, 1),
(85, 'Sample Advisory 034 - Scale Acceleration', 'Удирдлагын түвшний шийдвэр гаргалтад зориулсан бүтэцтэй зөвлөх үйлчилгээ.', 'Одоогийн гүйцэтгэл, байгууллагын нөөц, өсөлтийн саадыг задлан шинжилж, бодит хэрэгжилтэд чиглэсэн зөвлөмж боловсруулна.\n\nЖишээ үйлчилгээний код: 034\nХэрэгжүүлэх чиглэл: Үйл ажиллагааны зөвлөх\nЗорилтот байгууллага: өсөлтийн шатандаа яваа ЖДҮ болон дунд хэмжээний компани.', 0, '2026-08-04 06:58:04.636099', '2026-08-04 06:58:04.636113', 17, 6, 'Боловсролын байгууллага G\nЭмнэлэг H\nЛожистикийн компани I', 4390000.00, 2024, 3, 5, 1),
(86, 'Sample Advisory 035 - Smart Optimization', 'Компанийн зорилго, багийн чадавх, хэрэгжилтийг нэг цэгт уялдуулсан зөвлөмж.', 'Шийдвэр гаргагчдад зориулсан товч executive summary болон багийн түвшний нарийвчилсан хэрэгжүүлэлтийн төлөвлөгөө гаргана.\n\nЖишээ үйлчилгээний код: 035\nХэрэгжүүлэх чиглэл: Дижитал шилжилтийн зөвлөх\nЗорилтот байгууллага: өсөлтийн шатандаа яваа ЖДҮ болон дунд хэмжээний компани.', 0, '2026-08-04 06:58:04.751136', '2026-08-04 06:58:04.751156', 18, 6, 'Барилгын компани J\nТехнологийн компани K\nҮйлчилгээний компани L', 4475000.00, 2025, 4, 6, 1),
(87, 'Sample Advisory 036 - Core Blueprint', 'Бизнесийн өсөлтөд чиглэсэн практик зөвлөмж, хэрэгжүүлэх төлөвлөгөө.', 'Энэ үйлчилгээ нь нөхцөл байдлын үнэлгээ, эрсдэлийн зураглал, хэрэгжүүлэх roadmap, KPI хяналтын зөвлөмжийг багтаана.\n\nЖишээ үйлчилгээний код: 036\nХэрэгжүүлэх чиглэл: Удирдлагын зөвлөх\nЗорилтот байгууллага: өсөлтийн шатандаа яваа ЖДҮ болон дунд хэмжээний компани.', 0, '2026-08-04 06:58:04.898519', '2026-08-04 06:58:04.898531', 19, 6, 'Төрийн байгууллага A\nХувийн хэвшлийн компани B\nСтартап C', 4560000.00, 2017, 1, 1, 1),
(88, 'Sample Advisory 037 - Vertex Launch', 'Одоогийн процессийг шинжилж, сайжруулах алхамчилсан шийдэл.', 'Салбарын онцлогт тохируулсан оношилгоо хийж, багийн бүтэц, процесс, хэмжүүрийн түвшинд сайжруулалтын санал өгнө.\n\nЖишээ үйлчилгээний код: 037\nХэрэгжүүлэх чиглэл: Санхүүгийн зөвлөх\nЗорилтот байгууллага: өсөлтийн шатандаа яваа ЖДҮ болон дунд хэмжээний компани.', 0, '2026-08-04 06:58:04.978635', '2026-08-04 06:58:04.978655', 20, 6, 'Үйлдвэрлэл D\nХудалдааны сүлжээ E\nСанхүүгийн байгууллага F', 4645000.00, 2018, 2, 2, 1),
(89, 'Sample Advisory 038 - Agile Operations', 'Удирдлагын түвшний шийдвэр гаргалтад зориулсан бүтэцтэй зөвлөх үйлчилгээ.', 'Одоогийн гүйцэтгэл, байгууллагын нөөц, өсөлтийн саадыг задлан шинжилж, бодит хэрэгжилтэд чиглэсэн зөвлөмж боловсруулна.\n\nЖишээ үйлчилгээний код: 038\nХэрэгжүүлэх чиглэл: Маркетингийн зөвлөх\nЗорилтот байгууллага: өсөлтийн шатандаа яваа ЖДҮ болон дунд хэмжээний компани.', 0, '2026-08-04 06:58:05.093406', '2026-08-04 06:58:05.093420', 21, 6, 'Боловсролын байгууллага G\nЭмнэлэг H\nЛожистикийн компани I', 4730000.00, 2019, 3, 3, 1),
(90, 'Sample Advisory 039 - Next Expansion', 'Компанийн зорилго, багийн чадавх, хэрэгжилтийг нэг цэгт уялдуулсан зөвлөмж.', 'Шийдвэр гаргагчдад зориулсан товч executive summary болон багийн түвшний нарийвчилсан хэрэгжүүлэлтийн төлөвлөгөө гаргана.\n\nЖишээ үйлчилгээний код: 039\nХэрэгжүүлэх чиглэл: Хүний нөөцийн зөвлөх\nЗорилтот байгууллага: өсөлтийн шатандаа яваа ЖДҮ болон дунд хэмжээний компани.', 0, '2026-08-04 06:58:05.253007', '2026-08-04 06:58:05.253026', 22, 6, 'Барилгын компани J\nТехнологийн компани K\nҮйлчилгээний компани L', 4815000.00, 2020, 4, 4, 1),
(91, 'Sample Advisory 040 - Growth Transformation', 'Бизнесийн өсөлтөд чиглэсэн практик зөвлөмж, хэрэгжүүлэх төлөвлөгөө.', 'Энэ үйлчилгээ нь нөхцөл байдлын үнэлгээ, эрсдэлийн зураглал, хэрэгжүүлэх roadmap, KPI хяналтын зөвлөмжийг багтаана.\n\nЖишээ үйлчилгээний код: 040\nХэрэгжүүлэх чиглэл: Үйл ажиллагааны зөвлөх\nЗорилтот байгууллага: өсөлтийн шатандаа яваа ЖДҮ болон дунд хэмжээний компани.', 0, '2026-08-04 06:58:05.333938', '2026-08-04 06:58:05.333951', 13, 6, 'Төрийн байгууллага A\nХувийн хэвшлийн компани B\nСтартап C', 4900000.00, 2021, 1, 5, 1),
(92, 'Sample Advisory 041 - Vision Planning', 'Одоогийн процессийг шинжилж, сайжруулах алхамчилсан шийдэл.', 'Салбарын онцлогт тохируулсан оношилгоо хийж, багийн бүтэц, процесс, хэмжүүрийн түвшинд сайжруулалтын санал өгнө.\n\nЖишээ үйлчилгээний код: 041\nХэрэгжүүлэх чиглэл: Дижитал шилжилтийн зөвлөх\nЗорилтот байгууллага: өсөлтийн шатандаа яваа ЖДҮ болон дунд хэмжээний компани.', 0, '2026-08-04 06:58:05.454090', '2026-08-04 06:58:05.454107', 14, 6, 'Үйлдвэрлэл D\nХудалдааны сүлжээ E\nСанхүүгийн байгууллага F', 4985000.00, 2022, 2, 6, 1),
(93, 'Sample Advisory 042 - Impact Acceleration', 'Удирдлагын түвшний шийдвэр гаргалтад зориулсан бүтэцтэй зөвлөх үйлчилгээ.', 'Одоогийн гүйцэтгэл, байгууллагын нөөц, өсөлтийн саадыг задлан шинжилж, бодит хэрэгжилтэд чиглэсэн зөвлөмж боловсруулна.\n\nЖишээ үйлчилгээний код: 042\nХэрэгжүүлэх чиглэл: Удирдлагын зөвлөх\nЗорилтот байгууллага: өсөлтийн шатандаа яваа ЖДҮ болон дунд хэмжээний компани.', 0, '2026-08-04 06:58:05.607869', '2026-08-04 06:58:05.607890', 15, 6, 'Боловсролын байгууллага G\nЭмнэлэг H\nЛожистикийн компани I', 5070000.00, 2023, 3, 1, 1),
(94, 'Sample Advisory 043 - Prime Optimization', 'Компанийн зорилго, багийн чадавх, хэрэгжилтийг нэг цэгт уялдуулсан зөвлөмж.', 'Шийдвэр гаргагчдад зориулсан товч executive summary болон багийн түвшний нарийвчилсан хэрэгжүүлэлтийн төлөвлөгөө гаргана.\n\nЖишээ үйлчилгээний код: 043\nХэрэгжүүлэх чиглэл: Санхүүгийн зөвлөх\nЗорилтот байгууллага: өсөлтийн шатандаа яваа ЖДҮ болон дунд хэмжээний компани.', 0, '2026-08-04 06:58:05.695132', '2026-08-04 06:58:05.695154', 16, 6, 'Барилгын компани J\nТехнологийн компани K\nҮйлчилгээний компани L', 5155000.00, 2024, 4, 2, 1),
(95, 'Sample Advisory 044 - Scale Blueprint', 'Бизнесийн өсөлтөд чиглэсэн практик зөвлөмж, хэрэгжүүлэх төлөвлөгөө.', '<ul><li>Энэ үйлчилгээ нь нөхцөл байдлын үнэлгээ, эрсдэлийн зураглал, хэрэгжүүлэх roadmap, KPI хяналтын зөвлөмжийг багтаана.</li><li>Жишээ үйлчилгээний код: 044</li><li>Хэрэгжүүлэх чиглэл: Маркетингийн зөвлөх</li><li>Зорилтот байгууллага: өсөлтийн шатандаа яваа ЖДҮ болон дунд хэмжээний компани.</li></ul>', 0, '2026-08-04 06:58:05.812825', '2026-08-06 08:02:38.262757', 17, 6, '<ul><li>Төрийн байгууллага A</li><li>Хувийн хэвшлийн компани B</li><li>Стартап C</li></ul>', 5240000.00, 2025, 1, 3, 1),
(96, 'Sample Advisory 045 - Smart Launch', 'Одоогийн процессийг шинжилж, сайжруулах алхамчилсан шийдэл.', '<ul><li>Салбарын онцлогт тохируулсан оношилгоо хийж, багийн бүтэц, процесс, хэмжүүрийн түвшинд сайжруулалтын санал өгнө.</li><li>Жишээ үйлчилгээний код: 045</li><li>Хэрэгжүүлэх чиглэл: Хүний нөөцийн зөвлөх</li><li>Зорилтот байгууллага: өсөлтийн шатандаа яваа ЖДҮ болон дунд хэмжээний компани.</li></ul>', 0, '2026-08-04 06:58:05.962481', '2026-08-06 08:03:30.505596', 18, 6, '<ul><li>Үйлдвэрлэл D</li><li>Худалдааны сүлжээ E</li><li>Санхүүгийн байгууллага F</li></ul>', 5325000.00, 2017, 2, 4, 1),
(97, 'Sample Advisory 046 - Core Operations', 'Удирдлагын түвшний шийдвэр гаргалтад зориулсан бүтэцтэй зөвлөх үйлчилгээ.', 'Одоогийн гүйцэтгэл, байгууллагын нөөц, өсөлтийн саадыг задлан шинжилж, бодит хэрэгжилтэд чиглэсэн зөвлөмж боловсруулна.\n\nЖишээ үйлчилгээний код: 046\nХэрэгжүүлэх чиглэл: Үйл ажиллагааны зөвлөх\nЗорилтот байгууллага: өсөлтийн шатандаа яваа ЖДҮ болон дунд хэмжээний компани.', 0, '2026-08-04 06:58:06.045684', '2026-08-04 06:58:06.045702', 19, 6, 'Боловсролын байгууллага G\nЭмнэлэг H\nЛожистикийн компани I', 5410000.00, 2018, 3, 5, 1),
(98, 'Sample Advisory 047 - Vertex Expansion', 'Компанийн зорилго, багийн чадавх, хэрэгжилтийг нэг цэгт уялдуулсан зөвлөмж.', 'Шийдвэр гаргагчдад зориулсан товч executive summary болон багийн түвшний нарийвчилсан хэрэгжүүлэлтийн төлөвлөгөө гаргана.\n\nЖишээ үйлчилгээний код: 047\nХэрэгжүүлэх чиглэл: Дижитал шилжилтийн зөвлөх\nЗорилтот байгууллага: өсөлтийн шатандаа яваа ЖДҮ болон дунд хэмжээний компани.', 0, '2026-08-04 06:58:06.161365', '2026-08-04 06:58:06.161384', 20, 6, 'Барилгын компани J\nТехнологийн компани K\nҮйлчилгээний компани L', 5495000.00, 2019, 4, 6, 1),
(99, 'Sample Advisory 048 - Agile Transformation', 'Бизнесийн өсөлтөд чиглэсэн практик зөвлөмж, хэрэгжүүлэх төлөвлөгөө.', 'Энэ үйлчилгээ нь нөхцөл байдлын үнэлгээ, эрсдэлийн зураглал, хэрэгжүүлэх roadmap, KPI хяналтын зөвлөмжийг багтаана.\n\nЖишээ үйлчилгээний код: 048\nХэрэгжүүлэх чиглэл: Удирдлагын зөвлөх\nЗорилтот байгууллага: өсөлтийн шатандаа яваа ЖДҮ болон дунд хэмжээний компани.', 0, '2026-08-04 06:58:06.312639', '2026-08-04 06:58:06.312656', 21, 6, 'Төрийн байгууллага A\nХувийн хэвшлийн компани B\nСтартап C', 5580000.00, 2020, 1, 1, 1),
(100, 'Sample Advisory 049 - Next Planning', 'Одоогийн процессийг шинжилж, сайжруулах алхамчилсан шийдэл.', 'Салбарын онцлогт тохируулсан оношилгоо хийж, багийн бүтэц, процесс, хэмжүүрийн түвшинд сайжруулалтын санал өгнө.\n\nЖишээ үйлчилгээний код: 049\nХэрэгжүүлэх чиглэл: Санхүүгийн зөвлөх\nЗорилтот байгууллага: өсөлтийн шатандаа яваа ЖДҮ болон дунд хэмжээний компани.', 0, '2026-08-04 06:58:06.391529', '2026-08-04 06:58:06.391546', 22, 6, 'Үйлдвэрлэл D\nХудалдааны сүлжээ E\nСанхүүгийн байгууллага F', 5665000.00, 2021, 2, 2, 1),
(101, 'Sample Advisory 050 - Growth Acceleration', 'Удирдлагын түвшний шийдвэр гаргалтад зориулсан бүтэцтэй зөвлөх үйлчилгээ.', '<ul><li>Одоогийн гүйцэтгэл, байгууллагын нөөц, өсөлтийн саадыг задлан шинжилж, бодит хэрэгжилтэд чиглэсэн зөвлөмж боловсруулна.</li><li>Жишээ үйлчилгээний код: 050</li><li>Хэрэгжүүлэх чиглэл: Маркетингийн зөвлөх</li><li>Зорилтот байгууллага: өсөлтийн шатандаа яваа ЖДҮ болон дунд хэмжээний компани.</li></ul>', 0, '2026-08-04 06:58:06.521215', '2026-08-06 08:00:51.167917', 13, 6, '<ul><li>Боловсролын байгууллага G</li><li>Эмнэлэг H</li><li>Ложистикийн компани I</li></ul>', 5750000.00, 2022, 3, 3, 1),
(102, 'Санхүүгийн зөвлөх үйлчилгээ', '<span style=\"color: rgb(85, 85, 85); font-family: &quot;Open Sans&quot;, sans-serif; font-size: 15px; text-align: center;\">Энэ үйлчилгээг Харилцагч компанийн менежментийн багт зориулан үзүүлдэг. Бүтээгдэхүүний өртөг тооцох, үнэ тогтоох, ашигт ажиллагааны шинжилгээ сайжруулалтын зөвлөх үйлчилгээ юм. Үүний зэрэгцээ менежментийн багийн хэрэгцээ шаардлагад үндэслэн НББ сайжруулах, татварын бүртгэлийг хянах чиглэлээр зөвлөгөө өгөх боломжтой.</span>', '<span style=\"color: rgb(85, 85, 85); font-family: &quot;Open Sans&quot;, sans-serif; font-size: 15px; text-align: center;\">Энэ үйлчилгээг Харилцагч компанийн менежментийн багт зориулан үзүүлдэг. Бүтээгдэхүүний өртөг тооцох, үнэ тогтоох, ашигт ажиллагааны шинжилгээ сайжруулалтын зөвлөх үйлчилгээ юм. Үүний зэрэгцээ менежментийн багийн хэрэгцээ шаардлагад үндэслэн НББ сайжруулах, татварын бүртгэлийг хянах чиглэлээр зөвлөгөө өгөх боломжтой.</span>', 0, '2026-08-05 07:57:42.879043', '2026-08-06 07:54:25.170688', 36, 40, 'быөйөй', 6511.00, 2026, 2, 2, 1);

-- --------------------------------------------------------

--
-- Table structure for table `website_advisoryserviceimage`
--

CREATE TABLE `website_advisoryserviceimage` (
  `id` bigint NOT NULL,
  `image` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `sort_order` int UNSIGNED NOT NULL,
  `created_date` datetime(6) NOT NULL,
  `advisory_service_id` bigint NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `website_advisoryserviceimage`
--

INSERT INTO `website_advisoryserviceimage` (`id`, `image`, `sort_order`, `created_date`, `advisory_service_id`) VALUES
(157, 'advisory_service_images/sample_advisory_002_1_6wAY1mp.png', 0, '2026-08-04 06:58:00.992874', 53),
(158, 'advisory_service_images/sample_advisory_002_2_arPnBWl.png', 1, '2026-08-04 06:58:01.025890', 53),
(159, 'advisory_service_images/sample_advisory_002_3_wegXvzz.png', 2, '2026-08-04 06:58:01.059400', 53),
(160, 'advisory_service_images/sample_advisory_002_4_ifqx01W.png', 3, '2026-08-04 06:58:01.092112', 53),
(161, 'advisory_service_images/sample_advisory_003_1_Io6qXwq.png', 0, '2026-08-04 06:58:01.136422', 54),
(162, 'advisory_service_images/sample_advisory_003_2_fkitjcd.png', 1, '2026-08-04 06:58:01.170058', 54),
(163, 'advisory_service_images/sample_advisory_004_1_LWxfyoq.png', 0, '2026-08-04 06:58:01.218954', 55),
(164, 'advisory_service_images/sample_advisory_004_2_pQMC70u.png', 1, '2026-08-04 06:58:01.253214', 55),
(165, 'advisory_service_images/sample_advisory_004_3_h1dhTFh.png', 2, '2026-08-04 06:58:01.287359', 55),
(166, 'advisory_service_images/sample_advisory_005_1_LFtX9qC.png', 0, '2026-08-04 06:58:01.333739', 56),
(167, 'advisory_service_images/sample_advisory_005_2_7SifbEM.png', 1, '2026-08-04 06:58:01.367520', 56),
(168, 'advisory_service_images/sample_advisory_005_3_t3u9Qk3.png', 2, '2026-08-04 06:58:01.401652', 56),
(169, 'advisory_service_images/sample_advisory_005_4_cHEInLI.png', 3, '2026-08-04 06:58:01.434678', 56),
(170, 'advisory_service_images/sample_advisory_006_1_Glo3odM.png', 0, '2026-08-04 06:58:01.482649', 57),
(171, 'advisory_service_images/sample_advisory_006_2_4p70KaN.png', 1, '2026-08-04 06:58:01.517485', 57),
(172, 'advisory_service_images/sample_advisory_007_1_d7xX3YB.png', 0, '2026-08-04 06:58:01.565987', 58),
(173, 'advisory_service_images/sample_advisory_007_2_rhRKhnH.png', 1, '2026-08-04 06:58:01.602191', 58),
(174, 'advisory_service_images/sample_advisory_007_3_6d2kloE.png', 2, '2026-08-04 06:58:01.636270', 58),
(175, 'advisory_service_images/sample_advisory_008_1_lIqdFBT.png', 0, '2026-08-04 06:58:01.682454', 59),
(176, 'advisory_service_images/sample_advisory_008_2_vZXGplu.png', 1, '2026-08-04 06:58:01.717161', 59),
(177, 'advisory_service_images/sample_advisory_008_3_0nQH2t8.png', 2, '2026-08-04 06:58:01.752941', 59),
(178, 'advisory_service_images/sample_advisory_008_4_lpYLo03.png', 3, '2026-08-04 06:58:01.788081', 59),
(179, 'advisory_service_images/sample_advisory_009_1_vuHV7Oc.png', 0, '2026-08-04 06:58:01.835254', 60),
(180, 'advisory_service_images/sample_advisory_009_2_p3JT819.png', 1, '2026-08-04 06:58:01.870039', 60),
(181, 'advisory_service_images/sample_advisory_010_1_z3lmZxO.png', 0, '2026-08-04 06:58:01.915955', 61),
(182, 'advisory_service_images/sample_advisory_010_2_6g4XhOX.png', 1, '2026-08-04 06:58:01.948975', 61),
(183, 'advisory_service_images/sample_advisory_010_3_P5Lp7FJ.png', 2, '2026-08-04 06:58:01.983015', 61),
(184, 'advisory_service_images/sample_advisory_011_1_vylhRVR.png', 0, '2026-08-04 06:58:02.028064', 62),
(185, 'advisory_service_images/sample_advisory_011_2_oVkHFXK.png', 1, '2026-08-04 06:58:02.062280', 62),
(186, 'advisory_service_images/sample_advisory_011_3_FqrJFLi.png', 2, '2026-08-04 06:58:02.097215', 62),
(187, 'advisory_service_images/sample_advisory_011_4_VyAHvci.png', 3, '2026-08-04 06:58:02.133596', 62),
(188, 'advisory_service_images/sample_advisory_012_1_2vPIzUI.png', 0, '2026-08-04 06:58:02.183133', 63),
(189, 'advisory_service_images/sample_advisory_012_2_hmU71qA.png', 1, '2026-08-04 06:58:02.222459', 63),
(190, 'advisory_service_images/sample_advisory_013_1_dZ7m1oB.png', 0, '2026-08-04 06:58:02.264718', 64),
(191, 'advisory_service_images/sample_advisory_013_2_KID7MQy.png', 1, '2026-08-04 06:58:02.298220', 64),
(192, 'advisory_service_images/sample_advisory_013_3_HPgPWE6.png', 2, '2026-08-04 06:58:02.330775', 64),
(193, 'advisory_service_images/sample_advisory_014_1_HQrDgS0.png', 0, '2026-08-04 06:58:02.376371', 65),
(194, 'advisory_service_images/sample_advisory_014_2_KTmHYOp.png', 1, '2026-08-04 06:58:02.408938', 65),
(195, 'advisory_service_images/sample_advisory_014_3_VymZIIo.png', 2, '2026-08-04 06:58:02.447734', 65),
(196, 'advisory_service_images/sample_advisory_014_4_4t3ZX7o.png', 3, '2026-08-04 06:58:02.480933', 65),
(197, 'advisory_service_images/sample_advisory_015_1_WXevUwy.png', 0, '2026-08-04 06:58:02.524930', 66),
(198, 'advisory_service_images/sample_advisory_015_2_FdN0rAP.png', 1, '2026-08-04 06:58:02.559546', 66),
(199, 'advisory_service_images/sample_advisory_016_1_3AN1nEe.png', 0, '2026-08-04 06:58:02.604740', 67),
(200, 'advisory_service_images/sample_advisory_016_2_USs0aFF.png', 1, '2026-08-04 06:58:02.638411', 67),
(201, 'advisory_service_images/sample_advisory_016_3_PYfTOuC.png', 2, '2026-08-04 06:58:02.673014', 67),
(202, 'advisory_service_images/sample_advisory_017_1_mqcqblB.png', 0, '2026-08-04 06:58:02.722696', 68),
(203, 'advisory_service_images/sample_advisory_017_2_cDlBcBR.png', 1, '2026-08-04 06:58:02.757004', 68),
(204, 'advisory_service_images/sample_advisory_017_3_KqWsNBY.png', 2, '2026-08-04 06:58:02.791506', 68),
(205, 'advisory_service_images/sample_advisory_017_4_uK3Z0vX.png', 3, '2026-08-04 06:58:02.826264', 68),
(206, 'advisory_service_images/sample_advisory_018_1_r44mn1R.png', 0, '2026-08-04 06:58:02.873047', 69),
(207, 'advisory_service_images/sample_advisory_018_2_Tchb3eu.png', 1, '2026-08-04 06:58:02.907499', 69),
(208, 'advisory_service_images/sample_advisory_019_1_aC0zOpt.png', 0, '2026-08-04 06:58:02.954735', 70),
(209, 'advisory_service_images/sample_advisory_019_2_Owa4m2c.png', 1, '2026-08-04 06:58:02.988758', 70),
(210, 'advisory_service_images/sample_advisory_019_3_uhTz1we.png', 2, '2026-08-04 06:58:03.023409', 70),
(211, 'advisory_service_images/sample_advisory_020_1_8grvOWo.png', 0, '2026-08-04 06:58:03.070248', 71),
(212, 'advisory_service_images/sample_advisory_020_2_YzFphTs.png', 1, '2026-08-04 06:58:03.103391', 71),
(213, 'advisory_service_images/sample_advisory_020_3_U17hKQj.png', 2, '2026-08-04 06:58:03.137822', 71),
(214, 'advisory_service_images/sample_advisory_020_4_gXe6fXZ.png', 3, '2026-08-04 06:58:03.172653', 71),
(215, 'advisory_service_images/sample_advisory_021_1_HocY7sg.png', 0, '2026-08-04 06:58:03.220992', 72),
(216, 'advisory_service_images/sample_advisory_021_2_nxz2rTW.png', 1, '2026-08-04 06:58:03.255100', 72),
(217, 'advisory_service_images/sample_advisory_022_1_Gk25A5d.png', 0, '2026-08-04 06:58:03.302923', 73),
(218, 'advisory_service_images/sample_advisory_022_2_OVQWF2f.png', 1, '2026-08-04 06:58:03.336397', 73),
(219, 'advisory_service_images/sample_advisory_022_3_pAWlNIB.png', 2, '2026-08-04 06:58:03.370767', 73),
(220, 'advisory_service_images/sample_advisory_023_1_Q2npOAA.png', 0, '2026-08-04 06:58:03.417765', 74),
(221, 'advisory_service_images/sample_advisory_023_2_s7lLUlS.png', 1, '2026-08-04 06:58:03.452194', 74),
(222, 'advisory_service_images/sample_advisory_023_3_ecVvKq4.png', 2, '2026-08-04 06:58:03.485713', 74),
(223, 'advisory_service_images/sample_advisory_023_4_FW6QCdd.png', 3, '2026-08-04 06:58:03.519905', 74),
(224, 'advisory_service_images/sample_advisory_024_1_mRm2UIf.png', 0, '2026-08-04 06:58:03.565588', 75),
(225, 'advisory_service_images/sample_advisory_024_2_opYr7Oo.png', 1, '2026-08-04 06:58:03.599345', 75),
(226, 'advisory_service_images/sample_advisory_025_1_EwS0AIM.png', 0, '2026-08-04 06:58:03.646141', 76),
(227, 'advisory_service_images/sample_advisory_025_2_se2p1W6.png', 1, '2026-08-04 06:58:03.679773', 76),
(228, 'advisory_service_images/sample_advisory_025_3_Bg2Q31J.png', 2, '2026-08-04 06:58:03.713542', 76),
(229, 'advisory_service_images/sample_advisory_026_1_7ZcVdgF.png', 0, '2026-08-04 06:58:03.758010', 77),
(230, 'advisory_service_images/sample_advisory_026_2_JXDLLOm.png', 1, '2026-08-04 06:58:03.790481', 77),
(231, 'advisory_service_images/sample_advisory_026_3_EHkMXeQ.png', 2, '2026-08-04 06:58:03.822938', 77),
(232, 'advisory_service_images/sample_advisory_026_4_fN2l2Sy.png', 3, '2026-08-04 06:58:03.856571', 77),
(233, 'advisory_service_images/sample_advisory_027_1_rLL51ol.png', 0, '2026-08-04 06:58:03.903146', 78),
(234, 'advisory_service_images/sample_advisory_027_2_0zez59v.png', 1, '2026-08-04 06:58:03.936761', 78),
(235, 'advisory_service_images/sample_advisory_028_1_D5KfYPf.png', 0, '2026-08-04 06:58:03.981848', 79),
(236, 'advisory_service_images/sample_advisory_028_2_YzVy7B8.png', 1, '2026-08-04 06:58:04.015747', 79),
(237, 'advisory_service_images/sample_advisory_028_3_K0UR5nL.png', 2, '2026-08-04 06:58:04.050539', 79),
(238, 'advisory_service_images/sample_advisory_029_1_wOHNM8z.png', 0, '2026-08-04 06:58:04.096769', 80),
(239, 'advisory_service_images/sample_advisory_029_2_rIOsoOY.png', 1, '2026-08-04 06:58:04.131000', 80),
(240, 'advisory_service_images/sample_advisory_029_3_QtPCVty.png', 2, '2026-08-04 06:58:04.165675', 80),
(241, 'advisory_service_images/sample_advisory_029_4_Gm9GAr5.png', 3, '2026-08-04 06:58:04.199885', 80),
(242, 'advisory_service_images/sample_advisory_030_1_PuVA7vW.png', 0, '2026-08-04 06:58:04.250962', 81),
(243, 'advisory_service_images/sample_advisory_030_2_Oqgzi81.png', 1, '2026-08-04 06:58:04.286261', 81),
(244, 'advisory_service_images/sample_advisory_031_1_ReHHS57.png', 0, '2026-08-04 06:58:04.331136', 82),
(245, 'advisory_service_images/sample_advisory_031_2_R1B6Xx8.png', 1, '2026-08-04 06:58:04.365037', 82),
(246, 'advisory_service_images/sample_advisory_031_3_meICJhN.png', 2, '2026-08-04 06:58:04.399781', 82),
(247, 'advisory_service_images/sample_advisory_032_1_bBUkvBU.png', 0, '2026-08-04 06:58:04.447563', 83),
(248, 'advisory_service_images/sample_advisory_032_2_DXuBStj.png', 1, '2026-08-04 06:58:04.483883', 83),
(249, 'advisory_service_images/sample_advisory_032_3_G18LHVf.png', 2, '2026-08-04 06:58:04.517563', 83),
(250, 'advisory_service_images/sample_advisory_032_4_a3KOFgs.png', 3, '2026-08-04 06:58:04.550991', 83),
(251, 'advisory_service_images/sample_advisory_033_1_VuFSp4i.png', 0, '2026-08-04 06:58:04.596737', 84),
(252, 'advisory_service_images/sample_advisory_033_2_TEl5KHM.png', 1, '2026-08-04 06:58:04.630991', 84),
(253, 'advisory_service_images/sample_advisory_034_1_PHrMdo7.png', 0, '2026-08-04 06:58:04.675383', 85),
(254, 'advisory_service_images/sample_advisory_034_2_1Y7b68U.png', 1, '2026-08-04 06:58:04.709730', 85),
(255, 'advisory_service_images/sample_advisory_034_3_9z1tUt8.png', 2, '2026-08-04 06:58:04.743860', 85),
(256, 'advisory_service_images/sample_advisory_035_1_RLMVFWV.png', 0, '2026-08-04 06:58:04.793984', 86),
(257, 'advisory_service_images/sample_advisory_035_2_8WMRRPr.png', 1, '2026-08-04 06:58:04.827723', 86),
(258, 'advisory_service_images/sample_advisory_035_3_UsaHa7F.png', 2, '2026-08-04 06:58:04.861133', 86),
(259, 'advisory_service_images/sample_advisory_035_4_rT2XGUT.png', 3, '2026-08-04 06:58:04.894088', 86),
(260, 'advisory_service_images/sample_advisory_036_1_ATHBI5g.png', 0, '2026-08-04 06:58:04.939465', 87),
(261, 'advisory_service_images/sample_advisory_036_2_S8442D9.png', 1, '2026-08-04 06:58:04.973679', 87),
(262, 'advisory_service_images/sample_advisory_037_1_H09AmFg.png', 0, '2026-08-04 06:58:05.015926', 88),
(263, 'advisory_service_images/sample_advisory_037_2_foXAZsl.png', 1, '2026-08-04 06:58:05.049898', 88),
(264, 'advisory_service_images/sample_advisory_037_3_7RAZNFc.png', 2, '2026-08-04 06:58:05.086891', 88),
(265, 'advisory_service_images/sample_advisory_038_1_Qvtbnwe.png', 0, '2026-08-04 06:58:05.132747', 89),
(266, 'advisory_service_images/sample_advisory_038_2_KnCllIv.png', 1, '2026-08-04 06:58:05.172069', 89),
(267, 'advisory_service_images/sample_advisory_038_3_LZtOHpQ.png', 2, '2026-08-04 06:58:05.213291', 89),
(268, 'advisory_service_images/sample_advisory_038_4_1Rhbiwe.png', 3, '2026-08-04 06:58:05.247268', 89),
(269, 'advisory_service_images/sample_advisory_039_1_V0HA8as.png', 0, '2026-08-04 06:58:05.294432', 90),
(270, 'advisory_service_images/sample_advisory_039_2_0MSv7Mp.png', 1, '2026-08-04 06:58:05.328284', 90),
(271, 'advisory_service_images/sample_advisory_040_1_P3EDTNz.png', 0, '2026-08-04 06:58:05.377164', 91),
(272, 'advisory_service_images/sample_advisory_040_2_jbiMozE.png', 1, '2026-08-04 06:58:05.411410', 91),
(273, 'advisory_service_images/sample_advisory_040_3_K5Jw6ms.png', 2, '2026-08-04 06:58:05.445775', 91),
(274, 'advisory_service_images/sample_advisory_041_1_yRflhM4.png', 0, '2026-08-04 06:58:05.495125', 92),
(275, 'advisory_service_images/sample_advisory_041_2_HftcN0N.png', 1, '2026-08-04 06:58:05.530919', 92),
(276, 'advisory_service_images/sample_advisory_041_3_0h9AtuV.png', 2, '2026-08-04 06:58:05.565950', 92),
(277, 'advisory_service_images/sample_advisory_041_4_gWTjsgh.png', 3, '2026-08-04 06:58:05.600173', 92),
(278, 'advisory_service_images/sample_advisory_042_1_4LG90N4.png', 0, '2026-08-04 06:58:05.651899', 93),
(279, 'advisory_service_images/sample_advisory_042_2_q0FZ4Vn.png', 1, '2026-08-04 06:58:05.686610', 93),
(280, 'advisory_service_images/sample_advisory_043_1_E5UpbmO.png', 0, '2026-08-04 06:58:05.735328', 94),
(281, 'advisory_service_images/sample_advisory_043_2_SXCgt8Q.png', 1, '2026-08-04 06:58:05.770166', 94),
(282, 'advisory_service_images/sample_advisory_043_3_Z5mcTzC.png', 2, '2026-08-04 06:58:05.805881', 94),
(289, 'advisory_service_images/sample_advisory_046_1_Ejba2ID.png', 0, '2026-08-04 06:58:06.084465', 97),
(290, 'advisory_service_images/sample_advisory_046_2_8VvNAy3.png', 1, '2026-08-04 06:58:06.118547', 97),
(291, 'advisory_service_images/sample_advisory_046_3_pLse59K.png', 2, '2026-08-04 06:58:06.153249', 97),
(292, 'advisory_service_images/sample_advisory_047_1_sBtWlKs.png', 0, '2026-08-04 06:58:06.201476', 98),
(293, 'advisory_service_images/sample_advisory_047_2_sxLRNZX.png', 1, '2026-08-04 06:58:06.236784', 98),
(294, 'advisory_service_images/sample_advisory_047_3_hyns7LH.png', 2, '2026-08-04 06:58:06.270587', 98),
(295, 'advisory_service_images/sample_advisory_047_4_EY94Ooe.png', 3, '2026-08-04 06:58:06.304167', 98),
(296, 'advisory_service_images/sample_advisory_048_1_gCuZzai.png', 0, '2026-08-04 06:58:06.352336', 99),
(297, 'advisory_service_images/sample_advisory_048_2_ufW0yWp.png', 1, '2026-08-04 06:58:06.385615', 99),
(298, 'advisory_service_images/sample_advisory_049_1_UxGj1S4.png', 0, '2026-08-04 06:58:06.442886', 100),
(299, 'advisory_service_images/sample_advisory_049_2_OFT2tJ2.png', 1, '2026-08-04 06:58:06.476359', 100),
(300, 'advisory_service_images/sample_advisory_049_3_tD01pOO.png', 2, '2026-08-04 06:58:06.513957', 100),
(305, 'advisory_service_images/астана.png', 0, '2026-08-05 07:57:42.898606', 102),
(306, 'advisory_service_images/Дэвжих.webp', 1, '2026-08-06 07:54:25.179266', 102),
(307, 'advisory_service_images/хэлд_энтт.png', 3, '2026-08-06 07:59:09.432961', 52),
(308, 'advisory_service_images/хэлд_энтт_KHLmvOs.png', 4, '2026-08-06 08:00:51.196695', 101),
(309, 'advisory_service_images/миримм.png', 4, '2026-08-06 08:02:38.282898', 95),
(310, 'advisory_service_images/миримм_HlRQ1av.png', 2, '2026-08-06 08:03:30.520340', 96);

-- --------------------------------------------------------

--
-- Table structure for table `website_advisoryservicetype`
--

CREATE TABLE `website_advisoryservicetype` (
  `id` bigint NOT NULL,
  `key` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `sort_order` int UNSIGNED NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `website_advisoryservicetype`
--

INSERT INTO `website_advisoryservicetype` (`id`, `key`, `name`, `sort_order`) VALUES
(1, 'management', 'Удирдлагын зөвлөх', 1),
(2, 'finance', 'Санхүүгийн зөвлөх', 2),
(3, 'marketing', 'Маркетингийн зөвлөх', 3),
(4, 'hr', 'Хүний нөөцийн зөвлөх', 4),
(5, 'operations', 'Үйл ажиллагааны зөвлөх', 5),
(6, 'digital', 'Дижитал шилжилтийн зөвлөх', 6);

-- --------------------------------------------------------

--
-- Table structure for table `website_advisoryservice_advisory_sectors`
--

CREATE TABLE `website_advisoryservice_advisory_sectors` (
  `id` bigint NOT NULL,
  `advisoryservice_id` bigint NOT NULL,
  `category_id` bigint NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `website_advisoryservice_advisory_sectors`
--

INSERT INTO `website_advisoryservice_advisory_sectors` (`id`, `advisoryservice_id`, `category_id`) VALUES
(431, 52, 178),
(432, 52, 179),
(433, 52, 180),
(434, 53, 179),
(435, 53, 180),
(436, 54, 180),
(437, 54, 181),
(438, 54, 182),
(439, 55, 181),
(440, 55, 182),
(442, 56, 182),
(443, 56, 183),
(441, 56, 184),
(445, 57, 183),
(444, 57, 184),
(447, 58, 177),
(448, 58, 178),
(446, 58, 184),
(449, 59, 177),
(450, 59, 178),
(451, 60, 178),
(452, 60, 179),
(453, 60, 180),
(454, 61, 179),
(455, 61, 180),
(456, 62, 180),
(457, 62, 181),
(458, 62, 182),
(459, 63, 181),
(460, 63, 182),
(462, 64, 182),
(463, 64, 183),
(461, 64, 184),
(465, 65, 183),
(464, 65, 184),
(467, 66, 177),
(468, 66, 178),
(466, 66, 184),
(469, 67, 177),
(470, 67, 178),
(471, 68, 178),
(472, 68, 179),
(473, 68, 180),
(474, 69, 179),
(475, 69, 180),
(476, 70, 180),
(477, 70, 181),
(478, 70, 182),
(479, 71, 181),
(480, 71, 182),
(482, 72, 182),
(483, 72, 183),
(481, 72, 184),
(485, 73, 183),
(484, 73, 184),
(487, 74, 177),
(488, 74, 178),
(486, 74, 184),
(489, 75, 177),
(490, 75, 178),
(491, 76, 178),
(492, 76, 179),
(493, 76, 180),
(494, 77, 179),
(495, 77, 180),
(496, 78, 180),
(497, 78, 181),
(498, 78, 182),
(499, 79, 181),
(500, 79, 182),
(502, 80, 182),
(503, 80, 183),
(501, 80, 184),
(505, 81, 183),
(504, 81, 184),
(507, 82, 177),
(508, 82, 178),
(506, 82, 184),
(509, 83, 177),
(510, 83, 178),
(511, 84, 178),
(512, 84, 179),
(513, 84, 180),
(514, 85, 179),
(515, 85, 180),
(516, 86, 180),
(517, 86, 181),
(518, 86, 182),
(519, 87, 181),
(520, 87, 182),
(522, 88, 182),
(523, 88, 183),
(521, 88, 184),
(525, 89, 183),
(524, 89, 184),
(527, 90, 177),
(528, 90, 178),
(526, 90, 184),
(529, 91, 177),
(530, 91, 178),
(531, 92, 178),
(532, 92, 179),
(533, 92, 180),
(534, 93, 179),
(535, 93, 180),
(536, 94, 180),
(537, 94, 181),
(538, 94, 182),
(539, 95, 181),
(540, 95, 182),
(542, 96, 182),
(543, 96, 183),
(541, 96, 184),
(545, 97, 183),
(544, 97, 184),
(547, 98, 177),
(548, 98, 178),
(546, 98, 184),
(549, 99, 177),
(550, 99, 178),
(551, 100, 178),
(552, 100, 179),
(553, 100, 180),
(554, 101, 179),
(555, 101, 180),
(556, 102, 48);

-- --------------------------------------------------------

--
-- Table structure for table `website_article`
--

CREATE TABLE `website_article` (
  `id` bigint NOT NULL,
  `title` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `image` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `published_date` date NOT NULL,
  `description` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `is_featured` tinyint(1) NOT NULL,
  `created_date` datetime(6) NOT NULL,
  `update_date` datetime(6) NOT NULL,
  `article_type_id` bigint NOT NULL,
  `created_by_id` int NOT NULL,
  `organization_id` bigint NOT NULL,
  `is_approved` tinyint(1) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `website_article`
--

INSERT INTO `website_article` (`id`, `title`, `image`, `published_date`, `description`, `is_featured`, `created_date`, `update_date`, `article_type_id`, `created_by_id`, `organization_id`, `is_approved`) VALUES
(51, 'нийтлэл', 'article_images/2e568883-92b4-4366-960d-2a35f3c3221d.jpg', '2026-03-16', 'ыбөбыөбы', 0, '2026-03-16 05:39:08.122120', '2026-03-16 05:39:08.122120', 163, 38, 33, 0),
(102, 'Sample Article 001 - Growth Report', 'article_images/sample_article_001_HgppCkA.png', '2024-01-15', 'Салбарын өөрчлөлт, эрэлт хэрэгцээ, хэрэгжүүлэлтийн туршлагыг нэгтгэсэн товч бөгөөд хэрэгтэй агуулга.\n\nМөн хэрэгжүүлэлтийн үе шат, анхаарах эрсдэл, хөрөнгө оруулалтын өгөөжид нөлөөлөх хүчин зүйлсийг багтаасан.\n\nЖишээ нийтлэлийн код: 001\nНийтлэлийн төрөл: Тойм\nЗорилтот уншигч: дижитал шилжилт, удирдлага, бизнес хөгжүүлэлт хариуцсан баг.', 1, '2026-08-04 07:23:03.291084', '2026-08-04 07:23:03.291103', 164, 6, 24, 1),
(103, 'Sample Article 002 - Smart Guide', 'article_images/sample_article_002_qrYZECW.png', '2024-01-20', 'Шийдвэр гаргагчдад зориулсан практик зөвлөмж, бодит жишээ, хэрэгжүүлэх дараалал бүхий танилцуулга.\n\nБайгууллагын дотоод процесс, багийн уялдаа, технологийн сонголтын үр нөлөөг харьцуулсан дүгнэлт оруулсан.\n\nЖишээ нийтлэлийн код: 002\nНийтлэлийн төрөл: Судалгаа\nЗорилтот уншигч: дижитал шилжилт, удирдлага, бизнес хөгжүүлэлт хариуцсан баг.', 1, '2026-08-04 07:23:03.332797', '2026-08-04 07:23:03.332813', 165, 6, 25, 1),
(104, 'Sample Article 003 - Future Update', 'article_images/sample_article_003_WAX8KeX.png', '2024-01-25', 'Зах зээлийн нөхцөл байдал, технологийн нөлөө, байгууллагын бэлэн байдлыг хамарсан дэлгэрэнгүй мэдээлэл.\n\nУдирдлагын түвшний шийдвэр гаргалтад ашиглаж болох товч зөвлөмж болон дараагийн алхмуудыг санал болгосон.\n\nЖишээ нийтлэлийн код: 003\nНийтлэлийн төрөл: Зөвлөгөө\nЗорилтот уншигч: дижитал шилжилт, удирдлага, бизнес хөгжүүлэлт хариуцсан баг.', 1, '2026-08-04 07:23:03.366768', '2026-08-04 07:23:03.366784', 166, 6, 26, 1),
(105, 'Sample Article 004 - Insight Brief', 'article_images/sample_article_004_I8Fsu5y.png', '2024-01-30', 'Байгууллагын дижитал хөгжил, зах зээлийн чиг хандлага, хэрэгжүүлж болох бодит алхмуудын тухай нийтлэл.\n\nЭнэхүү нийтлэл нь өнөөгийн нөхцөл байдал, тулгамдсан асуудал, боломжит шийдлүүдийг жишээтэйгээр тайлбарлана.\n\nЖишээ нийтлэлийн код: 004\nНийтлэлийн төрөл: Ярилцлага\nЗорилтот уншигч: дижитал шилжилт, удирдлага, бизнес хөгжүүлэлт хариуцсан баг.', 1, '2026-08-04 07:23:03.401123', '2026-08-04 07:23:03.401139', 167, 6, 27, 1),
(106, 'Sample Article 005 - Market Review', 'article_images/sample_article_005_ooVuTc1.png', '2024-02-04', 'Салбарын өөрчлөлт, эрэлт хэрэгцээ, хэрэгжүүлэлтийн туршлагыг нэгтгэсэн товч бөгөөд хэрэгтэй агуулга.\n\nМөн хэрэгжүүлэлтийн үе шат, анхаарах эрсдэл, хөрөнгө оруулалтын өгөөжид нөлөөлөх хүчин зүйлсийг багтаасан.\n\nЖишээ нийтлэлийн код: 005\nНийтлэлийн төрөл: Шинэчлэл\nЗорилтот уншигч: дижитал шилжилт, удирдлага, бизнес хөгжүүлэлт хариуцсан баг.', 1, '2026-08-04 07:23:03.436244', '2026-08-04 07:23:03.436260', 168, 6, 28, 1),
(107, 'Sample Article 006 - Scale Trends', 'article_images/sample_article_006_cK5GvdJ.png', '2024-02-09', 'Шийдвэр гаргагчдад зориулсан практик зөвлөмж, бодит жишээ, хэрэгжүүлэх дараалал бүхий танилцуулга.\n\nБайгууллагын дотоод процесс, багийн уялдаа, технологийн сонголтын үр нөлөөг харьцуулсан дүгнэлт оруулсан.\n\nЖишээ нийтлэлийн код: 006\nНийтлэлийн төрөл: Мэдээ\nЗорилтот уншигч: дижитал шилжилт, удирдлага, бизнес хөгжүүлэлт хариуцсан баг.', 1, '2026-08-04 07:23:03.469478', '2026-08-04 07:23:03.469509', 163, 6, 29, 1),
(108, 'Sample Article 007 - Core Strategy', 'article_images/sample_article_007_1XVpFDb.png', '2024-02-14', 'Зах зээлийн нөхцөл байдал, технологийн нөлөө, байгууллагын бэлэн байдлыг хамарсан дэлгэрэнгүй мэдээлэл.\n\nУдирдлагын түвшний шийдвэр гаргалтад ашиглаж болох товч зөвлөмж болон дараагийн алхмуудыг санал болгосон.\n\nЖишээ нийтлэлийн код: 007\nНийтлэлийн төрөл: Тойм\nЗорилтот уншигч: дижитал шилжилт, удирдлага, бизнес хөгжүүлэлт хариуцсан баг.', 1, '2026-08-04 07:23:03.503126', '2026-08-04 07:23:03.503142', 164, 6, 30, 1),
(109, 'Sample Article 008 - Next Outlook', 'article_images/sample_article_008_H8tLWeF.png', '2024-02-19', 'Байгууллагын дижитал хөгжил, зах зээлийн чиг хандлага, хэрэгжүүлж болох бодит алхмуудын тухай нийтлэл.\n\nЭнэхүү нийтлэл нь өнөөгийн нөхцөл байдал, тулгамдсан асуудал, боломжит шийдлүүдийг жишээтэйгээр тайлбарлана.\n\nЖишээ нийтлэлийн код: 008\nНийтлэлийн төрөл: Судалгаа\nЗорилтот уншигч: дижитал шилжилт, удирдлага, бизнес хөгжүүлэлт хариуцсан баг.', 1, '2026-08-04 07:23:03.542603', '2026-08-04 07:23:03.542620', 165, 6, 31, 1),
(110, 'Sample Article 009 - Impact Report', 'article_images/sample_article_009_N7irbAz.png', '2024-02-24', 'Салбарын өөрчлөлт, эрэлт хэрэгцээ, хэрэгжүүлэлтийн туршлагыг нэгтгэсэн товч бөгөөд хэрэгтэй агуулга.\n\nМөн хэрэгжүүлэлтийн үе шат, анхаарах эрсдэл, хөрөнгө оруулалтын өгөөжид нөлөөлөх хүчин зүйлсийг багтаасан.\n\nЖишээ нийтлэлийн код: 009\nНийтлэлийн төрөл: Зөвлөгөө\nЗорилтот уншигч: дижитал шилжилт, удирдлага, бизнес хөгжүүлэлт хариуцсан баг.', 1, '2026-08-04 07:23:03.576564', '2026-08-04 07:23:03.576580', 166, 6, 32, 1),
(111, 'Sample Article 010 - Digital Guide', 'article_images/мэдээ1.jpg', '2024-02-29', '<ul><li>Шийдвэр гаргагчдад зориулсан практик зөвлөмж, бодит жишээ, хэрэгжүүлэх дараалал бүхий танилцуулга.</li><li>Байгууллагын дотоод процесс, багийн уялдаа, технологийн сонголтын үр нөлөөг харьцуулсан дүгнэлт оруулсан.</li><li>Жишээ нийтлэлийн код: 010Нийтлэлийн төрөл: ЯрилцлагаЗорилтот уншигч: дижитал шилжилт, удирдлага, бизнес хөгжүүлэлт хариуцсан баг.</li></ul>', 1, '2026-08-04 07:23:03.611073', '2026-08-06 08:13:44.172420', 167, 6, 23, 1),
(112, 'Сурагчийн дүрэмт хувцасны иж бүрдэлд поло цамцыг нэмж, 1-р сарын 1-нээс мөрдөнө', 'article_images/Мэдээ2.jpg', '2024-03-05', '2024 онд сурагчийн дүрэмт хувцаст поло цамц нэмнэ гэгдэж байсан ч тухайн жилийн хичээлийн шинэ жил эхлэхийн өмнө Засгийн газрын хуралдааны шийдвэр гарч, нэгдсэн загварын дүрэмт хувцсаа өмсөхөөр тогтсон.<br>Тодруулбал энэ тухай Боловсролын сайд асан П.<br>Наранбаяр,\"2025-2026 оны хичээлийн жилд дотооддоо үйлдвэрлэсэн ханцуйтай, ханцуйгүй поло цамц оруулж ирэх сонголтыг бий болгох судалгааг хийх, стандартад өөрчлөлт оруулах ажлын хэсгийн ажлыг эхлүүлж байна.<br>Энэ ажлын хэсэгт хувийн хэвшил, эцэг эхийн төлөөлөл, мэргэжлийн болон бодлогын байгууллагуудаас оролцоно.<br>Тиймээс энэ жил поло цамц өмсөхгүй.<br>Сонголттой болгоно.<br>Дотоодын үйлдвэрлэлээ дэмжсэн бодлогоо үргэлжлүүлнэ.<br>Стандартад өөрчлөлт оруулна\" хэмээн 2025 онд мэдэгдэж байв.<br>Стандарт, хэмжил зүйн газраас энэ оны 7-р сард Сурагчийн дүрэмт хувцас Техникийн шаардлагад нэмэлт өөрчөлт оруулсан билээ.<br>Иймд уг шийдвэр ирэх 2027 оны 1-р сарын 1-ний өдрөөс хэрэгжиж эхлэх аж.', 1, '2026-08-04 07:23:03.644292', '2026-08-06 08:12:30.143705', 168, 6, 24, 1),
(113, 'Sample Article 012 - Smart Brief', 'article_images/мэдээ_nVkiVkr.jpg', '2024-03-10', '<ul><li>Байгууллагын дижитал хөгжил, зах зээлийн чиг хандлага, хэрэгжүүлж болох бодит алхмуудын тухай нийтлэл.</li><li>Энэхүү нийтлэл нь өнөөгийн нөхцөл байдал, тулгамдсан асуудал, боломжит шийдлүүдийг жишээтэйгээр тайлбарлана.</li><li>Жишээ нийтлэлийн код: 012</li><li>Нийтлэлийн төрөл: Мэдээ</li><li>Зорилтот уншигч: дижитал шилжилт, удирдлага, бизнес хөгжүүлэлт хариуцсан баг.</li></ul>', 1, '2026-08-04 07:23:03.680190', '2026-08-06 08:08:48.152364', 163, 6, 25, 1),
(114, 'Sample Article 013 - Future Review', 'article_images/sample_article_013_xb3SJq5.png', '2024-03-15', 'Салбарын өөрчлөлт, эрэлт хэрэгцээ, хэрэгжүүлэлтийн туршлагыг нэгтгэсэн товч бөгөөд хэрэгтэй агуулга.\n\nМөн хэрэгжүүлэлтийн үе шат, анхаарах эрсдэл, хөрөнгө оруулалтын өгөөжид нөлөөлөх хүчин зүйлсийг багтаасан.\n\nЖишээ нийтлэлийн код: 013\nНийтлэлийн төрөл: Тойм\nЗорилтот уншигч: дижитал шилжилт, удирдлага, бизнес хөгжүүлэлт хариуцсан баг.', 0, '2026-08-04 07:23:03.713126', '2026-08-04 07:23:03.713147', 164, 6, 26, 1),
(115, 'Sample Article 014 - Insight Trends', 'article_images/sample_article_014_4Z35ZZJ.png', '2024-03-20', 'Шийдвэр гаргагчдад зориулсан практик зөвлөмж, бодит жишээ, хэрэгжүүлэх дараалал бүхий танилцуулга.\n\nБайгууллагын дотоод процесс, багийн уялдаа, технологийн сонголтын үр нөлөөг харьцуулсан дүгнэлт оруулсан.\n\nЖишээ нийтлэлийн код: 014\nНийтлэлийн төрөл: Судалгаа\nЗорилтот уншигч: дижитал шилжилт, удирдлага, бизнес хөгжүүлэлт хариуцсан баг.', 0, '2026-08-04 07:23:03.746977', '2026-08-04 07:23:03.746992', 165, 6, 27, 1),
(116, 'Sample Article 015 - Market Strategy', 'article_images/sample_article_015_0j3nKDl.png', '2024-03-25', 'Зах зээлийн нөхцөл байдал, технологийн нөлөө, байгууллагын бэлэн байдлыг хамарсан дэлгэрэнгүй мэдээлэл.\n\nУдирдлагын түвшний шийдвэр гаргалтад ашиглаж болох товч зөвлөмж болон дараагийн алхмуудыг санал болгосон.\n\nЖишээ нийтлэлийн код: 015\nНийтлэлийн төрөл: Зөвлөгөө\nЗорилтот уншигч: дижитал шилжилт, удирдлага, бизнес хөгжүүлэлт хариуцсан баг.', 0, '2026-08-04 07:23:03.783434', '2026-08-04 07:23:03.783463', 166, 6, 28, 1),
(117, 'Sample Article 016 - Scale Outlook', 'article_images/sample_article_016_4jXGxMg.png', '2024-03-30', 'Байгууллагын дижитал хөгжил, зах зээлийн чиг хандлага, хэрэгжүүлж болох бодит алхмуудын тухай нийтлэл.\n\nЭнэхүү нийтлэл нь өнөөгийн нөхцөл байдал, тулгамдсан асуудал, боломжит шийдлүүдийг жишээтэйгээр тайлбарлана.\n\nЖишээ нийтлэлийн код: 016\nНийтлэлийн төрөл: Ярилцлага\nЗорилтот уншигч: дижитал шилжилт, удирдлага, бизнес хөгжүүлэлт хариуцсан баг.', 0, '2026-08-04 07:23:03.818644', '2026-08-04 07:23:03.818660', 167, 6, 29, 1),
(118, 'Sample Article 017 - Core Report', 'article_images/sample_article_017_UijwQV8.png', '2024-04-04', 'Салбарын өөрчлөлт, эрэлт хэрэгцээ, хэрэгжүүлэлтийн туршлагыг нэгтгэсэн товч бөгөөд хэрэгтэй агуулга.\n\nМөн хэрэгжүүлэлтийн үе шат, анхаарах эрсдэл, хөрөнгө оруулалтын өгөөжид нөлөөлөх хүчин зүйлсийг багтаасан.\n\nЖишээ нийтлэлийн код: 017\nНийтлэлийн төрөл: Шинэчлэл\nЗорилтот уншигч: дижитал шилжилт, удирдлага, бизнес хөгжүүлэлт хариуцсан баг.', 0, '2026-08-04 07:23:03.850866', '2026-08-04 07:23:03.850881', 168, 6, 30, 1),
(119, 'Sample Article 018 - Next Guide', 'article_images/sample_article_018_wvPxffU.png', '2024-04-09', 'Шийдвэр гаргагчдад зориулсан практик зөвлөмж, бодит жишээ, хэрэгжүүлэх дараалал бүхий танилцуулга.\n\nБайгууллагын дотоод процесс, багийн уялдаа, технологийн сонголтын үр нөлөөг харьцуулсан дүгнэлт оруулсан.\n\nЖишээ нийтлэлийн код: 018\nНийтлэлийн төрөл: Мэдээ\nЗорилтот уншигч: дижитал шилжилт, удирдлага, бизнес хөгжүүлэлт хариуцсан баг.', 0, '2026-08-04 07:23:03.884013', '2026-08-04 07:23:03.884028', 163, 6, 31, 1),
(120, 'Sample Article 019 - Impact Update', 'article_images/sample_article_019_RSKg3xN.png', '2024-04-14', 'Зах зээлийн нөхцөл байдал, технологийн нөлөө, байгууллагын бэлэн байдлыг хамарсан дэлгэрэнгүй мэдээлэл.\n\nУдирдлагын түвшний шийдвэр гаргалтад ашиглаж болох товч зөвлөмж болон дараагийн алхмуудыг санал болгосон.\n\nЖишээ нийтлэлийн код: 019\nНийтлэлийн төрөл: Тойм\nЗорилтот уншигч: дижитал шилжилт, удирдлага, бизнес хөгжүүлэлт хариуцсан баг.', 0, '2026-08-04 07:23:03.917461', '2026-08-04 07:23:03.917476', 164, 6, 32, 1),
(121, 'Sample Article 020 - Digital Brief', 'article_images/мэдээ.jpg', '2024-04-19', '<ul><li>Байгууллагын дижитал хөгжил, зах зээлийн чиг хандлага, хэрэгжүүлж болох бодит алхмуудын тухай нийтлэл.</li><li>Энэхүү нийтлэл нь өнөөгийн нөхцөл байдал, тулгамдсан асуудал, боломжит шийдлүүдийг жишээтэйгээр тайлбарлана.</li><li>Жишээ нийтлэлийн код: 020</li><li>Нийтлэлийн төрөл: Судалгаа</li><li>Зорилтот уншигч: дижитал шилжилт, удирдлага, бизнес хөгжүүлэлт хариуцсан баг.</li></ul>', 0, '2026-08-04 07:23:03.950720', '2026-08-06 08:08:18.452953', 165, 6, 23, 1),
(122, 'мэдээлэл', 'article_images/Мэдээ2_cUBwaQS.jpg', '2026-08-21', '<strong>Тод</strong><em>Налуу</eбөыөm><h3>Гарчиг</h3><p>Мөр</p>', 0, '2026-08-21 09:57:01.736210', '2026-08-21 09:57:01.736223', 163, 43, 39, 1);

-- --------------------------------------------------------

--
-- Table structure for table `website_category`
--

CREATE TABLE `website_category` (
  `id` bigint NOT NULL,
  `name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `type` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `parent_id` bigint DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `website_category`
--

INSERT INTO `website_category` (`id`, `name`, `type`, `parent_id`) VALUES
(1, 'Харилцагчийн үйлчилгээ', 'program', NULL),
(2, 'CRM - Харилцагчийн удирдлага', 'program', 1),
(3, 'Conference & Хурал', 'program', 1),
(4, 'Дуудлагын төвийн систем', 'program', 1),
(5, 'Үйлчилгээний дарааллын систем', 'program', 1),
(6, 'Санхүү & Нягтлан бодох', 'program', NULL),
(7, 'POS, Касс & Дэлгүүр', 'program', 6),
(8, 'Финтек & Хэтэвч', 'program', 6),
(9, 'Банк & Банк бус санхүүгийн систем', 'program', 6),
(10, 'Нягтлан бодох бүртгэл', 'program', 6),
(11, 'Түгээлт & Нийлүүлэлт', 'program', NULL),
(12, 'Худалдан авалтын систем', 'program', 11),
(13, 'Түгээлт & Тээвэр хяналт', 'program', 11),
(14, 'Захиалгын систем', 'program', 11),
(15, 'Агуулахын удирдлагын систем', 'program', 11),
(16, 'Маркетинг & Борлуулалт', 'program', NULL),
(17, 'Лоялти & Урамшуулал', 'program', 16),
(18, 'Онлайн худалдаа', 'program', 16),
(19, 'Борлуулалт & Маркетинг', 'program', 16),
(20, 'Зар сурталчилгаа', 'program', 16),
(21, 'Хүний нөөц', 'program', NULL),
(22, 'Онлайн сургалт & Шалгалт', 'program', 21),
(23, 'Хүний нөөцийн удирдлагын систем', 'program', 21),
(24, 'Цаг бүртгэлийн систем', 'program', 21),
(25, 'Цалингийн програм', 'program', 21),
(26, 'Бусад', 'program', NULL),
(27, 'Хувийн эрүүл мэнд', 'program', 26),
(28, 'Мэдээ & Видео үзэх', 'program', 26),
(29, 'Хувь хүний хөгжил', 'program', 26),
(30, 'Тоглоом', 'program', 26),
(31, 'Мэдээллийн Технологи', 'program', NULL),
(32, 'Үүрэн холбоо & Яриа', 'program', 31),
(33, 'Анти вирус & Хамгаалалт', 'program', 31),
(34, 'Хөгжүүлэлтийн хэрэгсэл', 'program', 31),
(35, 'И-Оффис & Бичиг баримт', 'program', 31),
(36, 'Стратеги & Төлөвлөлт', 'program', NULL),
(37, 'Бизнес тандалт & Судалгаа', 'program', 36),
(38, 'ERP - Байгууллагын нөөц төлөвлөлт', 'program', 36),
(39, 'Ажлын урсгалын удирдлагын систем', 'program', 36),
(40, 'Төсөл & Төлөвлөгөөний систем', 'program', 36),
(41, 'Жижиглэн худалдаа', 'advisory', NULL),
(42, 'Супермаркет, сүлжээ дэлгүүр', 'advisory', 41),
(43, 'Мини маркет, хүнсний дэлгүүр', 'advisory', 41),
(44, 'Зах, худалдааны төв', 'advisory', 41),
(45, 'Бөөний худалдаа', 'advisory', 41),
(46, 'Онлайн худалдаа (E-commerce)', 'advisory', 41),
(47, 'Үйлчилгээний салбар', 'advisory', NULL),
(48, 'Үсчин, гоо сайхан', 'advisory', 47),
(49, 'Засвар үйлчилгээ (утас, машин, техник)', 'advisory', 47),
(50, 'Цэвэрлэгээ', 'advisory', 47),
(51, 'Хүргэлт, логистик', 'advisory', 47),
(52, 'Түрээсийн үйлчилгээ', 'advisory', 47),
(53, 'Зочид буудал, аялал жуулчлал', 'advisory', NULL),
(54, 'Зочид буудал', 'advisory', 53),
(55, 'Жуулчны бааз', 'advisory', 53),
(56, 'Аяллын агентлаг', 'advisory', 53),
(57, 'Амралтын газар', 'advisory', 53),
(58, 'Гэр буудал (Guest house)', 'advisory', 53),
(59, 'Хоол үйлдвэрлэл, нийтийн хоол', 'advisory', NULL),
(60, 'Ресторан', 'advisory', 59),
(61, 'Кафе', 'advisory', 59),
(62, 'Түргэн хоол', 'advisory', 59),
(63, 'Цайны газар', 'advisory', 59),
(64, 'Catering үйлчилгээ', 'advisory', 59),
(65, 'Тээвэр, логистик', 'advisory', NULL),
(66, 'Такси үйлчилгээ', 'advisory', 65),
(67, 'Ачаа тээвэр', 'advisory', 65),
(68, 'Шуудан, хүргэлт', 'advisory', 65),
(69, 'Агуулах үйлчилгээ', 'advisory', 65),
(70, 'Логистикийн компани', 'advisory', 65),
(71, 'Санхүүгийн үйлчилгээ', 'advisory', NULL),
(72, 'Банк', 'advisory', 71),
(73, 'Банк бус санхүүгийн байгууллага', 'advisory', 71),
(74, 'Даатгал', 'advisory', 71),
(75, 'Лизинг', 'advisory', 71),
(76, 'Валют арилжаа', 'advisory', 71),
(77, 'Мэдээлэл, харилцаа холбоо', 'advisory', NULL),
(78, 'Гар утасны оператор', 'advisory', 77),
(79, 'Интернэт үйлчилгээ', 'advisory', 77),
(80, 'IT үйлчилгээ', 'advisory', 77),
(81, 'Програм хангамж', 'advisory', 77),
(82, 'Дата төв', 'advisory', 77),
(83, 'Барилга, үл хөдлөх хөрөнгө', 'advisory', NULL),
(84, 'Барилгын компани', 'advisory', 83),
(85, 'Үл хөдлөх зуучлал', 'advisory', 83),
(86, 'Орон сууцны борлуулалт', 'advisory', 83),
(87, 'Түрээсийн үйлчилгээ', 'advisory', 83),
(88, 'Эрүүл мэнд, боловсрол', 'advisory', NULL),
(89, 'Эмнэлэг', 'advisory', 88),
(90, 'Эм ханган', 'advisory', 88),
(91, 'Оношлогооны төв', 'advisory', 88),
(92, 'Сургууль', 'advisory', 88),
(93, 'Их дээд сургууль', 'advisory', 88),
(94, 'Сургалтын төв', 'advisory', 88),
(95, 'Хувийн курс', 'advisory', 88),
(96, 'Хувцас, хэрэглээний бараа', 'advisory', NULL),
(97, 'Хувцасны дэлгүүр', 'advisory', 96),
(98, 'Гутал, цүнх', 'advisory', 96),
(99, 'Гоо сайхны бүтээгдэхүүн', 'advisory', 96),
(100, 'Гэр ахуйн бараа', 'advisory', 96),
(101, 'Электроникс', 'advisory', 96),
(102, 'Соёл, амралт, зугаа цэнгэл', 'advisory', NULL),
(103, 'Кино театр', 'advisory', 102),
(104, 'Фитнес клуб', 'advisory', 102),
(105, 'Караоке', 'advisory', 102),
(106, 'Боулинг', 'advisory', 102),
(107, 'Тоглоомын төв', 'advisory', 102),
(108, 'Мэргэжлийн үйлчилгээ', 'advisory', NULL),
(109, 'Хууль зүйн үйлчилгээ', 'advisory', 108),
(110, 'Нягтлан бодох', 'advisory', 108),
(111, 'Аудит', 'advisory', 108),
(112, 'Зөвлөх үйлчилгээ', 'advisory', 108),
(163, 'Мэдээ', 'article', NULL),
(164, 'Тойм', 'article', NULL),
(165, 'Судалгаа', 'article', NULL),
(166, 'Зөвлөгөө', 'article', NULL),
(167, 'Ярилцлага', 'article', NULL),
(168, 'Шинэчлэл', 'article', NULL),
(169, 'ERP', 'program', NULL),
(170, 'CRM', 'program', NULL),
(171, 'POS', 'program', NULL),
(172, 'HRM', 'program', NULL),
(173, 'Accounting', 'program', NULL),
(174, 'Inventory', 'program', NULL),
(175, 'E-Commerce', 'program', NULL),
(176, 'Project Management', 'program', NULL),
(177, 'Finance', 'advisory', NULL),
(178, 'Retail', 'advisory', NULL),
(179, 'Education', 'advisory', NULL),
(180, 'Healthcare', 'advisory', NULL),
(181, 'Construction', 'advisory', NULL),
(182, 'Agriculture', 'advisory', NULL),
(183, 'Logistics', 'advisory', NULL),
(184, 'Manufacturing', 'advisory', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `website_customer`
--

CREATE TABLE `website_customer` (
  `id` bigint NOT NULL,
  `name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `logo` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `email` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `phone` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `website` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `address` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `contact_person_name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `contact_person_phone` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `created_date` datetime(6) NOT NULL,
  `update_date` datetime(6) NOT NULL,
  `type` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `user_id` int NOT NULL,
  `account_type` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `membership_paid_date` date DEFAULT NULL,
  `membership_end_date` date DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `website_customer`
--

INSERT INTO `website_customer` (`id`, `name`, `logo`, `email`, `phone`, `website`, `address`, `contact_person_name`, `contact_person_phone`, `created_date`, `update_date`, `type`, `user_id`, `account_type`, `membership_paid_date`, `membership_end_date`) VALUES
(1, 'uuganaa', '', 'nice.uugan@gmail.com', '999903532', 'webiste', 'hayg', 'uuganaa', '98984545', '2026-02-26 02:07:26.226865', '2026-02-26 02:07:26.226865', 'bronze', 4, 'person', NULL, NULL),
(2, 'Sample Developer 01', '', 'sampledev01@example.com', '', '', '', '', '', '2026-02-26 05:30:57.592842', '2026-02-26 05:30:57.592842', 'bronze', 7, 'org', NULL, NULL),
(3, 'Sample Developer 02', '', 'sampledev02@example.com', '', '', '', '', '', '2026-02-26 05:30:57.663826', '2026-02-26 05:30:57.663826', 'bronze', 8, 'org', NULL, NULL),
(4, 'Sample Developer 03', '', 'sampledev03@example.com', '', '', '', '', '', '2026-02-26 05:30:57.729056', '2026-02-26 05:30:57.729056', 'bronze', 9, 'org', NULL, NULL),
(5, 'Sample Developer 04', '', 'sampledev04@example.com', '', '', '', '', '', '2026-02-26 05:30:57.815348', '2026-02-26 05:30:57.815348', 'bronze', 10, 'org', NULL, NULL),
(6, 'Sample Developer 05', '', 'sampledev05@example.com', '', '', '', '', '', '2026-02-26 05:30:57.881360', '2026-02-26 05:30:57.881360', 'bronze', 11, 'org', NULL, NULL),
(7, 'Sample Developer 06', '', 'sampledev06@example.com', '', '', '', '', '', '2026-02-26 05:30:57.947205', '2026-02-26 05:30:57.947205', 'bronze', 12, 'org', NULL, NULL),
(8, 'Sample Developer 07', '', 'sampledev07@example.com', '', '', '', '', '', '2026-02-26 05:30:58.013481', '2026-02-26 05:30:58.013481', 'bronze', 13, 'org', NULL, NULL),
(9, 'Sample Developer 08', '', 'sampledev08@example.com', '', '', '', '', '', '2026-02-26 05:30:58.080777', '2026-02-26 05:30:58.080777', 'bronze', 14, 'org', NULL, NULL),
(10, 'Sample Developer 09', '', 'sampledev09@example.com', '', '', '', '', '', '2026-02-26 05:30:58.145940', '2026-02-26 05:30:58.145940', 'bronze', 15, 'org', NULL, NULL),
(11, 'Sample Developer 10', '', 'sampledev10@example.com', '', '', '', '', '', '2026-02-26 05:30:58.213801', '2026-02-26 05:30:58.213801', 'bronze', 16, 'org', NULL, NULL),
(12, 'uuganaa', '', 'uuganbayar.d@ncac.mn', '', '', '', '', '', '2026-03-10 08:21:15.256063', '2026-03-10 08:21:15.256063', 'bronze', 17, 'person', NULL, NULL),
(13, 'Sample Advisory Company 01', '', 'sampleadvisory01@example.com', '', '', '', '', '', '2026-03-11 06:35:33.505332', '2026-03-11 06:35:33.505332', 'silver', 18, 'org', NULL, NULL),
(14, 'Sample Advisory Company 02', 'customer_logos/partner_logo_14.png', 'sampleadvisory02@example.com', '', '', '', '', '', '2026-03-11 06:35:33.571526', '2026-08-04 07:33:28.854202', 'gold', 19, 'org', NULL, NULL),
(15, 'Sample Advisory Company 03', '', 'sampleadvisory03@example.com', '', '', '', '', '', '2026-03-11 06:35:33.645606', '2026-03-11 06:35:33.645606', 'silver', 20, 'org', NULL, NULL),
(16, 'Sample Advisory Company 04', 'customer_logos/partner_logo_16.png', 'sampleadvisory04@example.com', '', '', '', '', '', '2026-03-11 06:35:33.714168', '2026-08-04 07:33:28.844099', 'gold', 21, 'org', NULL, NULL),
(17, 'Sample Advisory Company 05', '', 'sampleadvisory05@example.com', '', '', '', '', '', '2026-03-11 06:35:33.957162', '2026-03-11 06:35:33.957162', 'silver', 22, 'org', NULL, NULL),
(18, 'Sample Advisory Company 06', 'customer_logos/partner_logo_18.png', 'sampleadvisory06@example.com', '', '', '', '', '', '2026-03-11 06:35:34.173592', '2026-08-04 07:33:28.836306', 'gold', 23, 'org', NULL, NULL),
(19, 'Sample Advisory Company 07', '', 'sampleadvisory07@example.com', '', '', '', '', '', '2026-03-11 06:35:34.301514', '2026-03-11 06:35:34.301514', 'silver', 24, 'org', NULL, NULL),
(20, 'Sample Advisory Company 08', 'customer_logos/partner_logo_20.png', 'sampleadvisory08@example.com', '', '', '', '', '', '2026-03-11 06:35:34.371605', '2026-08-04 07:33:28.827720', 'gold', 25, 'org', NULL, NULL),
(21, 'Sample Advisory Company 09', '', 'sampleadvisory09@example.com', '', '', '', '', '', '2026-03-11 06:35:34.429719', '2026-03-11 06:35:34.429719', 'silver', 26, 'org', NULL, NULL),
(22, 'Sample Advisory Company 10', 'customer_logos/partner_logo_22.png', 'sampleadvisory10@example.com', '', '', '', '', '', '2026-03-11 06:35:34.498983', '2026-08-04 07:33:28.818809', 'gold', 27, 'org', NULL, NULL),
(23, 'Sample Article Organization 01', '', 'samplearticle01@example.com', '', '', '', '', '', '2026-03-11 08:35:58.628571', '2026-03-11 08:35:58.628571', 'silver', 28, 'org', NULL, NULL),
(24, 'Sample Article Organization 02', 'customer_logos/partner_logo_24.png', 'samplearticle02@example.com', '', '', '', '', '', '2026-03-11 08:35:58.694535', '2026-08-04 07:33:28.809887', 'gold', 29, 'org', NULL, NULL),
(25, 'Sample Article Organization 03', '', 'samplearticle03@example.com', '', '', '', '', '', '2026-03-11 08:35:58.762507', '2026-03-11 08:35:58.762507', 'silver', 30, 'org', NULL, NULL),
(26, 'Sample Article Organization 04', 'customer_logos/partner_logo_26.png', 'samplearticle04@example.com', '', '', '', '', '', '2026-03-11 08:35:58.847720', '2026-08-04 07:33:28.788433', 'gold', 31, 'org', NULL, NULL),
(27, 'Sample Article Organization 05', '', 'samplearticle05@example.com', '', '', '', '', '', '2026-03-11 08:35:58.929513', '2026-03-11 08:35:58.929513', 'silver', 32, 'org', NULL, NULL),
(28, 'Sample Article Organization 06', 'customer_logos/partner_logo_28.png', 'samplearticle06@example.com', '', '', '', '', '', '2026-03-11 08:35:59.005080', '2026-08-04 07:33:28.780803', 'gold', 33, 'org', NULL, NULL),
(29, 'Sample Article Organization 07', '', 'samplearticle07@example.com', '', '', '', '', '', '2026-03-11 08:35:59.084682', '2026-03-11 08:35:59.084682', 'silver', 34, 'org', NULL, NULL),
(30, 'Sample Article Organization 08', 'customer_logos/partner_logo_30.png', 'samplearticle08@example.com', '', '', '', '', '', '2026-03-11 08:35:59.154256', '2026-08-04 07:33:28.771181', 'gold', 35, 'org', NULL, NULL),
(31, 'Sample Article Organization 09', '', 'samplearticle09@example.com', '', '', '', '', '', '2026-03-11 08:35:59.219326', '2026-03-11 08:35:59.219326', 'silver', 36, 'org', NULL, NULL),
(32, 'Sample Article Organization 10', 'customer_logos/partner_logo_32.png', 'samplearticle10@example.com', '', 'https://www.undp.org/mn/mongolia/contact', 'УБ', '', '80633525', '2026-03-11 08:35:59.286453', '2026-08-06 09:14:11.737156', 'gold', 37, 'org', NULL, NULL),
(33, 'Шижир-Ууган ХХК', 'customer_logos/2e568883-92b4-4366-960d-2a35f3c3221d.jpg', 'shijir@uugan.com', '8888', 'https://themewagon.com/themes/connect-plus-free-bootstrap-4-admin-dashboard-template/', '6666', '5555', '44444', '2026-03-12 06:54:27.771949', '2026-08-05 01:36:45.917258', 'silver', 38, 'org', NULL, NULL),
(34, 'ариунзаяа', '', 'zaya@gmail.com', '', '', '', '', '', '2026-08-04 08:54:38.362904', '2026-08-04 08:54:38.362928', 'bronze', 39, 'person', NULL, NULL),
(35, 'admin', '', 'admin@digit.mn', '', '', '', '', '', '2026-08-05 02:25:55.896228', '2026-08-05 02:25:55.896244', 'bronze', 5, 'org', NULL, NULL),
(36, 'zaya', '', 'zayaaq@gmail.com', '', '', '', '', '', '2026-08-05 07:44:09.309078', '2026-08-05 07:44:09.309097', 'bronze', 40, 'person', NULL, NULL),
(37, 'YUNA', '', 'yuna@gmail.com', '', '', '', '', '', '2026-08-06 09:33:53.383065', '2026-08-06 09:33:53.383089', 'bronze', 41, 'org', NULL, NULL),
(38, 'zaya', '', 'zayaaa@gmail.com', '', '', '', '', '', '2026-08-21 09:32:15.500722', '2026-08-21 09:32:15.500742', 'bronze', 42, 'person', NULL, NULL),
(39, 'Digit', '', 'digit2@gmail.com', '', '', '', '', '', '2026-08-21 09:38:26.183029', '2026-08-21 09:38:26.183049', 'bronze', 43, 'org', NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `website_customermembershippayment`
--

CREATE TABLE `website_customermembershippayment` (
  `id` bigint NOT NULL,
  `paid_date` date DEFAULT NULL,
  `end_date` date DEFAULT NULL,
  `membership_type` varchar(10) COLLATE utf8mb4_general_ci NOT NULL,
  `created_date` datetime(6) NOT NULL,
  `update_date` datetime(6) NOT NULL,
  `customer_id` bigint NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `website_customermembershippayment`
--

INSERT INTO `website_customermembershippayment` (`id`, `paid_date`, `end_date`, `membership_type`, `created_date`, `update_date`, `customer_id`) VALUES
(1, '2026-08-05', '2026-08-29', 'silver', '2026-08-05 01:36:45.912287', '2026-08-05 01:36:45.912300', 33);

-- --------------------------------------------------------

--
-- Table structure for table `website_footermenucontent`
--

CREATE TABLE `website_footermenucontent` (
  `id` bigint NOT NULL,
  `key` varchar(50) COLLATE utf8mb4_general_ci NOT NULL,
  `title` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `image` varchar(100) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `content` longtext COLLATE utf8mb4_general_ci NOT NULL,
  `is_active` tinyint(1) NOT NULL,
  `created_date` datetime(6) NOT NULL,
  `update_date` datetime(6) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `website_footermenucontent`
--

INSERT INTO `website_footermenucontent` (`id`, `key`, `title`, `image`, `content`, `is_active`, `created_date`, `update_date`) VALUES
(1, 'about', 'Бидний тухай', 'footer_menu_content/ChatGPT_Image_Jun_3_2026_10_14_24_AM.png', 'asdsdasda&nbsp; sadsdsadas&nbsp; sasads', 1, '2026-08-05 01:56:32.223824', '2026-08-05 02:03:13.353235'),
(2, 'top_software', 'Топ программ хангамж', '', '', 1, '2026-08-05 02:23:07.210382', '2026-08-05 02:23:07.210402'),
(3, 'pricing', 'Үнийн санал', 'footer_menu_content/үнийн_санал.png', '', 1, '2026-08-06 02:31:06.239271', '2026-08-06 02:31:33.124219'),
(4, 'update_info', 'Мэдээлэл шинэчлэх', '', '', 1, '2026-08-06 04:30:53.849928', '2026-08-06 04:30:53.849942');

-- --------------------------------------------------------

--
-- Table structure for table `website_partnerorganization`
--

CREATE TABLE `website_partnerorganization` (
  `id` bigint NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `logo` varchar(100) COLLATE utf8mb4_general_ci NOT NULL,
  `link_url` varchar(500) COLLATE utf8mb4_general_ci NOT NULL,
  `sort_order` int UNSIGNED NOT NULL,
  `is_active` tinyint(1) NOT NULL,
  `created_date` datetime(6) NOT NULL,
  `update_date` datetime(6) NOT NULL
) ;

--
-- Dumping data for table `website_partnerorganization`
--

INSERT INTO `website_partnerorganization` (`id`, `name`, `logo`, `link_url`, `sort_order`, `is_active`, `created_date`, `update_date`) VALUES
(1, 'YUNA', 'partner_logos/yuna.png', '', 1, 1, '2026-08-06 09:27:43.387765', '2026-08-06 09:28:46.175601'),
(2, 'Helt end', 'partner_logos/Хэлд_энт.png', '', 2, 1, '2026-08-06 09:29:35.279796', '2026-08-06 09:29:37.633820'),
(3, 'POS EASY', 'partner_logos/posease-logo.jpg', '', 3, 1, '2026-08-06 09:30:05.151712', '2026-08-06 09:30:11.953413');

-- --------------------------------------------------------

--
-- Table structure for table `website_slide`
--

CREATE TABLE `website_slide` (
  `id` bigint NOT NULL,
  `partner_label` varchar(120) COLLATE utf8mb4_general_ci NOT NULL,
  `title` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `description` longtext COLLATE utf8mb4_general_ci NOT NULL,
  `image` varchar(100) COLLATE utf8mb4_general_ci NOT NULL,
  `link_url` varchar(500) COLLATE utf8mb4_general_ci NOT NULL,
  `sort_order` int UNSIGNED NOT NULL,
  `is_active` tinyint(1) NOT NULL,
  `created_date` datetime(6) NOT NULL,
  `update_date` datetime(6) NOT NULL
) ;

--
-- Dumping data for table `website_slide`
--

INSERT INTO `website_slide` (`id`, `partner_label`, `title`, `description`, `image`, `link_url`, `sort_order`, `is_active`, `created_date`, `update_date`) VALUES
(1, 'Digit', 'БИЗНЕСИЙГ ХӨГЖҮҮЛЭХ ШИЙДЛИЙН НЭГ ДОРООС', 'Програм хангамж, зөвлөх үйлчилгээ, нийтлэлийг нэг платформоос хайж, харьцуулж сонгоорой.', 'slides/sample-slide-1.jpg', '', 0, 1, '2026-08-17 02:08:17.655688', '2026-08-17 02:08:17.655719'),
(2, 'Програм хангамж', 'ТАНАЙ БАЙГУУЛЛАГАД ТОХИРОХ СИСТЕМҮҮД', 'CRM, ERP, POS болон салбарын шийдлүүдийг ангиллаар нь цэгцтэй үзнэ.', 'slides/sample-slide-2.jpg', '', 1, 1, '2026-08-17 02:08:17.676872', '2026-08-17 02:08:17.676891'),
(3, 'Зөвлөх үйлчилгээ', 'МЭРГЭЖЛИЙН ҮЙЛЧИЛГЭЭГ ХУРДАН ОЛ', 'Хэрэгцээндээ нийцсэн зөвлөх байгууллага, үйлчилгээний мэдээллийг нэг дороос аваарай.', 'slides/sample-slide-3.jpg', '', 2, 1, '2026-08-17 02:08:17.702632', '2026-08-17 02:08:17.702650');

-- --------------------------------------------------------

--
-- Table structure for table `website_software`
--

CREATE TABLE `website_software` (
  `id` bigint NOT NULL,
  `name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `development_start_year` smallint UNSIGNED NOT NULL,
  `description` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `introduction` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `price` decimal(14,2) NOT NULL,
  `price_type` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `created_date` datetime(6) NOT NULL,
  `update_date` datetime(6) NOT NULL,
  `created_by_id` int NOT NULL,
  `developer_id` bigint NOT NULL,
  `program_type_id` bigint NOT NULL,
  `is_featured` tinyint(1) NOT NULL,
  `is_approved` tinyint(1) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `website_software`
--

INSERT INTO `website_software` (`id`, `name`, `development_start_year`, `description`, `introduction`, `price`, `price_type`, `created_date`, `update_date`, `created_by_id`, `developer_id`, `program_type_id`, `is_featured`, `is_approved`) VALUES
(52, 'Sample Software 001 - Prime Desk', 2017, 'Sample description for software 001.', 'Sample introduction for software 001.', 56.00, 'rent', '2026-08-04 06:57:59.360171', '2026-08-04 06:57:59.360202', 6, 3, 170, 1, 1),
(53, 'Sample Software 002 - Nova Flow', 2018, 'Sample description for software 002.', 'Sample introduction for software 002.', 63.00, 'sale', '2026-08-04 06:57:59.407607', '2026-08-04 06:57:59.407626', 6, 4, 171, 1, 1),
(54, 'Sample Software 003 - Quantum Hub', 2019, 'Sample description for software 003.', 'Sample introduction for software 003.', 70.00, 'rent', '2026-08-04 06:57:59.440024', '2026-08-04 06:57:59.440041', 6, 5, 172, 1, 1),
(55, 'Sample Software 004 - Atlas Core', 2020, 'Sample description for software 004.', 'Sample introduction for software 004.', 77.00, 'sale', '2026-08-04 06:57:59.470611', '2026-08-04 06:57:59.470624', 6, 6, 173, 1, 1),
(56, 'Sample Software 005 - Vertex Works', 2021, 'Sample description for software 005.', 'Sample introduction for software 005.', 84.00, 'rent', '2026-08-04 06:57:59.498499', '2026-08-04 06:57:59.498508', 6, 7, 174, 1, 1),
(57, 'Sample Software 006 - Pulse Stack', 2022, 'Sample description for software 006.', 'Sample introduction for software 006.', 91.00, 'sale', '2026-08-04 06:57:59.524559', '2026-08-04 06:57:59.524570', 6, 8, 175, 1, 1),
(58, 'Sample Software 007 - Fusion One', 2023, 'Sample description for software 007.', 'Sample introduction for software 007.', 98.00, 'rent', '2026-08-04 06:57:59.550701', '2026-08-04 06:57:59.550711', 6, 9, 176, 1, 1),
(59, 'Sample Software 008 - Cloud Bridge', 2024, 'Sample description for software 008.', 'Sample introduction for software 008.', 105.00, 'sale', '2026-08-04 06:57:59.578791', '2026-08-04 06:57:59.578802', 6, 10, 169, 1, 1),
(60, 'Sample Software 009 - Matrix Pilot', 2025, 'Sample description for software 009.', 'Sample introduction for software 009.', 112.00, 'rent', '2026-08-04 06:57:59.605798', '2026-08-04 06:57:59.605810', 6, 11, 170, 1, 1),
(61, 'Sample Software 010 - Smart Suite', 2016, 'Sample description for software 010.', 'Sample introduction for software 010.', 119.00, 'sale', '2026-08-04 06:57:59.631190', '2026-08-04 06:57:59.631201', 6, 2, 171, 1, 1),
(62, 'Sample Software 011 - Prime Desk', 2017, 'Sample description for software 011.', 'Sample introduction for software 011.', 126.00, 'rent', '2026-08-04 06:57:59.656522', '2026-08-04 06:57:59.656532', 6, 3, 172, 1, 1),
(63, 'Sample Software 012 - Nova Flow', 2018, 'Sample description for software 012.', 'Sample introduction for software 012.', 133.00, 'sale', '2026-08-04 06:57:59.682037', '2026-08-06 08:06:43.036421', 6, 4, 173, 1, 1),
(64, 'Sample Software 013 - Quantum Hub', 2019, 'Sample description for software 013.', 'Sample introduction for software 013.', 140.00, 'rent', '2026-08-04 06:57:59.706234', '2026-08-04 06:57:59.706243', 6, 5, 174, 0, 1),
(65, 'Sample Software 014 - Atlas Core', 2020, 'Sample description for software 014.', 'Sample introduction for software 014.', 147.00, 'sale', '2026-08-04 06:57:59.738143', '2026-08-04 06:57:59.738156', 6, 6, 175, 0, 1),
(66, 'Sample Software 015 - Vertex Works', 2021, 'Sample description for software 015.', 'Sample introduction for software 015.', 154.00, 'rent', '2026-08-04 06:57:59.766276', '2026-08-04 06:57:59.766288', 6, 7, 176, 0, 1),
(67, 'Sample Software 016 - Pulse Stack', 2022, 'Sample description for software 016.', 'Sample introduction for software 016.', 161.00, 'sale', '2026-08-04 06:57:59.792046', '2026-08-04 06:57:59.792060', 6, 8, 169, 0, 1),
(68, 'Sample Software 017 - Fusion One', 2023, 'Sample description for software 017.', 'Sample introduction for software 017.', 168.00, 'rent', '2026-08-04 06:57:59.816573', '2026-08-04 06:57:59.816585', 6, 9, 170, 0, 1),
(69, 'Sample Software 018 - Cloud Bridge', 2024, 'Sample description for software 018.', 'Sample introduction for software 018.', 175.00, 'sale', '2026-08-04 06:57:59.844666', '2026-08-04 06:57:59.844679', 6, 10, 171, 0, 1),
(70, 'Sample Software 019 - Matrix Pilot', 2025, 'Sample description for software 019.', 'Sample introduction for software 019.', 182.00, 'rent', '2026-08-04 06:57:59.875381', '2026-08-04 06:57:59.875393', 6, 11, 172, 0, 1),
(71, 'Sample Software 020 - Smart Suite', 2016, 'Sample description for software 020.', 'Sample introduction for software 020.', 189.00, 'sale', '2026-08-04 06:57:59.900357', '2026-08-04 06:57:59.900368', 6, 2, 173, 0, 1),
(72, 'Sample Software 021 - Prime Desk', 2017, 'Sample description for software 021.', 'Sample introduction for software 021.', 196.00, 'rent', '2026-08-04 06:57:59.926500', '2026-08-04 06:57:59.926513', 6, 3, 174, 0, 1),
(73, 'Sample Software 022 - Nova Flow', 2018, 'Sample description for software 022.', 'Sample introduction for software 022.', 203.00, 'sale', '2026-08-04 06:57:59.951623', '2026-08-04 06:57:59.951639', 6, 4, 175, 0, 1),
(74, 'Sample Software 023 - Quantum Hub', 2019, 'Sample description for software 023.', 'Sample introduction for software 023.', 210.00, 'rent', '2026-08-04 06:57:59.976947', '2026-08-04 06:57:59.976960', 6, 5, 176, 0, 1),
(75, 'Sample Software 024 - Atlas Core', 2020, 'Sample description for software 024.', 'Sample introduction for software 024.', 217.00, 'sale', '2026-08-04 06:58:00.007165', '2026-08-04 06:58:00.007176', 6, 6, 169, 0, 1),
(76, 'Sample Software 025 - Vertex Works', 2021, 'Sample description for software 025.', 'Sample introduction for software 025.', 224.00, 'rent', '2026-08-04 06:58:00.032795', '2026-08-04 06:58:00.032809', 6, 7, 170, 0, 1),
(77, 'Sample Software 026 - Pulse Stack', 2022, 'Sample description for software 026.', 'Sample introduction for software 026.', 231.00, 'sale', '2026-08-04 06:58:00.060192', '2026-08-04 06:58:00.060206', 6, 8, 171, 0, 1),
(78, 'Sample Software 027 - Fusion One', 2023, 'Sample description for software 027.', 'Sample introduction for software 027.', 238.00, 'rent', '2026-08-04 06:58:00.086698', '2026-08-04 06:58:00.086717', 6, 9, 172, 0, 1),
(79, 'Sample Software 028 - Cloud Bridge', 2024, 'Sample description for software 028.', 'Sample introduction for software 028.', 245.00, 'sale', '2026-08-04 06:58:00.115242', '2026-08-04 06:58:00.115257', 6, 10, 173, 0, 1),
(80, 'Sample Software 029 - Matrix Pilot', 2025, 'Sample description for software 029.', 'Sample introduction for software 029.', 252.00, 'rent', '2026-08-04 06:58:00.145742', '2026-08-04 06:58:00.145756', 6, 11, 174, 0, 1),
(81, 'Sample Software 030 - Smart Suite', 2016, 'Sample description for software 030.', 'Sample introduction for software 030.', 259.00, 'sale', '2026-08-04 06:58:00.178640', '2026-08-04 06:58:00.178657', 6, 2, 175, 0, 1),
(82, 'Sample Software 031 - Prime Desk', 2017, 'Sample description for software 031.', 'Sample introduction for software 031.', 266.00, 'rent', '2026-08-04 06:58:00.217091', '2026-08-04 06:58:00.217106', 6, 3, 176, 0, 1),
(83, 'Sample Software 032 - Nova Flow', 2018, 'Sample description for software 032.', 'Sample introduction for software 032.', 273.00, 'sale', '2026-08-04 06:58:00.251853', '2026-08-04 06:58:00.251864', 6, 4, 169, 0, 1),
(84, 'Sample Software 033 - Quantum Hub', 2019, 'Sample description for software 033.', 'Sample introduction for software 033.', 280.00, 'rent', '2026-08-04 06:58:00.287254', '2026-08-04 06:58:00.287263', 6, 5, 170, 0, 1),
(85, 'Sample Software 034 - Atlas Core', 2020, 'Sample description for software 034.', 'Sample introduction for software 034.', 287.00, 'sale', '2026-08-04 06:58:00.328060', '2026-08-04 06:58:00.328070', 6, 6, 171, 0, 1),
(86, 'Sample Software 035 - Vertex Works', 2021, 'Sample description for software 035.', 'Sample introduction for software 035.', 294.00, 'rent', '2026-08-04 06:58:00.352350', '2026-08-04 06:58:00.352360', 6, 7, 172, 0, 1),
(87, 'Sample Software 036 - Pulse Stack', 2022, 'Sample description for software 036.', 'Sample introduction for software 036.', 301.00, 'sale', '2026-08-04 06:58:00.379027', '2026-08-04 06:58:00.379052', 6, 8, 173, 0, 1),
(88, 'Sample Software 037 - Fusion One', 2023, 'Sample description for software 037.', 'Sample introduction for software 037.', 308.00, 'rent', '2026-08-04 06:58:00.408814', '2026-08-04 06:58:00.408834', 6, 9, 174, 0, 1),
(89, 'Sample Software 038 - Cloud Bridge', 2024, 'Sample description for software 038.', 'Sample introduction for software 038.', 315.00, 'sale', '2026-08-04 06:58:00.435265', '2026-08-04 06:58:00.435285', 6, 10, 175, 0, 1),
(90, 'Sample Software 039 - Matrix Pilot', 2025, 'Sample description for software 039.', 'Sample introduction for software 039.', 322.00, 'rent', '2026-08-04 06:58:00.462624', '2026-08-04 06:58:00.462644', 6, 11, 176, 0, 1),
(91, 'Sample Software 040 - Smart Suite', 2016, 'Sample description for software 040.', 'Sample introduction for software 040.', 329.00, 'sale', '2026-08-04 06:58:00.491018', '2026-08-04 06:58:00.491038', 6, 2, 169, 0, 1),
(92, 'Sample Software 041 - Prime Desk', 2017, 'Sample description for software 041.', 'Sample introduction for software 041.', 336.00, 'rent', '2026-08-04 06:58:00.520554', '2026-08-04 06:58:00.520574', 6, 3, 170, 0, 1),
(93, 'Sample Software 042 - Nova Flow', 2018, 'Sample description for software 042.', 'Sample introduction for software 042.', 343.00, 'sale', '2026-08-04 06:58:00.547458', '2026-08-04 06:58:00.547476', 6, 4, 171, 0, 1),
(94, 'Sample Software 043 - Quantum Hub', 2019, 'Sample description for software 043.', 'Sample introduction for software 043.', 350.00, 'rent', '2026-08-04 06:58:00.574158', '2026-08-04 06:58:00.574176', 6, 5, 172, 0, 1),
(95, 'Sample Software 044 - Atlas Core', 2020, 'Sample description for software 044.', 'Sample introduction for software 044.', 357.00, 'sale', '2026-08-04 06:58:00.607161', '2026-08-04 06:58:00.607184', 6, 6, 173, 0, 1),
(96, 'Sample Software 045 - Vertex Works', 2021, 'Sample description for software 045.', 'Sample introduction for software 045.', 364.00, 'rent', '2026-08-04 06:58:00.644323', '2026-08-04 06:58:00.644343', 6, 7, 174, 0, 1),
(97, 'Sample Software 046 - Pulse Stack', 2022, 'Sample description for software 046.', 'Sample introduction for software 046.', 371.00, 'sale', '2026-08-04 06:58:00.675411', '2026-08-04 06:58:00.675425', 6, 8, 175, 0, 1),
(98, 'POS EASY', 2023, 'Sample description for software 047.', 'Sample introduction for software 047.', 378.00, 'rent', '2026-08-04 06:58:00.706222', '2026-08-06 07:51:41.048808', 6, 32, 176, 0, 1),
(99, 'Sample Software 048 - Cloud Bridge', 2024, 'Sample description for software 048.', 'Sample introduction for software 048.', 385.00, 'sale', '2026-08-04 06:58:00.732677', '2026-08-06 07:12:18.834779', 6, 10, 169, 0, 1),
(100, 'Ресторан, түргэн хоолны TouchPOS', 2015, '<ul><li>TouchPos програм нь сүлжээ ресторан, зоогийн газар, паб, караоке, диско клуб гэх мэт бүх төрлийн үйлчилгээний байгууллагад зориулагдсан бүртгэлийн цогц програм юм.</li><li>Энэхүү програм нь үйлчилгээний байгууллагад учирч болох бүхий л алдаа дутагдлаас урьдчилан сэргийлж, үйлчлэгчдээ боловсон, шуурхай үйлчилгээ үзүүлэх боломжийг олгоно.</li><li>НӨАТ-ын урамшууллын систем, Нийслэл хотын татварын системд холбогдсон тул албан ёсны баримт хэвлэгдэн гарна.</li></ul>', 'Sample introduction for software 049.', 392.00, 'rent', '2026-08-04 06:58:00.759823', '2026-08-06 07:34:03.724186', 6, 26, 170, 0, 1),
(101, 'Spacetime – ЦАГ БҮРТГЭЛИЙН СИСТЕМ', 2016, '<ul><li>Бизнесийн бүх байгууллагуудад зориулсан Spacetime Цаг бүртгэлийн програм хангамжийг 2007 оноос хойш хөгжүүлэн ирсэн бөгөөд өнөөдрийн байдлаар Everest ERP – Spacetime Цаг бүртгэлийн програмыг дараах томоохон бизнесийн байгууллага, групп компаниудад нэвтрүүлэн, програм хангамж сүлжээ системийн хэвийн ажиллагааг ханган хамтран ажиллаж байна.</li><li>Everest ERP -ын&nbsp; SpaceTime Цаг бүртгэлийн систем нь ажилтнуудын ажлын цагтай хамааралтай бүх үе шатуудыг хянасан, автоматжуулсан, алба хэлтэс нэгжүүдээр ажлын ажиллах цагийг өдөр, долоо хоног, сар, жилээр төлөвлөн бүх төрлийн тайлан мэдээ болон цалингийн тооцоолол гаргах нэгдсэн бүртгэлийн систем юм.</li></ul>', 'Spacetime – ЦАГ БҮРТГЭЛИЙН СИСТЕМ', 399.00, 'rent', '2026-08-04 06:58:00.789975', '2026-08-06 07:34:21.854353', 6, 33, 31, 1, 1);

-- --------------------------------------------------------

--
-- Table structure for table `website_softwareimage`
--

CREATE TABLE `website_softwareimage` (
  `id` bigint NOT NULL,
  `image` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `sort_order` int UNSIGNED NOT NULL,
  `created_date` datetime(6) NOT NULL,
  `software_id` bigint NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `website_softwareimage`
--

INSERT INTO `website_softwareimage` (`id`, `image`, `sort_order`, `created_date`, `software_id`) VALUES
(57, 'software_images/sample_software_001_8Y4oNtR.png', 0, '2026-08-04 06:57:59.400918', 52),
(58, 'software_images/sample_software_002_SMZGBwe.png', 0, '2026-08-04 06:57:59.432944', 53),
(59, 'software_images/sample_software_003_1abie6n.png', 0, '2026-08-04 06:57:59.465894', 54),
(60, 'software_images/sample_software_004_UXvkGOG.png', 0, '2026-08-04 06:57:59.494341', 55),
(61, 'software_images/sample_software_005_Wggj46e.png', 0, '2026-08-04 06:57:59.519356', 56),
(62, 'software_images/sample_software_006_56mineg.png', 0, '2026-08-04 06:57:59.546965', 57),
(63, 'software_images/sample_software_007_EgsNcjp.png', 0, '2026-08-04 06:57:59.574798', 58),
(64, 'software_images/sample_software_008_JXFYQnw.png', 0, '2026-08-04 06:57:59.601506', 59),
(65, 'software_images/sample_software_009_uhq2bVQ.png', 0, '2026-08-04 06:57:59.627057', 60),
(66, 'software_images/sample_software_010_8N5CVPk.png', 0, '2026-08-04 06:57:59.651106', 61),
(67, 'software_images/sample_software_011_F6Z2sd9.png', 0, '2026-08-04 06:57:59.678166', 62),
(69, 'software_images/sample_software_013_gtIzKqF.png', 0, '2026-08-04 06:57:59.731728', 64),
(70, 'software_images/sample_software_014_1WGct34.png', 0, '2026-08-04 06:57:59.761474', 65),
(71, 'software_images/sample_software_015_2ckHlxJ.png', 0, '2026-08-04 06:57:59.787819', 66),
(72, 'software_images/sample_software_016_9KXkBQ8.png', 0, '2026-08-04 06:57:59.812438', 67),
(73, 'software_images/sample_software_017_hpp0RAM.png', 0, '2026-08-04 06:57:59.840509', 68),
(74, 'software_images/sample_software_018_pPsqg9y.png', 0, '2026-08-04 06:57:59.870931', 69),
(75, 'software_images/sample_software_019_7OON2tE.png', 0, '2026-08-04 06:57:59.896382', 70),
(76, 'software_images/sample_software_020_MfQJdsm.png', 0, '2026-08-04 06:57:59.922387', 71),
(77, 'software_images/sample_software_021_JkQgr6p.png', 0, '2026-08-04 06:57:59.947088', 72),
(78, 'software_images/sample_software_022_cSSG1nU.png', 0, '2026-08-04 06:57:59.973041', 73),
(79, 'software_images/sample_software_023_OkBrsyR.png', 0, '2026-08-04 06:58:00.001022', 74),
(80, 'software_images/sample_software_024_UczNK3y.png', 0, '2026-08-04 06:58:00.027747', 75),
(81, 'software_images/sample_software_025_BLUI70o.png', 0, '2026-08-04 06:58:00.055668', 76),
(82, 'software_images/sample_software_026_d0Fac02.png', 0, '2026-08-04 06:58:00.081798', 77),
(83, 'software_images/sample_software_027_tWodA3k.png', 0, '2026-08-04 06:58:00.110378', 78),
(84, 'software_images/sample_software_028_9Q2EHjN.png', 0, '2026-08-04 06:58:00.137029', 79),
(85, 'software_images/sample_software_029_aYCg3Jk.png', 0, '2026-08-04 06:58:00.171568', 80),
(86, 'software_images/sample_software_030_6jFOwAZ.png', 0, '2026-08-04 06:58:00.209250', 81),
(87, 'software_images/sample_software_031_uVFcK1t.png', 0, '2026-08-04 06:58:00.244538', 82),
(88, 'software_images/sample_software_032_bQXOIDX.png', 0, '2026-08-04 06:58:00.279941', 83),
(89, 'software_images/sample_software_033_HQsvbLN.png', 0, '2026-08-04 06:58:00.314733', 84),
(90, 'software_images/sample_software_034_KAWi3bI.png', 0, '2026-08-04 06:58:00.348249', 85),
(91, 'software_images/sample_software_035_en9ddNG.png', 0, '2026-08-04 06:58:00.373968', 86),
(92, 'software_images/sample_software_036_N4poYHq.png', 0, '2026-08-04 06:58:00.401934', 87),
(93, 'software_images/sample_software_037_x5g5rho.png', 0, '2026-08-04 06:58:00.430534', 88),
(94, 'software_images/sample_software_038_tkCAVSR.png', 0, '2026-08-04 06:58:00.457133', 89),
(95, 'software_images/sample_software_039_kI4zqT6.png', 0, '2026-08-04 06:58:00.486751', 90),
(96, 'software_images/sample_software_040_V1xAs5f.png', 0, '2026-08-04 06:58:00.515961', 91),
(97, 'software_images/sample_software_041_HB5KGYs.png', 0, '2026-08-04 06:58:00.542325', 92),
(98, 'software_images/sample_software_042_xFf45bn.png', 0, '2026-08-04 06:58:00.569236', 93),
(99, 'software_images/sample_software_043_x4Xs0ra.png', 0, '2026-08-04 06:58:00.601999', 94),
(100, 'software_images/sample_software_044_NKeYS2T.png', 0, '2026-08-04 06:58:00.637182', 95),
(101, 'software_images/sample_software_045_Vxfz9IM.png', 0, '2026-08-04 06:58:00.670870', 96),
(102, 'software_images/sample_software_046_trlDJ7I.png', 0, '2026-08-04 06:58:00.696990', 97),
(113, 'software_images/yuna.png', 2, '2026-08-06 07:01:29.157536', 99),
(114, 'software_images/cup_chicken.png', 1, '2026-08-06 07:12:18.840817', 99),
(116, 'software_images/ритусс.png', 1, '2026-08-06 07:19:16.917893', 100),
(118, 'software_images/эвэрест1.png', 1, '2026-08-06 07:34:21.867133', 101),
(119, 'software_images/posease-logo.jpg', 1, '2026-08-06 07:51:27.301838', 98),
(121, 'software_images/миримм.png', 1, '2026-08-06 08:06:06.978201', 63),
(122, 'software_images/миримм_DpbR8PV.png', 1, '2026-08-06 08:06:08.272876', 63);

-- --------------------------------------------------------

--
-- Table structure for table `website_softwarerating`
--

CREATE TABLE `website_softwarerating` (
  `id` bigint NOT NULL,
  `score` smallint UNSIGNED NOT NULL,
  `created_date` datetime(6) NOT NULL,
  `update_date` datetime(6) NOT NULL,
  `software_id` bigint NOT NULL,
  `user_id` int NOT NULL
) ;

--
-- Dumping data for table `website_softwarerating`
--

INSERT INTO `website_softwarerating` (`id`, `score`, `created_date`, `update_date`, `software_id`, `user_id`) VALUES
(1, 3, '2026-08-06 04:58:10.883941', '2026-08-06 04:58:10.883957', 101, 5);

-- --------------------------------------------------------

--
-- Table structure for table `website_software_advisory_sectors`
--

CREATE TABLE `website_software_advisory_sectors` (
  `id` bigint NOT NULL,
  `software_id` bigint NOT NULL,
  `category_id` bigint NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `website_software_advisory_sectors`
--

INSERT INTO `website_software_advisory_sectors` (`id`, `software_id`, `category_id`) VALUES
(235, 52, 178),
(236, 52, 179),
(237, 52, 180),
(238, 53, 179),
(239, 53, 180),
(240, 54, 180),
(241, 54, 181),
(242, 54, 182),
(243, 55, 181),
(244, 55, 182),
(246, 56, 182),
(247, 56, 183),
(245, 56, 184),
(249, 57, 183),
(248, 57, 184),
(251, 58, 177),
(252, 58, 178),
(250, 58, 184),
(253, 59, 177),
(254, 59, 178),
(255, 60, 178),
(256, 60, 179),
(257, 60, 180),
(258, 61, 179),
(259, 61, 180),
(260, 62, 180),
(261, 62, 181),
(262, 62, 182),
(263, 63, 181),
(264, 63, 182),
(266, 64, 182),
(267, 64, 183),
(265, 64, 184),
(269, 65, 183),
(268, 65, 184),
(271, 66, 177),
(272, 66, 178),
(270, 66, 184),
(273, 67, 177),
(274, 67, 178),
(275, 68, 178),
(276, 68, 179),
(277, 68, 180),
(278, 69, 179),
(279, 69, 180),
(280, 70, 180),
(281, 70, 181),
(282, 70, 182),
(283, 71, 181),
(284, 71, 182),
(286, 72, 182),
(287, 72, 183),
(285, 72, 184),
(289, 73, 183),
(288, 73, 184),
(291, 74, 177),
(292, 74, 178),
(290, 74, 184),
(293, 75, 177),
(294, 75, 178),
(295, 76, 178),
(296, 76, 179),
(297, 76, 180),
(298, 77, 179),
(299, 77, 180),
(300, 78, 180),
(301, 78, 181),
(302, 78, 182),
(303, 79, 181),
(304, 79, 182),
(306, 80, 182),
(307, 80, 183),
(305, 80, 184),
(309, 81, 183),
(308, 81, 184),
(311, 82, 177),
(312, 82, 178),
(310, 82, 184),
(313, 83, 177),
(314, 83, 178),
(315, 84, 178),
(316, 84, 179),
(317, 84, 180),
(318, 85, 179),
(319, 85, 180),
(320, 86, 180),
(321, 86, 181),
(322, 86, 182),
(323, 87, 181),
(324, 87, 182),
(326, 88, 182),
(327, 88, 183),
(325, 88, 184),
(329, 89, 183),
(328, 89, 184),
(331, 90, 177),
(332, 90, 178),
(330, 90, 184),
(333, 91, 177),
(334, 91, 178),
(335, 92, 178),
(336, 92, 179),
(337, 92, 180),
(338, 93, 179),
(339, 93, 180),
(340, 94, 180),
(341, 94, 181),
(342, 94, 182),
(343, 95, 181),
(344, 95, 182),
(346, 96, 182),
(347, 96, 183),
(345, 96, 184),
(349, 97, 183),
(348, 97, 184),
(351, 98, 177),
(352, 98, 178),
(350, 98, 184),
(353, 99, 177),
(354, 99, 178),
(355, 100, 178),
(356, 100, 179),
(357, 100, 180),
(362, 101, 47),
(360, 101, 77),
(361, 101, 182);

--
-- Indexes for dumped tables
--

--
-- Indexes for table `auth_group`
--
ALTER TABLE `auth_group`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `name` (`name`);

--
-- Indexes for table `auth_group_permissions`
--
ALTER TABLE `auth_group_permissions`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `auth_group_permissions_group_id_permission_id_0cd325b0_uniq` (`group_id`,`permission_id`),
  ADD KEY `auth_group_permissio_permission_id_84c5c92e_fk_auth_perm` (`permission_id`);

--
-- Indexes for table `auth_permission`
--
ALTER TABLE `auth_permission`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `auth_permission_content_type_id_codename_01ab375a_uniq` (`content_type_id`,`codename`);

--
-- Indexes for table `auth_user`
--
ALTER TABLE `auth_user`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `username` (`username`);

--
-- Indexes for table `auth_user_groups`
--
ALTER TABLE `auth_user_groups`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `auth_user_groups_user_id_group_id_94350c0c_uniq` (`user_id`,`group_id`),
  ADD KEY `auth_user_groups_group_id_97559544_fk_auth_group_id` (`group_id`);

--
-- Indexes for table `auth_user_user_permissions`
--
ALTER TABLE `auth_user_user_permissions`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `auth_user_user_permissions_user_id_permission_id_14a6b632_uniq` (`user_id`,`permission_id`),
  ADD KEY `auth_user_user_permi_permission_id_1fbb5f2c_fk_auth_perm` (`permission_id`);

--
-- Indexes for table `django_admin_log`
--
ALTER TABLE `django_admin_log`
  ADD PRIMARY KEY (`id`),
  ADD KEY `django_admin_log_content_type_id_c4bce8eb_fk_django_co` (`content_type_id`),
  ADD KEY `django_admin_log_user_id_c564eba6_fk_auth_user_id` (`user_id`);

--
-- Indexes for table `django_content_type`
--
ALTER TABLE `django_content_type`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `django_content_type_app_label_model_76bd3d3b_uniq` (`app_label`,`model`);

--
-- Indexes for table `django_migrations`
--
ALTER TABLE `django_migrations`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `django_session`
--
ALTER TABLE `django_session`
  ADD PRIMARY KEY (`session_key`),
  ADD KEY `django_session_expire_date_a5c62663` (`expire_date`);

--
-- Indexes for table `website_aboutsection`
--
ALTER TABLE `website_aboutsection`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `website_advisorylike`
--
ALTER TABLE `website_advisorylike`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_advisory_like` (`advisory_service_id`,`user_id`),
  ADD KEY `website_advisorylike_user_id_e994542f_fk_auth_user_id` (`user_id`);

--
-- Indexes for table `website_advisorypriceterm`
--
ALTER TABLE `website_advisorypriceterm`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `key` (`key`),
  ADD UNIQUE KEY `name` (`name`);

--
-- Indexes for table `website_advisoryrating`
--
ALTER TABLE `website_advisoryrating`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_advisory_rating` (`advisory_service_id`,`user_id`),
  ADD KEY `website_advisoryrating_user_id_cda6879b_fk_auth_user_id` (`user_id`);

--
-- Indexes for table `website_advisoryservice`
--
ALTER TABLE `website_advisoryservice`
  ADD PRIMARY KEY (`id`),
  ADD KEY `website_advisoryserv_company_id_a325b0e2_fk_website_c` (`company_id`),
  ADD KEY `website_advisoryservice_created_by_id_d503d645_fk_auth_user_id` (`created_by_id`),
  ADD KEY `website_advisoryserv_price_terms_id_77d721f5_fk_website_a` (`price_terms_id`),
  ADD KEY `website_advisoryserv_service_type_id_8b9b5d47_fk_website_a` (`service_type_id`);

--
-- Indexes for table `website_advisoryserviceimage`
--
ALTER TABLE `website_advisoryserviceimage`
  ADD PRIMARY KEY (`id`),
  ADD KEY `website_advisoryserv_advisory_service_id_c72e2f97_fk_website_a` (`advisory_service_id`);

--
-- Indexes for table `website_advisoryservicetype`
--
ALTER TABLE `website_advisoryservicetype`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `key` (`key`),
  ADD UNIQUE KEY `name` (`name`);

--
-- Indexes for table `website_advisoryservice_advisory_sectors`
--
ALTER TABLE `website_advisoryservice_advisory_sectors`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `website_advisoryservice__advisoryservice_id_categ_45fb5fd4_uniq` (`advisoryservice_id`,`category_id`),
  ADD KEY `website_advisoryserv_category_id_d0b643ab_fk_website_c` (`category_id`);

--
-- Indexes for table `website_article`
--
ALTER TABLE `website_article`
  ADD PRIMARY KEY (`id`),
  ADD KEY `website_article_article_type_id_bf5c36ab_fk_website_category_id` (`article_type_id`),
  ADD KEY `website_article_created_by_id_ec0608f7_fk_auth_user_id` (`created_by_id`),
  ADD KEY `website_article_organization_id_cd0b442c_fk_website_customer_id` (`organization_id`);

--
-- Indexes for table `website_category`
--
ALTER TABLE `website_category`
  ADD PRIMARY KEY (`id`),
  ADD KEY `website_category_parent_id_ec40ff72_fk_website_category_id` (`parent_id`);

--
-- Indexes for table `website_customer`
--
ALTER TABLE `website_customer`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `user_id` (`user_id`);

--
-- Indexes for table `website_customermembershippayment`
--
ALTER TABLE `website_customermembershippayment`
  ADD PRIMARY KEY (`id`),
  ADD KEY `website_customermemb_customer_id_733528c3_fk_website_c` (`customer_id`);

--
-- Indexes for table `website_footermenucontent`
--
ALTER TABLE `website_footermenucontent`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `key` (`key`);

--
-- Indexes for table `website_partnerorganization`
--
ALTER TABLE `website_partnerorganization`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `website_slide`
--
ALTER TABLE `website_slide`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `website_software`
--
ALTER TABLE `website_software`
  ADD PRIMARY KEY (`id`),
  ADD KEY `website_software_created_by_id_7be061fd_fk_auth_user_id` (`created_by_id`),
  ADD KEY `website_software_developer_id_b76900d8_fk_website_customer_id` (`developer_id`),
  ADD KEY `website_software_program_type_id_cf3419b4_fk_website_category_id` (`program_type_id`);

--
-- Indexes for table `website_softwareimage`
--
ALTER TABLE `website_softwareimage`
  ADD PRIMARY KEY (`id`),
  ADD KEY `website_softwareimag_software_id_7cefe6c3_fk_website_s` (`software_id`);

--
-- Indexes for table `website_softwarerating`
--
ALTER TABLE `website_softwarerating`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_software_rating` (`software_id`,`user_id`),
  ADD KEY `website_softwarerating_user_id_180bee04_fk_auth_user_id` (`user_id`);

--
-- Indexes for table `website_software_advisory_sectors`
--
ALTER TABLE `website_software_advisory_sectors`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `website_software_advisor_software_id_category_id_33278790_uniq` (`software_id`,`category_id`),
  ADD KEY `website_software_adv_category_id_43f36982_fk_website_c` (`category_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `auth_group`
--
ALTER TABLE `auth_group`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `auth_group_permissions`
--
ALTER TABLE `auth_group_permissions`
  MODIFY `id` bigint NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `auth_permission`
--
ALTER TABLE `auth_permission`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=93;

--
-- AUTO_INCREMENT for table `auth_user`
--
ALTER TABLE `auth_user`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=44;

--
-- AUTO_INCREMENT for table `auth_user_groups`
--
ALTER TABLE `auth_user_groups`
  MODIFY `id` bigint NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `auth_user_user_permissions`
--
ALTER TABLE `auth_user_user_permissions`
  MODIFY `id` bigint NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `django_admin_log`
--
ALTER TABLE `django_admin_log`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `django_content_type`
--
ALTER TABLE `django_content_type`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=24;

--
-- AUTO_INCREMENT for table `django_migrations`
--
ALTER TABLE `django_migrations`
  MODIFY `id` bigint NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=38;

--
-- AUTO_INCREMENT for table `website_aboutsection`
--
ALTER TABLE `website_aboutsection`
  MODIFY `id` bigint NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `website_advisorylike`
--
ALTER TABLE `website_advisorylike`
  MODIFY `id` bigint NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `website_advisorypriceterm`
--
ALTER TABLE `website_advisorypriceterm`
  MODIFY `id` bigint NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `website_advisoryrating`
--
ALTER TABLE `website_advisoryrating`
  MODIFY `id` bigint NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `website_advisoryservice`
--
ALTER TABLE `website_advisoryservice`
  MODIFY `id` bigint NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=103;

--
-- AUTO_INCREMENT for table `website_advisoryserviceimage`
--
ALTER TABLE `website_advisoryserviceimage`
  MODIFY `id` bigint NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=311;

--
-- AUTO_INCREMENT for table `website_advisoryservicetype`
--
ALTER TABLE `website_advisoryservicetype`
  MODIFY `id` bigint NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `website_advisoryservice_advisory_sectors`
--
ALTER TABLE `website_advisoryservice_advisory_sectors`
  MODIFY `id` bigint NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=557;

--
-- AUTO_INCREMENT for table `website_article`
--
ALTER TABLE `website_article`
  MODIFY `id` bigint NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=123;

--
-- AUTO_INCREMENT for table `website_category`
--
ALTER TABLE `website_category`
  MODIFY `id` bigint NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=185;

--
-- AUTO_INCREMENT for table `website_customer`
--
ALTER TABLE `website_customer`
  MODIFY `id` bigint NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=40;

--
-- AUTO_INCREMENT for table `website_customermembershippayment`
--
ALTER TABLE `website_customermembershippayment`
  MODIFY `id` bigint NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `website_footermenucontent`
--
ALTER TABLE `website_footermenucontent`
  MODIFY `id` bigint NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `website_partnerorganization`
--
ALTER TABLE `website_partnerorganization`
  MODIFY `id` bigint NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `website_slide`
--
ALTER TABLE `website_slide`
  MODIFY `id` bigint NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `website_software`
--
ALTER TABLE `website_software`
  MODIFY `id` bigint NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=102;

--
-- AUTO_INCREMENT for table `website_softwareimage`
--
ALTER TABLE `website_softwareimage`
  MODIFY `id` bigint NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=124;

--
-- AUTO_INCREMENT for table `website_softwarerating`
--
ALTER TABLE `website_softwarerating`
  MODIFY `id` bigint NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `website_software_advisory_sectors`
--
ALTER TABLE `website_software_advisory_sectors`
  MODIFY `id` bigint NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=363;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `auth_group_permissions`
--
ALTER TABLE `auth_group_permissions`
  ADD CONSTRAINT `auth_group_permissio_permission_id_84c5c92e_fk_auth_perm` FOREIGN KEY (`permission_id`) REFERENCES `auth_permission` (`id`),
  ADD CONSTRAINT `auth_group_permissions_group_id_b120cbf9_fk_auth_group_id` FOREIGN KEY (`group_id`) REFERENCES `auth_group` (`id`);

--
-- Constraints for table `auth_permission`
--
ALTER TABLE `auth_permission`
  ADD CONSTRAINT `auth_permission_content_type_id_2f476e4b_fk_django_co` FOREIGN KEY (`content_type_id`) REFERENCES `django_content_type` (`id`);

--
-- Constraints for table `auth_user_groups`
--
ALTER TABLE `auth_user_groups`
  ADD CONSTRAINT `auth_user_groups_group_id_97559544_fk_auth_group_id` FOREIGN KEY (`group_id`) REFERENCES `auth_group` (`id`),
  ADD CONSTRAINT `auth_user_groups_user_id_6a12ed8b_fk_auth_user_id` FOREIGN KEY (`user_id`) REFERENCES `auth_user` (`id`);

--
-- Constraints for table `auth_user_user_permissions`
--
ALTER TABLE `auth_user_user_permissions`
  ADD CONSTRAINT `auth_user_user_permi_permission_id_1fbb5f2c_fk_auth_perm` FOREIGN KEY (`permission_id`) REFERENCES `auth_permission` (`id`),
  ADD CONSTRAINT `auth_user_user_permissions_user_id_a95ead1b_fk_auth_user_id` FOREIGN KEY (`user_id`) REFERENCES `auth_user` (`id`);

--
-- Constraints for table `django_admin_log`
--
ALTER TABLE `django_admin_log`
  ADD CONSTRAINT `django_admin_log_content_type_id_c4bce8eb_fk_django_co` FOREIGN KEY (`content_type_id`) REFERENCES `django_content_type` (`id`),
  ADD CONSTRAINT `django_admin_log_user_id_c564eba6_fk_auth_user_id` FOREIGN KEY (`user_id`) REFERENCES `auth_user` (`id`);

--
-- Constraints for table `website_advisorylike`
--
ALTER TABLE `website_advisorylike`
  ADD CONSTRAINT `website_advisorylike_advisory_service_id_486df9c3_fk_website_a` FOREIGN KEY (`advisory_service_id`) REFERENCES `website_advisoryservice` (`id`),
  ADD CONSTRAINT `website_advisorylike_user_id_e994542f_fk_auth_user_id` FOREIGN KEY (`user_id`) REFERENCES `auth_user` (`id`);

--
-- Constraints for table `website_advisoryrating`
--
ALTER TABLE `website_advisoryrating`
  ADD CONSTRAINT `website_advisoryrati_advisory_service_id_dc170a7c_fk_website_a` FOREIGN KEY (`advisory_service_id`) REFERENCES `website_advisoryservice` (`id`),
  ADD CONSTRAINT `website_advisoryrating_user_id_cda6879b_fk_auth_user_id` FOREIGN KEY (`user_id`) REFERENCES `auth_user` (`id`);

--
-- Constraints for table `website_advisoryservice`
--
ALTER TABLE `website_advisoryservice`
  ADD CONSTRAINT `website_advisoryserv_company_id_a325b0e2_fk_website_c` FOREIGN KEY (`company_id`) REFERENCES `website_customer` (`id`),
  ADD CONSTRAINT `website_advisoryserv_price_terms_id_77d721f5_fk_website_a` FOREIGN KEY (`price_terms_id`) REFERENCES `website_advisorypriceterm` (`id`),
  ADD CONSTRAINT `website_advisoryserv_service_type_id_8b9b5d47_fk_website_a` FOREIGN KEY (`service_type_id`) REFERENCES `website_advisoryservicetype` (`id`),
  ADD CONSTRAINT `website_advisoryservice_created_by_id_d503d645_fk_auth_user_id` FOREIGN KEY (`created_by_id`) REFERENCES `auth_user` (`id`);

--
-- Constraints for table `website_advisoryserviceimage`
--
ALTER TABLE `website_advisoryserviceimage`
  ADD CONSTRAINT `website_advisoryserv_advisory_service_id_c72e2f97_fk_website_a` FOREIGN KEY (`advisory_service_id`) REFERENCES `website_advisoryservice` (`id`);

--
-- Constraints for table `website_advisoryservice_advisory_sectors`
--
ALTER TABLE `website_advisoryservice_advisory_sectors`
  ADD CONSTRAINT `website_advisoryserv_advisoryservice_id_94bc48af_fk_website_a` FOREIGN KEY (`advisoryservice_id`) REFERENCES `website_advisoryservice` (`id`),
  ADD CONSTRAINT `website_advisoryserv_category_id_d0b643ab_fk_website_c` FOREIGN KEY (`category_id`) REFERENCES `website_category` (`id`);

--
-- Constraints for table `website_article`
--
ALTER TABLE `website_article`
  ADD CONSTRAINT `website_article_article_type_id_bf5c36ab_fk_website_category_id` FOREIGN KEY (`article_type_id`) REFERENCES `website_category` (`id`),
  ADD CONSTRAINT `website_article_created_by_id_ec0608f7_fk_auth_user_id` FOREIGN KEY (`created_by_id`) REFERENCES `auth_user` (`id`),
  ADD CONSTRAINT `website_article_organization_id_cd0b442c_fk_website_customer_id` FOREIGN KEY (`organization_id`) REFERENCES `website_customer` (`id`);

--
-- Constraints for table `website_category`
--
ALTER TABLE `website_category`
  ADD CONSTRAINT `website_category_parent_id_ec40ff72_fk_website_category_id` FOREIGN KEY (`parent_id`) REFERENCES `website_category` (`id`);

--
-- Constraints for table `website_customer`
--
ALTER TABLE `website_customer`
  ADD CONSTRAINT `website_customer_user_id_0b988af0_fk_auth_user_id` FOREIGN KEY (`user_id`) REFERENCES `auth_user` (`id`);

--
-- Constraints for table `website_customermembershippayment`
--
ALTER TABLE `website_customermembershippayment`
  ADD CONSTRAINT `website_customermemb_customer_id_733528c3_fk_website_c` FOREIGN KEY (`customer_id`) REFERENCES `website_customer` (`id`);

--
-- Constraints for table `website_software`
--
ALTER TABLE `website_software`
  ADD CONSTRAINT `website_software_created_by_id_7be061fd_fk_auth_user_id` FOREIGN KEY (`created_by_id`) REFERENCES `auth_user` (`id`),
  ADD CONSTRAINT `website_software_developer_id_b76900d8_fk_website_customer_id` FOREIGN KEY (`developer_id`) REFERENCES `website_customer` (`id`),
  ADD CONSTRAINT `website_software_program_type_id_cf3419b4_fk_website_category_id` FOREIGN KEY (`program_type_id`) REFERENCES `website_category` (`id`);

--
-- Constraints for table `website_softwareimage`
--
ALTER TABLE `website_softwareimage`
  ADD CONSTRAINT `website_softwareimag_software_id_7cefe6c3_fk_website_s` FOREIGN KEY (`software_id`) REFERENCES `website_software` (`id`);

--
-- Constraints for table `website_softwarerating`
--
ALTER TABLE `website_softwarerating`
  ADD CONSTRAINT `website_softwarerati_software_id_ced6be38_fk_website_s` FOREIGN KEY (`software_id`) REFERENCES `website_software` (`id`),
  ADD CONSTRAINT `website_softwarerating_user_id_180bee04_fk_auth_user_id` FOREIGN KEY (`user_id`) REFERENCES `auth_user` (`id`);

--
-- Constraints for table `website_software_advisory_sectors`
--
ALTER TABLE `website_software_advisory_sectors`
  ADD CONSTRAINT `website_software_adv_category_id_43f36982_fk_website_c` FOREIGN KEY (`category_id`) REFERENCES `website_category` (`id`),
  ADD CONSTRAINT `website_software_adv_software_id_81470cee_fk_website_s` FOREIGN KEY (`software_id`) REFERENCES `website_software` (`id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
