/*
  Warnings:

  - You are about to alter the column `rating` on the `Review` table. The data in that column could be lost. The data in that column will be cast from `Integer` to `SmallInt`.
  - You are about to alter the column `comment` on the `Review` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(300)`.
  - Added the required column `updatedAt` to the `Review` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "Review_bookingId_idx";

-- DropIndex
DROP INDEX "Review_tutorId_idx";

-- AlterTable
ALTER TABLE "Review" ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ALTER COLUMN "rating" SET DATA TYPE SMALLINT,
ALTER COLUMN "comment" SET DATA TYPE VARCHAR(300);

-- AlterTable
ALTER TABLE "tutors" ADD COLUMN     "totalReviews" INTEGER NOT NULL DEFAULT 0;

-- CreateIndex
CREATE INDEX "Review_tutorId_createdAt_idx" ON "Review"("tutorId", "createdAt");

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
