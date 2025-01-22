import React, { useState } from 'react';
import { Map, X } from 'lucide-react';

const Minimap = ({ width, height, nodes, paths }) => {
  const [isVisible, setIsVisible] = useState(false);

  // Calculate the actual bounds of all nodes
  const getBounds = () => {
    if (!nodes || nodes.length === 0) return { minX: 0, maxX: 0, minY: 0, maxY: 0 };
    
    return nodes.reduce((bounds, node) => ({
      minX: Math.min(bounds.minX, node.x),
      maxX: Math.max(bounds.maxX, node.x + (node.width || 150)),
      minY: Math.min(bounds.minY, node.y),
      maxY: Math.max(bounds.maxY, node.y + (node.height || 80))
    }), {
      minX: nodes[0].x,
      maxX: nodes[0].x + (nodes[0].width || 150),
      minY: nodes[0].y,
      maxY: nodes[0].y + (nodes[0].height || 80)
    });
  };

  const renderConnections = (scale, bounds) => {
    if (!paths) return null;
    
    return paths.map((path, index) => {
      const fromNode = nodes.find(n => n.id === path.from);
      const toNode = nodes.find(n => n.id === path.to);
      
      if (!fromNode || !toNode) return null;

      const startX = (fromNode.x - bounds.minX) * scale + 20;
      const startY = (fromNode.y - bounds.minY) * scale + 20;
      const endX = (toNode.x - bounds.minX) * scale + 20;
      const endY = (toNode.y - bounds.minY) * scale + 20;

      return (
        <line
          key={`path-${index}`}
          x1={startX + 2}
          y1={startY + 2}
          x2={endX + 2}
          y2={endY + 2}
          stroke="rgba(156, 163, 175, 0.5)"
          strokeWidth="1"
        />
      );
    });
  };

  const renderContent = () => {
    if (!nodes || nodes.length === 0) return null;

    const bounds = getBounds();
    const contentWidth = bounds.maxX - bounds.minX;
    const contentHeight = bounds.maxY - bounds.minY;

    // Calculate scale factors for a 200x150 minimap
    const scaleX = (200 - 40) / contentWidth;
    const scaleY = (150 - 40) / contentHeight;
    const scale = Math.min(scaleX, scaleY);

    return (
      <>
        <svg
          className="absolute inset-0"
          width="200"
          height="150"
          style={{ zIndex: 1 }}
        >
          {renderConnections(scale, bounds)}
        </svg>
        
        {nodes.map(node => (
          <div
            key={node.id}
            className="absolute w-4 h-4 bg-blue-400/20 border border-blue-500/30 rounded"
            style={{
              transform: `translate(${(node.x - bounds.minX) * scale + 20}px, ${(node.y - bounds.minY) * scale + 20}px)`,
              transition: 'all 0.3s ease-in-out',
              zIndex: 2
            }}
          />
        ))}
      </>
    );
  };

  return (
    <>
      {/* Toggle Button */}
      <button
        onClick={() => setIsVisible(!isVisible)}
        className="fixed right-4 top-20 bg-white p-2 rounded-md shadow-md hover:bg-gray-50 transition-colors border border-gray-200 z-50"
        title="Toggle Minimap"
      >
        <Map size={20} className="text-gray-600" />
      </button>

      {/* Minimap Panel */}
      {isVisible && (
        <div className="fixed right-4 top-36 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
          <div className="flex justify-between items-center p-2 border-b border-gray-200">
            <span className="text-sm font-medium text-gray-700">Minimap</span>
            <button
              onClick={() => setIsVisible(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <X size={16} />
            </button>
          </div>
          <div className="relative w-[200px] h-[150px] overflow-hidden">
            {renderContent()}
          </div>
        </div>
      )}
    </>
  );
};

export default Minimap;