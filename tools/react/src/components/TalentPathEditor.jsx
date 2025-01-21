import React, { useState } from 'react';
import { StorageUtils } from '../utils/StorageUtils';
import Button from './Button';

const TalentPathEditor = ({ currentDef, setCurrentDef }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const allPaths = Object.entries(StorageUtils.getDefsOfType('TalentPathDef') || {})
    .map(([name, def]) => ({ name, ...def }));

  const handleExclusiveWithChange = (pathName) => {
    const newExclusiveWith = currentDef.exclusiveWith || [];
    const index = newExclusiveWith.indexOf(pathName);
    
    if (index >= 0) {
      newExclusiveWith.splice(index, 1);
    } else {
      newExclusiveWith.push(pathName);
    }

    setCurrentDef({
      ...currentDef,
      exclusiveWith: newExclusiveWith
    });
  };

  return (
    <div className="bg-gray-100 p-4 rounded-lg">
      <div className="grid gap-3">
        <div>
          <label className="block text-xs font-medium mb-1">Path Name</label>
          <input
            type="text"
            value={currentDef.defName || ''}
            onChange={e => setCurrentDef({ ...currentDef, defName: e.target.value })}
            className="w-full p-1.5 text-sm border rounded"
          />
        </div>

        <div>
          <label className="block text-xs font-medium mb-1">Description</label>
          <textarea
            value={currentDef.description || ''}
            onChange={e => setCurrentDef({ ...currentDef, description: e.target.value })}
            className="w-full p-1.5 text-sm border rounded"
            rows={3}
          />
        </div>

        <div>
          <label className="block text-xs font-medium mb-1">Color</label>
          <input
            type="color"
            value={currentDef.color || '#000000'}
            onChange={e => setCurrentDef({ ...currentDef, color: e.target.value })}
            className="w-full h-10 p-1 border rounded"
          />
        </div>

        <div>
          <label className="block text-xs font-medium mb-1">Exclusive With</label>
          <input
            type="text"
            placeholder="Search paths..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full p-2 border rounded mb-2 text-sm"
          />
          <div className="space-y-1 max-h-48 overflow-y-auto border rounded p-2 bg-white">
            {allPaths
              .filter(path => 
                path.name !== currentDef.defName &&
                path.name.toLowerCase().includes(searchTerm.toLowerCase())
              )
              .map(path => (
                <label key={path.name} className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={(currentDef.exclusiveWith || []).includes(path.name)}
                    onChange={() => handleExclusiveWithChange(path.name)}
                    className="rounded"
                  />
                  {path.name}
                </label>
              ))}
          </div>
        </div>

        <Button
          onClick={() => StorageUtils.saveSingleDefOfType('TalentPathDef', currentDef.defName, currentDef)}
          className="w-full bg-green-500 hover:bg-green-600 text-white mt-2"
        >
          Save Path Definition
        </Button>
      </div>
    </div>
  );
};

export default TalentPathEditor;