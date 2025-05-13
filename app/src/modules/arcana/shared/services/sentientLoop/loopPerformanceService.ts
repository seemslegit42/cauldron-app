import { prisma } from 'wasp/server';
import { LoggingService } from '../logging';

/**
 * Service for tracking and analyzing Sentient Loop™ performance metrics
 */
export class LoopPerformanceService {
  /**
   * Calculates and returns performance metrics for the Sentient Loop™
   * 
   * @param params Query parameters
   * @returns Performance metrics
   */
  static async getPerformanceMetrics(params: {
    userId?: string;
    moduleId?: string;
    startDate?: Date;
    endDate?: Date;
    agentId?: string;
  }) {
    try {
      const { userId, moduleId, startDate, endDate, agentId } = params;
      
      // Set default date range to last 30 days if not specified
      const queryStartDate = startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      const queryEndDate = endDate || new Date();
      
      // Base filter for all queries
      const baseFilter: any = {
        createdAt: {
          gte: queryStartDate,
          lte: queryEndDate
        }
      };
      
      // Add optional filters
      if (userId) baseFilter.userId = userId;
      if (moduleId) baseFilter.moduleId = moduleId;
      if (agentId) baseFilter.agentId = agentId;
      
      // Get all checkpoints in the date range
      const checkpoints = await prisma.sentientCheckpoint.findMany({
        where: baseFilter,
        include: {
          decisionTraces: true,
          memorySnapshots: true,
          escalations: true
        }
      });
      
      // Calculate time to human decision
      const timeToDecisionData = await this.calculateTimeToDecision(checkpoints);
      
      // Calculate false positive rate
      const falsePositiveRate = await this.calculateFalsePositiveRate(checkpoints);
      
      // Calculate agent response quality
      const agentResponseQuality = await this.calculateAgentResponseQuality(checkpoints);
      
      // Calculate memory retrieval success rate
      const memoryRetrievalRate = await this.calculateMemoryRetrievalRate(checkpoints);
      
      // Calculate override rate
      const overrideRate = await this.calculateOverrideRate(checkpoints);
      
      // Calculate checkpoint resolution distribution
      const resolutionDistribution = await this.calculateResolutionDistribution(checkpoints);
      
      // Calculate module-specific metrics
      const moduleMetrics = await this.calculateModuleMetrics(checkpoints);
      
      // Calculate agent-specific metrics
      const agentMetrics = await this.calculateAgentMetrics(checkpoints);
      
      // Calculate trend data
      const trends = await this.calculateTrends({
        userId,
        moduleId,
        startDate: queryStartDate,
        endDate: queryEndDate,
        agentId
      });
      
      return {
        timeToDecision: timeToDecisionData,
        falsePositiveRate,
        agentResponseQuality,
        memoryRetrievalRate,
        overrideRate,
        resolutionDistribution,
        moduleMetrics,
        agentMetrics,
        trends,
        totalCheckpoints: checkpoints.length,
        dateRange: {
          start: queryStartDate,
          end: queryEndDate
        }
      };
    } catch (error) {
      LoggingService.error({
        message: 'Error calculating Sentient Loop performance metrics',
        module: 'arcana',
        category: 'SENTIENT_LOOP',
        error
      });
      throw error;
    }
  }
  
