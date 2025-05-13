/**
 * OpsBriefingFeed Component
 *
 * Aggregates feeds from Athena, Phantom, and Sentinel modules to provide
 * a comprehensive operational briefing for the user.
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery } from 'wasp/client/operations';
import { Link } from 'react-router-dom';
import { cn } from '@src/shared/utils/cn';
import { getGlassmorphismClasses } from '@src/shared/utils/glassmorphism';
import {
  BarChart3,
  Shield,
  Eye,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Zap,
  RefreshCw,
  ChevronRight,
  ChevronDown,
  Clock,
  Filter
} from 'lucide-react';
import { Button } from '@src/shared/components/ui/Button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@src/shared/components/ui/Tabs';
import { formatDistanceToNow } from 'date-fns';

// Import operations from different modules
import {
  getBusinessMetrics,
  getBusinessInsights
} from '@src/modules/athena/api/operations';
import {
  getSecurityAlerts,
  getSecurityMetrics
} from '@src/modules/sentinel/api/operations';
import {
  getThreatDetections,
  getOsintScanResults
} from '@src/modules/phantom/api/operations';

// Types
export interface OpsBriefingFeedProps {
  className?: string;
  maxItems?: number;
  refreshInterval?: number; // in milliseconds
  defaultTab?: 'all' | 'athena' | 'phantom' | 'sentinel';
}

interface FeedItem {
  id: string;
  title: string;
  description: string;
  source: 'athena' | 'phantom' | 'sentinel';
  sourceIcon: React.ReactNode;
  timestamp: Date;
  priority: 'critical' | 'high' | 'medium' | 'low';
  type: 'metric' | 'insight' | 'alert' | 'threat' | 'scan';
  metadata?: any;
  url?: string;
}

/**
 * OpsBriefingFeed - Aggregates feeds from Athena, Phantom, and Sentinel
 */
