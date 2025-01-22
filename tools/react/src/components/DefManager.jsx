import React, { useState } from 'react';
import { StorageUtils } from '../utils/StorageUtils';
import TalentDefEditor from './TalentDefEditor';
import TalentPathEditor from './TalentPathEditor';
import Button from './Button';
import { serializeDefToXml, handleXmlImport } from '../utils/xmlSerializer';

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

  const createEmptyTalentDef = () => ({
    description: '',
    prerequisites: [],
    statEffects: [],
    hediffEffects: [],
    abilityEffects: [],
    organEffects: [],
    pathPrerequisites: [],
    pathExclusions: []
  });

  const createEmptyPathDef = () => ({
    description: '',
    color: '#000000',
    exclusiveWith: []
  });

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

  const exportToXml = () => {
    const allDefs = StorageUtils.getSavedDefs();
    const xml = ['<?xml version="1.0" encoding="utf-8" ?>\n<Defs>'];
    
    Object.entries(allDefs).forEach(([type, defs]) => {
      Object.values(defs).forEach(def => {
        xml.push(serializeDefToXml({ ...def, type }));
      });
    });
    
    xml.push('</Defs>');

    const blob = new Blob([xml.join('\n')], { type: 'text/xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `TalentAndPathDefs.xml`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
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
      <div className="w-64 bg-gray-600 p-4 rounded-lg">
        <div className="flex gap-2 mb-3">
          <Button
            onClick={() => document.getElementById('xmlImport').click()}
            className="flex-1 bg-blue-500 hover:bg-blue-600 text-white text-xs py-1"
          >
            Import
          </Button>
          <Button
            onClick={exportToXml}
            className="flex-1 bg-green-500 hover:bg-green-600 text-white text-xs py-1"
          >
            Export
          </Button>
          <input 
            id="xmlImport" 
            type="file" 
            multiple 
            accept=".xml" 
            onChange={handleFileChange} 
            className="hidden" 
          />
        </div>

        <h2 className="font-semibold text-sm mb-2 text-white">Saved Definitions</h2>
        {defTypes.map(({ id, label }) => (
          <div key={`${id}-${defsVersion}`} className="mb-2">
            <h3 className="text-xs font-medium text-white mb-1">{label}</h3>
            {Object.entries(StorageUtils.getDefsOfType(id) || {}).map(([defName, def]) => (
              <div key={defName} className="flex items-center gap-1 text-xs">
                <button
                  onClick={() => handleLoadDef(id, defName)}
                  className="flex-1 text-left hover:bg-gray-200 px-1.5 py-0.5 rounded truncate"
                >
                  {defName}
                </button>
                <button
                  onClick={() => handleDeleteDef(id, defName)}
                  className="text-red-500 hover:bg-red-100 px-1.5 rounded"
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
          className="w-full p-2 mb-3 border border-gray-600 rounded text-sm bg-gray-700 text-gray-200"
        >
          <option value="" className="bg-gray-700">Select Definition Type</option>
          {defTypes.map(({ id, label }) => (
            <option key={id} value={id} className="bg-gray-700">{label}</option>
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