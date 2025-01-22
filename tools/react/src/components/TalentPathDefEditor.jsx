import React from 'react';
import { StorageUtils } from '../utils/StorageUtils';
import { DefStructures } from '../DefTypes';
import { renderPropertyEditor } from '../utils/renderProperties';
import Button from './Button';

const TalentPathDefEditor = ({ currentDef, setCurrentDef, onSave }) => {
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
    <div className="min-h-screen bg-gray-900">
      <div className="bg-gray-800 p-6 rounded-lg shadow-xl border border-gray-700">
        <div className="grid gap-4">
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-300">Path Name</label>
            <input
              type="text"
              value={currentDef.defName}
              onChange={e => setCurrentDef({ ...currentDef, defName: e.target.value })}
              className="w-full p-2.5 text-sm border border-gray-600 rounded-md bg-gray-700 text-gray-200 placeholder-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              placeholder="Enter path name..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-gray-300">Description</label>
            <textarea
              value={currentDef.description}
              onChange={e => setCurrentDef({ ...currentDef, description: e.target.value })}
              className="w-full p-2.5 text-sm border border-gray-600 rounded-md bg-gray-700 text-gray-200 placeholder-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              rows={3}
              placeholder="Enter description..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-gray-300">Color</label>
            <input
              type="color"
              value={currentDef.color || '#000000'}
              onChange={e => setCurrentDef({ ...currentDef, color: e.target.value })}
              className="w-full h-10 p-1 border border-gray-600 rounded-md bg-gray-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-gray-300">Exclusive With</label>
            <div className="space-y-3">
              {(currentDef.exclusiveWith || []).map((path, index) => (
                <div key={index} className="flex gap-2">
                  <input
                    type="text"
                    value={path}
                    onChange={e => handleExclusiveWithChange(index, e.target.value)}
                    className="flex-1 p-2.5 border border-gray-600 rounded-md bg-gray-700 text-gray-200 placeholder-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    placeholder="Enter path name..."
                  />
                  <button
                    onClick={() => handleRemoveExclusiveWith(index)}
                    className="px-3 py-1 bg-red-600 text-gray-200 rounded-md hover:bg-red-700 transition-colors duration-200"
                  >
                    ×
                  </button>
                </div>
              ))}
              <button
                onClick={handleAddExclusiveWith}
                className="w-full p-2.5 bg-blue-600 text-gray-200 rounded-md hover:bg-blue-700 transition-colors duration-200"
              >
                Add Exclusive Path
              </button>
            </div>
          </div>

          <Button
            onClick={() => StorageUtils.saveSingleDefOfType('TalentPathDef', currentDef.defName, currentDef)}
            className="w-full mt-4 p-2.5 bg-green-600 hover:bg-green-700 text-gray-200 rounded-md transition-colors duration-200 font-medium"
          >
            Save Path Definition
          </Button>
        </div>
      </div>
    </div>
  );
};

export default TalentPathDefEditor;