import React, { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { Badge } from '@src/shared/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@src/shared/components/ui/tooltip';
import { TriggerType } from '../../types';

/**
 * TriggerNode Component
 * 
 * Represents a trigger in the workflow builder.
 * Triggers are events that start a workflow.
 */
export const TriggerNode: React.FC<NodeProps> = memo(({ data, selected, isConnectable }) => {
  // Get the trigger icon based on the trigger type
  const getTriggerIcon = () => {
    switch (data.triggerType) {
      case TriggerType.MANUAL:
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        );
      case TriggerType.SCHEDULED:
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case TriggerType.WEBHOOK:
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        );
      case TriggerType.EVENT:
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
        );
      default:
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        );
    }
  };

  // Get the trigger label based on the trigger type
  const getTriggerLabel = () => {
    switch (data.triggerType) {
      case TriggerType.MANUAL:
        return 'Manual Trigger';
      case TriggerType.SCHEDULED:
        return 'Schedule Trigger';
      case TriggerType.WEBHOOK:
        return 'Webhook Trigger';
      case TriggerType.EVENT:
        return 'Event Trigger';
      case TriggerType.DATA_CHANGE:
        return 'Data Change Trigger';
      case TriggerType.API:
        return 'API Trigger';
      default:
        return 'Trigger';
    }
  };

  return (
    <div className={`relative p-3 rounded-lg shadow-md bg-gradient-to-r from-green-900 to-teal-900 border-2 ${selected ? 'border-white' : 'border-green-700'} text-white w-64`}>
      {/* Trigger header */}
      <div className="flex items-center mb-2">
        <div className="bg-green-700 p-1.5 rounded mr-2">
          {getTriggerIcon()}
        </div>
        <div className="font-bold text-lg truncate flex-1">{data.name || getTriggerLabel()}</div>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Badge variant="outline" className="ml-2 bg-green-800 text-white border-green-700">
                Trigger
              </Badge>
            </TooltipTrigger>
            <TooltipContent>
              <p>Trigger Node</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
      
      {/* Trigger details */}
      <div className="space-y-2 mb-3">
        {data.description && (
          <div className="text-sm">
            <span className="text-green-300">Description:</span> {data.description}
          </div>
        )}
        
        <div className="flex flex-wrap gap-1 mt-2">
          <Badge variant="secondary" className="bg-green-800 text-white border-green-700">
            {data.triggerType || 'manual'}
          </Badge>
        </div>
      </div>
      
      {/* Output handle */}
      <Handle
        type="source"
        position={Position.Bottom}
        id="output"
        isConnectable={isConnectable}
        className="w-3 h-3 bg-green-500"
      />
    </div>
  );
});

TriggerNode.displayName = 'TriggerNode';
