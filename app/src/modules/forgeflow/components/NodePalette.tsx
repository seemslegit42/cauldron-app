import React from 'react';
import { NodeType } from '../types';

interface NodePaletteProps {
  agentTemplates: any[];
  taskTemplates: any[];
}

export const NodePalette: React.FC<NodePaletteProps> = ({
  agentTemplates = [],
  taskTemplates = [],
}) => {
  const onDragStart = (event: React.DragEvent<HTMLDivElement>, nodeType: NodeType, data: any) => {
    event.dataTransfer.setData('application/reactflow/type', nodeType);
    event.dataTransfer.setData('application/reactflow/data', JSON.stringify(data));
    event.dataTransfer.effectAllowed = 'move';
  };

  return (
    <div className="bg-gray-800 border-r border-gray-700 p-4 w-64 overflow-y-auto">
      <h3 className="text-lg font-bold text-white mb-4">Components</h3>
      
      {/* Triggers */}
      <div className="mb-6">
        <h4 className="text-sm font-semibold text-gray-400 mb-2">Triggers</h4>
        <div className="space-y-2">
          <div
            className="bg-gradient-to-r from-green-900 to-teal-900 p-3 rounded-md cursor-move flex items-center"
            draggable
            onDragStart={(e) => onDragStart(e, NodeType.TRIGGER, { triggerType: 'manual' })}
          >
            <div className="bg-green-700 p-1.5 rounded mr-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <span className="text-sm text-white">Manual Trigger</span>
          </div>
          <div
            className="bg-gradient-to-r from-green-900 to-teal-900 p-3 rounded-md cursor-move flex items-center"
            draggable
            onDragStart={(e) => onDragStart(e, NodeType.TRIGGER, { triggerType: 'scheduled' })}
          >
            <div className="bg-green-700 p-1.5 rounded mr-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <span className="text-sm text-white">Schedule Trigger</span>
          </div>
          <div
            className="bg-gradient-to-r from-green-900 to-teal-900 p-3 rounded-md cursor-move flex items-center"
            draggable
            onDragStart={(e) => onDragStart(e, NodeType.TRIGGER, { triggerType: 'webhook' })}
          >
            <div className="bg-green-700 p-1.5 rounded mr-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 15l-8-8L4 15" />
              </svg>
            </div>
            <span className="text-sm text-white">Webhook Trigger</span>
          </div>
        </div>
      </div>
      
      {/* Agents */}
      <div className="mb-6">
        <h4 className="text-sm font-semibold text-gray-400 mb-2">Agents</h4>
        <div className="space-y-2">
          {agentTemplates.length > 0 ? (
            agentTemplates.map((template) => (
              <div
                key={template.id}
                className="bg-gradient-to-r from-pink-900 to-purple-900 p-3 rounded-md cursor-move flex items-center"
                draggable
                onDragStart={(e) => onDragStart(e, NodeType.AGENT, {
                  name: template.name,
                  role: template.role,
                  goal: template.goal,
                  backstory: template.backstory,
                  memory: true,
                  allowDelegation: false,
                })}
              >
                <div className="bg-pink-700 p-1.5 rounded mr-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <span className="text-sm text-white">{template.name}</span>
              </div>
            ))
          ) : (
            <div
              className="bg-gradient-to-r from-pink-900 to-purple-900 p-3 rounded-md cursor-move flex items-center"
              draggable
              onDragStart={(e) => onDragStart(e, NodeType.AGENT, {
                name: 'Generic Agent',
                role: 'Assistant',
                goal: 'Help the user with their tasks',
                memory: true,
                allowDelegation: false,
              })}
            >
              <div className="bg-pink-700 p-1.5 rounded mr-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <span className="text-sm text-white">Generic Agent</span>
            </div>
          )}
        </div>
      </div>
      
      {/* Tasks */}
      <div className="mb-6">
        <h4 className="text-sm font-semibold text-gray-400 mb-2">Tasks</h4>
        <div className="space-y-2">
          {taskTemplates.length > 0 ? (
            taskTemplates.map((template) => (
              <div
                key={template.id}
                className="bg-gradient-to-r from-blue-900 to-indigo-900 p-3 rounded-md cursor-move flex items-center"
                draggable
                onDragStart={(e) => onDragStart(e, NodeType.TASK, {
                  description: template.name,
                  expectedOutput: template.expectedOutput,
                  contextual: true,
                  async: false,
                })}
              >
                <div className="bg-blue-700 p-1.5 rounded mr-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <span className="text-sm text-white">{template.name}</span>
              </div>
            ))
          ) : (
            <div
              className="bg-gradient-to-r from-blue-900 to-indigo-900 p-3 rounded-md cursor-move flex items-center"
              draggable
              onDragStart={(e) => onDragStart(e, NodeType.TASK, {
                description: 'Generic Task',
                expectedOutput: 'Task result',
                contextual: true,
                async: false,
              })}
            >
              <div className="bg-blue-700 p-1.5 rounded mr-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <span className="text-sm text-white">Generic Task</span>
            </div>
          )}
        </div>
      </div>
      
      {/* Logic */}
      <div className="mb-6">
        <h4 className="text-sm font-semibold text-gray-400 mb-2">Logic</h4>
        <div className="space-y-2">
          <div
            className="bg-gradient-to-r from-yellow-900 to-orange-900 p-3 rounded-md cursor-move flex items-center"
            draggable
            onDragStart={(e) => onDragStart(e, NodeType.CONDITION, {
              condition: 'result.success === true',
              trueLabel: 'Success',
              falseLabel: 'Failure',
            })}
          >
            <div className="bg-yellow-700 p-1.5 rounded mr-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <span className="text-sm text-white">Condition</span>
          </div>
        </div>
      </div>
      
      {/* Outputs */}
      <div className="mb-6">
        <h4 className="text-sm font-semibold text-gray-400 mb-2">Outputs</h4>
        <div className="space-y-2">
          <div
            className="bg-gradient-to-r from-purple-900 to-violet-900 p-3 rounded-md cursor-move flex items-center"
            draggable
            onDragStart={(e) => onDragStart(e, NodeType.OUTPUT, {
              outputType: 'result',
              configuration: {
                format: 'JSON',
              },
            })}
          >
            <div className="bg-purple-700 p-1.5 rounded mr-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <span className="text-sm text-white">Result Output</span>
          </div>
          <div
            className="bg-gradient-to-r from-purple-900 to-violet-900 p-3 rounded-md cursor-move flex items-center"
            draggable
            onDragStart={(e) => onDragStart(e, NodeType.OUTPUT, {
              outputType: 'notification',
              configuration: {
                notificationType: 'email',
              },
            })}
          >
            <div className="bg-purple-700 p-1.5 rounded mr-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
            </div>
            <span className="text-sm text-white">Notification</span>
          </div>
        </div>
      </div>
    </div>
  );
};
