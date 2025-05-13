import React, { useState } from 'react';
import { useAction } from 'wasp/client/operations';
import { acknowledgeAlert } from 'wasp/client/operations';
import { SecurityAlert, AlertSeverity, AlertStatus, AlertSource } from '../types';

interface SecurityAlertsListProps {
  alerts: SecurityAlert[];
  onRefresh: () => void;
}

export const SecurityAlertsList: React.FC<SecurityAlertsListProps> = ({ alerts, onRefresh }) => {
  const [selectedAlert, setSelectedAlert] = useState<SecurityAlert | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filter, setFilter] = useState<{
    severity: AlertSeverity | 'all';
    status: AlertStatus | 'all';
    source: AlertSource | 'all';
  }>({
    severity: 'all',
    status: 'all',
    source: 'all',
  });

  const acknowledgeAlertFn = useAction(acknowledgeAlert);

  // Helper function to get color based on severity
  const getSeverityColor = (severity: AlertSeverity) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-500 text-white';
      case 'high':
        return 'bg-orange-500 text-white';
      case 'medium':
        return 'bg-yellow-500 text-white';
      case 'low':
        return 'bg-blue-500 text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  };

  // Helper function to get color based on status
  const getStatusColor = (status: AlertStatus) => {
    switch (status) {
      case 'new':
        return 'bg-blue-500 text-white';
      case 'acknowledged':
        return 'bg-yellow-500 text-white';
      case 'resolved':
        return 'bg-green-500 text-white';
      case 'false_positive':
        return 'bg-gray-500 text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  };

  // Helper function to get icon based on source
  const getSourceIcon = (source: AlertSource) => {
    switch (source) {
      case 'scan':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
          </svg>
        );
      case 'monitor':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M3 5a2 2 0 012-2h10a2 2 0 012 2v8a2 2 0 01-2 2h-2.22l.123.489.804.804A1 1 0 0113 18H7a1 1 0 01-.707-1.707l.804-.804L7.22 15H5a2 2 0 01-2-2V5zm5.771 7H5V5h10v7H8.771z" clipRule="evenodd" />
          </svg>
        );
      case 'ai':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M9.504 1.132a1 1 0 01.992 0l1.75 1a1 1 0 11-.992 1.736L10 3.152l-1.254.716a1 1 0 11-.992-1.736l1.75-1zM5.618 4.504a1 1 0 01-.372 1.364L5.016 6l.23.132a1 1 0 11-.992 1.736L4 7.723V8a1 1 0 01-2 0V6a.996.996 0 01.52-.878l1.734-.99a1 1 0 011.364.372zm8.764 0a1 1 0 011.364-.372l1.733.99A1.002 1.002 0 0118 6v2a1 1 0 11-2 0v-.277l-.254.145a1 1 0 11-.992-1.736l.23-.132-.23-.132a1 1 0 01-.372-1.364zm-7 4a1 1 0 011.364-.372L10 8.848l1.254-.716a1 1 0 11.992 1.736L11 10.58V12a1 1 0 11-2 0v-1.42l-1.246-.712a1 1 0 01-.372-1.364zM3 11a1 1 0 011 1v1.42l1.246.712a1 1 0 11-.992 1.736l-1.75-1A1 1 0 012 14v-2a1 1 0 011-1zm14 0a1 1 0 011 1v2a1 1 0 01-.504.868l-1.75 1a1 1 0 11-.992-1.736L16 13.42V12a1 1 0 011-1zm-9.618 5.504a1 1 0 011.364-.372l.254.145V16a1 1 0 112 0v.277l.254-.145a1 1 0 11.992 1.736l-1.735.992a.995.995 0 01-1.022 0l-1.735-.992a1 1 0 01-.372-1.364z" clipRule="evenodd" />
          </svg>
        );
      case 'manual':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
            <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
          </svg>
        );
      case 'integration':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
            <path d="M11 17a1 1 0 001.447.894l4-2A1 1 0 0017 15V9.236a1 1 0 00-1.447-.894l-4 2a1 1 0 00-.553.894V17zM15.211 6.276a1 1 0 000-1.788l-4.764-2.382a1 1 0 00-.894 0L4.789 4.488a1 1 0 000 1.788l4.764 2.382a1 1 0 00.894 0l4.764-2.382zM4.447 8.342A1 1 0 003 9.236V15a1 1 0 00.553.894l4 2A1 1 0 009 17v-5.764a1 1 0 00-.553-.894l-4-2z" />
          </svg>
        );
      default:
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
        );
    }
  };

  // Filter alerts based on selected filters
  const filteredAlerts = alerts.filter((alert) => {
    return (
      (filter.severity === 'all' || alert.severity === filter.severity) &&
      (filter.status === 'all' || alert.status === filter.status) &&
      (filter.source === 'all' || alert.source === filter.source)
    );
  });

  // Handle acknowledging an alert
  const handleAcknowledge = async (alertId: string) => {
    try {
      await acknowledgeAlertFn({ alertId });
      setIsModalOpen(false);
      onRefresh();
    } catch (error) {
      console.error('Error acknowledging alert:', error);
    }
  };

  return (
    <div className="bg-gray-800 rounded-lg shadow-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-white">Security Alerts</h2>
        <button
          onClick={onRefresh}
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-1 px-3 rounded-md text-sm flex items-center"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
          </svg>
          Refresh
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-1">Severity</label>
          <select
            value={filter.severity}
            onChange={(e) => setFilter({ ...filter, severity: e.target.value as AlertSeverity | 'all' })}
            className="bg-gray-700 text-white text-sm rounded-md border border-gray-600 focus:ring-blue-500 focus:border-blue-500 block w-full p-2"
          >
            <option value="all">All</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-1">Status</label>
          <select
            value={filter.status}
            onChange={(e) => setFilter({ ...filter, status: e.target.value as AlertStatus | 'all' })}
            className="bg-gray-700 text-white text-sm rounded-md border border-gray-600 focus:ring-blue-500 focus:border-blue-500 block w-full p-2"
          >
            <option value="all">All</option>
            <option value="new">New</option>
            <option value="acknowledged">Acknowledged</option>
            <option value="resolved">Resolved</option>
            <option value="false_positive">False Positive</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-1">Source</label>
          <select
            value={filter.source}
            onChange={(e) => setFilter({ ...filter, source: e.target.value as AlertSource | 'all' })}
            className="bg-gray-700 text-white text-sm rounded-md border border-gray-600 focus:ring-blue-500 focus:border-blue-500 block w-full p-2"
          >
            <option value="all">All</option>
            <option value="scan">Scan</option>
            <option value="monitor">Monitor</option>
            <option value="ai">AI</option>
            <option value="manual">Manual</option>
            <option value="integration">Integration</option>
          </select>
        </div>
      </div>

      {/* Alerts List */}
      {filteredAlerts.length === 0 ? (
        <div className="bg-gray-700 rounded-lg p-6 text-center">
          <p className="text-gray-400">No alerts match your filters</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredAlerts.map((alert) => (
            <div
              key={alert.id}
              className="bg-gray-700 rounded-lg p-4 border border-gray-600 hover:border-blue-500 cursor-pointer transition-colors"
              onClick={() => {
                setSelectedAlert(alert);
                setIsModalOpen(true);
              }}
            >
              <div className="flex justify-between items-start">
                <div className="flex items-start">
                  <div className={`rounded-full h-3 w-3 mt-1.5 mr-3 ${getSeverityColor(alert.severity)}`}></div>
                  <div>
                    <h3 className="text-white font-medium">{alert.title}</h3>
                    <p className="text-gray-400 text-sm mt-1">{alert.description}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(alert.status)}`}>
                    {alert.status}
                  </span>
                  <span className="text-xs text-gray-400">
                    {new Date(alert.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
              <div className="flex justify-between items-center mt-3 text-xs text-gray-400">
                <div className="flex items-center">
                  <div className="text-blue-400 mr-1">
                    {getSourceIcon(alert.source)}
                  </div>
                  <span>{alert.source}</span>
                </div>
                {alert.status === 'new' && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAcknowledge(alert.id);
                    }}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-2 py-1 rounded text-xs"
                  >
                    Acknowledge
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Alert Detail Modal */}
      {isModalOpen && selectedAlert && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 max-w-2xl w-full mx-4">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center">
                <div className={`rounded-full h-3 w-3 mr-3 ${getSeverityColor(selectedAlert.severity)}`}></div>
                <h2 className="text-xl font-bold text-white">{selectedAlert.title}</h2>
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
            <div className="mb-4">
              <p className="text-gray-300">{selectedAlert.description}</p>
            </div>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <h3 className="text-sm font-medium text-gray-400 mb-1">Severity</h3>
                <div className={`inline-block px-2 py-1 rounded-full text-xs ${getSeverityColor(selectedAlert.severity)}`}>
                  {selectedAlert.severity}
                </div>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-400 mb-1">Status</h3>
                <div className={`inline-block px-2 py-1 rounded-full text-xs ${getStatusColor(selectedAlert.status)}`}>
                  {selectedAlert.status}
                </div>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-400 mb-1">Source</h3>
                <div className="flex items-center">
                  <div className="text-blue-400 mr-1">
                    {getSourceIcon(selectedAlert.source)}
                  </div>
                  <span className="text-white">{selectedAlert.source}</span>
                </div>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-400 mb-1">Created</h3>
                <div className="text-white">
                  {new Date(selectedAlert.createdAt).toLocaleString()}
                </div>
              </div>
            </div>
            {selectedAlert.metadata && (
              <div className="mb-4">
                <h3 className="text-sm font-medium text-gray-400 mb-1">Additional Information</h3>
                <div className="bg-gray-700 rounded-lg p-3 border border-gray-600">
                  <pre className="text-xs text-gray-300 overflow-auto">
                    {JSON.stringify(selectedAlert.metadata, null, 2)}
                  </pre>
                </div>
              </div>
            )}
            <div className="flex justify-end space-x-3">
              {selectedAlert.status === 'new' && (
                <button
                  onClick={() => handleAcknowledge(selectedAlert.id)}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md"
                >
                  Acknowledge
                </button>
              )}
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
    </div>
  );
};
