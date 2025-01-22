import React, { useEffect, useRef, useState } from 'react';

const GridOverlay = ({ enabled, gridSize = 20 }) => {
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const containerRef = useRef(null);

  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const container = document.getElementById('mainContent');
        if (container) {
          setDimensions({
            width: container.scrollWidth,
            height: container.scrollHeight
          });
        }
      }
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  if (!enabled) return null;

  return (
    <svg
      ref={containerRef}
      className="absolute top-0 left-0 pointer-events-none -z-5"
      width={dimensions.width}
      height={dimensions.height}
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <pattern
          id="grid"
          width={gridSize}
          height={gridSize}
          patternUnits="userSpaceOnUse"
        >
          <path
            d={`M ${gridSize} 0 L 0 0 0 ${gridSize}`}
            fill="none"
            stroke="rgba(255, 255, 255, 0.1)"
            strokeWidth="0.5"
          />
        </pattern>
      </defs>
      <rect
        width="100%"
        height="100%"
        fill="url(#grid)"
      />
    </svg>
  );
};

export default GridOverlay;