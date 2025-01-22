import React, { useState } from 'react';
import { Node } from './Node';

const NodeDisplay = ({ 
  nodes, 
  selectedNode, 
  connecting, 
  handleMouseDown, 
  handleNodeSelect, 
  startConnection, 
  setNodes,
  copyToClipboard,
  onContextMenuClick
}) => {
  const [expandedNodes, setExpandedNodes] = useState(new Set());

  const handleToggleExpand = (nodeId) => {
    setExpandedNodes(prev => {
      const newSet = new Set(prev);
      if (newSet.has(nodeId)) {
        newSet.delete(nodeId);
      } else {
        newSet.add(nodeId);
      }
      return newSet;
    });
  };

  const handleNodeClick = (e, nodeId) => {
    e.stopPropagation();
    handleNodeSelect(nodeId, e);
  };

  return (
    <div>
      {nodes.map(nodeData => {
        const node = nodeData instanceof Node ? nodeData : new Node(
          nodeData.id,
          nodeData.label,
          nodeData.type,
          nodeData.x,
          nodeData.y,
          nodeData.width,
          nodeData.height
        );

        node.path = nodeData.path;
        node.upgrade = nodeData.upgrade;
        node.connections = nodeData.connections;
        node.branchPaths = nodeData.branchPaths;
        node.upgrades = nodeData.upgrades;
        node.points = nodeData.points;
        node.levelRequired = nodeData.levelRequired;
        node.x = nodeData.x;
        node.y = nodeData.y;
        node.width = nodeData.width;
        node.height = nodeData.height;

        return React.cloneElement(
          node.render({
            selected: selectedNode === node.id,
            connecting: connecting === node.id,
            onMouseDown: (e) => {
              if (e.target.tagName.toLowerCase() !== 'input') {
                handleMouseDown(e, node.id);
              }
            },
            onClick: (e) => handleNodeClick(e, node.id),
            onContextMenu: (e) => onContextMenuClick(e, node.id),
            onStartConnection: (id) => startConnection(id),
            onDelete: (id) => setNodes(nodes.filter(n => n.id !== id)),
            onCopyProperty: copyToClipboard,
            expanded: expandedNodes.has(node.id),
            onToggleExpand: handleToggleExpand
          }),
          { key: node.id }
        );
      })}
    </div>
  );
};

export default NodeDisplay;