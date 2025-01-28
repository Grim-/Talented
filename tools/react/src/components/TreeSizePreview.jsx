import React, { useEffect, useState } from 'react';

const TreeSizePreview = ({ width, height, bgImage = '', useAspectRatioPreview = false }) => {
  const [visible, setVisible] = useState(true);
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
  const [currentBgImage, setCurrentBgImage] = useState('');
  
  // Load background image from localStorage on mount
  useEffect(() => {
    const savedBgImage = localStorage.getItem('treeSizePreviewBg');
    if (savedBgImage) {
      setCurrentBgImage(savedBgImage);
    }
  }, []);

  // Update localStorage when bgImage prop changes
  useEffect(() => {
    if (bgImage) {
      setCurrentBgImage(bgImage);
      localStorage.setItem('treeSizePreviewBg', bgImage);
    }
  }, [bgImage]);

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

  const BASE_DISPLAY_WIDTH = 600;
  const WEB_APP_SCALE = 1.5;

  const baseWidthScale = (BASE_DISPLAY_WIDTH / width) * WEB_APP_SCALE;

  let scale;
  if (useAspectRatioPreview)
    {
    scale = Math.min(baseWidthScale, 4); 
  } 
  else 
  {
    const scaleX = (containerSize.width / width) * WEB_APP_SCALE;
    const scaleY = (containerSize.height / height) * WEB_APP_SCALE;
    scale = Math.min(scaleX, scaleY, 4); // Increased cap to 4
  }

  const scaledWidth = width * scale;
  const scaledHeight = height * scale;

  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-1">
      <div className="relative" style={{ maxHeight: '100vh', zIndex: 1 }}>
        {/* Size label */}
        <div 
          className={`absolute -top-6 left-1/2 -translate-x-1/2 bg-gray-100/50 text-white px-2 py-0.5 rounded text-xs
            transition-opacity duration-300 ${visible ? 'opacity-100' : 'opacity-0'}`}
        >
          In-game size: {width}x{height}
        </div>
        
        {/* Size visualization with background image */}
        <div 
          className="border border-gray-100 rounded-lg overflow-hidden"
          style={{
            width: `${scaledWidth}px`,
            height: `${scaledHeight}px`,
            transition: 'all 0.3s ease-in-out',
            backgroundImage: currentBgImage ? `url(${currentBgImage})` : 'none',
            backgroundSize: 'contain',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            backgroundColor: 'rgba(0, 0, 0, 0.2)',
            zIndex: -1
          }}
        >
          {/* Corner indicators */}
          <div className="absolute -top-1 -left-1 w-1.5 h-1.5 bg-gray-400/50 rounded-full" />
          <div className="absolute -top-1 -right-1 w-1.5 h-1.5 bg-gray-400/50 rounded-full" />
          <div className="absolute -bottom-1 -left-1 w-1.5 h-1.5 bg-gray-400/50 rounded-full" />
          <div className="absolute -bottom-1 -right-1 w-1.5 h-1.5 bg-gray-400/50 rounded-full" />
        </div>

        {/* Clear background button - only show when there's a background image */}
        {currentBgImage && (
          <button
            onClick={() => {
              setCurrentBgImage('');
              localStorage.removeItem('treeSizePreviewBg');
            }}
            className="absolute -top-6 right-0 bg-red-500 text-white px-2 py-0.5 rounded text-xs pointer-events-auto hover:bg-red-600"
          >
            Clear Background
          </button>
        )}
      </div>
    </div>
  );
};

export default TreeSizePreview;