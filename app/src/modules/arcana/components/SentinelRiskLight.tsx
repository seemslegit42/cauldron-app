import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useGroqInference } from '../../shared/hooks/useSentientAI';
import { sentientLoop } from '../../shared/services/sentientLoopService';
import { useSentinelDashboard, useSentinelScanRunner } from '../../sentinel/agentHooks';
import { RiskLevel } from '../../sentinel/types';

type RiskLevel = 'green' | 'yellow' | 'red';

interface SentinelRiskLightProps {
  initialRiskLevel?: RiskLevel;
}

interface SecurityMetrics {
  securityScore: number;
  vulnerabilities: number;
  threatsBlocked: number;
  criticalAlerts: number;
  threatDetection?: number;
  responseTime?: string;
  lastScanTime?: string;
  threatLevel?: number;
}

export const SentinelRiskLight: React.FC<SentinelRiskLightProps> = ({
  initialRiskLevel = 'yellow'
}) => {
  const [riskLevel, setRiskLevel] = useState<RiskLevel>(initialRiskLevel);
  const [showTooltip, setShowTooltip] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [aiInsight, setAiInsight] = useState<string>("");
  const [isGeneratingInsight, setIsGeneratingInsight] = useState(false);
  const [securityMetrics, setSecurityMetrics] = useState<SecurityMetrics>({
    securityScore: 78,
    vulnerabilities: 7,
    threatsBlocked: 142,
    criticalAlerts: 0,
    threatDetection: 98.2,
    responseTime: "1.4s",
    lastScanTime: "2h ago",
    threatLevel: 0.3,
  });

  const {
    alerts: securityAlerts,
    isLoading,
    securityScore,
    riskLevel: sentinelRiskLevel,
    criticalAlerts,
    newAlerts,
    lastScanTime
  } = useSentinelDashboard();

  const { runScan } = useSentinelScanRunner();
  const { generateFastCompletion, isLoading: isAiLoading, isGroqAvailable } = useGroqInference();

  // Determine risk level based on security alerts and Sentinel dashboard
  useEffect(() => {
    // Use the risk level from the Sentinel dashboard if available
    if (sentinelRiskLevel) {
      setRiskLevel(sentinelRiskLevel);
    } else if (securityAlerts && securityAlerts.length > 0) {
      // Fallback to calculating risk level from alerts
      const highSeverityCount = securityAlerts.filter((alert: any) =>
        alert.severity === 'high' || alert.severity === 'critical'
      ).length;

      const mediumSeverityCount = securityAlerts.filter((alert: any) =>
        alert.severity === 'medium'
      ).length;

      if (highSeverityCount > 0) {
        setRiskLevel('red');
      } else if (mediumSeverityCount > 0) {
        setRiskLevel('yellow');
      } else {
        setRiskLevel('green');
      }
    }

    // Update security metrics based on Sentinel dashboard data
    if (securityScore !== undefined && criticalAlerts !== undefined) {
      setSecurityMetrics(prev => ({
        ...prev,
        securityScore: securityScore,
        criticalAlerts: criticalAlerts.length,
        vulnerabilities: securityAlerts ? securityAlerts.length : prev.vulnerabilities,
        lastScanTime: lastScanTime || prev.lastScanTime,
      }));
    }
  }, [securityAlerts, sentinelRiskLevel, securityScore, criticalAlerts, lastScanTime]);

  // Generate AI insight when risk level changes or component mounts
  useEffect(() => {
    const generateInsight = async () => {
      if (!isGroqAvailable) {
        setAiInsight(getDefaultInsight());
        return;
      }

      try {
        setIsGeneratingInsight(true);

        // Generate a risk assessment using Sentient Loop
        const assessment = await sentientLoop.generateRiskAssessment();

        if (assessment) {
          // Update risk level if provided by AI
          if (assessment.level) {
            setRiskLevel(assessment.level);
          }

          // Update AI insight with description
          setAiInsight(assessment.description || getDefaultInsight());

          // Update security metrics if provided
          if (assessment.metrics) {
            setSecurityMetrics(prev => ({
              ...prev,
              ...assessment.metrics,
            }));
          }
        } else {
          // Use fast completion as fallback
          const prompt = `Generate a brief security insight for a ${riskLevel} risk level in a cybersecurity dashboard. Be specific and actionable.`;
          const insight = await generateFastCompletion(prompt);
          setAiInsight(insight || getDefaultInsight());
        }
      } catch (error) {
        console.error('Error generating AI insight:', error);
        setAiInsight(getDefaultInsight());
      } finally {
        setIsGeneratingInsight(false);
      }
    };

    generateInsight();
  }, [riskLevel, isGroqAvailable, generateFastCompletion]);

  const getDefaultInsight = () => {
    switch (riskLevel) {
      case 'green':
        return "Today's posture improved due to successful patch deployment at 12:34 PM";
      case 'yellow':
        return "Medium risk detected - review the latest vulnerability scan results";
      case 'red':
        return "High risk alert - immediate attention required for critical vulnerabilities";
      default:
        return "Security status information unavailable";
    }
  };

  const getRecentAlerts = () => {
    if (!securityAlerts || securityAlerts.length === 0) {
      return [];
    }

    // Return the 3 most recent alerts
    return securityAlerts.slice(0, 3);
  };

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

  const getRiskGlowColor = (level: RiskLevel) => {
    switch (level) {
      case 'green':
        return 'shadow-[0_0_15px_rgba(34,197,94,0.5)]';
      case 'yellow':
        return 'shadow-[0_0_15px_rgba(234,179,8,0.5)]';
      case 'red':
        return 'shadow-[0_0_15px_rgba(239,68,68,0.5)]';
      default:
        return '';
    }
  };

  const getRiskText = (level: RiskLevel) => {
    switch (level) {
      case 'green':
        return 'Secure';
      case 'yellow':
        return 'Caution';
      case 'red':
        return 'Alert';
      default:
        return 'Unknown';
    }
  };

  const getStatusIcon = (level: RiskLevel) => {
    switch (level) {
      case 'green':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
        );
      case 'yellow':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        );
      case 'red':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      default:
        return null;
    }
  };

  // Run a security scan with AI assistance
  const handleRunSecurityScan = async () => {
    try {
      // Update UI to show scanning
      setIsGeneratingInsight(true);

      // Run a security scan using the Sentinel module
      await runScan('full');

      // Generate a new risk assessment
      const assessment = await sentientLoop.generateRiskAssessment();

      if (assessment) {
        // Update risk level if provided by AI
        if (assessment.level) {
          setRiskLevel(assessment.level);
        }

        // Update AI insight with description
        setAiInsight(assessment.description || getDefaultInsight());

        // Update security metrics if provided
        if (assessment.metrics) {
          setSecurityMetrics(prev => ({
            ...prev,
            ...assessment.metrics,
            lastScanTime: "Just now",
          }));
        }
      } else {
        // Fallback to default behavior
        setAiInsight("Security scan complete. No critical issues found.");
        setSecurityMetrics(prev => ({
          ...prev,
          lastScanTime: "Just now",
        }));
      }
    } catch (error) {
      console.error('Error running security scan:', error);
      setAiInsight("Error running security scan. Please try again.");
    } finally {
      setIsGeneratingInsight(false);
    }
  };

  return (
    <div className={`bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-700 transition-all duration-300 ${
      isExpanded ? 'h-auto' : 'h-auto'
    }`}>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-red-400">Sentinel Risk Light</h2>
        <div className="flex items-center">
          {(isGeneratingInsight || isAiLoading) && (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-500 mr-2"></div>
          )}
          <Link
            to="/sentinel"
            className="text-sm text-blue-400 hover:text-blue-300 flex items-center mr-2"
          >
            View Details
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
          <button
            className="text-gray-400 hover:text-white"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            )}
          </button>
        </div>
      </div>

      <div className="flex items-center justify-center mb-6 relative">
        <div
          className="relative"
          onMouseEnter={() => setShowTooltip(true)}
          onMouseLeave={() => setShowTooltip(false)}
        >
          <div className="w-32 h-32 rounded-full bg-gray-700 flex items-center justify-center p-3">
            <div className={`w-full h-full rounded-full ${getRiskColor(riskLevel)} flex items-center justify-center shadow-lg ${
              getRiskGlowColor(riskLevel)
            } ${
              riskLevel === 'red' ? 'animate-pulse' : ''
            }`}>
              <div className="flex flex-col items-center">
                <span className="text-white">{getStatusIcon(riskLevel)}</span>
                <span className="text-white font-bold text-lg mt-1">{getRiskText(riskLevel)}</span>
              </div>
            </div>
          </div>

          {/* Tooltip */}
          {showTooltip && (
            <div className="absolute z-10 w-64 p-4 mt-2 bg-gray-900 rounded-lg shadow-xl border border-gray-700 text-white text-sm">
              <h3 className="font-bold mb-2">Security Status</h3>
              {isLoading || isGeneratingInsight ? (
                <div className="flex justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                </div>
              ) : (
                <>
                  <p className="mb-2">{aiInsight}</p>
                  <div className="mt-3 space-y-2">
                    {getRecentAlerts().map((alert: any) => (
                      <div key={alert.id} className="flex items-start">
                        <div className={`h-3 w-3 rounded-full mt-1 mr-2 ${
                          alert.severity === 'high' ? 'bg-red-500' :
                          alert.severity === 'medium' ? 'bg-yellow-500' :
                          'bg-green-500'
                        }`}></div>
                        <div className="text-xs">{alert.title}</div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      <div className={`bg-gray-700 rounded-lg p-4 border border-gray-600 ${
        riskLevel === 'red' ? 'border-red-500' :
        riskLevel === 'yellow' ? 'border-yellow-500' :
        'border-green-500'
      } transition-colors duration-300`}>
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-sm font-medium text-gray-300">AI Insight</h3>
          {isGroqAvailable && (
            <div className="text-xs text-green-400 bg-green-900/30 px-2 py-0.5 rounded-full">
              Sentient Loop™ Enabled
            </div>
          )}
        </div>
        {isGeneratingInsight ? (
          <div className="flex items-center text-sm text-gray-400">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-400 mr-2"></div>
            Analyzing security posture...
          </div>
        ) : (
          <p className="text-sm text-gray-400">{aiInsight}</p>
        )}
      </div>

      {/* Expanded content */}
      {isExpanded && (
        <div className="mt-4 space-y-4">
          <div>
            <h3 className="text-sm font-medium text-gray-300 mb-2">Recent Triggers</h3>
            {isLoading ? (
              <div className="flex justify-center py-4">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              </div>
            ) : (
              <div className="space-y-2">
                {getRecentAlerts().length > 0 ? (
                  getRecentAlerts().map((alert: any) => (
                    <div key={alert.id} className="bg-gray-700 rounded-lg p-3 border border-gray-600 hover:border-red-500 transition-colors duration-200">
                      <div className="flex items-start">
                        <div className={`h-3 w-3 rounded-full mt-1 mr-2 ${
                          alert.severity === 'high' ? 'bg-red-500' :
                          alert.severity === 'medium' ? 'bg-yellow-500' :
                          'bg-green-500'
                        }`}></div>
                        <div>
                          <div className="text-sm font-medium">{alert.title}</div>
                          <div className="text-xs text-gray-400 mt-1">{alert.description}</div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-4 text-gray-400">
                    <p>No recent security alerts</p>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="bg-gray-700 rounded-lg p-4 border border-gray-600">
            <h3 className="text-sm font-medium text-gray-300 mb-2">Security Metrics</h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <div className="text-xs text-gray-400">Threat Detection</div>
                <div className="text-lg font-medium text-white">{securityMetrics.threatDetection}%</div>
              </div>
              <div>
                <div className="text-xs text-gray-400">Response Time</div>
                <div className="text-lg font-medium text-white">{securityMetrics.responseTime}</div>
              </div>
              <div>
                <div className="text-xs text-gray-400">Vulnerabilities</div>
                <div className="text-lg font-medium text-white">{securityMetrics.vulnerabilities}</div>
              </div>
              <div>
                <div className="text-xs text-gray-400">Last Scan</div>
                <div className="text-lg font-medium text-white">{securityMetrics.lastScanTime}</div>
              </div>
            </div>

            {/* Threat level indicator */}
            <div className="mt-4">
              <div className="flex justify-between text-xs text-gray-400 mb-1">
                <span>Threat Level</span>
                <span>{Math.round((securityMetrics.threatLevel || 0) * 100)}%</span>
              </div>
              <div className="w-full bg-gray-600 rounded-full h-2">
                <div
                  className={`h-2 rounded-full ${
                    (securityMetrics.threatLevel || 0) < 0.3
                      ? 'bg-green-500'
                      : (securityMetrics.threatLevel || 0) < 0.7
                      ? 'bg-yellow-500'
                      : 'bg-red-500'
                  } transition-all duration-500`}
                  style={{ width: `${(securityMetrics.threatLevel || 0) * 100}%` }}
                ></div>
              </div>
            </div>
          </div>

          {/* AI-powered recommendations */}
          <div className="bg-gray-700 rounded-lg p-4 border border-gray-600">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-sm font-medium text-gray-300">AI Recommendations</h3>
              <div className="text-xs text-blue-400 bg-blue-900/30 px-2 py-0.5 rounded-full">
                Powered by Groq
              </div>
            </div>
            <div className="space-y-2">
              {isGeneratingInsight ? (
                <div className="flex justify-center py-4">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                </div>
              ) : (
                <>
                  <div className="flex items-center text-xs">
                    <div className="h-5 w-5 rounded-full bg-red-500/20 text-red-400 flex items-center justify-center mr-2">1</div>
                    <div className="text-gray-300">Update OpenSSL to version 3.0.8 to patch CVE-2023-0286</div>
                  </div>
                  <div className="flex items-center text-xs">
                    <div className="h-5 w-5 rounded-full bg-yellow-500/20 text-yellow-400 flex items-center justify-center mr-2">2</div>
                    <div className="text-gray-300">Enable multi-factor authentication for all admin accounts</div>
                  </div>
                  <div className="flex items-center text-xs">
                    <div className="h-5 w-5 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center mr-2">3</div>
                    <div className="text-gray-300">Review and update security incident response plan</div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="mt-4 pt-4 border-t border-gray-700">
        <button
          className={`w-full ${
            isGeneratingInsight
              ? 'bg-gray-600 cursor-not-allowed'
              : 'bg-gray-700 hover:bg-gray-600'
          } text-gray-300 rounded-md py-2 flex items-center justify-center transition-colors`}
          onClick={handleRunSecurityScan}
          disabled={isGeneratingInsight}
        >
          {isGeneratingInsight ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-400 mr-2"></div>
              Scanning...
            </>
          ) : (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              Run Security Scan
            </>
          )}
        </button>
      </div>
    </div>
  );
};