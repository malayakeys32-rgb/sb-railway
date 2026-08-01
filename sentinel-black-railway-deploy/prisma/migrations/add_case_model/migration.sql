-- CreateEnum
CREATE TYPE "CaseStatus" AS ENUM ('OPEN', 'ACTIVE', 'ESCALATED', 'CLOSED');

-- CreateEnum
CREATE TYPE "CaseCategory" AS ENUM ('INFESTATION', 'LANDLORD_NEGLIGENCE', 'HARASSMENT', 'WORKPLACE', 'SAFETY', 'OTHER');

-- CreateEnum
CREATE TYPE "CaseSeverity" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');

-- CreateTable
CREATE TABLE "cases" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "category" "CaseCategory" NOT NULL,
    "status" "CaseStatus" NOT NULL DEFAULT 'OPEN',
    "severity" "CaseSeverity" NOT NULL DEFAULT 'LOW',
    "location" TEXT NOT NULL,
    "ownerUserId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cases_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "cases_ownerUserId_idx" ON "cases"("ownerUserId");

-- CreateIndex
CREATE INDEX "cases_status_idx" ON "cases"("status");

-- CreateIndex
CREATE INDEX "cases_category_idx" ON "cases"("category");

-- AddForeignKey
ALTER TABLE "cases" ADD CONSTRAINT "cases_ownerUserId_fkey" FOREIGN KEY ("ownerUserId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

