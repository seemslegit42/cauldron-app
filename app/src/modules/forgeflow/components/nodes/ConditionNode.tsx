import React, { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { Badge } from '@src/shared/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@src/shared/components/ui/tooltip';
import { ConditionType } from '../../types';

/**
 * ConditionNode Component
 * 
 * Represents a condition in the workflow builder.
 * Conditions determine the flow of execution based on data evaluation.
 */
export const ConditionNode: React.FC<NodeProps> = memo(({ data, selected, isConnectable }) => {
  // Get the condition label based on the condition type
  const getConditionLabel = () => {
    switch (data.conditionType) {
      case ConditionType.EQUALS:
        return 'Equals';
      case ConditionType.NOT_EQUALS:
        return 'Not Equals';
      case ConditionType.GREATER_THAN:
        return 'Greater Than';
      case ConditionType.LESS_THAN:
        return 'Less Than';
      case ConditionType.CONTAINS:
        return 'Contains';
      case ConditionType.NOT_CONTAINS:
        return 'Not Contains';
      case ConditionType.REGEX:
        return 'Regex Match';
      case ConditionType.CUSTOM:
        return 'Custom Logic';
      default:
        return 'Condition';
    }
  };

  return (
    <div className={`relative p-3 rounded-lg shadow-md bg-gradient-to-r from-yellow-900 to-amber-900 border-2 ${selected ? 'border-white' : 'border-yellow-700'} text-white w-64`}>
      {/* Input handle */}
      <Handle
        type="target"
        position={Position.Top}
        isConnectable={isConnectable}
        className="w-3 h-3 bg-yellow-500"
      />
      
      {/* Condition header */}
      <div className="flex items-center mb-2">
        <div className="bg-yellow-700 p-1.5 rounded mr-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div className="font-bold text-lg truncate flex-1">{data.name || 'Condition'}</div>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Badge variant="outline" className="ml-2 bg-yellow-800 text-white border-yellow-700">
                Condition
              </Badge>
            </TooltipTrigger>
            <TooltipContent>
              <p>Condition Node</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
      
      {/* Condition details */}
      <div className="space-y-2 mb-3">
        <div className="text-sm">
          <span className="text-yellow-300">Type:</span> {getConditionLabel()}
        </div>
        
        {data.field && (
          <div className="text-sm">
            <span className="text-yellow-300">Field:</span> {data.field}
          </div>
        )}
        
        {data.value !== undefined && (
          <div className="text-sm">
            <span className="text-yellow-300">Value:</span> {data.value}
          </div>
        )}
      </div>
      
      {/* True output handle */}
      <Handle
        type="source"
        position={Position.Bottom}
        id="true"
        style={{ left: '30%' }}
        isConnectable={isConnectable}
        className="w-3 h-3 bg-green-500"
      />
      
      {/* Labels for the handles */}
      <div className="absolute bottom-[-20px] left-[25%] text-xs text-green-400">True</div>
      <div className="absolute bottom-[-20px] right-[25%] text-xs text-red-400">False</div>
      
      {/* False output handle */}
      <Handle
        type="source"
        position={Position.Bottom}
        id="false"
        style={{ left: '70%' }}
        isConnectable={isConnectable}
        className="w-3 h-3 bg-red-500"
      />
    </div>
  );
});

ConditionNode.displayName = 'ConditionNode';
