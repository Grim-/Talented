import React, { useState, useEffect } from 'react';

const ConnectionLines = ({ nodes, connecting, draggingNode, onDeleteConnection }) => {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  
  useEffect(() => {
    const handleMouseMove = (e) => {
      // Get position relative to the SVG container
      const svg = document.getElementById('mainContent');
      if (svg) {
        const rect = svg.getBoundingClientRect();
        setMousePos({
          x: e.clientX - rect.left,
          y: e.clientY - rect.top
        });
      }
    };

    if (connecting && !draggingNode) {
      window.addEventListener('mousemove', handleMouseMove);
      return () => window.removeEventListener('mousemove', handleMouseMove);
    }
  }, [connecting, draggingNode]);

  const handleLineClick = (sourceId, targetId, e) => {
    e.preventDefault();
    e.stopPropagation();
    onDeleteConnection(sourceId, targetId);
  };

  // Calculate connection points on the edges of nodes instead of center
  const getConnectionPoints = (source, target) => {
    const sourceWidth = source.width || 150;
    const sourceHeight = source.height || 50;
    const targetWidth = target.width || 150;
    const targetHeight = target.height || 50;

    // Calculate center points
    const sourceX = source.x + sourceWidth / 2;
    const sourceY = source.y + sourceHeight / 2;
    const targetX = target.x + targetWidth / 2;
    const targetY = target.y + targetHeight / 2;

    // Calculate angle between nodes
    const angle = Math.atan2(targetY - sourceY, targetX - sourceX);

    // Calculate intersection points with node boundaries
    const sourceIntersect = {
      x: sourceX + Math.cos(angle) * sourceWidth / 2,
      y: sourceY + Math.sin(angle) * sourceHeight / 2
    };

    const targetIntersect = {
      x: targetX - Math.cos(angle) * targetWidth / 2,
      y: targetY - Math.sin(angle) * targetHeight / 2
    };

    return { source: sourceIntersect, target: targetIntersect };
  };

  return (
    <svg className="w-full h-full absolute top-0 left-0 pointer-events-none">
      <defs>
        <marker
          id="arrowhead"
          markerWidth="10"
          markerHeight="7"
          refX="7"
          refY="3.5"
          orient="auto"
        >
          <polygon points="0 0, 10 3.5, 0 7" fill="black" />
        </marker>
        <marker
          id="arrowhead-hover"
          markerWidth="10"
          markerHeight="7"
          refX="7"
          refY="3.5"
          orient="auto"
        >
          <polygon points="0 0, 10 3.5, 0 7" fill="#ef4444" />
        </marker>
      </defs>
      
      {nodes.map(node =>
        node.connections.map(targetId => {
          const target = nodes.find(n => n.id === targetId);
          if (!target) return null;
          
          const points = getConnectionPoints(node, target);
          
          return (
            <g key={`${node.id}-${targetId}`} className="pointer-events-auto">
              {/* Invisible wider line for easier clicking */}
              <line
                x1={points.source.x}
                y1={points.source.y}
                x2={points.target.x}
                y2={points.target.y}
                stroke="transparent"
                strokeWidth="10"
                className="cursor-pointer"
                onContextMenu={(e) => handleLineClick(node.id, targetId, e)}
              />
              {/* Visible line with arrow */}
              <line
                x1={points.source.x}
                y1={points.source.y}
                x2={points.target.x}
                y2={points.target.y}
                stroke="black"
                strokeWidth="2"
                markerEnd="url(#arrowhead)"
                className="cursor-pointer hover:stroke-red-500 transition-colors [&:hover]:marker-end-[url(#arrowhead-hover)]"
                onContextMenu={(e) => handleLineClick(node.id, targetId, e)}
              />
            </g>
          );
        })
      )}
      {connecting && (
        <line
          x1={nodes.find(n => n.id === connecting)?.x + (nodes.find(n => n.id === connecting)?.width || 150) / 2 || 0}
          y1={nodes.find(n => n.id === connecting)?.y + (nodes.find(n => n.id === connecting)?.height || 50) / 2 || 0}
          x2={draggingNode 
            ? nodes.find(n => n.id === draggingNode)?.x + (nodes.find(n => n.id === draggingNode)?.width || 150) / 2 
            : mousePos.x}
          y2={draggingNode 
            ? nodes.find(n => n.id === draggingNode)?.y + (nodes.find(n => n.id === draggingNode)?.height || 50) / 2 
            : mousePos.y}
          stroke="blue"
          strokeWidth="2"
          strokeDasharray="5,5"
          markerEnd="url(#arrowhead)"
        />
      )}
    </svg>
  );
};

export default ConnectionLines;