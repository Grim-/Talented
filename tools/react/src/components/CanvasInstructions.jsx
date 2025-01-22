import React, { useState } from 'react';
import { HelpCircle, X, ArrowLeftRight } from 'lucide-react';

const CanvasInstructions = ({ nodes }) => {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <>
      {/* Toggle Button */}
      <button
        onClick={() => setIsVisible(!isVisible)}
        className="fixed right-4 top-32 bg-gray-800 p-2 rounded-md shadow-md hover:bg-gray-700 transition-colors border border-gray-700 z-50"
        title="Getting Started Guide"
      >
        <HelpCircle size={20} className="text-gray-300" />
      </button>

      {/* Instructions Panel */}
      {isVisible && (
        <div className="fixed right-4 top-48 bg-gray-800 rounded-lg shadow-lg border border-gray-700 z-50 w-96 max-h-[70vh] flex flex-col">
          <div className="flex justify-between items-center p-3 border-b border-gray-700">
            <h2 className="text-lg font-semibold text-gray-300">Getting Started</h2>
            <button
              onClick={() => setIsVisible(false)}
              className="text-gray-400 hover:text-gray-300"
            >
              <X size={16} />
            </button>
          </div>

          <div className="overflow-y-auto p-4">
            {/* Basic Actions */}
            <div className="mb-6">
              <h3 className="text-md font-medium mb-3 text-gray-300">Basic Actions</h3>
              <ul className="space-y-2">
                <li className="flex items-start space-x-2">
                  <span className="text-blue-400 flex-shrink-0">➤</span>
                  <span className="text-gray-300">Set a unique name for your TalentTreeDef in the properties panel</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-blue-400 flex-shrink-0">➤</span>
                  <span className="text-gray-300">You must have at least one Start node.</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-blue-400 flex-shrink-0">➤</span>
                  <span className="text-gray-300">Right-click anywhere to add a new node</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-blue-400 flex-shrink-0">➤</span>
                  <span className="text-gray-300">Left-click a node to select and edit its properties</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-blue-400 flex-shrink-0">➤</span>
                  <span className="text-gray-300">Drag nodes to reposition them</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-blue-400 flex-shrink-0">➤</span>
                  <div className="flex items-center space-x-2">
                    <ArrowLeftRight className="text-gray-300" size={16} />
                    <span className="text-gray-300">Click the connect button to draw connections</span>
                  </div>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-blue-400 flex-shrink-0">➤</span>
                  <span className="text-gray-300">Right-click a connection to delete it</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-blue-400 flex-shrink-0">➤</span>
                  <span className="text-gray-300">Define your Trees nodes, their connections and upgrades.</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-blue-400 flex-shrink-0">➤</span>
                  <span className="text-gray-300">Export the resulting XML into your mods `Defs` folder</span>
                </li>
              </ul>
            </div>

            {/* Working with Defs */}
            <div>
              <h3 className="text-md font-medium mb-3 text-gray-300">Working with Defs</h3>
              <ul className="space-y-2">
                <li className="flex items-start space-x-2">
                  <span className="text-blue-400 flex-shrink-0">➤</span>
                  <span className="text-gray-300">Use the Def Editor tab to import your custom TalentDef and TalentPath Defs</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-blue-400 flex-shrink-0">➤</span>
                  <span className="text-gray-300">Import TalentTreeNodeDefs and TalentPathDefs to visualize them</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-blue-400 flex-shrink-0">➤</span>
                  <span className="text-gray-300">Export your talent tree arrangement as XML for use with <a href="https://github.com/Grim-/Talented/wiki" className="text-blue-400 hover:text-blue-300 hover:underline pointer-events-auto" target="_blank" rel="noopener noreferrer">Talented</a></span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default CanvasInstructions;