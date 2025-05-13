import React, { useState } from 'react';
import { SecurityThreat, ThreatSeverity, ThreatStatus, ThreatType } from '../types';

interface ThreatDetectionPanelProps {
  threats: SecurityThreat[];
}

export const ThreatDetectionPanel: React.FC<ThreatDetectionPanelProps> = ({ threats }) => {
  const [selectedThreat, setSelectedThreat] = useState<SecurityThreat | null>(null);
  const [filterSeverity, setFilterSeverity] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  
  // Filter threats based on selected filters
  const filteredThreats = threats.filter(threat => {
    const matchesSeverity = filterSeverity === 'all' || threat.severity === filterSeverity;
    const matchesType = filterType === 'all' || threat.type === filterType;
    const matchesStatus = filterStatus === 'all' || threat.status === filterStatus;
    return matchesSeverity && matchesType && matchesStatus;
  });
  
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
  
  // Get badge color class based on threat status
  const getStatusBadgeClass = (status: ThreatStatus) => {
    switch (status) {
      case ThreatStatus.ACTIVE:
        return 'bg-red-900/50 text-red-400 border-red-700';
      case ThreatStatus.INVESTIGATING:
        return 'bg-blue-900/50 text-blue-400 border-blue-700';
      case ThreatStatus.MITIGATED:
        return 'bg-yellow-900/50 text-yellow-400 border-yellow-700';
      case ThreatStatus.RESOLVED:
        return 'bg-green-900/50 text-green-400 border-green-700';
      case ThreatStatus.FALSE_POSITIVE:
        return 'bg-gray-900/50 text-gray-400 border-gray-700';
      default:
        return 'bg-gray-900/50 text-gray-400 border-gray-700';
    }
  };
  
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2">
        <div className="bg-gray-800 rounded-lg shadow-lg p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-white">Threat Detection</h2>
            <button 
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
              onClick={() => alert('This would run a new threat scan')}
            >
              Run Threat Scan
            </button>
          </div>
          
          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Severity</label>
              <select 
                className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white"
                value={filterSeverity}
                onChange={(e) => setFilterSeverity(e.target.value)}
              >
                <option value="all">All Severities</option>
                {Object.values(ThreatSeverity).map(severity => (
                  <option key={severity} value={severity}>{severity}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Type</label>
              <select 
                className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white"
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
              >
                <option value="all">All Types</option>
                {Object.values(ThreatType).map(type => (
                  <option key={type} value={type}>{type.replace('_', ' ')}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Status</label>
              <select 
                className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="all">All Statuses</option>
                {Object.values(ThreatStatus).map(status => (
                  <option key={status} value={status}>{status.replace('_', ' ')}</option>
                ))}
              </select>
            </div>
          </div>
          
          {/* Threats List */}
          <div className="space-y-4">
            {filteredThreats.length === 0 ? (
              <div className="bg-gray-900/50 rounded-lg p-6 border border-gray-700 text-center">
                <p className="text-gray-400">No threats match your filters.</p>
                {threats.length > 0 && (
                  <button 
                    className="mt-2 text-blue-400 hover:text-blue-300 text-sm"
                    onClick={() => {
                      setFilterSeverity('all');
                      setFilterType('all');
                      setFilterStatus('all');
                    }}
                  >
                    Clear filters
                  </button>
                )}
              </div>
            ) : (
              filteredThreats.map(threat => (
                <div 
                  key={threat.id} 
                  className={`p-4 rounded-lg border ${getSeverityColorClass(threat.severity)} cursor-pointer hover:bg-opacity-50 transition-colors`}
                  onClick={() => setSelectedThreat(threat)}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium">{threat.title}</h3>
                      <p className="text-sm text-gray-300 mt-1 line-clamp-2">{threat.description}</p>
                    </div>
                    <div className="flex flex-col items-end">
                      <span className="text-xs uppercase font-bold">{threat.severity}</span>
                      <span className={`text-xs px-2 py-1 rounded-full mt-2 ${getStatusBadgeClass(threat.status)}`}>
                        {threat.status.replace('_', ' ')}
                      </span>
                    </div>
                  </div>
                  <div className="flex justify-between mt-3 text-xs text-gray-400">
                    <span>Type: {threat.type.replace('_', ' ')}</span>
                    <span>Source: {threat.source.replace('_', ' ')}</span>
                    <span>{new Date(threat.createdAt).toLocaleString()}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
      
      {/* Threat Details Panel */}
      <div>
        <div className="bg-gray-800 rounded-lg shadow-lg p-6 sticky top-6">
          {selectedThreat ? (
            <>
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-xl font-bold text-white">Threat Details</h2>
                <span className={`text-xs px-2 py-1 rounded-full ${getStatusBadgeClass(selectedThreat.status)}`}>
                  {selectedThreat.status.replace('_', ' ')}
                </span>
              </div>
              
              <div className={`p-4 rounded-lg border mb-4 ${getSeverityColorClass(selectedThreat.severity)}`}>
                <h3 className="font-medium text-lg">{selectedThreat.title}</h3>
                <div className="flex justify-between mt-2">
                  <span className="text-xs uppercase font-bold">{selectedThreat.severity}</span>
                  <span className="text-xs">{new Date(selectedThreat.createdAt).toLocaleString()}</span>
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-400 mb-1">Description</h4>
                  <p className="text-sm text-gray-300">{selectedThreat.description}</p>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium text-gray-400 mb-1">Type</h4>
                  <p className="text-sm text-gray-300 capitalize">{selectedThreat.type.replace('_', ' ')}</p>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium text-gray-400 mb-1">Source</h4>
                  <p className="text-sm text-gray-300 capitalize">{selectedThreat.source.replace('_', ' ')}</p>
                </div>
                
                {selectedThreat.affectedAssets && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-400 mb-1">Affected Assets</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedThreat.affectedAssets.map(asset => (
                        <span key={asset} className="text-xs bg-gray-700 text-gray-300 px-2 py-1 rounded">
                          {asset}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                
                {selectedThreat.indicators && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-400 mb-1">Indicators</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedThreat.indicators.map(indicator => (
                        <span key={indicator} className="text-xs bg-gray-700 text-gray-300 px-2 py-1 rounded">
                          {indicator}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                
                {selectedThreat.mitigationSteps && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-400 mb-1">Mitigation Steps</h4>
                    <ul className="list-disc list-inside text-sm text-gray-300">
                      {selectedThreat.mitigationSteps.map(step => (
                        <li key={step}>{step}</li>
                      ))}
                    </ul>
                  </div>
                )}
                
                <div className="pt-4 flex space-x-2">
                  <button 
                    className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded text-sm font-medium flex-1"
                    onClick={() => alert(`Investigating threat: ${selectedThreat.id}`)}
                  >
                    Investigate
                  </button>
                  <button 
                    className="bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded text-sm font-medium flex-1"
                    onClick={() => alert(`Mitigating threat: ${selectedThreat.id}`)}
                  >
                    Mitigate
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-8">
              <div className="text-gray-500 mb-2">Select a threat to view details</div>
              <p className="text-sm text-gray-400">
                Click on any threat from the list to view detailed information and take action.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
