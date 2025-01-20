import React, { useState } from 'react';
import { ArrowLeftRight, ChevronDown, ChevronUp } from 'lucide-react';

const CanvasInstructions = ({ nodes }) => {
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <div className="fixed bottom-4 right-4">
      <div className={`bg-white/5 rounded-lg shadow-lg transition-all duration-300 ease-in-out ${isExpanded ? 'max-h-[80vh] overflow-y-auto' : 'max-h-12 overflow-hidden'}`}>
        {/* Header - Always visible */}
        <div 
          className="flex justify-between items-center p-4 cursor-pointer pointer-events-auto bg-white/5 hover:bg-white/10 transition-colors"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <h2 className="text-2xl font-semibold text-gray-900">Getting Started</h2>
          {isExpanded ? (
            <ChevronDown className="text-gray-700" size={24} />
          ) : (
            <ChevronUp className="text-gray-700" size={24} />
          )}
        </div>

        {/* Content - Collapsible */}
        <div className="p-8 pt-2">
          {/* Basic Actions */}
          <div className="mb-6">
            <h3 className="text-lg font-medium mb-3 text-gray-800">Basic Actions</h3>
            <ul className="space-y-2">
              <li className="flex items-start space-x-2">
                <span className="text-blue-500">➤</span>
                <span>Set a unique name for your TalentTreeDef in the properties panel</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-blue-500">➤</span>
                <span>You must have at least one Start node.</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-blue-500">➤</span>
                <span>Right-click anywhere to add a new node</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-blue-500">➤</span>
                <span>Left-click a node to select and edit its properties in the properties panel</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-blue-500">➤</span>
                <span>Drag nodes to reposition them</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-blue-500">➤</span>
                <ArrowLeftRight className="text-gray-700" size={20} />
                <span>Click the connect button to draw connections between nodes</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-blue-500">➤</span>
                <span>Right-click a connection to delete it</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-blue-500">➤</span>
                <span>Define your Trees nodes, their connections and upgrades.</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-blue-500">➤</span>
                <span>Export the resulting XML into your mods `Defs` folder</span>
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
    </div>
  );
};

export default CanvasInstructions;