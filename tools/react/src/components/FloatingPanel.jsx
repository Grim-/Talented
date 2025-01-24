import React, { useState } from 'react';
import { X } from 'lucide-react';

const FloatingPanel = ({
  isInitiallyVisible = false,
  buttonIcon: ButtonIcon,
  buttonPosition = 'right-4',
  buttonTitle,
  panelPosition = 'right-4 top-48',
  panelWidth = 'w-96',
  title,
  children,
  className = ''
}) => {
  const [isVisible, setIsVisible] = useState(isInitiallyVisible || false);

  return (
    <>
      {/* Toggle Button */}
      <button
        onClick={() => setIsVisible(!isVisible)}
        className={`fixed ${buttonPosition} bg-gray-800 p-2 rounded-md shadow-md hover:bg-gray-700 transition-colors border border-gray-700 z-50`}
        title={buttonTitle}
      >
        <ButtonIcon size={20} className="text-gray-300" />
      </button>

      {/* Panel */}
      {isVisible && (
        <div className={`fixed ${panelPosition} bg-gray-800 rounded-lg shadow-lg border border-gray-700 z-50 ${panelWidth} max-h-[70vh] flex flex-col ${className}`}>
          <div className="flex justify-between items-center p-3 border-b border-gray-700">
            <h2 className="text-lg font-semibold text-gray-300">{title}</h2>
            <button
              onClick={() => setIsVisible(false)}
              className="text-gray-400 hover:text-gray-300"
            >
              <X size={16} />
            </button>
          </div>

          <div className="overflow-y-auto p-4">
            {children}
          </div>
        </div>
      )}
    </>
  );
};

export default FloatingPanel;