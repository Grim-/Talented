import { useState, useCallback } from 'react';

export const useNodeManager = (initialNodes = []) => {
  const [nodes, setNodes] = useState(initialNodes);
  const [selectedNode, setSelectedNode] = useState(null);

  const addNode = useCallback((nodeData) => {
    const newId = `node_${Date.now()}`;
    setNodes(prev => [...prev, {
      id: newId,
      label: 'New Node',
      type: 'Normal',
      x: 400,
      y: 200,
      connections: [],
      path: '',
      upgrade: '',
      branchPaths: [],
      ...nodeData
    }]);
    setSelectedNode(newId);
    return newId;
  }, []);

  const updateNode = useCallback((nodeId, updates) => {
    setNodes(prev => prev.map(node =>
      node.id === nodeId ? { ...node, ...updates } : node
    ));
  }, []);

  const deleteNode = useCallback((nodeId) => {
    setNodes(prev => prev.filter(n => n.id !== nodeId));
    if (selectedNode === nodeId) setSelectedNode(null);
  }, [selectedNode]);

  return {
    nodes,
    setNodes,
    selectedNode,
    setSelectedNode,
    addNode,
    updateNode,
    deleteNode
  };
};
