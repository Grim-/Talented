import React, { useState } from 'react';
import { BadgeHelp, ChevronDown, ChevronUp, SquareMousePointer } from 'lucide-react';
import Button from './Button';
import DefSelector from './DefRefSelector';
import ListEditor from './PropertiesList';

const PropertiesPanel = ({
  selectedNode,
  node,
  onUpdateProperty
}) => {
  const [isExpanded, setIsExpanded] = useState(true);

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
    <div className="w-80 bg-white rounded-lg shadow-lg">
      <div 
        className="px-3 py-2 border-b border-gray-200 flex justify-between items-center cursor-pointer hover:bg-gray-50"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <SquareMousePointer size={20} />
        <h2 className="text-sm font-semibold text-gray-900">Node Properties</h2>
        {isExpanded ? (
          <ChevronUp className="h-4 w-4 text-gray-500" />
        ) : (
          <ChevronDown className="h-4 w-4 text-gray-500" />
        )}
      </div>

      <div className={`overflow-hidden transition-all duration-200 ease-in-out ${isExpanded ? 'max-h-[800px]' : 'max-h-0'}`}>
        <div className="p-3 space-y-3">
        <div className="space-y-4">
      <div className="flex gap-4">
        {/* Label Input Field */}
        <div className="flex-1">
          <label
            className="block text-xs font-medium text-gray-700"
            title="The name that will be displayed for this node in the talent tree"
          >
            <div className="flex items-center gap-1">
              Label <BadgeHelp className="h-4 w-4" />
            </div>
          </label>
          <input
            type="text"
            value={node.label || ''}
            onChange={(e) => onUpdateProperty('label', e.target.value)}
            className="w-full p-1.5 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* Type Dropdown */}
        <div className="w-40">
          <label
            className="block text-xs font-medium text-gray-700"
            title="Node type: Start (beginning node), Normal (standard node), or Branch (splits into multiple paths)"
          >
            <div className="flex items-center gap-1">
              Type <BadgeHelp className="h-4 w-4" />
            </div>
          </label>
          <select
            value={node.type || 'Normal'}
            onChange={(e) => onUpdateProperty('type', e.target.value)}
            className="w-full p-1.5 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
          >
            <option>Start</option>
            <option>Normal</option>
            <option>Branch</option>
          </select>
        </div>
      </div>
    </div>

          <div className="pt-2 border-t border-gray-200">
            <label
              className="block text-xs font-medium text-gray-700"
              title="List of upgrades/bonuses that this node provides when unlocked, you can import Defs in the Def Editor tab."
            >
              <div className="flex items-center gap-1">
                Upgrades <BadgeHelp className="h-4 w-4" />
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

          <div className="pt-2 border-t border-gray-200">
            <label
              className="block text-xs font-medium text-gray-700"
              title="The progression path this node belongs to. Affects node appearance and grouping"
            >
              <div className="flex items-center gap-1">
                Path <BadgeHelp className="h-4 w-4" />
              </div>
            </label>
            <div className="space-y-1">
              <input
                type="text"
                value={node.path || ''}
                onChange={(e) => onUpdateProperty('path', e.target.value)}
                className="w-full p-1.5 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              />
              <DefSelector
                defType="TalentPathDef"
                onChange={(e) => {
                  handleListItemAdd('', e);
                  onUpdateProperty('path', e);
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PropertiesPanel;