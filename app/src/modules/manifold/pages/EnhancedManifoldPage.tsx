/**
 * Enhanced Manifold Module - Revenue Intelligence Dashboard
 *
 * This is the enhanced version of the Manifold revenue intelligence module with cyberpunk styling.
 * It provides revenue analytics, customer insights, and growth opportunities.
 */

import React, { useState } from 'react';
import { ModuleLayout } from '@src/shared/components/layout/ModuleLayout';
import { ModuleHeader } from '@src/shared/components/branding/ModuleHeader';
import { ModuleCard } from '@src/shared/components/branding/ModuleCard';
import { ModuleNavigation } from '@src/shared/components/branding/ModuleNavigation';
import { SentientAssistant } from '@src/shared/components/SentientAssistant';
import { HolographicDisplay } from '@src/shared/components/effects/HolographicDisplay';
import { DataFlowVisualization } from '@src/shared/components/visualizations/DataFlowVisualization';
import { 
  TrendingUp, 
  ArrowUpRight, 
  ArrowDownRight, 
  DollarSign, 
  Users, 
  BarChart, 
  PieChart, 
  LineChart, 
  Settings, 
  Target, 
  Zap, 
  Briefcase 
} from 'lucide-react';

export default function EnhancedManifoldPage() {
  const [timeframe, setTimeframe] = useState<'day' | 'week' | 'month' | 'quarter' | 'year'>('month');
  const [assistantMinimized, setAssistantMinimized] = useState(false);

  // Sample data for revenue metrics
  const revenueData = {
    totalRevenue: 128750,
    growth: 12.4,
    recurring: 98500,
    oneTime: 30250,
    customers: 342,
    newCustomers: 28,
    churnRate: 2.1,
    averageRevenue: 376.46,
  };

  // Sample data for revenue streams
  const revenueStreams = [
    { name: 'Enterprise Subscriptions', amount: 68000, growth: 15.2, color: 'bg-pink-500' },
    { name: 'SMB Subscriptions', amount: 30500, growth: 8.7, color: 'bg-pink-400' },
    { name: 'Professional Services', amount: 18250, growth: -3.2, color: 'bg-pink-300' },
    { name: 'Training & Workshops', amount: 12000, growth: 22.5, color: 'bg-pink-200' },
  ];

  // Sample data for revenue insights
  const revenueInsights = [
    {
      title: 'Enterprise Growth Opportunity',
      description: 'Enterprise segment shows 15.2% growth. Consider expanding enterprise-focused features to capitalize on this trend.',
      impact: 'high',
    },
    {
      title: 'Professional Services Decline',
      description: 'Professional services revenue decreased by 3.2%. Investigate causes and consider service offering adjustments.',
      impact: 'medium',
    },
    {
      title: 'Training Revenue Surge',
      description: 'Training & workshops revenue increased by 22.5%. Expand training offerings to leverage this high-growth area.',
      impact: 'high',
    },
  ];

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Navigation items
  const navigationItems = [
    { 
      label: 'Dashboard', 
      path: '/manifold',
      icon: <BarChart className="h-5 w-5" />
    },
    { 
      label: 'Revenue', 
      path: '/manifold/revenue',
      icon: <DollarSign className="h-5 w-5" />
    },
    { 
      label: 'Customers', 
      path: '/manifold/customers',
      icon: <Users className="h-5 w-5" />
    },
    { 
      label: 'Trends', 
      path: '/manifold/trends',
      icon: <TrendingUp className="h-5 w-5" />
    },
    { 
      label: 'Forecasts', 
      path: '/manifold/forecasts',
      icon: <LineChart className="h-5 w-5" />
    },
    { 
      label: 'Segments', 
      path: '/manifold/segments',
      icon: <PieChart className="h-5 w-5" />
    },
    { 
      label: 'Settings', 
      path: '/manifold/settings',
      icon: <Settings className="h-5 w-5" />
    },
  ];

  // Header with timeframe selector
  const header = (
    <ModuleHeader
      moduleId="manifold"
      title="Manifold"
      description="Revenue Intelligence Dashboard"
      icon={<DollarSign />}
      actions={
        <div className="flex space-x-2">
          {['day', 'week', 'month', 'quarter', 'year'].map((tf) => (
            <button
              type="button"
              key={tf}
              className={`rounded-md px-3 py-1 text-sm font-medium ${timeframe === tf
                ? 'bg-pink-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              onClick={() => setTimeframe(tf as any)}
            >
              {tf.charAt(0).toUpperCase() + tf.slice(1)}
            </button>
          ))}
        </div>
      }
    />
  );

  // Sidebar with navigation
  const sidebar = (
    <div className="h-full p-4">
      <div className="mb-8 flex items-center justify-center">
        <h2 className="text-xl font-bold text-pink-400">Manifold</h2>
      </div>
      <ModuleNavigation
        moduleId="manifold"
        items={navigationItems}
      />
    </div>
  );

  return (
    <ModuleLayout
      moduleId="manifold"
      title="Manifold"
      header={header}
      sidebar={sidebar}
      pattern="dots"
      patternOpacity={0.1}
      glowIntensity="medium"
      glowPositions={['top-right', 'bottom-left']}
      animate={true}
    >
      {/* Revenue Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <ModuleCard
          moduleId="manifold"
          title="Total Revenue"
          icon={<DollarSign />}
          className="h-full"
        >
          <div className="p-4">
            <h3 className="text-2xl font-bold mt-1">{formatCurrency(revenueData.totalRevenue)}</h3>
            <div className="flex items-center mt-1 text-sm">
              <span className={revenueData.growth >= 0 ? 'text-green-400' : 'text-red-400'}>
                {revenueData.growth >= 0 ? (
                  <ArrowUpRight className="inline h-4 w-4 mr-1" />
                ) : (
                  <ArrowDownRight className="inline h-4 w-4 mr-1" />
                )}
                {Math.abs(revenueData.growth)}%
              </span>
              <span className="text-gray-500 ml-1">vs last {timeframe}</span>
            </div>
          </div>
        </ModuleCard>

        <ModuleCard
          moduleId="manifold"
          title="Recurring Revenue"
          icon={<TrendingUp />}
          className="h-full"
        >
          <div className="p-4">
            <h3 className="text-2xl font-bold mt-1">{formatCurrency(revenueData.recurring)}</h3>
            <div className="flex items-center mt-1 text-sm">
              <span className="text-gray-500">{Math.round((revenueData.recurring / revenueData.totalRevenue) * 100)}% of total</span>
            </div>
          </div>
        </ModuleCard>

        <ModuleCard
          moduleId="manifold"
          title="Customers"
          icon={<Users />}
          className="h-full"
        >
          <div className="p-4">
            <h3 className="text-2xl font-bold mt-1">{revenueData.customers}</h3>
            <div className="flex items-center mt-1 text-sm">
              <span className="text-green-400">
                <ArrowUpRight className="inline h-4 w-4 mr-1" />
                {revenueData.newCustomers}
              </span>
              <span className="text-gray-500 ml-1">new this {timeframe}</span>
            </div>
          </div>
        </ModuleCard>

        <ModuleCard
          moduleId="manifold"
          title="Avg. Revenue per Customer"
          icon={<BarChart />}
          className="h-full"
        >
          <div className="p-4">
            <h3 className="text-2xl font-bold mt-1">{formatCurrency(revenueData.averageRevenue)}</h3>
            <div className="flex items-center mt-1 text-sm">
              <span className="text-gray-500">Churn rate: {revenueData.churnRate}%</span>
            </div>
          </div>
        </ModuleCard>
      </div>

      {/* Revenue Visualization */}
      <div className="mt-6">
        <ModuleCard
          moduleId="manifold"
          title="Revenue Flow"
          icon={<Zap />}
          className="h-64"
          glow={true}
        >
          <div className="p-4 h-full">
            <DataFlowVisualization 
              data={revenueStreams.map(stream => ({
                name: stream.name,
                value: stream.amount,
                color: stream.color
              }))}
            />
          </div>
        </ModuleCard>
      </div>

      {/* Revenue Streams and Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        <ModuleCard
          moduleId="manifold"
          title="Revenue Streams"
          icon={<PieChart />}
          className="h-full"
        >
          <div className="p-4 space-y-4">
            {revenueStreams.map((stream, index) => (
              <div key={index} className="bg-gray-800/50 rounded-lg p-4">
                <div className="flex justify-between items-center">
                  <h3 className="font-medium">{stream.name}</h3>
                  <span className="text-lg font-bold">{formatCurrency(stream.amount)}</span>
                </div>
                <div className="mt-2">
                  <div className="w-full bg-gray-700 rounded-full h-2.5">
                    <div 
                      className={`${stream.color} h-2.5 rounded-full`} 
                      style={{ width: `${(stream.amount / revenueData.totalRevenue) * 100}%` }}
                    ></div>
                  </div>
                </div>
                <div className="flex justify-between items-center mt-2 text-sm">
                  <span>{Math.round((stream.amount / revenueData.totalRevenue) * 100)}% of total</span>
                  <span className={stream.growth >= 0 ? 'text-green-400' : 'text-red-400'}>
                    {stream.growth >= 0 ? '+' : ''}{stream.growth}% growth
                  </span>
                </div>
              </div>
            ))}
          </div>
        </ModuleCard>

        <ModuleCard
          moduleId="manifold"
          title="AI-Generated Insights"
          icon={<Briefcase />}
          className="h-full"
        >
          <div className="p-4 space-y-4">
            {revenueInsights.map((insight, index) => (
              <div key={index} className="bg-gray-800/50 rounded-lg p-4">
                <div className="flex items-start">
                  <div className={`px-2 py-1 rounded text-xs font-medium ${
                    insight.impact === 'high' ? 'bg-red-500 bg-opacity-20 text-red-400' :
                    insight.impact === 'medium' ? 'bg-yellow-500 bg-opacity-20 text-yellow-400' :
                    'bg-blue-500 bg-opacity-20 text-blue-400'
                  } uppercase mr-2`}>
                    {insight.impact}
                  </div>
                  <h3 className="font-medium">{insight.title}</h3>
                </div>
                <p className="text-sm text-gray-400 mt-2">{insight.description}</p>
              </div>
            ))}
          </div>
        </ModuleCard>
      </div>

      {/* Holographic Revenue Projection */}
      <div className="mt-6">
        <ModuleCard
          moduleId="manifold"
          title="Revenue Projection"
          icon={<Target />}
          className="h-64"
          glow={true}
        >
          <div className="p-4 h-full">
            <HolographicDisplay
              title="Q4 Revenue Forecast"
              value={formatCurrency(165000)}
              subtitle="+28.2% YoY Growth"
              color="pink"
            />
          </div>
        </ModuleCard>
      </div>

      {/* Sentient Assistant */}
      <div className="fixed bottom-4 right-4 z-10 w-96">
        <SentientAssistant
          module="manifold"
          initialPrompt="How can I help you analyze your revenue data today?"
          minimized={assistantMinimized}
          onMinimize={() => setAssistantMinimized(true)}
          onMaximize={() => setAssistantMinimized(false)}
        />
      </div>
    </ModuleLayout>
  );
}
