import React, { useState, useEffect } from 'react';
import { useQuery } from 'wasp/client/operations';
import { getSecurityMetrics } from 'wasp/client/operations';
import { formatDistanceToNow } from 'date-fns';

interface MaintenanceMetric {
  id: string;
  name: string;
  value: number;
  previousValue: number | null;
  percentChange: number | null;
  metadata: any;
  createdAt: string;
  updatedAt: string;
}

const MaintenanceDashboard: React.FC = () => {
  const [maintenanceMetrics, setMaintenanceMetrics] = useState<MaintenanceMetric[]>([]);
  const { data: metrics, isLoading, error } = useQuery(getSecurityMetrics);

  useEffect(() => {
    if (metrics) {
      // Filter for maintenance-related metrics
      const maintenanceMetricsData = metrics.filter(
        (metric: any) => 
          metric.category === 'maintenance' || 
          metric.name.includes('_cleaned') || 
          metric.name.includes('_archived') || 
          metric.name.includes('_rotated') || 
          metric.name.includes('_regenerated') ||
          metric.name.includes('_status') ||
          metric.name.includes('_duration') ||
          metric.name.includes('_items_processed') ||
          metric.name.includes('last_') && metric.name.includes('_run')
      );
      
      setMaintenanceMetrics(maintenanceMetricsData);
    }
  }, [metrics]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
        <strong className="font-bold">Error!</strong>
        <span className="block sm:inline"> Failed to load maintenance metrics.</span>
      </div>
    );
  }

  // Group metrics by job type
  const jobMetrics: Record<string, MaintenanceMetric[]> = {};
  
  maintenanceMetrics.forEach((metric) => {
    const jobType = metric.metadata?.jobType || getJobTypeFromMetricName(metric.name);
    if (!jobMetrics[jobType]) {
      jobMetrics[jobType] = [];
    }
    jobMetrics[jobType].push(metric);
  });

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">System Maintenance Status</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {renderSummaryCards(maintenanceMetrics)}
      </div>
      
      <div className="space-y-6">
        {Object.keys(jobMetrics).length > 0 ? (
          Object.entries(jobMetrics).map(([jobType, metrics]) => (
            <JobStatusCard key={jobType} jobType={jobType} metrics={metrics} />
          ))
        ) : (
          <div className="text-center text-gray-500 py-8">
            No maintenance jobs have been executed yet.
          </div>
        )}
      </div>
    </div>
  );
};

const renderSummaryCards = (metrics: MaintenanceMetric[]) => {
  // Find the latest run times for each job type
  const lastRunTimes: Record<string, number> = {};
  const jobStatuses: Record<string, number> = {};
  
  metrics.forEach((metric) => {
    if (metric.name.includes('last_') && metric.name.includes('_run')) {
      const jobType = metric.name.replace('last_', '').replace('_run', '');
      lastRunTimes[jobType] = metric.value;
    }
    
    if (metric.name.includes('_status')) {
      const jobType = metric.name.replace('_status', '');
      jobStatuses[jobType] = metric.value;
    }
  });
  
  // Calculate overall health score (0-100)
  const jobTypes = Object.keys(jobStatuses);
  const healthScore = jobTypes.length > 0
    ? Math.round(Object.values(jobStatuses).reduce((sum, val) => sum + val, 0) / jobTypes.length * 100)
    : 100;
  
  // Count items processed
  const itemsProcessed = metrics
    .filter(m => m.name.includes('_items_processed'))
    .reduce((sum, metric) => sum + metric.value, 0);
  
  // Count jobs with errors
  const jobsWithErrors = Object.values(jobStatuses).filter(status => status < 1).length;
  
  return (
    <>
      <SummaryCard 
        title="System Health" 
        value={`${healthScore}%`} 
        icon="🔋"
        color={healthScore > 80 ? 'green' : healthScore > 50 ? 'yellow' : 'red'}
      />
      <SummaryCard 
        title="Items Processed" 
        value={formatNumber(itemsProcessed)} 
        icon="📊"
        color="blue"
      />
      <SummaryCard 
        title="Jobs With Errors" 
        value={jobsWithErrors.toString()} 
        icon="⚠️"
        color={jobsWithErrors === 0 ? 'green' : 'red'}
      />
      <SummaryCard 
        title="Last Maintenance" 
        value={getLastMaintenanceTime(lastRunTimes)} 
        icon="🕒"
        color="purple"
      />
    </>
  );
};

