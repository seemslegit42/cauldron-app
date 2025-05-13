-- CreateTable
CREATE TABLE "UserXP" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,
    "level" INTEGER NOT NULL DEFAULT 1,
    "currentXP" INTEGER NOT NULL DEFAULT 0,
    "totalXP" INTEGER NOT NULL DEFAULT 0,
    "runes" INTEGER NOT NULL DEFAULT 0,
    "lastXPGainAt" TIMESTAMP(3),
    "streakDays" INTEGER NOT NULL DEFAULT 0,
    "streakLastUpdated" TIMESTAMP(3),

    CONSTRAINT "UserXP_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "XPTransaction" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userXpId" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "reason" TEXT NOT NULL,
    "description" TEXT,
    "metadata" JSONB,

    CONSTRAINT "XPTransaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RuneTransaction" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userXpId" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "reason" TEXT NOT NULL,
    "description" TEXT,
    "metadata" JSONB,

    CONSTRAINT "RuneTransaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Achievement" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "icon" TEXT,
    "xpReward" INTEGER NOT NULL DEFAULT 0,
    "runeReward" INTEGER NOT NULL DEFAULT 0,
    "isRepeatable" BOOLEAN NOT NULL DEFAULT false,
    "cooldownHours" INTEGER,
    "requiredProgress" INTEGER NOT NULL DEFAULT 100,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "triggerCondition" TEXT,
    "metadata" JSONB,

    CONSTRAINT "Achievement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserAchievement" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userXpId" TEXT NOT NULL,
    "achievementId" TEXT NOT NULL,
    "progress" INTEGER NOT NULL DEFAULT 0,
    "isUnlocked" BOOLEAN NOT NULL DEFAULT false,
    "unlockedAt" TIMESTAMP(3),
    "lastProgressAt" TIMESTAMP(3),
    "timesUnlocked" INTEGER NOT NULL DEFAULT 0,
    "metadata" JSONB,

    CONSTRAINT "UserAchievement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Reward" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "icon" TEXT,
    "cost" INTEGER NOT NULL,
    "duration" INTEGER,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "requiredLevel" INTEGER,
    "effectData" JSONB,
    "metadata" JSONB,

    CONSTRAINT "Reward_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserReward" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userXpId" TEXT NOT NULL,
    "rewardId" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "activatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3),
    "metadata" JSONB,

    CONSTRAINT "UserReward_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SystemEvent" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,
    "eventType" TEXT NOT NULL,
    "eventSource" TEXT NOT NULL,
    "metadata" JSONB,
    "processed" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "SystemEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LevelConfig" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "level" INTEGER NOT NULL,
    "xpRequired" INTEGER NOT NULL,
    "runeReward" INTEGER NOT NULL DEFAULT 0,
    "title" TEXT,
    "description" TEXT,
    "metadata" JSONB,

    CONSTRAINT "LevelConfig_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LeaderboardSnapshot" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,
    "username" TEXT,
    "level" INTEGER NOT NULL,
    "xp" INTEGER NOT NULL,
    "runes" INTEGER NOT NULL,
    "achievements" INTEGER NOT NULL,
    "rank" INTEGER NOT NULL,
    "change" INTEGER,
    "metadata" JSONB,

    CONSTRAINT "LeaderboardSnapshot_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "UserXP_userId_key" ON "UserXP"("userId");

-- CreateIndex
CREATE INDEX "UserXP_userId_idx" ON "UserXP"("userId");

-- CreateIndex
CREATE INDEX "UserXP_level_idx" ON "UserXP"("level");

-- CreateIndex
CREATE INDEX "XPTransaction_userXpId_idx" ON "XPTransaction"("userXpId");

-- CreateIndex
CREATE INDEX "XPTransaction_createdAt_idx" ON "XPTransaction"("createdAt");

-- CreateIndex
CREATE INDEX "RuneTransaction_userXpId_idx" ON "RuneTransaction"("userXpId");

-- CreateIndex
CREATE INDEX "RuneTransaction_createdAt_idx" ON "RuneTransaction"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "Achievement_name_key" ON "Achievement"("name");

-- CreateIndex
CREATE INDEX "Achievement_category_idx" ON "Achievement"("category");

