import React, { useState } from 'react';
import { useAction } from 'wasp/client/operations';
import { delegateToChiefOfStaff } from '../api/operations';

interface Task {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'in-progress' | 'completed' | 'delegated';
  priority: 'high' | 'medium' | 'low';
  dueDate: string;
  assignedTo: string;
  category: 'business' | 'security' | 'content' | 'development' | 'operations';
}

interface ChiefOfStaffPanelProps {
  tasks?: Task[];
  loading?: boolean;
  className?: string;
}

export const ChiefOfStaffPanel: React.FC<ChiefOfStaffPanelProps> = ({
  tasks = [],
  loading = false,
  className = '',
}) => {
  const [expandedTask, setExpandedTask] = useState<string | null>(null);
  const [delegatingTask, setDelegatingTask] = useState<string | null>(null);
  const [taskInput, setTaskInput] = useState('');
  const delegateTaskAction = useAction(delegateToChiefOfStaff);

  // Get priority color
  const getPriorityColor = (priority: 'high' | 'medium' | 'low'): string => {
    switch (priority) {
      case 'high':
        return 'bg-red-900 text-red-300';
      case 'medium':
        return 'bg-yellow-900 text-yellow-300';
      case 'low':
        return 'bg-blue-900 text-blue-300';
      default:
        return 'bg-gray-900 text-gray-300';
    }
  };

  // Get status color
  const getStatusColor = (status: 'pending' | 'in-progress' | 'completed' | 'delegated'): string => {
    switch (status) {
      case 'pending':
        return 'bg-gray-700 text-gray-300';
      case 'in-progress':
        return 'bg-blue-900 text-blue-300';
      case 'completed':
        return 'bg-green-900 text-green-300';
      case 'delegated':
        return 'bg-purple-900 text-purple-300';
      default:
        return 'bg-gray-900 text-gray-300';
    }
  };

  // Toggle expanded task
  const toggleExpand = (taskId: string) => {
    if (expandedTask === taskId) {
      setExpandedTask(null);
    } else {
      setExpandedTask(taskId);
    }
  };

  // Handle task delegation
  const handleDelegateTask = async (taskId: string) => {
    setDelegatingTask(taskId);
    try {
      await delegateTaskAction({ taskId });
      // Task delegation successful
    } catch (error) {
      console.error('Error delegating task:', error);
    } finally {
      setDelegatingTask(null);
    }
  };

  // Handle new task submission
  const handleSubmitTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskInput.trim()) return;

    try {
      await delegateTaskAction({ taskDescription: taskInput });
      setTaskInput('');
    } catch (error) {
      console.error('Error submitting task:', error);
    }
  };

  // Use provided tasks
  const displayTasks = tasks;

  return (
    <div className={`rounded-lg border border-gray-700 bg-gray-800 p-6 shadow-lg ${className}`}>
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center">
          <div className="mr-3 flex h-8 w-8 items-center justify-center rounded-full bg-yellow-900 text-yellow-300">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-yellow-400">Chief of Staff</h2>
        </div>
        <div className="text-sm text-gray-400">
          Task Management & Delegation
        </div>
      </div>

      {/* Task Input Form */}
      <div className="mb-6">
        <form onSubmit={handleSubmitTask} className="flex items-center">
          <input
            type="text"
            value={taskInput}
            onChange={(e) => setTaskInput(e.target.value)}
            placeholder="Delegate a task to your Chief of Staff..."
            className="flex-1 rounded-l-lg bg-gray-700 px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-500"
          />
          <button
            type="submit"
            className="rounded-r-lg bg-yellow-600 px-4 py-2 text-white hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-yellow-500"
            title="Add Task"
            aria-label="Add Task"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </button>
        </form>
      </div>

      {/* Tasks List */}
      <div className="space-y-3">
        {loading ? (
          <div className="flex h-32 items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-white"></div>
          </div>
        ) : displayTasks.length > 0 ? (
          displayTasks.map((task) => (
            <div
              key={task.id}
              className="rounded-lg border border-gray-700 bg-gray-700 p-4 transition-colors duration-200 hover:border-yellow-500"
            >
              <div className="flex justify-between">
                <div
                  className="flex-1 cursor-pointer"
                  onClick={() => toggleExpand(task.id)}
                >
                  <div className="flex items-center">
                    <div className={`mr-2 px-2 py-0.5 text-xs rounded-full ${getStatusColor(task.status)}`}>
                      <span className="capitalize">{task.status}</span>
                    </div>
                    <div className={`ml-2 px-2 py-0.5 text-xs rounded-full ${getPriorityColor(task.priority)}`}>
                      <span className="capitalize">{task.priority}</span>
                    </div>
                  </div>
                  <div className="mt-2 font-medium">{task.title}</div>
                  <div className="mt-1 text-xs text-gray-400">
                    Due: {new Date(task.dueDate).toLocaleDateString()} • Assigned to: {task.assignedTo}
                  </div>
                </div>
              </div>

              {expandedTask === task.id && (
                <div className="mt-4 border-t border-gray-600 pt-4">
                  <p className="text-sm text-gray-300 mb-4">{task.description}</p>

                  <div className="mt-4 flex justify-end space-x-2">
                    {task.assignedTo === 'You' && task.status === 'pending' && (
                      <button
                        type="button"
                        className={`flex items-center rounded bg-yellow-600 px-3 py-1 text-xs text-white transition-colors hover:bg-yellow-700 ${delegatingTask === task.id ? 'opacity-50 cursor-not-allowed' : ''
                          }`}
                        onClick={() => handleDelegateTask(task.id)}
                        disabled={delegatingTask === task.id}
                      >
                        {delegatingTask === task.id ? (
                          <>
                            <svg className="mr-1 h-3 w-3 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Delegating...
                          </>
                        ) : (
                          <>
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="mr-1 h-3 w-3"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M7 11.5V14m0-2.5v-6a1.5 1.5 0 113 0m-3 6a1.5 1.5 0 00-3 0v2a7.5 7.5 0 0015 0v-5a1.5 1.5 0 00-3 0m-6-3V11m0-5.5v-1a1.5 1.5 0 013 0v1m0 0V11m0-5.5a1.5 1.5 0 013 0v3m0 0V11"
                              />
                            </svg>
                            Delegate to Chief of Staff
                          </>
                        )}
                      </button>
                    )}

                    <button type="button" className="flex items-center rounded bg-gray-600 px-3 py-1 text-xs text-white transition-colors hover:bg-gray-500">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="mr-1 h-3 w-3"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                        />
                      </svg>
                      Details
                    </button>

                    {task.status !== 'completed' && (
                      <button type="button" className="flex items-center rounded bg-green-600 px-3 py-1 text-xs text-white transition-colors hover:bg-green-700">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="mr-1 h-3 w-3"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                        Mark as Completed
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="py-4 text-center text-gray-400">No tasks available</div>
        )}
      </div>

      <div className="mt-6 flex justify-center">
        <button type="button" className="rounded-full bg-gray-700 px-4 py-2 text-sm text-yellow-400 hover:bg-gray-600 transition-colors">
          View All Tasks
        </button>
      </div>
    </div>
  );
};