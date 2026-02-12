/*
  Warnings:

  - A unique constraint covering the columns `[tutorId,day,startTime,endTime]` on the table `Availability` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Availability_tutorId_day_startTime_endTime_key" ON "Availability"("tutorId", "day", "startTime", "endTime");
