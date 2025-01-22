import React, { useState, useEffect, useRef } from 'react';

const ConnectionLines = ({ nodes, connecting, draggingNode, onDeleteConnection }) => {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const svgRef = useRef(null);
  const containerRef = useRef(null);
  
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (containerRef.current) {
        // Get the scroll position of the container
        const containerRect = containerRef.current.getBoundingClientRect();
        const scrollLeft = containerRef.current.scrollLeft;
        const scrollTop = containerRef.current.scrollTop;
        
        // Calculate mouse position relative to the scrolled container
        setMousePos({
          x: (e.clientX - containerRect.left) + scrollLeft,
          y: (e.clientY - containerRect.top) + scrollTop
        });
      }
    };

    const container = document.getElementById('mainContent');
    if (container) {
      containerRef.current = container;
    }

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

  // Calculate connection points on the edges of nodes
  const getConnectionPoints = (source, target) => {
    const sourceCenter = {
      x: source.x + source.width / 2,
      y: source.y + source.height / 2
    };
    
    const targetCenter = {
      x: target.x + target.width / 2,
      y: target.y + target.height / 2
    };

    // Calculate angle between centers
    const angle = Math.atan2(
      targetCenter.y - sourceCenter.y,
      targetCenter.x - sourceCenter.x
    );

    // Calculate intersection points with node boundaries
    const sourcePoint = {
      x: sourceCenter.x + Math.cos(angle) * (source.width / 2),
      y: sourceCenter.y + Math.sin(angle) * (source.height / 2)
    };

    const targetPoint = {
      x: targetCenter.x - Math.cos(angle) * (target.width / 2),
      y: targetCenter.y - Math.sin(angle) * (target.height / 2)
    };

    return { source: sourcePoint, target: targetPoint };
  };

  // Handle the preview connection line
  const renderPreviewLine = () => {
    if (!connecting) return null;

    const sourceNode = nodes.find(n => n.id === connecting);
    if (!sourceNode) return null;

    const sourceX = sourceNode.x + sourceNode.width / 2;
    const sourceY = sourceNode.y + sourceNode.height / 2;

    let targetX = mousePos.x;
    let targetY = mousePos.y;

    if (draggingNode) {
      const targetNode = nodes.find(n => n.id === draggingNode);
      if (targetNode) {
        targetX = targetNode.x + targetNode.width / 2;
        targetY = targetNode.y + targetNode.height / 2;
      }
    }

    return (
      <line
        x1={sourceX}
        y1={sourceY}
        x2={targetX}
        y2={targetY}
        stroke="blue"
        strokeWidth="2"
        strokeDasharray="5,5"
        markerEnd="url(#arrowhead)"
      />
    );
  };

  return (
    <svg 
      ref={svgRef}
      className="w-full h-full absolute top-0 left-0 pointer-events-none"
    >
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
      
      {renderPreviewLine()}
    </svg>
  );
};

export default ConnectionLines;