import React, { useState } from 'react';
import { StorageUtils } from '../utils/StorageUtils';
import { ChevronDown, ChevronRight } from 'lucide-react';
import Button from './Button';

// Effect Editor Components
const StatEffectEditor = ({ effect, onChange, onRemove }) => (
  <div className="flex items-center gap-2 p-3 bg-gray-800 rounded">
    <input
      type="text"
      value={effect.statDef}
      onChange={e => onChange({ ...effect, statDef: e.target.value })}
      className="flex-1 p-2 border border-gray-600 rounded text-sm bg-gray-700 text-gray-200"
      placeholder="Stat Definition"
    />
    <select
      value={effect.operation}
      onChange={e => onChange({ ...effect, operation: e.target.value })}
      className="w-32 p-2 border border-gray-600 rounded text-sm bg-gray-700 text-gray-200"
    >
      <option value="Add">Add</option>
      <option value="Multiply">Multiply</option>
      <option value="Override">Override</option>
    </select>
    <input
      type="number"
      value={effect.value}
      onChange={e => onChange({ ...effect, value: parseFloat(e.target.value) })}
      className="w-24 p-2 border border-gray-600 rounded text-sm bg-gray-700 text-gray-200"
      placeholder="Value"
    />
    <button
      onClick={onRemove}
      className="text-red-400 hover:text-red-300 px-2"
    >
      ×
    </button>
  </div>
);

const HediffEffectEditor = ({ effect, onChange, onRemove }) => (
  <div className="flex items-center gap-2 p-3 bg-gray-800 rounded">
    <input
      type="text"
      value={effect.hediffDef}
      onChange={e => onChange({ ...effect, hediffDef: e.target.value })}
      className="flex-1 p-2 border border-gray-600 rounded text-sm bg-gray-700 text-gray-200"
      placeholder="Health Effect Definition"
    />
    <input
      type="number"
      value={effect.severity}
      onChange={e => onChange({ ...effect, severity: parseFloat(e.target.value) })}
      className="w-24 p-2 border border-gray-600 rounded text-sm bg-gray-700 text-gray-200"
      placeholder="Severity"
    />
    <button
      onClick={onRemove}
      className="text-red-400 hover:text-red-300 px-2"
    >
      ×
    </button>
  </div>
);

const OrganEffectEditor = ({ effect, onChange, onRemove }) => (
  <div className="flex items-center gap-2 p-3 bg-gray-800 rounded">
    <input
      type="text"
      value={effect.targetOrgan}
      onChange={e => onChange({ ...effect, targetOrgan: e.target.value })}
      className="flex-1 p-2 border border-gray-600 rounded text-sm bg-gray-700 text-gray-200"
      placeholder="Target Organ"
    />
    <input
      type="text"
      value={effect.addedOrganHediff}
      onChange={e => onChange({ ...effect, addedOrganHediff: e.target.value })}
      className="flex-1 p-2 border border-gray-600 rounded text-sm bg-gray-700 text-gray-200"
      placeholder="Added Health Effect"
    />
    <label className="flex items-center gap-2 text-sm whitespace-nowrap px-2 text-gray-300">
      <input
        type="checkbox"
        checked={effect.isAddition}
        onChange={e => onChange({ ...effect, isAddition: e.target.checked })}
        className="rounded bg-gray-700 border-gray-600"
      />
      Is Addition
    </label>
    <button
      onClick={onRemove}
      className="text-red-400 hover:text-red-300 px-2"
    >
      ×
    </button>
  </div>
);

const AbilityEffectEditor = ({ effect, onChange, onRemove }) => (
  <div className="flex items-center gap-2 p-3 bg-gray-800 rounded">
    <input
      type="text"
      value={effect.abilityDef}
      onChange={e => onChange({ ...effect, abilityDef: e.target.value })}
      className="flex-1 p-2 border border-gray-600 rounded text-sm bg-gray-700 text-gray-200"
      placeholder="Ability Definition"
    />
    <button
      onClick={onRemove}
      className="text-red-400 hover:text-red-300 px-2"
    >
      ×
    </button>
  </div>
);

