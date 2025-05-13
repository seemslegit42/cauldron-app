import React, { useState, useEffect } from 'react';
import Chart from 'react-apexcharts';
import { ApexOptions } from 'apexcharts';

interface KeyMetricsBoardProps {
  metrics: any;
}

type MetricCategory = 'business' | 'security' | 'social' | 'media';

export const KeyMetricsBoard: React.FC<KeyMetricsBoardProps> = ({ metrics }) => {
  const [activeCategory, setActiveCategory] = useState<MetricCategory>('business');
  const [timeRange, setTimeRange] = useState<'day' | 'week' | 'month'>('week');
  const [isCustomizing, setIsCustomizing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Simulate loading when changing categories or time range
  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 800);
    return () => clearTimeout(timer);
  }, [activeCategory, timeRange]);

  // Sample chart data - in a real app, this would come from the backend
  const lineChartOptions: ApexOptions = {
    chart: {
      type: 'line',
      toolbar: {
        show: false,
      },
      background: 'transparent',
      animations: {
        enabled: true,
        easing: 'easeinout',
        speed: 800,
        animateGradually: {
          enabled: true,
          delay: 150
        },
        dynamicAnimation: {
          enabled: true,
          speed: 350
        }
      }
    },
    stroke: {
      curve: 'smooth',
      width: 3,
    },
    colors: ['#3B82F6', '#10B981', '#F59E0B', '#EF4444'],
    grid: {
      borderColor: '#374151',
      strokeDashArray: 5,
      xaxis: {
        lines: {
          show: true
        }
      },
      yaxis: {
        lines: {
          show: true
        }
      },
    },
    xaxis: {
      categories: timeRange === 'day' 
        ? ['9AM', '10AM', '11AM', '12PM', '1PM', '2PM', '3PM', '4PM', '5PM'] 
        : timeRange === 'week'
        ? ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
        : ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
      labels: {
        style: {
          colors: '#9CA3AF',
        },
      },
      axisBorder: {
        show: false,
      },
      axisTicks: {
        show: false,
      },
    },
    yaxis: {
      labels: {
        style: {
          colors: '#9CA3AF',
        },
        formatter: function(value) {
          if (activeCategory === 'business') {
            return '$' + value.toFixed(0);
          }
          return value.toFixed(0);
        }
      },
    },
    tooltip: {
      theme: 'dark',
      x: {
        show: true
      },
      y: {
        formatter: function(value) {
          if (activeCategory === 'business') {
            return '$' + value.toFixed(0);
          }
          return value.toFixed(0);
        }
      }
    },
    legend: {
      position: 'top',
      horizontalAlign: 'right',
      labels: {
        colors: '#D1D5DB',
      },
    },
    dataLabels: {
      enabled: false,
    },
    theme: {
      mode: 'dark',
    },
    markers: {
      size: 4,
      strokeWidth: 0,
      hover: {
        size: 6
      }
    }
  };

  const businessSeries = [
    {
      name: 'Revenue',
      data: timeRange === 'day' 
        ? [1200, 1800, 2100, 2400, 2000, 2200, 2600, 2900, 3100]
        : timeRange === 'week'
        ? [3100, 4000, 2800, 5100, 4200, 10900, 10000]
        : [12000, 15000, 18000, 22000],
    },
    {
      name: 'Conversions',
      data: timeRange === 'day'
        ? [5, 8, 12, 15, 10, 12, 18, 20, 22]
        : timeRange === 'week'
        ? [11, 32, 45, 32, 34, 52, 41]
        : [120, 150, 180, 210],
    },
    {
      name: 'Growth',
      data: timeRange === 'day'
        ? [2, 3, 4, 5, 4, 5, 6, 7, 8]
        : timeRange === 'week'
        ? [5, 8, 12, 8, 10, 15, 20]
        : [10, 12, 15, 18],
    },
  ];

  const securitySeries = [
    {
      name: 'Threats Detected',
      data: timeRange === 'day'
        ? [3, 5, 4, 6, 2, 3, 5, 4, 2]
        : timeRange === 'week'
        ? [10, 15, 8, 12, 5, 7, 9]
        : [35, 28, 42, 30],
    },
    {
      name: 'Vulnerabilities',
      data: timeRange === 'day'
        ? [2, 1, 2, 3, 1, 0, 1, 2, 1]
        : timeRange === 'week'
        ? [5, 4, 3, 6, 2, 1, 3]
        : [15, 12, 10, 8],
    },
    {
      name: 'Security Score',
      data: timeRange === 'day'
        ? [70, 72, 73, 75, 76, 78, 79, 80, 82]
        : timeRange === 'week'
        ? [65, 68, 70, 72, 75, 78, 80]
        : [60, 68, 75, 82],
    },
  ];

  const socialSeries = [
    {
      name: 'Engagement',
      data: timeRange === 'day'
        ? [50, 65, 80, 95, 85, 90, 110, 120, 130]
        : timeRange === 'week'
        ? [120, 150, 180, 220, 210, 250, 300]
        : [500, 650, 800, 950],
    },
    {
      name: 'Reach',
      data: timeRange === 'day'
        ? [500, 600, 700, 800, 750, 850, 900, 950, 1000]
        : timeRange === 'week'
        ? [1000, 1200, 1500, 1800, 2000, 2200, 2500]
        : [5000, 8000, 12000, 15000],
    },
    {
      name: 'Sentiment',
      data: timeRange === 'day'
        ? [75, 78, 76, 80, 82, 81, 83, 85, 86]
        : timeRange === 'week'
        ? [70, 75, 72, 80, 85, 82, 88]
        : [68, 75, 82, 88],
    },
  ];

  const mediaSeries = [
    {
      name: 'Podcast Listens',
      data: timeRange === 'day'
        ? [120, 150, 180, 210, 190, 220, 250, 280, 300]
        : timeRange === 'week'
        ? [800, 950, 1100, 1300, 1250, 1400, 1600]
        : [3500, 4200, 5000, 6500],
    },
    {
      name: 'Video Views',
      data: timeRange === 'day'
        ? [300, 350, 400, 450, 420, 480, 520, 550, 600]
        : timeRange === 'week'
        ? [2000, 2300, 2700, 3100, 2900, 3300, 3800]
        : [10000, 12000, 15000, 18000],
    },
    {
      name: 'Content Shares',
      data: timeRange === 'day'
        ? [25, 30, 35, 40, 38, 42, 45, 48, 52]
        : timeRange === 'week'
        ? [150, 180, 210, 240, 230, 260, 300]
        : [700, 850, 1000, 1200],
    },
  ];

  // Donut chart for revenue breakdown
  const donutChartOptions: ApexOptions = {
    chart: {
      type: 'donut',
      background: 'transparent',
      animations: {
        enabled: true,
        speed: 500,
        animateGradually: {
          enabled: true,
          delay: 150
        },
        dynamicAnimation: {
          enabled: true,
          speed: 350
        }
      }
    },
    colors: ['#3B82F6', '#10B981', '#F59E0B', '#EF4444'],
    labels: activeCategory === 'business' 
      ? ['Product A', 'Product B', 'Product C', 'Other']
      : activeCategory === 'security'
      ? ['Critical', 'High', 'Medium', 'Low']
      : activeCategory === 'social'
      ? ['Organic', 'Paid', 'Direct', 'Referral']
      : ['Podcasts', 'Videos', 'Articles', 'Social'],
    legend: {
      position: 'bottom',
      labels: {
        colors: '#D1D5DB',
      },
    },
    dataLabels: {
      enabled: false,
    },
    plotOptions: {
      pie: {
        donut: {
          size: '60%',
          labels: {
            show: true,
            name: {
              show: true,
              fontSize: '14px',
              color: '#D1D5DB',
            },
            value: {
              show: true,
              fontSize: '16px',
              color: '#F9FAFB',
              formatter: function(val) {
                return activeCategory === 'business' ? '$' + val : val.toString();
              }
            },
            total: {
              show: true,
              label: 'Total',
              color: '#F9FAFB',
              formatter: function(w) {
                return activeCategory === 'business' 
                  ? '$' + w.globals.seriesTotals.reduce((a: number, b: number) => a + b, 0)
                  : w.globals.seriesTotals.reduce((a: number, b: number) => a + b, 0).toString();
              }
            }
          }
        },
      },
    },
    theme: {
      mode: 'dark',
    },
    responsive: [{
      breakpoint: 480,
      options: {
        chart: {
          height: 250
        },
        legend: {
          position: 'bottom'
        }
      }
    }]
  };

  const getDonutSeries = () => {
    switch (activeCategory) {
      case 'business':
        return [4400, 5500, 1300, 3300];
      case 'security':
        return [5, 12, 25, 18];
      case 'social':
        return [45, 25, 15, 15];
      case 'media':
        return [40, 30, 20, 10];
      default:
        return [44, 55, 13, 33];
    }
  };

  // Heat map for activity
  const heatmapOptions: ApexOptions = {
    chart: {
      type: 'heatmap',
      background: 'transparent',
      toolbar: {
        show: false,
      },
      animations: {
        enabled: true,
        speed: 500,
      }
    },
    dataLabels: {
      enabled: false,
    },
    colors: ['#3B82F6'],
    xaxis: {
      categories: timeRange === 'day' 
        ? ['9AM', '11AM', '1PM', '3PM', '5PM'] 
        : timeRange === 'week'
        ? ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
        : ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
      labels: {
        style: {
          colors: '#9CA3AF',
        },
      },
    },
    yaxis: {
      labels: {
        style: {
          colors: '#9CA3AF',
        },
      },
    },
    theme: {
      mode: 'dark',
    },
    plotOptions: {
      heatmap: {
        colorScale: {
          ranges: [
            {
              from: 0,
              to: 10,
              color: '#1F2937',
              name: 'low',
            },
            {
              from: 11,
              to: 20,
              color: '#374151',
              name: 'medium',
            },
            {
              from: 21,
              to: 30,
              color: '#4B5563',
              name: 'high',
            },
            {
              from: 31,
              to: 40,
              color: '#6366F1',
              name: 'very high',
            },
          ],
        },
      },
    },
    tooltip: {
      theme: 'dark',
    }
  };

  const getHeatmapSeries = () => {
    if (timeRange === 'day') {
      return [
        {
          name: 'Morning',
          data: [
            { x: '9AM', y: 22 },
            { x: '11AM', y: 28 },
            { x: '1PM', y: 25 },
            { x: '3PM', y: 30 },
            { x: '5PM', y: 18 },
          ],
        },
        {
          name: 'Afternoon',
          data: [
            { x: '9AM', y: 15 },
            { x: '11AM', y: 20 },
            { x: '1PM', y: 25 },
            { x: '3PM', y: 18 },
            { x: '5PM', y: 22 },
          ],
        },
        {
          name: 'Evening',
          data: [
            { x: '9AM', y: 10 },
            { x: '11AM', y: 15 },
            { x: '1PM', y: 20 },
            { x: '3PM', y: 25 },
            { x: '5PM', y: 30 },
          ],
        },
      ];
    } else if (timeRange === 'week') {
      return [
        {
          name: 'Morning',
          data: [
            { x: 'Mon', y: 22 },
            { x: 'Tue', y: 28 },
            { x: 'Wed', y: 25 },
            { x: 'Thu', y: 30 },
            { x: 'Fri', y: 18 },
            { x: 'Sat', y: 10 },
            { x: 'Sun', y: 12 },
          ],
        },
        {
          name: 'Afternoon',
          data: [
            { x: 'Mon', y: 15 },
            { x: 'Tue', y: 20 },
            { x: 'Wed', y: 25 },
            { x: 'Thu', y: 18 },
            { x: 'Fri', y: 22 },
            { x: 'Sat', y: 15 },
            { x: 'Sun', y: 10 },
          ],
        },
        {
          name: 'Evening',
          data: [
            { x: 'Mon', y: 10 },
            { x: 'Tue', y: 15 },
            { x: 'Wed', y: 20 },
            { x: 'Thu', y: 25 },
            { x: 'Fri', y: 30 },
            { x: 'Sat', y: 35 },
            { x: 'Sun', y: 20 },
          ],
        },
      ];
    } else {
      return [
        {
          name: 'Morning',
          data: [
            { x: 'Week 1', y: 25 },
            { x: 'Week 2', y: 30 },
            { x: 'Week 3', y: 35 },
            { x: 'Week 4', y: 40 },
          ],
        },
        {
          name: 'Afternoon',
          data: [
            { x: 'Week 1', y: 20 },
            { x: 'Week 2', y: 25 },
            { x: 'Week 3', y: 30 },
            { x: 'Week 4', y: 35 },
          ],
        },
        {
          name: 'Evening',
          data: [
            { x: 'Week 1', y: 15 },
            { x: 'Week 2', y: 20 },
            { x: 'Week 3', y: 25 },
            { x: 'Week 4', y: 30 },
          ],
        },
      ];
    }
  };

  const getActiveSeries = () => {
    switch (activeCategory) {
      case 'business':
        return businessSeries;
      case 'security':
        return securitySeries;
      case 'social':
        return socialSeries;
      case 'media':
        return mediaSeries;
      default:
        return businessSeries;
    }
  };

  const getChartTitle = () => {
    switch (activeCategory) {
      case 'business':
        return 'Business Performance';
      case 'security':
        return 'Security Metrics';
      case 'social':
        return 'Social Engagement';
      case 'media':
        return 'Media Performance';
      default:
        return 'Performance Metrics';
    }
  };

  const getDonutTitle = () => {
    switch (activeCategory) {
      case 'business':
        return 'Revenue Breakdown';
      case 'security':
        return 'Threat Distribution';
      case 'social':
        return 'Audience Segments';
      case 'media':
        return 'Content Distribution';
      default:
        return 'Distribution';
    }
  };

  const getHeatmapTitle = () => {
    switch (activeCategory) {
      case 'business':
        return 'Activity Heatmap';
      case 'security':
        return 'Vulnerability Heatmap';
      case 'social':
        return 'Engagement Heatmap';
      case 'media':
        return 'Content Consumption Heatmap';
      default:
        return 'Activity Heatmap';
    }
  };

  return (
    <div className="bg-gray-800 rounded-lg shadow-lg p-6 mb-8 border border-gray-700">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
        <div className="flex items-center">
          <h2 className="text-xl font-bold text-blue-400 mb-3 sm:mb-0">Key Metrics Board</h2>
          <button 
            className="ml-2 p-1 rounded-full bg-gray-700 hover:bg-gray-600 text-gray-400 hover:text-white transition-colors"
            onClick={() => setIsCustomizing(!isCustomizing)}
            title="Customize dashboard"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          <div className="flex space-x-1 bg-gray-700 rounded-md p-1">
            <button
              className={`px-3 py-1 rounded-md text-xs font-medium ${
                activeCategory === 'business'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-300 hover:bg-gray-600'
              }`}
              onClick={() => setActiveCategory('business')}
            >
              Business
            </button>
            <button
              className={`px-3 py-1 rounded-md text-xs font-medium ${
                activeCategory === 'security'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-300 hover:bg-gray-600'
              }`}
              onClick={() => setActiveCategory('security')}
            >
              Security
            </button>
            <button
              className={`px-3 py-1 rounded-md text-xs font-medium ${
                activeCategory === 'social'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-300 hover:bg-gray-600'
              }`}
              onClick={() => setActiveCategory('social')}
            >
              Social
            </button>
            <button
              className={`px-3 py-1 rounded-md text-xs font-medium ${
                activeCategory === 'media'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-300 hover:bg-gray-600'
              }`}
              onClick={() => setActiveCategory('media')}
            >
              Media
            </button>
          </div>
          
          <div className="flex space-x-1 bg-gray-700 rounded-md p-1">
            <button
              className={`px-3 py-1 rounded-md text-xs font-medium ${
                timeRange === 'day'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-300 hover:bg-gray-600'
              }`}
              onClick={() => setTimeRange('day')}
            >
              Day
            </button>
            <button
              className={`px-3 py-1 rounded-md text-xs font-medium ${
                timeRange === 'week'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-300 hover:bg-gray-600'
              }`}
              onClick={() => setTimeRange('week')}
            >
              Week
            </button>
            <button
              className={`px-3 py-1 rounded-md text-xs font-medium ${
                timeRange === 'month'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-300 hover:bg-gray-600'
              }`}
              onClick={() => setTimeRange('month')}
            >
              Month
            </button>
          </div>
        </div>
      </div>

      {/* Customization panel */}
      {isCustomizing && (
        <div className="mb-6 p-4 bg-gray-700 rounded-lg border border-gray-600">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-sm font-medium text-gray-300">Dashboard Customization</h3>
            <button 
              className="text-gray-400 hover:text-white"
              onClick={() => setIsCustomizing(false)}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <div className="text-xs text-gray-400 mb-1">Visible Metrics</div>
              <div className="space-y-1">
                <div className="flex items-center">
                  <input type="checkbox" id="metric-revenue" className="mr-2" checked />
                  <label htmlFor="metric-revenue" className="text-sm text-gray-300">Revenue</label>
                </div>
                <div className="flex items-center">
                  <input type="checkbox" id="metric-conversion" className="mr-2" checked />
                  <label htmlFor="metric-conversion" className="text-sm text-gray-300">Conversion</label>
                </div>
                <div className="flex items-center">
                  <input type="checkbox" id="metric-growth" className="mr-2" checked />
                  <label htmlFor="metric-growth" className="text-sm text-gray-300">Growth</label>
                </div>
              </div>
            </div>
            <div>
              <div className="text-xs text-gray-400 mb-1">Chart Type</div>
              <select className="w-full bg-gray-800 border border-gray-600 rounded px-2 py-1 text-sm text-gray-300">
                <option>Line Chart</option>
                <option>Bar Chart</option>
                <option>Area Chart</option>
              </select>
            </div>
            <div>
              <div className="text-xs text-gray-400 mb-1">Data Refresh Rate</div>
              <select className="w-full bg-gray-800 border border-gray-600 rounded px-2 py-1 text-sm text-gray-300">
                <option>Real-time</option>
                <option>Every 5 minutes</option>
                <option>Every 15 minutes</option>
                <option>Every hour</option>
              </select>
            </div>
          </div>
          <div className="mt-3 flex justify-end">
            <button className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded transition-colors">
              Save Configuration
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main chart */}
        <div className="lg:col-span-2 bg-gray-700 rounded-lg p-4 border border-gray-600 relative">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium text-gray-200">{getChartTitle()}</h3>
            <div className="flex space-x-2">
              <button className="p-1 rounded hover:bg-gray-600 text-gray-400 hover:text-white transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
              </button>
              <button className="p-1 rounded hover:bg-gray-600 text-gray-400 hover:text-white transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5v-4m0 4h-4m4 0l-5-5" />
                </svg>
              </button>
            </div>
          </div>
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
          ) : (
            <div className="h-64">
              <Chart
                options={lineChartOptions}
                series={getActiveSeries()}
                type="line"
                height="100%"
              />
            </div>
          )}
        </div>

        {/* Secondary charts */}
        <div className="flex flex-col space-y-6">
          <div className="bg-gray-700 rounded-lg p-4 border border-gray-600 relative">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-200">{getDonutTitle()}</h3>
              <button className="p-1 rounded hover:bg-gray-600 text-gray-400 hover:text-white transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5v-4m0 4h-4m4 0l-5-5" />
                </svg>
              </button>
            </div>
            {isLoading ? (
              <div className="flex justify-center items-center h-40">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              </div>
            ) : (
              <div className="h-40">
                <Chart
                  options={donutChartOptions}
                  series={getDonutSeries()}
                  type="donut"
                  height="100%"
                />
              </div>
            )}
          </div>

          <div className="bg-gray-700 rounded-lg p-4 border border-gray-600 relative">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-200">{getHeatmapTitle()}</h3>
              <button className="p-1 rounded hover:bg-gray-600 text-gray-400 hover:text-white transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5v-4m0 4h-4m4 0l-5-5" />
                </svg>
              </button>
            </div>
            {isLoading ? (
              <div className="flex justify-center items-center h-40">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              </div>
            ) : (
              <div className="h-40">
                <Chart
                  options={heatmapOptions}
                  series={getHeatmapSeries()}
                  type="heatmap"
                  height="100%"
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
        {activeCategory === 'business' && (
          <>
            <div className="bg-gray-700 rounded-lg p-4 border border-gray-600 hover:border-green-500 transition-colors duration-200">
              <div className="text-sm text-gray-400">Revenue</div>
              <div className="text-xl font-bold mt-1 text-green-400">{metrics.revenue || '$0'}</div>
              <div className="text-xs text-gray-500 mt-1">+2.5% from yesterday</div>
            </div>
            <div className="bg-gray-700 rounded-lg p-4 border border-gray-600 hover:border-blue-500 transition-colors duration-200">
              <div className="text-sm text-gray-400">Conversion</div>
              <div className="text-xl font-bold mt-1 text-blue-400">3.2%</div>
              <div className="text-xs text-gray-500 mt-1">+0.3% from last week</div>
            </div>
            <div className="bg-gray-700 rounded-lg p-4 border border-gray-600 hover:border-purple-500 transition-colors duration-200">
              <div className="text-sm text-gray-400">Growth</div>
              <div className="text-xl font-bold mt-1 text-purple-400">+{metrics.growth || '0'}%</div>
              <div className="text-xs text-gray-500 mt-1">Monthly average</div>
            </div>
            <div className="bg-gray-700 rounded-lg p-4 border border-gray-600 hover:border-red-500 transition-colors duration-200">
              <div className="text-sm text-gray-400">Churn</div>
              <div className="text-xl font-bold mt-1 text-red-400">1.8%</div>
              <div className="text-xs text-gray-500 mt-1">-0.2% from last month</div>
            </div>
          </>
        )}

        {activeCategory === 'security' && (
          <>
            <div className="bg-gray-700 rounded-lg p-4 border border-gray-600 hover:border-green-500 transition-colors duration-200">
              <div className="text-sm text-gray-400">Security Score</div>
              <div className="text-xl font-bold mt-1 text-green-400">{metrics.security || '0/100'}</div>
              <div className="text-xs text-gray-500 mt-1">+5 points this week</div>
            </div>
            <div className="bg-gray-700 rounded-lg p-4 border border-gray-600 hover:border-red-500 transition-colors duration-200">
              <div className="text-sm text-gray-400">Active Threats</div>
              <div className="text-xl font-bold mt-1 text-red-400">3</div>
              <div className="text-xs text-gray-500 mt-1">2 critical, 1 medium</div>
            </div>
            <div className="bg-gray-700 rounded-lg p-4 border border-gray-600 hover:border-yellow-500 transition-colors duration-200">
              <div className="text-sm text-gray-400">Vulnerabilities</div>
              <div className="text-xl font-bold mt-1 text-yellow-400">7</div>
              <div className="text-xs text-gray-500 mt-1">-3 from last scan</div>
            </div>
            <div className="bg-gray-700 rounded-lg p-4 border border-gray-600 hover:border-blue-500 transition-colors duration-200">
              <div className="text-sm text-gray-400">Last Scan</div>
              <div className="text-xl font-bold mt-1 text-blue-400">2h ago</div>
              <div className="text-xs text-gray-500 mt-1">Next scan in 4h</div>
            </div>
          </>
        )}

        {activeCategory === 'social' && (
          <>
            <div className="bg-gray-700 rounded-lg p-4 border border-gray-600 hover:border-blue-500 transition-colors duration-200">
              <div className="text-sm text-gray-400">Engagement</div>
              <div className="text-xl font-bold mt-1 text-blue-400">{metrics.engagement || '0%'}</div>
              <div className="text-xs text-gray-500 mt-1">+5% from last week</div>
            </div>
            <div className="bg-gray-700 rounded-lg p-4 border border-gray-600 hover:border-green-500 transition-colors duration-200">
              <div className="text-sm text-gray-400">Reach</div>
              <div className="text-xl font-bold mt-1 text-green-400">12.5K</div>
              <div className="text-xs text-gray-500 mt-1">+1.2K new users</div>
            </div>
            <div className="bg-gray-700 rounded-lg p-4 border border-gray-600 hover:border-purple-500 transition-colors duration-200">
              <div className="text-sm text-gray-400">Sentiment</div>
              <div className="text-xl font-bold mt-1 text-purple-400">85%</div>
              <div className="text-xs text-gray-500 mt-1">Positive mentions</div>
            </div>
            <div className="bg-gray-700 rounded-lg p-4 border border-gray-600 hover:border-yellow-500 transition-colors duration-200">
              <div className="text-sm text-gray-400">Virality</div>
              <div className="text-xl font-bold mt-1 text-yellow-400">3.2x</div>
              <div className="text-xs text-gray-500 mt-1">Avg. share rate</div>
            </div>
          </>
        )}

        {activeCategory === 'media' && (
          <>
            <div className="bg-gray-700 rounded-lg p-4 border border-gray-600 hover:border-pink-500 transition-colors duration-200">
              <div className="text-sm text-gray-400">Podcast Listens</div>
              <div className="text-xl font-bold mt-1 text-pink-400">8.3K</div>
              <div className="text-xs text-gray-500 mt-1">+12% this week</div>
            </div>
            <div className="bg-gray-700 rounded-lg p-4 border border-gray-600 hover:border-blue-500 transition-colors duration-200">
              <div className="text-sm text-gray-400">Video Views</div>
              <div className="text-xl font-bold mt-1 text-blue-400">24.7K</div>
              <div className="text-xs text-gray-500 mt-1">+3.5K from last week</div>
            </div>
            <div className="bg-gray-700 rounded-lg p-4 border border-gray-600 hover:border-green-500 transition-colors duration-200">
              <div className="text-sm text-gray-400">Content Shares</div>
              <div className="text-xl font-bold mt-1 text-green-400">1.2K</div>
              <div className="text-xs text-gray-500 mt-1">Across all platforms</div>
            </div>
            <div className="bg-gray-700 rounded-lg p-4 border border-gray-600 hover:border-purple-500 transition-colors duration-200">
              <div className="text-sm text-gray-400">Avg. Watch Time</div>
              <div className="text-xl font-bold mt-1 text-purple-400">8:42</div>
              <div className="text-xs text-gray-500 mt-1">+0:35 from last month</div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};