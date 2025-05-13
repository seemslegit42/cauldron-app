import React, { useState, useEffect } from 'react';
import { Node, Edge } from 'reactflow';
import { NodeType } from '../types';

interface PropertyPanelProps {
  selectedNode: Node | null;
  selectedEdge: Edge | null;
  onNodeChange: (nodeId: string, data: any) => void;
  onEdgeChange: (edgeId: string, data: any) => void;
}

export const PropertyPanel: React.FC<PropertyPanelProps> = ({
  selectedNode,
  selectedEdge,
  onNodeChange,
  onEdgeChange,
}) => {
  const [formData, setFormData] = useState<any>({});

  // Update form data when selected node or edge changes
  useEffect(() => {
    if (selectedNode) {
      setFormData(selectedNode.data || {});
    } else if (selectedEdge) {
      setFormData(selectedEdge.data || {});
    } else {
      setFormData({});
    }
  }, [selectedNode, selectedEdge]);

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    
    // Handle checkbox inputs
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev: any) => ({
        ...prev,
        [name]: checked,
      }));
    } else {
      setFormData((prev: any) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (selectedNode) {
      onNodeChange(selectedNode.id, formData);
    } else if (selectedEdge) {
      onEdgeChange(selectedEdge.id, formData);
    }
  };

  // If no node or edge is selected, show empty panel
  if (!selectedNode && !selectedEdge) {
    return (
      <div className="bg-gray-800 border-l border-gray-700 p-4 w-64 overflow-y-auto">
        <h3 className="text-lg font-bold text-white mb-4">Properties</h3>
        <p className="text-gray-400 text-sm">Select a node or connection to edit its properties.</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 border-l border-gray-700 p-4 w-64 overflow-y-auto">
      <h3 className="text-lg font-bold text-white mb-4">Properties</h3>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Node Properties */}
        {selectedNode && (
          <>
            {/* Agent Node Properties */}
            {selectedNode.type === NodeType.AGENT && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Name</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name || ''}
                    onChange={handleInputChange}
                    className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Role</label>
                  <input
                    type="text"
                    name="role"
                    value={formData.role || ''}
                    onChange={handleInputChange}
                    className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Goal</label>
                  <textarea
                    name="goal"
                    value={formData.goal || ''}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Backstory</label>
                  <textarea
                    name="backstory"
                    value={formData.backstory || ''}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="memory"
                    checked={formData.memory || false}
                    onChange={handleInputChange}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-600 rounded"
                  />
                  <label className="ml-2 block text-sm text-gray-400">Enable Memory</label>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="allowDelegation"
                    checked={formData.allowDelegation || false}
                    onChange={handleInputChange}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-600 rounded"
                  />
                  <label className="ml-2 block text-sm text-gray-400">Allow Delegation</label>
                </div>
              </>
            )}
            
            {/* Task Node Properties */}
            {selectedNode.type === NodeType.TASK && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Description</label>
                  <input
                    type="text"
                    name="description"
                    value={formData.description || ''}
                    onChange={handleInputChange}
                    className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Agent ID</label>
                  <input
                    type="text"
                    name="agentId"
                    value={formData.agentId || ''}
                    onChange={handleInputChange}
                    className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Expected Output</label>
                  <textarea
                    name="expectedOutput"
                    value={formData.expectedOutput || ''}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="contextual"
                    checked={formData.contextual || false}
                    onChange={handleInputChange}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-600 rounded"
                  />
                  <label className="ml-2 block text-sm text-gray-400">Contextual</label>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="async"
                    checked={formData.async || false}
                    onChange={handleInputChange}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-600 rounded"
                  />
                  <label className="ml-2 block text-sm text-gray-400">Async</label>
                </div>
              </>
            )}
            
            {/* Trigger Node Properties */}
            {selectedNode.type === NodeType.TRIGGER && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Trigger Type</label>
                  <select
                    name="triggerType"
                    value={formData.triggerType || 'manual'}
                    onChange={handleInputChange}
                    className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="manual">Manual</option>
                    <option value="scheduled">Scheduled</option>
                    <option value="webhook">Webhook</option>
                    <option value="event">Event</option>
                  </select>
                </div>
                
                {formData.triggerType === 'scheduled' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Schedule (cron)</label>
                    <input
                      type="text"
                      name="configuration.schedule"
                      value={formData.configuration?.schedule || ''}
                      onChange={handleInputChange}
                      placeholder="0 0 * * *"
                      className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                )}
                
                {formData.triggerType === 'webhook' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Webhook URL</label>
                    <input
                      type="text"
                      name="configuration.webhookUrl"
                      value={formData.configuration?.webhookUrl || ''}
                      onChange={handleInputChange}
                      className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                )}
                
                {formData.triggerType === 'event' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Event</label>
                    <input
                      type="text"
                      name="configuration.event"
                      value={formData.configuration?.event || ''}
                      onChange={handleInputChange}
                      className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                )}
              </>
            )}
            
            {/* Condition Node Properties */}
            {selectedNode.type === NodeType.CONDITION && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Condition</label>
                  <textarea
                    name="condition"
                    value={formData.condition || ''}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">True Label</label>
                  <input
                    type="text"
                    name="trueLabel"
                    value={formData.trueLabel || ''}
                    onChange={handleInputChange}
                    className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">False Label</label>
                  <input
                    type="text"
                    name="falseLabel"
                    value={formData.falseLabel || ''}
                    onChange={handleInputChange}
                    className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </>
            )}
            
            {/* Output Node Properties */}
            {selectedNode.type === NodeType.OUTPUT && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Output Type</label>
                  <select
                    name="outputType"
                    value={formData.outputType || 'result'}
                    onChange={handleInputChange}
                    className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="result">Result</option>
                    <option value="notification">Notification</option>
                    <option value="webhook">Webhook</option>
                    <option value="database">Database</option>
                  </select>
                </div>
                
                {formData.outputType === 'notification' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Notification Type</label>
                    <select
                      name="configuration.notificationType"
                      value={formData.configuration?.notificationType || 'email'}
                      onChange={handleInputChange}
                      className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="email">Email</option>
                      <option value="slack">Slack</option>
                      <option value="in-app">In-App</option>
                    </select>
                  </div>
                )}
                
                {formData.outputType === 'webhook' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Webhook URL</label>
                    <input
                      type="text"
                      name="configuration.webhookUrl"
                      value={formData.configuration?.webhookUrl || ''}
                      onChange={handleInputChange}
                      className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                )}
                
                {formData.outputType === 'database' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Table</label>
                    <input
                      type="text"
                      name="configuration.table"
                      value={formData.configuration?.table || ''}
                      onChange={handleInputChange}
                      className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                )}
              </>
            )}
          </>
        )}
        
        {/* Edge Properties */}
        {selectedEdge && (
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Label</label>
            <input
              type="text"
              name="label"
              value={formData.label || ''}
              onChange={handleInputChange}
              className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        )}
        
        <button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors"
        >
          Apply Changes
        </button>
      </form>
    </div>
  );
};