  /**
   * Calculates the average time to human decision
   * 
   * @param checkpoints Array of checkpoints
   * @returns Time to decision metrics
   */
  private static async calculateTimeToDecision(checkpoints: any[]) {
    // Filter checkpoints that have been resolved
    const resolvedCheckpoints = checkpoints.filter(cp => 
      cp.status !== 'PENDING' && cp.resolvedAt
    );
    
    if (resolvedCheckpoints.length === 0) {
      return {
        averageTimeMs: null,
        medianTimeMs: null,
        byPriority: {
          critical: null,
          high: null,
          medium: null,
          low: null
        },
        byType: {}
      };
    }
    
    // Calculate time differences in milliseconds
    const timeDiffs = resolvedCheckpoints.map(cp => {
      return {
        timeMs: cp.resolvedAt.getTime() - cp.createdAt.getTime(),
        type: cp.type,
        priority: this.getPriorityFromType(cp.type)
      };
    });
    
    // Calculate average time
    const totalTimeMs = timeDiffs.reduce((sum, item) => sum + item.timeMs, 0);
    const averageTimeMs = totalTimeMs / timeDiffs.length;
    
    // Calculate median time
    const sortedTimes = [...timeDiffs].sort((a, b) => a.timeMs - b.timeMs);
    const medianTimeMs = sortedTimes[Math.floor(sortedTimes.length / 2)].timeMs;
    
    // Calculate time by priority
    const criticalTimes = timeDiffs.filter(t => t.priority === 'critical').map(t => t.timeMs);
    const highTimes = timeDiffs.filter(t => t.priority === 'high').map(t => t.timeMs);
    const mediumTimes = timeDiffs.filter(t => t.priority === 'medium').map(t => t.timeMs);
    const lowTimes = timeDiffs.filter(t => t.priority === 'low').map(t => t.timeMs);
    
    // Calculate time by checkpoint type
    const timeByType: Record<string, number> = {};
    const countByType: Record<string, number> = {};
    
    timeDiffs.forEach(item => {
      if (!timeByType[item.type]) {
        timeByType[item.type] = 0;
        countByType[item.type] = 0;
      }
      timeByType[item.type] += item.timeMs;
      countByType[item.type]++;
    });
    
    const averageTimeByType: Record<string, number> = {};
    Object.keys(timeByType).forEach(type => {
      averageTimeByType[type] = timeByType[type] / countByType[type];
    });
    
    return {
      averageTimeMs,
      medianTimeMs,
      byPriority: {
        critical: criticalTimes.length > 0 ? criticalTimes.reduce((sum, t) => sum + t, 0) / criticalTimes.length : null,
        high: highTimes.length > 0 ? highTimes.reduce((sum, t) => sum + t, 0) / highTimes.length : null,
        medium: mediumTimes.length > 0 ? mediumTimes.reduce((sum, t) => sum + t, 0) / mediumTimes.length : null,
        low: lowTimes.length > 0 ? lowTimes.reduce((sum, t) => sum + t, 0) / lowTimes.length : null
      },
      byType: averageTimeByType
    };
  }
  
  /**
   * Calculates the false positive rate (checkpoints that were unnecessary)
   * 
   * @param checkpoints Array of checkpoints
   * @returns False positive rate metrics
   */
  private static async calculateFalsePositiveRate(checkpoints: any[]) {
    // Consider checkpoints that were approved without modification as potential false positives
    const approvedCheckpoints = checkpoints.filter(cp => cp.status === 'APPROVED');
    
    if (approvedCheckpoints.length === 0) {
      return {
        overall: 0,
        byType: {},
        byModule: {}
      };
    }
    
    // Estimate false positives based on decision traces
    // A checkpoint is considered a false positive if it was approved quickly without modification
    // and had a high confidence score in the metadata
    const falsePositives = approvedCheckpoints.filter(cp => {
      // Check if resolved quickly (less than 10 seconds)
      const quickResolution = cp.resolvedAt && 
        (cp.resolvedAt.getTime() - cp.createdAt.getTime() < 10000);
      
      // Check if high confidence in metadata
      const highConfidence = cp.metadata && 
        cp.metadata.confidence && 
        cp.metadata.confidence > 0.9;
      
      return quickResolution && highConfidence;
    });
    
    // Calculate overall false positive rate
    const overallRate = falsePositives.length / checkpoints.length;
    
    // Calculate by type
    const typeGroups: Record<string, { total: number, falsePositives: number }> = {};
    checkpoints.forEach(cp => {
      if (!typeGroups[cp.type]) {
        typeGroups[cp.type] = { total: 0, falsePositives: 0 };
      }
      typeGroups[cp.type].total++;
      
      if (falsePositives.includes(cp)) {
        typeGroups[cp.type].falsePositives++;
      }
    });
    
    const rateByType: Record<string, number> = {};
    Object.keys(typeGroups).forEach(type => {
      rateByType[type] = typeGroups[type].falsePositives / typeGroups[type].total;
    });
    
    // Calculate by module
    const moduleGroups: Record<string, { total: number, falsePositives: number }> = {};
    checkpoints.forEach(cp => {
      if (!moduleGroups[cp.moduleId]) {
        moduleGroups[cp.moduleId] = { total: 0, falsePositives: 0 };
      }
      moduleGroups[cp.moduleId].total++;
      
      if (falsePositives.includes(cp)) {
        moduleGroups[cp.moduleId].falsePositives++;
      }
    });
    
    const rateByModule: Record<string, number> = {};
    Object.keys(moduleGroups).forEach(moduleId => {
      rateByModule[moduleId] = moduleGroups[moduleId].falsePositives / moduleGroups[moduleId].total;
    });
    
    return {
      overall: overallRate,
      byType: rateByType,
      byModule: rateByModule
    };
  }
  
