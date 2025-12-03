-- hxbox_with_data.sql
-- Schema + sample data migrated from hxbox.sql, adapted to current models
-- Includes new field: commodities.shipping_fee (set to NULL for existing samples)

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

-- ------------------------------------------------------
-- Drop existing tables (be careful)
-- ------------------------------------------------------
DROP TABLE IF EXISTS `order_items`;
DROP TABLE IF EXISTS `orders`;
DROP TABLE IF EXISTS `commodity_categories`;
DROP TABLE IF EXISTS `categories`;
DROP TABLE IF EXISTS `commodities`;
DROP TABLE IF EXISTS `users`;

-- ------------------------------------------------------
-- Table: users
-- ------------------------------------------------------
CREATE TABLE `users` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `username` VARCHAR(255) NOT NULL,
  `password` VARCHAR(255) NOT NULL,
  `role` TINYINT(1) DEFAULT 0,
  `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP(),
  `updated_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP() ON UPDATE CURRENT_TIMESTAMP(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- ------------------------------------------------------
-- Table: commodities (added shipping_fee)
-- ------------------------------------------------------
CREATE TABLE `commodities` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `title` VARCHAR(255) NOT NULL,
  `description` TEXT DEFAULT NULL,
  `price` DECIMAL(10,2) NOT NULL,
  `shipping_fee` DECIMAL(10,2) NULL,
  `original_price` DECIMAL(10,2) DEFAULT NULL,
  `promotion_price` DECIMAL(10,2) DEFAULT NULL,
  `is_on_promotion` TINYINT(1) DEFAULT 0,
  `discount_amount` DECIMAL(10,2) DEFAULT NULL,
  `stock` INT NOT NULL DEFAULT 0,
  `image_urls` VARCHAR(255) DEFAULT NULL,
  `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP(),
  `updated_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP() ON UPDATE CURRENT_TIMESTAMP(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- ------------------------------------------------------
-- Table: categories
-- ------------------------------------------------------
CREATE TABLE `categories` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(255) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- ------------------------------------------------------
-- Join Table: commodity_categories (many-to-many)
-- ------------------------------------------------------
CREATE TABLE `commodity_categories` (
  `commodity_id` INT NOT NULL,
  `category_id` INT NOT NULL,
  PRIMARY KEY (`commodity_id`, `category_id`),
  KEY `category_id` (`category_id`),
  CONSTRAINT `commodity_categories_ibfk_1` FOREIGN KEY (`commodity_id`) REFERENCES `commodities` (`id`) ON DELETE CASCADE,
  CONSTRAINT `commodity_categories_ibfk_2` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- ------------------------------------------------------
-- Table: orders
-- ------------------------------------------------------
CREATE TABLE `orders` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `order_no` VARCHAR(32) NOT NULL,
  `email` VARCHAR(255) NOT NULL,
  `country` VARCHAR(64) NOT NULL,
  `region` VARCHAR(128) NOT NULL,
  `address1` VARCHAR(255) NOT NULL,
  `address2` VARCHAR(255) DEFAULT NULL,
  `postal_code` VARCHAR(32) DEFAULT NULL,
  `phone` VARCHAR(64) DEFAULT NULL,
  `currency` VARCHAR(8) NOT NULL DEFAULT 'USD',
  `total_amount` DECIMAL(10,2) NOT NULL,
  `status` ENUM('PENDING','PAID','FULFILLING','SHIPPED','COMPLETED','CANCELED') NOT NULL DEFAULT 'PENDING',
  `paypal_order_id` VARCHAR(64) DEFAULT NULL,
  `paypal_capture_id` VARCHAR(64) DEFAULT NULL,
  `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP(),
  `updated_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP() ON UPDATE CURRENT_TIMESTAMP(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `order_no` (`order_no`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- ------------------------------------------------------
-- Table: order_items (no timestamps)
-- ------------------------------------------------------
CREATE TABLE `order_items` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `order_id` INT NOT NULL,
  `commodity_id` INT NOT NULL,
  `title_snapshot` VARCHAR(255) NOT NULL,
  `unit_price` DECIMAL(10,2) NOT NULL,
  `quantity` INT NOT NULL,
  `line_total` DECIMAL(10,2) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `order_id` (`order_id`),
  KEY `commodity_id` (`commodity_id`),
  CONSTRAINT `order_items_ibfk_1` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE,
  CONSTRAINT `order_items_ibfk_2` FOREIGN KEY (`commodity_id`) REFERENCES `commodities` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- ------------------------------------------------------
-- Seed data migrated from hxbox.sql (with shipping_fee=NULL)
-- ------------------------------------------------------

-- categories
LOCK TABLES `categories` WRITE;
INSERT INTO `categories` (`id`,`name`) VALUES
(6,'外饰改装'),
(2,'LED灯带'),
(3,'雾灯组件'),
(7,'工具配件'),
(1,'前保险杠'),
(4,'行李架'),
(5,'贴纸拉花');
UNLOCK TABLES;

-- commodities (insert includes shipping_fee=NULL after price)
LOCK TABLES `commodities` WRITE;
INSERT INTO `commodities` (`id`,`title`,`description`,`price`,`shipping_fee`,`original_price`,`promotion_price`,`is_on_promotion`,`discount_amount`,`stock`,`image_urls`,`created_at`,`updated_at`) VALUES
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
UNLOCK TABLES;

-- commodity_categories
LOCK TABLES `commodity_categories` WRITE;
INSERT INTO `commodity_categories` (`commodity_id`,`category_id`) VALUES
(1,1),(1,6),(2,2),(3,3),(4,4),(6,6),(7,6),(12,6),(13,5),(14,6),(15,7),(16,6),(17,6),(18,2),(19,7),(20,7),(21,7),(22,7),(23,2),(27,6),(28,5),(29,7);
UNLOCK TABLES;

-- users (admin account from hxbox.sql)
LOCK TABLES `users` WRITE;
INSERT INTO `users` (`id`,`username`,`password`,`role`,`created_at`,`updated_at`) VALUES
(1,'admina','$2b$10$g335De3ZQGbZ2iG3k7h45uT1WXw0oQFk9SCaJtL7lzWIct6N/7iPu',1,'2025-08-08 13:19:47','2025-08-08 13:19:47');
UNLOCK TABLES;

-- orders
LOCK TABLES `orders` WRITE;
INSERT INTO `orders` (`id`,`order_no`,`email`,`country`,`region`,`address1`,`address2`,`postal_code`,`phone`,`currency`,`total_amount`,`status`,`paypal_order_id`,`paypal_capture_id`,`created_at`,`updated_at`) VALUES
(1,'20251017-000001','buyer1@example.com','CN','Guangdong','天河区体育东路100号',NULL,'510000','13800000000','USD',199.00,'PAID','TESTPAYPALORDERID1','TESTPAYPALCAPTUREID1','2025-10-17 09:00:00','2025-10-17 09:05:00'),
(2,'20251017-000002','buyer2@example.com','US','CA','1 Infinite Loop',NULL,'95014',NULL,'USD',49.00,'PENDING',NULL,NULL,'2025-10-17 09:10:00','2025-10-17 09:10:00');
UNLOCK TABLES;

-- order_items
LOCK TABLES `order_items` WRITE;
INSERT INTO `order_items` (`id`,`order_id`,`commodity_id`,`title_snapshot`,`unit_price`,`quantity`,`line_total`) VALUES
(1,1,1,'卡车前保险杠',199.00,1,199.00),
(2,2,2,'LED灯带套件',49.00,1,49.00);
UNLOCK TABLES;

/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;
/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;
