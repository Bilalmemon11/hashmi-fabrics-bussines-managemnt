-- ====================================================================
-- HASHMI FABRICS BUSINESS SUITE - MYSQL DATABASE SCHEMA
-- ====================================================================
-- Use this script to import the database structure into MySQL/phpMyAdmin.

SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS `customer_payments`;
DROP TABLE IF EXISTS `vendor_payments`;
DROP TABLE IF EXISTS `invoice_items`;
DROP TABLE IF EXISTS `invoices`;
DROP TABLE IF EXISTS `purchases`;
DROP TABLE IF EXISTS `expenses`;
DROP TABLE IF EXISTS `products`;
DROP TABLE IF EXISTS `vendors`;
DROP TABLE IF EXISTS `customers`;
SET FOREIGN_KEY_CHECKS = 1;

-- 1. Customers Table (Ledgers)
CREATE TABLE `customers` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `phone` varchar(50) DEFAULT NULL,
  `type` enum('retail', 'wholesale') NOT NULL DEFAULT 'retail',
  `balance` decimal(15,2) NOT NULL DEFAULT '0.00' COMMENT 'Positive balance means customer owes money (Receivable)',
  `total_purchase` decimal(15,2) NOT NULL DEFAULT '0.00',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Vendors Table (Suppliers/Mills)
CREATE TABLE `vendors` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `phone` varchar(50) DEFAULT NULL,
  `city` varchar(100) DEFAULT NULL,
  `balance` decimal(15,2) NOT NULL DEFAULT '0.00' COMMENT 'Positive balance means we owe vendor money (Payable)',
  `total_purchase` decimal(15,2) NOT NULL DEFAULT '0.00',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Products Table (Inventory Catalog)
CREATE TABLE `products` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `category` varchar(100) NOT NULL,
  `price` decimal(15,2) NOT NULL COMMENT 'Retail Selling Price',
  `cost_price` decimal(15,2) NOT NULL COMMENT 'Purchase Cost Price',
  `stock_qty` int(11) NOT NULL DEFAULT '0',
  `unit` varchar(50) NOT NULL DEFAULT 'meters',
  `reorder_level` int(11) NOT NULL DEFAULT '5',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. Invoices Table (Fabric Billing)
CREATE TABLE `invoices` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `invoice_no` varchar(50) NOT NULL,
  `customer_id` bigint(20) unsigned NOT NULL,
  `date` date NOT NULL,
  `subtotal` decimal(15,2) NOT NULL,
  `discount` decimal(15,2) NOT NULL DEFAULT '0.00',
  `total` decimal(15,2) NOT NULL,
  `paid` decimal(15,2) NOT NULL DEFAULT '0.00',
  `balance` decimal(15,2) NOT NULL DEFAULT '0.00' COMMENT 'Remaining credit balance on this invoice',
  `payment_type` enum('cash', 'credit') NOT NULL DEFAULT 'cash',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `invoice_no_unique` (`invoice_no`),
  KEY `invoices_customer_id_foreign` (`customer_id`),
  CONSTRAINT `invoices_customer_id_foreign` FOREIGN KEY (`customer_id`) REFERENCES `customers` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. Invoice Items Table
CREATE TABLE `invoice_items` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `invoice_id` bigint(20) unsigned NOT NULL,
  `product_id` bigint(20) unsigned NOT NULL,
  `qty` int(11) NOT NULL,
  `unit_price` decimal(15,2) NOT NULL,
  `total` decimal(15,2) NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `invoice_items_invoice_id_foreign` (`invoice_id`),
  KEY `invoice_items_product_id_foreign` (`product_id`),
  CONSTRAINT `invoice_items_invoice_id_foreign` FOREIGN KEY (`invoice_id`) REFERENCES `invoices` (`id`) ON DELETE CASCADE,
  CONSTRAINT `invoice_items_product_id_foreign` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. Purchases Table (Stock Purchases from Suppliers)