  /**
   * Calculates the agent response quality based on rejection and modification rates
   * 
   * @param checkpoints Array of checkpoints
   * @returns Agent response quality metrics
   */
  private static async calculateAgentResponseQuality(checkpoints: any[]) {
    if (checkpoints.length === 0) {
      return {
        overall: 0,
        approvalRate: 0,
        rejectionRate: 0,
        modificationRate: 0,
        byAgent: {}
      };
    }
    
    // Count checkpoints by status
    const approved = checkpoints.filter(cp => cp.status === 'APPROVED').length;
    const rejected = checkpoints.filter(cp => cp.status === 'REJECTED').length;
    const modified = checkpoints.filter(cp => cp.status === 'MODIFIED').length;
    const resolved = approved + rejected + modified;
    
    // Calculate rates
    const approvalRate = resolved > 0 ? approved / resolved : 0;
    const rejectionRate = resolved > 0 ? rejected / resolved : 0;
    const modificationRate = resolved > 0 ? modified / resolved : 0;
    
    // Calculate overall quality score (higher is better)
    // Formula: 1.0 * approvalRate + 0.5 * modificationRate + 0.0 * rejectionRate
    const overallQuality = approvalRate + (0.5 * modificationRate);
    
    // Calculate by agent
    const agentGroups: Record<string, { 
      total: number, 
      approved: number, 
      rejected: number, 
      modified: number 
    }> = {};
    
    checkpoints.forEach(cp => {
      if (!cp.agentId) return;
      
      if (!agentGroups[cp.agentId]) {
        agentGroups[cp.agentId] = { 
          total: 0, 
          approved: 0, 
          rejected: 0, 
          modified: 0 
        };
      }
      
      agentGroups[cp.agentId].total++;
      
      if (cp.status === 'APPROVED') agentGroups[cp.agentId].approved++;
      if (cp.status === 'REJECTED') agentGroups[cp.agentId].rejected++;
      if (cp.status === 'MODIFIED') agentGroups[cp.agentId].modified++;
    });
    
    const qualityByAgent: Record<string, {
      quality: number,
      approvalRate: number,
      rejectionRate: number,
      modificationRate: number,
      checkpointCount: number
    }> = {};
    
    Object.keys(agentGroups).forEach(agentId => {
      const group = agentGroups[agentId];
      const resolved = group.approved + group.rejected + group.modified;
      
      if (resolved === 0) return;
      
      const agentApprovalRate = group.approved / resolved;
      const agentRejectionRate = group.rejected / resolved;
      const agentModificationRate = group.modified / resolved;
      
      qualityByAgent[agentId] = {
        quality: agentApprovalRate + (0.5 * agentModificationRate),
        approvalRate: agentApprovalRate,
        rejectionRate: agentRejectionRate,
        modificationRate: agentModificationRate,
        checkpointCount: group.total
      };
    });
    
    return {
      overall: overallQuality,
      approvalRate,
      rejectionRate,
      modificationRate,
      byAgent: qualityByAgent
    };
  }
  
