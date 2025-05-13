import React from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { Badge } from '@src/shared/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@src/shared/components/ui/tooltip';

// Base node styles
const baseNodeStyle = {
  padding: '10px',
  borderRadius: '5px',
  width: '180px',
  fontSize: '12px',
};

// Node status badge
const NodeStatusBadge: React.FC<{ status: string }> = ({ status }) => {
  let variant: 'default' | 'secondary' | 'destructive' | 'outline' | 'success' = 'outline';
  
  switch (status) {
    case 'completed':
      variant = 'success';
      break;
    case 'running':
      variant = 'default';
      break;
    case 'failed':
      variant = 'destructive';
      break;
    case 'pending':
      variant = 'secondary';
      break;
    default:
      variant = 'outline';
  }
  
  return (
    <Badge variant={variant} className="text-xs">
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </Badge>
  );
};

// LLM Node
const LLMNode: React.FC<NodeProps> = ({ data, isConnectable }) => {
  const status = data.execution?.status || 'pending';
  const duration = data.execution?.duration 
    ? `${(data.execution.duration / 1000).toFixed(2)}s` 
    : '';
  
  return (
    <div
      style={{
        ...baseNodeStyle,
        background: 'linear-gradient(to right, #ff0072, #7928ca)',
        border: '1px solid #ff0072',
      }}
      className="shadow-md text-white"
    >
      <Handle
        type="target"
        position={Position.Top}
        isConnectable={isConnectable}
        className="w-2 h-2"
      />
      
      <div className="flex justify-between items-center mb-2">
        <div className="font-bold truncate">{data.label || 'LLM Node'}</div>
        <NodeStatusBadge status={status} />
      </div>
      
      <div className="text-xs opacity-80 mb-1">
        {data.model || 'Default Model'}
      </div>
      
      {duration && (
        <div className="text-xs opacity-80">
          Duration: {duration}
        </div>
      )}
      
      <Handle
        type="source"
        position={Position.Bottom}
        isConnectable={isConnectable}
        className="w-2 h-2"
      />
    </div>
  );
};

// Tool Node
const ToolNode: React.FC<NodeProps> = ({ data, isConnectable }) => {
  const status = data.execution?.status || 'pending';
  const duration = data.execution?.duration 
    ? `${(data.execution.duration / 1000).toFixed(2)}s` 
    : '';
  
  return (
    <div
      style={{
        ...baseNodeStyle,
        background: 'linear-gradient(to right, #0041d0, #2563eb)',
        border: '1px solid #0041d0',
      }}
      className="shadow-md text-white"
    >
      <Handle
        type="target"
        position={Position.Top}
        isConnectable={isConnectable}
        className="w-2 h-2"
      />
      
      <div className="flex justify-between items-center mb-2">
        <div className="font-bold truncate">{data.label || 'Tool Node'}</div>
        <NodeStatusBadge status={status} />
      </div>
      
      <div className="text-xs opacity-80 mb-1">
        {data.toolName || 'Function'}
      </div>
      
      {duration && (
        <div className="text-xs opacity-80">
          Duration: {duration}
        </div>
      )}
      
      <Handle
        type="source"
        position={Position.Bottom}
        isConnectable={isConnectable}
        className="w-2 h-2"
      />
    </div>
  );
};

// Condition Node
const ConditionNode: React.FC<NodeProps> = ({ data, isConnectable }) => {
  const status = data.execution?.status || 'pending';
  
  return (
    <div
      style={{
        ...baseNodeStyle,
        background: 'linear-gradient(to right, #ff9900, #ffb144)',
        border: '1px solid #ff9900',
      }}
      className="shadow-md text-white"
    >
      <Handle
        type="target"
        position={Position.Top}
        isConnectable={isConnectable}
        className="w-2 h-2"
      />
      
      <div className="flex justify-between items-center mb-2">
        <div className="font-bold truncate">{data.label || 'Condition'}</div>
        <NodeStatusBadge status={status} />
      </div>
      
      <div className="text-xs opacity-80">
        {data.condition || 'Evaluates condition'}
      </div>
      
      <Handle
        type="source"
        position={Position.Bottom}
        isConnectable={isConnectable}
        className="w-2 h-2"
      />
    </div>
  );
};

// Default Node
const DefaultNode: React.FC<NodeProps> = ({ data, isConnectable }) => {
  const status = data.execution?.status || 'pending';
  
  return (
    <div
      style={{
        ...baseNodeStyle,
        background: 'linear-gradient(to right, #6b7280, #4b5563)',
        border: '1px solid #6b7280',
      }}
      className="shadow-md text-white"
    >
      <Handle
        type="target"
        position={Position.Top}
        isConnectable={isConnectable}
        className="w-2 h-2"
      />
      
      <div className="flex justify-between items-center mb-2">
        <div className="font-bold truncate">{data.label || 'Node'}</div>
        <NodeStatusBadge status={status} />
      </div>
      
      <div className="text-xs opacity-80">
        {data.type || 'Generic node'}
      </div>
      
      <Handle
        type="source"
        position={Position.Bottom}
        isConnectable={isConnectable}
        className="w-2 h-2"
      />
    </div>
  );
};

// Export all node types
export const LangGraphNodeTypes = {
  LLMNode,
  ToolNode,
  ConditionNode,
  DefaultNode,
};
