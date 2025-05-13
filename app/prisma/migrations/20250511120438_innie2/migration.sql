-- CreateEnum
CREATE TYPE "PlanTier" AS ENUM ('FREE', 'PRO', 'TEAM', 'EXECUTIVE');

-- CreateEnum
CREATE TYPE "SentientCheckpointType" AS ENUM ('DECISION_REQUIRED', 'CONFIRMATION_REQUIRED', 'INFORMATION_REQUIRED', 'ESCALATION_REQUIRED', 'VALIDATION_REQUIRED', 'AUDIT_REQUIRED');

-- CreateEnum
CREATE TYPE "SentientCheckpointStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'MODIFIED', 'ESCALATED', 'EXPIRED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "SentientMemoryType" AS ENUM ('DECISION', 'FEEDBACK', 'CONTEXT', 'ESCALATION', 'AUDIT', 'SYSTEM');

-- CreateEnum
CREATE TYPE "SentientEscalationLevel" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');

-- CreateEnum
CREATE TYPE "MetricCategory" AS ENUM ('revenue', 'growth', 'engagement', 'conversion', 'retention', 'acquisition', 'performance', 'marketing', 'sales', 'customer', 'financial', 'operational', 'market', 'product', 'hiring', 'partnership');

-- CreateEnum
CREATE TYPE "TimeframeOption" AS ENUM ('day', 'week', 'month', 'quarter', 'year');

-- CreateEnum
CREATE TYPE "ImpactLevel" AS ENUM ('low', 'medium', 'high', 'critical');

-- CreateEnum
CREATE TYPE "ConfidenceLevel" AS ENUM ('low', 'medium', 'high', 'very_high');

-- CreateEnum
CREATE TYPE "CampaignStatus" AS ENUM ('draft', 'planned', 'active', 'paused', 'completed', 'cancelled');

-- CreateEnum
CREATE TYPE "LogLevel" AS ENUM ('TRACE', 'DEBUG', 'INFO', 'WARN', 'ERROR', 'CRITICAL');

-- CreateEnum
CREATE TYPE "EventCategory" AS ENUM ('AGENT_ACTION', 'HUMAN_APPROVAL', 'API_INTERACTION', 'SYSTEM_EVENT', 'SECURITY', 'PERFORMANCE', 'DATA_ACCESS', 'AUTHENTICATION', 'AUTHORIZATION', 'BUSINESS_LOGIC', 'INTEGRATION', 'SCHEDULED_TASK');

-- CreateEnum
CREATE TYPE "TriggerSourceType" AS ENUM ('SCHEDULED_JOB', 'OSINT_SCAN', 'WEBHOOK', 'USER_INPUT', 'SYSTEM_EVENT', 'API_CALL', 'AGENT_ACTION', 'ALERT_RULE', 'OTHER');

-- CreateEnum
CREATE TYPE "ApprovalStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'EXPIRED', 'CANCELLED', 'MODIFIED');

-- CreateEnum
CREATE TYPE "ApiStatus" AS ENUM ('SUCCESS', 'ERROR', 'TIMEOUT', 'RATE_LIMITED', 'INVALID_REQUEST', 'UNAUTHORIZED', 'FORBIDDEN', 'NOT_FOUND', 'SERVER_ERROR');

-- CreateEnum
CREATE TYPE "AlertSeverity" AS ENUM ('info', 'warning', 'error', 'critical');

-- CreateEnum
CREATE TYPE "AlertStatus" AS ENUM ('active', 'resolved', 'acknowledged');

-- CreateEnum
CREATE TYPE "AlertType" AS ENUM ('threshold', 'pattern', 'anomaly', 'trend');

-- CreateEnum
CREATE TYPE "QueryStatus" AS ENUM ('success', 'error');

-- CreateEnum
CREATE TYPE "NotificationChannel" AS ENUM ('email', 'slack', 'webhook', 'in_app');

-- CreateEnum
CREATE TYPE "QueryPermissionLevel" AS ENUM ('READ_ONLY', 'READ_WRITE', 'FULL_ACCESS');

-- CreateEnum
CREATE TYPE "QueryApprovalStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'AUTO_APPROVED');

-- CreateEnum
CREATE TYPE "EthicalRuleType" AS ENUM ('CONTENT_FILTER', 'BIAS_CHECK', 'REGULATORY', 'INDUSTRY_SPECIFIC', 'CUSTOM');

