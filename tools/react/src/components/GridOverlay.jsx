import React, { useEffect, useRef, useState } from 'react';

const GridOverlay = ({ enabled, gridSize = 53 }) => {
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const containerRef = useRef(null);
  const patternId = `grid-${Math.random().toString(36).substr(2, 9)}`;

  useEffect(() => {
    const updateDimensions = () => {
      const container = document.getElementById('mainContent');
      if (container) {
        setDimensions({
          width: container.scrollWidth || window.innerWidth,
          height: container.scrollHeight || window.innerHeight
        });
      } else {
        setDimensions({
          width: window.innerWidth,
          height: window.innerHeight
        });
      }
    };

    updateDimensions();
    
    const resizeObserver = new ResizeObserver((entries) => {
      updateDimensions();
    });

    const container = document.getElementById('mainContent');
    if (container) {
      resizeObserver.observe(container);
    } else {
      resizeObserver.observe(document.body);
    }

    return () => resizeObserver.disconnect();
  }, []);

  if (!enabled) return null;

  return (
    <svg
      ref={containerRef}
      className="fixed top-0 left-0 pointer-events-none"
      style={{
        width: '100vw',
        height: '100vh',
        zIndex: -100, 
        background: 'rgba(255, 255, 255, 0)'
      }}
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <pattern
          id={patternId}
          width={gridSize}
          height={gridSize}
          patternUnits="userSpaceOnUse"
        >
          <path
            d={`M ${gridSize} 0 L 0 0 0 ${gridSize}`}
            fill="none"
            stroke="rgba(255, 255, 255, 0.37)" 
            strokeWidth="1"
          />
        </pattern>
      </defs>
      <rect
        width="100%"
        height="100%"
        fill={`url(#${patternId})`}
      />
    </svg>
  );
};

export default GridOverlay;