import React, { useState, useEffect } from 'react';
import { EditableDefTypes, DefStructures } from '../DefTypes';
import Button from './Button';
import { serializeDefToXml, handleXmlImport } from '../utils/xmlSerializer';
import { renderPropertyEditor } from '../utils/renderProperties';

const DefEditor = ({ selectedType, setSelectedType, currentDef, setCurrentDef }) => {
  const [savedDefs, setSavedDefs] = useState(() => {
    const saved = localStorage.getItem('savedDefs');
    return saved ? JSON.parse(saved) : {};
  });

  // And in DefEditor, add:
  useEffect(() => {
    console.log("Saving to localStorage:", savedDefs);
    localStorage.setItem('savedDefs', JSON.stringify(savedDefs));
  }, [savedDefs]);

  const handleTypeChange = (type) => {
    setSelectedType(type);
    setCurrentDef({
      defName: '',
      type: type,
      ...createEmptyDefForType(type)
    });
  };

  const createEmptyDefForType = (type) => {
    const structure = DefStructures[getNamespacedType(type)];
    const emptyDef = {};

  Object.keys(structure.properties).forEach(prop => {
      const propDef = structure.properties[prop];
      if (propDef === 'string') emptyDef[prop] = '';
      else if (propDef === 'number') emptyDef[prop] = 0;
      else if (propDef === 'boolean') emptyDef[prop] = false;
      else if (propDef === 'defList') emptyDef[prop] = [];
      else if (propDef.type === 'list') emptyDef[prop] = [];
      else if (propDef.type === 'vector2') emptyDef[prop] = { x: 0, y: 0 };
      else if (propDef.type === 'enum') emptyDef[prop] = propDef.values[0];
    });

    return emptyDef;
  };

  const createEmptyListItem = (propName) => {
    switch(propName) {
      case 'organEffects':
        return {
          targetOrgan: '',
          addedOrganHediff: '',
          isAddition: true
        };
      case 'abilityEffects':
        return {
          abilityDef: ''
        };
      case 'statEffects':
        return {
          statDef: '',
          value: 0,
          operation: 'Add'
        };
      case 'hediffEffects':
        return {
          hediffDef: '',
          severity: 1.0
        };
      case 'prerequisites':
        return '';
      default:
        return '';
    }
  };
  const renderStatEffectEditor = (item, index, propName) => (
    <div className="space-y-2 p-4 bg-white rounded">
      <input
        type="text"
        value={item.statDef}
        onChange={e => handleListItemChange(propName, index, 'statDef', e.target.value)}
        className="w-full p-2 border rounded"
        placeholder="Stat Def Name"
      />
      <input
        type="number"
        value={item.value}
        onChange={e => handleListItemChange(propName, index, 'value', parseFloat(e.target.value))}
        className="w-full p-2 border rounded"
        placeholder="Value"
      />
      <select
        value={item.operation}
        onChange={e => handleListItemChange(propName, index, 'operation', e.target.value)}
        className="w-full p-2 border rounded"
      >
        <option value="Add">Add</option>
        <option value="Multiply">Multiply</option>
        <option value="Override">Override</option>
      </select>
    </div>
  );
  const renderHediffEffectEditor = (item, index, propName) => (
  <div className="space-y-2 p-4 bg-white rounded">
    <input
      type="text"
      value={item.hediffDef}
      onChange={e => handleListItemChange(propName, index, 'hediffDef', e.target.value)}
      className="w-full p-2 border rounded"
      placeholder="Hediff Def Name"
    />
    <input
      type="number"
      value={item.severity}
      onChange={e => handleListItemChange(propName, index, 'severity', parseFloat(e.target.value))}
      className="w-full p-2 border rounded"
      placeholder="Severity"
    />
  </div>
);
  const handleListItemAdd = (propName) => {
    setCurrentDef(prev => ({
      ...prev,
      [propName]: [...(prev[propName] || []), createEmptyListItem(propName)]
    }));
  };

  const handleListItemRemove = (propName, index) => {
    setCurrentDef(prev => ({
      ...prev,
      [propName]: prev[propName].filter((_, i) => i !== index)
    }));
  };

  const handleListItemChange = (propName, index, field, value) => {
    setCurrentDef(prev => ({
      ...prev,
      [propName]: prev[propName].map((item, i) => {
        if (i !== index) return item;
        if (typeof item === 'string') return value;
        return { ...item, [field]: value };
      })
    }));
  };

  const handleLoadDef = (type, defName) => {
    const def = savedDefs[type]?.[defName];
    if (def) {
      setSelectedType(type);
      setCurrentDef(def);
    }
  };

  const handleDeleteDef = (type, defName) => {
    if (!window.confirm(`Delete ${defName}?`)) return;
    setSavedDefs(prev => {
      const newDefs = { ...prev };
      delete newDefs[type][defName];
      if (Object.keys(newDefs[type]).length === 0) delete newDefs[type];
      return newDefs;
    });
  };
  const getNamespacedType = (uiType) => {
    return `Talented.${uiType}`;
  };
  const renderOrganEffectEditor = (item, index, propName) => (
    <div className="space-y-2 p-4 bg-white rounded">
      <input
        type="text"
        value={item.targetOrgan}
        onChange={e => handleListItemChange(propName, index, 'targetOrgan', e.target.value)}
        className="w-full p-2 border rounded"
        placeholder="Target Organ"
      />
      <input
        type="text"
        value={item.addedOrganHediff}
        onChange={e => handleListItemChange(propName, index, 'addedOrganHediff', e.target.value)}
        className="w-full p-2 border rounded"
        placeholder="Added Organ Hediff"
      />
      <label className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={item.isAddition}
          onChange={e => handleListItemChange(propName, index, 'isAddition', e.target.checked)}
          className="rounded"
        />
        Is Addition
      </label>
    </div>
  );

  const renderAbilityEffectEditor = (item, index, propName) => (
    <div className="space-y-2 p-4 bg-white rounded">
      <input
        type="text"
        value={item.abilityDef}
        onChange={e => handleListItemChange(propName, index, 'abilityDef', e.target.value)}
        className="w-full p-2 border rounded"
        placeholder="Ability Def Name"
      />
    </div>
  );

  const renderPrerequisiteEditor = (item, index, propName) => (
    <input
      type="text"
      value={item}
      onChange={e => handleListItemChange(propName, index, null, e.target.value)}
      className="w-full p-2 border rounded"
      placeholder="Prerequisite Def Name"
    />
  );

  const renderListEditor = (propName, list = []) => (
    <div className="space-y-2">
      {list.map((item, index) => (
        <div key={index} className="flex gap-2 items-start">
          <div className="flex-1">
            {propName === 'organEffects' && renderOrganEffectEditor(item, index, propName)}
            {propName === 'abilityEffects' && renderAbilityEffectEditor(item, index, propName)}
            {propName === 'statEffects' && renderStatEffectEditor(item, index, propName)}
            {propName === 'hediffEffects' && renderHediffEffectEditor(item, index, propName)}
            {propName === 'prerequisites' && renderPrerequisiteEditor(item, index, propName)}
          </div>
          <button
            onClick={() => handleListItemAdd(propName)}
            className="w-50 p-2 bg-blue-200 text-white rounded hover:bg-blue-600"
          >
            Add Item
          </button>
          <button
            onClick={() => handleListItemRemove(propName, index)}
            className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 h-10"
          >
            ×
          </button>
        </div>
      ))}
      {list.length === 0 && (
        <button
          onClick={() => handleListItemAdd(propName)}
          className="w-full p-2 bg-blue-200 text-white rounded hover:bg-blue-600"
        >
          Add Item
        </button>
      )}
    </div>
  );

  const exportToXml = () => {
    const xml = ['<?xml version="1.0" encoding="utf-8" ?>\n<Defs>'];
    Object.values(savedDefs).forEach(defsByType => {
      Object.values(defsByType).forEach(def => {
        xml.push(serializeDefToXml(def));
      });
    });
    xml.push('</Defs>');

    const blob = new Blob([xml.join('\n')], { type: 'text/xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `defs-${new Date().toISOString().slice(0, 10)}.xml`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleSaveDef = () => {
    if (!currentDef?.defName) return;
    setSavedDefs(prev => ({
      ...prev,
      [currentDef.type]: {
        ...(prev[currentDef.type] || {}),
        [currentDef.defName]: currentDef
      }
    }));
  };

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
        <input id="xmlImport" type="file" multiple accept=".xml" onChange={(e) => handleXmlImport(e, savedDefs, setSavedDefs)} className="hidden" />
        </div>

        <h2 className="font-semibold text-sm mb-2">Saved Definitions</h2>
        {Object.entries(EditableDefTypes).map(([key, type]) => (
          <div key={type} className="mb-2">
            <h3 className="text-xs font-medium text-gray-600 mb-1">{type}</h3>
            {savedDefs[type] ? (
              <div className="space-y-0.5">
                {Object.keys(savedDefs[type]).map(defName => (
                  <div key={defName} className="flex items-center gap-1 text-xs">
                    <button
                      onClick={() => handleLoadDef(type, defName)}
                      className="flex-1 text-left hover:bg-gray-200 px-1.5 py-0.5 rounded truncate"
                    >
                      {defName}
                    </button>
                    <button
                      onClick={() => handleDeleteDef(type, defName)}
                      className="text-red-500 hover:bg-red-100 px-1.5 rounded"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-xs text-gray-500">No saved definitions</div>
            )}
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
          <option value="">Select Def Type</option>
          {Object.entries(EditableDefTypes).map(([key, value]) => (
            <option key={value} value={value}>{value}</option>
          ))}
        </select>

        {selectedType && currentDef && (
          <div className="bg-gray-100 p-4 rounded-lg">
            <div className="grid gap-3">
              <div>
                <label className="block text-xs font-medium mb-1">Def Name</label>
                <input
                  type="text"
                  value={currentDef.defName}
                  onChange={e => setCurrentDef({ ...currentDef, defName: e.target.value })}
                  className="w-full p-1.5 text-sm border rounded"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
              {Object.entries(DefStructures[getNamespacedType(selectedType)].properties).map(([propName, propDef]) => (
                  <div key={propName}>
                    <label className="block text-xs font-medium mb-1">{propName}</label>
                    {propDef === 'defList' ? (
                      renderListEditor(propName, currentDef[propName])
                    ) : (
                      renderPropertyEditor(
                        propName,
                        propDef,
                        currentDef[propName],
                        value => setCurrentDef({ ...currentDef, [propName]: value })
                      )
                    )}
                  </div>
                ))}
              </div>

              <Button
                onClick={handleSaveDef}
                className="w-full bg-green-500 hover:bg-green-600 text-white mt-2"
              >
                Save Definition
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DefEditor;