-- CreateEnum
CREATE TYPE "EthicalSeverity" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "email" TEXT,
    "username" TEXT,
    "paymentProcessorUserId" TEXT,
    "lemonSqueezyCustomerPortalUrl" TEXT,
    "subscriptionStatus" TEXT,
    "subscriptionPlan" TEXT,
    "datePaid" TIMESTAMP(3),
    "credits" INTEGER NOT NULL DEFAULT 3,
    "avatarUrl" TEXT,
    "firstName" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isEmailVerified" BOOLEAN NOT NULL DEFAULT false,
    "lastLoginAt" TIMESTAMP(3),
    "lastName" TEXT,
    "organizationId" TEXT,
    "password" TEXT,
    "passwordChangedAt" TIMESTAMP(3),
    "passwordResetExpires" TIMESTAMP(3),
    "passwordResetToken" TEXT,
    "phoneNumber" TEXT,
    "roleId" TEXT,
    "seatAssignedAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "File" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "uploadUrl" TEXT NOT NULL,

    CONSTRAINT "File_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DailyStats" (
    "id" SERIAL NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "totalViews" INTEGER NOT NULL DEFAULT 0,
    "prevDayViewsChangePercent" TEXT NOT NULL DEFAULT '0',
    "userCount" INTEGER NOT NULL DEFAULT 0,
    "paidUserCount" INTEGER NOT NULL DEFAULT 0,
    "userDelta" INTEGER NOT NULL DEFAULT 0,
    "paidUserDelta" INTEGER NOT NULL DEFAULT 0,
    "totalRevenue" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "totalProfit" DOUBLE PRECISION NOT NULL DEFAULT 0,

    CONSTRAINT "DailyStats_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PageViewSource" (
    "name" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dailyStatsId" INTEGER,
    "visitors" INTEGER NOT NULL,

    CONSTRAINT "PageViewSource_pkey" PRIMARY KEY ("date","name")
);

-- CreateTable
CREATE TABLE "Logs" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "message" TEXT NOT NULL,
    "level" TEXT NOT NULL,

    CONSTRAINT "Logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContactFormMessage" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "repliedAt" TIMESTAMP(3),

    CONSTRAINT "ContactFormMessage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Agent" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "configuration" JSONB NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "Agent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Workflow" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "steps" JSONB NOT NULL,
    "triggers" JSONB NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isLangGraph" BOOLEAN NOT NULL DEFAULT false,
    "isVisual" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Workflow_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WorkflowDesign" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "workflowId" TEXT NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "WorkflowDesign_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LangGraphState" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT,
    "workflowId" TEXT,
    "executionId" TEXT,
    "graphId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "state" JSONB NOT NULL,
    "metadata" JSONB,
    "checkpointedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3),

    CONSTRAINT "LangGraphState_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LangGraphNode" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "graphStateId" TEXT NOT NULL,
    "nodeId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "config" JSONB NOT NULL,
    "metadata" JSONB,

    CONSTRAINT "LangGraphNode_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LangGraphEdge" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "graphStateId" TEXT NOT NULL,
    "sourceNodeId" TEXT NOT NULL,
    "targetNodeId" TEXT NOT NULL,
    "condition" TEXT,
    "metadata" JSONB,

    CONSTRAINT "LangGraphEdge_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LangGraphNodeExecution" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "graphStateId" TEXT NOT NULL,
    "nodeId" TEXT NOT NULL,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),
    "status" TEXT NOT NULL,
    "input" JSONB NOT NULL,
    "output" JSONB,
    "error" TEXT,
    "duration" INTEGER,

    CONSTRAINT "LangGraphNodeExecution_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WorkflowNode" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "designId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "positionX" DOUBLE PRECISION NOT NULL,
    "positionY" DOUBLE PRECISION NOT NULL,
    "data" JSONB NOT NULL,

    CONSTRAINT "WorkflowNode_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WorkflowConnection" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "designId" TEXT NOT NULL,
    "sourceId" TEXT NOT NULL,
    "targetId" TEXT NOT NULL,
    "sourceHandle" TEXT,
    "targetHandle" TEXT,
    "label" TEXT,

    CONSTRAINT "WorkflowConnection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WorkflowExecution" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "workflowId" TEXT NOT NULL,
    "userId" TEXT,
    "status" TEXT NOT NULL,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),
    "results" JSONB,
    "error" TEXT,
    "isLangGraph" BOOLEAN NOT NULL DEFAULT false,
    "triggerId" TEXT,

    CONSTRAINT "WorkflowExecution_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DataSource" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "config" JSONB NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "DataSource_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Signal" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "sourceId" TEXT NOT NULL,
    "data" JSONB NOT NULL,
    "processed" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Signal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MemoryEntry" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "context" TEXT NOT NULL,
    "content" JSONB NOT NULL,
    "expiresAt" TIMESTAMP(3),
    "importance" DOUBLE PRECISION NOT NULL DEFAULT 1.0,

    CONSTRAINT "MemoryEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FeedbackEntry" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "comment" TEXT,
    "memoryId" TEXT,
    "workflowExecutionId" TEXT,
    "sentimentScore" DOUBLE PRECISION,
    "sentimentLabel" TEXT,
    "emotionalTones" TEXT[],
    "confusionDetected" BOOLEAN,
    "fatigueDetected" BOOLEAN,
    "trustScore" DOUBLE PRECISION,
    "sentimentMetadata" JSONB,

    CONSTRAINT "FeedbackEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RevenueStream" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "type" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "RevenueStream_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Transaction" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "transactionDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "revenueStreamId" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "description" TEXT,
    "status" TEXT NOT NULL,
    "source" TEXT,
    "metadata" JSONB,

    CONSTRAINT "Transaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RevenueMetric" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "revenueStreamId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "value" DOUBLE PRECISION NOT NULL,
    "previousValue" DOUBLE PRECISION,
    "percentChange" DOUBLE PRECISION,
    "target" DOUBLE PRECISION,

    CONSTRAINT "RevenueMetric_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RevenueAlert" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "severity" TEXT NOT NULL,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "metadata" JSONB,

    CONSTRAINT "RevenueAlert_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RevenueInsight" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "impact" TEXT NOT NULL,
    "isArchived" BOOLEAN NOT NULL DEFAULT false,
    "metadata" JSONB,

    CONSTRAINT "RevenueInsight_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OsintSource" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "type" TEXT NOT NULL,
    "config" JSONB NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "OsintSource_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OsintFinding" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "discoveredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "sourceId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "rawData" JSONB,
    "summary" TEXT,
    "category" TEXT NOT NULL,
    "severity" TEXT NOT NULL,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "isArchived" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "OsintFinding_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OsintAlert" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "findingId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "severity" TEXT NOT NULL,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "isForwarded" BOOLEAN NOT NULL DEFAULT false,
    "targetModule" TEXT,
    "metadata" JSONB,

    CONSTRAINT "OsintAlert_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OsintScanJob" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT,
    "sourceType" TEXT NOT NULL,
    "parameters" JSONB NOT NULL,
    "status" TEXT NOT NULL,
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "results" JSONB,
    "error" TEXT,

    CONSTRAINT "OsintScanJob_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OsintWebhook" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "endpoint" TEXT NOT NULL,
    "secret" TEXT NOT NULL,
    "events" TEXT[],
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "OsintWebhook_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BusinessMetric" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" "MetricCategory" NOT NULL,
    "value" DOUBLE PRECISION NOT NULL,
    "previousValue" DOUBLE PRECISION,
    "percentChange" DOUBLE PRECISION,
    "target" DOUBLE PRECISION,
    "date" TIMESTAMP(3) NOT NULL,
    "unit" TEXT NOT NULL,
    "description" TEXT,

    CONSTRAINT "BusinessMetric_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BusinessInsight" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "category" "MetricCategory" NOT NULL,
    "impact" "ImpactLevel" NOT NULL,
    "confidence" "ConfidenceLevel" NOT NULL,
    "relatedMetrics" TEXT[],
    "isArchived" BOOLEAN NOT NULL DEFAULT false,
    "metadata" JSONB,

    CONSTRAINT "BusinessInsight_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BusinessRecommendation" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "category" "MetricCategory" NOT NULL,
    "impact" "ImpactLevel" NOT NULL,
    "effort" "ImpactLevel" NOT NULL,
    "confidence" "ConfidenceLevel" NOT NULL,
    "actionItems" TEXT[],
    "expectedOutcome" TEXT NOT NULL,
    "isImplemented" BOOLEAN NOT NULL DEFAULT false,
    "implementedAt" TIMESTAMP(3),
    "metadata" JSONB,

    CONSTRAINT "BusinessRecommendation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CampaignSuggestion" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "objective" TEXT NOT NULL,
    "targetAudience" TEXT NOT NULL,
    "estimatedImpact" "ImpactLevel" NOT NULL,
    "estimatedCost" DOUBLE PRECISION,
    "estimatedDuration" INTEGER NOT NULL,
    "kpis" TEXT[],
    "status" "CampaignStatus" NOT NULL DEFAULT 'draft',
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "metadata" JSONB,

    CONSTRAINT "CampaignSuggestion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StrategicDecision" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "impact" "ImpactLevel" NOT NULL,
    "risk" "ImpactLevel" NOT NULL,
    "recommendedOptionId" TEXT NOT NULL,
    "deadline" TIMESTAMP(3),
    "isResolved" BOOLEAN NOT NULL DEFAULT false,
    "resolvedAt" TIMESTAMP(3),
    "selectedOptionId" TEXT,
    "metadata" JSONB,

    CONSTRAINT "StrategicDecision_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StrategicOption" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "decisionId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "pros" TEXT[],
    "cons" TEXT[],
    "estimatedImpact" "ImpactLevel" NOT NULL,
    "estimatedRisk" "ImpactLevel" NOT NULL,
    "metadata" JSONB,

    CONSTRAINT "StrategicOption_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GrowthMetric" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" "MetricCategory" NOT NULL,
    "currentValue" DOUBLE PRECISION NOT NULL,
    "trend" DOUBLE PRECISION NOT NULL,
    "unit" TEXT NOT NULL,
    "description" TEXT,
    "metadata" JSONB,

    CONSTRAINT "GrowthMetric_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HistoricalValue" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "growthMetricId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "value" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "HistoricalValue_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ForecastValue" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "growthMetricId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "value" DOUBLE PRECISION NOT NULL,
    "confidence" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "ForecastValue_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MarketData" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "value" DOUBLE PRECISION NOT NULL,
    "source" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "trend" DOUBLE PRECISION,
    "impact" "ImpactLevel" NOT NULL,
    "relevance" "ConfidenceLevel" NOT NULL,
    "description" TEXT NOT NULL,
    "metadata" JSONB,

    CONSTRAINT "MarketData_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StrategicRecommendation" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "category" "MetricCategory" NOT NULL,
    "impact" "ImpactLevel" NOT NULL,
    "timeframe" "TimeframeOption" NOT NULL,
    "actionItems" TEXT[],
    "expectedOutcome" TEXT NOT NULL,
    "supportingData" TEXT[],
    "isImplemented" BOOLEAN NOT NULL DEFAULT false,
    "implementedAt" TIMESTAMP(3),
    "metadata" JSONB,

    CONSTRAINT "StrategicRecommendation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExecutiveSummary" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "timeframe" "TimeframeOption" NOT NULL,
    "keyMetrics" JSONB NOT NULL,
    "keyInsights" TEXT[],
    "topRecommendations" TEXT[],
    "riskFactors" TEXT[],
    "opportunities" TEXT[],
    "metadata" JSONB,

    CONSTRAINT "ExecutiveSummary_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MarketDataSource" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "url" TEXT,
    "apiKey" TEXT,
    "refreshInterval" INTEGER NOT NULL,
    "lastRefreshed" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "configuration" JSONB,

    CONSTRAINT "MarketDataSource_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DataPoint" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "sourceId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "value" DOUBLE PRECISION NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "metadata" JSONB,

    CONSTRAINT "DataPoint_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Role" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "isSystem" BOOLEAN NOT NULL DEFAULT false,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Role_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Permission" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "resource" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "conditions" JSONB,

    CONSTRAINT "Permission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RolePermission" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "roleId" TEXT NOT NULL,
    "permissionId" TEXT NOT NULL,

    CONSTRAINT "RolePermission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserPermission" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,
    "permissionId" TEXT NOT NULL,

    CONSTRAINT "UserPermission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Organization" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "logoUrl" TEXT,
    "website" TEXT,
    "industry" TEXT,
    "size" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "tenantId" TEXT,
    "tenantDomain" TEXT,
    "tenantPlan" TEXT,
    "tenantStatus" TEXT,

    CONSTRAINT "Organization_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SubscriptionPlan" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "name" TEXT NOT NULL,
    "tier" "PlanTier" NOT NULL,
    "stripePriceId" TEXT,
    "monthlyPrice" DECIMAL(10,2) NOT NULL,
    "yearlyPrice" DECIMAL(10,2),
    "features" JSONB NOT NULL,
    "maxSeats" INTEGER,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "SubscriptionPlan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Subscription" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "organizationId" TEXT NOT NULL,
    "planId" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "currentPeriodStart" TIMESTAMP(3) NOT NULL,
    "currentPeriodEnd" TIMESTAMP(3) NOT NULL,
    "cancelAtPeriodEnd" BOOLEAN NOT NULL DEFAULT false,
    "canceledAt" TIMESTAMP(3),
    "stripeSubscriptionId" TEXT,
    "seats" INTEGER NOT NULL DEFAULT 1,
    "usedSeats" INTEGER NOT NULL DEFAULT 0,
    "gracePeriodEnd" TIMESTAMP(3),
    "billingCycleAnchor" TIMESTAMP(3),
    "metadata" JSONB,

    CONSTRAINT "Subscription_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SubscriptionInvoice" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "subscriptionId" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "status" TEXT NOT NULL,
    "dueDate" TIMESTAMP(3) NOT NULL,
    "paidAt" TIMESTAMP(3),
    "stripeInvoiceId" TEXT,
    "stripePaymentIntentId" TEXT,
    "metadata" JSONB,

    CONSTRAINT "SubscriptionInvoice_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AI_Agent" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "capabilities" TEXT[],
    "model" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "systemPrompt" TEXT NOT NULL,
    "configuration" JSONB NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "personaId" TEXT,

    CONSTRAINT "AI_Agent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AgentPersona" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "systemPrompt" TEXT NOT NULL,
    "isPublic" BOOLEAN NOT NULL DEFAULT false,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "version" TEXT NOT NULL DEFAULT '1.0.0',
    "createdById" TEXT NOT NULL,
    "organizationId" TEXT,
    "forkedFromId" TEXT,

    CONSTRAINT "AgentPersona_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PersonaTrait" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "isPublic" BOOLEAN NOT NULL DEFAULT false,
    "createdById" TEXT NOT NULL,

    CONSTRAINT "PersonaTrait_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PersonaMemoryScope" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "scope" TEXT NOT NULL,
    "retention" TEXT NOT NULL,
    "priority" INTEGER NOT NULL DEFAULT 1,
    "personaId" TEXT NOT NULL,

    CONSTRAINT "PersonaMemoryScope_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AgentLog" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "agentId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "sessionId" TEXT,
    "level" "LogLevel" NOT NULL DEFAULT 'INFO',
    "category" "EventCategory",
    "message" TEXT NOT NULL,
    "source" TEXT,
    "moduleId" TEXT,
    "organizationId" TEXT,
    "traceId" TEXT,
    "spanId" TEXT,
    "parentSpanId" TEXT,
    "duration" INTEGER,
    "tags" TEXT[],
    "metadata" JSONB,
    "affectedEntities" JSONB,

    CONSTRAINT "AgentLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SystemLog" (
    "id" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "level" "LogLevel" NOT NULL DEFAULT 'INFO',
    "category" "EventCategory" NOT NULL,
    "message" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "moduleId" TEXT,
    "organizationId" TEXT,
    "userId" TEXT,
    "agentId" TEXT,
    "sessionId" TEXT,
    "traceId" TEXT,
    "spanId" TEXT,
    "parentSpanId" TEXT,
    "duration" INTEGER,
    "tags" TEXT[],
    "metadata" JSONB,
    "affectedEntities" JSONB,
    "stackTrace" TEXT,

    CONSTRAINT "SystemLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ApiInteraction" (
    "id" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endpoint" TEXT NOT NULL,
    "method" TEXT NOT NULL,
    "status" "ApiStatus" NOT NULL,
    "statusCode" INTEGER,
    "duration" INTEGER NOT NULL,
    "requestSize" INTEGER,
    "responseSize" INTEGER,
    "requestPayload" JSONB,
    "responsePayload" JSONB,
    "headers" JSONB,
    "source" TEXT NOT NULL,
    "moduleId" TEXT,
    "organizationId" TEXT,
    "userId" TEXT,
    "agentId" TEXT,
    "sessionId" TEXT,
    "traceId" TEXT,
    "spanId" TEXT,
    "parentSpanId" TEXT,
    "tags" TEXT[],
    "metadata" JSONB,
    "errorMessage" TEXT,
    "systemLogId" TEXT,

    CONSTRAINT "ApiInteraction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HumanApproval" (
    "id" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "requestTimestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "responseTimestamp" TIMESTAMP(3),
    "status" "ApprovalStatus" NOT NULL DEFAULT 'PENDING',
    "requestedAction" TEXT NOT NULL,
    "requestedBy" TEXT NOT NULL,
    "approvedBy" TEXT,
    "reason" TEXT,
    "originalPayload" JSONB NOT NULL,
    "modifiedPayload" JSONB,
    "moduleId" TEXT,
    "organizationId" TEXT,
    "userId" TEXT,
    "agentId" TEXT,
    "sessionId" TEXT,
    "traceId" TEXT,
    "spanId" TEXT,
    "parentSpanId" TEXT,
    "tags" TEXT[],
    "metadata" JSONB,
    "expiresAt" TIMESTAMP(3),
    "systemLogId" TEXT,
    "sentimentScore" DOUBLE PRECISION,
    "sentimentLabel" TEXT,
    "emotionalTones" TEXT[],
    "confusionDetected" BOOLEAN,
    "fatigueDetected" BOOLEAN,
    "trustScore" DOUBLE PRECISION,
    "sentimentMetadata" JSONB,

    CONSTRAINT "HumanApproval_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TelemetrySpan" (
    "id" TEXT NOT NULL,
    "traceId" TEXT NOT NULL,
    "spanId" TEXT NOT NULL,
    "parentSpanId" TEXT,
    "name" TEXT NOT NULL,
    "startTime" TIMESTAMP(3) NOT NULL,
    "endTime" TIMESTAMP(3),
    "duration" INTEGER,
    "status" TEXT NOT NULL DEFAULT 'OK',
    "attributes" JSONB,
    "events" JSONB,
    "links" JSONB,
    "moduleId" TEXT,
    "organizationId" TEXT,
    "userId" TEXT,
    "agentId" TEXT,
    "sessionId" TEXT,
    "source" TEXT NOT NULL,

    CONSTRAINT "TelemetrySpan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ModuleState" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "moduleId" TEXT NOT NULL,
    "state" JSONB NOT NULL,
    "version" TEXT NOT NULL,

    CONSTRAINT "ModuleState_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ModuleConfig" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT,
    "organizationId" TEXT,
    "moduleId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "config" JSONB NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "scope" TEXT NOT NULL DEFAULT 'user',

    CONSTRAINT "ModuleConfig_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TenantBranding" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "organizationId" TEXT NOT NULL,
    "primaryColor" TEXT,
    "secondaryColor" TEXT,
    "accentColor" TEXT,
    "logoUrl" TEXT,
    "faviconUrl" TEXT,
    "customCss" TEXT,
    "customFonts" JSONB,
    "loginBackground" TEXT,
    "emailTemplate" JSONB,

    CONSTRAINT "TenantBranding_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TenantAnalytics" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "organizationId" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "provider" TEXT,
    "trackingId" TEXT,
    "customEndpoint" TEXT,
    "eventFilters" JSONB,
    "dataRetention" INTEGER,
    "privacySettings" JSONB,

    CONSTRAINT "TenantAnalytics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AgentSession" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "sessionId" TEXT NOT NULL,
    "userId" TEXT,
    "agentId" TEXT,
    "status" TEXT NOT NULL,
    "context" JSONB,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endedAt" TIMESTAMP(3),

    CONSTRAINT "AgentSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AgentFeedback" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,
    "agentId" TEXT NOT NULL,
    "sessionId" TEXT,
    "rating" INTEGER NOT NULL,
    "feedback" TEXT,
    "category" TEXT,
    "metadata" JSONB,
    "sentimentScore" DOUBLE PRECISION,
    "sentimentLabel" TEXT,
    "emotionalTones" TEXT[],
    "confusionDetected" BOOLEAN,
    "fatigueDetected" BOOLEAN,
    "trustScore" DOUBLE PRECISION,
    "sentimentMetadata" JSONB,

    CONSTRAINT "AgentFeedback_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InteractionMemory" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,
    "agentId" TEXT NOT NULL,
    "sessionId" TEXT,
    "type" TEXT NOT NULL,
    "content" JSONB NOT NULL,
    "importance" DOUBLE PRECISION NOT NULL DEFAULT 1.0,
    "expiresAt" TIMESTAMP(3),

    CONSTRAINT "InteractionMemory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AgentEscalation" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,
    "agentId" TEXT NOT NULL,
    "sessionId" TEXT,
    "reason" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "priority" TEXT NOT NULL,
    "resolvedAt" TIMESTAMP(3),
    "resolution" TEXT,
    "metadata" JSONB,

    CONSTRAINT "AgentEscalation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TaskAudit" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,
    "agentId" TEXT NOT NULL,
    "taskId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "details" JSONB,
    "metadata" JSONB,

    CONSTRAINT "TaskAudit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "readAt" TIMESTAMP(3),
    "link" TEXT,
    "metadata" JSONB,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CredentialStore" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "metadata" JSONB,
    "expiresAt" TIMESTAMP(3),

    CONSTRAINT "CredentialStore_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "APIKey" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "lastUsed" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "permissions" TEXT[],

    CONSTRAINT "APIKey_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GlobalSettings" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "organizationId" TEXT NOT NULL,
    "settings" JSONB NOT NULL,
    "logRetentionPolicy" JSONB,

    CONSTRAINT "GlobalSettings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QueryLog" (
    "id" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "queryId" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "params" TEXT,
    "duration" DOUBLE PRECISION NOT NULL,
    "status" "QueryStatus" NOT NULL,
    "isSlow" BOOLEAN NOT NULL DEFAULT false,
    "resultSize" INTEGER,
    "errorMessage" TEXT,
    "tags" TEXT[],
    "metadata" JSONB,
    "moduleId" TEXT,
    "organizationId" TEXT,
    "userId" TEXT,

    CONSTRAINT "QueryLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QueryExecutionPlan" (
    "id" TEXT NOT NULL,
    "queryId" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "planType" TEXT NOT NULL,
    "planData" TEXT NOT NULL,
    "metadata" JSONB,

    CONSTRAINT "QueryExecutionPlan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QueryPerformanceMetric" (
    "id" TEXT NOT NULL,
    "modelAction" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "totalExecutions" INTEGER NOT NULL DEFAULT 0,
    "totalDuration" INTEGER NOT NULL DEFAULT 0,
    "totalResultSize" INTEGER NOT NULL DEFAULT 0,
    "slowExecutions" INTEGER NOT NULL DEFAULT 0,
    "averageDuration" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "averageResultSize" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "lastExecutionAt" TIMESTAMP(3),
    "moduleId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "QueryPerformanceMetric_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QueryCache" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "paramsHash" TEXT NOT NULL,
    "result" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "lastAccessedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "hitCount" INTEGER NOT NULL DEFAULT 0,
    "userId" TEXT,
    "agentId" TEXT,
    "moduleId" TEXT,

    CONSTRAINT "QueryCache_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LogArchive" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "logType" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "count" INTEGER NOT NULL,
    "storageProvider" TEXT NOT NULL,
    "archiveUrl" TEXT NOT NULL,
    "metadata" JSONB,

    CONSTRAINT "LogArchive_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AlertRule" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "type" "AlertType" NOT NULL,
    "logType" TEXT NOT NULL,
    "conditions" JSONB NOT NULL,
    "timeWindow" INTEGER NOT NULL,
    "severity" "AlertSeverity" NOT NULL,
    "notificationChannels" "NotificationChannel"[],
    "createdBy" TEXT NOT NULL,

    CONSTRAINT "AlertRule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Alert" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "ruleId" TEXT NOT NULL,
    "ruleName" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "severity" "AlertSeverity" NOT NULL,
    "status" "AlertStatus" NOT NULL DEFAULT 'active',
    "resolvedAt" TIMESTAMP(3),
    "acknowledgedBy" TEXT,
    "acknowledgedAt" TIMESTAMP(3),
    "count" INTEGER NOT NULL DEFAULT 1,
    "lastOccurrence" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "relatedLogs" TEXT[],

    CONSTRAINT "Alert_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LogAnalyticsResult" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "type" TEXT NOT NULL,
    "logType" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "result" JSONB NOT NULL,
    "metadata" JSONB,

    CONSTRAINT "LogAnalyticsResult_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LogInsight" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "insight" TEXT NOT NULL,
    "importance" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "relatedLogs" INTEGER NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "metadata" JSONB,

    CONSTRAINT "LogInsight_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LogRetentionPolicy" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "systemLogs" JSONB NOT NULL,
    "agentLogs" JSONB NOT NULL,
    "apiLogs" JSONB NOT NULL,
    "approvalLogs" JSONB NOT NULL,
    "complianceMode" BOOLEAN NOT NULL DEFAULT false,
    "organizationId" TEXT,

    CONSTRAINT "LogRetentionPolicy_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MaintenanceJob" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),
    "jobType" TEXT NOT NULL,
    "name" TEXT,
    "description" TEXT,
    "startTime" TIMESTAMP(3) NOT NULL,
    "endTime" TIMESTAMP(3) NOT NULL,
    "status" TEXT NOT NULL,
    "itemsProcessed" INTEGER NOT NULL,
    "errors" TEXT,
    "details" JSONB,
    "configuration" JSONB,
    "metadata" JSONB,
    "schedule" TEXT,
    "lastRunAt" TIMESTAMP(3),
    "nextRunAt" TIMESTAMP(3),
    "isActive" BOOLEAN DEFAULT true,

    CONSTRAINT "MaintenanceJob_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SecurityAlert" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "severity" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "metadata" JSONB,
    "resolvedAt" TIMESTAMP(3),
    "acknowledgedAt" TIMESTAMP(3),
    "scanId" TEXT,

    CONSTRAINT "SecurityAlert_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SecurityMetric" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "value" DOUBLE PRECISION NOT NULL,
    "previousValue" DOUBLE PRECISION,
    "target" DOUBLE PRECISION,
    "unit" TEXT,
    "category" TEXT NOT NULL,
    "metadata" JSONB,

    CONSTRAINT "SecurityMetric_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SecurityRecommendation" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "priority" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'open',
    "category" TEXT NOT NULL,
    "impact" TEXT NOT NULL,
    "effort" TEXT NOT NULL,
    "implementedAt" TIMESTAMP(3),
    "dismissedAt" TIMESTAMP(3),
    "metadata" JSONB,

    CONSTRAINT "SecurityRecommendation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SecurityScan" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),
    "results" JSONB,
    "summary" TEXT,
    "score" DOUBLE PRECISION,
    "metadata" JSONB,

    CONSTRAINT "SecurityScan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ComplianceCheck" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,
    "standard" TEXT NOT NULL,
    "control" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "evidence" TEXT,
    "scanId" TEXT,
    "metadata" JSONB,

    CONSTRAINT "ComplianceCheck_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LogIntegrityCheck" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,
    "checkType" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "details" TEXT,
    "logSource" TEXT NOT NULL,
    "startTimestamp" TIMESTAMP(3) NOT NULL,
    "endTimestamp" TIMESTAMP(3) NOT NULL,
    "recordsChecked" INTEGER NOT NULL,
    "issuesFound" INTEGER NOT NULL DEFAULT 0,
    "metadata" JSONB,

    CONSTRAINT "LogIntegrityCheck_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CredentialScan" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,
    "scanType" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "findings" INTEGER NOT NULL DEFAULT 0,
    "criticalFindings" INTEGER NOT NULL DEFAULT 0,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),
    "targetSystems" TEXT[],
    "summary" TEXT,
    "metadata" JSONB,

    CONSTRAINT "CredentialScan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AnomalousUsage" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,
    "detectedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "type" TEXT NOT NULL,
    "severity" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'new',
    "source" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "affectedResource" TEXT,
    "normalPattern" TEXT,
    "anomalyDetails" JSONB,
    "resolvedAt" TIMESTAMP(3),
    "metadata" JSONB,

    CONSTRAINT "AnomalousUsage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SecurityEscalation" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "severity" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'open',
    "category" TEXT NOT NULL,
    "sourceAlert" TEXT,
    "assignedTo" TEXT,
    "escalatedBy" TEXT NOT NULL,
    "escalatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "resolvedAt" TIMESTAMP(3),
    "resolutionSummary" TEXT,
    "affectedSystems" TEXT[],
    "metadata" JSONB,

    CONSTRAINT "SecurityEscalation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MfaPolicy" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "organizationId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "isEnabled" BOOLEAN NOT NULL DEFAULT true,
    "requiredMethods" INTEGER NOT NULL DEFAULT 1,
    "allowedMethods" TEXT[],
    "applyToRoles" TEXT[],
    "exemptRoles" TEXT[],
    "exemptUsers" TEXT[],
    "graceLoginCount" INTEGER NOT NULL DEFAULT 0,
    "rememberDeviceDays" INTEGER NOT NULL DEFAULT 30,
    "challengeFrequency" TEXT NOT NULL DEFAULT 'login',
    "metadata" JSONB,

    CONSTRAINT "MfaPolicy_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MfaEnrollment" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,
    "method" TEXT NOT NULL,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "verifiedAt" TIMESTAMP(3),
    "lastUsedAt" TIMESTAMP(3),
    "identifier" TEXT,
    "metadata" JSONB,

    CONSTRAINT "MfaEnrollment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AlertThreshold" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "metricName" TEXT NOT NULL,
    "operator" TEXT NOT NULL,
    "threshold" DOUBLE PRECISION NOT NULL,
    "severity" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "cooldownMinutes" INTEGER NOT NULL DEFAULT 60,
    "notificationChannels" TEXT[],
    "metadata" JSONB,

    CONSTRAINT "AlertThreshold_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SchemaMap" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "version" TEXT NOT NULL,
    "schema" JSONB NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdById" TEXT NOT NULL,
    "organizationId" TEXT,

    CONSTRAINT "SchemaMap_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AgentQueryPermission" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "agentId" TEXT NOT NULL,
    "schemaMapId" TEXT NOT NULL,
    "permissionLevel" "QueryPermissionLevel" NOT NULL DEFAULT 'READ_ONLY',
    "allowedModels" TEXT[],
    "allowedActions" TEXT[],
    "maxQueriesPerDay" INTEGER NOT NULL DEFAULT 100,
    "requiresApproval" BOOLEAN NOT NULL DEFAULT true,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "AgentQueryPermission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AgentQueryRequest" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "agentId" TEXT NOT NULL,
    "sessionId" TEXT,
    "userId" TEXT NOT NULL,
    "prompt" TEXT NOT NULL,
    "generatedQuery" TEXT NOT NULL,
    "queryParams" JSONB,
    "targetModel" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "status" "QueryApprovalStatus" NOT NULL DEFAULT 'PENDING',
    "approvedById" TEXT,
    "approvedAt" TIMESTAMP(3),
    "rejectionReason" TEXT,
    "executedAt" TIMESTAMP(3),
    "executionResult" JSONB,
    "executionError" TEXT,
    "queryLogId" TEXT,
    "validationResults" JSONB,
    "metadata" JSONB,

    CONSTRAINT "AgentQueryRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QueryTemplate" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "template" TEXT NOT NULL,
    "targetModel" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "parameterSchema" JSONB NOT NULL,
    "category" TEXT,
    "isAutoApproved" BOOLEAN NOT NULL DEFAULT false,
    "createdById" TEXT NOT NULL,
    "organizationId" TEXT,

    CONSTRAINT "QueryTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TriggerSource" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "type" "TriggerSourceType" NOT NULL,
    "moduleId" TEXT,
    "configuration" JSONB,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "TriggerSource_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AgentTrigger" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "sourceId" TEXT NOT NULL,
    "sourceType" "TriggerSourceType" NOT NULL,
    "agentId" TEXT,
    "workflowId" TEXT,
    "userId" TEXT,
    "sessionId" TEXT,
    "originatingEventId" TEXT,
    "payload" JSONB,
    "metadata" JSONB,
    "traceId" TEXT,
    "spanId" TEXT,
    "parentSpanId" TEXT,
    "tags" TEXT[],
    "executionId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "completedAt" TIMESTAMP(3),
    "duration" INTEGER,
    "error" TEXT,

    CONSTRAINT "AgentTrigger_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TriggerExecutionFlow" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "triggerId" TEXT NOT NULL,
    "executionId" TEXT NOT NULL,
    "stepNumber" INTEGER NOT NULL,
    "stepType" TEXT NOT NULL,
    "stepId" TEXT,
    "stepName" TEXT,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "input" JSONB,
    "output" JSONB,
    "error" TEXT,
    "duration" INTEGER,
    "metadata" JSONB,

    CONSTRAINT "TriggerExecutionFlow_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AIResponseCache" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "key" TEXT NOT NULL,
    "promptHash" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "response" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "lastAccessedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "hitCount" INTEGER NOT NULL DEFAULT 0,
    "userId" TEXT,
    "module" TEXT,
    "requestType" TEXT,
    "metadata" JSONB,

    CONSTRAINT "AIResponseCache_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AIBenchmark" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "modelName" TEXT NOT NULL,
    "promptTokens" INTEGER NOT NULL,
    "completionTokens" INTEGER NOT NULL,
    "totalTokens" INTEGER NOT NULL,
    "latencyMs" DOUBLE PRECISION NOT NULL,
    "tokensPerSecond" DOUBLE PRECISION NOT NULL,
    "category" TEXT NOT NULL,
    "metadata" JSONB,
    "userId" TEXT,

    CONSTRAINT "AIBenchmark_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserTokenUsage" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "date" TEXT NOT NULL,
    "promptTokens" INTEGER NOT NULL DEFAULT 0,
    "completionTokens" INTEGER NOT NULL DEFAULT 0,
    "totalTokens" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "UserTokenUsage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PerformanceAlert" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "type" TEXT NOT NULL,
    "severity" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "metadata" JSONB,
    "acknowledged" BOOLEAN NOT NULL DEFAULT false,
    "acknowledgedBy" TEXT,
    "acknowledgedAt" TIMESTAMP(3),

    CONSTRAINT "PerformanceAlert_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ThreatFeed" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "type" TEXT NOT NULL,
    "url" TEXT,
    "apiKey" TEXT,
    "refreshInterval" INTEGER NOT NULL DEFAULT 3600,
    "lastRefreshed" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "configuration" JSONB,
    "metadata" JSONB,

    CONSTRAINT "ThreatFeed_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ThreatMonitor" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "type" TEXT NOT NULL,
    "keywords" TEXT[],
    "severity" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "notificationEnabled" BOOLEAN NOT NULL DEFAULT true,
    "configuration" JSONB,
    "metadata" JSONB,

    CONSTRAINT "ThreatMonitor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BrandAlert" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,
    "monitorId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "brandName" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "severity" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'new',
    "detectedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "resolvedAt" TIMESTAMP(3),
    "threatFeedId" TEXT,
    "rawData" JSONB,
    "metadata" JSONB,

    CONSTRAINT "BrandAlert_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CVEAlert" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,
    "cveId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "severity" TEXT NOT NULL,
    "cvssScore" DOUBLE PRECISION,
    "affectedSystems" TEXT[],
    "status" TEXT NOT NULL DEFAULT 'new',
    "publishedAt" TIMESTAMP(3),
    "patchAvailable" BOOLEAN NOT NULL DEFAULT false,
    "patchUrl" TEXT,
    "threatFeedId" TEXT,
    "metadata" JSONB,

    CONSTRAINT "CVEAlert_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PhishingVector" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "targetedBrand" TEXT,
    "severity" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'active',
    "detectedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "resolvedAt" TIMESTAMP(3),
    "indicators" TEXT[],
    "threatFeedId" TEXT,
    "metadata" JSONB,

    CONSTRAINT "PhishingVector_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ThreatIntelligence" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "severity" TEXT NOT NULL,
    "confidence" TEXT NOT NULL,
    "publishedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3),
    "indicators" JSONB,
    "threatFeedId" TEXT,
    "metadata" JSONB,

    CONSTRAINT "ThreatIntelligence_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SentinelLogIntegration" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "type" TEXT NOT NULL,
    "configuration" JSONB,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "lastSyncedAt" TIMESTAMP(3),
    "metadata" JSONB,

    CONSTRAINT "SentinelLogIntegration_pkey" PRIMARY KEY ("id")
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
CREATE TABLE "AIPrompt" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "content" TEXT NOT NULL,
    "name" TEXT,
    "description" TEXT,
    "version" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "module" TEXT NOT NULL,
    "category" TEXT,
    "tags" TEXT[],
    "templateVariables" JSONB,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "safetyScore" DOUBLE PRECISION,
    "estimatedTokens" INTEGER,
    "createdById" TEXT NOT NULL,
    "organizationId" TEXT,

    CONSTRAINT "AIPrompt_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AISystemPrompt" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "content" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "version" TEXT NOT NULL,
    "module" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "promptId" TEXT,
    "createdById" TEXT NOT NULL,
    "organizationId" TEXT,

    CONSTRAINT "AISystemPrompt_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AIReasoning" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "sessionId" TEXT NOT NULL,
    "promptId" TEXT NOT NULL,
    "systemPromptId" TEXT,
    "agentId" TEXT,
    "userId" TEXT NOT NULL,
    "steps" JSONB NOT NULL,
    "rawOutput" TEXT NOT NULL,
    "parsedOutput" JSONB,
    "model" TEXT NOT NULL,
    "temperature" DOUBLE PRECISION NOT NULL,
    "maxTokens" INTEGER,
    "totalTokens" INTEGER,
    "promptTokens" INTEGER,
    "completionTokens" INTEGER,
    "latencyMs" INTEGER,
    "success" BOOLEAN NOT NULL DEFAULT true,
    "error" TEXT,
    "metadata" JSONB,

    CONSTRAINT "AIReasoning_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AIResponseNode" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reasoningId" TEXT NOT NULL,
    "parentId" TEXT,
    "content" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "metadata" JSONB,
    "confidence" DOUBLE PRECISION,

    CONSTRAINT "AIResponseNode_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AISession" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,
    "agentId" TEXT,
    "module" TEXT NOT NULL,
    "sessionType" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),
    "metadata" JSONB,
    "feedback" JSONB,
    "totalTokens" INTEGER,
    "totalLatencyMs" INTEGER,

    CONSTRAINT "AISession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AIThoughtTrace" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "agentId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "sessionId" TEXT,
    "moduleId" TEXT NOT NULL,
    "intent" TEXT NOT NULL,
    "decisionPath" JSONB NOT NULL,
    "dbOperation" TEXT NOT NULL,
    "dbEntity" TEXT NOT NULL,
    "dbQuery" TEXT NOT NULL,
    "queryParams" JSONB,
    "resultSummary" TEXT,
    "affectedRecords" JSONB,
    "humanApproved" BOOLEAN,
    "humanApprovedBy" TEXT,
    "humanApprovedAt" TIMESTAMP(3),
    "humanFeedback" TEXT,
    "rollbackStatus" TEXT,
    "rollbackId" TEXT,
    "traceId" TEXT,
    "metadata" JSONB,
    "checkpointId" TEXT,

    CONSTRAINT "AIThoughtTrace_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AIThoughtRollback" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "traceId" TEXT NOT NULL,
    "rollbackOperation" TEXT NOT NULL,
    "rollbackQuery" TEXT NOT NULL,
    "rollbackParams" JSONB,
    "status" TEXT NOT NULL,
    "errorMessage" TEXT,
    "executedAt" TIMESTAMP(3),
    "executedBy" TEXT,
    "metadata" JSONB,

    CONSTRAINT "AIThoughtRollback_pkey" PRIMARY KEY ("id")
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

-- CreateTable
CREATE TABLE "SentientLoopWebhook" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "secret" TEXT NOT NULL,
    "description" TEXT,
    "events" TEXT[],
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "metadata" JSONB,
    "lastDeliveryAt" TIMESTAMP(3),
    "failureCount" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "SentientLoopWebhook_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WebhookDelivery" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "webhookId" TEXT NOT NULL,
    "eventType" TEXT NOT NULL,
    "payload" JSONB NOT NULL,
    "status" TEXT NOT NULL,
    "statusCode" INTEGER NOT NULL,
    "responseBody" JSONB,
    "deliveredAt" TIMESTAMP(3) NOT NULL,
    "retryCount" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "WebhookDelivery_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SentientLoopApiKey" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "key" TEXT NOT NULL,
    "permissions" TEXT[],
    "lastUsedAt" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "SentientLoopApiKey_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EthicalRule" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "type" "EthicalRuleType" NOT NULL,
    "ruleDefinition" JSONB NOT NULL,
    "severity" "EthicalSeverity" NOT NULL DEFAULT 'MEDIUM',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "organizationId" TEXT,
    "industryContext" TEXT,
    "regulatoryContext" TEXT,
    "metadata" JSONB,

    CONSTRAINT "EthicalRule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AlignmentCheck" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "agentId" TEXT NOT NULL,
    "userId" TEXT,
    "sessionId" TEXT,
    "moduleId" TEXT,
    "content" TEXT NOT NULL,
    "contentType" TEXT NOT NULL,
    "alignmentScore" DOUBLE PRECISION NOT NULL,
    "ruleId" TEXT NOT NULL,
    "matchedPattern" TEXT,
    "severity" "EthicalSeverity" NOT NULL,
    "status" TEXT NOT NULL,
    "reviewedBy" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "reviewNotes" TEXT,
    "metadata" JSONB,

    CONSTRAINT "AlignmentCheck_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CollaborationArchive" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,
    "organizationId" TEXT,
    "archiveType" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "sourceSessionId" TEXT,
    "startTimestamp" TIMESTAMP(3) NOT NULL,
    "endTimestamp" TIMESTAMP(3) NOT NULL,
    "contentHash" TEXT NOT NULL,
    "signatureHash" TEXT NOT NULL,
    "encryptionMethod" TEXT,
    "retentionPolicy" TEXT NOT NULL,
    "complianceStandards" TEXT[],
    "metadata" JSONB,
    "verificationLog" JSONB,

    CONSTRAINT "CollaborationArchive_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ArchiveContent" (
    "id" TEXT NOT NULL,
    "archiveId" TEXT NOT NULL,
    "content" BYTEA NOT NULL,
    "contentType" TEXT NOT NULL,
    "compressionType" TEXT,
    "originalSize" INTEGER,

    CONSTRAINT "ArchiveContent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ArchiveVerification" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "archiveId" TEXT NOT NULL,
    "verifiedBy" TEXT NOT NULL,
    "verificationMethod" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "details" TEXT,
    "metadata" JSONB,

    CONSTRAINT "ArchiveVerification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ArchiveAccessLog" (
    "id" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "archiveId" TEXT NOT NULL,
    "accessedBy" TEXT NOT NULL,
    "accessType" TEXT NOT NULL,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "reason" TEXT,
    "metadata" JSONB,

    CONSTRAINT "ArchiveAccessLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ArchiveRetentionPolicy" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "retentionPeriod" INTEGER NOT NULL,
    "archiveType" TEXT[],
    "complianceStandards" TEXT[],
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "metadata" JSONB,

    CONSTRAINT "ArchiveRetentionPolicy_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AgentTrustScore" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "agentId" TEXT NOT NULL,
    "experiencePoints" INTEGER NOT NULL DEFAULT 0,
    "level" INTEGER NOT NULL DEFAULT 1,
    "trustScore" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "successfulTasks" INTEGER NOT NULL DEFAULT 0,
    "failedTasks" INTEGER NOT NULL DEFAULT 0,
    "positiveRatings" INTEGER NOT NULL DEFAULT 0,
    "negativeRatings" INTEGER NOT NULL DEFAULT 0,
    "neutralRatings" INTEGER NOT NULL DEFAULT 0,
    "feedbackCount" INTEGER NOT NULL DEFAULT 0,
    "approvalRate" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "responseAccuracy" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "lastLevelUpAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "metadata" JSONB,

    CONSTRAINT "AgentTrustScore_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TrustBadge" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "tier" TEXT NOT NULL,
    "iconUrl" TEXT,
    "requirement" TEXT NOT NULL,
    "requirementValue" INTEGER NOT NULL,
    "requirementType" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "TrustBadge_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EarnedBadge" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "badgeId" TEXT NOT NULL,
    "trustScoreId" TEXT NOT NULL,
    "earnedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EarnedBadge_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_AgentToWorkflow" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_AgentToWorkflow_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_AgentPersonaToPersonaTrait" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_AgentPersonaToPersonaTrait_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_SessionPrompts" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_SessionPrompts_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_SessionSystemPrompts" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_SessionSystemPrompts_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- CreateIndex
CREATE UNIQUE INDEX "User_paymentProcessorUserId_key" ON "User"("paymentProcessorUserId");

-- CreateIndex
CREATE INDEX "User_email_idx" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_roleId_idx" ON "User"("roleId");

-- CreateIndex
CREATE INDEX "User_organizationId_idx" ON "User"("organizationId");

-- CreateIndex
CREATE UNIQUE INDEX "DailyStats_date_key" ON "DailyStats"("date");

-- CreateIndex
CREATE UNIQUE INDEX "Agent_userId_name_key" ON "Agent"("userId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "Workflow_userId_name_key" ON "Workflow"("userId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "WorkflowDesign_workflowId_key" ON "WorkflowDesign"("workflowId");

-- CreateIndex
CREATE UNIQUE INDEX "LangGraphState_executionId_key" ON "LangGraphState"("executionId");

-- CreateIndex
CREATE INDEX "LangGraphState_userId_idx" ON "LangGraphState"("userId");

-- CreateIndex
CREATE INDEX "LangGraphState_workflowId_idx" ON "LangGraphState"("workflowId");

-- CreateIndex
CREATE INDEX "LangGraphState_executionId_idx" ON "LangGraphState"("executionId");

-- CreateIndex
CREATE INDEX "LangGraphState_graphId_idx" ON "LangGraphState"("graphId");

-- CreateIndex
CREATE INDEX "LangGraphState_status_idx" ON "LangGraphState"("status");

-- CreateIndex
CREATE INDEX "LangGraphState_checkpointedAt_idx" ON "LangGraphState"("checkpointedAt");

-- CreateIndex
CREATE INDEX "LangGraphState_expiresAt_idx" ON "LangGraphState"("expiresAt");

-- CreateIndex
CREATE INDEX "LangGraphNode_graphStateId_idx" ON "LangGraphNode"("graphStateId");

-- CreateIndex
CREATE INDEX "LangGraphNode_type_idx" ON "LangGraphNode"("type");

-- CreateIndex
CREATE UNIQUE INDEX "LangGraphNode_graphStateId_nodeId_key" ON "LangGraphNode"("graphStateId", "nodeId");

-- CreateIndex
CREATE INDEX "LangGraphEdge_graphStateId_idx" ON "LangGraphEdge"("graphStateId");

-- CreateIndex
CREATE INDEX "LangGraphEdge_sourceNodeId_idx" ON "LangGraphEdge"("sourceNodeId");

-- CreateIndex
CREATE INDEX "LangGraphEdge_targetNodeId_idx" ON "LangGraphEdge"("targetNodeId");

-- CreateIndex
CREATE INDEX "LangGraphNodeExecution_graphStateId_idx" ON "LangGraphNodeExecution"("graphStateId");

-- CreateIndex
CREATE INDEX "LangGraphNodeExecution_nodeId_idx" ON "LangGraphNodeExecution"("nodeId");

-- CreateIndex
CREATE INDEX "LangGraphNodeExecution_status_idx" ON "LangGraphNodeExecution"("status");

-- CreateIndex
CREATE INDEX "LangGraphNodeExecution_startedAt_idx" ON "LangGraphNodeExecution"("startedAt");

-- CreateIndex
CREATE INDEX "WorkflowNode_designId_idx" ON "WorkflowNode"("designId");

-- CreateIndex
CREATE INDEX "WorkflowNode_type_idx" ON "WorkflowNode"("type");

-- CreateIndex
CREATE INDEX "WorkflowConnection_designId_idx" ON "WorkflowConnection"("designId");

-- CreateIndex
CREATE INDEX "WorkflowConnection_sourceId_idx" ON "WorkflowConnection"("sourceId");

-- CreateIndex
CREATE INDEX "WorkflowConnection_targetId_idx" ON "WorkflowConnection"("targetId");

-- CreateIndex
CREATE UNIQUE INDEX "WorkflowExecution_triggerId_key" ON "WorkflowExecution"("triggerId");

-- CreateIndex
CREATE INDEX "WorkflowExecution_triggerId_idx" ON "WorkflowExecution"("triggerId");

-- CreateIndex
CREATE INDEX "WorkflowExecution_isLangGraph_idx" ON "WorkflowExecution"("isLangGraph");

-- CreateIndex
CREATE UNIQUE INDEX "DataSource_userId_name_key" ON "DataSource"("userId", "name");

-- CreateIndex
CREATE INDEX "FeedbackEntry_sentimentLabel_idx" ON "FeedbackEntry"("sentimentLabel");

-- CreateIndex
CREATE INDEX "FeedbackEntry_confusionDetected_idx" ON "FeedbackEntry"("confusionDetected");

-- CreateIndex
CREATE INDEX "FeedbackEntry_fatigueDetected_idx" ON "FeedbackEntry"("fatigueDetected");

-- CreateIndex
CREATE UNIQUE INDEX "RevenueStream_userId_name_key" ON "RevenueStream"("userId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "OsintSource_userId_name_key" ON "OsintSource"("userId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "OsintWebhook_userId_name_key" ON "OsintWebhook"("userId", "name");

-- CreateIndex
CREATE INDEX "BusinessMetric_userId_idx" ON "BusinessMetric"("userId");

-- CreateIndex
CREATE INDEX "BusinessMetric_category_idx" ON "BusinessMetric"("category");

-- CreateIndex
CREATE INDEX "BusinessMetric_date_idx" ON "BusinessMetric"("date");

-- CreateIndex
CREATE INDEX "BusinessInsight_userId_idx" ON "BusinessInsight"("userId");

-- CreateIndex
CREATE INDEX "BusinessInsight_category_idx" ON "BusinessInsight"("category");

-- CreateIndex
CREATE INDEX "BusinessInsight_impact_idx" ON "BusinessInsight"("impact");

-- CreateIndex
CREATE INDEX "BusinessRecommendation_userId_idx" ON "BusinessRecommendation"("userId");

-- CreateIndex
CREATE INDEX "BusinessRecommendation_category_idx" ON "BusinessRecommendation"("category");

-- CreateIndex
CREATE INDEX "BusinessRecommendation_impact_idx" ON "BusinessRecommendation"("impact");

-- CreateIndex
CREATE INDEX "CampaignSuggestion_userId_idx" ON "CampaignSuggestion"("userId");

-- CreateIndex
CREATE INDEX "CampaignSuggestion_status_idx" ON "CampaignSuggestion"("status");

-- CreateIndex
CREATE INDEX "CampaignSuggestion_estimatedImpact_idx" ON "CampaignSuggestion"("estimatedImpact");

-- CreateIndex
CREATE INDEX "StrategicDecision_userId_idx" ON "StrategicDecision"("userId");

-- CreateIndex
CREATE INDEX "StrategicDecision_isResolved_idx" ON "StrategicDecision"("isResolved");

-- CreateIndex
CREATE INDEX "StrategicDecision_impact_idx" ON "StrategicDecision"("impact");

-- CreateIndex
CREATE INDEX "StrategicOption_decisionId_idx" ON "StrategicOption"("decisionId");

-- CreateIndex
CREATE INDEX "GrowthMetric_userId_idx" ON "GrowthMetric"("userId");

-- CreateIndex
CREATE INDEX "GrowthMetric_category_idx" ON "GrowthMetric"("category");

-- CreateIndex
CREATE INDEX "HistoricalValue_growthMetricId_idx" ON "HistoricalValue"("growthMetricId");

-- CreateIndex
CREATE INDEX "HistoricalValue_date_idx" ON "HistoricalValue"("date");

-- CreateIndex
CREATE INDEX "ForecastValue_growthMetricId_idx" ON "ForecastValue"("growthMetricId");

-- CreateIndex
CREATE INDEX "ForecastValue_date_idx" ON "ForecastValue"("date");

-- CreateIndex
CREATE INDEX "MarketData_userId_idx" ON "MarketData"("userId");

-- CreateIndex
CREATE INDEX "MarketData_category_idx" ON "MarketData"("category");

-- CreateIndex
CREATE INDEX "MarketData_date_idx" ON "MarketData"("date");

-- CreateIndex
CREATE INDEX "MarketData_impact_idx" ON "MarketData"("impact");

-- CreateIndex
CREATE INDEX "StrategicRecommendation_userId_idx" ON "StrategicRecommendation"("userId");

-- CreateIndex
CREATE INDEX "StrategicRecommendation_category_idx" ON "StrategicRecommendation"("category");

-- CreateIndex
CREATE INDEX "StrategicRecommendation_impact_idx" ON "StrategicRecommendation"("impact");

-- CreateIndex
CREATE INDEX "StrategicRecommendation_timeframe_idx" ON "StrategicRecommendation"("timeframe");

-- CreateIndex
CREATE INDEX "StrategicRecommendation_isImplemented_idx" ON "StrategicRecommendation"("isImplemented");

-- CreateIndex
CREATE INDEX "ExecutiveSummary_userId_idx" ON "ExecutiveSummary"("userId");

-- CreateIndex
CREATE INDEX "ExecutiveSummary_timeframe_idx" ON "ExecutiveSummary"("timeframe");

-- CreateIndex
CREATE INDEX "ExecutiveSummary_createdAt_idx" ON "ExecutiveSummary"("createdAt");

-- CreateIndex
CREATE INDEX "MarketDataSource_name_idx" ON "MarketDataSource"("name");

-- CreateIndex
CREATE INDEX "MarketDataSource_type_idx" ON "MarketDataSource"("type");

-- CreateIndex
CREATE INDEX "MarketDataSource_isActive_idx" ON "MarketDataSource"("isActive");

-- CreateIndex
CREATE INDEX "DataPoint_sourceId_idx" ON "DataPoint"("sourceId");

-- CreateIndex
CREATE INDEX "DataPoint_name_idx" ON "DataPoint"("name");

-- CreateIndex
CREATE INDEX "DataPoint_date_idx" ON "DataPoint"("date");

-- CreateIndex
CREATE UNIQUE INDEX "Role_name_key" ON "Role"("name");

-- CreateIndex
CREATE INDEX "Role_name_idx" ON "Role"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Permission_name_key" ON "Permission"("name");

-- CreateIndex
CREATE INDEX "Permission_resource_action_idx" ON "Permission"("resource", "action");

-- CreateIndex
CREATE UNIQUE INDEX "Permission_resource_action_key" ON "Permission"("resource", "action");

-- CreateIndex
CREATE INDEX "RolePermission_roleId_idx" ON "RolePermission"("roleId");

-- CreateIndex
CREATE INDEX "RolePermission_permissionId_idx" ON "RolePermission"("permissionId");

-- CreateIndex
CREATE UNIQUE INDEX "RolePermission_roleId_permissionId_key" ON "RolePermission"("roleId", "permissionId");

-- CreateIndex
CREATE INDEX "UserPermission_userId_idx" ON "UserPermission"("userId");

-- CreateIndex
CREATE INDEX "UserPermission_permissionId_idx" ON "UserPermission"("permissionId");

-- CreateIndex
CREATE UNIQUE INDEX "UserPermission_userId_permissionId_key" ON "UserPermission"("userId", "permissionId");

-- CreateIndex
CREATE UNIQUE INDEX "Organization_tenantId_key" ON "Organization"("tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "Organization_tenantDomain_key" ON "Organization"("tenantDomain");

-- CreateIndex
CREATE INDEX "Organization_name_idx" ON "Organization"("name");

-- CreateIndex
CREATE INDEX "Organization_tenantId_idx" ON "Organization"("tenantId");

-- CreateIndex
CREATE INDEX "Organization_tenantDomain_idx" ON "Organization"("tenantDomain");

-- CreateIndex
CREATE UNIQUE INDEX "SubscriptionPlan_tier_key" ON "SubscriptionPlan"("tier");

-- CreateIndex
CREATE UNIQUE INDEX "SubscriptionPlan_stripePriceId_key" ON "SubscriptionPlan"("stripePriceId");

-- CreateIndex
CREATE INDEX "SubscriptionPlan_tier_idx" ON "SubscriptionPlan"("tier");

-- CreateIndex
CREATE INDEX "SubscriptionPlan_isActive_idx" ON "SubscriptionPlan"("isActive");

-- CreateIndex
CREATE UNIQUE INDEX "Subscription_organizationId_key" ON "Subscription"("organizationId");

-- CreateIndex
CREATE INDEX "Subscription_organizationId_idx" ON "Subscription"("organizationId");

-- CreateIndex
CREATE INDEX "Subscription_planId_idx" ON "Subscription"("planId");

-- CreateIndex
CREATE INDEX "Subscription_status_idx" ON "Subscription"("status");

-- CreateIndex
CREATE INDEX "SubscriptionInvoice_subscriptionId_idx" ON "SubscriptionInvoice"("subscriptionId");

-- CreateIndex
CREATE INDEX "SubscriptionInvoice_organizationId_idx" ON "SubscriptionInvoice"("organizationId");

-- CreateIndex
CREATE INDEX "SubscriptionInvoice_status_idx" ON "SubscriptionInvoice"("status");

-- CreateIndex
CREATE INDEX "AI_Agent_userId_idx" ON "AI_Agent"("userId");

-- CreateIndex
CREATE INDEX "AI_Agent_type_idx" ON "AI_Agent"("type");

-- CreateIndex
CREATE INDEX "AI_Agent_personaId_idx" ON "AI_Agent"("personaId");

-- CreateIndex
CREATE UNIQUE INDEX "AI_Agent_userId_name_key" ON "AI_Agent"("userId", "name");

-- CreateIndex
CREATE INDEX "AgentPersona_name_idx" ON "AgentPersona"("name");

-- CreateIndex
CREATE INDEX "AgentPersona_category_idx" ON "AgentPersona"("category");

-- CreateIndex
CREATE INDEX "AgentPersona_isPublic_idx" ON "AgentPersona"("isPublic");

-- CreateIndex
CREATE INDEX "AgentPersona_createdById_idx" ON "AgentPersona"("createdById");

-- CreateIndex
CREATE INDEX "AgentPersona_organizationId_idx" ON "AgentPersona"("organizationId");

-- CreateIndex
CREATE INDEX "AgentPersona_forkedFromId_idx" ON "AgentPersona"("forkedFromId");

-- CreateIndex
CREATE UNIQUE INDEX "AgentPersona_name_createdById_key" ON "AgentPersona"("name", "createdById");

-- CreateIndex
CREATE INDEX "PersonaTrait_name_idx" ON "PersonaTrait"("name");

-- CreateIndex
CREATE INDEX "PersonaTrait_category_idx" ON "PersonaTrait"("category");

-- CreateIndex
CREATE INDEX "PersonaTrait_isPublic_idx" ON "PersonaTrait"("isPublic");

-- CreateIndex
CREATE INDEX "PersonaTrait_createdById_idx" ON "PersonaTrait"("createdById");

-- CreateIndex
CREATE UNIQUE INDEX "PersonaTrait_name_createdById_key" ON "PersonaTrait"("name", "createdById");

-- CreateIndex
CREATE INDEX "PersonaMemoryScope_personaId_idx" ON "PersonaMemoryScope"("personaId");

-- CreateIndex
CREATE INDEX "PersonaMemoryScope_scope_idx" ON "PersonaMemoryScope"("scope");

-- CreateIndex
CREATE INDEX "PersonaMemoryScope_retention_idx" ON "PersonaMemoryScope"("retention");

-- CreateIndex
CREATE UNIQUE INDEX "PersonaMemoryScope_name_personaId_key" ON "PersonaMemoryScope"("name", "personaId");

-- CreateIndex
CREATE INDEX "AgentLog_agentId_idx" ON "AgentLog"("agentId");

-- CreateIndex
CREATE INDEX "AgentLog_userId_idx" ON "AgentLog"("userId");

-- CreateIndex
CREATE INDEX "AgentLog_sessionId_idx" ON "AgentLog"("sessionId");

-- CreateIndex
CREATE INDEX "AgentLog_level_idx" ON "AgentLog"("level");

-- CreateIndex
CREATE INDEX "AgentLog_category_idx" ON "AgentLog"("category");

-- CreateIndex
CREATE INDEX "AgentLog_createdAt_idx" ON "AgentLog"("createdAt");

-- CreateIndex
CREATE INDEX "AgentLog_timestamp_idx" ON "AgentLog"("timestamp");

-- CreateIndex
CREATE INDEX "AgentLog_traceId_idx" ON "AgentLog"("traceId");

-- CreateIndex
CREATE INDEX "AgentLog_spanId_idx" ON "AgentLog"("spanId");

-- CreateIndex
CREATE INDEX "AgentLog_tags_idx" ON "AgentLog"("tags");

-- CreateIndex
CREATE INDEX "SystemLog_timestamp_idx" ON "SystemLog"("timestamp");

-- CreateIndex
CREATE INDEX "SystemLog_level_idx" ON "SystemLog"("level");

-- CreateIndex
CREATE INDEX "SystemLog_category_idx" ON "SystemLog"("category");

-- CreateIndex
CREATE INDEX "SystemLog_userId_idx" ON "SystemLog"("userId");

-- CreateIndex
CREATE INDEX "SystemLog_agentId_idx" ON "SystemLog"("agentId");

-- CreateIndex
CREATE INDEX "SystemLog_sessionId_idx" ON "SystemLog"("sessionId");

-- CreateIndex
CREATE INDEX "SystemLog_traceId_idx" ON "SystemLog"("traceId");

-- CreateIndex
CREATE INDEX "SystemLog_spanId_idx" ON "SystemLog"("spanId");

-- CreateIndex
CREATE INDEX "SystemLog_tags_idx" ON "SystemLog"("tags");

-- CreateIndex
CREATE INDEX "ApiInteraction_timestamp_idx" ON "ApiInteraction"("timestamp");

-- CreateIndex
CREATE INDEX "ApiInteraction_endpoint_idx" ON "ApiInteraction"("endpoint");

-- CreateIndex
CREATE INDEX "ApiInteraction_status_idx" ON "ApiInteraction"("status");

-- CreateIndex
CREATE INDEX "ApiInteraction_userId_idx" ON "ApiInteraction"("userId");

-- CreateIndex
CREATE INDEX "ApiInteraction_traceId_idx" ON "ApiInteraction"("traceId");

-- CreateIndex
CREATE INDEX "ApiInteraction_tags_idx" ON "ApiInteraction"("tags");

-- CreateIndex
CREATE INDEX "HumanApproval_timestamp_idx" ON "HumanApproval"("timestamp");

-- CreateIndex
CREATE INDEX "HumanApproval_status_idx" ON "HumanApproval"("status");

-- CreateIndex
CREATE INDEX "HumanApproval_userId_idx" ON "HumanApproval"("userId");

-- CreateIndex
CREATE INDEX "HumanApproval_agentId_idx" ON "HumanApproval"("agentId");

-- CreateIndex
CREATE INDEX "HumanApproval_traceId_idx" ON "HumanApproval"("traceId");

-- CreateIndex
CREATE INDEX "HumanApproval_tags_idx" ON "HumanApproval"("tags");

-- CreateIndex
CREATE INDEX "HumanApproval_sentimentLabel_idx" ON "HumanApproval"("sentimentLabel");

-- CreateIndex
CREATE INDEX "HumanApproval_confusionDetected_idx" ON "HumanApproval"("confusionDetected");

-- CreateIndex
CREATE INDEX "HumanApproval_fatigueDetected_idx" ON "HumanApproval"("fatigueDetected");

-- CreateIndex
CREATE INDEX "TelemetrySpan_traceId_idx" ON "TelemetrySpan"("traceId");

-- CreateIndex
CREATE INDEX "TelemetrySpan_spanId_idx" ON "TelemetrySpan"("spanId");

-- CreateIndex
CREATE INDEX "TelemetrySpan_parentSpanId_idx" ON "TelemetrySpan"("parentSpanId");

-- CreateIndex
CREATE INDEX "TelemetrySpan_startTime_idx" ON "TelemetrySpan"("startTime");

-- CreateIndex
CREATE INDEX "TelemetrySpan_userId_idx" ON "TelemetrySpan"("userId");

-- CreateIndex
CREATE INDEX "TelemetrySpan_agentId_idx" ON "TelemetrySpan"("agentId");

-- CreateIndex
CREATE INDEX "ModuleState_moduleId_idx" ON "ModuleState"("moduleId");

-- CreateIndex
CREATE INDEX "ModuleConfig_moduleId_idx" ON "ModuleConfig"("moduleId");

-- CreateIndex
CREATE INDEX "ModuleConfig_userId_idx" ON "ModuleConfig"("userId");

-- CreateIndex
CREATE INDEX "ModuleConfig_organizationId_idx" ON "ModuleConfig"("organizationId");

-- CreateIndex
CREATE UNIQUE INDEX "ModuleConfig_moduleId_name_userId_organizationId_key" ON "ModuleConfig"("moduleId", "name", "userId", "organizationId");

-- CreateIndex
CREATE UNIQUE INDEX "TenantBranding_organizationId_key" ON "TenantBranding"("organizationId");

-- CreateIndex
CREATE UNIQUE INDEX "TenantAnalytics_organizationId_key" ON "TenantAnalytics"("organizationId");

-- CreateIndex
CREATE UNIQUE INDEX "AgentSession_sessionId_key" ON "AgentSession"("sessionId");

-- CreateIndex
CREATE INDEX "AgentSession_sessionId_idx" ON "AgentSession"("sessionId");

-- CreateIndex
CREATE INDEX "AgentSession_userId_idx" ON "AgentSession"("userId");

-- CreateIndex
CREATE INDEX "AgentSession_agentId_idx" ON "AgentSession"("agentId");

-- CreateIndex
CREATE INDEX "AgentSession_status_idx" ON "AgentSession"("status");

-- CreateIndex
CREATE INDEX "AgentFeedback_userId_idx" ON "AgentFeedback"("userId");

-- CreateIndex
CREATE INDEX "AgentFeedback_agentId_idx" ON "AgentFeedback"("agentId");

-- CreateIndex
CREATE INDEX "AgentFeedback_sessionId_idx" ON "AgentFeedback"("sessionId");

-- CreateIndex
CREATE INDEX "AgentFeedback_rating_idx" ON "AgentFeedback"("rating");

-- CreateIndex
CREATE INDEX "AgentFeedback_sentimentLabel_idx" ON "AgentFeedback"("sentimentLabel");

-- CreateIndex
CREATE INDEX "AgentFeedback_confusionDetected_idx" ON "AgentFeedback"("confusionDetected");

-- CreateIndex
CREATE INDEX "AgentFeedback_fatigueDetected_idx" ON "AgentFeedback"("fatigueDetected");

-- CreateIndex
CREATE INDEX "InteractionMemory_userId_idx" ON "InteractionMemory"("userId");

-- CreateIndex
CREATE INDEX "InteractionMemory_agentId_idx" ON "InteractionMemory"("agentId");

-- CreateIndex
CREATE INDEX "InteractionMemory_sessionId_idx" ON "InteractionMemory"("sessionId");

-- CreateIndex
CREATE INDEX "InteractionMemory_type_idx" ON "InteractionMemory"("type");

-- CreateIndex
CREATE INDEX "InteractionMemory_importance_idx" ON "InteractionMemory"("importance");

-- CreateIndex
CREATE INDEX "AgentEscalation_userId_idx" ON "AgentEscalation"("userId");

-- CreateIndex
CREATE INDEX "AgentEscalation_agentId_idx" ON "AgentEscalation"("agentId");

-- CreateIndex
CREATE INDEX "AgentEscalation_sessionId_idx" ON "AgentEscalation"("sessionId");

-- CreateIndex
CREATE INDEX "AgentEscalation_status_idx" ON "AgentEscalation"("status");

-- CreateIndex
CREATE INDEX "AgentEscalation_priority_idx" ON "AgentEscalation"("priority");

-- CreateIndex
CREATE INDEX "TaskAudit_userId_idx" ON "TaskAudit"("userId");

-- CreateIndex
CREATE INDEX "TaskAudit_agentId_idx" ON "TaskAudit"("agentId");

-- CreateIndex
CREATE INDEX "TaskAudit_taskId_idx" ON "TaskAudit"("taskId");

-- CreateIndex
CREATE INDEX "TaskAudit_action_idx" ON "TaskAudit"("action");

-- CreateIndex
CREATE INDEX "TaskAudit_status_idx" ON "TaskAudit"("status");

-- CreateIndex
CREATE INDEX "Notification_userId_idx" ON "Notification"("userId");

-- CreateIndex
CREATE INDEX "Notification_isRead_idx" ON "Notification"("isRead");

-- CreateIndex
CREATE INDEX "Notification_type_idx" ON "Notification"("type");

-- CreateIndex
CREATE INDEX "CredentialStore_name_idx" ON "CredentialStore"("name");

-- CreateIndex
CREATE INDEX "CredentialStore_type_idx" ON "CredentialStore"("type");

-- CreateIndex
CREATE UNIQUE INDEX "APIKey_key_key" ON "APIKey"("key");

-- CreateIndex
CREATE INDEX "APIKey_userId_idx" ON "APIKey"("userId");

-- CreateIndex
CREATE INDEX "APIKey_key_idx" ON "APIKey"("key");

-- CreateIndex
CREATE UNIQUE INDEX "GlobalSettings_organizationId_key" ON "GlobalSettings"("organizationId");

-- CreateIndex
CREATE UNIQUE INDEX "QueryLog_queryId_key" ON "QueryLog"("queryId");

-- CreateIndex
CREATE INDEX "QueryLog_timestamp_idx" ON "QueryLog"("timestamp");

-- CreateIndex
CREATE INDEX "QueryLog_model_idx" ON "QueryLog"("model");

-- CreateIndex
CREATE INDEX "QueryLog_action_idx" ON "QueryLog"("action");

-- CreateIndex
CREATE INDEX "QueryLog_status_idx" ON "QueryLog"("status");

-- CreateIndex
CREATE INDEX "QueryLog_isSlow_idx" ON "QueryLog"("isSlow");

-- CreateIndex
CREATE INDEX "QueryLog_moduleId_idx" ON "QueryLog"("moduleId");

-- CreateIndex
CREATE INDEX "QueryLog_userId_idx" ON "QueryLog"("userId");

-- CreateIndex
CREATE INDEX "QueryLog_organizationId_idx" ON "QueryLog"("organizationId");

-- CreateIndex
CREATE INDEX "QueryLog_tags_idx" ON "QueryLog"("tags");

-- CreateIndex
CREATE UNIQUE INDEX "QueryExecutionPlan_queryId_key" ON "QueryExecutionPlan"("queryId");

-- CreateIndex
CREATE INDEX "QueryExecutionPlan_timestamp_idx" ON "QueryExecutionPlan"("timestamp");

-- CreateIndex
CREATE UNIQUE INDEX "QueryPerformanceMetric_modelAction_key" ON "QueryPerformanceMetric"("modelAction");

-- CreateIndex
CREATE INDEX "QueryPerformanceMetric_model_idx" ON "QueryPerformanceMetric"("model");

-- CreateIndex
CREATE INDEX "QueryPerformanceMetric_action_idx" ON "QueryPerformanceMetric"("action");

-- CreateIndex
CREATE INDEX "QueryPerformanceMetric_moduleId_idx" ON "QueryPerformanceMetric"("moduleId");

-- CreateIndex
CREATE UNIQUE INDEX "QueryCache_key_key" ON "QueryCache"("key");

-- CreateIndex
CREATE INDEX "QueryCache_model_idx" ON "QueryCache"("model");

-- CreateIndex
CREATE INDEX "QueryCache_action_idx" ON "QueryCache"("action");

-- CreateIndex
CREATE INDEX "QueryCache_userId_idx" ON "QueryCache"("userId");

-- CreateIndex
CREATE INDEX "QueryCache_agentId_idx" ON "QueryCache"("agentId");

-- CreateIndex
CREATE INDEX "QueryCache_expiresAt_idx" ON "QueryCache"("expiresAt");

-- CreateIndex
CREATE INDEX "LogArchive_logType_idx" ON "LogArchive"("logType");

-- CreateIndex
CREATE INDEX "LogArchive_startDate_idx" ON "LogArchive"("startDate");

-- CreateIndex
CREATE INDEX "LogArchive_endDate_idx" ON "LogArchive"("endDate");

-- CreateIndex
CREATE INDEX "LogArchive_storageProvider_idx" ON "LogArchive"("storageProvider");

-- CreateIndex
CREATE INDEX "AlertRule_name_idx" ON "AlertRule"("name");

-- CreateIndex
CREATE INDEX "AlertRule_type_idx" ON "AlertRule"("type");

-- CreateIndex
CREATE INDEX "AlertRule_logType_idx" ON "AlertRule"("logType");

-- CreateIndex
CREATE INDEX "AlertRule_severity_idx" ON "AlertRule"("severity");

-- CreateIndex
CREATE INDEX "AlertRule_createdBy_idx" ON "AlertRule"("createdBy");

-- CreateIndex
CREATE INDEX "Alert_ruleId_idx" ON "Alert"("ruleId");

-- CreateIndex
CREATE INDEX "Alert_severity_idx" ON "Alert"("severity");

-- CreateIndex
CREATE INDEX "Alert_status_idx" ON "Alert"("status");

-- CreateIndex
CREATE INDEX "Alert_lastOccurrence_idx" ON "Alert"("lastOccurrence");

-- CreateIndex
CREATE INDEX "LogAnalyticsResult_type_idx" ON "LogAnalyticsResult"("type");

-- CreateIndex
CREATE INDEX "LogAnalyticsResult_logType_idx" ON "LogAnalyticsResult"("logType");

-- CreateIndex
CREATE INDEX "LogAnalyticsResult_startDate_idx" ON "LogAnalyticsResult"("startDate");

-- CreateIndex
CREATE INDEX "LogAnalyticsResult_endDate_idx" ON "LogAnalyticsResult"("endDate");

-- CreateIndex
CREATE INDEX "LogInsight_importance_idx" ON "LogInsight"("importance");

-- CreateIndex
CREATE INDEX "LogInsight_category_idx" ON "LogInsight"("category");

-- CreateIndex
CREATE INDEX "LogInsight_startDate_idx" ON "LogInsight"("startDate");

-- CreateIndex
CREATE INDEX "LogInsight_endDate_idx" ON "LogInsight"("endDate");

-- CreateIndex
CREATE UNIQUE INDEX "LogRetentionPolicy_organizationId_key" ON "LogRetentionPolicy"("organizationId");

-- CreateIndex
CREATE INDEX "MaintenanceJob_jobType_idx" ON "MaintenanceJob"("jobType");

-- CreateIndex
CREATE INDEX "MaintenanceJob_status_idx" ON "MaintenanceJob"("status");

-- CreateIndex
CREATE INDEX "MaintenanceJob_startTime_idx" ON "MaintenanceJob"("startTime");

-- CreateIndex
CREATE INDEX "MaintenanceJob_endTime_idx" ON "MaintenanceJob"("endTime");

-- CreateIndex
CREATE INDEX "MaintenanceJob_lastRunAt_idx" ON "MaintenanceJob"("lastRunAt");

-- CreateIndex
CREATE INDEX "MaintenanceJob_nextRunAt_idx" ON "MaintenanceJob"("nextRunAt");

-- CreateIndex
CREATE INDEX "MaintenanceJob_isActive_idx" ON "MaintenanceJob"("isActive");

-- CreateIndex
CREATE INDEX "SecurityAlert_userId_idx" ON "SecurityAlert"("userId");

-- CreateIndex
CREATE INDEX "SecurityAlert_severity_idx" ON "SecurityAlert"("severity");

-- CreateIndex
CREATE INDEX "SecurityAlert_status_idx" ON "SecurityAlert"("status");

-- CreateIndex
CREATE INDEX "SecurityAlert_source_idx" ON "SecurityAlert"("source");

-- CreateIndex
CREATE INDEX "SecurityMetric_userId_idx" ON "SecurityMetric"("userId");

-- CreateIndex
CREATE INDEX "SecurityMetric_name_idx" ON "SecurityMetric"("name");

-- CreateIndex
CREATE INDEX "SecurityMetric_category_idx" ON "SecurityMetric"("category");

-- CreateIndex
CREATE INDEX "SecurityRecommendation_userId_idx" ON "SecurityRecommendation"("userId");

-- CreateIndex
CREATE INDEX "SecurityRecommendation_priority_idx" ON "SecurityRecommendation"("priority");

-- CreateIndex
CREATE INDEX "SecurityRecommendation_status_idx" ON "SecurityRecommendation"("status");

-- CreateIndex
CREATE INDEX "SecurityRecommendation_category_idx" ON "SecurityRecommendation"("category");

-- CreateIndex
CREATE INDEX "SecurityScan_userId_idx" ON "SecurityScan"("userId");

-- CreateIndex
CREATE INDEX "SecurityScan_type_idx" ON "SecurityScan"("type");

-- CreateIndex
CREATE INDEX "SecurityScan_status_idx" ON "SecurityScan"("status");

-- CreateIndex
CREATE INDEX "ComplianceCheck_userId_idx" ON "ComplianceCheck"("userId");

-- CreateIndex
CREATE INDEX "ComplianceCheck_standard_idx" ON "ComplianceCheck"("standard");

-- CreateIndex
CREATE INDEX "ComplianceCheck_status_idx" ON "ComplianceCheck"("status");

-- CreateIndex
CREATE INDEX "ComplianceCheck_scanId_idx" ON "ComplianceCheck"("scanId");

-- CreateIndex
CREATE INDEX "LogIntegrityCheck_userId_idx" ON "LogIntegrityCheck"("userId");

-- CreateIndex
CREATE INDEX "LogIntegrityCheck_checkType_idx" ON "LogIntegrityCheck"("checkType");

-- CreateIndex
CREATE INDEX "LogIntegrityCheck_status_idx" ON "LogIntegrityCheck"("status");

-- CreateIndex
CREATE INDEX "LogIntegrityCheck_logSource_idx" ON "LogIntegrityCheck"("logSource");

-- CreateIndex
CREATE INDEX "CredentialScan_userId_idx" ON "CredentialScan"("userId");

-- CreateIndex
CREATE INDEX "CredentialScan_scanType_idx" ON "CredentialScan"("scanType");

-- CreateIndex
CREATE INDEX "CredentialScan_status_idx" ON "CredentialScan"("status");

-- CreateIndex
CREATE INDEX "AnomalousUsage_userId_idx" ON "AnomalousUsage"("userId");

-- CreateIndex
CREATE INDEX "AnomalousUsage_type_idx" ON "AnomalousUsage"("type");

-- CreateIndex
CREATE INDEX "AnomalousUsage_severity_idx" ON "AnomalousUsage"("severity");

-- CreateIndex
CREATE INDEX "AnomalousUsage_status_idx" ON "AnomalousUsage"("status");

-- CreateIndex
CREATE INDEX "AnomalousUsage_source_idx" ON "AnomalousUsage"("source");

-- CreateIndex
CREATE INDEX "SecurityEscalation_userId_idx" ON "SecurityEscalation"("userId");

-- CreateIndex
CREATE INDEX "SecurityEscalation_severity_idx" ON "SecurityEscalation"("severity");

-- CreateIndex
CREATE INDEX "SecurityEscalation_status_idx" ON "SecurityEscalation"("status");

-- CreateIndex
CREATE INDEX "SecurityEscalation_category_idx" ON "SecurityEscalation"("category");

-- CreateIndex
CREATE INDEX "SecurityEscalation_assignedTo_idx" ON "SecurityEscalation"("assignedTo");

-- CreateIndex
CREATE INDEX "MfaPolicy_organizationId_idx" ON "MfaPolicy"("organizationId");

-- CreateIndex
CREATE INDEX "MfaPolicy_isEnabled_idx" ON "MfaPolicy"("isEnabled");

-- CreateIndex
CREATE INDEX "MfaEnrollment_userId_idx" ON "MfaEnrollment"("userId");

-- CreateIndex
CREATE INDEX "MfaEnrollment_method_idx" ON "MfaEnrollment"("method");

-- CreateIndex
CREATE INDEX "MfaEnrollment_isVerified_idx" ON "MfaEnrollment"("isVerified");

-- CreateIndex
CREATE INDEX "AlertThreshold_metricName_idx" ON "AlertThreshold"("metricName");

-- CreateIndex
CREATE INDEX "AlertThreshold_severity_idx" ON "AlertThreshold"("severity");

-- CreateIndex
CREATE INDEX "AlertThreshold_enabled_idx" ON "AlertThreshold"("enabled");

-- CreateIndex
CREATE INDEX "SchemaMap_createdById_idx" ON "SchemaMap"("createdById");

-- CreateIndex
CREATE INDEX "SchemaMap_organizationId_idx" ON "SchemaMap"("organizationId");

-- CreateIndex
CREATE UNIQUE INDEX "SchemaMap_name_organizationId_key" ON "SchemaMap"("name", "organizationId");

-- CreateIndex
CREATE INDEX "AgentQueryPermission_agentId_idx" ON "AgentQueryPermission"("agentId");

-- CreateIndex
CREATE INDEX "AgentQueryPermission_schemaMapId_idx" ON "AgentQueryPermission"("schemaMapId");

-- CreateIndex
CREATE UNIQUE INDEX "AgentQueryPermission_agentId_schemaMapId_key" ON "AgentQueryPermission"("agentId", "schemaMapId");

-- CreateIndex
CREATE UNIQUE INDEX "AgentQueryRequest_queryLogId_key" ON "AgentQueryRequest"("queryLogId");

-- CreateIndex
CREATE INDEX "AgentQueryRequest_agentId_idx" ON "AgentQueryRequest"("agentId");

-- CreateIndex
CREATE INDEX "AgentQueryRequest_userId_idx" ON "AgentQueryRequest"("userId");

-- CreateIndex
CREATE INDEX "AgentQueryRequest_sessionId_idx" ON "AgentQueryRequest"("sessionId");

-- CreateIndex
CREATE INDEX "AgentQueryRequest_approvedById_idx" ON "AgentQueryRequest"("approvedById");

-- CreateIndex
CREATE INDEX "AgentQueryRequest_status_idx" ON "AgentQueryRequest"("status");

-- CreateIndex
CREATE INDEX "AgentQueryRequest_queryLogId_idx" ON "AgentQueryRequest"("queryLogId");

-- CreateIndex
CREATE INDEX "QueryTemplate_createdById_idx" ON "QueryTemplate"("createdById");

-- CreateIndex
CREATE INDEX "QueryTemplate_organizationId_idx" ON "QueryTemplate"("organizationId");

-- CreateIndex
CREATE INDEX "QueryTemplate_targetModel_idx" ON "QueryTemplate"("targetModel");

-- CreateIndex
CREATE INDEX "QueryTemplate_category_idx" ON "QueryTemplate"("category");

-- CreateIndex
CREATE UNIQUE INDEX "QueryTemplate_name_organizationId_key" ON "QueryTemplate"("name", "organizationId");

-- CreateIndex
CREATE INDEX "TriggerSource_type_idx" ON "TriggerSource"("type");

-- CreateIndex
CREATE INDEX "TriggerSource_moduleId_idx" ON "TriggerSource"("moduleId");

-- CreateIndex
CREATE INDEX "TriggerSource_name_idx" ON "TriggerSource"("name");

-- CreateIndex
CREATE UNIQUE INDEX "TriggerSource_name_type_key" ON "TriggerSource"("name", "type");

-- CreateIndex
CREATE INDEX "AgentTrigger_sourceId_idx" ON "AgentTrigger"("sourceId");

-- CreateIndex
CREATE INDEX "AgentTrigger_sourceType_idx" ON "AgentTrigger"("sourceType");

-- CreateIndex
CREATE INDEX "AgentTrigger_agentId_idx" ON "AgentTrigger"("agentId");

-- CreateIndex
CREATE INDEX "AgentTrigger_workflowId_idx" ON "AgentTrigger"("workflowId");

-- CreateIndex
CREATE INDEX "AgentTrigger_userId_idx" ON "AgentTrigger"("userId");

-- CreateIndex
CREATE INDEX "AgentTrigger_sessionId_idx" ON "AgentTrigger"("sessionId");

-- CreateIndex
CREATE INDEX "AgentTrigger_timestamp_idx" ON "AgentTrigger"("timestamp");

-- CreateIndex
CREATE INDEX "AgentTrigger_traceId_idx" ON "AgentTrigger"("traceId");

-- CreateIndex
CREATE INDEX "AgentTrigger_executionId_idx" ON "AgentTrigger"("executionId");

-- CreateIndex
CREATE INDEX "AgentTrigger_status_idx" ON "AgentTrigger"("status");

-- CreateIndex
CREATE INDEX "AgentTrigger_tags_idx" ON "AgentTrigger"("tags");

-- CreateIndex
CREATE INDEX "TriggerExecutionFlow_triggerId_idx" ON "TriggerExecutionFlow"("triggerId");

-- CreateIndex
CREATE INDEX "TriggerExecutionFlow_executionId_idx" ON "TriggerExecutionFlow"("executionId");

-- CreateIndex
CREATE INDEX "TriggerExecutionFlow_stepNumber_idx" ON "TriggerExecutionFlow"("stepNumber");

-- CreateIndex
CREATE INDEX "TriggerExecutionFlow_stepType_idx" ON "TriggerExecutionFlow"("stepType");

-- CreateIndex
CREATE INDEX "TriggerExecutionFlow_status_idx" ON "TriggerExecutionFlow"("status");

-- CreateIndex
CREATE UNIQUE INDEX "AIResponseCache_key_key" ON "AIResponseCache"("key");

-- CreateIndex
CREATE INDEX "AIResponseCache_key_idx" ON "AIResponseCache"("key");

-- CreateIndex
CREATE INDEX "AIResponseCache_model_idx" ON "AIResponseCache"("model");

-- CreateIndex
CREATE INDEX "AIResponseCache_userId_idx" ON "AIResponseCache"("userId");

-- CreateIndex
CREATE INDEX "AIResponseCache_module_idx" ON "AIResponseCache"("module");

-- CreateIndex
CREATE INDEX "AIResponseCache_requestType_idx" ON "AIResponseCache"("requestType");

-- CreateIndex
CREATE INDEX "AIResponseCache_expiresAt_idx" ON "AIResponseCache"("expiresAt");

-- CreateIndex
CREATE INDEX "AIBenchmark_modelName_idx" ON "AIBenchmark"("modelName");

-- CreateIndex
CREATE INDEX "AIBenchmark_category_idx" ON "AIBenchmark"("category");

-- CreateIndex
CREATE INDEX "AIBenchmark_userId_idx" ON "AIBenchmark"("userId");

-- CreateIndex
CREATE INDEX "AIBenchmark_createdAt_idx" ON "AIBenchmark"("createdAt");

-- CreateIndex
CREATE INDEX "UserTokenUsage_userId_idx" ON "UserTokenUsage"("userId");

-- CreateIndex
CREATE INDEX "UserTokenUsage_date_idx" ON "UserTokenUsage"("date");

-- CreateIndex
CREATE UNIQUE INDEX "UserTokenUsage_userId_date_key" ON "UserTokenUsage"("userId", "date");

-- CreateIndex
CREATE INDEX "PerformanceAlert_type_idx" ON "PerformanceAlert"("type");

-- CreateIndex
CREATE INDEX "PerformanceAlert_severity_idx" ON "PerformanceAlert"("severity");

-- CreateIndex
CREATE INDEX "PerformanceAlert_acknowledged_idx" ON "PerformanceAlert"("acknowledged");

-- CreateIndex
CREATE INDEX "PerformanceAlert_createdAt_idx" ON "PerformanceAlert"("createdAt");

-- CreateIndex
CREATE INDEX "ThreatFeed_userId_idx" ON "ThreatFeed"("userId");

-- CreateIndex
CREATE INDEX "ThreatFeed_type_idx" ON "ThreatFeed"("type");

-- CreateIndex
CREATE INDEX "ThreatFeed_isActive_idx" ON "ThreatFeed"("isActive");

-- CreateIndex
CREATE UNIQUE INDEX "ThreatFeed_userId_name_key" ON "ThreatFeed"("userId", "name");

-- CreateIndex
CREATE INDEX "ThreatMonitor_userId_idx" ON "ThreatMonitor"("userId");

-- CreateIndex
CREATE INDEX "ThreatMonitor_type_idx" ON "ThreatMonitor"("type");

-- CreateIndex
CREATE INDEX "ThreatMonitor_severity_idx" ON "ThreatMonitor"("severity");

-- CreateIndex
CREATE INDEX "ThreatMonitor_isActive_idx" ON "ThreatMonitor"("isActive");

-- CreateIndex
CREATE UNIQUE INDEX "ThreatMonitor_userId_name_key" ON "ThreatMonitor"("userId", "name");

-- CreateIndex
CREATE INDEX "BrandAlert_userId_idx" ON "BrandAlert"("userId");

-- CreateIndex
CREATE INDEX "BrandAlert_monitorId_idx" ON "BrandAlert"("monitorId");

-- CreateIndex
CREATE INDEX "BrandAlert_brandName_idx" ON "BrandAlert"("brandName");

-- CreateIndex
CREATE INDEX "BrandAlert_severity_idx" ON "BrandAlert"("severity");

-- CreateIndex
CREATE INDEX "BrandAlert_status_idx" ON "BrandAlert"("status");

-- CreateIndex
CREATE INDEX "BrandAlert_threatFeedId_idx" ON "BrandAlert"("threatFeedId");

-- CreateIndex
CREATE INDEX "CVEAlert_userId_idx" ON "CVEAlert"("userId");

-- CreateIndex
CREATE INDEX "CVEAlert_cveId_idx" ON "CVEAlert"("cveId");

-- CreateIndex
CREATE INDEX "CVEAlert_severity_idx" ON "CVEAlert"("severity");

-- CreateIndex
CREATE INDEX "CVEAlert_status_idx" ON "CVEAlert"("status");

-- CreateIndex
CREATE INDEX "CVEAlert_threatFeedId_idx" ON "CVEAlert"("threatFeedId");

-- CreateIndex
CREATE INDEX "PhishingVector_userId_idx" ON "PhishingVector"("userId");

-- CreateIndex
CREATE INDEX "PhishingVector_type_idx" ON "PhishingVector"("type");

-- CreateIndex
CREATE INDEX "PhishingVector_targetedBrand_idx" ON "PhishingVector"("targetedBrand");

-- CreateIndex
CREATE INDEX "PhishingVector_severity_idx" ON "PhishingVector"("severity");

-- CreateIndex
CREATE INDEX "PhishingVector_status_idx" ON "PhishingVector"("status");

-- CreateIndex
CREATE INDEX "PhishingVector_threatFeedId_idx" ON "PhishingVector"("threatFeedId");

-- CreateIndex
CREATE INDEX "ThreatIntelligence_userId_idx" ON "ThreatIntelligence"("userId");

-- CreateIndex
CREATE INDEX "ThreatIntelligence_type_idx" ON "ThreatIntelligence"("type");

-- CreateIndex
CREATE INDEX "ThreatIntelligence_severity_idx" ON "ThreatIntelligence"("severity");

-- CreateIndex
CREATE INDEX "ThreatIntelligence_confidence_idx" ON "ThreatIntelligence"("confidence");

-- CreateIndex
CREATE INDEX "ThreatIntelligence_threatFeedId_idx" ON "ThreatIntelligence"("threatFeedId");

-- CreateIndex
CREATE INDEX "SentinelLogIntegration_userId_idx" ON "SentinelLogIntegration"("userId");

-- CreateIndex
CREATE INDEX "SentinelLogIntegration_type_idx" ON "SentinelLogIntegration"("type");

-- CreateIndex
CREATE INDEX "SentinelLogIntegration_isActive_idx" ON "SentinelLogIntegration"("isActive");

-- CreateIndex
CREATE UNIQUE INDEX "SentinelLogIntegration_userId_name_key" ON "SentinelLogIntegration"("userId", "name");

-- CreateIndex
CREATE INDEX "SentientCheckpoint_userId_idx" ON "SentientCheckpoint"("userId");

-- CreateIndex
CREATE INDEX "SentientCheckpoint_agentId_idx" ON "SentientCheckpoint"("agentId");

-- CreateIndex
CREATE INDEX "SentientCheckpoint_moduleId_idx" ON "SentientCheckpoint"("moduleId");

-- CreateIndex
CREATE INDEX "SentientCheckpoint_status_idx" ON "SentientCheckpoint"("status");

-- CreateIndex
CREATE INDEX "SentientCheckpoint_type_idx" ON "SentientCheckpoint"("type");

-- CreateIndex
CREATE INDEX "SentientCheckpoint_sessionId_idx" ON "SentientCheckpoint"("sessionId");

-- CreateIndex
CREATE INDEX "SentientCheckpoint_parentCheckpointId_idx" ON "SentientCheckpoint"("parentCheckpointId");

-- CreateIndex
CREATE INDEX "SentientMemorySnapshot_checkpointId_idx" ON "SentientMemorySnapshot"("checkpointId");

-- CreateIndex
CREATE INDEX "SentientMemorySnapshot_type_idx" ON "SentientMemorySnapshot"("type");

-- CreateIndex
CREATE INDEX "SentientEscalation_checkpointId_idx" ON "SentientEscalation"("checkpointId");

-- CreateIndex
CREATE INDEX "SentientEscalation_level_idx" ON "SentientEscalation"("level");

-- CreateIndex
CREATE INDEX "SentientEscalation_status_idx" ON "SentientEscalation"("status");

-- CreateIndex
CREATE INDEX "SentientDecisionTrace_checkpointId_idx" ON "SentientDecisionTrace"("checkpointId");

-- CreateIndex
CREATE INDEX "SentientDecisionTrace_decisionMaker_idx" ON "SentientDecisionTrace"("decisionMaker");

-- CreateIndex
CREATE INDEX "AIPrompt_module_idx" ON "AIPrompt"("module");

-- CreateIndex
CREATE INDEX "AIPrompt_type_idx" ON "AIPrompt"("type");

-- CreateIndex
CREATE INDEX "AIPrompt_category_idx" ON "AIPrompt"("category");

-- CreateIndex
CREATE INDEX "AIPrompt_tags_idx" ON "AIPrompt"("tags");

-- CreateIndex
CREATE INDEX "AIPrompt_createdById_idx" ON "AIPrompt"("createdById");

-- CreateIndex
CREATE INDEX "AIPrompt_organizationId_idx" ON "AIPrompt"("organizationId");

-- CreateIndex
CREATE INDEX "AISystemPrompt_module_idx" ON "AISystemPrompt"("module");

-- CreateIndex
CREATE INDEX "AISystemPrompt_model_idx" ON "AISystemPrompt"("model");

-- CreateIndex
CREATE INDEX "AISystemPrompt_createdById_idx" ON "AISystemPrompt"("createdById");

-- CreateIndex
CREATE INDEX "AISystemPrompt_organizationId_idx" ON "AISystemPrompt"("organizationId");

-- CreateIndex
CREATE INDEX "AIReasoning_sessionId_idx" ON "AIReasoning"("sessionId");

-- CreateIndex
CREATE INDEX "AIReasoning_promptId_idx" ON "AIReasoning"("promptId");

-- CreateIndex
CREATE INDEX "AIReasoning_systemPromptId_idx" ON "AIReasoning"("systemPromptId");

-- CreateIndex
CREATE INDEX "AIReasoning_agentId_idx" ON "AIReasoning"("agentId");

-- CreateIndex
CREATE INDEX "AIReasoning_userId_idx" ON "AIReasoning"("userId");

-- CreateIndex
CREATE INDEX "AIReasoning_model_idx" ON "AIReasoning"("model");

-- CreateIndex
CREATE INDEX "AIReasoning_success_idx" ON "AIReasoning"("success");

-- CreateIndex
CREATE INDEX "AIResponseNode_reasoningId_idx" ON "AIResponseNode"("reasoningId");

-- CreateIndex
CREATE INDEX "AIResponseNode_parentId_idx" ON "AIResponseNode"("parentId");

-- CreateIndex
CREATE INDEX "AIResponseNode_type_idx" ON "AIResponseNode"("type");

-- CreateIndex
CREATE INDEX "AIResponseNode_order_idx" ON "AIResponseNode"("order");

-- CreateIndex
CREATE INDEX "AISession_userId_idx" ON "AISession"("userId");

-- CreateIndex
CREATE INDEX "AISession_agentId_idx" ON "AISession"("agentId");

-- CreateIndex
CREATE INDEX "AISession_module_idx" ON "AISession"("module");

-- CreateIndex
CREATE INDEX "AISession_sessionType_idx" ON "AISession"("sessionType");

-- CreateIndex
CREATE INDEX "AISession_status_idx" ON "AISession"("status");

-- CreateIndex
CREATE INDEX "AISession_startedAt_idx" ON "AISession"("startedAt");

-- CreateIndex
CREATE INDEX "AISession_completedAt_idx" ON "AISession"("completedAt");

-- CreateIndex
CREATE INDEX "AIThoughtTrace_agentId_idx" ON "AIThoughtTrace"("agentId");

-- CreateIndex
CREATE INDEX "AIThoughtTrace_userId_idx" ON "AIThoughtTrace"("userId");

-- CreateIndex
CREATE INDEX "AIThoughtTrace_sessionId_idx" ON "AIThoughtTrace"("sessionId");

-- CreateIndex
CREATE INDEX "AIThoughtTrace_moduleId_idx" ON "AIThoughtTrace"("moduleId");

-- CreateIndex
CREATE INDEX "AIThoughtTrace_dbEntity_idx" ON "AIThoughtTrace"("dbEntity");

-- CreateIndex
CREATE INDEX "AIThoughtTrace_dbOperation_idx" ON "AIThoughtTrace"("dbOperation");

-- CreateIndex
CREATE INDEX "AIThoughtTrace_traceId_idx" ON "AIThoughtTrace"("traceId");

-- CreateIndex
CREATE INDEX "AIThoughtTrace_checkpointId_idx" ON "AIThoughtTrace"("checkpointId");

-- CreateIndex
CREATE INDEX "AIThoughtRollback_traceId_idx" ON "AIThoughtRollback"("traceId");

-- CreateIndex
CREATE INDEX "AIThoughtRollback_status_idx" ON "AIThoughtRollback"("status");

-- CreateIndex
CREATE UNIQUE INDEX "SentientLoopConfig_userId_moduleId_key" ON "SentientLoopConfig"("userId", "moduleId");

-- CreateIndex
CREATE INDEX "SentientLoopWebhook_userId_idx" ON "SentientLoopWebhook"("userId");

-- CreateIndex
CREATE INDEX "SentientLoopWebhook_isActive_idx" ON "SentientLoopWebhook"("isActive");

-- CreateIndex
CREATE INDEX "SentientLoopWebhook_events_idx" ON "SentientLoopWebhook"("events");

-- CreateIndex
CREATE INDEX "WebhookDelivery_webhookId_idx" ON "WebhookDelivery"("webhookId");

-- CreateIndex
CREATE INDEX "WebhookDelivery_eventType_idx" ON "WebhookDelivery"("eventType");

-- CreateIndex
CREATE INDEX "WebhookDelivery_status_idx" ON "WebhookDelivery"("status");

-- CreateIndex
CREATE INDEX "WebhookDelivery_deliveredAt_idx" ON "WebhookDelivery"("deliveredAt");

-- CreateIndex
CREATE UNIQUE INDEX "SentientLoopApiKey_key_key" ON "SentientLoopApiKey"("key");

-- CreateIndex
CREATE INDEX "SentientLoopApiKey_userId_idx" ON "SentientLoopApiKey"("userId");

-- CreateIndex
CREATE INDEX "SentientLoopApiKey_key_idx" ON "SentientLoopApiKey"("key");

-- CreateIndex
CREATE INDEX "SentientLoopApiKey_isActive_idx" ON "SentientLoopApiKey"("isActive");

-- CreateIndex
CREATE INDEX "EthicalRule_type_idx" ON "EthicalRule"("type");

-- CreateIndex
CREATE INDEX "EthicalRule_severity_idx" ON "EthicalRule"("severity");

-- CreateIndex
CREATE INDEX "EthicalRule_organizationId_idx" ON "EthicalRule"("organizationId");

-- CreateIndex
CREATE INDEX "EthicalRule_industryContext_idx" ON "EthicalRule"("industryContext");

-- CreateIndex
CREATE INDEX "EthicalRule_regulatoryContext_idx" ON "EthicalRule"("regulatoryContext");

-- CreateIndex
CREATE INDEX "AlignmentCheck_agentId_idx" ON "AlignmentCheck"("agentId");

-- CreateIndex
CREATE INDEX "AlignmentCheck_userId_idx" ON "AlignmentCheck"("userId");

-- CreateIndex
CREATE INDEX "AlignmentCheck_sessionId_idx" ON "AlignmentCheck"("sessionId");

-- CreateIndex
CREATE INDEX "AlignmentCheck_moduleId_idx" ON "AlignmentCheck"("moduleId");

-- CreateIndex
CREATE INDEX "AlignmentCheck_ruleId_idx" ON "AlignmentCheck"("ruleId");

-- CreateIndex
CREATE INDEX "AlignmentCheck_alignmentScore_idx" ON "AlignmentCheck"("alignmentScore");

-- CreateIndex
CREATE INDEX "AlignmentCheck_severity_idx" ON "AlignmentCheck"("severity");

-- CreateIndex
CREATE INDEX "AlignmentCheck_status_idx" ON "AlignmentCheck"("status");

-- CreateIndex
CREATE INDEX "AlignmentCheck_timestamp_idx" ON "AlignmentCheck"("timestamp");

-- CreateIndex
CREATE INDEX "CollaborationArchive_userId_idx" ON "CollaborationArchive"("userId");

-- CreateIndex
CREATE INDEX "CollaborationArchive_organizationId_idx" ON "CollaborationArchive"("organizationId");

-- CreateIndex
CREATE INDEX "CollaborationArchive_archiveType_idx" ON "CollaborationArchive"("archiveType");

-- CreateIndex
CREATE INDEX "CollaborationArchive_status_idx" ON "CollaborationArchive"("status");

-- CreateIndex
CREATE INDEX "CollaborationArchive_sourceSessionId_idx" ON "CollaborationArchive"("sourceSessionId");

-- CreateIndex
CREATE INDEX "CollaborationArchive_startTimestamp_idx" ON "CollaborationArchive"("startTimestamp");

-- CreateIndex
CREATE INDEX "CollaborationArchive_endTimestamp_idx" ON "CollaborationArchive"("endTimestamp");

-- CreateIndex
CREATE INDEX "CollaborationArchive_contentHash_idx" ON "CollaborationArchive"("contentHash");

-- CreateIndex
CREATE UNIQUE INDEX "ArchiveContent_archiveId_key" ON "ArchiveContent"("archiveId");

-- CreateIndex
CREATE INDEX "ArchiveVerification_archiveId_idx" ON "ArchiveVerification"("archiveId");

-- CreateIndex
CREATE INDEX "ArchiveVerification_verifiedBy_idx" ON "ArchiveVerification"("verifiedBy");

-- CreateIndex
CREATE INDEX "ArchiveVerification_status_idx" ON "ArchiveVerification"("status");

-- CreateIndex
CREATE INDEX "ArchiveAccessLog_archiveId_idx" ON "ArchiveAccessLog"("archiveId");

-- CreateIndex
CREATE INDEX "ArchiveAccessLog_accessedBy_idx" ON "ArchiveAccessLog"("accessedBy");

-- CreateIndex
CREATE INDEX "ArchiveAccessLog_timestamp_idx" ON "ArchiveAccessLog"("timestamp");

-- CreateIndex
CREATE INDEX "ArchiveAccessLog_accessType_idx" ON "ArchiveAccessLog"("accessType");

-- CreateIndex
CREATE UNIQUE INDEX "ArchiveRetentionPolicy_name_key" ON "ArchiveRetentionPolicy"("name");

-- CreateIndex
CREATE UNIQUE INDEX "AgentTrustScore_agentId_key" ON "AgentTrustScore"("agentId");

-- CreateIndex
CREATE INDEX "AgentTrustScore_agentId_idx" ON "AgentTrustScore"("agentId");

-- CreateIndex
CREATE INDEX "AgentTrustScore_level_idx" ON "AgentTrustScore"("level");

-- CreateIndex
CREATE INDEX "AgentTrustScore_trustScore_idx" ON "AgentTrustScore"("trustScore");

-- CreateIndex
CREATE UNIQUE INDEX "TrustBadge_name_key" ON "TrustBadge"("name");

-- CreateIndex
CREATE INDEX "TrustBadge_category_idx" ON "TrustBadge"("category");

-- CreateIndex
CREATE INDEX "TrustBadge_tier_idx" ON "TrustBadge"("tier");

-- CreateIndex
CREATE INDEX "TrustBadge_requirementType_idx" ON "TrustBadge"("requirementType");

-- CreateIndex
CREATE INDEX "EarnedBadge_badgeId_idx" ON "EarnedBadge"("badgeId");

-- CreateIndex
CREATE INDEX "EarnedBadge_trustScoreId_idx" ON "EarnedBadge"("trustScoreId");

-- CreateIndex
CREATE UNIQUE INDEX "EarnedBadge_badgeId_trustScoreId_key" ON "EarnedBadge"("badgeId", "trustScoreId");

-- CreateIndex
CREATE INDEX "_AgentToWorkflow_B_index" ON "_AgentToWorkflow"("B");

-- CreateIndex
CREATE INDEX "_AgentPersonaToPersonaTrait_B_index" ON "_AgentPersonaToPersonaTrait"("B");

-- CreateIndex
CREATE INDEX "_SessionPrompts_B_index" ON "_SessionPrompts"("B");

-- CreateIndex
CREATE INDEX "_SessionSystemPrompts_B_index" ON "_SessionSystemPrompts"("B");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "Role"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "File" ADD CONSTRAINT "File_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PageViewSource" ADD CONSTRAINT "PageViewSource_dailyStatsId_fkey" FOREIGN KEY ("dailyStatsId") REFERENCES "DailyStats"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContactFormMessage" ADD CONSTRAINT "ContactFormMessage_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Agent" ADD CONSTRAINT "Agent_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Workflow" ADD CONSTRAINT "Workflow_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkflowDesign" ADD CONSTRAINT "WorkflowDesign_workflowId_fkey" FOREIGN KEY ("workflowId") REFERENCES "Workflow"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LangGraphState" ADD CONSTRAINT "LangGraphState_executionId_fkey" FOREIGN KEY ("executionId") REFERENCES "WorkflowExecution"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LangGraphState" ADD CONSTRAINT "LangGraphState_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LangGraphState" ADD CONSTRAINT "LangGraphState_workflowId_fkey" FOREIGN KEY ("workflowId") REFERENCES "Workflow"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LangGraphNode" ADD CONSTRAINT "LangGraphNode_graphStateId_fkey" FOREIGN KEY ("graphStateId") REFERENCES "LangGraphState"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LangGraphEdge" ADD CONSTRAINT "LangGraphEdge_graphStateId_fkey" FOREIGN KEY ("graphStateId") REFERENCES "LangGraphState"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LangGraphEdge" ADD CONSTRAINT "LangGraphEdge_sourceNodeId_fkey" FOREIGN KEY ("sourceNodeId") REFERENCES "LangGraphNode"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LangGraphEdge" ADD CONSTRAINT "LangGraphEdge_targetNodeId_fkey" FOREIGN KEY ("targetNodeId") REFERENCES "LangGraphNode"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LangGraphNodeExecution" ADD CONSTRAINT "LangGraphNodeExecution_graphStateId_fkey" FOREIGN KEY ("graphStateId") REFERENCES "LangGraphState"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LangGraphNodeExecution" ADD CONSTRAINT "LangGraphNodeExecution_nodeId_fkey" FOREIGN KEY ("nodeId") REFERENCES "LangGraphNode"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkflowNode" ADD CONSTRAINT "WorkflowNode_designId_fkey" FOREIGN KEY ("designId") REFERENCES "WorkflowDesign"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkflowConnection" ADD CONSTRAINT "WorkflowConnection_designId_fkey" FOREIGN KEY ("designId") REFERENCES "WorkflowDesign"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkflowConnection" ADD CONSTRAINT "WorkflowConnection_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "WorkflowNode"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkflowConnection" ADD CONSTRAINT "WorkflowConnection_targetId_fkey" FOREIGN KEY ("targetId") REFERENCES "WorkflowNode"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkflowExecution" ADD CONSTRAINT "WorkflowExecution_triggerId_fkey" FOREIGN KEY ("triggerId") REFERENCES "AgentTrigger"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkflowExecution" ADD CONSTRAINT "WorkflowExecution_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkflowExecution" ADD CONSTRAINT "WorkflowExecution_workflowId_fkey" FOREIGN KEY ("workflowId") REFERENCES "Workflow"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DataSource" ADD CONSTRAINT "DataSource_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Signal" ADD CONSTRAINT "Signal_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "DataSource"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MemoryEntry" ADD CONSTRAINT "MemoryEntry_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FeedbackEntry" ADD CONSTRAINT "FeedbackEntry_memoryId_fkey" FOREIGN KEY ("memoryId") REFERENCES "MemoryEntry"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FeedbackEntry" ADD CONSTRAINT "FeedbackEntry_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FeedbackEntry" ADD CONSTRAINT "FeedbackEntry_workflowExecutionId_fkey" FOREIGN KEY ("workflowExecutionId") REFERENCES "WorkflowExecution"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RevenueStream" ADD CONSTRAINT "RevenueStream_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_revenueStreamId_fkey" FOREIGN KEY ("revenueStreamId") REFERENCES "RevenueStream"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RevenueMetric" ADD CONSTRAINT "RevenueMetric_revenueStreamId_fkey" FOREIGN KEY ("revenueStreamId") REFERENCES "RevenueStream"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RevenueAlert" ADD CONSTRAINT "RevenueAlert_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RevenueInsight" ADD CONSTRAINT "RevenueInsight_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OsintSource" ADD CONSTRAINT "OsintSource_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OsintFinding" ADD CONSTRAINT "OsintFinding_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "OsintSource"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OsintAlert" ADD CONSTRAINT "OsintAlert_findingId_fkey" FOREIGN KEY ("findingId") REFERENCES "OsintFinding"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OsintAlert" ADD CONSTRAINT "OsintAlert_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OsintScanJob" ADD CONSTRAINT "OsintScanJob_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OsintWebhook" ADD CONSTRAINT "OsintWebhook_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BusinessMetric" ADD CONSTRAINT "BusinessMetric_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BusinessInsight" ADD CONSTRAINT "BusinessInsight_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BusinessRecommendation" ADD CONSTRAINT "BusinessRecommendation_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CampaignSuggestion" ADD CONSTRAINT "CampaignSuggestion_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StrategicDecision" ADD CONSTRAINT "StrategicDecision_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StrategicOption" ADD CONSTRAINT "StrategicOption_decisionId_fkey" FOREIGN KEY ("decisionId") REFERENCES "StrategicDecision"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GrowthMetric" ADD CONSTRAINT "GrowthMetric_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HistoricalValue" ADD CONSTRAINT "HistoricalValue_growthMetricId_fkey" FOREIGN KEY ("growthMetricId") REFERENCES "GrowthMetric"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ForecastValue" ADD CONSTRAINT "ForecastValue_growthMetricId_fkey" FOREIGN KEY ("growthMetricId") REFERENCES "GrowthMetric"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MarketData" ADD CONSTRAINT "MarketData_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StrategicRecommendation" ADD CONSTRAINT "StrategicRecommendation_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExecutiveSummary" ADD CONSTRAINT "ExecutiveSummary_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DataPoint" ADD CONSTRAINT "DataPoint_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "MarketDataSource"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RolePermission" ADD CONSTRAINT "RolePermission_permissionId_fkey" FOREIGN KEY ("permissionId") REFERENCES "Permission"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RolePermission" ADD CONSTRAINT "RolePermission_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "Role"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserPermission" ADD CONSTRAINT "UserPermission_permissionId_fkey" FOREIGN KEY ("permissionId") REFERENCES "Permission"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserPermission" ADD CONSTRAINT "UserPermission_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Subscription" ADD CONSTRAINT "Subscription_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Subscription" ADD CONSTRAINT "Subscription_planId_fkey" FOREIGN KEY ("planId") REFERENCES "SubscriptionPlan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SubscriptionInvoice" ADD CONSTRAINT "SubscriptionInvoice_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SubscriptionInvoice" ADD CONSTRAINT "SubscriptionInvoice_subscriptionId_fkey" FOREIGN KEY ("subscriptionId") REFERENCES "Subscription"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AI_Agent" ADD CONSTRAINT "AI_Agent_personaId_fkey" FOREIGN KEY ("personaId") REFERENCES "AgentPersona"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AI_Agent" ADD CONSTRAINT "AI_Agent_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AgentPersona" ADD CONSTRAINT "AgentPersona_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AgentPersona" ADD CONSTRAINT "AgentPersona_forkedFromId_fkey" FOREIGN KEY ("forkedFromId") REFERENCES "AgentPersona"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AgentPersona" ADD CONSTRAINT "AgentPersona_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PersonaTrait" ADD CONSTRAINT "PersonaTrait_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PersonaMemoryScope" ADD CONSTRAINT "PersonaMemoryScope_personaId_fkey" FOREIGN KEY ("personaId") REFERENCES "AgentPersona"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AgentLog" ADD CONSTRAINT "AgentLog_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES "AI_Agent"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AgentLog" ADD CONSTRAINT "AgentLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SystemLog" ADD CONSTRAINT "SystemLog_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES "AI_Agent"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SystemLog" ADD CONSTRAINT "SystemLog_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SystemLog" ADD CONSTRAINT "SystemLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApiInteraction" ADD CONSTRAINT "ApiInteraction_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES "AI_Agent"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApiInteraction" ADD CONSTRAINT "ApiInteraction_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApiInteraction" ADD CONSTRAINT "ApiInteraction_systemLogId_fkey" FOREIGN KEY ("systemLogId") REFERENCES "SystemLog"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApiInteraction" ADD CONSTRAINT "ApiInteraction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HumanApproval" ADD CONSTRAINT "HumanApproval_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES "AI_Agent"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HumanApproval" ADD CONSTRAINT "HumanApproval_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HumanApproval" ADD CONSTRAINT "HumanApproval_systemLogId_fkey" FOREIGN KEY ("systemLogId") REFERENCES "SystemLog"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HumanApproval" ADD CONSTRAINT "HumanApproval_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TelemetrySpan" ADD CONSTRAINT "TelemetrySpan_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES "AI_Agent"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TelemetrySpan" ADD CONSTRAINT "TelemetrySpan_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TelemetrySpan" ADD CONSTRAINT "TelemetrySpan_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ModuleConfig" ADD CONSTRAINT "ModuleConfig_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ModuleConfig" ADD CONSTRAINT "ModuleConfig_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TenantBranding" ADD CONSTRAINT "TenantBranding_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TenantAnalytics" ADD CONSTRAINT "TenantAnalytics_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AgentFeedback" ADD CONSTRAINT "AgentFeedback_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES "AI_Agent"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AgentFeedback" ADD CONSTRAINT "AgentFeedback_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InteractionMemory" ADD CONSTRAINT "InteractionMemory_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES "AI_Agent"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InteractionMemory" ADD CONSTRAINT "InteractionMemory_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "AgentSession"("sessionId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InteractionMemory" ADD CONSTRAINT "InteractionMemory_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AgentEscalation" ADD CONSTRAINT "AgentEscalation_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES "AI_Agent"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AgentEscalation" ADD CONSTRAINT "AgentEscalation_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TaskAudit" ADD CONSTRAINT "TaskAudit_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES "AI_Agent"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TaskAudit" ADD CONSTRAINT "TaskAudit_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "APIKey" ADD CONSTRAINT "APIKey_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GlobalSettings" ADD CONSTRAINT "GlobalSettings_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QueryLog" ADD CONSTRAINT "QueryLog_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QueryLog" ADD CONSTRAINT "QueryLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QueryExecutionPlan" ADD CONSTRAINT "QueryExecutionPlan_queryId_fkey" FOREIGN KEY ("queryId") REFERENCES "QueryLog"("queryId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QueryCache" ADD CONSTRAINT "QueryCache_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES "AI_Agent"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QueryCache" ADD CONSTRAINT "QueryCache_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AlertRule" ADD CONSTRAINT "AlertRule_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Alert" ADD CONSTRAINT "Alert_acknowledgedBy_fkey" FOREIGN KEY ("acknowledgedBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Alert" ADD CONSTRAINT "Alert_ruleId_fkey" FOREIGN KEY ("ruleId") REFERENCES "AlertRule"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LogRetentionPolicy" ADD CONSTRAINT "LogRetentionPolicy_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SecurityAlert" ADD CONSTRAINT "SecurityAlert_scanId_fkey" FOREIGN KEY ("scanId") REFERENCES "SecurityScan"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SecurityAlert" ADD CONSTRAINT "SecurityAlert_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SecurityMetric" ADD CONSTRAINT "SecurityMetric_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SecurityRecommendation" ADD CONSTRAINT "SecurityRecommendation_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SecurityScan" ADD CONSTRAINT "SecurityScan_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ComplianceCheck" ADD CONSTRAINT "ComplianceCheck_scanId_fkey" FOREIGN KEY ("scanId") REFERENCES "SecurityScan"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ComplianceCheck" ADD CONSTRAINT "ComplianceCheck_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LogIntegrityCheck" ADD CONSTRAINT "LogIntegrityCheck_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CredentialScan" ADD CONSTRAINT "CredentialScan_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AnomalousUsage" ADD CONSTRAINT "AnomalousUsage_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SecurityEscalation" ADD CONSTRAINT "SecurityEscalation_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MfaPolicy" ADD CONSTRAINT "MfaPolicy_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MfaEnrollment" ADD CONSTRAINT "MfaEnrollment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SchemaMap" ADD CONSTRAINT "SchemaMap_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SchemaMap" ADD CONSTRAINT "SchemaMap_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AgentQueryPermission" ADD CONSTRAINT "AgentQueryPermission_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES "AI_Agent"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AgentQueryPermission" ADD CONSTRAINT "AgentQueryPermission_schemaMapId_fkey" FOREIGN KEY ("schemaMapId") REFERENCES "SchemaMap"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AgentQueryRequest" ADD CONSTRAINT "AgentQueryRequest_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES "AI_Agent"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AgentQueryRequest" ADD CONSTRAINT "AgentQueryRequest_approvedById_fkey" FOREIGN KEY ("approvedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AgentQueryRequest" ADD CONSTRAINT "AgentQueryRequest_queryLogId_fkey" FOREIGN KEY ("queryLogId") REFERENCES "QueryLog"("queryId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AgentQueryRequest" ADD CONSTRAINT "AgentQueryRequest_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "AgentSession"("sessionId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AgentQueryRequest" ADD CONSTRAINT "AgentQueryRequest_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QueryTemplate" ADD CONSTRAINT "QueryTemplate_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QueryTemplate" ADD CONSTRAINT "QueryTemplate_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AgentTrigger" ADD CONSTRAINT "AgentTrigger_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES "AI_Agent"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AgentTrigger" ADD CONSTRAINT "AgentTrigger_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "TriggerSource"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AgentTrigger" ADD CONSTRAINT "AgentTrigger_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AgentTrigger" ADD CONSTRAINT "AgentTrigger_workflowId_fkey" FOREIGN KEY ("workflowId") REFERENCES "Workflow"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TriggerExecutionFlow" ADD CONSTRAINT "TriggerExecutionFlow_executionId_fkey" FOREIGN KEY ("executionId") REFERENCES "WorkflowExecution"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TriggerExecutionFlow" ADD CONSTRAINT "TriggerExecutionFlow_triggerId_fkey" FOREIGN KEY ("triggerId") REFERENCES "AgentTrigger"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ThreatFeed" ADD CONSTRAINT "ThreatFeed_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ThreatMonitor" ADD CONSTRAINT "ThreatMonitor_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BrandAlert" ADD CONSTRAINT "BrandAlert_monitorId_fkey" FOREIGN KEY ("monitorId") REFERENCES "ThreatMonitor"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BrandAlert" ADD CONSTRAINT "BrandAlert_threatFeedId_fkey" FOREIGN KEY ("threatFeedId") REFERENCES "ThreatFeed"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BrandAlert" ADD CONSTRAINT "BrandAlert_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CVEAlert" ADD CONSTRAINT "CVEAlert_threatFeedId_fkey" FOREIGN KEY ("threatFeedId") REFERENCES "ThreatFeed"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CVEAlert" ADD CONSTRAINT "CVEAlert_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PhishingVector" ADD CONSTRAINT "PhishingVector_threatFeedId_fkey" FOREIGN KEY ("threatFeedId") REFERENCES "ThreatFeed"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PhishingVector" ADD CONSTRAINT "PhishingVector_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ThreatIntelligence" ADD CONSTRAINT "ThreatIntelligence_threatFeedId_fkey" FOREIGN KEY ("threatFeedId") REFERENCES "ThreatFeed"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ThreatIntelligence" ADD CONSTRAINT "ThreatIntelligence_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SentinelLogIntegration" ADD CONSTRAINT "SentinelLogIntegration_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SentientCheckpoint" ADD CONSTRAINT "SentientCheckpoint_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES "AI_Agent"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SentientCheckpoint" ADD CONSTRAINT "SentientCheckpoint_parentCheckpointId_fkey" FOREIGN KEY ("parentCheckpointId") REFERENCES "SentientCheckpoint"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SentientCheckpoint" ADD CONSTRAINT "SentientCheckpoint_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SentientMemorySnapshot" ADD CONSTRAINT "SentientMemorySnapshot_checkpointId_fkey" FOREIGN KEY ("checkpointId") REFERENCES "SentientCheckpoint"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SentientEscalation" ADD CONSTRAINT "SentientEscalation_checkpointId_fkey" FOREIGN KEY ("checkpointId") REFERENCES "SentientCheckpoint"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SentientDecisionTrace" ADD CONSTRAINT "SentientDecisionTrace_checkpointId_fkey" FOREIGN KEY ("checkpointId") REFERENCES "SentientCheckpoint"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AIPrompt" ADD CONSTRAINT "AIPrompt_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AIPrompt" ADD CONSTRAINT "AIPrompt_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AISystemPrompt" ADD CONSTRAINT "AISystemPrompt_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AISystemPrompt" ADD CONSTRAINT "AISystemPrompt_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AISystemPrompt" ADD CONSTRAINT "AISystemPrompt_promptId_fkey" FOREIGN KEY ("promptId") REFERENCES "AIPrompt"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AIReasoning" ADD CONSTRAINT "AIReasoning_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES "AI_Agent"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AIReasoning" ADD CONSTRAINT "AIReasoning_promptId_fkey" FOREIGN KEY ("promptId") REFERENCES "AIPrompt"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AIReasoning" ADD CONSTRAINT "AIReasoning_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "AISession"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AIReasoning" ADD CONSTRAINT "AIReasoning_systemPromptId_fkey" FOREIGN KEY ("systemPromptId") REFERENCES "AISystemPrompt"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AIReasoning" ADD CONSTRAINT "AIReasoning_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AIResponseNode" ADD CONSTRAINT "AIResponseNode_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "AIResponseNode"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AIResponseNode" ADD CONSTRAINT "AIResponseNode_reasoningId_fkey" FOREIGN KEY ("reasoningId") REFERENCES "AIReasoning"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AISession" ADD CONSTRAINT "AISession_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES "AI_Agent"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AISession" ADD CONSTRAINT "AISession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AIThoughtTrace" ADD CONSTRAINT "AIThoughtTrace_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES "AI_Agent"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AIThoughtTrace" ADD CONSTRAINT "AIThoughtTrace_checkpointId_fkey" FOREIGN KEY ("checkpointId") REFERENCES "SentientCheckpoint"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AIThoughtTrace" ADD CONSTRAINT "AIThoughtTrace_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AIThoughtRollback" ADD CONSTRAINT "AIThoughtRollback_traceId_fkey" FOREIGN KEY ("traceId") REFERENCES "AIThoughtTrace"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SentientLoopConfig" ADD CONSTRAINT "SentientLoopConfig_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SentientLoopWebhook" ADD CONSTRAINT "SentientLoopWebhook_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WebhookDelivery" ADD CONSTRAINT "WebhookDelivery_webhookId_fkey" FOREIGN KEY ("webhookId") REFERENCES "SentientLoopWebhook"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SentientLoopApiKey" ADD CONSTRAINT "SentientLoopApiKey_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EthicalRule" ADD CONSTRAINT "EthicalRule_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AlignmentCheck" ADD CONSTRAINT "AlignmentCheck_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES "AI_Agent"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AlignmentCheck" ADD CONSTRAINT "AlignmentCheck_ruleId_fkey" FOREIGN KEY ("ruleId") REFERENCES "EthicalRule"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AlignmentCheck" ADD CONSTRAINT "AlignmentCheck_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CollaborationArchive" ADD CONSTRAINT "CollaborationArchive_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CollaborationArchive" ADD CONSTRAINT "CollaborationArchive_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ArchiveContent" ADD CONSTRAINT "ArchiveContent_archiveId_fkey" FOREIGN KEY ("archiveId") REFERENCES "CollaborationArchive"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ArchiveVerification" ADD CONSTRAINT "ArchiveVerification_archiveId_fkey" FOREIGN KEY ("archiveId") REFERENCES "CollaborationArchive"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ArchiveVerification" ADD CONSTRAINT "ArchiveVerification_verifiedBy_fkey" FOREIGN KEY ("verifiedBy") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ArchiveAccessLog" ADD CONSTRAINT "ArchiveAccessLog_accessedBy_fkey" FOREIGN KEY ("accessedBy") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ArchiveAccessLog" ADD CONSTRAINT "ArchiveAccessLog_archiveId_fkey" FOREIGN KEY ("archiveId") REFERENCES "CollaborationArchive"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AgentTrustScore" ADD CONSTRAINT "AgentTrustScore_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES "AI_Agent"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EarnedBadge" ADD CONSTRAINT "EarnedBadge_badgeId_fkey" FOREIGN KEY ("badgeId") REFERENCES "TrustBadge"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EarnedBadge" ADD CONSTRAINT "EarnedBadge_trustScoreId_fkey" FOREIGN KEY ("trustScoreId") REFERENCES "AgentTrustScore"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AgentToWorkflow" ADD CONSTRAINT "_AgentToWorkflow_A_fkey" FOREIGN KEY ("A") REFERENCES "Agent"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AgentToWorkflow" ADD CONSTRAINT "_AgentToWorkflow_B_fkey" FOREIGN KEY ("B") REFERENCES "Workflow"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AgentPersonaToPersonaTrait" ADD CONSTRAINT "_AgentPersonaToPersonaTrait_A_fkey" FOREIGN KEY ("A") REFERENCES "AgentPersona"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AgentPersonaToPersonaTrait" ADD CONSTRAINT "_AgentPersonaToPersonaTrait_B_fkey" FOREIGN KEY ("B") REFERENCES "PersonaTrait"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_SessionPrompts" ADD CONSTRAINT "_SessionPrompts_A_fkey" FOREIGN KEY ("A") REFERENCES "AIPrompt"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_SessionPrompts" ADD CONSTRAINT "_SessionPrompts_B_fkey" FOREIGN KEY ("B") REFERENCES "AISession"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_SessionSystemPrompts" ADD CONSTRAINT "_SessionSystemPrompts_A_fkey" FOREIGN KEY ("A") REFERENCES "AISession"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_SessionSystemPrompts" ADD CONSTRAINT "_SessionSystemPrompts_B_fkey" FOREIGN KEY ("B") REFERENCES "AISystemPrompt"("id") ON DELETE CASCADE ON UPDATE CASCADE;
