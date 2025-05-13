import React, { useState } from 'react';
import { DomainClone, ThreatSeverity } from '../types';

interface DomainCloneMonitorProps {
  domainClones: DomainClone[];
}

export const DomainCloneMonitor: React.FC<DomainCloneMonitorProps> = ({ domainClones }) => {
  const [selectedDomain, setSelectedDomain] = useState<DomainClone | null>(null);
  const [monitoredDomains, setMonitoredDomains] = useState<string[]>(['example.com', 'yourdomain.com']);
  const [newDomain, setNewDomain] = useState('');
  const [filterSeverity, setFilterSeverity] = useState<string>('all');
  
  // Filter domain clones based on selected filters
  const filteredDomainClones = domainClones.filter(clone => {
    return filterSeverity === 'all' || clone.threatLevel === filterSeverity;
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
  
  // Add a new domain to monitoring
  const handleAddDomain = () => {
    if (newDomain && !monitoredDomains.includes(newDomain)) {
      setMonitoredDomains([...monitoredDomains, newDomain]);
      setNewDomain('');
      // In a real implementation, this would call an API to add the domain to monitoring
      alert(`Domain ${newDomain} added to monitoring`);
    }
  };
  
  // Format date for display
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleString();
  };
  
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2">
        <div className="bg-gray-800 rounded-lg shadow-lg p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-white">Domain Clone Monitoring</h2>
            <button 
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
              onClick={() => alert('This would run a domain clone scan')}
            >
              Scan for Clones
            </button>
          </div>
          
          {/* Add Domain Form */}
          <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-700 mb-6">
            <h3 className="text-sm font-medium text-gray-400 mb-3">Add Domain to Monitor</h3>
            <div className="flex">
              <input
                type="text"
                className="flex-1 bg-gray-700 border border-gray-600 rounded-l-md px-3 py-2 text-white"
                placeholder="Enter domain (e.g., example.com)"
                value={newDomain}
                onChange={(e) => setNewDomain(e.target.value)}
              />
              <button
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-r-md text-sm font-medium transition-colors"
                onClick={handleAddDomain}
                disabled={!newDomain}
              >
                Add
              </button>
            </div>
          </div>
          
          {/* Monitored Domains */}
          <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-700 mb-6">
            <h3 className="text-sm font-medium text-gray-400 mb-3">Monitored Domains</h3>
            <div className="flex flex-wrap gap-2">
              {monitoredDomains.map(domain => (
                <div key={domain} className="bg-gray-800 text-gray-300 px-3 py-1 rounded-full border border-gray-700 flex items-center">
                  <span className="mr-2">{domain}</span>
                  <button
                    className="text-gray-500 hover:text-red-400"
                    onClick={() => setMonitoredDomains(monitoredDomains.filter(d => d !== domain))}
                  >
                    &times;
                  </button>
                </div>
              ))}
              {monitoredDomains.length === 0 && (
                <p className="text-gray-500 text-sm">No domains being monitored. Add a domain above.</p>
              )}
            </div>
          </div>
          
          {/* Filter */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-400 mb-1">Filter by Severity</label>
            <select 
              className="w-full md:w-1/3 bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white"
              value={filterSeverity}
              onChange={(e) => setFilterSeverity(e.target.value)}
            >
              <option value="all">All Severities</option>
              {Object.values(ThreatSeverity).map(severity => (
                <option key={severity} value={severity}>{severity}</option>
              ))}
            </select>
          </div>
          
          {/* Domain Clones List */}
          <div className="space-y-4">
            {filteredDomainClones.length === 0 ? (
              <div className="bg-gray-900/50 rounded-lg p-6 border border-gray-700 text-center">
                <p className="text-gray-400">No domain clones detected.</p>
                {domainClones.length > 0 && filterSeverity !== 'all' && (
                  <button 
                    className="mt-2 text-blue-400 hover:text-blue-300 text-sm"
                    onClick={() => setFilterSeverity('all')}
                  >
                    Clear filter
                  </button>
                )}
              </div>
            ) : (
              filteredDomainClones.map(clone => (
                <div 
                  key={clone.id} 
                  className={`p-4 rounded-lg border ${getSeverityColorClass(clone.threatLevel)} cursor-pointer hover:bg-opacity-50 transition-colors`}
                  onClick={() => setSelectedDomain(clone)}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium">Clone of <span className="font-mono">{clone.originalDomain}</span></h3>
                      <p className="text-sm text-gray-300 mt-1 font-mono">{clone.cloneDomain}</p>
                    </div>
                    <div className="flex flex-col items-end">
                      <span className="text-xs uppercase font-bold">{clone.threatLevel}</span>
                      <span className="text-xs mt-1">Similarity: {Math.round(clone.similarity * 100)}%</span>
                    </div>
                  </div>
                  <div className="flex justify-between mt-3 text-xs text-gray-400">
                    <span>IP: {clone.ipAddress || 'Unknown'}</span>
                    <span>Country: {clone.country || 'Unknown'}</span>
                    <span>Detected: {formatDate(clone.detectedAt)}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
      
      {/* Domain Clone Details Panel */}
      <div>
        <div className="bg-gray-800 rounded-lg shadow-lg p-6 sticky top-6">
          {selectedDomain ? (
            <>
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-xl font-bold text-white">Clone Details</h2>
                <span className={`text-xs px-2 py-1 rounded-full ${getSeverityColorClass(selectedDomain.threatLevel)}`}>
                  {selectedDomain.threatLevel}
                </span>
              </div>
              
              <div className={`p-4 rounded-lg border mb-4 ${getSeverityColorClass(selectedDomain.threatLevel)}`}>
                <h3 className="font-medium">Clone Domain</h3>
                <p className="text-lg font-mono mt-1">{selectedDomain.cloneDomain}</p>
                <div className="mt-2 text-sm">
                  <div>Original: <span className="font-mono">{selectedDomain.originalDomain}</span></div>
                  <div className="mt-1">Similarity: <span className="font-bold">{Math.round(selectedDomain.similarity * 100)}%</span></div>
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-400 mb-1">Registration Details</h4>
                  <div className="bg-gray-900/50 rounded-lg p-3 border border-gray-700">
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="text-gray-500">Registrar:</span>
                        <div className="text-gray-300">{selectedDomain.registrar || 'Unknown'}</div>
                      </div>
                      <div>
                        <span className="text-gray-500">Registered:</span>
                        <div className="text-gray-300">{selectedDomain.registrationDate ? formatDate(selectedDomain.registrationDate) : 'Unknown'}</div>
                      </div>
                      <div>
                        <span className="text-gray-500">IP Address:</span>
                        <div className="text-gray-300 font-mono">{selectedDomain.ipAddress || 'Unknown'}</div>
                      </div>
                      <div>
                        <span className="text-gray-500">Country:</span>
                        <div className="text-gray-300">{selectedDomain.country || 'Unknown'}</div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium text-gray-400 mb-1">Content Analysis</h4>
                  <div className="bg-gray-900/50 rounded-lg p-3 border border-gray-700">
                    <div className="mb-2">
                      <span className="text-gray-500">Content Match:</span>
                      <div className="text-gray-300">{selectedDomain.contentMatch || 0}%</div>
                    </div>
                    <div>
                      <span className="text-gray-500">Last Checked:</span>
                      <div className="text-gray-300">{formatDate(selectedDomain.lastChecked)}</div>
                    </div>
                  </div>
                </div>
                
                {selectedDomain.screenshot && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-400 mb-1">Screenshot</h4>
                    <div className="bg-gray-900/50 rounded-lg p-1 border border-gray-700">
                      <img 
                        src={selectedDomain.screenshot} 
                        alt={`Screenshot of ${selectedDomain.cloneDomain}`} 
                        className="w-full h-auto rounded"
                      />
                    </div>
                  </div>
                )}
                
                <div className="pt-4 flex space-x-2">
                  <button 
                    className="bg-yellow-600 hover:bg-yellow-700 text-white px-3 py-2 rounded text-sm font-medium flex-1"
                    onClick={() => alert(`Reporting domain: ${selectedDomain.cloneDomain}`)}
                  >
                    Report Domain
                  </button>
                  <button 
                    className="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded text-sm font-medium flex-1"
                    onClick={() => alert(`Blocking domain: ${selectedDomain.cloneDomain}`)}
                  >
                    Block Domain
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-8">
              <div className="text-gray-500 mb-2">Select a domain clone to view details</div>
              <p className="text-sm text-gray-400">
                Click on any domain clone from the list to view detailed information and take action.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
