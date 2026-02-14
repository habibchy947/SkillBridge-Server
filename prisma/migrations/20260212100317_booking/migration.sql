-- AlterTable
ALTER TABLE "Booking" ALTER COLUMN "price" SET DEFAULT 0;

-- AddForeignKey
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
