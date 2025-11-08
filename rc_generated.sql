-- hxbox_generated.sql
-- Schema generated from current Sequelize models (users, commodities, categories, commodity_categories, orders, order_items)
-- Includes new field: commodities.shipping_fee
-- NOTE: This will DROP and recreate tables. Backup your data before running.

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
  `username` VARCHAR(255) NOT NULL UNIQUE,
  `password` VARCHAR(255) NOT NULL,
  `role` TINYINT(1) NOT NULL DEFAULT 0,
  `created_at` DATETIME NULL,
  `updated_at` DATETIME NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- ------------------------------------------------------
-- Table: commodities
-- ------------------------------------------------------
CREATE TABLE `commodities` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `title` VARCHAR(255) NOT NULL,
  `description` TEXT NULL,
  `price` DECIMAL(10,2) NOT NULL,
  `shipping_fee` DECIMAL(10,2) NULL,
  `original_price` DECIMAL(10,2) NULL,
  `promotion_price` DECIMAL(10,2) NULL,
  `is_on_promotion` TINYINT(1) NOT NULL DEFAULT 0,
  `discount_amount` DECIMAL(10,2) NULL,
  `stock` INT NOT NULL DEFAULT 0,
  `image_urls` VARCHAR(255) NULL,
  `created_at` DATETIME NULL,
  `updated_at` DATETIME NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- ------------------------------------------------------
-- Table: categories
-- ------------------------------------------------------
CREATE TABLE `categories` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(255) NOT NULL UNIQUE,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- ------------------------------------------------------
-- Join Table: commodity_categories (many-to-many)
-- ------------------------------------------------------
CREATE TABLE `commodity_categories` (
  `commodity_id` INT NOT NULL,
  `category_id` INT NOT NULL,
  PRIMARY KEY (`commodity_id`, `category_id`),
  KEY `idx_cc_category_id` (`category_id`),
  CONSTRAINT `fk_cc_commodity` FOREIGN KEY (`commodity_id`) REFERENCES `commodities`(`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_cc_category` FOREIGN KEY (`category_id`) REFERENCES `categories`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- ------------------------------------------------------
-- Table: orders
-- ------------------------------------------------------
CREATE TABLE `orders` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `order_no` VARCHAR(32) UNIQUE,
  `email` VARCHAR(255) NOT NULL,
  `country` VARCHAR(64) NOT NULL,
  `region` VARCHAR(128) NOT NULL,
  `address1` VARCHAR(255) NOT NULL,
  `address2` VARCHAR(255) NULL,
  `postal_code` VARCHAR(32) NULL,
  `phone` VARCHAR(64) NULL,
  `currency` VARCHAR(8) NOT NULL DEFAULT 'USD',
  `total_amount` DECIMAL(10,2) NOT NULL,
  `status` ENUM('PENDING','PAID','FULFILLING','SHIPPED','COMPLETED','CANCELED') NOT NULL DEFAULT 'PENDING',
  `paypal_order_id` VARCHAR(64) NULL,
  `paypal_capture_id` VARCHAR(64) NULL,
  `created_at` DATETIME NULL,
  `updated_at` DATETIME NULL,
  PRIMARY KEY (`id`)
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
-- Optional seed data (leave empty or add your own)
-- ------------------------------------------------------
-- INSERT INTO `users` (`username`, `password`, `role`, `created_at`, `updated_at`) VALUES
-- ('admin', '$2b$10$REPLACE_WITH_BCRYPT_HASH', 1, NOW(), NOW());

-- INSERT INTO `categories` (`name`) VALUES
-- ('默认分类');

-- INSERT INTO `commodities` (`title`, `description`, `price`, `shipping_fee`, `original_price`, `promotion_price`, `is_on_promotion`, `discount_amount`, `stock`, `image_urls`, `created_at`, `updated_at`) VALUES
-- ('示例商品', '描述', 10.00, 2.50, 6.00, NULL, 0, NULL, 100, NULL, NOW(), NOW());

-- INSERT INTO `commodity_categories` (`commodity_id`, `category_id`) VALUES
-- (1,1);

-- ------------------------------------------------------
-- Replace order_items data with your real DB contents
-- You can export only data for order_items from your current DB with:
--   mysqldump -u <user> -p --no-create-info --skip-triggers <db_name> order_items >> hxbox_generated.sql
-- Or paste the generated INSERTs below:
-- Example:
-- INSERT INTO `order_items` (`id`,`order_id`,`commodity_id`,`title_snapshot`,`unit_price`,`quantity`,`line_total`) VALUES

/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;
/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;
