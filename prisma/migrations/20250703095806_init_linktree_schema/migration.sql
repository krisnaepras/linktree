/*
  Warnings:

  - You are about to drop the column `icon` on the `detail_linktrees` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "categories" ADD COLUMN     "icon" TEXT;

-- AlterTable
ALTER TABLE "detail_linktrees" DROP COLUMN "icon";
