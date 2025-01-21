import React, { useState } from 'react';
import { ChevronDown, ChevronUp, TreePine } from 'lucide-react';

const TreePropertiesPanel = ({
  treeName, setTreeName,
  treeSize, setTreeSize,
  treeDisplayStrategy, setTreeDisplay,
  pointStrategy, setTreePointStrategy,
  treeHandler, setTreeHandler
}) => {
  const [customDisplayStrategy, setCustomDisplayStrategy] = useState(false);
  const [customPointFormula, setCustomPointFormula] = useState(false);
  const [customTreeHandler, setCustomTreeHandler] = useState(false);
  const [isExpanded, setIsExpanded] = useState(true);
  
  const inputClasses = "w-full p-1.5 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors text-sm";
  const labelClasses = "text-xs font-medium text-gray-700";
  
  return (
    <div className="w-80 bg-white rounded-lg shadow-lg m-1">
      <div 
        className="px-3 py-2 border-b border-gray-200 flex justify-between items-center cursor-pointer hover:bg-gray-50"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <TreePine size={20} />
        <h2 className="text-sm font-semibold text-gray-900">Tree Properties</h2>
        {isExpanded ? (
          <ChevronUp className="h-4 w-4 text-gray-500" />
        ) : (
          <ChevronDown className="h-4 w-4 text-gray-500" />
        )}
      </div>
      
      <div className={`overflow-hidden transition-all duration-200 ease-in-out ${isExpanded ? 'max-h-[500px]' : 'max-h-0'}`}>
        <div className="p-3 space-y-2">
          {/* Talent Tree Name */}
          <div className="space-y-1">
            <label htmlFor="treeName" className={labelClasses}>
              Talent Tree Definition Name
            </label>
            <input
              type="text"
              id="treeName"
              value={treeName}
              onChange={(e) => setTreeName(e.target.value)}
              className={`${inputClasses} ${
                treeName 
                  ? 'bg-green-50 border-green-500' 
                  : 'bg-red-50 border-red-500'
              }`}
              placeholder="Enter tree name..."
            />
          </div>

          {/* Tree Window Size */}
          <div className="space-y-1">
            <label className={labelClasses}>
              Tree Window Size
            </label>
            <div className="flex space-x-2">
              <div className="flex-1">
                <input
                  type="number"
                  id="width"
                  placeholder="Width"
                  value={treeSize?.width || ''}
                  onChange={(e) => setTreeSize(prev => ({...prev, width: parseInt(e.target.value)}))}
                  className={inputClasses}
                  min="0"
                />
              </div>
              <div className="flex-1">
                <input
                  type="number"
                  id="height"
                  placeholder="Height"
                  value={treeSize?.height || ''}
                  onChange={(e) => setTreeSize(prev => ({...prev, height: parseInt(e.target.value)}))}
                  className={inputClasses}
                  min="0"
                />
              </div>
            </div>
          </div>

          {/* Tree Handler/Type */}
          <div className="space-y-1">
            <label htmlFor="pointFormula" className={labelClasses}>
              Talent Handler Type
            </label>
            <div className="space-y-1">
              <select
                id="treeHandlerType"
                value={customTreeHandler ? 'custom' : treeHandler}
                onChange={(e) => {
                  const isCustom = e.target.value === 'custom';
                  setCustomTreeHandler(isCustom);
                  if (!isCustom) {
                    setTreeHandler(e.target.value);
                  }
                }}
                className={inputClasses}
              >
                <option value="Talented.ActiveTreeHandler">Active</option>
                <option value="Talented.PassiveTreeHandler">Passive</option>
                <option value="YourNameSpace.YourHandler">Custom</option>
              </select>
              {customPointFormula && (
                <input
                  type="text"
                  placeholder="Enter custom formula..."
                  value={pointStrategy}
                  onChange={(e) => setTreeHandler(e.target.value)}
                  className={inputClasses}
                />
              )}
            </div>
          </div>

          {/* Display Strategy */}
          <div className="space-y-1">
            <label htmlFor="displayStrategy" className={labelClasses}>
              Tree Display Strategy
            </label>
            <div className="space-y-1">
              <select
                id="displayStrategy"
                value={customDisplayStrategy ? 'custom' : treeDisplayStrategy}
                onChange={(e) => {
                  const isCustom = e.target.value === 'custom';
                  setCustomDisplayStrategy(isCustom);
                  if (!isCustom) {
                    setTreeDisplay(e.target.value);
                  }
                }}
                className={inputClasses}
              >
                <option value="FixedPosition">Manual Position</option>
                <option value="VerticalStrategy">Auto-Vertical</option>
                <option value="RingStrategy">Auto-Radial</option>
                <option value="custom">Custom</option>
              </select>
              {customDisplayStrategy && (
                <input
                  type="text"
                  placeholder="Enter custom strategy..."
                  value={treeDisplayStrategy}
                  onChange={(e) => setTreeDisplay(e.target.value)}
                  className={inputClasses}
                />
              )}
            </div>
          </div>

          {/* Talent Point Formula */}
          <div className="space-y-1">
            <label htmlFor="pointFormula" className={labelClasses}>
              Talent Point Formula
            </label>
            <div className="space-y-1">
              <select
                id="pointFormula"
                value={customPointFormula ? 'custom' : pointStrategy}
                onChange={(e) => {
                  const isCustom = e.target.value === 'custom';
                  setCustomPointFormula(isCustom);
                  if (!isCustom) {
                    setTreePointStrategy(e.target.value);
                  }
                }}
                className={inputClasses}
              >
                <option value="PerLevel">Linear(X per Level)</option>
                <option value="Every5Levels">Periodic (X every Y levels)</option>
                <option value="custom">Custom</option>
              </select>
              {customPointFormula && (
                <input
                  type="text"
                  placeholder="Enter custom formula..."
                  value={pointStrategy}
                  onChange={(e) => setTreePointStrategy(e.target.value)}
                  className={inputClasses}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TreePropertiesPanel;