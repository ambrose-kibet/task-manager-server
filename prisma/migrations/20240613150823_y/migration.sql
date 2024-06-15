/*
  Warnings:

  - You are about to drop the column `isCompleted` on the `tasks` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "tasks" DROP COLUMN "isCompleted",
ADD COLUMN     "is_completed" TIMESTAMP(3);
