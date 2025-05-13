import React, { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { Badge } from '@src/shared/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@src/shared/components/ui/tooltip';

/**
 * TaskNode Component
 * 
 * Represents a task in the workflow builder.
 * Tasks are specific operations that agents can perform.
 */
export const TaskNode: React.FC<NodeProps> = memo(({ data, selected, isConnectable }) => {
  return (
    <div className={`relative p-3 rounded-lg shadow-md bg-gradient-to-r from-blue-900 to-indigo-900 border-2 ${selected ? 'border-white' : 'border-blue-700'} text-white w-64`}>
      {/* Input handle */}
      <Handle
        type="target"
        position={Position.Top}
        isConnectable={isConnectable}
        className="w-3 h-3 bg-blue-500"
      />
      
      {/* Task header */}
      <div className="flex items-center mb-2">
        <div className="bg-blue-700 p-1.5 rounded mr-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
        </div>
        <div className="font-bold text-lg truncate flex-1">{data.description || 'Task'}</div>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Badge variant="outline" className="ml-2 bg-blue-800 text-white border-blue-700">
                Task
              </Badge>
            </TooltipTrigger>
            <TooltipContent>
              <p>Task Node</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
      
      {/* Task details */}
      <div className="space-y-2 mb-3">
        {data.expectedOutput && (
          <div className="text-sm">
            <span className="text-blue-300">Output:</span> {data.expectedOutput}
          </div>
        )}
        
        <div className="flex flex-wrap gap-1 mt-2">
          {data.contextual && (
            <Badge variant="secondary" className="bg-blue-800 text-white border-blue-700">
              Contextual
            </Badge>
          )}
          
          {data.async && (
            <Badge variant="secondary" className="bg-blue-800 text-white border-blue-700">
              Async
            </Badge>
          )}
        </div>
      </div>
      
      {/* Output handle */}
      <Handle
        type="source"
        position={Position.Bottom}
        id="output"
        isConnectable={isConnectable}
        className="w-3 h-3 bg-blue-500"
      />
    </div>
  );
});

TaskNode.displayName = 'TaskNode';
