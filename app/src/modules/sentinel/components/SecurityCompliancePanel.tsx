import React, { useState } from 'react';
import { ComplianceCheck, ComplianceStandard, ComplianceStatus } from '../types';

interface SecurityCompliancePanelProps {
  complianceChecks: ComplianceCheck[];
}

export const SecurityCompliancePanel: React.FC<SecurityCompliancePanelProps> = ({ complianceChecks }) => {
  const [activeStandard, setActiveStandard] = useState<ComplianceStandard | 'all'>('all');
  const [activeStatus, setActiveStatus] = useState<ComplianceStatus | 'all'>('all');

  // Group compliance checks by standard
  const checksByStandard = complianceChecks.reduce((acc, check) => {
    if (!acc[check.standard]) {
      acc[check.standard] = [];
    }
    acc[check.standard].push(check);
    return acc;
  }, {} as Record<string, ComplianceCheck[]>);

  // Get standards from checks
  const standards = Object.keys(checksByStandard) as ComplianceStandard[];

  // Filter checks based on active standard and status
  const filteredChecks = complianceChecks.filter((check) => {
    return (
      (activeStandard === 'all' || check.standard === activeStandard) &&
      (activeStatus === 'all' || check.status === activeStatus)
    );
  });

  // Calculate compliance percentages
  const calculateCompliancePercentage = (standard: ComplianceStandard | 'all') => {
    const checks = standard === 'all' 
      ? complianceChecks 
      : checksByStandard[standard] || [];
    
    if (checks.length === 0) return 0;
    
    const compliantCount = checks.filter(check => check.status === 'compliant').length;
    return Math.round((compliantCount / checks.length) * 100);
  };

  // Helper function to get color based on compliance status
  const getStatusColor = (status: ComplianceStatus) => {
    switch (status) {
      case 'compliant':
        return 'bg-green-500 text-white';
      case 'non_compliant':
        return 'bg-red-500 text-white';
      case 'partial':
        return 'bg-yellow-500 text-white';
      case 'not_applicable':
        return 'bg-gray-500 text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  };

  // Helper function to get color based on compliance percentage
  const getPercentageColor = (percentage: number) => {
    if (percentage >= 90) return 'text-green-500';
    if (percentage >= 70) return 'text-yellow-500';
    return 'text-red-500';
  };

  // Helper function to format standard name
  const formatStandardName = (standard: ComplianceStandard) => {
    switch (standard) {
      case 'GDPR':
        return 'GDPR';
      case 'HIPAA':
        return 'HIPAA';
      case 'PCI-DSS':
        return 'PCI-DSS';
      case 'SOC2':
        return 'SOC 2';
      case 'ISO27001':
        return 'ISO 27001';
      case 'NIST':
        return 'NIST';
      default:
        return standard;
    }
  };

  return (
    <div className="bg-gray-800 rounded-lg shadow-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-white">Compliance Status</h2>
        <div className="text-sm text-gray-400">
          Overall: <span className={getPercentageColor(calculateCompliancePercentage('all'))}>
            {calculateCompliancePercentage('all')}%
          </span>
        </div>
      </div>

      {/* Compliance Overview */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
        <div 
          className={`bg-gray-700 rounded-lg p-3 border ${
            activeStandard === 'all' ? 'border-blue-500' : 'border-gray-600'
          } cursor-pointer hover:border-blue-500 transition-colors`}
          onClick={() => setActiveStandard('all')}
        >
          <h3 className="text-sm font-medium text-gray-300 mb-1">All Standards</h3>
          <div className="flex justify-between items-end">
            <div className={`text-lg font-bold ${getPercentageColor(calculateCompliancePercentage('all'))}`}>
              {calculateCompliancePercentage('all')}%
            </div>
            <div className="text-xs text-gray-400">
              {complianceChecks.length} checks
            </div>
          </div>
        </div>
        
        {standards.map((standard) => (
          <div 
            key={standard}
            className={`bg-gray-700 rounded-lg p-3 border ${
              activeStandard === standard ? 'border-blue-500' : 'border-gray-600'
            } cursor-pointer hover:border-blue-500 transition-colors`}
            onClick={() => setActiveStandard(standard)}
          >
            <h3 className="text-sm font-medium text-gray-300 mb-1">{formatStandardName(standard)}</h3>
            <div className="flex justify-between items-end">
              <div className={`text-lg font-bold ${getPercentageColor(calculateCompliancePercentage(standard))}`}>
                {calculateCompliancePercentage(standard)}%
              </div>
              <div className="text-xs text-gray-400">
                {checksByStandard[standard].length} checks
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Status Filters */}
      <div className="flex space-x-2 mb-6">
        <button
          onClick={() => setActiveStatus('all')}
          className={`px-3 py-1 text-sm rounded-md ${
            activeStatus === 'all' 
              ? 'bg-blue-600 text-white' 
              : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
          }`}
        >
          All
        </button>
        <button
          onClick={() => setActiveStatus('compliant')}
          className={`px-3 py-1 text-sm rounded-md ${
            activeStatus === 'compliant' 
              ? 'bg-green-600 text-white' 
              : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
          }`}
        >
          Compliant
        </button>
        <button
          onClick={() => setActiveStatus('non_compliant')}
          className={`px-3 py-1 text-sm rounded-md ${
            activeStatus === 'non_compliant' 
              ? 'bg-red-600 text-white' 
              : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
          }`}
        >
          Non-Compliant
        </button>
        <button
          onClick={() => setActiveStatus('partial')}
          className={`px-3 py-1 text-sm rounded-md ${
            activeStatus === 'partial' 
              ? 'bg-yellow-600 text-white' 
              : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
          }`}
        >
          Partial
        </button>
        <button
          onClick={() => setActiveStatus('not_applicable')}
          className={`px-3 py-1 text-sm rounded-md ${
            activeStatus === 'not_applicable' 
              ? 'bg-gray-600 text-white' 
              : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
          }`}
        >
          N/A
        </button>
      </div>

      {/* Compliance Checks List */}
      {filteredChecks.length === 0 ? (
        <div className="bg-gray-700 rounded-lg p-6 text-center">
          <p className="text-gray-400">No compliance checks match your filters</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredChecks.map((check) => (
            <div
              key={check.id}
              className="bg-gray-700 rounded-lg p-4 border border-gray-600"
            >
              <div className="flex justify-between items-start">
                <div className="flex items-start">
                  <div className={`rounded-full h-3 w-3 mt-1.5 mr-3 ${
                    check.status === 'compliant' ? 'bg-green-500' :
                    check.status === 'non_compliant' ? 'bg-red-500' :
                    check.status === 'partial' ? 'bg-yellow-500' :
                    'bg-gray-500'
                  }`}></div>
                  <div>
                    <div className="flex items-center">
                      <span className="text-white font-medium">{formatStandardName(check.standard)}</span>
                      <span className="text-gray-400 mx-2">|</span>
                      <span className="text-gray-300">{check.control}</span>
                      <span className={`ml-3 text-xs px-2 py-0.5 rounded-full ${getStatusColor(check.status)}`}>
                        {check.status.replace('_', ' ')}
                      </span>
                    </div>
                    <p className="text-gray-400 text-sm mt-1">{check.description}</p>
                    {check.evidence && (
                      <div className="mt-2 p-2 bg-gray-800 rounded border border-gray-600">
                        <p className="text-gray-300 text-xs italic">{check.evidence}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