  /**
   * Calculates the memory retrieval success rate
   * 
   * @param checkpoints Array of checkpoints
   * @returns Memory retrieval metrics
   */
  private static async calculateMemoryRetrievalRate(checkpoints: any[]) {
    // This is a simplified implementation
    // In a real system, you would track memory retrieval attempts and successes
    
    // Count checkpoints with memory snapshots
    const checkpointsWithMemory = checkpoints.filter(cp => 
      cp.memorySnapshots && cp.memorySnapshots.length > 0
    ).length;
    
    const successRate = checkpoints.length > 0 ? checkpointsWithMemory / checkpoints.length : 0;
    
    // Calculate average memory snapshots per checkpoint
    const totalSnapshots = checkpoints.reduce((sum, cp) => 
      sum + (cp.memorySnapshots ? cp.memorySnapshots.length : 0), 0
    );
    
    const avgSnapshotsPerCheckpoint = checkpoints.length > 0 ? 
      totalSnapshots / checkpoints.length : 0;
    
    return {
      successRate,
      avgSnapshotsPerCheckpoint,
      totalSnapshots
    };
  }
  
  /**
   * Calculates the override rate (how often humans modify agent decisions)
   * 
   * @param checkpoints Array of checkpoints
   * @returns Override rate metrics
   */
  private static async calculateOverrideRate(checkpoints: any[]) {
    // Filter resolved checkpoints
    const resolvedCheckpoints = checkpoints.filter(cp => 
      cp.status !== 'PENDING'
    );
    
    if (resolvedCheckpoints.length === 0) {
      return {
        overall: 0,
        byType: {},
        byModule: {}
      };
    }
    
    // Count overrides (rejected or modified)
    const overrides = resolvedCheckpoints.filter(cp => 
      cp.status === 'REJECTED' || cp.status === 'MODIFIED'
    ).length;
    
    // Calculate overall override rate
    const overallRate = overrides / resolvedCheckpoints.length;
    
    // Calculate by type
    const typeGroups: Record<string, { total: number, overrides: number }> = {};
    resolvedCheckpoints.forEach(cp => {
      if (!typeGroups[cp.type]) {
        typeGroups[cp.type] = { total: 0, overrides: 0 };
      }
      typeGroups[cp.type].total++;
      
      if (cp.status === 'REJECTED' || cp.status === 'MODIFIED') {
        typeGroups[cp.type].overrides++;
      }
    });
    
    const rateByType: Record<string, number> = {};
    Object.keys(typeGroups).forEach(type => {
      rateByType[type] = typeGroups[type].overrides / typeGroups[type].total;
    });
    
    // Calculate by module
    const moduleGroups: Record<string, { total: number, overrides: number }> = {};
    resolvedCheckpoints.forEach(cp => {
      if (!moduleGroups[cp.moduleId]) {
        moduleGroups[cp.moduleId] = { total: 0, overrides: 0 };
      }
      moduleGroups[cp.moduleId].total++;
      
      if (cp.status === 'REJECTED' || cp.status === 'MODIFIED') {
        moduleGroups[cp.moduleId].overrides++;
      }
    });
    
    const rateByModule: Record<string, number> = {};
    Object.keys(moduleGroups).forEach(moduleId => {
      rateByModule[moduleId] = moduleGroups[moduleId].overrides / moduleGroups[moduleId].total;
    });
    
    return {
      overall: overallRate,
      byType: rateByType,
      byModule: rateByModule
    };
  }
  
  /**
   * Calculates the distribution of checkpoint resolutions
   * 
   * @param checkpoints Array of checkpoints
   * @returns Resolution distribution metrics
   */
  private static async calculateResolutionDistribution(checkpoints: any[]) {
    // Count checkpoints by status
    const pending = checkpoints.filter(cp => cp.status === 'PENDING').length;
    const approved = checkpoints.filter(cp => cp.status === 'APPROVED').length;
    const rejected = checkpoints.filter(cp => cp.status === 'REJECTED').length;
    const modified = checkpoints.filter(cp => cp.status === 'MODIFIED').length;
    const escalated = checkpoints.filter(cp => cp.status === 'ESCALATED').length;
    const expired = checkpoints.filter(cp => cp.status === 'EXPIRED').length;
    const cancelled = checkpoints.filter(cp => cp.status === 'CANCELLED').length;
    
    return {
      pending,
      approved,
      rejected,
      modified,
      escalated,
      expired,
      cancelled,
      total: checkpoints.length
    };
  }
  
