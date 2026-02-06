/*
  Warnings:

  - You are about to drop the column `is_all_day` on the `tasks` table. All the data in the column will be lost.
  - The `due_date` column on the `tasks` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "tasks" DROP COLUMN "is_all_day",
ADD COLUMN     "due_time" VARCHAR(5),
DROP COLUMN "due_date",
ADD COLUMN     "due_date" VARCHAR(10);

-- CreateIndex
CREATE INDEX "tasks_user_id_due_date_idx" ON "tasks"("user_id", "due_date");
