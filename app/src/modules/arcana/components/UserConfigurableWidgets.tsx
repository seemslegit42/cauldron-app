import React, { useState, useEffect } from 'react';
import { useAction, useQuery } from 'wasp/client/operations';
import { getUserWidgets, updateUserWidgets } from '../api/operations';
import { useToast } from '@src/shared/hooks/useToast';
import { useCanConfigureDashboardWidgets } from '../utils/permissionUtils';

export type WidgetType = 
  | 'metrics' 
  | 'security' 
  | 'recommendations' 
  | 'decisions' 
  | 'forgeflow' 
  | 'goals'
  | 'persona';

interface Widget {
  id: string;
  type: WidgetType;
  title: string;
  enabled: boolean;
  position: number;
  size: 'small' | 'medium' | 'large';
  description: string;
  icon: React.ReactNode;
}

interface UserConfigurableWidgetsProps {
  onWidgetsChange?: (widgets: Widget[]) => void;
  className?: string;
}

export const UserConfigurableWidgets: React.FC<UserConfigurableWidgetsProps> = ({
  onWidgetsChange,
  className = '',
}) => {
  const { data: userWidgets, isLoading } = useQuery(getUserWidgets);
  const updateWidgetsAction = useAction(updateUserWidgets);
  const { toast } = useToast();
  const canConfigureWidgets = useCanConfigureDashboardWidgets();
  
  const [widgets, setWidgets] = useState<Widget[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [draggedWidget, setDraggedWidget] = useState<string | null>(null);

  // Default widgets if none are configured
  const defaultWidgets: Widget[] = [
    {
      id: 'metrics',
      type: 'metrics',
      title: 'Key Metrics',
      enabled: true,
      position: 0,
      size: 'large',
      description: 'Display key business metrics and KPIs',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
    },
    {
      id: 'security',
      type: 'security',
      title: 'Security Status',
      enabled: true,
      position: 1,
      size: 'small',
      description: 'Monitor security status and alerts',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      ),
    },
    {
      id: 'recommendations',
      type: 'recommendations',
      title: 'AI Recommendations',
      enabled: true,
      position: 2,
      size: 'medium',
      description: 'View AI-generated recommendations',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
    },
    {
      id: 'decisions',
      type: 'decisions',
      title: 'Pending Decisions',
      enabled: true,
      position: 3,
      size: 'medium',
      description: 'Review and act on pending decisions',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
    },
    {
      id: 'forgeflow',
      type: 'forgeflow',
      title: 'Active Workflows',
      enabled: true,
      position: 4,
      size: 'medium',
      description: 'Monitor and manage active workflows',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
        </svg>
      ),
    },
    {
      id: 'goals',
      type: 'goals',
      title: 'Goals & Objectives',
      enabled: true,
      position: 5,
      size: 'medium',
      description: 'Track progress on goals and objectives',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
      ),
    },
    {
      id: 'persona',
      type: 'persona',
      title: 'Persona Settings',
      enabled: true,
      position: 6,
      size: 'small',
      description: 'Customize your dashboard persona',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
    },
  ];

  // Initialize widgets from user preferences or defaults
  useEffect(() => {
    if (userWidgets) {
      setWidgets(userWidgets);
    } else if (!isLoading) {
      setWidgets(defaultWidgets);
    }
  }, [userWidgets, isLoading]);

  // Notify parent component when widgets change
  useEffect(() => {
    if (widgets.length > 0 && onWidgetsChange) {
      onWidgetsChange(widgets);
    }
  }, [widgets, onWidgetsChange]);

  // Toggle widget enabled state
  const toggleWidget = (id: string) => {
    if (!canConfigureWidgets) {
      toast({
        title: 'Permission Denied',
        description: 'You do not have permission to configure dashboard widgets.',
        variant: 'error',
      });
      return;
    }

    const updatedWidgets = widgets.map(widget => 
      widget.id === id ? { ...widget, enabled: !widget.enabled } : widget
    );
    setWidgets(updatedWidgets);
  };

  // Save widget configuration
  const saveWidgetConfiguration = async () => {
    try {
      await updateWidgetsAction({ widgets });
      setIsEditing(false);
      toast({
        title: 'Widgets Updated',
        description: 'Your dashboard widgets have been updated successfully.',
        variant: 'success',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update widgets. Please try again.',
        variant: 'error',
      });
      console.error('Error updating widgets:', error);
    }
  };

  // Handle drag start
  const handleDragStart = (id: string) => {
    setDraggedWidget(id);
  };

  // Handle drag over
  const handleDragOver = (e: React.DragEvent, id: string) => {
    e.preventDefault();
    if (draggedWidget && draggedWidget !== id) {
      const draggedIndex = widgets.findIndex(w => w.id === draggedWidget);
      const targetIndex = widgets.findIndex(w => w.id === id);
      
      if (draggedIndex !== -1 && targetIndex !== -1) {
        const newWidgets = [...widgets];
        const [draggedItem] = newWidgets.splice(draggedIndex, 1);
        newWidgets.splice(targetIndex, 0, draggedItem);
        
        // Update positions
        const updatedWidgets = newWidgets.map((widget, index) => ({
          ...widget,
          position: index,
        }));
        
        setWidgets(updatedWidgets);
      }
    }
  };

  // Handle drag end
  const handleDragEnd = () => {
    setDraggedWidget(null);
  };

  if (isLoading) {
    return (
      <div className={`rounded-lg border border-gray-700 bg-gray-800 p-6 ${className}`}>
        <div className="flex h-32 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-white"></div>
        </div>
      </div>
    );
  }

  return (
    <div className={`rounded-lg border border-gray-700 bg-gray-800 p-6 ${className}`}>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-bold text-blue-400">Dashboard Widgets</h2>
        {canConfigureWidgets && (
          <div className="flex space-x-2">
            {isEditing ? (
              <>
                <button
                  className="rounded bg-green-600 px-3 py-1 text-sm text-white hover:bg-green-700"
                  onClick={saveWidgetConfiguration}
                >
                  Save
                </button>
                <button
                  className="rounded bg-gray-600 px-3 py-1 text-sm text-white hover:bg-gray-700"
                  onClick={() => setIsEditing(false)}
                >
                  Cancel
                </button>
              </>
            ) : (
              <button
                className="rounded bg-blue-600 px-3 py-1 text-sm text-white hover:bg-blue-700"
                onClick={() => setIsEditing(true)}
              >
                Customize
              </button>
            )}
          </div>
        )}
      </div>

      <div className="space-y-2">
        {widgets
          .sort((a, b) => a.position - b.position)
          .map((widget) => (
            <div
              key={widget.id}
              draggable={isEditing}
              onDragStart={() => handleDragStart(widget.id)}
              onDragOver={(e) => handleDragOver(e, widget.id)}
              onDragEnd={handleDragEnd}
              className={`flex items-center justify-between rounded-lg border border-gray-700 bg-gray-700 p-3 ${
                isEditing ? 'cursor-move' : ''
              } ${draggedWidget === widget.id ? 'border-blue-500 opacity-50' : ''}`}
            >
              <div className="flex items-center">
                <div className="mr-3 flex h-8 w-8 items-center justify-center rounded-full bg-gray-600 text-blue-400">
                  {widget.icon}
                </div>
                <div>
                  <div className="font-medium">{widget.title}</div>
                  <div className="text-xs text-gray-400">{widget.description}</div>
                </div>
              </div>
              {isEditing && (
                <div className="flex items-center space-x-2">
                  <select
                    value={widget.size}
                    onChange={(e) => {
                      const size = e.target.value as 'small' | 'medium' | 'large';
                      setWidgets(widgets.map(w => 
                        w.id === widget.id ? { ...w, size } : w
                      ));
                    }}
                    className="rounded bg-gray-800 px-2 py-1 text-sm text-white"
                  >
                    <option value="small">Small</option>
                    <option value="medium">Medium</option>
                    <option value="large">Large</option>
                  </select>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id={`widget-${widget.id}`}
                      checked={widget.enabled}
                      onChange={() => toggleWidget(widget.id)}
                      className="mr-2 h-4 w-4 rounded border-gray-600 bg-gray-800 text-blue-600"
                    />
                    <label htmlFor={`widget-${widget.id}`} className="text-sm">
                      Enabled
                    </label>
                  </div>
                </div>
              )}
            </div>
          ))}
      </div>
    </div>
  );
};
