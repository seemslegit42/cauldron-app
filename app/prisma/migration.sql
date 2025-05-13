-- CreateEnum
CREATE TYPE "SentientCheckpointType" AS ENUM (
  'DECISION_REQUIRED',
  'CONFIRMATION_REQUIRED',
  'INFORMATION_REQUIRED',
  'ESCALATION_REQUIRED',
  'VALIDATION_REQUIRED',
  'AUDIT_REQUIRED'
);

-- CreateEnum
CREATE TYPE "SentientCheckpointStatus" AS ENUM (
  'PENDING',
  'APPROVED',
  'REJECTED',
  'MODIFIED',
  'ESCALATED',
  'EXPIRED',
  'CANCELLED'
);

-- CreateEnum
CREATE TYPE "SentientMemoryType" AS ENUM (
  'DECISION',
  'FEEDBACK',
  'CONTEXT',
  'ESCALATION',
  'AUDIT',
  'SYSTEM'
);

-- CreateEnum
CREATE TYPE "SentientEscalationLevel" AS ENUM (
  'LOW',
  'MEDIUM',
  'HIGH',
  'CRITICAL'
);

-- CreateTable
CREATE TABLE "SentientCheckpoint" (
  "id" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  "type" "SentientCheckpointType" NOT NULL,
  "status" "SentientCheckpointStatus" NOT NULL DEFAULT 'PENDING',
  "title" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "moduleId" TEXT NOT NULL,
  "agentId" TEXT,
  "userId" TEXT NOT NULL,
  "sessionId" TEXT,
  "originalPayload" JSONB NOT NULL,
  "modifiedPayload" JSONB,
  "metadata" JSONB,
  "expiresAt" TIMESTAMP(3),
  "resolvedAt" TIMESTAMP(3),
  "resolvedBy" TEXT,
  "resolution" TEXT,
  "traceId" TEXT,
  "parentCheckpointId" TEXT,

  CONSTRAINT "SentientCheckpoint_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SentientMemorySnapshot" (
  "id" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "checkpointId" TEXT NOT NULL,
  "type" "SentientMemoryType" NOT NULL,
  "content" JSONB NOT NULL,
  "metadata" JSONB,
  "importance" DOUBLE PRECISION NOT NULL DEFAULT 1.0,
  "expiresAt" TIMESTAMP(3),

  CONSTRAINT "SentientMemorySnapshot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SentientEscalation" (
  "id" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  "checkpointId" TEXT NOT NULL,
  "level" "SentientEscalationLevel" NOT NULL,
  "reason" TEXT NOT NULL,
  "status" "SentientCheckpointStatus" NOT NULL DEFAULT 'PENDING',
  "resolvedAt" TIMESTAMP(3),
  "resolvedBy" TEXT,
  "resolution" TEXT,
  "metadata" JSONB,

  CONSTRAINT "SentientEscalation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SentientDecisionTrace" (
  "id" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "checkpointId" TEXT NOT NULL,
  "decisionMaker" TEXT NOT NULL,
  "decisionType" TEXT NOT NULL,
  "reasoning" TEXT,
  "factors" JSONB,
  "alternatives" JSONB,
  "metadata" JSONB,

  CONSTRAINT "SentientDecisionTrace_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SentientLoopConfig" (
  "id" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  "userId" TEXT NOT NULL,
  "moduleId" TEXT,
  "checkpointThresholds" JSONB NOT NULL,
  "escalationRules" JSONB NOT NULL,
  "memoryRetention" JSONB NOT NULL,
  "auditFrequency" JSONB NOT NULL,
  "isActive" BOOLEAN NOT NULL DEFAULT true,

  CONSTRAINT "SentientLoopConfig_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "SentientCheckpoint_userId_idx" ON "SentientCheckpoint"("userId");
CREATE INDEX "SentientCheckpoint_agentId_idx" ON "SentientCheckpoint"("agentId");
CREATE INDEX "SentientCheckpoint_moduleId_idx" ON "SentientCheckpoint"("moduleId");
CREATE INDEX "SentientCheckpoint_status_idx" ON "SentientCheckpoint"("status");
CREATE INDEX "SentientCheckpoint_type_idx" ON "SentientCheckpoint"("type");
CREATE INDEX "SentientCheckpoint_sessionId_idx" ON "SentientCheckpoint"("sessionId");
CREATE INDEX "SentientCheckpoint_parentCheckpointId_idx" ON "SentientCheckpoint"("parentCheckpointId");

-- CreateIndex
CREATE INDEX "SentientMemorySnapshot_checkpointId_idx" ON "SentientMemorySnapshot"("checkpointId");
CREATE INDEX "SentientMemorySnapshot_type_idx" ON "SentientMemorySnapshot"("type");

-- CreateIndex
CREATE INDEX "SentientEscalation_checkpointId_idx" ON "SentientEscalation"("checkpointId");
CREATE INDEX "SentientEscalation_level_idx" ON "SentientEscalation"("level");
CREATE INDEX "SentientEscalation_status_idx" ON "SentientEscalation"("status");

-- CreateIndex
CREATE INDEX "SentientDecisionTrace_checkpointId_idx" ON "SentientDecisionTrace"("checkpointId");
CREATE INDEX "SentientDecisionTrace_decisionMaker_idx" ON "SentientDecisionTrace"("decisionMaker");

-- CreateIndex
CREATE UNIQUE INDEX "SentientLoopConfig_userId_moduleId_key" ON "SentientLoopConfig"("userId", "moduleId");

-- AddForeignKey
ALTER TABLE "SentientCheckpoint" ADD CONSTRAINT "SentientCheckpoint_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "SentientCheckpoint" ADD CONSTRAINT "SentientCheckpoint_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES "AI_Agent"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "SentientCheckpoint" ADD CONSTRAINT "SentientCheckpoint_parentCheckpointId_fkey" FOREIGN KEY ("parentCheckpointId") REFERENCES "SentientCheckpoint"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SentientMemorySnapshot" ADD CONSTRAINT "SentientMemorySnapshot_checkpointId_fkey" FOREIGN KEY ("checkpointId") REFERENCES "SentientCheckpoint"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SentientEscalation" ADD CONSTRAINT "SentientEscalation_checkpointId_fkey" FOREIGN KEY ("checkpointId") REFERENCES "SentientCheckpoint"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SentientDecisionTrace" ADD CONSTRAINT "SentientDecisionTrace_checkpointId_fkey" FOREIGN KEY ("checkpointId") REFERENCES "SentientCheckpoint"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SentientLoopConfig" ADD CONSTRAINT "SentientLoopConfig_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;