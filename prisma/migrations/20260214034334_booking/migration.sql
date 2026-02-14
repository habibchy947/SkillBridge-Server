/*
  Warnings:

  - A unique constraint covering the columns `[tutorId,availabilityId,sessionTime]` on the table `Booking` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `availabilityId` to the `Booking` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "Booking_tutorId_sessionTime_key";

-- AlterTable
ALTER TABLE "Booking" ADD COLUMN     "availabilityId" TEXT NOT NULL,
ALTER COLUMN "price" DROP DEFAULT,
ALTER COLUMN "price" SET DATA TYPE DOUBLE PRECISION;

-- CreateIndex
CREATE UNIQUE INDEX "Booking_tutorId_availabilityId_sessionTime_key" ON "Booking"("tutorId", "availabilityId", "sessionTime");

-- AddForeignKey
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_availabilityId_fkey" FOREIGN KEY ("availabilityId") REFERENCES "Availability"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
