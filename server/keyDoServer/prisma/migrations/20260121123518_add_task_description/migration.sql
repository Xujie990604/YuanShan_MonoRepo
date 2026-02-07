-- AlterTable（IF NOT EXISTS 避免列已存在时报错，便于迁移失败后重跑）
ALTER TABLE "tasks" ADD COLUMN IF NOT EXISTS "description" TEXT;