// Collapsible Effects List Component
const EffectsList = ({ title, effects = [], onChange, createEmpty, EffectComponent }) => {
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <div className="border border-gray-700 bg-gray-900 rounded-lg shadow-lg">
      <div 
        className="flex justify-between items-center p-3 cursor-pointer hover:bg-gray-800"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-2">
          {isExpanded ? (
            <ChevronDown className="h-4 w-4 text-gray-400" />
          ) : (
            <ChevronRight className="h-4 w-4 text-gray-400" />
          )}
          <h3 className="text-sm font-medium text-gray-200">{title}</h3>
          <span className="text-xs text-gray-400">({effects.length})</span>
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onChange([...effects, createEmpty()]);
            setIsExpanded(true);
          }}
          className="px-2 py-1 text-sm text-blue-400 hover:text-blue-300 hover:bg-gray-800 rounded"
        >
          + Add
        </button>
      </div>
      
      <div className={`
        overflow-hidden transition-all duration-200 ease-in-out
        ${isExpanded ? 'max-h-[1000px]' : 'max-h-0'}
      `}>
        <div className="p-3 space-y-2 border-t border-gray-700">
          {effects.map((effect, index) => (
            <EffectComponent
              key={index}
              effect={effect}
              onChange={newEffect => {
                const newEffects = [...effects];
                newEffects[index] = newEffect;
                onChange(newEffects);
              }}
              onRemove={() => {
                const newEffects = effects.filter((_, i) => i !== index);
                onChange(newEffects);
              }}
            />
          ))}
          {effects.length === 0 && (
            <div className="text-sm text-gray-400 text-center py-2">
              No {title.toLowerCase()} added yet
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Main TalentDefEditor Component
const TalentDefEditor = ({ currentDef, setCurrentDef, onSave }) => {
  const createEmptyEffect = (type) => {
    const templates = {
      stat: { statDef: '', value: 0, operation: 'Add' },
      hediff: { hediffDef: '', severity: 1.0 },
      ability: { abilityDef: '' },
      organ: { targetOrgan: '', addedOrganHediff: '', isAddition: true }
    };
    return templates[type];
  };

  const updateEffects = (effectType, newEffects) => {
    setCurrentDef({ ...currentDef, [effectType]: newEffects });
  };

  return (
    <div className="bg-gray-900 p-4 rounded-lg">
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1 text-gray-200">Talent Name</label>
          <input
            type="text"
            value={currentDef.defName}
            onChange={e => setCurrentDef({ ...currentDef, defName: e.target.value })}
            className="w-full p-2 text-sm border border-gray-600 rounded bg-gray-700 text-gray-200"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1 text-gray-200">Description</label>
          <textarea
            value={currentDef.description}
            onChange={e => setCurrentDef({ ...currentDef, description: e.target.value })}
            className="w-full p-2 text-sm border border-gray-600 rounded bg-gray-700 text-gray-200"
            rows={3}
          />
        </div>

        <div className="space-y-3">
          <EffectsList
            title="Stat Effects"
            effects={currentDef.statEffects}
            onChange={effects => updateEffects('statEffects', effects)}
            createEmpty={() => createEmptyEffect('stat')}
            EffectComponent={StatEffectEditor}
          />

          <EffectsList
            title="Health Effects"
            effects={currentDef.hediffEffects}
            onChange={effects => updateEffects('hediffEffects', effects)}
            createEmpty={() => createEmptyEffect('hediff')}
            EffectComponent={HediffEffectEditor}
          />

          <EffectsList
            title="Organ Effects"
            effects={currentDef.organEffects}
            onChange={effects => updateEffects('organEffects', effects)}
            createEmpty={() => createEmptyEffect('organ')}
            EffectComponent={OrganEffectEditor}
          />

          <EffectsList
            title="Ability Effects"
            effects={currentDef.abilityEffects}
            onChange={effects => updateEffects('abilityEffects', effects)}
            createEmpty={() => createEmptyEffect('ability')}
            EffectComponent={AbilityEffectEditor}
          />
        </div>

        <Button
          onClick={() => StorageUtils.saveSingleDefOfType('TalentDef', currentDef.defName, currentDef)}
          className="w-full bg-green-600 hover:bg-green-700 text-white"
        >
          Save Talent Definition
        </Button>
      </div>
    </div>
  );
};

export default TalentDefEditor;