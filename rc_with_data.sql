/*M!999999\- enable the sandbox mode */ 
-- MariaDB dump 10.19-11.7.2-MariaDB, for osx10.20 (arm64)
--
-- Host: localhost    Database: physical_trading
-- ------------------------------------------------------
-- Server version	11.7.2-MariaDB

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*M!100616 SET @OLD_NOTE_VERBOSITY=@@NOTE_VERBOSITY, NOTE_VERBOSITY=0 */;

--
-- Current Database: `physical_trading`
--

CREATE DATABASE /*!32312 IF NOT EXISTS*/ `physical_trading` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci */;

USE `physical_trading`;

--
-- Table structure for table `categories`
--

DROP TABLE IF EXISTS `categories`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `categories` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`),
  UNIQUE KEY `name_2` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `categories`
--

LOCK TABLES `categories` WRITE;
/*!40000 ALTER TABLE `categories` DISABLE KEYS */;
INSERT INTO `categories` VALUES
(2,'LED灯带'),
(1,'前保险杠'),
(6,'外饰改装'),
(7,'工具配件'),
(4,'行李架'),
(5,'贴纸拉花'),
(3,'雾灯组件');
/*!40000 ALTER TABLE `categories` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `commodities`
--

DROP TABLE IF EXISTS `commodities`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `commodities` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `title` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `price` decimal(10,2) NOT NULL,
  `shipping_fee` decimal(10,2) DEFAULT NULL,
  `original_price` decimal(10,2) DEFAULT NULL,
  `promotion_price` decimal(10,2) DEFAULT NULL,
  `is_on_promotion` tinyint(1) DEFAULT 0,
  `discount_amount` decimal(10,2) DEFAULT NULL,
  `stock` int(11) NOT NULL DEFAULT 0,
  `image_urls` text DEFAULT NULL,
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=30 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `commodities`
--

LOCK TABLES `commodities` WRITE;
/*!40000 ALTER TABLE `commodities` DISABLE KEYS */;
INSERT INTO `commodities` VALUES
(1,'卡车前保险杠','合金材质前保险杠，适配多款模型卡车，提升防护与外观',199.00,NULL,239.00,179.00,1,NULL,40,'image_bumper.jpg','2025-08-01 03:56:32','2025-10-18 02:00:00'),
(2,'LED灯带套件','含控制器与延长线，支持多种灯效，适配1:10模型',49.00,NULL,NULL,NULL,0,NULL,150,'image_ledstrip.jpg','2025-08-01 03:56:32','2025-10-18 02:00:00'),
(3,'雾灯组件','高亮雾灯组，含支架与线束，防水设计',59.00,NULL,69.00,55.00,1,NULL,120,'image_foglight.jpg','2025-08-01 03:56:32','2025-10-18 02:00:00'),
(4,'车顶行李架','轻量化行李架，提供额外扩展安装位',89.00,NULL,NULL,NULL,0,NULL,60,'image_roofrack.jpg','2025-08-01 03:56:32','2025-10-18 02:00:00'),
(6,'外饰装饰条','碳纤维纹理，自带背胶，易于安装',19.00,NULL,NULL,NULL,0,NULL,300,'image_trim.jpg','2025-08-01 03:56:32','2025-10-18 02:00:00'),
(7,'牵引钩模型','铝合金牵引钩，坚固耐用',29.00,NULL,NULL,NULL,0,NULL,180,'image_towhook.jpg','2025-08-01 03:56:32','2025-10-18 02:00:00'),
(12,'轮眉护板','轮眉保护护板，防刮花',25.00,NULL,NULL,NULL,0,NULL,220,'image_fender.jpg','2025-08-01 03:56:32','2025-10-18 02:00:00'),
(13,'装饰贴纸套装','高粘性车身拉花贴纸，多款图案',15.00,NULL,NULL,NULL,0,NULL,500,'image_sticker.jpg','2025-08-01 03:56:32','2025-10-18 02:00:00'),
(14,'保险杠护角','保险杠护角（两只装）',32.00,NULL,NULL,NULL,0,NULL,140,'image_corner.jpg','2025-08-01 03:56:32','2025-10-18 02:00:00'),
(15,'改装螺丝套件','不锈钢螺丝与垫片组合',12.00,NULL,NULL,NULL,0,NULL,800,'image_screws.jpg','2025-08-01 03:56:32','2025-10-18 02:00:00'),
(16,'灯罩保护网','防护灯罩网，金属材质',22.00,NULL,NULL,NULL,0,NULL,160,'image_grill.jpg','2025-08-01 03:56:32','2025-10-18 02:00:00'),
(17,'避震塔支架','铝合金避震塔支架，提升稳定性',49.00,NULL,NULL,NULL,0,NULL,90,'image_shockmount.jpg','2025-08-01 03:56:32','2025-10-18 02:00:00'),
(18,'电源延长线','LED电源延长线，30cm',5.00,NULL,NULL,NULL,0,NULL,400,'image_cable.jpg','2025-08-01 03:56:32','2025-10-18 02:00:00'),
(19,'遥控器手绳','遥控器挂绳/手绳',8.00,NULL,NULL,NULL,0,NULL,350,'image_strap.jpg','2025-08-01 03:56:32','2025-10-18 02:00:00'),
(20,'收纳工具包','多隔层工具收纳包',39.00,NULL,NULL,NULL,0,NULL,70,'image_toolbag.jpg','2025-08-01 03:56:32','2025-10-18 02:00:00'),
(21,'安装卡扣套装','万能卡扣组合，便于固定线束',10.00,NULL,NULL,NULL,0,NULL,600,'image_clips.jpg','2025-08-01 03:56:32','2025-10-18 02:00:00'),
(22,'贴膜刮板','贴膜专用刮板工具',6.00,NULL,NULL,NULL,0,NULL,500,'image_squeegee.jpg','2025-08-01 03:56:32','2025-10-18 02:00:00'),
(23,'灯带分线器','LED灯带分线器，1拖4',9.00,NULL,NULL,NULL,0,NULL,260,'image_splitter.jpg','2025-08-01 03:56:32','2025-10-18 02:00:00'),
(27,'减震弹簧','改装弹簧（软/中/硬可选）',19.00,NULL,NULL,NULL,1,NULL,120,'image_spring.jpg','2025-08-27 07:56:48','2025-10-18 02:00:00'),
(28,'车身贴纸套装','车身贴纸/拉花套装',18.00,NULL,NULL,NULL,0,NULL,999,'image_sticker2.jpg','2025-08-27 08:11:43','2025-10-18 02:00:00'),
(29,'改装工具套件','模型改装工具基础套装',99.00,NULL,120.00,NULL,0,NULL,8,'image_toolkit.jpg','2025-08-27 08:21:42','2025-10-18 02:00:00');
/*!40000 ALTER TABLE `commodities` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `commodity_categories`
--

DROP TABLE IF EXISTS `commodity_categories`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `commodity_categories` (
  `commodity_id` int(11) NOT NULL,
  `category_id` int(11) NOT NULL,
  PRIMARY KEY (`commodity_id`,`category_id`),
  KEY `category_id` (`category_id`),
  CONSTRAINT `commodity_categories_ibfk_1` FOREIGN KEY (`commodity_id`) REFERENCES `commodities` (`id`) ON DELETE CASCADE,
  CONSTRAINT `commodity_categories_ibfk_2` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `commodity_categories`
--

LOCK TABLES `commodity_categories` WRITE;
/*!40000 ALTER TABLE `commodity_categories` DISABLE KEYS */;
INSERT INTO `commodity_categories` VALUES
(1,1),
(2,2),
(18,2),
(23,2),
(3,3),
(4,4),
(13,5),
(28,5),
(1,6),
(6,6),
(7,6),
(12,6),
(14,6),
(16,6),
(17,6),
(27,6),
(15,7),
(19,7),
(20,7),
(21,7),
(22,7),
(29,7);
/*!40000 ALTER TABLE `commodity_categories` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `order_items`
--

DROP TABLE IF EXISTS `order_items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `order_items` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `order_id` int(11) NOT NULL,
  `commodity_id` int(11) NOT NULL,
  `title_snapshot` varchar(255) NOT NULL,
  `unit_price` decimal(10,2) NOT NULL,
  `quantity` int(11) NOT NULL,
  `line_total` decimal(10,2) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `order_id` (`order_id`),
  KEY `commodity_id` (`commodity_id`),
  CONSTRAINT `order_items_ibfk_1` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE,
  CONSTRAINT `order_items_ibfk_2` FOREIGN KEY (`commodity_id`) REFERENCES `commodities` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `order_items`
