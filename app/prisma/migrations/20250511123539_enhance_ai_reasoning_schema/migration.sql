-- AlterTable
ALTER TABLE "AIPrompt" ADD COLUMN     "templateId" TEXT,
ADD COLUMN     "templateValues" JSONB;

-- AlterTable
ALTER TABLE "AIReasoning" ADD COLUMN     "modelVersionId" TEXT;

-- CreateTable
CREATE TABLE "AIReasoningStep" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reasoningId" TEXT NOT NULL,
    "stepNumber" INTEGER NOT NULL,
    "stepType" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "tokens" INTEGER,
    "duration" INTEGER,
    "metadata" JSONB,
    "createdById" TEXT,

    CONSTRAINT "AIReasoningStep_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AIPromptTemplate" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "version" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "placeholders" TEXT[],
    "exampleValues" JSONB,
    "module" TEXT NOT NULL,
    "category" TEXT,
    "tags" TEXT[],
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "safetyScore" DOUBLE PRECISION,
    "estimatedTokens" INTEGER,
    "createdById" TEXT NOT NULL,
    "organizationId" TEXT,
    "usageCount" INTEGER NOT NULL DEFAULT 0,
    "lastUsedAt" TIMESTAMP(3),

    CONSTRAINT "AIPromptTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AIFeedbackAnnotation" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "reasoningId" TEXT NOT NULL,
    "responseNodeId" TEXT,
    "annotationType" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "suggestedOutput" TEXT,
    "annotatedBy" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "metadata" JSONB,

    CONSTRAINT "AIFeedbackAnnotation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AIEvaluationMetric" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reasoningId" TEXT NOT NULL,
    "metricType" TEXT NOT NULL,
    "score" DOUBLE PRECISION NOT NULL,
    "evaluatedBy" TEXT NOT NULL,
    "evaluationMethod" TEXT NOT NULL,
    "notes" TEXT,
    "metadata" JSONB,

    CONSTRAINT "AIEvaluationMetric_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AIReasoningContext" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reasoningId" TEXT NOT NULL,
    "contextType" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "relevanceScore" DOUBLE PRECISION,
    "metadata" JSONB,
    "createdById" TEXT,

    CONSTRAINT "AIReasoningContext_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AIModelVersion" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "modelName" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "version" TEXT NOT NULL,
    "capabilities" TEXT[],
    "parameters" JSONB,
    "benchmarks" JSONB,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "AIModelVersion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AIPromptSafetyCheck" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "promptId" TEXT NOT NULL,
    "checkType" TEXT NOT NULL,
    "score" DOUBLE PRECISION NOT NULL,
    "passed" BOOLEAN NOT NULL,
    "details" JSONB,

    CONSTRAINT "AIPromptSafetyCheck_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AIReasoningStep_reasoningId_idx" ON "AIReasoningStep"("reasoningId");

-- CreateIndex
CREATE INDEX "AIReasoningStep_stepType_idx" ON "AIReasoningStep"("stepType");

-- CreateIndex
CREATE INDEX "AIReasoningStep_stepNumber_idx" ON "AIReasoningStep"("stepNumber");

-- CreateIndex
CREATE INDEX "AIReasoningStep_createdById_idx" ON "AIReasoningStep"("createdById");

-- CreateIndex
CREATE INDEX "AIPromptTemplate_module_idx" ON "AIPromptTemplate"("module");

-- CreateIndex
CREATE INDEX "AIPromptTemplate_category_idx" ON "AIPromptTemplate"("category");

-- CreateIndex
CREATE INDEX "AIPromptTemplate_tags_idx" ON "AIPromptTemplate"("tags");

-- CreateIndex
CREATE INDEX "AIPromptTemplate_createdById_idx" ON "AIPromptTemplate"("createdById");

-- CreateIndex
CREATE INDEX "AIPromptTemplate_organizationId_idx" ON "AIPromptTemplate"("organizationId");

-- CreateIndex
CREATE INDEX "AIFeedbackAnnotation_reasoningId_idx" ON "AIFeedbackAnnotation"("reasoningId");

-- CreateIndex
CREATE INDEX "AIFeedbackAnnotation_responseNodeId_idx" ON "AIFeedbackAnnotation"("responseNodeId");

-- CreateIndex
CREATE INDEX "AIFeedbackAnnotation_annotationType_idx" ON "AIFeedbackAnnotation"("annotationType");

-- CreateIndex
CREATE INDEX "AIFeedbackAnnotation_annotatedBy_idx" ON "AIFeedbackAnnotation"("annotatedBy");

