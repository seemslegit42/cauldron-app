import React, { useState } from 'react';
import { ManifoldLayout } from '../components';
import { GlassmorphicCard } from '@src/shared/components/branding';
import { SentientAssistant } from '@src/shared/components/SentientAssistant';
import { TrendingUp, ArrowUpRight, ArrowDownRight, DollarSign, Users, BarChart } from 'lucide-react';

export default function ManifoldPage() {
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

  return (
    <ManifoldLayout
      title="Manifold"
      description="Revenue Intelligence Dashboard"
      timeframe={timeframe}
      onTimeframeChange={setTimeframe}
    >
      {/* Revenue Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <GlassmorphicCard moduleId="manifold" level="medium" border shadow className="p-4">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-400">Total Revenue</p>
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
            <div className="bg-pink-500 bg-opacity-20 p-2 rounded-lg">
              <DollarSign className="h-6 w-6 text-pink-500" />
            </div>
          </div>
        </GlassmorphicCard>

        <GlassmorphicCard moduleId="manifold" level="medium" border shadow className="p-4">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-400">Recurring Revenue</p>
              <h3 className="text-2xl font-bold mt-1">{formatCurrency(revenueData.recurring)}</h3>
              <div className="flex items-center mt-1 text-sm">
                <span className="text-gray-500">{Math.round((revenueData.recurring / revenueData.totalRevenue) * 100)}% of total</span>
              </div>
            </div>
            <div className="bg-pink-500 bg-opacity-20 p-2 rounded-lg">
              <TrendingUp className="h-6 w-6 text-pink-500" />
            </div>
          </div>
        </GlassmorphicCard>

        <GlassmorphicCard moduleId="manifold" level="medium" border shadow className="p-4">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-400">Customers</p>
              <h3 className="text-2xl font-bold mt-1">{revenueData.customers}</h3>
              <div className="flex items-center mt-1 text-sm">
                <span className="text-green-400">
                  <ArrowUpRight className="inline h-4 w-4 mr-1" />
                  {revenueData.newCustomers}
                </span>
                <span className="text-gray-500 ml-1">new this {timeframe}</span>
              </div>
            </div>
            <div className="bg-pink-500 bg-opacity-20 p-2 rounded-lg">
              <Users className="h-6 w-6 text-pink-500" />
            </div>
          </div>
        </GlassmorphicCard>

        <GlassmorphicCard moduleId="manifold" level="medium" border shadow className="p-4">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-400">Avg. Revenue per Customer</p>
              <h3 className="text-2xl font-bold mt-1">{formatCurrency(revenueData.averageRevenue)}</h3>
              <div className="flex items-center mt-1 text-sm">
                <span className="text-gray-500">Churn rate: {revenueData.churnRate}%</span>
              </div>
            </div>
            <div className="bg-pink-500 bg-opacity-20 p-2 rounded-lg">
              <BarChart className="h-6 w-6 text-pink-500" />
            </div>
          </div>
        </GlassmorphicCard>
      </div>

      {/* Revenue Streams and Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        <GlassmorphicCard moduleId="manifold" level="medium" border shadow className="p-6">
          <h2 className="text-xl font-bold mb-4 text-pink-400">Revenue Streams</h2>
          <div className="space-y-4">
            {revenueStreams.map((stream, index) => (
              <div key={index} className="bg-gray-800 rounded-lg p-4">
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
        </GlassmorphicCard>

        <GlassmorphicCard moduleId="manifold" level="medium" border shadow className="p-6">
          <h2 className="text-xl font-bold mb-4 text-pink-400">AI-Generated Insights</h2>
          <div className="space-y-4">
            {revenueInsights.map((insight, index) => (
              <div key={index} className="bg-gray-800 rounded-lg p-4">
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
        </GlassmorphicCard>
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
    </ManifoldLayout>
  );
}