--

LOCK TABLES `order_items` WRITE;
/*!40000 ALTER TABLE `order_items` DISABLE KEYS */;
INSERT INTO `order_items` VALUES
(1,1,1,'卡车前保险杠',199.00,1,199.00),
(2,2,2,'LED灯带套件',49.00,1,49.00);
/*!40000 ALTER TABLE `order_items` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `orders`
--

DROP TABLE IF EXISTS `orders`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `orders` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `order_no` varchar(32) NOT NULL,
  `email` varchar(255) NOT NULL,
  `country` varchar(64) NOT NULL,
  `region` varchar(128) NOT NULL,
  `address1` varchar(255) NOT NULL,
  `address2` varchar(255) DEFAULT NULL,
  `postal_code` varchar(32) DEFAULT NULL,
  `phone` varchar(64) DEFAULT NULL,
  `currency` varchar(8) NOT NULL DEFAULT 'USD',
  `total_amount` decimal(10,2) NOT NULL,
  `status` enum('PENDING','PAID','FULFILLING','SHIPPED','COMPLETED','CANCELED') NOT NULL DEFAULT 'PENDING',
  `paypal_order_id` varchar(64) DEFAULT NULL,
  `paypal_capture_id` varchar(64) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `order_no` (`order_no`),
  UNIQUE KEY `order_no_2` (`order_no`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `orders`
--

LOCK TABLES `orders` WRITE;
/*!40000 ALTER TABLE `orders` DISABLE KEYS */;
INSERT INTO `orders` VALUES
(1,'20251017-000001','buyer1@example.com','CN','Guangdong','天河区体育东路100号',NULL,'510000','13800000000','USD',199.00,'PAID','TESTPAYPALORDERID1','TESTPAYPALCAPTUREID1','2025-10-17 09:00:00','2025-10-17 09:05:00'),
(2,'20251017-000002','buyer2@example.com','US','CA','1 Infinite Loop',NULL,'95014',NULL,'USD',49.00,'PENDING',NULL,NULL,'2025-10-17 09:10:00','2025-10-17 09:10:00');
/*!40000 ALTER TABLE `orders` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `username` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role` tinyint(1) NOT NULL DEFAULT 0,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`),
  UNIQUE KEY `username_2` (`username`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES
(1,'admina','$2b$10$g335De3ZQGbZ2iG3k7h45uT1WXw0oQFk9SCaJtL7lzWIct6N/7iPu',1,'2025-08-08 13:19:47','2025-08-08 13:19:47');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*M!100616 SET NOTE_VERBOSITY=@OLD_NOTE_VERBOSITY */;

-- Dump completed on 2025-12-03 14:22:01
