import React, { useState } from 'react';
import { BadgeHelp, ChevronDown, ChevronUp, SquareMousePointer } from 'lucide-react';
import Button from './Button';
import DefSelector from './DefRefSelector';
import ListEditor from './PropertiesList';
import TagGrid from './TagGrid';
import PathInput from './PathInput';

const PropertiesPanel = ({
  selectedNode,
  node,
  onUpdateProperty
}) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [showExclusivePaths, setShowExclusivePaths] = useState(false);
  if (!selectedNode || !node) return null;

  const getNodeList = (node, propName) => {
    if (propName === 'upgrades') {
      if (Array.isArray(node.upgrades)) return node.upgrades;
      if (typeof node.upgrade === 'string' && node.upgrade !== '') {
        return [node.upgrade];
      }
      return [];
    }

    const value = node[propName];
    if (Array.isArray(value)) return value;
    if (typeof value === 'string' && value !== '') return [value];
    return [];
  };

  const handleListItemAdd = (propName, value = '') => {
    const currentList = getNodeList(node, propName);
    if (propName === 'upgrades' && node.upgrade) {
      onUpdateProperty('upgrade', '');
    }
    onUpdateProperty(propName, [...currentList, value]);
  };

  const handleListItemRemove = (propName, index) => {
    const currentList = getNodeList(node, propName);
    const newList = [...currentList];
    newList.splice(index, 1);
    onUpdateProperty(propName, newList);
  };

  const handleListItemChange = (propName, index, value) => {
    const currentList = getNodeList(node, propName);
    const newList = [...currentList];
    newList[index] = value;
    onUpdateProperty(propName, newList);
  };

  return (
    <div className="w-80 bg-gray-800 rounded-lg shadow-lg">
      <div 
        className="px-3 py-2 border-b border-gray-700 flex m-1 justify-between items-center cursor-pointer hover:bg-gray-700 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <SquareMousePointer size={20} className="text-gray-300" />
        <h2 className="text-sm font-semibold text-gray-300">Node Properties</h2>
        {isExpanded ? (
          <ChevronUp className="h-4 w-4 text-gray-400" />
        ) : (
          <ChevronDown className="h-4 w-4 text-gray-400" />
        )}
      </div>

      <div className={`overflow-hidden transition-all duration-200 ease-in-out ${isExpanded ? 'max-h-[800px]' : 'max-h-0'}`}>
        <div className="p-3 space-y-3">
          <div className="space-y-4">
            <div className="flex gap-4">
              {/* Label Input Field */}
              <div className="flex-1">
                <label
                  className="block text-xs font-medium text-gray-300"
                  title="The name that will be displayed for this node in the talent tree"
                >
                  <div className="flex items-center gap-1">
                    Label <BadgeHelp className="h-4 w-4 text-gray-400" />
                  </div>
                </label>
                <input
                  type="text"
                  value={node.label || ''}
                  onChange={(e) => onUpdateProperty('label', e.target.value)}
                  className="w-full p-1.5 text-sm bg-gray-700 border border-gray-600 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-gray-300"
                />
              </div>

              {/* Type Dropdown */}
              <div className="w-40">
                <label
                  className="block text-xs font-medium text-gray-300"
                  title="Node type: Start (beginning node), Normal (standard node), or Branch (splits into multiple paths)"
                >
                  <div className="flex items-center gap-1">
                    Type <BadgeHelp className="h-4 w-4 text-gray-400" />
                  </div>
                </label>
                <select
                  value={node.type || 'Normal'}
                  onChange={(e) => onUpdateProperty('type', e.target.value)}
                  className="w-full p-1.5 text-sm bg-gray-700 border border-gray-600 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-gray-300"
                >
                  <option>Start</option>
                  <option>Normal</option>
                  <option>Branch</option>
                </select>
              </div>
            </div>
          </div>

          <div className="pt-2 border-t border-gray-700">
            <label
              className="block text-xs font-medium text-gray-300"
              title="List of upgrades/bonuses that this node provides when unlocked, you can import Defs in the Def Editor tab."
            >
              <div className="flex items-center gap-1">
                Upgrades <BadgeHelp className="h-4 w-4 text-gray-400" />
              </div>
            </label>
            <div className="space-y-1">
              <ListEditor
                node={node}
                propName="upgrades"
                list={null}
                onItemChange={handleListItemChange}
                onItemRemove={handleListItemRemove}
                onItemAdd={handleListItemAdd}
              />
            </div>
          </div>

          <div className="pt-2 border-t border-gray-700">
            <label
              className="block text-xs font-medium text-gray-300"
              title="The progression path this node belongs to. Affects node appearance and grouping"
            >
              <div className="flex items-center gap-1">
                Path <BadgeHelp className="h-4 w-4 text-gray-400" />
              </div>
            </label>
            <div className="space-y-1">
              <PathInput 
                value={node.path}
                onChange={(value) => onUpdateProperty('path', value)}
                color={node.path}
              />

              {node.path === '' && (
                <DefSelector
                  defType="TalentPathDef"
                  value={node.path} 
                  onChange={(value) => {
                    onUpdateProperty('path', value); 
                  }}
                />
              )}
              {node.path && (
                <>
                  {/* Path Description */}
                  <div className="text-sm text-gray-400">
                    {node.descriptionString || 'No description available'}
                  </div>
                  
                  {/* Exclusive Paths Section */}
                  <div>
                    <button
                      onClick={() => setShowExclusivePaths(!showExclusivePaths)}
                      className="text-sm text-blue-400 hover:text-blue-300 flex items-center gap-1"
                    >
                      {showExclusivePaths ? 'Hide' : 'Show'} Exclusive Paths
                      {showExclusivePaths ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                    </button>
                    
                    {showExclusivePaths && (
                      <div className="mt-2">
                        <TagGrid
                          node={node}
                          propName="exclusiveWith"
                          list={() => {
                            const savedDefs = JSON.parse(localStorage.getItem('savedDefs') || '{}');
                            const defsOfType = savedDefs['TalentPathDef'] || {};
                            
                            if (!node.path) return [];
                            const selectedPathDef = defsOfType[node.path];
                            if (!selectedPathDef || !selectedPathDef.exclusiveWith) return [];
                            return selectedPathDef.exclusiveWith.filter((exclusivePath) => defsOfType[exclusivePath]);
                          }}
                        />
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PropertiesPanel;