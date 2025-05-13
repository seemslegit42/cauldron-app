import React from 'react';
import { useUser } from 'wasp/client/auth';
import { useQuery } from 'wasp/client/operations';
import { getSentientRecommendations } from '../operations';

interface HeroPanelProps {
  greeting: string;
  metrics: any;
}

export const HeroPanel: React.FC<HeroPanelProps> = ({ greeting, metrics }) => {
  const user = useUser();
  const { data: recommendations, isLoading: isLoadingRecommendations } = useQuery(getSentientRecommendations);

  return (
    <div className="bg-gray-800 rounded-lg shadow-lg p-6 mb-8 border border-gray-700 hover:border-blue-500 transition-colors duration-300">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        {/* User name, avatar, and role-based greeting */}
        <div className="flex items-center">
          <div className="relative">
            <div className="h-16 w-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-xl font-bold text-white overflow-hidden">
              {user?.username?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div className="absolute bottom-0 right-0 h-4 w-4 rounded-full bg-green-400 border-2 border-gray-800"></div>
          </div>
          <div className="ml-4">
            <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">
              {greeting}
            </h2>
            <p className="text-gray-400 mt-1">
              {new Date().toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </p>
            <p className="text-sm text-blue-400 mt-1">
              {user?.role || 'Sentient Loop™ Operator'}
            </p>
          </div>
        </div>

        {/* Key business vitals */}
        <div className="flex flex-wrap gap-4">
          <div className="bg-gray-700 rounded-lg p-4 flex-1 min-w-[120px] border border-gray-600 hover:border-green-500 transition-colors duration-200">
            <div className="text-sm text-gray-400">Revenue Today</div>
            <div className="text-xl font-bold mt-1 text-green-400">{metrics.revenue || '$0'}</div>
            <div className="text-xs text-gray-500 mt-1">+2.5% from yesterday</div>
          </div>
          <div className="bg-gray-700 rounded-lg p-4 flex-1 min-w-[120px] border border-gray-600 hover:border-yellow-500 transition-colors duration-200">
            <div className="text-sm text-gray-400">Threat Index</div>
            <div className="text-xl font-bold mt-1 text-yellow-400">{metrics.security || '0/100'}</div>
            <div className="text-xs text-gray-500 mt-1">3 active threats</div>
          </div>
          <div className="bg-gray-700 rounded-lg p-4 flex-1 min-w-[120px] border border-gray-600 hover:border-blue-500 transition-colors duration-200">
            <div className="text-sm text-gray-400">Top Trend</div>
            <div className="text-xl font-bold mt-1 text-blue-400">+{metrics.growth || '0'}%</div>
            <div className="text-xs text-gray-500 mt-1">Content engagement</div>
          </div>
        </div>
      </div>

      {/* Top 3 AI-generated suggested actions */}
      <div className="mt-6">
        <h3 className="text-lg font-semibold text-blue-400 mb-3">Cauldron Prime Recommendations</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {isLoadingRecommendations ? (
            <div className="col-span-3 flex justify-center py-4">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
            </div>
          ) : (
            recommendations?.slice(0, 3).map((rec: any, index: number) => (
              <div 
                key={rec.id} 
                className="bg-gray-700 hover:bg-gray-600 rounded-lg p-4 border border-gray-600 hover:border-blue-500 transition-all duration-300 cursor-pointer group"
              >
                <div className="flex items-start">
                  <div className={`h-8 w-8 rounded-full flex items-center justify-center mr-3 group-hover:scale-110 transition-transform ${
                    rec.priority === 'high' ? 'bg-red-900 text-red-300' :
                    rec.priority === 'medium' ? 'bg-yellow-900 text-yellow-300' :
                    'bg-blue-900 text-blue-300'
                  }`}>
                    {index + 1}
                  </div>
                  <div>
                    <div className="font-medium">{rec.title}</div>
                    <div className="text-sm text-gray-400 mt-1 line-clamp-2">{rec.actions[0]}</div>
                    <div className="mt-2 pt-2 border-t border-gray-600 hidden group-hover:block">
                      <button className="text-xs bg-blue-600 hover:bg-blue-700 text-white px-2 py-1 rounded transition-colors">
                        Execute
                      </button>
                      <button className="text-xs bg-gray-600 hover:bg-gray-500 text-white px-2 py-1 rounded ml-2 transition-colors">
                        Details
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};