import React, { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { Badge } from '@src/shared/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@src/shared/components/ui/tooltip';
import { OutputType } from '../../types';

/**
 * OutputNode Component
 * 
 * Represents an output in the workflow builder.
 * Outputs are the final results of a workflow.
 */
export const OutputNode: React.FC<NodeProps> = memo(({ data, selected, isConnectable }) => {
  // Get the output icon based on the output type
  const getOutputIcon = () => {
    switch (data.outputType) {
      case OutputType.NOTIFICATION:
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
        );
      case OutputType.EMAIL:
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        );
      case OutputType.WEBHOOK:
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        );
      case OutputType.DATABASE:
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
          </svg>
        );
      case OutputType.API:
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
          </svg>
        );
      default:
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
          </svg>
        );
    }
  };

  // Get the output label based on the output type
  const getOutputLabel = () => {
    switch (data.outputType) {
      case OutputType.RESULT:
        return 'Result';
      case OutputType.NOTIFICATION:
        return 'Notification';
      case OutputType.EMAIL:
        return 'Email';
      case OutputType.WEBHOOK:
        return 'Webhook';
      case OutputType.DATABASE:
        return 'Database';
      case OutputType.API:
        return 'API';
      default:
        return 'Output';
    }
  };

  return (
    <div className={`relative p-3 rounded-lg shadow-md bg-gradient-to-r from-purple-900 to-violet-900 border-2 ${selected ? 'border-white' : 'border-purple-700'} text-white w-64`}>
      {/* Input handle */}
      <Handle
        type="target"
        position={Position.Top}
        isConnectable={isConnectable}
        className="w-3 h-3 bg-purple-500"
      />
      
      {/* Output header */}
      <div className="flex items-center mb-2">
        <div className="bg-purple-700 p-1.5 rounded mr-2">
          {getOutputIcon()}
        </div>
        <div className="font-bold text-lg truncate flex-1">{data.name || getOutputLabel()}</div>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Badge variant="outline" className="ml-2 bg-purple-800 text-white border-purple-700">
                Output
              </Badge>
            </TooltipTrigger>
            <TooltipContent>
              <p>Output Node</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
      
      {/* Output details */}
      <div className="space-y-2 mb-3">
        {data.description && (
          <div className="text-sm">
            <span className="text-purple-300">Description:</span> {data.description}
          </div>
        )}
        
        <div className="flex flex-wrap gap-1 mt-2">
          <Badge variant="secondary" className="bg-purple-800 text-white border-purple-700">
            {getOutputLabel()}
          </Badge>
        </div>
      </div>
    </div>
  );
});

OutputNode.displayName = 'OutputNode';
