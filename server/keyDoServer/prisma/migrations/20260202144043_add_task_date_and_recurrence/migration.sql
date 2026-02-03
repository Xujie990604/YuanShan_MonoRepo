-- AlterTable
ALTER TABLE "tasks" ADD COLUMN     "due_date" TIMESTAMP(3),
ADD COLUMN     "is_all_day" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "recurrence" TEXT;

-- CreateIndex
CREATE INDEX "tasks_user_id_due_date_idx" ON "tasks"("user_id", "due_date");
