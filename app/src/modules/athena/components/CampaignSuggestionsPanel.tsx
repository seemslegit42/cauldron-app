import React from 'react';
import { CampaignSuggestion, CampaignStatus, ImpactLevel } from '../types';
import {
  MegaphoneIcon,
  BeakerIcon,
  UserGroupIcon,
  CurrencyDollarIcon,
} from '@heroicons/react/24/outline';

interface CampaignSuggestionsPanelProps {
  campaigns: CampaignSuggestion[];
  isLoading: boolean;
  onPlanCampaign?: (campaignId: string) => void;
  canExecute?: boolean;
}

export const CampaignSuggestionsPanel: React.FC<CampaignSuggestionsPanelProps> = ({
  campaigns,
  isLoading,
  onPlanCampaign,
}) => {
  // Get icon based on campaign objective
  const getCampaignIcon = (objective: string) => {
    if (
      objective.toLowerCase().includes('test') ||
      objective.toLowerCase().includes('experiment')
    ) {
      return <BeakerIcon className="h-5 w-5 text-purple-400" />;
    } else if (
      objective.toLowerCase().includes('acquisition') ||
      objective.toLowerCase().includes('audience')
    ) {
      return <UserGroupIcon className="h-5 w-5 text-blue-400" />;
    } else if (
      objective.toLowerCase().includes('revenue') ||
      objective.toLowerCase().includes('sales')
    ) {
      return <CurrencyDollarIcon className="h-5 w-5 text-green-400" />;
    } else {
      return <MegaphoneIcon className="h-5 w-5 text-yellow-400" />;
    }
  };

  // Get color based on impact level
  const getImpactColor = (impact: ImpactLevel) => {
    switch (impact) {
      case ImpactLevel.LOW:
        return 'bg-blue-900 text-blue-300';
      case ImpactLevel.MEDIUM:
        return 'bg-yellow-900 text-yellow-300';
      case ImpactLevel.HIGH:
        return 'bg-orange-900 text-orange-300';
      case ImpactLevel.CRITICAL:
        return 'bg-red-900 text-red-300';
      default:
        return 'bg-gray-700 text-gray-300';
    }
  };

  // Get color based on campaign status
  const getStatusColor = (status: CampaignStatus) => {
    switch (status) {
      case CampaignStatus.DRAFT:
        return 'bg-gray-700 text-gray-300';
      case CampaignStatus.PLANNED:
        return 'bg-blue-900 text-blue-300';
      case CampaignStatus.ACTIVE:
        return 'bg-green-900 text-green-300';
      case CampaignStatus.PAUSED:
        return 'bg-yellow-900 text-yellow-300';
      case CampaignStatus.COMPLETED:
        return 'bg-purple-900 text-purple-300';
      case CampaignStatus.CANCELLED:
        return 'bg-red-900 text-red-300';
      default:
        return 'bg-gray-700 text-gray-300';
    }
  };

  // Format currency
  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  if (isLoading) {
    return (
      <div className="mb-6 animate-pulse rounded-lg bg-gray-800 p-6 shadow-lg">
        <div className="mb-4 h-6 w-1/3 rounded bg-gray-700"></div>
        {[...Array(2)].map((_, i) => (
          <div key={i} className="mb-4">
            <div className="mb-2 h-4 w-3/4 rounded bg-gray-700"></div>
            <div className="h-24 w-full rounded bg-gray-700"></div>
          </div>
        ))}
      </div>
    );
  }

  if (!campaigns || campaigns.length === 0) {
    return (
      <div className="mb-6 rounded-lg bg-gray-800 p-6 shadow-lg">
        <h2 className="mb-4 text-xl font-bold text-white">Campaign & Experiment Suggestions</h2>
        <div className="flex items-center justify-center rounded-lg bg-gray-700 p-6">
          <MegaphoneIcon className="mr-3 h-8 w-8 text-gray-500" />
          <p className="text-gray-400">No campaign suggestions available.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mb-6 rounded-lg bg-gray-800 p-6 shadow-lg">
      <h2 className="mb-4 text-xl font-bold text-white">Campaign & Experiment Suggestions</h2>

      <div className="space-y-4">
        {campaigns.map((campaign) => (
          <div key={campaign.id} className="rounded-lg bg-gray-700 p-4">
            <div className="flex items-start">
              <div className="mt-1 mr-3">{getCampaignIcon(campaign.objective)}</div>

              <div className="flex-1">
                <div className="mb-2 flex items-center justify-between">
                  <h3 className="text-md font-semibold text-white">{campaign.title}</h3>
                  <div className="flex space-x-2">
                    <span
                      className={`rounded-full px-2 py-1 text-xs ${getStatusColor(campaign.status)}`}
                    >
                      {campaign.status}
                    </span>
                    <span
                      className={`rounded-full px-2 py-1 text-xs ${getImpactColor(campaign.estimatedImpact)}`}
                    >
                      {campaign.estimatedImpact} impact
                    </span>
                  </div>
                </div>

                <p className="mb-3 text-sm text-gray-300">{campaign.description}</p>

                <div className="mb-3 grid grid-cols-1 gap-3 md:grid-cols-3">
                  <div className="rounded bg-gray-600 p-2">
                    <p className="text-xs text-gray-400">Target Audience</p>
                    <p className="text-sm text-gray-200">{campaign.targetAudience}</p>
                  </div>

                  <div className="rounded bg-gray-600 p-2">
                    <p className="text-xs text-gray-400">Estimated Duration</p>
                    <p className="text-sm text-gray-200">{campaign.estimatedDuration} days</p>
                  </div>

                  <div className="rounded bg-gray-600 p-2">
                    <p className="text-xs text-gray-400">Estimated Cost</p>
                    <p className="text-sm text-gray-200">
                      {campaign.estimatedCost
                        ? formatCurrency(campaign.estimatedCost)
                        : 'Not specified'}
                    </p>
                  </div>
                </div>

                {campaign.kpis && campaign.kpis.length > 0 && (
                  <div className="mb-3">
                    <p className="mb-1 text-xs text-gray-400">Key Performance Indicators:</p>
                    <div className="flex flex-wrap gap-1">
                      {campaign.kpis.map((kpi, index) => (
                        <span
                          key={index}
                          className="rounded bg-gray-600 px-2 py-0.5 text-xs text-gray-300"
                        >
                          {kpi}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {campaign.status === CampaignStatus.DRAFT && onPlanCampaign && (
                  <div className="mt-2 flex justify-end">
                    <button
                      onClick={() => onPlanCampaign(campaign.id)}
                      className={`flex items-center text-xs ${
                        canExecute
                          ? 'bg-yellow-600 hover:bg-yellow-700'
                          : 'cursor-not-allowed bg-gray-600'
                      } rounded px-3 py-1 text-white`}
                      disabled={!canExecute}
                      title={
                        !canExecute
                          ? 'You do not have permission to execute campaign suggestions'
                          : ''
                      }
                    >
                      Plan Campaign
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
