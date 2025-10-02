/*
  Warnings:

  - Added the required column `type` to the `payments` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."payments" ADD COLUMN     "payment_segment" TEXT,
ADD COLUMN     "type" "public"."PaymentType" NOT NULL;
