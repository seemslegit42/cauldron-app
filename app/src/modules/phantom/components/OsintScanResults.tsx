import React, { useState } from 'react';
import { ThreatSeverity } from '../types';
import { useAction } from 'wasp/client/operations';
import { runSecurityScan } from '../operations';

interface OsintFinding {
  id: string;
  title: string;
  description: string;
  source: string;
  url?: string;
  discoveredAt: Date;
  severity: ThreatSeverity;
  category: string;
}

export const OsintScanResults: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [scanResults, setScanResults] = useState<OsintFinding[]>([]);
  const [selectedFinding, setSelectedFinding] = useState<OsintFinding | null>(null);
  const [scanSource, setScanSource] = useState<string[]>(['social_media', 'dark_web', 'github', 'pastebin']);
  
  // Use the runSecurityScan action
  const runScanAction = useAction(runSecurityScan);
  
  // Run OSINT scan
  const handleRunScan = async () => {
    if (!searchQuery) return;
    
    setIsScanning(true);
    
    try {
      // Call the security scan action
      const result = await runScanAction({
        scanType: 'osint',
        targets: [searchQuery],
        configuration: {
          sources: scanSource
        }
      });
      
      // Update scan results
      if (result.success && result.results.findings) {
        setScanResults(result.results.findings);
      }
    } catch (error) {
      console.error('Error running OSINT scan:', error);
      alert('Failed to run OSINT scan. Please try again.');
    } finally {
      setIsScanning(false);
    }
  };
  
  // Toggle scan source
  const toggleScanSource = (source: string) => {
    if (scanSource.includes(source)) {
      setScanSource(scanSource.filter(s => s !== source));
    } else {
      setScanSource([...scanSource, source]);
    }
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
  
  // Format date for display
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleString();
  };
  
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2">
        <div className="bg-gray-800 rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-xl font-bold text-white mb-4">OSINT Scanner</h2>
          
          {/* Search Form */}
          <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-700 mb-6">
            <h3 className="text-sm font-medium text-gray-400 mb-3">Search for Intelligence</h3>
            <div className="flex mb-4">
              <input
                type="text"
                className="flex-1 bg-gray-700 border border-gray-600 rounded-l-md px-3 py-2 text-white"
                placeholder="Enter domain, company name, email, or keyword"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-r-md text-sm font-medium transition-colors disabled:bg-gray-600 disabled:cursor-not-allowed"
                onClick={handleRunScan}
                disabled={isScanning || !searchQuery}
              >
                {isScanning ? 'Scanning...' : 'Scan'}
              </button>
            </div>
            
            <div>
              <h4 className="text-xs font-medium text-gray-500 mb-2">Sources to scan:</h4>
              <div className="flex flex-wrap gap-2">
                <button
                  className={`text-xs px-3 py-1 rounded-full border ${scanSource.includes('social_media') ? 'bg-blue-900/30 text-blue-400 border-blue-700' : 'bg-gray-800 text-gray-400 border-gray-700'}`}
                  onClick={() => toggleScanSource('social_media')}
                >
                  Social Media
                </button>
                <button
                  className={`text-xs px-3 py-1 rounded-full border ${scanSource.includes('dark_web') ? 'bg-purple-900/30 text-purple-400 border-purple-700' : 'bg-gray-800 text-gray-400 border-gray-700'}`}
                  onClick={() => toggleScanSource('dark_web')}
                >
                  Dark Web
                </button>
                <button
                  className={`text-xs px-3 py-1 rounded-full border ${scanSource.includes('github') ? 'bg-green-900/30 text-green-400 border-green-700' : 'bg-gray-800 text-gray-400 border-gray-700'}`}
                  onClick={() => toggleScanSource('github')}
                >
                  GitHub
                </button>
                <button
                  className={`text-xs px-3 py-1 rounded-full border ${scanSource.includes('pastebin') ? 'bg-yellow-900/30 text-yellow-400 border-yellow-700' : 'bg-gray-800 text-gray-400 border-gray-700'}`}
                  onClick={() => toggleScanSource('pastebin')}
                >
                  Pastebin
                </button>
                <button
                  className={`text-xs px-3 py-1 rounded-full border ${scanSource.includes('breach_data') ? 'bg-red-900/30 text-red-400 border-red-700' : 'bg-gray-800 text-gray-400 border-gray-700'}`}
                  onClick={() => toggleScanSource('breach_data')}
                >
                  Breach Data
                </button>
              </div>
            </div>
          </div>
          
          {/* Scan Results */}
          <div>
            <h3 className="text-sm font-medium text-gray-400 mb-3">Scan Results</h3>
            
            {isScanning ? (
              <div className="bg-gray-900/50 rounded-lg p-6 border border-gray-700 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500 mx-auto mb-4"></div>
                <p className="text-gray-400">Scanning for intelligence data...</p>
                <p className="text-xs text-gray-500 mt-2">This may take a few moments</p>
              </div>
            ) : scanResults.length === 0 ? (
              <div className="bg-gray-900/50 rounded-lg p-6 border border-gray-700 text-center">
                <p className="text-gray-400">No OSINT findings to display.</p>
                <p className="text-xs text-gray-500 mt-2">
                  {searchQuery ? 'Try a different search query or select more sources.' : 'Enter a search query and run a scan.'}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {scanResults.map(finding => (
                  <div 
                    key={finding.id} 
                    className={`p-4 rounded-lg border ${getSeverityColorClass(finding.severity)} cursor-pointer hover:bg-opacity-50 transition-colors`}
                    onClick={() => setSelectedFinding(finding)}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium">{finding.title}</h3>
                        <p className="text-sm text-gray-300 mt-1 line-clamp-2">{finding.description}</p>
                      </div>
                      <div className="flex flex-col items-end">
                        <span className="text-xs uppercase font-bold">{finding.severity}</span>
                        <span className="text-xs mt-1 capitalize">{finding.source}</span>
                      </div>
                    </div>
                    <div className="flex justify-between mt-3 text-xs text-gray-400">
                      <span>Category: {finding.category}</span>
                      <span>Discovered: {formatDate(finding.discoveredAt)}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Finding Details Panel */}
      <div>
        <div className="bg-gray-800 rounded-lg shadow-lg p-6 sticky top-6">
          {selectedFinding ? (
            <>
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-xl font-bold text-white">Finding Details</h2>
                <span className={`text-xs px-2 py-1 rounded-full ${getSeverityColorClass(selectedFinding.severity)}`}>
                  {selectedFinding.severity}
                </span>
              </div>
              
              <div className={`p-4 rounded-lg border mb-4 ${getSeverityColorClass(selectedFinding.severity)}`}>
                <h3 className="font-medium text-lg">{selectedFinding.title}</h3>
                <div className="flex justify-between mt-2">
                  <span className="text-xs capitalize">{selectedFinding.source}</span>
                  <span className="text-xs">{formatDate(selectedFinding.discoveredAt)}</span>
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-400 mb-1">Description</h4>
                  <p className="text-sm text-gray-300">{selectedFinding.description}</p>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium text-gray-400 mb-1">Category</h4>
                  <p className="text-sm text-gray-300">{selectedFinding.category}</p>
                </div>
                
                {selectedFinding.url && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-400 mb-1">Source URL</h4>
                    <a 
                      href={selectedFinding.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-sm text-blue-400 hover:text-blue-300 break-all"
                    >
                      {selectedFinding.url}
                    </a>
                  </div>
                )}
                
                <div className="pt-4 flex space-x-2">
                  <button 
                    className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded text-sm font-medium flex-1"
                    onClick={() => alert(`Creating threat from finding: ${selectedFinding.id}`)}
                  >
                    Create Threat
                  </button>
                  <button 
                    className="bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded text-sm font-medium flex-1"
                    onClick={() => alert(`Exporting finding: ${selectedFinding.id}`)}
                  >
                    Export
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-8">
              <div className="text-gray-500 mb-2">Select a finding to view details</div>
              <p className="text-sm text-gray-400">
                Run an OSINT scan and click on any finding from the results to view detailed information.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