  /**
   * Calculates module-specific metrics
   * 
   * @param checkpoints Array of checkpoints
   * @returns Module metrics
   */
  private static async calculateModuleMetrics(checkpoints: any[]) {
    // Group checkpoints by module
    const moduleGroups: Record<string, any[]> = {};
    checkpoints.forEach(cp => {
      if (!moduleGroups[cp.moduleId]) {
        moduleGroups[cp.moduleId] = [];
      }
      moduleGroups[cp.moduleId].push(cp);
    });
    
    // Calculate metrics for each module
    const moduleMetrics: Record<string, {
      checkpointCount: number;
      resolutionDistribution: any;
      averageTimeToDecision: number | null;
      overrideRate: number;
    }> = {};
    
    for (const moduleId of Object.keys(moduleGroups)) {
      const moduleCheckpoints = moduleGroups[moduleId];
      
      // Calculate resolution distribution
      const resolutionDistribution = await this.calculateResolutionDistribution(moduleCheckpoints);
      
      // Calculate time to decision
      const timeToDecision = await this.calculateTimeToDecision(moduleCheckpoints);
      
      // Calculate override rate
      const overrideRate = await this.calculateOverrideRate(moduleCheckpoints);
      
      moduleMetrics[moduleId] = {
        checkpointCount: moduleCheckpoints.length,
        resolutionDistribution,
        averageTimeToDecision: timeToDecision.averageTimeMs,
        overrideRate: overrideRate.overall
      };
    }
    
    return moduleMetrics;
  }
  
  /**
   * Calculates agent-specific metrics
   * 
   * @param checkpoints Array of checkpoints
   * @returns Agent metrics
   */
  private static async calculateAgentMetrics(checkpoints: any[]) {
    // Filter checkpoints with agent IDs
    const agentCheckpoints = checkpoints.filter(cp => cp.agentId);
    
    // Group checkpoints by agent
    const agentGroups: Record<string, any[]> = {};
    agentCheckpoints.forEach(cp => {
      if (!agentGroups[cp.agentId]) {
        agentGroups[cp.agentId] = [];
      }
      agentGroups[cp.agentId].push(cp);
    });
    
    // Calculate metrics for each agent
    const agentMetrics: Record<string, {
      checkpointCount: number;
      resolutionDistribution: any;
      responseQuality: number;
      overrideRate: number;
    }> = {};
    
    for (const agentId of Object.keys(agentGroups)) {
      const agentCheckpoints = agentGroups[agentId];
      
      // Calculate resolution distribution
      const resolutionDistribution = await this.calculateResolutionDistribution(agentCheckpoints);
      
      // Calculate response quality
      const responseQuality = await this.calculateAgentResponseQuality(agentCheckpoints);
      
      // Calculate override rate
      const overrideRate = await this.calculateOverrideRate(agentCheckpoints);
      
      agentMetrics[agentId] = {
        checkpointCount: agentCheckpoints.length,
        resolutionDistribution,
        responseQuality: responseQuality.overall,
        overrideRate: overrideRate.overall
      };
    }
    
    return agentMetrics;
  }
  
