import React from 'react';
import Button from './Button';

const PropertiesPanel = ({
  selectedNode,
  node,
  onUpdateProperty,
  onAddBranchPath,
  onUpdateBranchPath
}) => {
  if (!selectedNode) return null;

  const handleAddUpgrade = () => {
    const currentUpgrades = node.upgrades || [];
    if (node.upgrade && !currentUpgrades.length) {
      // Convert legacy single upgrade to upgrades array
      onUpdateProperty('upgrades', [node.upgrade]);
    } else {
      onUpdateProperty('upgrades', [...currentUpgrades, '']);
    }
  };

  const handleUpdateUpgrade = (index, value) => {
    const newUpgrades = [...(node.upgrades || [])];
    newUpgrades[index] = value;
    onUpdateProperty('upgrades', newUpgrades);
  };

  const handleRemoveUpgrade = (index) => {
    const newUpgrades = [...(node.upgrades || [])];
    newUpgrades.splice(index, 1);
    onUpdateProperty('upgrades', newUpgrades);
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
          <Button
            onClick={handleAddUpgrade}
            className="bg-blue-500 text-white mb-2 w-full"
            size="sm"
          >
            Add Upgrade
          </Button>
          {(node.upgrades || []).map((upgrade, idx) => (
            <div key={idx} className="flex gap-2 mb-2">
              <input
                type="text"
                value={upgrade}
                onChange={(e) => handleUpdateUpgrade(idx, e.target.value)}
                className="flex-1 p-2 border rounded"
                placeholder={`Upgrade ${idx + 1}`}
              />
              <Button
                onClick={() => handleRemoveUpgrade(idx)}
                className="bg-red-500 text-white"
                size="sm"
              >
                ×
              </Button>
            </div>
          ))}
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
            {node.branchPaths.map((branch, idx) => (
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
