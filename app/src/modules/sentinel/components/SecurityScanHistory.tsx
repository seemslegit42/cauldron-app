import React, { useState } from 'react';
import { useAction } from 'wasp/client/operations';
import { runSecurityScan } from 'wasp/client/operations';
import { SecurityScan, ScanType, ScanStatus } from '../types';

interface SecurityScanHistoryProps {
  scans: SecurityScan[];
  onRefresh: () => void;
}

export const SecurityScanHistory: React.FC<SecurityScanHistoryProps> = ({ scans, onRefresh }) => {
  const [selectedScan, setSelectedScan] = useState<SecurityScan | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isRunScanModalOpen, setIsRunScanModalOpen] = useState(false);
  const [scanType, setScanType] = useState<ScanType>('full');
  const [isLoading, setIsLoading] = useState(false);

  const runSecurityScanFn = useAction(runSecurityScan);

  // Helper function to get color based on scan status
  const getStatusColor = (status: ScanStatus) => {
    switch (status) {
      case 'scheduled':
        return 'bg-blue-500 text-white';
      case 'running':
        return 'bg-yellow-500 text-white';
      case 'completed':
        return 'bg-green-500 text-white';
      case 'failed':
        return 'bg-red-500 text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  };

  // Helper function to get color based on scan score
  const getScoreColor = (score?: number) => {
    if (!score) return 'text-gray-400';
    if (score >= 90) return 'text-green-500';
    if (score >= 70) return 'text-yellow-500';
    return 'text-red-500';
  };

  // Helper function to format scan type
  const formatScanType = (type: ScanType) => {
    return type.charAt(0).toUpperCase() + type.slice(1);
  };

  // Handle running a new scan
  const handleRunScan = async () => {
    try {
      setIsLoading(true);
      await runSecurityScanFn({ type: scanType });
      setIsRunScanModalOpen(false);
      onRefresh();
    } catch (error) {
      console.error('Error running security scan:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-gray-800 rounded-lg shadow-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-white">Security Scan History</h2>
        <button
          onClick={() => setIsRunScanModalOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md flex items-center"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
          </svg>
          Run New Scan
        </button>
      </div>

      {/* Scan History List */}
      {scans.length === 0 ? (
        <div className="bg-gray-700 rounded-lg p-6 text-center">
          <p className="text-gray-400">No scan history available</p>
          <button
            onClick={() => setIsRunScanModalOpen(true)}
            className="mt-4 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md"
          >
            Run Your First Scan
          </button>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-700">
            <thead className="bg-gray-700">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Type
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Score
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Started
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Duration
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Findings
                </th>
                <th scope="col" className="relative px-6 py-3">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-gray-800 divide-y divide-gray-700">
              {scans.map((scan) => {
                const duration = scan.completedAt 
                  ? Math.round((new Date(scan.completedAt).getTime() - new Date(scan.startedAt).getTime()) / 1000)
                  : null;
                
                const alertCount = scan.alerts?.length || 0;
                const complianceCount = scan.complianceChecks?.length || 0;
                
                return (
                  <tr 
                    key={scan.id}
                    className="hover:bg-gray-700 cursor-pointer"
                    onClick={() => {
                      setSelectedScan(scan);
                      setIsModalOpen(true);
                    }}
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                      {formatScanType(scan.type)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(scan.status)}`}>
                        {scan.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`text-sm font-medium ${getScoreColor(scan.score)}`}>
                        {scan.score ? `${scan.score}/100` : 'N/A'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      {new Date(scan.startedAt).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      {duration ? `${duration}s` : 'In progress'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex space-x-2">
                        {alertCount > 0 && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-200 text-red-800">
                            {alertCount} {alertCount === 1 ? 'Alert' : 'Alerts'}
                          </span>
                        )}
                        {complianceCount > 0 && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-200 text-blue-800">
                            {complianceCount} {complianceCount === 1 ? 'Check' : 'Checks'}
                          </span>
                        )}
                        {alertCount === 0 && complianceCount === 0 && (
                          <span className="text-sm text-gray-400">None</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedScan(scan);
                          setIsModalOpen(true);
                        }}
                        className="text-blue-400 hover:text-blue-300"
                      >
                        Details
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Scan Detail Modal */}
      {isModalOpen && selectedScan && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h2 className="text-xl font-bold text-white">{formatScanType(selectedScan.type)} Scan Details</h2>
                <p className="text-gray-400 text-sm">
                  {new Date(selectedScan.startedAt).toLocaleString()}
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-white"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-gray-700 rounded-lg p-4 border border-gray-600">
                <h3 className="text-sm font-medium text-gray-300 mb-1">Status</h3>
                <div className={`inline-block px-2 py-1 rounded-full text-xs ${getStatusColor(selectedScan.status)}`}>
                  {selectedScan.status}
                </div>
              </div>
              <div className="bg-gray-700 rounded-lg p-4 border border-gray-600">
                <h3 className="text-sm font-medium text-gray-300 mb-1">Score</h3>
                <div className={`text-2xl font-bold ${getScoreColor(selectedScan.score)}`}>
                  {selectedScan.score ? `${selectedScan.score}/100` : 'N/A'}
                </div>
              </div>
              <div className="bg-gray-700 rounded-lg p-4 border border-gray-600">
                <h3 className="text-sm font-medium text-gray-300 mb-1">Duration</h3>
                <div className="text-white">
                  {selectedScan.completedAt 
                    ? `${Math.round((new Date(selectedScan.completedAt).getTime() - new Date(selectedScan.startedAt).getTime()) / 1000)}s` 
                    : 'In progress'}
                </div>
              </div>
            </div>

            {selectedScan.summary && (
              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-300 mb-2">Summary</h3>
                <div className="bg-gray-700 rounded-lg p-4 border border-gray-600">
                  <p className="text-white">{selectedScan.summary}</p>
                </div>
              </div>
            )}

            {selectedScan.results && (
              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-300 mb-2">Results</h3>
                <div className="bg-gray-700 rounded-lg p-4 border border-gray-600">
                  <pre className="text-xs text-gray-300 overflow-auto">
                    {JSON.stringify(selectedScan.results, null, 2)}
                  </pre>
                </div>
              </div>
            )}

            {selectedScan.alerts && selectedScan.alerts.length > 0 && (
              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-300 mb-2">Alerts ({selectedScan.alerts.length})</h3>
                <div className="bg-gray-700 rounded-lg p-4 border border-gray-600">
                  <div className="space-y-3">
                    {selectedScan.alerts.map((alert) => (
                      <div key={alert.id} className="border-b border-gray-600 pb-3 last:border-0 last:pb-0">
                        <div className="flex items-start">
                          <div className={`rounded-full h-3 w-3 mt-1.5 mr-2 ${
                            alert.severity === 'critical' ? 'bg-red-500' :
                            alert.severity === 'high' ? 'bg-orange-500' :
                            alert.severity === 'medium' ? 'bg-yellow-500' :
                            'bg-blue-500'
                          }`}></div>
                          <div>
                            <h4 className="text-white font-medium">{alert.title}</h4>
                            <p className="text-gray-400 text-sm mt-1">{alert.description}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {selectedScan.complianceChecks && selectedScan.complianceChecks.length > 0 && (
              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-300 mb-2">Compliance Checks ({selectedScan.complianceChecks.length})</h3>
                <div className="bg-gray-700 rounded-lg p-4 border border-gray-600">
                  <div className="space-y-3">
                    {selectedScan.complianceChecks.map((check) => (
                      <div key={check.id} className="border-b border-gray-600 pb-3 last:border-0 last:pb-0">
                        <div className="flex items-start">
                          <div className={`rounded-full h-3 w-3 mt-1.5 mr-2 ${
                            check.status === 'compliant' ? 'bg-green-500' :
                            check.status === 'non_compliant' ? 'bg-red-500' :
                            check.status === 'partial' ? 'bg-yellow-500' :
                            'bg-gray-500'
                          }`}></div>
                          <div>
                            <div className="flex items-center">
                              <span className="text-white font-medium">{check.standard}</span>
                              <span className="text-gray-400 mx-2">|</span>
                              <span className="text-gray-300">{check.control}</span>
                            </div>
                            <p className="text-gray-400 text-sm mt-1">{check.description}</p>
                            {check.evidence && (
                              <p className="text-gray-500 text-xs mt-1 italic">{check.evidence}</p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            <div className="flex justify-end">
              <button
                onClick={() => setIsModalOpen(false)}
                className="bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 px-4 rounded-md"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Run Scan Modal */}
      {isRunScanModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-xl font-bold text-white">Run New Security Scan</h2>
              <button
                onClick={() => setIsRunScanModalOpen(false)}
                className="text-gray-400 hover:text-white"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-300 mb-2">Scan Type</label>
              <select
                value={scanType}
                onChange={(e) => setScanType(e.target.value as ScanType)}
                className="bg-gray-700 text-white text-sm rounded-md border border-gray-600 focus:ring-blue-500 focus:border-blue-500 block w-full p-3"
              >
                <option value="full">Full Scan (Comprehensive)</option>
                <option value="vulnerability">Vulnerability Scan</option>
                <option value="compliance">Compliance Scan</option>
                <option value="configuration">Configuration Scan</option>
                <option value="threat">Threat Scan</option>
              </select>
            </div>
            <div className="mb-6">
              <p className="text-gray-400 text-sm">
                {scanType === 'full' && 'Performs a comprehensive scan covering vulnerabilities, compliance, configuration, and threats.'}
                {scanType === 'vulnerability' && 'Scans for security vulnerabilities in your system and dependencies.'}
                {scanType === 'compliance' && 'Checks your system against security compliance standards like GDPR, PCI-DSS, etc.'}
                {scanType === 'configuration' && 'Analyzes your system configuration for security misconfigurations.'}
                {scanType === 'threat' && 'Scans for active threats and suspicious activities in your system.'}
              </p>
            </div>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setIsRunScanModalOpen(false)}
                className="bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 px-4 rounded-md"
              >
                Cancel
              </button>
              <button
                onClick={handleRunScan}
                disabled={isLoading}
                className={`bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md flex items-center ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Running...
                  </>
                ) : (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                    </svg>
                    Run Scan
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
