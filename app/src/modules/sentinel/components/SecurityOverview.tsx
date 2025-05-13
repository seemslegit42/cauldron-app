import React from 'react';
import { RiskLevel, SecurityMetric } from '../types';

interface SecurityOverviewProps {
  securityScore: number;
  riskLevel: RiskLevel;
  metrics: SecurityMetric[];
  lastScanTime: string;
}

export const SecurityOverview: React.FC<SecurityOverviewProps> = ({
  securityScore,
  riskLevel,
  metrics,
  lastScanTime,
}) => {
  // Helper function to get color based on risk level
  const getRiskColor = (level: RiskLevel) => {
    switch (level) {
      case 'green':
        return 'bg-green-500';
      case 'yellow':
        return 'bg-yellow-500';
      case 'red':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  // Helper function to get color based on score
  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-500';
    if (score >= 70) return 'text-yellow-500';
    return 'text-red-500';
  };

  // Helper function to get metric icon
  const getMetricIcon = (category: string) => {
    switch (category) {
      case 'posture':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
        );
      case 'threats':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        );
      case 'compliance':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        );
      case 'response':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
          </svg>
        );
      default:
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
        );
    }
  };

  return (
    <div className="bg-gray-800 rounded-lg shadow-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-white">Security Overview</h2>
        <div className="text-sm text-gray-400">Last scan: {lastScanTime}</div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Security Score */}
        <div className="bg-gray-700 rounded-lg p-4 border border-gray-600">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-sm font-medium text-gray-300">Security Score</h3>
            <div className={`text-2xl font-bold ${getScoreColor(securityScore)}`}>{securityScore}</div>
          </div>
          <div className="w-full bg-gray-600 rounded-full h-2.5">
            <div 
              className={`h-2.5 rounded-full ${getScoreColor(securityScore)}`} 
              style={{ width: `${securityScore}%` }}
            ></div>
          </div>
          <div className="flex justify-between text-xs text-gray-400 mt-1">
            <span>0</span>
            <span>50</span>
            <span>100</span>
          </div>
        </div>

        {/* Risk Level */}
        <div className="bg-gray-700 rounded-lg p-4 border border-gray-600">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-sm font-medium text-gray-300">Current Risk Level</h3>
            <div className="flex items-center">
              <div className={`h-3 w-3 rounded-full mr-2 ${getRiskColor(riskLevel)}`}></div>
              <div className="text-lg font-bold text-white capitalize">{riskLevel}</div>
            </div>
          </div>
          <div className="flex justify-between items-center mt-4">
            <div className="flex flex-col items-center">
              <div className="h-4 w-4 rounded-full bg-green-500 mb-1"></div>
              <span className="text-xs text-gray-400">Low</span>
            </div>
            <div className="flex flex-col items-center">
              <div className="h-4 w-4 rounded-full bg-yellow-500 mb-1"></div>
              <span className="text-xs text-gray-400">Medium</span>
            </div>
            <div className="flex flex-col items-center">
              <div className="h-4 w-4 rounded-full bg-red-500 mb-1"></div>
              <span className="text-xs text-gray-400">High</span>
            </div>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {metrics.map((metric) => (
          <div key={metric.id} className="bg-gray-700 rounded-lg p-3 border border-gray-600">
            <div className="flex items-center mb-2">
              <div className="text-blue-400 mr-2">
                {getMetricIcon(metric.category)}
              </div>
              <h3 className="text-xs font-medium text-gray-300">{metric.name.replace(/_/g, ' ')}</h3>
            </div>
            <div className="flex justify-between items-end">
              <div className="text-lg font-bold text-white">
                {metric.value}{metric.unit}
              </div>
              {metric.previousValue !== undefined && (
                <div className={`text-xs ${metric.value > metric.previousValue ? 'text-green-400' : metric.value < metric.previousValue ? 'text-red-400' : 'text-gray-400'}`}>
                  {metric.value > metric.previousValue ? '↑' : metric.value < metric.previousValue ? '↓' : '→'}
                  {Math.abs(((metric.value - metric.previousValue) / metric.previousValue) * 100).toFixed(1)}%
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
