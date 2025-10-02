/*
  Warnings:

  - Added the required column `payer_name` to the `payments` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."payments" ADD COLUMN     "payer_name" TEXT NOT NULL;
