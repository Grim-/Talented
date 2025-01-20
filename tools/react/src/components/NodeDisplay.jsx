import React from 'react';
import { Node } from './Node';

const NodeDisplay = ({ 
  nodes, 
  selectedNode, 
  connecting, 
  handleMouseDown, 
  handleNodeSelect, 
  startConnection, 
  setNodes,
  copyToClipboard 
}) => {
  return (
    <div>
      {nodes.map(nodeData => {
        const node = nodeData instanceof Node ? nodeData : new Node(
          nodeData.id,
          nodeData.label,
          nodeData.type,
          nodeData.x,
          nodeData.y
        );

        node.path = nodeData.path;
        node.upgrade = nodeData.upgrade;
        node.connections = nodeData.connections;
        node.branchPaths = nodeData.branchPaths;
        node.upgrades = nodeData.upgrades;
        node.points = nodeData.points;
        
        return node.render({
          selected: selectedNode === node.id,
          connecting: connecting === node.id,
          onMouseDown: (e) => handleMouseDown(e, node.id),
          onClick: (e) => handleNodeSelect(node.id, e),
          onStartConnection: (id) => startConnection(id),
          onDelete: (id) => setNodes(nodes.filter(n => n.id !== id)),
          onCopyProperty: copyToClipboard
        });
      })}
    </div>
  );
};

export default NodeDisplay;