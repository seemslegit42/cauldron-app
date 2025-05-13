import React, { useState } from 'react';

interface SystemNotice {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'error' | 'success';
  timestamp: string;
  read: boolean;
  source: string;
}

interface SystemNoticesProps {
  notices: SystemNotice[];
  loading?: boolean;
  maxItems?: number;
  className?: string;
}

export const SystemNotices: React.FC<SystemNoticesProps> = ({
  notices = [],
  loading = false,
  maxItems = 3,
  className = '',
}) => {
  const [expandedNotice, setExpandedNotice] = useState<string | null>(null);

  // Get notice type color
  const getNoticeTypeColor = (type: 'info' | 'warning' | 'error' | 'success'): string => {
    switch (type) {
      case 'error':
        return 'bg-red-900 text-red-300 border-red-700';
      case 'warning':
        return 'bg-yellow-900 text-yellow-300 border-yellow-700';
      case 'success':
        return 'bg-green-900 text-green-300 border-green-700';
      case 'info':
      default:
        return 'bg-blue-900 text-blue-300 border-blue-700';
    }
  };

  // Get notice type icon
  const getNoticeTypeIcon = (type: 'info' | 'warning' | 'error' | 'success') => {
    switch (type) {
      case 'error':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        );
      case 'warning':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'success':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'info':
      default:
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
    }
  };

  // Toggle expanded notice
  const toggleExpand = (noticeId: string) => {
    if (expandedNotice === noticeId) {
      setExpandedNotice(null);
    } else {
      setExpandedNotice(noticeId);
    }
  };

  // Use provided notices
  const displayNotices = notices;

  return (
    <div className={`rounded-lg border border-gray-700 bg-gray-800 p-6 shadow-lg ${className}`}>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-bold text-blue-400">System Notices</h2>
        {displayNotices.length > maxItems && (
          <button type="button" className="rounded px-3 py-1 text-sm text-gray-400 transition-colors hover:bg-gray-700 hover:text-white">
            View All
          </button>
        )}
      </div>
      <div className="space-y-3">
        {loading ? (
          <div className="flex h-32 items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-white"></div>
          </div>
        ) : displayNotices.length > 0 ? (
          displayNotices.slice(0, maxItems).map((notice) => (
            <div
              key={notice.id}
              className={`rounded-lg border p-4 transition-colors duration-200 ${getNoticeTypeColor(notice.type)} ${!notice.read ? 'border-l-4' : ''
                }`}
            >
              <div className="flex justify-between">
                <div
                  className="flex items-center cursor-pointer"
                  onClick={() => toggleExpand(notice.id)}
                >
                  <div className="mr-3 flex h-8 w-8 items-center justify-center rounded-full bg-gray-800 bg-opacity-30">
                    {getNoticeTypeIcon(notice.type)}
                  </div>
                  <div className="font-medium">{notice.title}</div>
                </div>
                <div className="text-xs opacity-70">
                  {new Date(notice.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>

              {expandedNotice === notice.id && (
                <div className="mt-3 border-t border-gray-600 pt-3">
                  <p className="text-sm opacity-90 mb-2">{notice.message}</p>
                  <div className="mt-2 flex justify-between items-center">
                    <div className="text-xs opacity-70">
                      Source: {notice.source}
                    </div>
                    <div className="flex space-x-2">
                      <button type="button" className="text-xs bg-gray-700 hover:bg-gray-600 px-2 py-1 rounded transition-colors">
                        Mark as Read
                      </button>
                      <button type="button" className="text-xs bg-gray-700 hover:bg-gray-600 px-2 py-1 rounded transition-colors">
                        Dismiss
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="py-4 text-center text-gray-400">No system notices</div>
        )}
      </div>
    </div>
  );
};