-- CreateIndex
CREATE INDEX "Achievement_isActive_idx" ON "Achievement"("isActive");

-- CreateIndex
CREATE UNIQUE INDEX "UserAchievement_userXpId_achievementId_key" ON "UserAchievement"("userXpId", "achievementId");

-- CreateIndex
CREATE INDEX "UserAchievement_userXpId_idx" ON "UserAchievement"("userXpId");

-- CreateIndex
CREATE INDEX "UserAchievement_achievementId_idx" ON "UserAchievement"("achievementId");

-- CreateIndex
CREATE INDEX "UserAchievement_isUnlocked_idx" ON "UserAchievement"("isUnlocked");

-- CreateIndex
CREATE UNIQUE INDEX "Reward_name_key" ON "Reward"("name");

-- CreateIndex
CREATE INDEX "Reward_category_idx" ON "Reward"("category");

-- CreateIndex
CREATE INDEX "Reward_isActive_idx" ON "Reward"("isActive");

-- CreateIndex
CREATE INDEX "Reward_requiredLevel_idx" ON "Reward"("requiredLevel");

-- CreateIndex
CREATE UNIQUE INDEX "UserReward_userXpId_rewardId_isActive_key" ON "UserReward"("userXpId", "rewardId", "isActive");

-- CreateIndex
CREATE INDEX "UserReward_userXpId_idx" ON "UserReward"("userXpId");

-- CreateIndex
CREATE INDEX "UserReward_rewardId_idx" ON "UserReward"("rewardId");

-- CreateIndex
CREATE INDEX "UserReward_isActive_idx" ON "UserReward"("isActive");

-- CreateIndex
CREATE INDEX "UserReward_expiresAt_idx" ON "UserReward"("expiresAt");

-- CreateIndex
CREATE INDEX "SystemEvent_userId_idx" ON "SystemEvent"("userId");

-- CreateIndex
CREATE INDEX "SystemEvent_eventType_idx" ON "SystemEvent"("eventType");

-- CreateIndex
CREATE INDEX "SystemEvent_eventSource_idx" ON "SystemEvent"("eventSource");

-- CreateIndex
CREATE INDEX "SystemEvent_processed_idx" ON "SystemEvent"("processed");

-- CreateIndex
CREATE INDEX "SystemEvent_createdAt_idx" ON "SystemEvent"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "LevelConfig_level_key" ON "LevelConfig"("level");

-- CreateIndex
CREATE INDEX "LevelConfig_level_idx" ON "LevelConfig"("level");

-- CreateIndex
CREATE UNIQUE INDEX "LeaderboardSnapshot_userId_createdAt_key" ON "LeaderboardSnapshot"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "LeaderboardSnapshot_userId_idx" ON "LeaderboardSnapshot"("userId");

-- CreateIndex
CREATE INDEX "LeaderboardSnapshot_rank_idx" ON "LeaderboardSnapshot"("rank");

-- CreateIndex
CREATE INDEX "LeaderboardSnapshot_createdAt_idx" ON "LeaderboardSnapshot"("createdAt");

-- AddForeignKey
ALTER TABLE "UserXP" ADD CONSTRAINT "UserXP_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "XPTransaction" ADD CONSTRAINT "XPTransaction_userXpId_fkey" FOREIGN KEY ("userXpId") REFERENCES "UserXP"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RuneTransaction" ADD CONSTRAINT "RuneTransaction_userXpId_fkey" FOREIGN KEY ("userXpId") REFERENCES "UserXP"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserAchievement" ADD CONSTRAINT "UserAchievement_userXpId_fkey" FOREIGN KEY ("userXpId") REFERENCES "UserXP"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserAchievement" ADD CONSTRAINT "UserAchievement_achievementId_fkey" FOREIGN KEY ("achievementId") REFERENCES "Achievement"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserReward" ADD CONSTRAINT "UserReward_userXpId_fkey" FOREIGN KEY ("userXpId") REFERENCES "UserXP"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserReward" ADD CONSTRAINT "UserReward_rewardId_fkey" FOREIGN KEY ("rewardId") REFERENCES "Reward"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SystemEvent" ADD CONSTRAINT "SystemEvent_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LeaderboardSnapshot" ADD CONSTRAINT "LeaderboardSnapshot_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
