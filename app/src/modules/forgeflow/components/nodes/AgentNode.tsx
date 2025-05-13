import React, { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { Badge } from '@src/shared/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@src/shared/components/ui/tooltip';

/**
 * AgentNode Component
 * 
 * Represents an AI agent in the workflow builder.
 * Agents can process tasks, make decisions, and generate content.
 */
export const AgentNode: React.FC<NodeProps> = memo(({ data, selected, isConnectable }) => {
  return (
    <div className={`relative p-3 rounded-lg shadow-md bg-gradient-to-r from-pink-900 to-purple-900 border-2 ${selected ? 'border-white' : 'border-pink-700'} text-white w-64`}>
      {/* Input handle */}
      <Handle
        type="target"
        position={Position.Top}
        isConnectable={isConnectable}
        className="w-3 h-3 bg-pink-500"
      />
      
      {/* Agent header */}
      <div className="flex items-center mb-2">
        <div className="bg-pink-700 p-1.5 rounded mr-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        </div>
        <div className="font-bold text-lg truncate flex-1">{data.name || 'Agent'}</div>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Badge variant="outline" className="ml-2 bg-pink-800 text-white border-pink-700">
                Agent
              </Badge>
            </TooltipTrigger>
            <TooltipContent>
              <p>AI Agent Node</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
      
      {/* Agent details */}
      <div className="space-y-2 mb-3">
        {data.role && (
          <div className="text-sm">
            <span className="text-pink-300">Role:</span> {data.role}
          </div>
        )}
        
        {data.goal && (
          <div className="text-sm">
            <span className="text-pink-300">Goal:</span> {data.goal}
          </div>
        )}
        
        <div className="flex flex-wrap gap-1 mt-2">
          {data.memory && (
            <Badge variant="secondary" className="bg-pink-800 text-white border-pink-700">
              Memory
            </Badge>
          )}
          
          {data.allowDelegation && (
            <Badge variant="secondary" className="bg-pink-800 text-white border-pink-700">
              Delegation
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
        className="w-3 h-3 bg-pink-500"
      />
    </div>
  );
});

AgentNode.displayName = 'AgentNode';