-- CreateIndex
CREATE INDEX "AIFeedbackAnnotation_status_idx" ON "AIFeedbackAnnotation"("status");

-- CreateIndex
CREATE INDEX "AIEvaluationMetric_reasoningId_idx" ON "AIEvaluationMetric"("reasoningId");

-- CreateIndex
CREATE INDEX "AIEvaluationMetric_metricType_idx" ON "AIEvaluationMetric"("metricType");

-- CreateIndex
CREATE INDEX "AIEvaluationMetric_evaluatedBy_idx" ON "AIEvaluationMetric"("evaluatedBy");

-- CreateIndex
CREATE INDEX "AIEvaluationMetric_evaluationMethod_idx" ON "AIEvaluationMetric"("evaluationMethod");

-- CreateIndex
CREATE INDEX "AIReasoningContext_reasoningId_idx" ON "AIReasoningContext"("reasoningId");

-- CreateIndex
CREATE INDEX "AIReasoningContext_contextType_idx" ON "AIReasoningContext"("contextType");

-- CreateIndex
CREATE INDEX "AIReasoningContext_source_idx" ON "AIReasoningContext"("source");

-- CreateIndex
CREATE INDEX "AIReasoningContext_createdById_idx" ON "AIReasoningContext"("createdById");

-- CreateIndex
CREATE INDEX "AIModelVersion_modelName_idx" ON "AIModelVersion"("modelName");

-- CreateIndex
CREATE INDEX "AIModelVersion_provider_idx" ON "AIModelVersion"("provider");

-- CreateIndex
CREATE INDEX "AIModelVersion_isActive_idx" ON "AIModelVersion"("isActive");

-- CreateIndex
CREATE UNIQUE INDEX "AIModelVersion_modelName_version_provider_key" ON "AIModelVersion"("modelName", "version", "provider");

-- CreateIndex
CREATE INDEX "AIPromptSafetyCheck_promptId_idx" ON "AIPromptSafetyCheck"("promptId");

-- CreateIndex
CREATE INDEX "AIPromptSafetyCheck_checkType_idx" ON "AIPromptSafetyCheck"("checkType");

-- CreateIndex
CREATE INDEX "AIPromptSafetyCheck_passed_idx" ON "AIPromptSafetyCheck"("passed");

-- CreateIndex
CREATE INDEX "AIPrompt_templateId_idx" ON "AIPrompt"("templateId");

-- CreateIndex
CREATE INDEX "AIReasoning_modelVersionId_idx" ON "AIReasoning"("modelVersionId");

-- AddForeignKey
ALTER TABLE "AIPrompt" ADD CONSTRAINT "AIPrompt_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "AIPromptTemplate"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AIReasoning" ADD CONSTRAINT "AIReasoning_modelVersionId_fkey" FOREIGN KEY ("modelVersionId") REFERENCES "AIModelVersion"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AIReasoningStep" ADD CONSTRAINT "AIReasoningStep_reasoningId_fkey" FOREIGN KEY ("reasoningId") REFERENCES "AIReasoning"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AIReasoningStep" ADD CONSTRAINT "AIReasoningStep_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AIPromptTemplate" ADD CONSTRAINT "AIPromptTemplate_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AIPromptTemplate" ADD CONSTRAINT "AIPromptTemplate_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AIFeedbackAnnotation" ADD CONSTRAINT "AIFeedbackAnnotation_reasoningId_fkey" FOREIGN KEY ("reasoningId") REFERENCES "AIReasoning"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AIFeedbackAnnotation" ADD CONSTRAINT "AIFeedbackAnnotation_responseNodeId_fkey" FOREIGN KEY ("responseNodeId") REFERENCES "AIResponseNode"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AIFeedbackAnnotation" ADD CONSTRAINT "AIFeedbackAnnotation_annotatedBy_fkey" FOREIGN KEY ("annotatedBy") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AIEvaluationMetric" ADD CONSTRAINT "AIEvaluationMetric_reasoningId_fkey" FOREIGN KEY ("reasoningId") REFERENCES "AIReasoning"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AIEvaluationMetric" ADD CONSTRAINT "AIEvaluationMetric_evaluatedBy_fkey" FOREIGN KEY ("evaluatedBy") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AIReasoningContext" ADD CONSTRAINT "AIReasoningContext_reasoningId_fkey" FOREIGN KEY ("reasoningId") REFERENCES "AIReasoning"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AIReasoningContext" ADD CONSTRAINT "AIReasoningContext_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AIPromptSafetyCheck" ADD CONSTRAINT "AIPromptSafetyCheck_promptId_fkey" FOREIGN KEY ("promptId") REFERENCES "AIPrompt"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
