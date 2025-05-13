import React, { useState } from 'react';
import { 
  ExecutiveAdvisorOutput, 
  ExecutiveAdvisorTone,
  TimeframeOption,
  ImpactLevel
} from '../types';
import { 
  DocumentTextIcon, 
  LightBulbIcon, 
  ArrowTrendingUpIcon,
  ArrowPathIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  CheckCircleIcon,
  PresentationChartLineIcon,
  CurrencyDollarIcon
} from '@heroicons/react/24/outline';

interface ExecutiveAdvisorPanelProps {
  executiveAdvice: ExecutiveAdvisorOutput | null;
  isLoading: boolean;
  communicationStyle: ExecutiveAdvisorTone;
  onCommunicationStyleChange: (style: ExecutiveAdvisorTone) => void;
  onRefresh?: () => void;
}

export const ExecutiveAdvisorPanel: React.FC<ExecutiveAdvisorPanelProps> = ({
  executiveAdvice,
  isLoading,
  communicationStyle,
  onCommunicationStyleChange,
  onRefresh,
}) => {
  const [expandedSection, setExpandedSection] = useState<string | null>('keyPoints');

  const toggleSection = (section: string) => {
    if (expandedSection === section) {
      setExpandedSection(null);
    } else {
      setExpandedSection(section);
    }
  };

  // Helper function to get impact level color
  const getImpactColor = (impact: ImpactLevel) => {
    switch (impact) {
      case 'critical':
        return 'text-red-400';
      case 'high':
        return 'text-orange-400';
      case 'medium':
        return 'text-yellow-400';
      case 'low':
        return 'text-blue-400';
      default:
        return 'text-gray-400';
    }
  };

  // Helper function to get timeframe display text
  const getTimeframeText = (timeframe: TimeframeOption) => {
    switch (timeframe) {
      case 'day':
        return 'Daily';
      case 'week':
        return 'Weekly';
      case 'month':
        return 'Monthly';
      case 'quarter':
        return 'Quarterly';
      case 'year':
        return 'Yearly';
      default:
        return timeframe;
    }
  };

  if (isLoading) {
    return (
      <div className="mb-8 rounded-lg bg-gray-800 p-6 shadow-md">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-white">Executive Advisor</h2>
        </div>
        <div className="flex items-center justify-center py-8">
          <ArrowPathIcon className="h-8 w-8 text-blue-400 animate-spin" />
          <span className="ml-2 text-gray-300">Generating executive advice...</span>
        </div>
      </div>
    );
  }

  if (!executiveAdvice) {
    return (
      <div className="mb-8 rounded-lg bg-gray-800 p-6 shadow-md">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-white">Executive Advisor</h2>
          {onRefresh && (
            <button
              onClick={onRefresh}
              className="rounded bg-blue-600 px-3 py-1 text-sm text-white hover:bg-blue-700"
            >
              Generate Advice
            </button>
          )}
        </div>
        <p className="text-gray-400">No executive advice available. Click the button to generate advice.</p>
      </div>
    );
  }

  return (
    <div className="mb-8 rounded-lg bg-gray-800 p-6 shadow-md">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-white flex items-center">
          <DocumentTextIcon className="h-6 w-6 mr-2 text-blue-400" />
          {executiveAdvice.title}
        </h2>
        <div className="flex space-x-2">
          {onRefresh && (
            <button
              onClick={onRefresh}
              className="rounded bg-gray-700 px-3 py-1 text-sm text-white hover:bg-gray-600 flex items-center"
            >
              <ArrowPathIcon className="h-4 w-4 mr-1" />
              Refresh
            </button>
          )}
        </div>
      </div>

      {/* Communication Style Selector */}
      <div className="mb-6 flex flex-wrap gap-2">
        <span className="text-gray-400 mr-2 self-center">Communication Style:</span>
        <button
          onClick={() => onCommunicationStyleChange(ExecutiveAdvisorTone.CONSERVATIVE)}
          className={`px-3 py-1 rounded text-sm ${
            communicationStyle === ExecutiveAdvisorTone.CONSERVATIVE
              ? 'bg-blue-600 text-white'
              : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
          }`}
        >
          Conservative
        </button>
        <button
          onClick={() => onCommunicationStyleChange(ExecutiveAdvisorTone.BALANCED)}
          className={`px-3 py-1 rounded text-sm ${
            communicationStyle === ExecutiveAdvisorTone.BALANCED
              ? 'bg-blue-600 text-white'
              : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
          }`}
        >
          Balanced
        </button>
        <button
          onClick={() => onCommunicationStyleChange(ExecutiveAdvisorTone.AGGRESSIVE)}
          className={`px-3 py-1 rounded text-sm ${
            communicationStyle === ExecutiveAdvisorTone.AGGRESSIVE
              ? 'bg-blue-600 text-white'
              : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
          }`}
        >
          Aggressive
        </button>
      </div>

      {/* Summary */}
      <div className="mb-6 p-4 bg-gray-700 rounded-lg">
        <p className="text-gray-200 whitespace-pre-line">{executiveAdvice.summary}</p>
      </div>

      {/* Key Points */}
      <div className="mb-4">
        <button
          onClick={() => toggleSection('keyPoints')}
          className="w-full flex justify-between items-center text-lg font-semibold text-white mb-2 bg-gray-700 p-3 rounded-lg hover:bg-gray-600"
        >
          <div className="flex items-center">
            <LightBulbIcon className="h-5 w-5 mr-2 text-yellow-400" />
            Key Points
          </div>
          {expandedSection === 'keyPoints' ? (
            <ChevronUpIcon className="h-5 w-5 text-gray-400" />
          ) : (
            <ChevronDownIcon className="h-5 w-5 text-gray-400" />
          )}
        </button>
        
        {expandedSection === 'keyPoints' && (
          <ul className="space-y-2 mt-3">
            {executiveAdvice.keyPoints.map((point, index) => (
              <li key={index} className="bg-gray-700 p-3 rounded-lg text-gray-200 flex">
                <CheckCircleIcon className="h-5 w-5 mr-2 text-green-400 flex-shrink-0 mt-0.5" />
                <span>{point}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Strategic Suggestions */}
      <div className="mb-4">
        <button
          onClick={() => toggleSection('strategicSuggestions')}
          className="w-full flex justify-between items-center text-lg font-semibold text-white mb-2 bg-gray-700 p-3 rounded-lg hover:bg-gray-600"
        >
          <div className="flex items-center">
            <PresentationChartLineIcon className="h-5 w-5 mr-2 text-blue-400" />
            Strategic Suggestions
          </div>
          {expandedSection === 'strategicSuggestions' ? (
            <ChevronUpIcon className="h-5 w-5 text-gray-400" />
          ) : (
            <ChevronDownIcon className="h-5 w-5 text-gray-400" />
          )}
        </button>
        
        {expandedSection === 'strategicSuggestions' && (
          <ul className="space-y-2 mt-3">
            {executiveAdvice.strategicSuggestions.map((suggestion, index) => (
              <li key={index} className="bg-gray-700 p-3 rounded-lg text-gray-200">
                {suggestion}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Growth Opportunities */}
      <div className="mb-4">
        <button
          onClick={() => toggleSection('growthOpportunities')}
          className="w-full flex justify-between items-center text-lg font-semibold text-white mb-2 bg-gray-700 p-3 rounded-lg hover:bg-gray-600"
        >
          <div className="flex items-center">
            <ArrowTrendingUpIcon className="h-5 w-5 mr-2 text-green-400" />
            Growth Opportunities
          </div>
          {expandedSection === 'growthOpportunities' ? (
            <ChevronUpIcon className="h-5 w-5 text-gray-400" />
          ) : (
            <ChevronDownIcon className="h-5 w-5 text-gray-400" />
          )}
        </button>
        
        {expandedSection === 'growthOpportunities' && (
          <div className="space-y-3 mt-3">
            {executiveAdvice.growthOpportunities.map((opportunity, index) => (
              <div key={index} className="bg-gray-700 p-4 rounded-lg">
                <h4 className="text-white font-medium mb-2">{opportunity.title}</h4>
                <p className="text-gray-300 mb-3">{opportunity.description}</p>
                <div className="flex flex-wrap gap-2">
                  <span className={`px-2 py-1 rounded text-xs ${getImpactColor(opportunity.impact)} bg-gray-800`}>
                    Impact: {opportunity.impact}
                  </span>
                  <span className="px-2 py-1 rounded text-xs text-gray-300 bg-gray-800">
                    Timeframe: {getTimeframeText(opportunity.timeframe)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Investor Pitch Points (if available) */}
      {executiveAdvice.investorPitchPoints && executiveAdvice.investorPitchPoints.length > 0 && (
        <div className="mb-4">
          <button
            onClick={() => toggleSection('investorPitchPoints')}
            className="w-full flex justify-between items-center text-lg font-semibold text-white mb-2 bg-gray-700 p-3 rounded-lg hover:bg-gray-600"
          >
            <div className="flex items-center">
              <CurrencyDollarIcon className="h-5 w-5 mr-2 text-purple-400" />
              Investor Pitch Points
            </div>
            {expandedSection === 'investorPitchPoints' ? (
              <ChevronUpIcon className="h-5 w-5 text-gray-400" />
            ) : (
              <ChevronDownIcon className="h-5 w-5 text-gray-400" />
            )}
          </button>
          
          {expandedSection === 'investorPitchPoints' && (
            <ul className="space-y-2 mt-3">
              {executiveAdvice.investorPitchPoints.map((point, index) => (
                <li key={index} className="bg-gray-700 p-3 rounded-lg text-gray-200">
                  {point}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {/* Metadata */}
      <div className="mt-6 text-xs text-gray-500">
        Generated on {executiveAdvice.createdAt.toLocaleString()} • Style: {executiveAdvice.communicationStyle}
      </div>
    </div>
  );
};