import React from 'react';
import { SecurityDashboardStats, ThreatSeverity } from '../types';

interface SecurityOverviewProps {
  stats: SecurityDashboardStats;
}

export const SecurityOverview: React.FC<SecurityOverviewProps> = ({ stats }) => {
  // Format date for display
  const formatDate = (date?: Date) => {
    if (!date) return 'Never';
    return new Date(date).toLocaleString();
  };

  // Get color class based on security score
  const getScoreColorClass = (score: number) => {
    if (score >= 90) return 'text-green-400';
    if (score >= 70) return 'text-yellow-400';
    if (score >= 50) return 'text-orange-400';
    return 'text-red-400';
  };

  // Get color class based on threat severity
  const getSeverityColorClass = (severity: ThreatSeverity) => {
    switch (severity) {
      case ThreatSeverity.CRITICAL:
        return 'bg-red-900/30 text-red-400 border-red-700';
      case ThreatSeverity.HIGH:
        return 'bg-orange-900/30 text-orange-400 border-orange-700';
      case ThreatSeverity.MEDIUM:
        return 'bg-yellow-900/30 text-yellow-400 border-yellow-700';
      case ThreatSeverity.LOW:
        return 'bg-blue-900/30 text-blue-400 border-blue-700';
      case ThreatSeverity.INFO:
        return 'bg-gray-900/30 text-gray-400 border-gray-700';
      default:
        return 'bg-gray-900/30 text-gray-400 border-gray-700';
    }
  };

  return (
    <div className="bg-gray-800 rounded-lg shadow-lg p-6 mb-6">
      <h2 className="text-xl font-bold text-white mb-4">Security Overview</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {/* Security Score */}
        <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-700">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-sm font-medium text-gray-400">Security Score</h3>
            <span className={`text-2xl font-bold ${getScoreColorClass(stats.securityScore)}`}>
              {stats.securityScore}
            </span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2.5">
            <div 
              className={`h-2.5 rounded-full ${getScoreColorClass(stats.securityScore).replace('text-', 'bg-')}`}
              style={{ width: `${stats.securityScore}%` }}
            ></div>
          </div>
          <p className="text-xs text-gray-500 mt-2">Last scan: {formatDate(stats.lastScanDate)}</p>
        </div>
        
        {/* Active Threats */}
        <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-700">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-medium text-gray-400">Active Threats</h3>
            <span className={`text-2xl font-bold ${stats.activeThreatCount > 0 ? 'text-red-400' : 'text-green-400'}`}>
              {stats.activeThreatCount}
            </span>
          </div>
          <div className="flex items-center mt-2">
            <span className="text-xs font-medium text-red-400 mr-2">Critical: {stats.criticalThreatCount}</span>
            {stats.criticalThreatCount > 0 && (
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
              </span>
            )}
          </div>
        </div>
        
        {/* Domain Clones */}
        <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-700">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-medium text-gray-400">Domain Clones</h3>
            <span className={`text-2xl font-bold ${stats.domainCloneCount > 0 ? 'text-orange-400' : 'text-green-400'}`}>
              {stats.domainCloneCount}
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            {stats.domainCloneCount === 0 
              ? 'No domain clones detected' 
              : `${stats.domainCloneCount} suspicious domain${stats.domainCloneCount !== 1 ? 's' : ''} found`}
          </p>
        </div>
        
        {/* Vulnerabilities */}
        <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-700">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-medium text-gray-400">Vulnerabilities</h3>
            <span className={`text-2xl font-bold ${
              stats.vulnerabilityCount.critical > 0 ? 'text-red-400' : 
              stats.vulnerabilityCount.high > 0 ? 'text-orange-400' :
              stats.vulnerabilityCount.medium > 0 ? 'text-yellow-400' :
              stats.vulnerabilityCount.low > 0 ? 'text-blue-400' : 'text-green-400'
            }`}>
              {stats.vulnerabilityCount.critical + 
               stats.vulnerabilityCount.high + 
               stats.vulnerabilityCount.medium + 
               stats.vulnerabilityCount.low}
            </span>
          </div>
          <div className="grid grid-cols-4 gap-1 mt-2">
            <div className="text-center">
              <div className="text-xs font-medium text-red-400">{stats.vulnerabilityCount.critical}</div>
              <div className="text-xs text-gray-500">Critical</div>
            </div>
            <div className="text-center">
              <div className="text-xs font-medium text-orange-400">{stats.vulnerabilityCount.high}</div>
              <div className="text-xs text-gray-500">High</div>
            </div>
            <div className="text-center">
              <div className="text-xs font-medium text-yellow-400">{stats.vulnerabilityCount.medium}</div>
              <div className="text-xs text-gray-500">Medium</div>
            </div>
            <div className="text-center">
              <div className="text-xs font-medium text-blue-400">{stats.vulnerabilityCount.low}</div>
              <div className="text-xs text-gray-500">Low</div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Threat Distribution */}
      <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-700 mb-6">
        <h3 className="text-sm font-medium text-gray-400 mb-3">Threat Distribution</h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {Object.entries(stats.threatsByType).map(([type, count]) => (
            <div key={type} className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gray-800 mb-2">
                <span className="text-lg font-bold text-red-400">{count}</span>
              </div>
              <div className="text-xs font-medium text-gray-300 capitalize">{type.replace('_', ' ')}</div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Recent Activity */}
      <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-700">
        <h3 className="text-sm font-medium text-gray-400 mb-3">Recent Security Activity</h3>
        
        {stats.recentThreats.length === 0 && stats.recentDomainClones.length === 0 ? (
          <p className="text-gray-500 text-sm">No recent security activity to display.</p>
        ) : (
          <div className="space-y-3">
            {stats.recentThreats.slice(0, 3).map(threat => (
              <div key={threat.id} className={`p-3 rounded-lg ${getSeverityColorClass(threat.severity)} border`}>
                <div className="flex justify-between">
                  <h4 className="font-medium">{threat.title}</h4>
                  <span className="text-xs uppercase font-bold">{threat.severity}</span>
                </div>
                <p className="text-sm text-gray-300 mt-1">{threat.description}</p>
                <div className="flex justify-between mt-2 text-xs text-gray-400">
                  <span>Type: {threat.type.replace('_', ' ')}</span>
                  <span>{new Date(threat.createdAt).toLocaleString()}</span>
                </div>
              </div>
            ))}
            
            {stats.recentDomainClones.slice(0, 2).map(clone => (
              <div key={clone.id} className={`p-3 rounded-lg ${getSeverityColorClass(clone.threatLevel)} border`}>
                <div className="flex justify-between">
                  <h4 className="font-medium">Domain Clone Detected</h4>
                  <span className="text-xs uppercase font-bold">{clone.threatLevel}</span>
                </div>
                <p className="text-sm text-gray-300 mt-1">
                  Clone of <span className="font-mono">{clone.originalDomain}</span> detected: <span className="font-mono">{clone.cloneDomain}</span>
                </p>
                <div className="flex justify-between mt-2 text-xs text-gray-400">
                  <span>Similarity: {Math.round(clone.similarity * 100)}%</span>
                  <span>{new Date(clone.detectedAt).toLocaleString()}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
