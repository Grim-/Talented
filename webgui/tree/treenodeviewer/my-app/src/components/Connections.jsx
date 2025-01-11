import React, { memo } from 'react';

const Connections = memo(({ nodes, connecting }) => (
  <svg className="w-full h-full absolute top-0 left-0 pointer-events-none">
    {nodes.map(node =>
      node.connections.map(targetId => {
        const target = nodes.find(n => n.id === targetId);
        if (!target) return null;
        return (
          <line
            key={`${node.id}-${targetId}`}
            x1={node.x + 75}
            y1={node.y + 25}
            x2={target.x + 75}
            y2={target.y + 25}
            stroke="black"
            strokeWidth="2"
          />
        );
      })
    )}
    {connecting && (
      <line
        x1={nodes.find(n => n.id === connecting)?.x + 75 || 0}
        y1={nodes.find(n => n.id === connecting)?.y + 25 || 0}
        x2={0}
        y2={0}
        stroke="blue"
        strokeWidth="2"
        strokeDasharray="5,5"
      />
    )}
  </svg>
));

export default Connections;
