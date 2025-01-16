import React from 'react';
import Button from './Button';
import DefSelector from './DefRefSelector'

const PropertiesPanel = ({
  selectedNode,
  node,
  onUpdateProperty,
  onAddBranchPath,
  onUpdateBranchPath
}) => {
  if (!selectedNode || !node) return null;

  const renderListEditor = (propName, list) => {
    // Handle both legacy 'upgrade' and new 'upgrades' format
    let items = [];
    if (propName === 'upgrades') {
      if (Array.isArray(node.upgrades)) {
        items = node.upgrades;
      } else if (typeof node.upgrade === 'string' && node.upgrade !== '') {
        items = [node.upgrade];
      }
    } else {
      items = Array.isArray(list) ? list :
             (typeof list === 'string' && list !== '') ? [list] :
             [];
    }

    // Get saved defs from localStorage
    const savedDefs = JSON.parse(localStorage.getItem('savedDefs') || '{}');
    const defType = propName === 'upgrades' ? 'TalentUpgradeDef' : 'AbilityDef';
    const availableDefs = Object.keys(savedDefs[defType] || {});

    return (
      <div className="space-y-2">
        {items.map((item, index) => (
          <div key={index} className="flex gap-2 items-start">
            <div className="flex-1">
              <input
                type="text"
                value={item}
                onChange={e => handleListItemChange(propName, index, e.target.value)}
                className="w-full p-2 border rounded"
                placeholder={`${propName} ${index + 1}`}
              />
            </div>
            <button
              onClick={() => handleListItemRemove(propName, index)}
              className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 h-10"
            >
              ×
            </button>
          </div>
        ))}
        <div className="space-y-2">
          <button
            onClick={() => handleListItemAdd(propName)}
            className="w-full p-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Add Empty
          </button>
          {availableDefs.length > 0 && (
            <DefSelector
              defType="TalentUpgradeDef" // Adjust to match the correct defType
              value={[]} // If you need a specific value here, make sure to set it
              onChange={(newValue) => handleListItemAdd(propName, newValue)}
              className="w-full p-2 border rounded"
            />
          )}
        </div>
      </div>
    );
  };

  const handleListItemAdd = (propName, value = '') => {
    let currentList = [];
    if (propName === 'upgrades') {
      if (Array.isArray(node.upgrades)) {
        currentList = node.upgrades;
      } else if (typeof node.upgrade === 'string' && node.upgrade !== '') {
        currentList = [node.upgrade];
        onUpdateProperty('upgrade', '');
      }
    } else {
      currentList = Array.isArray(node[propName]) ? node[propName] :
                   (typeof node[propName] === 'string' && node[propName] !== '') ? [node[propName]] :
                   [];
    }
    onUpdateProperty(propName, [...currentList, value]);
  };

  const handleListItemRemove = (propName, index) => {
    let currentList = [];
    if (propName === 'upgrades') {
      if (Array.isArray(node.upgrades)) {
        currentList = node.upgrades;
      } else if (typeof node.upgrade === 'string' && node.upgrade !== '') {
        currentList = [node.upgrade];
        onUpdateProperty('upgrade', '');
      }
    } else {
      currentList = Array.isArray(node[propName]) ? node[propName] :
                   (typeof node[propName] === 'string' && node[propName] !== '') ? [node[propName]] :
                   [];
    }
    const newList = [...currentList];
    newList.splice(index, 1);
    onUpdateProperty(propName, newList);
  };

  const handleListItemChange = (propName, index, value) => {
    let currentList = [];
    if (propName === 'upgrades') {
      if (Array.isArray(node.upgrades)) {
        currentList = node.upgrades;
      } else if (typeof node.upgrade === 'string' && node.upgrade !== '') {
        currentList = [node.upgrade];
        onUpdateProperty('upgrade', '');
      }
    } else {
      currentList = Array.isArray(node[propName]) ? node[propName] :
                   (typeof node[propName] === 'string' && node[propName] !== '') ? [node[propName]] :
                   [];
    }
    const newList = [...currentList];
    newList[index] = value;
    onUpdateProperty(propName, newList);
  };

  return (
    <div className="w-64 absolute left-4 top-4 bg-white rounded-lg shadow-lg p-4">
      <h3 className="font-bold mb-4">Properties</h3>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Label</label>
          <input
            type="text"
            value={node.label || ''}
            onChange={(e) => onUpdateProperty('label', e.target.value)}
            className="w-full p-2 border rounded"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Type</label>
          <select
            value={node.type || 'Normal'}
            onChange={(e) => onUpdateProperty('type', e.target.value)}
            className="w-full p-2 border rounded"
          >
            <option>Start</option>
            <option>Normal</option>
            <option>Branch</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Path</label>
          <input
            type="text"
            value={node.path || ''}
            onChange={(e) => onUpdateProperty('path', e.target.value)}
            className="w-full p-2 border rounded"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Upgrades</label>
          {renderListEditor('upgrades', null)}
        </div>
        {node.type === 'Branch' && (
          <div>
            <label className="block text-sm font-medium mb-1">Branch Paths</label>
            <Button
              onClick={onAddBranchPath}
              className="bg-blue-500 text-white mb-2 w-full"
              size="sm"
            >
              Add Branch Path
            </Button>
            {node.branchPaths?.map((branch, idx) => (
              <div key={idx} className="ml-2 mb-2">
                <input
                  type="text"
                  placeholder="Path name"
                  value={branch.path}
                  onChange={(e) => onUpdateBranchPath(idx, 'path', e.target.value)}
                  className="w-full p-2 border rounded mb-1"
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PropertiesPanel;
