import React from 'react';
import Button from './Button';
import DefSelector from './DefRefSelector'
import ListEditor from './PropertiesList';

const PropertiesPanel = ({
  selectedNode,
  node,
  onUpdateProperty,
  onAddBranchPath,
  onUpdateBranchPath
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
    <div className="w-66 absolute left-4 top-24 bg-white rounded-lg shadow-lg p-4">
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
          <label className="block text-sm font-medium mb-1">Points</label>
          <input
            type="number"
            value={node.points || 0}
            onChange={(e) => onUpdateProperty('points', e.target.value)}
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
        <DefSelector
          defType="TalentPathDef"
          onChange={(e) => 
            { 
              handleListItemAdd('', e) 
              onUpdateProperty('path', e)
            }
          }
        />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Upgrades</label>
          <ListEditor
            node={node}
            propName="upgrades"
            list={null}
            onItemChange={handleListItemChange}
            onItemRemove={handleListItemRemove} 
            onItemAdd={handleListItemAdd}
          />
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

        <DefSelector
          defType="TalentDef"
          onChange={(e) => handleListItemAdd('upgrades', e)}
        />
      </div>
    </div>
  );
};

export default PropertiesPanel;
