CREATE TABLE `orders` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `external_id` VARCHAR(191) NOT NULL,
  `idempotency_key` VARCHAR(191) NOT NULL,
  `status` ENUM('RECEIVED', 'PROCESSING', 'ENRICHED', 'FAILED_ENRICHMENT') NOT NULL DEFAULT 'RECEIVED',
  `customer_email` VARCHAR(191) NOT NULL,
  `customer_name` VARCHAR(191) NOT NULL,
  `currency` VARCHAR(191) NOT NULL,
  `items` JSON NOT NULL,
  `enrichment_data` JSON NULL,
  `error_message` TEXT NULL,
  `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` DATETIME(3) NOT NULL,

  UNIQUE INDEX `orders_external_id_key`(`external_id`),
  UNIQUE INDEX `orders_idempotency_key_key`(`idempotency_key`),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
