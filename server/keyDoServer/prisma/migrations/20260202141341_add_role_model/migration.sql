-- CreateTable
CREATE TABLE "roles" (
    "id" TEXT NOT NULL,
    "user_id" INTEGER NOT NULL,
    "name" VARCHAR(50) NOT NULL,
    "icon" VARCHAR(10) NOT NULL,
    "color" VARCHAR(20) NOT NULL,
    "manifesto" VARCHAR(200) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "roles_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "roles_user_id_idx" ON "roles"("user_id");

-- AddForeignKey
ALTER TABLE "roles" ADD CONSTRAINT "roles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AlterTable
ALTER TABLE "tasks" ADD COLUMN "role_id" TEXT;

-- CreateIndex
CREATE INDEX "tasks_user_id_role_id_idx" ON "tasks"("user_id", "role_id");

-- AddForeignKey
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "roles"("id") ON DELETE SET NULL ON UPDATE CASCADE;