CREATE TABLE `purchases` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `po_no` varchar(50) NOT NULL,
  `vendor_id` bigint(20) unsigned NOT NULL,
  `date` date NOT NULL,
  `items_description` text DEFAULT NULL,
  `total` decimal(15,2) NOT NULL,
  `paid` decimal(15,2) NOT NULL DEFAULT '0.00',
  `balance` decimal(15,2) NOT NULL DEFAULT '0.00',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `purchases_vendor_id_foreign` (`vendor_id`),
  CONSTRAINT `purchases_vendor_id_foreign` FOREIGN KEY (`vendor_id`) REFERENCES `vendors` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 7. Expenses Table
CREATE TABLE `expenses` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `date` date NOT NULL,
  `category` varchar(100) NOT NULL,
  `description` text DEFAULT NULL,
  `amount` decimal(15,2) NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 8. Vendor Payments Table
CREATE TABLE `vendor_payments` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `vendor_id` bigint(20) unsigned NOT NULL,
  `amount` decimal(15,2) NOT NULL,
  `date` date NOT NULL,
  `notes` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `vendor_payments_vendor_id_foreign` (`vendor_id`),
  CONSTRAINT `vendor_payments_vendor_id_foreign` FOREIGN KEY (`vendor_id`) REFERENCES `vendors` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 9. Customer Payments Table
CREATE TABLE `customer_payments` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `customer_id` bigint(20) unsigned NOT NULL,
  `invoice_id` bigint(20) unsigned DEFAULT NULL,
  `amount` decimal(15,2) NOT NULL,
  `date` date NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `customer_payments_customer_id_foreign` (`customer_id`),
  KEY `customer_payments_invoice_id_foreign` (`invoice_id`),
  CONSTRAINT `customer_payments_customer_id_foreign` FOREIGN KEY (`customer_id`) REFERENCES `customers` (`id`) ON DELETE CASCADE,
  CONSTRAINT `customer_payments_invoice_id_foreign` FOREIGN KEY (`invoice_id`) REFERENCES `invoices` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ====================================================================
-- SEED DATA
-- ====================================================================

INSERT INTO `products` (`id`, `name`, `category`, `price`, `cost_price`, `stock_qty`, `unit`, `reorder_level`) VALUES
(1, 'Lawn Fabric 3m', 'Lawn', 850.00, 550.00, 45, 'meters', 10),
(2, 'Khaddar Suit Piece', 'Khaddar', 1200.00, 750.00, 28, 'pcs', 8),
(3, 'Chiffon Dupatta', 'Chiffon', 650.00, 380.00, 62, 'pcs', 15),
(4, 'Cotton Shirting 5m', 'Cotton', 1100.00, 680.00, 7, 'meters', 10),
(5, 'Silk Fabric 2m', 'Silk', 2200.00, 1500.00, 18, 'meters', 5),
(6, 'Embroidered Panel', 'Embroidery', 3500.00, 2200.00, 12, 'pcs', 4);

INSERT INTO `customers` (`id`, `name`, `phone`, `type`, `balance`, `total_purchase`) VALUES
(1, 'Ayesha Khan', '0300-1234567', 'retail', 0.00, 12500.00),
(2, 'Fatima Traders', '0321-9876543', 'wholesale', 8500.00, 48000.00),
(3, 'Zubaida Begum', '0333-5557890', 'retail', 2200.00, 7800.00),
(4, 'Style Point Shop', '0312-4443321', 'wholesale', 15000.00, 95000.00),
(5, 'Nazia Textile', '0345-1119988', 'wholesale', 0.00, 32000.00);

INSERT INTO `vendors` (`id`, `name`, `phone`, `city`, `balance`, `total_purchase`) VALUES
(1, 'Al-Rehman Cloth House', '042-3456789', 'Lahore', 22000.00, 150000.00),
(2, 'Chenab Fabrics', '041-7788990', 'Faisalabad', 0.00, 85000.00),
(3, 'Karachi Silk Mills', '021-3344556', 'Karachi', 45000.00, 220000.00),
(4, 'Punjab Weaving Co', '042-9988776', 'Lahore', 8500.00, 65000.00);
