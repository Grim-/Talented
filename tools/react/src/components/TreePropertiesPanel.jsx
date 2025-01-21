import React, { useState } from 'react';
import { ChevronDown, ChevronUp, TreePine, HelpCircle } from 'lucide-react';
import Select from 'react-select';
import { Tooltip } from 'react-tooltip';

const CustomOption = ({ innerProps, label, data }) => (
  <div {...innerProps} className="px-3 py-2 hover:bg-gray-100 cursor-pointer">
    <div data-tooltip-id={`option-${data.value}`}>{label}</div>
    <Tooltip id={`option-${data.value}`}>
      {data.description}
    </Tooltip>
  </div>
);

const TreePropertiesPanel = ({
  treeName, setTreeName,
  treeSize, setTreeSize,
  treeDisplayStrategy, setTreeDisplay,
  pointStrategy, setTreePointStrategy,
  treeHandler, setTreeHandler
}) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [customDisplayStrategy, setCustomDisplayStrategy] = useState(false);
  const [customPointFormula, setCustomPointFormula] = useState(false);
  const [customTreeHandler, setCustomTreeHandler] = useState(false);
  
  const inputClasses = "w-full p-1.5 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors text-sm";
  const labelClasses = "text-xs font-medium text-gray-700 flex items-center gap-1";

  const displayOptions = [
    { value: "FixedPosition", label: "Manual Position", description: "Manually position each node in the talent tree" },
    { value: "VerticalStrategy", label: "Auto-Vertical", description: "Automatically arranges nodes in a vertical hierarchy" },
    { value: "RingStrategy", label: "Auto-Radial", description: "Arranges nodes in concentric circles around a center point" },
    { value: "custom", label: "Custom", description: "Define your own custom display strategy" }
  ];

  const pointOptions = [
    { value: "PerLevel", label: "Linear(X per Level)", description: "Gain a fixed number of points each level" },
    { value: "Every5Levels", label: "Periodic (X every Y levels)", description: "Gain points at specific level intervals" },
    { value: "custom", label: "Custom", description: "Define your own point allocation formula" }
  ];

  const handlerOptions = [
    { value: "Talented.ActiveTreeHandler", label: "Active", description: "For abilities that need to be manually activated" },
    { value: "Talented.PassiveTreeHandler", label: "Passive", description: "For abilities that apply their effects automatically" },
    { value: "custom", label: "Custom", description: "Define your own custom talent handler" }
  ];

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
      
      <div className={`${isExpanded ? 'block' : 'hidden'}`}>
        <div className="p-3 space-y-4">
          {/* Talent Tree Name */}
          <div className="space-y-1">
            <label htmlFor="treeName" className={labelClasses}>
              Talent Tree Definition Name
              <HelpCircle 
                size={14} 
                className="text-gray-400 cursor-help"
                data-tooltip-id="tree-name-tip"
              />
              <Tooltip id="tree-name-tip">
                Unique identifier for your talent tree
              </Tooltip>
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
              <HelpCircle 
                size={14} 
                className="text-gray-400 cursor-help"
                data-tooltip-id="window-size-tip"
              />
              <Tooltip id="window-size-tip">
                Set the dimensions of your talent tree window
              </Tooltip>
            </label>
            <div className="flex space-x-2">
              <input
                type="number"
                placeholder="Width"
                value={treeSize?.width || ''}
                onChange={(e) => setTreeSize(prev => ({...prev, width: parseInt(e.target.value)}))}
                className={inputClasses}
                min="0"
              />
              <input
                type="number"
                placeholder="Height"
                value={treeSize?.height || ''}
                onChange={(e) => setTreeSize(prev => ({...prev, height: parseInt(e.target.value)}))}
                className={inputClasses}
                min="0"
              />
            </div>
          </div>

          {/* Tree Handler Type */}
          <div className="space-y-1 relative">
            <label className={labelClasses}>
              Talent Handler Type
              <HelpCircle 
                size={14} 
                className="text-gray-400 cursor-help"
                data-tooltip-id="handler-tip"
              />
              <Tooltip id="handler-tip">
                Determines how talents are processed and applied
              </Tooltip>
            </label>
            <Select
              options={handlerOptions}
              value={handlerOptions.find(opt => opt.value === treeHandler) || null}
              onChange={(selected) => {
                setCustomTreeHandler(selected.value === 'custom');
                setTreeHandler(selected.value);
              }}
              placeholder="Select handler type..."
              isSearchable
              components={{ Option: CustomOption }}
            />
            {customTreeHandler && (
              <input
                type="text"
                placeholder="Enter custom handler..."
                value={treeHandler}
                onChange={(e) => setTreeHandler(e.target.value)}
                className={inputClasses}
              />
            )}
          </div>

          {/* Display Strategy */}
          <div className="space-y-1 relative">
            <label className={labelClasses}>
              Tree Display Strategy
              <HelpCircle 
                size={14} 
                className="text-gray-400 cursor-help"
                data-tooltip-id="display-tip"
              />
              <Tooltip id="display-tip">
                Controls how the talent tree is visually laid out
              </Tooltip>
            </label>
            <Select
              options={displayOptions}
              value={displayOptions.find(opt => opt.value === treeDisplayStrategy) || null}
              onChange={(selected) => {
                setCustomDisplayStrategy(selected.value === 'custom');
                setTreeDisplay(selected.value);
              }}
              placeholder="Select display strategy..."
              isSearchable
              components={{ Option: CustomOption }}
            />
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

          {/* Point Formula */}
          <div className="space-y-1 relative">
            <label className={labelClasses}>
              Talent Point Formula
              <HelpCircle 
                size={14} 
                className="text-gray-400 cursor-help"
                data-tooltip-id="formula-tip"
              />
              <Tooltip id="formula-tip">
                Defines how talent points are awarded as characters level up
              </Tooltip>
            </label>
            <Select
              options={pointOptions}
              value={pointOptions.find(opt => opt.value === pointStrategy) || null}
              onChange={(selected) => {
                setCustomPointFormula(selected.value === 'custom');
                setTreePointStrategy(selected.value);
              }}
              placeholder="Select point formula..."
              isSearchable
              components={{ Option: CustomOption }}
            />
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
  );
};

export default TreePropertiesPanel;