const SummaryCard: React.FC<{ title: string; value: string; icon: string; color: string }> = ({ 
  title, value, icon, color 
}) => {
  const colorClasses = {
    blue: 'bg-blue-100 text-blue-800',
    green: 'bg-green-100 text-green-800',
    yellow: 'bg-yellow-100 text-yellow-800',
    red: 'bg-red-100 text-red-800',
    purple: 'bg-purple-100 text-purple-800',
  };
  
  return (
    <div className="bg-white rounded-lg border p-4 flex items-center">
      <div className={`rounded-full p-3 mr-4 ${colorClasses[color as keyof typeof colorClasses]}`}>
        <span className="text-xl">{icon}</span>
      </div>
      <div>
        <h3 className="text-gray-500 text-sm font-medium">{title}</h3>
        <p className="text-gray-900 text-lg font-semibold">{value}</p>
      </div>
    </div>
  );
};

const JobStatusCard: React.FC<{ jobType: string; metrics: MaintenanceMetric[] }> = ({ 
  jobType, metrics 
}) => {
  // Find status metric
  const statusMetric = metrics.find(m => m.name.includes('_status'));
  const status = statusMetric ? statusMetric.value : null;
  
  // Find duration metric
  const durationMetric = metrics.find(m => m.name.includes('_duration'));
  const duration = durationMetric ? durationMetric.value : null;
  
  // Find items processed metric
  const itemsProcessedMetric = metrics.find(m => m.name.includes('_items_processed'));
  const itemsProcessed = itemsProcessedMetric ? itemsProcessedMetric.value : null;
  
  // Find last run metric
  const lastRunMetric = metrics.find(m => m.name.includes('last_') && m.name.includes('_run'));
  const lastRun = lastRunMetric ? new Date(lastRunMetric.value) : null;
  
  // Determine status color
  const statusColor = status === null ? 'gray' : 
                      status === 1 ? 'green' : 
                      status >= 0.5 ? 'yellow' : 'red';
  
  // Format job type for display
  const displayJobType = formatJobType(jobType);
  
  return (
    <div className="border rounded-lg overflow-hidden">
      <div className={`px-4 py-3 flex justify-between items-center bg-${statusColor}-50 border-b`}>
        <h3 className="font-medium text-gray-800">{displayJobType}</h3>
        <div className={`px-2 py-1 rounded text-xs font-medium bg-${statusColor}-100 text-${statusColor}-800`}>
          {getStatusText(status)}
        </div>
      </div>
      <div className="p-4 grid grid-cols-3 gap-4">
        <div>
          <p className="text-sm text-gray-500">Last Run</p>
          <p className="font-medium">
            {lastRun ? formatDistanceToNow(lastRun, { addSuffix: true }) : 'Never'}
          </p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Duration</p>
          <p className="font-medium">
            {duration ? formatDuration(duration) : 'N/A'}
          </p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Items Processed</p>
          <p className="font-medium">
            {itemsProcessed !== null ? formatNumber(itemsProcessed) : 'N/A'}
          </p>
        </div>
      </div>
    </div>
  );
};

// Helper functions
const getJobTypeFromMetricName = (name: string): string => {
  if (name.includes('stale_logs')) return 'stale_log_cleanup';
  if (name.includes('data_archiving')) return 'data_archiving';
  if (name.includes('audit_snapshot')) return 'audit_snapshot_rotation';
  if (name.includes('metrics_regeneration')) return 'metrics_regeneration';
  if (name.includes('log_rotation')) return 'log_rotation';
  return 'maintenance';
};

const formatJobType = (jobType: string): string => {
  return jobType
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

const getStatusText = (status: number | null): string => {
  if (status === null) return 'Unknown';
  if (status === 1) return 'Success';
  if (status >= 0.5) return 'Partial';
  return 'Failed';
};

const formatNumber = (num: number): string => {
  return new Intl.NumberFormat().format(num);
};

const formatDuration = (ms: number): string => {
  const seconds = Math.floor(ms / 1000);
  if (seconds < 60) return `${seconds}s`;
  
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  if (minutes < 60) return `${minutes}m ${remainingSeconds}s`;
  
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return `${hours}h ${remainingMinutes}m`;
};

const getLastMaintenanceTime = (lastRunTimes: Record<string, number>): string => {
  if (Object.keys(lastRunTimes).length === 0) return 'Never';
  
  const mostRecent = Math.max(...Object.values(lastRunTimes));
  return formatDistanceToNow(new Date(mostRecent), { addSuffix: true });
};

export default MaintenanceDashboard;
