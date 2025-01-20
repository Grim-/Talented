import React from 'react';

const ConnectionLines = ({ nodes, connecting, draggingNode, onDeleteConnection }) => {
  const handleLineClick = (sourceId, targetId, e) => {
    e.preventDefault();
    e.stopPropagation();
    onDeleteConnection(sourceId, targetId);
  };

  return (
    <svg className="w-full h-full absolute top-0 left-0 pointer-events-none">
      {nodes.map(node =>
        node.connections.map(targetId => {
          const target = nodes.find(n => n.id === targetId);
          if (!target) return null;
          
          const x1 = node.x + (node.width || 150)/2;
          const y1 = node.y + (node.height || 50)/2;
          const x2 = target.x + (target.width || 150)/2;
          const y2 = target.y + (target.height || 50)/2;
          
          return (
            <g key={`${node.id}-${targetId}`} className="pointer-events-auto">
              {/* Invisible wider line for easier clicking */}
              <line
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke="transparent"
                strokeWidth="10"
                className="cursor-pointer"
                onContextMenu={(e) => handleLineClick(node.id, targetId, e)}
              />
              {/* Visible line */}
              <line
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke="black"
                strokeWidth="2"
                className="cursor-pointer hover:stroke-red-500 transition-colors"
                onContextMenu={(e) => handleLineClick(node.id, targetId, e)}
              />
            </g>
          );
        })
      )}
      {connecting && (
        <line
          x1={nodes.find(n => n.id === connecting)?.x + 75 || 0}
          y1={nodes.find(n => n.id === connecting)?.y + 25 || 0}
          x2={draggingNode ? nodes.find(n => n.id === draggingNode)?.x + 75 : 0}
          y2={draggingNode ? nodes.find(n => n.id === draggingNode)?.y + 25 : 0}
          stroke="blue"
          strokeWidth="2"
          strokeDasharray="5,5"
        />
      )}
    </svg>
  );
};

export default ConnectionLines;