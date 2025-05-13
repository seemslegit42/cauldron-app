import React from 'react';
import { EdgeProps, getBezierPath } from 'reactflow';

/**
 * ConnectionLine Component
 *
 * Custom edge component for the workflow builder.
 * Renders a bezier curve with a label and animated flow.
 */
export const ConnectionLine: React.FC<EdgeProps> = ({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  data,
  markerEnd,
  sourceHandle,
}) => {
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  // Determine edge color based on source handle (for condition nodes)
  const edgeColor = sourceHandle === 'false' ? '#ef4444' :
                    sourceHandle === 'true' ? '#22c55e' :
                    '#4f46e5';

  return (
    <>
      {/* Main path */}
      <path
        id={id}
        style={{
          ...style,
          strokeWidth: 2,
          stroke: edgeColor,
        }}
        className="react-flow__edge-path"
        d={edgePath}
        markerEnd={markerEnd}
      />

      {/* Animated flow path */}
      <path
        style={{
          ...style,
          stroke: edgeColor,
          strokeWidth: 2,
          strokeDasharray: 5,
          strokeDashoffset: 0,
          animation: 'flow 30s infinite linear',
          opacity: 0.6,
        }}
        className="react-flow__edge-path-animated"
        d={edgePath}
      />

      {/* Edge label */}
      {data?.label && (
        <foreignObject
          width={100}
          height={40}
          x={labelX - 50}
          y={labelY - 20}
          className="edgebutton-foreignobject"
          requiredExtensions="http://www.w3.org/1999/xhtml"
        >
          <div className="flex justify-center items-center h-full">
            <div className="bg-gray-800 text-white text-xs px-2 py-1 rounded-md shadow-md">
              {data.label}
            </div>
          </div>
        </foreignObject>
      )}
    </>
  );
};
