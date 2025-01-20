import React from 'react';
import Button from './Button';
import DefSelector from './DefRefSelector'
import ListEditor from './PropertiesList';
import { BadgeHelp } from 'lucide-react';


const PropertiesPanel = ({
  selectedNode,
  node,
  onUpdateProperty,
  treeName,
  setTreeName
}) => {
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
    <div className="w-80 absolute left-4 top-20 bg-white rounded-lg shadow-lg">
      <div className="p-4 space-y-6">
        <div className="space-y-4">
          <div>
          <label
                className="block text-sm font-medium text-gray-700 mb-1"
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
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div className="flex space-x-4">
            <div className="flex-1">
            <label
                className="block text-sm font-medium text-gray-700 mb-1"
                title="Number of talent points required to unlock this node"
              >
                <div className="flex items-center gap-1">
                Points <BadgeHelp className="h-4 w-4" />
                </div>
              </label>
              <input
                type="number"
                value={node.points || 1}
                onChange={(e) => {
                  const clamped = e.target.value < 0 ? 0 : e.target.value;
                  onUpdateProperty('points', clamped);
                }}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div className="flex-1">
              <label
                className="block text-sm font-medium text-gray-700 mb-1"
                title="Node type: Start (beginning node), Normal (standard node), or Branch (splits into multiple paths)"
              >
                <div className="flex items-center gap-1">
                  Type <BadgeHelp className="h-4 w-4" />
                </div>
              </label>
              <select
                value={node.type || 'Normal'}
                onChange={(e) => onUpdateProperty('type', e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option>Start</option>
                <option>Normal</option>
                <option>Branch</option>
              </select>
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-gray-200">
          <label
            className="block text-sm font-medium text-gray-700 mb-1"
            title="List of upgrades/bonuses that this node provides when unlocked, you can import Defs in the Def Editor tab."
          >
            <div className="flex items-center gap-1">
              Upgrades <BadgeHelp className="h-4 w-4" />
            </div>
          </label>
          <div className="space-y-2">
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

        <div className="pt-4 border-t border-gray-200">
          <label
            className="block text-sm font-medium text-gray-700 mb-1"
            title="The progression path this node belongs to. Affects node appearance and grouping"
          >
            <div className="flex items-center gap-1">
              Path <BadgeHelp className="h-4 w-4" />
            </div>
          </label>
          <div className="space-y-2">
            <input
              type="text"
              value={node.path || ''}
              onChange={(e) => onUpdateProperty('path', e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
  );
};

export default PropertiesPanel;