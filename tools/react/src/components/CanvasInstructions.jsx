import React from 'react';

const CanvasInstructions = ({ nodes }) => {
  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
      <div className="bg-white/5 p-8 rounded-lg shadow-lg max-w-2xl text-gray-700">
        <h2 className="text-2xl font-semibold mb-6 text-gray-900">Getting Started</h2>  
        {/* Basic Actions */}
        <div className="mb-6">
          <h3 className="text-lg font-medium mb-3 text-gray-800">Basic Actions</h3>
          <ul className="space-y-2">
            <li className="flex items-start space-x-2">
              <span className="text-blue-500">➤</span>
              <span>Right-click anywhere to add a new node</span>
            </li>
            <li className="flex items-start space-x-2">
              <span className="text-blue-500">➤</span>
              <span>Click a node to select and edit its properties</span>
            </li>
            <li className="flex items-start space-x-2">
              <span className="text-blue-500">➤</span>
              <span>Drag nodes to reposition them</span>
            </li>
            <li className="flex items-start space-x-2">
              <span className="text-blue-500">➤</span>
              <span>Click the connect button (⚡) to draw connections between nodes</span>
            </li>
          </ul>
        </div>

        {/* Advanced Features */}
        <div>
          <h3 className="text-lg font-medium mb-3 text-gray-800">Working with Defs</h3>
          <ul className="space-y-2">
            <li className="flex items-start space-x-2">
              <span className="text-blue-500">➤</span>
              <span>Use the Def Editor tab to import your custom TalentDef and TalentPath Defs</span>
            </li>
            <li className="flex items-start space-x-2">
              <span className="text-blue-500">➤</span>
              <span>Import TalentTreeNodeDefs and TalentPathDefs to visualize them on screen</span>
            </li>
            <li className="flex items-start space-x-2">
              <span className="text-blue-500">➤</span>
              <span>Export your talent tree arrangement as XML for use with <a href="https://github.com/Grim-/Talented/wiki" className="text-blue-500 hover:underline pointer-events-auto" target="_blank" rel="noopener noreferrer">Talented</a></span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default CanvasInstructions;