/*
  Warnings:

  - You are about to drop the column `accessActive` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `accessUntil` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `emailVerified` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `image` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `role` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `User` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "CourseFormat" AS ENUM ('ONLINE', 'PRESENCIAL');

-- CreateEnum
CREATE TYPE "UserType" AS ENUM ('ALUNO', 'PAI', 'PROFESSOR', 'OUTRO');

-- DropIndex
DROP INDEX "Enrollment_userId_courseId_key";

-- AlterTable
ALTER TABLE "Course" ADD COLUMN     "format" "CourseFormat" NOT NULL DEFAULT 'ONLINE';

-- AlterTable
ALTER TABLE "User" DROP COLUMN "accessActive",
DROP COLUMN "accessUntil",
DROP COLUMN "emailVerified",
DROP COLUMN "image",
DROP COLUMN "role",
DROP COLUMN "updatedAt",
ADD COLUMN     "phone" TEXT,
ADD COLUMN     "schoolName" TEXT,
ADD COLUMN     "userType" "UserType" NOT NULL DEFAULT 'ALUNO',
ALTER COLUMN "email" DROP NOT NULL;
