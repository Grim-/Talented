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
    
    // Update current path's exclusivity
    if (index >= 0) {
      newExclusiveWith.splice(index, 1);
    } else {
      newExclusiveWith.push(pathName);
    }

    // Update current path
    const updatedCurrentDef = {
      ...currentDef,
      exclusiveWith: newExclusiveWith
    };
    setCurrentDef(updatedCurrentDef);

    // Update the other path's exclusivity
    const otherPath = StorageUtils.getDefsOfType('TalentPathDef')[pathName];
    if (otherPath) {
      const otherExclusiveWith = otherPath.exclusiveWith || [];
      const shouldBeExclusive = newExclusiveWith.includes(pathName);
      
      if (shouldBeExclusive && !otherExclusiveWith.includes(currentDef.defName)) {
        // Add current path to other path's exclusivity list
        otherPath.exclusiveWith = [...otherExclusiveWith, currentDef.defName];
        StorageUtils.saveSingleDefOfType('TalentPathDef', pathName, otherPath);
      } else if (!shouldBeExclusive && otherExclusiveWith.includes(currentDef.defName)) {
        // Remove current path from other path's exclusivity list
        otherPath.exclusiveWith = otherExclusiveWith.filter(name => name !== currentDef.defName);
        StorageUtils.saveSingleDefOfType('TalentPathDef', pathName, otherPath);
      }
    }
  };
  const CheckboxButton = ({ label, checked, onChange }) => (
    <label className="relative group cursor-pointer">
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="sr-only peer"
      />
      <div className={`
        w-full p-2 text-sm rounded
        flex items-center justify-center
        transition-all duration-200
        border
        ${checked 
          ? 'bg-gray-600 border-gray-500 text-white' 
          : 'bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700'
        }
        peer-focus:ring-2 peer-focus:ring-blue-500 peer-focus:ring-offset-1 peer-focus:ring-offset-gray-900
      `}>
        {label}
      </div>
    </label>
  );

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
          <div className="max-h-64 overflow-y-auto border border-gray-600 rounded p-2 bg-gray-800">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {allPaths
                .filter(path => 
                  path.name !== currentDef.defName &&
                  path.name.toLowerCase().includes(searchTerm.toLowerCase())
                )
                .map(path => (
                  <CheckboxButton
                    key={path.name}
                    label={path.name}
                    checked={(currentDef.exclusiveWith || []).includes(path.name)}
                    onChange={() => handleExclusiveWithChange(path.name)}
                  />
                ))}
            </div>
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