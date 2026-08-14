-- CreateEnum
CREATE TYPE "AgentStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'ON_LEAVE', 'DEPLOYED');

-- CreateEnum
CREATE TYPE "ClearanceLevel" AS ENUM ('LEVEL_1', 'LEVEL_2', 'LEVEL_3', 'LEVEL_4', 'LEVEL_5');

-- CreateEnum
CREATE TYPE "ThreatType" AS ENUM ('MALWARE', 'INTRUSION', 'DDoS', 'DATA_BREACH', 'SOCIAL_ENGINEERING', 'CONFIGURATION', 'UNKNOWN');

-- CreateEnum
CREATE TYPE "ThreatSeverity" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');

-- CreateEnum
CREATE TYPE "ThreatStatus" AS ENUM ('DETECTED', 'ANALYZING', 'CONFIRMED', 'MITIGATING', 'RESOLVED', 'CLOSED');

-- CreateEnum
CREATE TYPE "SystemLogType" AS ENUM ('ERROR', 'WARNING', 'INFO', 'DEBUG', 'SECURITY', 'AUDIT');

-- CreateEnum
CREATE TYPE "LogSeverity" AS ENUM ('INFO', 'WARNING', 'ERROR', 'CRITICAL');

-- CreateEnum
CREATE TYPE "MonitorType" AS ENUM ('TRAFFIC', 'THREAT', 'PERFORMANCE', 'SECURITY');

-- CreateTable
CREATE TABLE "agents" (
    "id" TEXT NOT NULL,
    "agentId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "status" "AgentStatus" NOT NULL DEFAULT 'ACTIVE',
    "specialization" TEXT,
    "clearanceLevel" "ClearanceLevel" NOT NULL DEFAULT 'LEVEL_3',
    "caseId" TEXT,
    "userId" TEXT,
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "agents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "threats" (
    "id" TEXT NOT NULL,
    "threatId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "threatType" "ThreatType" NOT NULL,
    "severity" "ThreatSeverity" NOT NULL DEFAULT 'LOW',
    "status" "ThreatStatus" NOT NULL DEFAULT 'DETECTED',
    "intel" TEXT,
    "source" TEXT,
    "detectedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "resolvedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "threats_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "case_threats" (
    "id" TEXT NOT NULL,
    "caseId" TEXT NOT NULL,
    "threatId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "case_threats_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "system_logs" (
    "id" TEXT NOT NULL,
    "logType" "SystemLogType" NOT NULL,
    "component" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "severity" "LogSeverity" NOT NULL DEFAULT 'INFO',
    "threatId" TEXT,
    "metadata" JSONB,
    "stackTrace" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "system_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "threat_monitors" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "monitorType" "MonitorType" NOT NULL,
    "threshold" INTEGER,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "threat_monitors_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "alert_rules" (
    "id" TEXT NOT NULL,
    "monitorId" TEXT NOT NULL,
    "condition" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "isEnabled" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "alert_rules_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "agents_agentId_key" ON "agents"("agentId");

-- CreateIndex
CREATE UNIQUE INDEX "threats_threatId_key" ON "threats"("threatId");

-- CreateIndex
CREATE UNIQUE INDEX "case_threats_caseId_threatId_key" ON "case_threats"("caseId", "threatId");

-- CreateIndex
CREATE INDEX "system_logs_logType_idx" ON "system_logs"("logType");

-- CreateIndex
CREATE INDEX "system_logs_severity_idx" ON "system_logs"("severity");

-- CreateIndex
CREATE INDEX "system_logs_threatId_idx" ON "system_logs"("threatId");

-- AddForeignKey
ALTER TABLE "agents" ADD CONSTRAINT "agents_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "cases"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "agents" ADD CONSTRAINT "agents_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "case_threats" ADD CONSTRAINT "case_threats_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "cases"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "case_threats" ADD CONSTRAINT "case_threats_threatId_fkey" FOREIGN KEY ("threatId") REFERENCES "threats"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "system_logs" ADD CONSTRAINT "system_logs_threatId_fkey" FOREIGN KEY ("threatId") REFERENCES "threats"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "threat_monitors" ADD CONSTRAINT "threat_monitors_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "alert_rules" ADD CONSTRAINT "alert_rules_monitorId_fkey" FOREIGN KEY ("monitorId") REFERENCES "threat_monitors"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Add caseNumber field if not exists
ALTER TABLE "cases" ADD COLUMN IF NOT EXISTS "caseNumber" TEXT;

-- Create unique index for caseNumber
CREATE UNIQUE INDEX IF NOT EXISTS "cases_caseNumber_key" ON "cases"("caseNumber");

