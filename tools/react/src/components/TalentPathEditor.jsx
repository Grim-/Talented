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
    <div className="bg-gray-900 p-4 rounded-lg border border-gray-700">
      <div className="grid gap-3">
        <div>
          <label className="block text-xs font-medium mb-1 text-gray-300">Path Name</label>
          <input
            type="text"
            value={currentDef.defName || ''}
            onChange={e => setCurrentDef({ ...currentDef, defName: e.target.value })}
            className="w-full p-1.5 text-sm border border-gray-600 rounded bg-gray-700 text-gray-200"
          />
        </div>

        <div>
          <label className="block text-xs font-medium mb-1 text-gray-300">Description</label>
          <textarea
            value={currentDef.description || ''}
            onChange={e => setCurrentDef({ ...currentDef, description: e.target.value })}
            className="w-full p-1.5 text-sm border border-gray-600 rounded bg-gray-700 text-gray-200"
            rows={3}
          />
        </div>

        <div>
          <label className="block text-xs font-medium mb-1 text-gray-300">Color</label>
          <input
            type="color"
            value={currentDef.color || '#000000'}
            onChange={e => setCurrentDef({ ...currentDef, color: e.target.value })}
            className="w-full h-10 p-1 border border-gray-600 rounded bg-gray-700"
          />
        </div>

        <div>
          <label className="block text-xs font-medium mb-1 text-gray-300">Exclusive With</label>
          <input
            type="text"
            placeholder="Search paths..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full p-2 border border-gray-600 rounded mb-2 text-sm bg-gray-700 text-gray-200"
          />
          <div className="space-y-1 max-h-48 overflow-y-auto border border-gray-600 rounded p-2 bg-gray-800">
            {allPaths
              .filter(path => 
                path.name !== currentDef.defName &&
                path.name.toLowerCase().includes(searchTerm.toLowerCase())
              )
              .map(path => (
                <label key={path.name} className="flex items-center gap-2 text-sm text-gray-200">
                  <input
                    type="checkbox"
                    checked={(currentDef.exclusiveWith || []).includes(path.name)}
                    onChange={() => handleExclusiveWithChange(path.name)}
                    className="rounded border-gray-600 bg-gray-700"
                  />
                  {path.name}
                </label>
              ))}
          </div>
        </div>

        <Button
          onClick={() => StorageUtils.saveSingleDefOfType('TalentPathDef', currentDef.defName, currentDef)}
          className="w-full bg-green-600 hover:bg-green-700 text-gray-200 mt-2"
        >
          Save Path Definition
        </Button>
      </div>
    </div>
  );
};

export default TalentPathEditor;