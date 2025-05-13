import React from 'react';
import { BusinessMetric, MetricCategory, TimeframeOption } from '../types';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ChartOptions
} from 'chart.js';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface MetricChartProps {
  metrics: BusinessMetric[];
  timeframe: TimeframeOption;
  category: MetricCategory;
}

export const MetricChart: React.FC<MetricChartProps> = ({
  metrics,
  timeframe,
  category
}) => {
  // Generate mock historical data for demonstration
  // In a real implementation, this would come from the API
  const generateHistoricalData = (metric: BusinessMetric, points: number) => {
    const data = [];
    const now = new Date();
    const volatility = 0.1; // 10% volatility
    
    for (let i = points; i >= 0; i--) {
      const date = new Date(now);
      
      // Adjust date based on timeframe
      switch (timeframe) {
        case TimeframeOption.DAY:
          date.setHours(now.getHours() - i * 2);
          break;
        case TimeframeOption.WEEK:
          date.setDate(now.getDate() - i);
          break;
        case TimeframeOption.MONTH:
          date.setDate(now.getDate() - i * 2);
          break;
        case TimeframeOption.QUARTER:
          date.setDate(now.getDate() - i * 7);
          break;
        case TimeframeOption.YEAR:
          date.setDate(now.getDate() - i * 30);
          break;
      }
      
      // Calculate a value with some randomness
      const randomFactor = 1 + (Math.random() * 2 - 1) * volatility;
      const value = metric.previousValue 
        ? metric.previousValue * randomFactor + (metric.value - metric.previousValue) * (i / points)
        : metric.value * randomFactor;
      
      data.push({
        date,
        value
      });
    }
    
    return data;
  };

  // Generate labels based on timeframe
  const generateLabels = (points: number) => {
    const labels = [];
    const now = new Date();
    
    for (let i = points; i >= 0; i--) {
      const date = new Date(now);
      
      // Adjust date based on timeframe
      switch (timeframe) {
        case TimeframeOption.DAY:
          date.setHours(now.getHours() - i * 2);
          labels.push(date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
          break;
        case TimeframeOption.WEEK:
          date.setDate(now.getDate() - i);
          labels.push(date.toLocaleDateString([], { weekday: 'short' }));
          break;
        case TimeframeOption.MONTH:
          date.setDate(now.getDate() - i * 2);
          labels.push(date.toLocaleDateString([], { month: 'short', day: 'numeric' }));
          break;
        case TimeframeOption.QUARTER:
          date.setDate(now.getDate() - i * 7);
          labels.push(date.toLocaleDateString([], { month: 'short', day: 'numeric' }));
          break;
        case TimeframeOption.YEAR:
          date.setDate(now.getDate() - i * 30);
          labels.push(date.toLocaleDateString([], { month: 'short' }));
          break;
      }
    }
    
    return labels;
  };

  // Number of data points based on timeframe
  const getDataPoints = () => {
    switch (timeframe) {
      case TimeframeOption.DAY: return 12; // Every 2 hours
      case TimeframeOption.WEEK: return 7; // Daily
      case TimeframeOption.MONTH: return 15; // Every 2 days
      case TimeframeOption.QUARTER: return 13; // Weekly
      case TimeframeOption.YEAR: return 12; // Monthly
      default: return 7;
    }
  };

  const dataPoints = getDataPoints();
  const labels = generateLabels(dataPoints);

  // Generate chart data
  const chartData = {
    labels,
    datasets: metrics.map((metric, index) => {
      const historicalData = generateHistoricalData(metric, dataPoints);
      
      // Generate a color based on index
      const hue = (index * 137) % 360; // Golden angle approximation for good distribution
      const color = `hsl(${hue}, 70%, 60%)`;
      
      return {
        label: metric.name,
        data: historicalData.map(d => d.value),
        borderColor: color,
        backgroundColor: `hsla(${hue}, 70%, 60%, 0.1)`,
        tension: 0.3,
        pointRadius: 2,
        pointHoverRadius: 5
      };
    })
  };

  // Chart options
  const options: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: '#e5e7eb' // text-gray-200
        }
      },
      title: {
        display: true,
        text: `${category.charAt(0).toUpperCase() + category.slice(1)} Metrics Trend`,
        color: '#e5e7eb' // text-gray-200
      },
      tooltip: {
        mode: 'index',
        intersect: false
      }
    },
    scales: {
      x: {
        grid: {
          color: 'rgba(75, 85, 99, 0.2)' // text-gray-600 with opacity
        },
        ticks: {
          color: '#9ca3af' // text-gray-400
        }
      },
      y: {
        grid: {
          color: 'rgba(75, 85, 99, 0.2)' // text-gray-600 with opacity
        },
        ticks: {
          color: '#9ca3af' // text-gray-400
        },
        beginAtZero: true
      }
    }
  };

  return (
    <div className="bg-gray-700 rounded-lg shadow p-4 h-80">
      <Line data={chartData} options={options} />
    </div>
  );
};
