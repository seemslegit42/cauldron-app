import React, { useState } from 'react';
import { ExecutiveSummary, NotionExportOptions, TimeframeOption } from '../types';
import {
  DocumentTextIcon,
  ChartBarIcon,
  LightBulbIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  SparklesIcon,
  ArrowPathIcon,
  DocumentArrowDownIcon,
  CodeBracketIcon
} from '@heroicons/react/24/outline';
import { BusinessIntelligenceWorkflowVisualizer } from './BusinessIntelligenceWorkflowVisualizer';

interface ExecutiveSummaryPanelProps {
  executiveSummary: ExecutiveSummary | null;
  isLoading: boolean;
  timeframe?: TimeframeOption;
  workflowGraphId?: string;
  hasMemoryContext?: boolean;
  onRefresh?: () => void;
  onExportToNotion?: (options: NotionExportOptions) => Promise<{ success: boolean; pageUrl?: string; error?: string }>;
}

export const ExecutiveSummaryPanel: React.FC<ExecutiveSummaryPanelProps> = ({
  executiveSummary,
  isLoading,
  timeframe = TimeframeOption.WEEK,
  workflowGraphId,
  hasMemoryContext = false,
  onRefresh,
  onExportToNotion,
}) => {
  const [isExporting, setIsExporting] = useState(false);
  const [exportSuccess, setExportSuccess] = useState<boolean | null>(null);
  const [exportUrl, setExportUrl] = useState<string | null>(null);
  const [exportError, setExportError] = useState<string | null>(null);
  const [showExportOptions, setShowExportOptions] = useState(false);
  const [exportOptions, setExportOptions] = useState<NotionExportOptions>({
    includeMetrics: true,
    includeInsights: true,
    includeRecommendations: true,
    includeExecutiveSummary: true,
    exportFormat: 'page',
    timeframe: TimeframeOption.WEEK,
  });

  const handleExportToNotion = async () => {
    if (!onExportToNotion) return;

    setIsExporting(true);
    setExportSuccess(null);
    setExportUrl(null);
    setExportError(null);

    try {
      const result = await onExportToNotion(exportOptions);
      setExportSuccess(result.success);
      if (result.success && result.pageUrl) {
        setExportUrl(result.pageUrl);
      } else if (!result.success && result.error) {
        setExportError(result.error);
      }
    } catch (error) {
      setExportSuccess(false);
      setExportError((error as Error).message);
    } finally {
      setIsExporting(false);
    }
  };

  const handleOptionChange = (key: keyof NotionExportOptions, value: any) => {
    setExportOptions(prev => ({
      ...prev,
      [key]: value,
    }));
  };

  if (isLoading) {
    return (
      <div className="mb-8 rounded-lg bg-gray-800 p-6 shadow-md">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-white">Executive Summary</h2>
        </div>
        <div className="flex items-center justify-center py-8">
          <ArrowPathIcon className="h-8 w-8 text-blue-400 animate-spin" />
          <span className="ml-2 text-gray-300">Generating executive summary...</span>
        </div>
      </div>
    );
  }

  if (!executiveSummary) {
    return (
      <div className="mb-8 rounded-lg bg-gray-800 p-6 shadow-md">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-white">Executive Summary</h2>
          {onRefresh && (
            <button
              type="button"
              onClick={onRefresh}
              className="rounded bg-blue-600 px-3 py-1 text-sm text-white hover:bg-blue-700"
            >
              Generate Summary
            </button>
          )}
        </div>
        <p className="text-gray-400">No executive summary available. Click the button to generate one.</p>
      </div>
    );
  }

  return (
    <div className="mb-8 rounded-lg bg-gray-800 p-6 shadow-md">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-white flex items-center">
          <DocumentTextIcon className="h-6 w-6 mr-2 text-blue-400" />
          {executiveSummary.title}
        </h2>
        <div className="flex space-x-2">
          {onRefresh && (
            <button
              type="button"
              onClick={onRefresh}
              className="rounded bg-gray-700 px-3 py-1 text-sm text-white hover:bg-gray-600 flex items-center"
            >
              <ArrowPathIcon className="h-4 w-4 mr-1" />
              Refresh
            </button>
          )}
          {onExportToNotion && (
            <button
              type="button"
              onClick={() => setShowExportOptions(!showExportOptions)}
              className="rounded bg-blue-600 px-3 py-1 text-sm text-white hover:bg-blue-700 flex items-center"
            >
              <DocumentArrowDownIcon className="h-4 w-4 mr-1" />
              Export to Notion
            </button>
          )}
        </div>
      </div>

      {/* Summary */}
      <div className="mb-6 p-4 bg-gray-700 rounded-lg">
        <p className="text-gray-200 whitespace-pre-line">{executiveSummary.summary}</p>
      </div>

      {/* Key Metrics */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-white mb-2 flex items-center">
          <ChartBarIcon className="h-5 w-5 mr-1 text-blue-400" />
          Key Metrics
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {executiveSummary.keyMetrics.map((metric, index) => (
            <div key={index} className="bg-gray-700 p-3 rounded-lg">
              <div className="text-sm text-gray-400">{metric.name}</div>
              <div className="text-xl font-bold text-white flex items-center">
                {metric.value}
                <span className={`ml-2 text-sm ${metric.trend > 0 ? 'text-green-400' : metric.trend < 0 ? 'text-red-400' : 'text-gray-400'}`}>
                  {metric.trend > 0 ? '↑' : metric.trend < 0 ? '↓' : '→'} {Math.abs(metric.trend)}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Key Insights */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-white mb-2 flex items-center">
          <LightBulbIcon className="h-5 w-5 mr-1 text-yellow-400" />
          Key Insights
        </h3>
        <ul className="space-y-2">
          {executiveSummary.keyInsights.map((insight, index) => (
            <li key={index} className="bg-gray-700 p-3 rounded-lg text-gray-200">
              {insight}
            </li>
          ))}
        </ul>
      </div>

      {/* Top Recommendations */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-white mb-2 flex items-center">
          <CheckCircleIcon className="h-5 w-5 mr-1 text-green-400" />
          Top Recommendations
        </h3>
        <ul className="space-y-2">
          {executiveSummary.topRecommendations.map((recommendation, index) => (
            <li key={index} className="bg-gray-700 p-3 rounded-lg text-gray-200">
              {recommendation}
            </li>
          ))}
        </ul>
      </div>

      {/* Risk Factors and Opportunities */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Risk Factors */}
        <div>
          <h3 className="text-lg font-semibold text-white mb-2 flex items-center">
            <ExclamationTriangleIcon className="h-5 w-5 mr-1 text-red-400" />
            Risk Factors
          </h3>
          <ul className="space-y-2">
            {executiveSummary.riskFactors.map((risk, index) => (
              <li key={index} className="bg-gray-700 p-3 rounded-lg text-gray-200">
                {risk}
              </li>
            ))}
          </ul>
        </div>

        {/* Opportunities */}
        <div>
          <h3 className="text-lg font-semibold text-white mb-2 flex items-center">
            <SparklesIcon className="h-5 w-5 mr-1 text-purple-400" />
            Opportunities
          </h3>
          <ul className="space-y-2">
            {executiveSummary.opportunities.map((opportunity, index) => (
              <li key={index} className="bg-gray-700 p-3 rounded-lg text-gray-200">
                {opportunity}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Workflow Visualization */}
      {workflowGraphId && (
        <div className="mt-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-semibold text-white flex items-center">
              <CodeBracketIcon className="h-5 w-5 mr-1 text-blue-400" />
              Analysis Workflow
            </h3>
            {hasMemoryContext && (
              <span className="text-xs bg-blue-900/50 text-blue-300 px-2 py-1 rounded-full">
                Memory-Aware Analysis
              </span>
            )}
          </div>
          <div className="bg-gray-800/50 rounded-lg border border-gray-700">
            <BusinessIntelligenceWorkflowVisualizer
              graphStateId={workflowGraphId}
              timeframe={timeframe}
            />
          </div>
        </div>
      )}

      {/* Export Options */}
      {showExportOptions && (
        <div className="mt-6 p-4 bg-gray-700 rounded-lg">
          <h3 className="text-lg font-semibold text-white mb-3">Export Options</h3>

          <div className="space-y-3 mb-4">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="includeMetrics"
                checked={exportOptions.includeMetrics}
                onChange={(e) => handleOptionChange('includeMetrics', e.target.checked)}
                className="mr-2"
              />
              <label htmlFor="includeMetrics" className="text-gray-200">Include Metrics</label>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="includeInsights"
                checked={exportOptions.includeInsights}
                onChange={(e) => handleOptionChange('includeInsights', e.target.checked)}
                className="mr-2"
              />
              <label htmlFor="includeInsights" className="text-gray-200">Include Insights</label>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="includeRecommendations"
                checked={exportOptions.includeRecommendations}
                onChange={(e) => handleOptionChange('includeRecommendations', e.target.checked)}
                className="mr-2"
              />
              <label htmlFor="includeRecommendations" className="text-gray-200">Include Recommendations</label>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="includeExecutiveSummary"
                checked={exportOptions.includeExecutiveSummary}
                onChange={(e) => handleOptionChange('includeExecutiveSummary', e.target.checked)}
                className="mr-2"
              />
              <label htmlFor="includeExecutiveSummary" className="text-gray-200">Include Executive Summary</label>
            </div>
          </div>

          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={() => setShowExportOptions(false)}
              className="rounded bg-gray-600 px-3 py-1 text-sm text-white hover:bg-gray-500"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleExportToNotion}
              disabled={isExporting}
              className="rounded bg-blue-600 px-3 py-1 text-sm text-white hover:bg-blue-700 flex items-center"
            >
              {isExporting ? (
                <>
                  <ArrowPathIcon className="h-4 w-4 mr-1 animate-spin" />
                  Exporting...
                </>
              ) : (
                <>
                  <DocumentArrowDownIcon className="h-4 w-4 mr-1" />
                  Export
                </>
              )}
            </button>
          </div>

          {/* Export Result */}
          {exportSuccess !== null && (
            <div className={`mt-3 p-3 rounded-lg ${exportSuccess ? 'bg-green-900/50' : 'bg-red-900/50'}`}>
              {exportSuccess ? (
                <div>
                  <p className="text-green-300 mb-1">Successfully exported to Notion!</p>
                  {exportUrl && (
                    <a
                      href={exportUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-400 hover:underline"
                    >
                      Open in Notion
                    </a>
                  )}
                </div>
              ) : (
                <p className="text-red-300">
                  Export failed: {exportError || 'Unknown error'}
                </p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