  /**
   * Calculates trend data over time
   * 
   * @param params Query parameters
   * @returns Trend metrics
   */
  private static async calculateTrends(params: {
    userId?: string;
    moduleId?: string;
    startDate: Date;
    endDate: Date;
    agentId?: string;
  }) {
    const { userId, moduleId, startDate, endDate, agentId } = params;
    
    // Calculate the number of days in the date range
    const daysDiff = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    
    // Determine the appropriate time interval based on the date range
    let interval: 'day' | 'week' | 'month';
    if (daysDiff <= 14) {
      interval = 'day';
    } else if (daysDiff <= 90) {
      interval = 'week';
    } else {
      interval = 'month';
    }
    
    // Base filter for all queries
    const baseFilter: any = {
      createdAt: {
        gte: startDate,
        lte: endDate
      }
    };
    
    // Add optional filters
    if (userId) baseFilter.userId = userId;
    if (moduleId) baseFilter.moduleId = moduleId;
    if (agentId) baseFilter.agentId = agentId;
    
    // Get all checkpoints in the date range
    const checkpoints = await prisma.sentientCheckpoint.findMany({
      where: baseFilter,
      select: {
        id: true,
        createdAt: true,
        resolvedAt: true,
        status: true,
        type: true
      }
    });
    
    // Group checkpoints by time interval
    const timeGroups: Record<string, any[]> = {};
    
    checkpoints.forEach(cp => {
      let timeKey: string;
      
      if (interval === 'day') {
        timeKey = cp.createdAt.toISOString().split('T')[0]; // YYYY-MM-DD
      } else if (interval === 'week') {
        // Get the week number
        const date = new Date(cp.createdAt);
        const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
        const pastDaysOfYear = (date.getTime() - firstDayOfYear.getTime()) / 86400000;
        const weekNumber = Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
        timeKey = `${date.getFullYear()}-W${weekNumber}`;
      } else {
        // Month
        timeKey = `${cp.createdAt.getFullYear()}-${cp.createdAt.getMonth() + 1}`;
      }
      
      if (!timeGroups[timeKey]) {
        timeGroups[timeKey] = [];
      }
      
      timeGroups[timeKey].push(cp);
    });
    
    // Calculate metrics for each time interval
    const trendData: Array<{
      timeKey: string;
      checkpointCount: number;
      approvedCount: number;
      rejectedCount: number;
      modifiedCount: number;
      escalatedCount: number;
      averageTimeToDecisionMs: number | null;
    }> = [];
    
    for (const timeKey of Object.keys(timeGroups).sort()) {
      const groupCheckpoints = timeGroups[timeKey];
      
      // Count by status
      const approvedCount = groupCheckpoints.filter(cp => cp.status === 'APPROVED').length;
      const rejectedCount = groupCheckpoints.filter(cp => cp.status === 'REJECTED').length;
      const modifiedCount = groupCheckpoints.filter(cp => cp.status === 'MODIFIED').length;
      const escalatedCount = groupCheckpoints.filter(cp => cp.status === 'ESCALATED').length;
      
      // Calculate average time to decision
      let averageTimeToDecisionMs: number | null = null;
      const resolvedCheckpoints = groupCheckpoints.filter(cp => cp.resolvedAt);
      
      if (resolvedCheckpoints.length > 0) {
        const totalTimeMs = resolvedCheckpoints.reduce((sum, cp) => {
          return sum + (cp.resolvedAt!.getTime() - cp.createdAt.getTime());
        }, 0);
        
        averageTimeToDecisionMs = totalTimeMs / resolvedCheckpoints.length;
      }
      
      trendData.push({
        timeKey,
        checkpointCount: groupCheckpoints.length,
        approvedCount,
        rejectedCount,
        modifiedCount,
        escalatedCount,
        averageTimeToDecisionMs
      });
    }
    
    return {
      interval,
      data: trendData
    };
  }
  
  /**
   * Gets the priority level from a checkpoint type
   * 
   * @param type Checkpoint type
   * @returns Priority level
   */
  private static getPriorityFromType(type: string): 'critical' | 'high' | 'medium' | 'low' {
    switch (type) {
      case 'ESCALATION_REQUIRED':
        return 'critical';
      case 'DECISION_REQUIRED':
        return 'high';
      case 'CONFIRMATION_REQUIRED':
      case 'VALIDATION_REQUIRED':
        return 'medium';
      case 'INFORMATION_REQUIRED':
      case 'AUDIT_REQUIRED':
      default:
        return 'low';
    }
  }
}