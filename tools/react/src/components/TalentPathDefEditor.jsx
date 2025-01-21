import React from 'react';
import { StorageUtils } from '../utils/StorageUtils';
import { DefStructures } from '../DefTypes';
import { renderPropertyEditor } from '../utils/renderProperties';
import Button from './Button';

const TalentPathDefEditor = ({ currentDef, setCurrentDef }) => {
  const handleExclusiveWithChange = (index, value) => {
    const newExclusiveWith = [...(currentDef.exclusiveWith || [])];
    newExclusiveWith[index] = value;
    setCurrentDef({ ...currentDef, exclusiveWith: newExclusiveWith });
  };

  const handleAddExclusiveWith = () => {
    setCurrentDef({
      ...currentDef,
      exclusiveWith: [...(currentDef.exclusiveWith || []), '']
    });
  };

  const handleRemoveExclusiveWith = (index) => {
    const newExclusiveWith = currentDef.exclusiveWith.filter((_, i) => i !== index);
    setCurrentDef({ ...currentDef, exclusiveWith: newExclusiveWith });
  };

  return (
    <div className="bg-gray-100 p-4 rounded-lg">
      <div className="grid gap-3">
        <div>
          <label className="block text-xs font-medium mb-1">Path Name</label>
          <input
            type="text"
            value={currentDef.defName}
            onChange={e => setCurrentDef({ ...currentDef, defName: e.target.value })}
            className="w-full p-1.5 text-sm border rounded"
          />
        </div>

        <div>
          <label className="block text-xs font-medium mb-1">Description</label>
          <textarea
            value={currentDef.description}
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
            className="w-full p-1.5 text-sm border rounded"
          />
        </div>

        <div>
          <label className="block text-xs font-medium mb-1">Exclusive With</label>
          <div className="space-y-2">
            {(currentDef.exclusiveWith || []).map((path, index) => (
              <div key={index} className="flex gap-2">
                <input
                  type="text"
                  value={path}
                  onChange={e => handleExclusiveWithChange(index, e.target.value)}
                  className="flex-1 p-2 border rounded"
                  placeholder="Path Name"
                />
                <button
                  onClick={() => handleRemoveExclusiveWith(index)}
                  className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                >
                  ×
                </button>
              </div>
            ))}
            <button
              onClick={handleAddExclusiveWith}
              className="w-full p-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Add Exclusive Path
            </button>
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

export default TalentPathDefEditor;