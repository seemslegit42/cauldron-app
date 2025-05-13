import React, { useState, useEffect } from 'react';

interface RiskLevels {
  overall: 'critical' | 'high' | 'medium' | 'low' | 'minimal';
  security: 'critical' | 'high' | 'medium' | 'low' | 'minimal';
  operations: 'critical' | 'high' | 'medium' | 'low' | 'minimal';
  financial?: 'critical' | 'high' | 'medium' | 'low' | 'minimal';
  compliance?: 'critical' | 'high' | 'medium' | 'low' | 'minimal';
  reputation?: 'critical' | 'high' | 'medium' | 'low' | 'minimal';
}

interface RiskLevelIndicatorProps {
  riskLevels: RiskLevels;
  loading?: boolean;
  className?: string;
  showDetails?: boolean;
}

export const RiskLevelIndicator: React.FC<RiskLevelIndicatorProps> = ({
  riskLevels,
  loading = false,
  className = '',
  showDetails = true,
}) => {
  const [showAllRisks, setShowAllRisks] = useState(false);
  const [pulseEffect, setPulseEffect] = useState(true);

  // Disable pulse effect after 5 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setPulseEffect(false);
    }, 5000);
    return () => clearTimeout(timer);
  }, []);

  // Get risk level color
  const getRiskLevelColor = (level: 'critical' | 'high' | 'medium' | 'low' | 'minimal'): string => {
    switch (level) {
      case 'critical':
        return 'bg-red-600';
      case 'high':
        return 'bg-orange-500';
      case 'medium':
        return 'bg-yellow-500';
      case 'low':
        return 'bg-green-500';
      case 'minimal':
        return 'bg-blue-500';
      default:
        return 'bg-gray-500';
    }
  };

  // Get risk level text color
  const getRiskLevelTextColor = (level: 'critical' | 'high' | 'medium' | 'low' | 'minimal'): string => {
    switch (level) {
      case 'critical':
        return 'text-red-500';
      case 'high':
        return 'text-orange-500';
      case 'medium':
        return 'text-yellow-500';
      case 'low':
        return 'text-green-500';
      case 'minimal':
        return 'text-blue-500';
      default:
        return 'text-gray-500';
    }
  };

  // Get risk level description
  const getRiskLevelDescription = (level: 'critical' | 'high' | 'medium' | 'low' | 'minimal'): string => {
    switch (level) {
      case 'critical':
        return 'Immediate action required. Severe threats detected.';
      case 'high':
        return 'Urgent attention needed. Significant threats present.';
      case 'medium':
        return 'Moderate risk level. Monitor closely.';
      case 'low':
        return 'Low risk level. Standard monitoring sufficient.';
      case 'minimal':
        return 'Minimal risk detected. System operating normally.';
      default:
        return 'Risk level unknown.';
    }
  };

  // Get risk level percentage
  const getRiskLevelPercentage = (level: 'critical' | 'high' | 'medium' | 'low' | 'minimal'): number => {
    switch (level) {
      case 'critical':
        return 90;
      case 'high':
        return 70;
      case 'medium':
        return 50;
      case 'low':
        return 30;
      case 'minimal':
        return 10;
      default:
        return 0;
    }
  };

  // Get all risk categories
  const getAllRiskCategories = () => {
    const categories = Object.keys(riskLevels) as Array<keyof RiskLevels>;
    return categories.filter(category => category !== 'overall');
  };

  return (
    <div className={`rounded-lg border border-gray-700 bg-gray-800 p-6 shadow-lg ${className}`}>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-bold text-red-400">Risk Levels</h2>
        <button
          className="rounded px-3 py-1 text-sm text-gray-400 transition-colors hover:bg-gray-700 hover:text-white"
          onClick={() => setShowAllRisks(!showAllRisks)}
        >
          {showAllRisks ? 'Hide Details' : 'Show Details'}
        </button>
      </div>
      
      {loading ? (
        <div className="flex h-32 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-white"></div>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Overall Risk Level */}
          <div className="mb-6">
            <div className="mb-2 flex items-center justify-between">
              <div className="font-medium">Overall Risk Level</div>
              <div className={`font-bold uppercase ${getRiskLevelTextColor(riskLevels.overall)}`}>
                {riskLevels.overall}
              </div>
            </div>
            <div className="h-4 w-full overflow-hidden rounded-full bg-gray-700">
              <div
                className={`h-full ${getRiskLevelColor(riskLevels.overall)} ${
                  pulseEffect ? 'animate-pulse' : ''
                }`}
                style={{ width: `${getRiskLevelPercentage(riskLevels.overall)}%` }}
              ></div>
            </div>
            <div className="mt-2 text-sm text-gray-400">
              {getRiskLevelDescription(riskLevels.overall)}
            </div>
          </div>

          {/* Detailed Risk Levels */}
          {showDetails && showAllRisks && (
            <div className="space-y-4 border-t border-gray-700 pt-4">
              {getAllRiskCategories().map((category) => (
                <div key={category} className="mb-4">
                  <div className="mb-1 flex items-center justify-between">
                    <div className="font-medium capitalize">{category} Risk</div>
                    <div className={`text-sm font-bold uppercase ${getRiskLevelTextColor(riskLevels[category]!)}`}>
                      {riskLevels[category]}
                    </div>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-gray-700">
                    <div
                      className={`h-full ${getRiskLevelColor(riskLevels[category]!)}`}
                      style={{ width: `${getRiskLevelPercentage(riskLevels[category]!)}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Quick Actions */}
          <div className="mt-4 flex flex-wrap gap-2">
            <button className="flex items-center rounded bg-red-900 px-3 py-1 text-sm text-white transition-colors hover:bg-red-800">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="mr-1 h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                />
              </svg>
              Run Security Scan
            </button>
            <button className="flex items-center rounded bg-gray-700 px-3 py-1 text-sm text-white transition-colors hover:bg-gray-600">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="mr-1 h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                />
              </svg>
              View Threats
            </button>
          </div>
        </div>
      )}
    </div>
  );
};