export const OpsBriefingFeed: React.FC<OpsBriefingFeedProps> = ({
  className,
  maxItems = 10,
  refreshInterval = 60000, // 1 minute
  defaultTab = 'all',
}) => {
  // State
  const [activeTab, setActiveTab] = useState<'all' | 'athena' | 'phantom' | 'sentinel'>(defaultTab);
  const [expandedItem, setExpandedItem] = useState<string | null>(null);
  const [feedItems, setFeedItems] = useState<FeedItem[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [filterPriority, setFilterPriority] = useState<'all' | 'critical' | 'high' | 'medium' | 'low'>('all');

  // Queries
  const { data: businessMetrics, isLoading: isLoadingMetrics } = useQuery(getBusinessMetrics);
  const { data: businessInsights, isLoading: isLoadingInsights } = useQuery(getBusinessInsights);
  const { data: securityAlerts, isLoading: isLoadingAlerts } = useQuery(getSecurityAlerts);
  const { data: securityMetrics, isLoading: isLoadingSecurityMetrics } = useQuery(getSecurityMetrics);
  const { data: threatDetections, isLoading: isLoadingThreats } = useQuery(getThreatDetections);
  const { data: osintResults, isLoading: isLoadingOsint } = useQuery(getOsintScanResults);

  // Loading state
  const isLoading =
    isLoadingMetrics ||
    isLoadingInsights ||
    isLoadingAlerts ||
    isLoadingSecurityMetrics ||
    isLoadingThreats ||
    isLoadingOsint;

  // Process and combine feed items
  useEffect(() => {
    const items: FeedItem[] = [];

    // Process Athena business metrics
    if (businessMetrics) {
      businessMetrics.forEach((metric: any) => {
        const trend = metric.trend || 0;
        const priority =
          Math.abs(trend) > 20 ? 'critical' :
            Math.abs(trend) > 10 ? 'high' :
              Math.abs(trend) > 5 ? 'medium' : 'low';

        items.push({
          id: `metric-${metric.id}`,
          title: metric.name,
          description: `${metric.value} (${trend > 0 ? '+' : ''}${trend}%)`,
          source: 'athena',
          sourceIcon: <BarChart3 className="h-4 w-4" />,
          timestamp: new Date(metric.updatedAt),
          priority,
          type: 'metric',
          metadata: {
            value: metric.value,
            trend,
            unit: metric.unit,
            category: metric.category
          },
          url: '/athena/metrics'
        });
      });
    }

    // Process Athena business insights
    if (businessInsights) {
      businessInsights.forEach((insight: any) => {
        items.push({
          id: `insight-${insight.id}`,
          title: insight.title,
          description: insight.description,
          source: 'athena',
          sourceIcon: <Zap className="h-4 w-4" />,
          timestamp: new Date(insight.createdAt),
          priority: insight.impact,
          type: 'insight',
          metadata: {
            impact: insight.impact,
            confidence: insight.confidence,
            category: insight.category,
            relatedMetrics: insight.relatedMetrics
          },
          url: '/athena/insights'
        });
      });
    }

    // Process Sentinel security alerts
    if (securityAlerts) {
      securityAlerts.forEach((alert: any) => {
        items.push({
          id: `alert-${alert.id}`,
          title: alert.title,
          description: alert.description,
          source: 'sentinel',
          sourceIcon: <AlertTriangle className="h-4 w-4" />,
          timestamp: new Date(alert.createdAt),
          priority: alert.severity,
          type: 'alert',
          metadata: {
            severity: alert.severity,
            status: alert.status,
            source: alert.source
          },
          url: '/sentinel/alerts'
        });
      });
    }

    // Process Phantom threat detections
    if (threatDetections) {
      threatDetections.forEach((threat: any) => {
        items.push({
          id: `threat-${threat.id}`,
          title: threat.title,
          description: threat.description,
          source: 'phantom',
          sourceIcon: <Shield className="h-4 w-4" />,
          timestamp: new Date(threat.detectedAt),
          priority: threat.severity,
          type: 'threat',
          metadata: {
            severity: threat.severity,
            type: threat.type,
            status: threat.status,
            source: threat.source
          },
          url: '/phantom/threats'
        });
      });
    }

    // Process Phantom OSINT scan results
    if (osintResults) {
      osintResults.forEach((result: any) => {
        items.push({
          id: `osint-${result.id}`,
          title: result.title,
          description: result.description,
          source: 'phantom',
          sourceIcon: <Eye className="h-4 w-4" />,
          timestamp: new Date(result.scanDate),
          priority: result.severity,
          type: 'scan',
          metadata: {
            severity: result.severity,
            category: result.category,
            source: result.source
          },
          url: '/phantom/osint'
        });
      });
    }

    // Sort by timestamp (newest first)
    items.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

    setFeedItems(items);
  }, [
    businessMetrics,
    businessInsights,
    securityAlerts,
    securityMetrics,
    threatDetections,
    osintResults
  ]);

  // Filter items based on active tab and priority
  const filteredItems = feedItems.filter(item => {
    // Filter by source
    if (activeTab !== 'all' && item.source !== activeTab) {
      return false;
    }

    // Filter by priority
    if (filterPriority !== 'all' && item.priority !== filterPriority) {
      return false;
    }

    return true;
  }).slice(0, maxItems);

  // Handle manual refresh
  const handleRefresh = () => {
    setIsRefreshing(true);

    // Simulate refresh delay
    setTimeout(() => {
      setIsRefreshing(false);
    }, 1000);
  };

  // Toggle expanded item
  const toggleExpandItem = (id: string) => {
    setExpandedItem(expandedItem === id ? null : id);
  };

  // Get priority color
  const getPriorityColor = (priority: 'critical' | 'high' | 'medium' | 'low') => {
    switch (priority) {
      case 'critical':
        return 'text-red-400 bg-red-900/30';
      case 'high':
        return 'text-orange-400 bg-orange-900/30';
      case 'medium':
        return 'text-yellow-400 bg-yellow-900/30';
      case 'low':
        return 'text-blue-400 bg-blue-900/30';
      default:
        return 'text-gray-400 bg-gray-900/30';
    }
  };

  // Get source color
  const getSourceColor = (source: 'athena' | 'phantom' | 'sentinel') => {
    switch (source) {
      case 'athena':
        return 'text-blue-400 bg-blue-900/30';
      case 'phantom':
        return 'text-red-400 bg-red-900/30';
      case 'sentinel':
        return 'text-purple-400 bg-purple-900/30';
      default:
        return 'text-gray-400 bg-gray-900/30';
    }
  };

  // Get trend icon
  const getTrendIcon = (trend: number) => {
    if (trend > 0) {
      return <TrendingUp className="h-4 w-4 text-green-400" />;
    } else if (trend < 0) {
      return <TrendingDown className="h-4 w-4 text-red-400" />;
    }
    return null;
  };

  return (
    <div className={cn(
      "overflow-hidden rounded-lg relative",
      getGlassmorphismClasses({
        level: 'medium',
        border: true,
        shadow: true,
        bgColor: 'bg-gray-900/30',
        borderColor: 'border-blue-500/20',
      }),
      className
    )}>
      {/* Ambient background glow */}
      <div className="absolute inset-0 z-0 opacity-10">
        <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-blue-900 via-purple-900 to-blue-900 blur-xl" />
      </div>

      {/* Header */}
      <div className="relative z-10 border-b border-gray-700/50 bg-gray-800/30 backdrop-blur-sm p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <motion.div
              className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-gray-700"
              animate={{
                scale: [1, 1.05, 1],
                rotate: [0, 2, 0, -2, 0],
              }}
              transition={{
                duration: 5,
                repeat: Infinity,
                repeatType: "loop"
              }}
            >
              <Zap className="h-4 w-4 text-yellow-400" />
            </motion.div>
            <div>
              <h2 className="text-lg font-semibold text-white">Ops Briefing Feed</h2>
              <p className="text-xs text-gray-400">
                Aggregated intelligence from Athena, Phantom, and Sentinel
              </p>
            </div>
          </div>

          <Button
            size="sm"
            variant="outline"
            onClick={handleRefresh}
            disabled={isLoading || isRefreshing}
            className="h-8 px-2"
          >
            <RefreshCw className={cn(
              "h-4 w-4 mr-1",
              isRefreshing && "animate-spin"
            )} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="relative z-10 border-b border-gray-700/50 bg-gray-800/20 backdrop-blur-sm p-2">
        <div className="flex items-center justify-between">
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)}>
            <TabsList className="bg-gray-800">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="athena">
                <BarChart3 className="mr-1 h-4 w-4" />
                Athena
              </TabsTrigger>
              <TabsTrigger value="phantom">
                <Shield className="mr-1 h-4 w-4" />
                Phantom
              </TabsTrigger>
              <TabsTrigger value="sentinel">
                <Eye className="mr-1 h-4 w-4" />
                Sentinel
              </TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="flex items-center">
            <Filter className="mr-1 h-4 w-4 text-gray-400" />
            <select
              className="bg-gray-800 text-sm text-gray-300 border border-gray-700 rounded px-2 py-1"
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value as any)}
            >
              <option value="all">All Priorities</option>
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10 max-h-96 overflow-y-auto bg-gray-900/20 backdrop-blur-sm">
        {isLoading ? (
          <div className="flex items-center justify-center p-8">
            <motion.div
              className="h-8 w-8 rounded-full border-2 border-blue-400 border-t-transparent"
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            />
          </div>
        ) : filteredItems.length > 0 ? (
          <div className="divide-y divide-gray-700/50">
            {filteredItems.map((item) => (
              <div
                key={item.id}
                className={cn(
                  "p-3 transition-colors duration-200 hover:bg-gray-800/50",
                  expandedItem === item.id && "bg-gray-800/50"
                )}
              >
                <div
                  className="flex items-start cursor-pointer"
                  onClick={() => toggleExpandItem(item.id)}
                >
                  <div className={cn(
                    "mr-3 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full",
                    getSourceColor(item.source)
                  )}>
                    {item.sourceIcon}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center">
                      <h3 className="font-medium text-white truncate">{item.title}</h3>
                      {item.type === 'metric' && item.metadata?.trend && (
                        <span className="ml-2 flex items-center">
                          {getTrendIcon(item.metadata.trend)}
                        </span>
                      )}
                    </div>

                    <p className="text-sm text-gray-400 truncate">{item.description}</p>

                    <div className="mt-1 flex items-center text-xs text-gray-500">
                      <Clock className="mr-1 h-3 w-3" />
                      {formatDistanceToNow(item.timestamp, { addSuffix: true })}

                      <span className="mx-2">•</span>

                      <span className={cn(
                        "rounded-full px-2 py-0.5",
                        getPriorityColor(item.priority)
                      )}>
                        {item.priority}
                      </span>
                    </div>
                  </div>

                  {expandedItem === item.id ? (
                    <ChevronDown className="h-5 w-5 text-gray-400" />
                  ) : (
                    <ChevronRight className="h-5 w-5 text-gray-400" />
                  )}
                </div>

                {expandedItem === item.id && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-3 pl-11"
                  >
                    <div className="space-y-2">
                      <p className="text-sm text-gray-300">{item.description}</p>

                      {item.metadata && (
                        <div className="rounded bg-gray-800 p-2 text-xs text-gray-400">
                          <pre className="whitespace-pre-wrap">
                            {JSON.stringify(item.metadata, null, 2)}
                          </pre>
                        </div>
                      )}

                      {item.url && (
                        <div className="flex justify-end">
                          <Link
                            to={item.url}
                            className="flex items-center text-xs text-blue-400 hover:text-blue-300"
                          >
                            View details
                            <ChevronRight className="ml-1 h-3 w-3" />
                          </Link>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center p-8 text-center">
            <div className="mb-3 rounded-full bg-gray-800 p-3">
              <Zap className="h-6 w-6 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-300">No items found</h3>
            <p className="mt-1 text-sm text-gray-400">
              Try changing your filters or check back later
            </p>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="relative z-10 border-t border-gray-700/50 bg-gray-800/30 backdrop-blur-sm p-3">
        <div className="flex items-center justify-between">
          <div className="text-xs text-gray-400">
            {filteredItems.length} items • Last updated: {formatDistanceToNow(new Date(), { addSuffix: true })}
          </div>

          <Link
            to="/arcana/briefing"
            className="flex items-center text-xs text-blue-400 hover:text-blue-300"
          >
            View full briefing
            <ChevronRight className="ml-1 h-3 w-3" />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default OpsBriefingFeed;
