import React, { useState } from 'react';
import { StorageUtils } from '../utils/StorageUtils';
import TalentDefEditor from './TalentDefEditor';
import TalentPathEditor from './TalentPathEditor';
import Button from './Button';
import { serializeDefToXml, handleXmlImport } from '../utils/xmlSerializer';

const DefManager = () => {
  const [selectedType, setSelectedType] = useState(null);
  const [currentDef, setCurrentDef] = useState(null);
  StorageUtils.migrateParasiteLevelToLevelRequired();
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

  const defTypes = [
    { id: 'TalentDef', label: 'Talent Definition' },
    { id: 'TalentPathDef', label: 'Path Definition' }
  ];

  return (
    <div className="flex gap-4">
      {/* Sidebar */}
      <div className="w-64 bg-gray-50 p-4 rounded-lg">
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
            onChange={e => handleXmlImport(e, StorageUtils)} 
            className="hidden" 
          />
        </div>

        <h2 className="font-semibold text-sm mb-2">Saved Definitions</h2>
        {defTypes.map(({ id, label }) => (
          <div key={id} className="mb-2">
            <h3 className="text-xs font-medium text-gray-600 mb-1">{label}</h3>
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
          className="w-full p-2 mb-3 border rounded text-sm"
        >
          <option value="">Select Definition Type</option>
          {defTypes.map(({ id, label }) => (
            <option key={id} value={id}>{label}</option>
          ))}
        </select>

        {selectedType && currentDef && (
          <>
            {selectedType === 'TalentDef' && (
              <TalentDefEditor currentDef={currentDef} setCurrentDef={setCurrentDef} />
            )}
            {selectedType === 'TalentPathDef' && (
              <TalentPathEditor currentDef={currentDef} setCurrentDef={setCurrentDef} />
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default DefManager;