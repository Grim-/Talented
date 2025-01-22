import React, { useEffect, useState } from 'react';

const TreeSizePreview = ({ width, height }) => {
  const [visible, setVisible] = useState(true);
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    setVisible(true);
    const timer = setTimeout(() => setVisible(false), 2000);
    return () => clearTimeout(timer);
  }, [width, height]);

  useEffect(() => {
    const updateContainerSize = () => {
      const container = document.getElementById('mainContent');
      if (container) {
        const rect = container.getBoundingClientRect();
        const viewportHeight = window.innerHeight - rect.top - 40;
        const viewportWidth = container.clientWidth - 40; 

        setContainerSize({
          width: viewportWidth,
          height: viewportHeight
        });
      }
    };

    updateContainerSize();
    window.addEventListener('resize', updateContainerSize);
    return () => window.removeEventListener('resize', updateContainerSize);
  }, []);

  if (!width || !height || !containerSize.width || !containerSize.height) return null;

  const scaleX = (containerSize.width) / width;
  const scaleY = (containerSize.height) / height;
  const scale = Math.min(scaleX, scaleY, 2);

  const scaledWidth = width * scale;
  const scaledHeight = height * scale;

  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
      <div className="relative" style={{ maxHeight: '100vh' }}>
        {/* Size label */}
        <div 
          className={`absolute -top-6 left-1/2 -translate-x-1/2 bg-gray-100/50 text-white px-2 py-0.5 rounded text-xs
            transition-opacity duration-300 ${visible ? 'opacity-100' : 'opacity-0'}`}
        >
          In-game size: {width}x{height}
        </div>
        
        {/* Size visualization */}
        <div 
          className="border border-gray-100 rounded-lg"
          style={{
            width: `${scaledWidth}px`,
            height: `${scaledHeight}px`,
            transition: 'all 0.3s ease-in-out'
          }}
        >
          {/* Corner indicators */}
          <div className="absolute -top-1 -left-1 w-1.5 h-1.5 bg-gray-400/50 rounded-full" />
          <div className="absolute -top-1 -right-1 w-1.5 h-1.5 bg-gray-400/50 rounded-full" />
          <div className="absolute -bottom-1 -left-1 w-1.5 h-1.5 bg-gray-400/50 rounded-full" />
          <div className="absolute -bottom-1 -right-1 w-1.5 h-1.5 bg-gray-400/50 rounded-full" />
        </div>
      </div>
    </div>
  );
};

export default TreeSizePreview;