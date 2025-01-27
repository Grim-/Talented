import React, { useState } from 'react';
import { StorageUtils } from '../utils/StorageUtils';
import TalentDefEditor from './TalentDefEditor';
import TalentPathEditor from './TalentPathEditor';
import Button from './Button';
import { exportDefEditorDefs, handleXmlImport, exportPaths, createEmptyPathDef, createEmptyTalentDef } from '../utils/xmlSerializer';
import DropdownButton from './DropdownButton';

const DefManager = () => {
  const [selectedType, setSelectedType] = useState(null);
  const [currentDef, setCurrentDef] = useState(null);
  const [defsVersion, setDefsVersion] = useState(0);
  const refreshDefs = () => {
    setDefsVersion(v => v + 1);
  };

  const handleSaveDef = (type, defName, def) => {
    StorageUtils.saveSingleDefOfType(type, defName, def);
    refreshDefs();
  };

  const handleTypeChange = (type) => {
    setSelectedType(type);
    setCurrentDef({
      defName: '',
      type: type,
      ...(type === 'TalentDef' ? createEmptyTalentDef() : createEmptyPathDef())
    });
  };

  const handleLoadDef = (type, defName) => {
    const def = StorageUtils.getSingleDef(type, defName);
    if (def) {
      setSelectedType(type);
      setCurrentDef({ ...def, type });
    }
  };

  const handleDeleteDef = (type, defName) => {
    if (!window.confirm(`Delete ${defName}?`)) return;
    StorageUtils.deleteDefOfType(type, defName);
    if (currentDef?.defName === defName) {
      setCurrentDef(null);
    }
    refreshDefs();
  };
  const handleCreateNewTalent = async () => {
    try {
      const newDef = createEmptyTalentDef();
      newDef.defName = `NewTalent_${Date.now()}`;
      await StorageUtils.saveSingleDefOfType('TalentDef', newDef.defName, newDef);
      setCurrentDef(newDef);
    } catch (error) {
      console.error('Failed to create new talent:', error);
      alert('Failed to create new talent. Please try again.');
    }
  };
  const handleCreateNewTalentPath = async () => {
    try {
      const newDef = createEmptyTalentDef();
      newDef.defName = `NewTalentPathDef_${Date.now()}`;
      await StorageUtils.saveSingleDefOfType('TalentPathDef', newDef.defName, newDef);
      setCurrentDef(newDef);
    } catch (error) {
      console.error('Failed to create new talent:', error);
      alert('Failed to create new talent. Please try again.');
    }
  };
  const handleFileChange = (e) => {
    const allCurrentDefs = {};
    defTypes.forEach(({ id }) => {
      allCurrentDefs[id] = StorageUtils.getDefsOfType(id) || {};
    });
    
    handleXmlImport(e, allCurrentDefs, (newDefs) => {
      Object.entries(newDefs).forEach(([type, defs]) => {
        StorageUtils.saveDefsOfType(type, defs);
      });
      refreshDefs();
    });
  };

  const defTypes = [
    { id: 'TalentDef', label: 'Talent Definition' },
    { id: 'TalentPathDef', label: 'Path Definition' }
  ];

  return (
    <div className="flex gap-4">
      {/* Sidebar */}
      <div className="w-66 bg-gray-800 p-4 rounded-lg">
        <div className="flex gap-2 mb-3 flex-wrap">
          <Button
            onClick={() => document.getElementById('xmlImport').click()}
            className="flex-none bg-gray-700 hover:bg-blue-600 text-white text-xs py-1 px-2"
          >
            Import Talent Defs
          </Button>
          <DropdownButton
            primary={{
              label: "Create new TalentDef",
              action: () => handleCreateNewTalent()
            }}
            options={[
              { label: "Create new TalentPathDef", action: () => handleCreateNewTalentPath() },
            ]}
          />
          <DropdownButton
            primary={{
              label: "Export ALL Talents",
              action: () => exportDefEditorDefs('TALENTS') 
            }}
            options={[
            ]}
          />
          <input 
            id="xmlImport" 
            type="file" 
            multiple 
            accept=".xml" 
            onChange={handleFileChange} 
            className="hidden" 
          />
        </div>

        <h2 className="font-semibold text-sm mb-2 text-gray-200">Saved Definitions</h2>
        {defTypes.map(({ id, label }) => (
          <div key={`${id}-${defsVersion}`} className="mb-2">
            <h3 className="text-xs font-medium text-gray-300 mb-1">{label}</h3>
            {Object.entries(StorageUtils.getDefsOfType(id) || {}).map(([defName, def]) => (
              <div key={defName} className="flex items-center gap-1 text-xs">
                <button
                  onClick={() => handleLoadDef(id, defName)}
                  className="flex-1 text-left text-gray-300 hover:bg-gray-700 px-1.5 py-0.5 rounded truncate"
                >
                  {defName}
                </button>
                <button
                  onClick={() => handleDeleteDef(id, defName)}
                  className="text-red-400 hover:bg-gray-700 px-1.5 rounded"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* Main Content */}
      <div className="flex-1">
        <select
          value={selectedType || ''}
          onChange={e => handleTypeChange(e.target.value)}
          className="w-full p-2 mb-3 border border-gray-700 rounded text-sm bg-gray-800 text-gray-200"
        >
          <option value="" className="bg-gray-800">Select Definition Type</option>
          {defTypes.map(({ id, label }) => (
            <option key={id} value={id} className="bg-gray-800">{label}</option>
          ))}
        </select>

        {selectedType && currentDef && (
          <>
            {selectedType === 'TalentDef' && (
              <TalentDefEditor 
                currentDef={currentDef} 
                setCurrentDef={setCurrentDef}
                onSave={handleSaveDef}
              />
            )}
            {selectedType === 'TalentPathDef' && (
              <TalentPathEditor 
                currentDef={currentDef} 
                setCurrentDef={setCurrentDef}
                onSave={handleSaveDef}
              />
            )}
          </>
        )}
      </div>
    </div>
);
};

export default DefManager;