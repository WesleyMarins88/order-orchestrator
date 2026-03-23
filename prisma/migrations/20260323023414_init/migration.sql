/*
  Warnings:

  - You are about to drop the column `enrichment_data` on the `orders` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `orders` DROP COLUMN `enrichment_data`,
    ADD COLUMN `exchange_data` JSON NULL;
