import React, { useState, useCallback, useRef, useEffect } from 'react';
import ReactFlow, {
  ReactFlowProvider,
  Background,
  Controls,
  MiniMap,
  addEdge,
  useNodesState,
  useEdgesState,
  Node,
  Edge,
  Connection,
  NodeTypes,
  EdgeTypes,
  OnConnect,
  OnNodesChange,
  OnEdgesChange,
  NodeChange,
  EdgeChange,
  XYPosition,
  useReactFlow,
} from 'reactflow';
import 'reactflow/dist/style.css';

import { AgentNode } from './nodes/AgentNode';
import { TaskNode } from './nodes/TaskNode';
import { TriggerNode } from './nodes/TriggerNode';
import { ConditionNode } from './nodes/ConditionNode';
import { OutputNode } from './nodes/OutputNode';
import { ConnectionLine } from './ConnectionLine';
import { NodeType } from '../types';

// Define custom node types
const nodeTypes: NodeTypes = {
  [NodeType.AGENT]: AgentNode,
  [NodeType.TASK]: TaskNode,
  [NodeType.TRIGGER]: TriggerNode,
  [NodeType.CONDITION]: ConditionNode,
  [NodeType.OUTPUT]: OutputNode,
};

// Define custom edge types
const edgeTypes: EdgeTypes = {
  default: ConnectionLine,
};

interface WorkflowCanvasProps {
  initialNodes?: Node[];
  initialEdges?: Edge[];
  onNodesChange?: (nodes: Node[]) => void;
  onEdgesChange?: (edges: Edge[]) => void;
  onSave?: (nodes: Node[], edges: Edge[]) => void;
  readOnly?: boolean;
}

const WorkflowCanvas: React.FC<WorkflowCanvasProps> = ({
  initialNodes = [],
  initialEdges = [],
  onNodesChange,
  onEdgesChange,
  onSave,
  readOnly = false,
}) => {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [nodes, setNodes, onNodesChangeInternal] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChangeInternal] = useEdgesState(initialEdges);
  const [reactFlowInstance, setReactFlowInstance] = useState<any>(null);
  const { project } = useReactFlow();

  // Handle node changes
  const handleNodesChange: OnNodesChange = useCallback(
    (changes: NodeChange[]) => {
      onNodesChangeInternal(changes);
      if (onNodesChange) {
        onNodesChange(nodes);
      }
    },
    [nodes, onNodesChange, onNodesChangeInternal]
  );

  // Handle edge changes
  const handleEdgesChange: OnEdgesChange = useCallback(
    (changes: EdgeChange[]) => {
      onEdgesChangeInternal(changes);
      if (onEdgesChange) {
        onEdgesChange(edges);
      }
    },
    [edges, onEdgesChange, onEdgesChangeInternal]
  );

  // Handle connections between nodes
  const onConnect: OnConnect = useCallback(
    (connection: Connection) => {
      const newEdge = {
        ...connection,
        id: `edge-${connection.source}-${connection.target}`,
        type: 'default',
        animated: true,
        style: { stroke: '#4f46e5' },
      };
      setEdges((eds) => addEdge(newEdge, eds));
      if (onEdgesChange) {
        onEdgesChange([...edges, newEdge as Edge]);
      }
    },
    [edges, onEdgesChange, setEdges]
  );

  // Handle dropping a new node onto the canvas
  const onDrop = useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();

      if (!reactFlowWrapper.current || !reactFlowInstance) {
        return;
      }

      const reactFlowBounds = reactFlowWrapper.current.getBoundingClientRect();
      const nodeType = event.dataTransfer.getData('application/reactflow/type') as NodeType;
      const nodeData = JSON.parse(event.dataTransfer.getData('application/reactflow/data') || '{}');

      // Get the position where the node was dropped
      const position = reactFlowInstance.project({
        x: event.clientX - reactFlowBounds.left,
        y: event.clientY - reactFlowBounds.top,
      }) as XYPosition;

      // Create a new node
      const newNode: Node = {
        id: `node-${Date.now()}`,
        type: nodeType,
        position,
        data: nodeData,
      };

      // Add the new node to the canvas
      setNodes((nds) => nds.concat(newNode));
      if (onNodesChange) {
        onNodesChange([...nodes, newNode]);
      }
    },
    [reactFlowInstance, nodes, onNodesChange, setNodes]
  );

  // Handle drag over event
  const onDragOver = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  // Save the workflow
  const handleSave = useCallback(() => {
    if (onSave) {
      onSave(nodes, edges);
    }
  }, [nodes, edges, onSave]);

  return (
    <div className="h-full w-full flex flex-col">
      <div className="flex justify-between items-center p-4 bg-gray-800 border-b border-gray-700">
        <h2 className="text-xl font-bold text-white">Workflow Designer</h2>
        {!readOnly && (
          <button
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
            onClick={handleSave}
          >
            Save Workflow
          </button>
        )}
      </div>
      <div className="flex-grow" ref={reactFlowWrapper}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={handleNodesChange}
          onEdgesChange={handleEdgesChange}
          onConnect={onConnect}
          onInit={setReactFlowInstance}
          onDrop={onDrop}
          onDragOver={onDragOver}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          fitView
          attributionPosition="bottom-right"
          minZoom={0.2}
          maxZoom={4}
          defaultViewport={{ x: 0, y: 0, zoom: 1 }}
          deleteKeyCode="Delete"
          multiSelectionKeyCode="Control"
          selectionKeyCode="Shift"
          snapToGrid
          snapGrid={[15, 15]}
          connectionLineStyle={{ stroke: '#4f46e5', strokeWidth: 2 }}
          connectionLineType="bezier"
          defaultEdgeOptions={{
            type: 'default',
            animated: true,
            style: { stroke: '#4f46e5', strokeWidth: 2 },
          }}
          readOnly={readOnly}
        >
          <Background color="#333" gap={16} />
          <Controls />
          <MiniMap
            nodeStrokeColor={(n) => {
              if (n.type === NodeType.AGENT) return '#ff0072';
              if (n.type === NodeType.TASK) return '#0041d0';
              if (n.type === NodeType.TRIGGER) return '#00d084';
              if (n.type === NodeType.CONDITION) return '#ff9900';
              if (n.type === NodeType.OUTPUT) return '#7950f2';
              return '#eee';
            }}
            nodeColor={(n) => {
              if (n.type === NodeType.AGENT) return '#ff0072';
              if (n.type === NodeType.TASK) return '#0041d0';
              if (n.type === NodeType.TRIGGER) return '#00d084';
              if (n.type === NodeType.CONDITION) return '#ff9900';
              if (n.type === NodeType.OUTPUT) return '#7950f2';
              return '#fff';
            }}
            maskColor="rgba(0, 0, 0, 0.5)"
          />
        </ReactFlow>
      </div>
    </div>
  );
};

// Wrap the component with ReactFlowProvider
export const WorkflowCanvasWithProvider: React.FC<WorkflowCanvasProps> = (props) => {
  return (
    <ReactFlowProvider>
      <WorkflowCanvas {...props} />
    </ReactFlowProvider>
  );
};

export default WorkflowCanvasWithProvider;
