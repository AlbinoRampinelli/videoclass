/*
  Warnings:

  - You are about to drop the column `accessActive` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `accessUntil` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `emailVerified` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `image` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `role` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `User` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "UserType" AS ENUM ('ALUNO', 'PAI', 'PROFESSOR', 'OUTRO');

-- DropIndex
DROP INDEX IF EXISTS "Enrollment_userId_courseId_key";
-- AlterTable
ALTER TABLE "User" DROP COLUMN IF EXISTS "accessActive",
DROP COLUMN  IF EXISTS "accessUntil",
DROP COLUMN  IF EXISTS "createdAt",
DROP COLUMN  IF EXISTS "emailVerified",
DROP COLUMN  IF EXISTS "image",
DROP COLUMN  IF EXISTS "role",
DROP COLUMN  IF EXISTS "updatedAt",
ADD COLUMN  IF NOT EXISTS   "phone" TEXT,
ADD COLUMN   IF NOT EXISTS  "schoolName" TEXT,
ADD COLUMN  IF NOT EXISTS   "userType" "UserType" NOT NULL DEFAULT 'ALUNO',
ALTER COLUMN "email" DROP NOT NULL;
