import React, { useState } from 'react';
import { StorageUtils } from '../utils/StorageUtils';
import { ChevronDown, ChevronRight } from 'lucide-react';
import Button from './Button';

// Effect Editor Components
const StatEffectEditor = ({ effect, onChange, onRemove }) => (
  <div className="flex items-center gap-2 p-3 bg-gray-50 rounded">
    <input
      type="text"
      value={effect.statDef}
      onChange={e => onChange({ ...effect, statDef: e.target.value })}
      className="flex-1 p-2 border rounded text-sm"
      placeholder="Stat Definition"
    />
    <select
      value={effect.operation}
      onChange={e => onChange({ ...effect, operation: e.target.value })}
      className="w-32 p-2 border rounded text-sm"
    >
      <option value="Add">Add</option>
      <option value="Multiply">Multiply</option>
      <option value="Override">Override</option>
    </select>
    <input
      type="number"
      value={effect.value}
      onChange={e => onChange({ ...effect, value: parseFloat(e.target.value) })}
      className="w-24 p-2 border rounded text-sm"
      placeholder="Value"
    />
    <button
      onClick={onRemove}
      className="text-red-500 hover:text-red-700 px-2"
    >
      ×
    </button>
  </div>
);

const HediffEffectEditor = ({ effect, onChange, onRemove }) => (
  <div className="flex items-center gap-2 p-3 bg-gray-50 rounded">
    <input
      type="text"
      value={effect.hediffDef}
      onChange={e => onChange({ ...effect, hediffDef: e.target.value })}
      className="flex-1 p-2 border rounded text-sm"
      placeholder="Health Effect Definition"
    />
    <input
      type="number"
      value={effect.severity}
      onChange={e => onChange({ ...effect, severity: parseFloat(e.target.value) })}
      className="w-24 p-2 border rounded text-sm"
      placeholder="Severity"
    />
    <button
      onClick={onRemove}
      className="text-red-500 hover:text-red-700 px-2"
    >
      ×
    </button>
  </div>
);

const OrganEffectEditor = ({ effect, onChange, onRemove }) => (
  <div className="flex items-center gap-2 p-3 bg-gray-50 rounded">
    <input
      type="text"
      value={effect.targetOrgan}
      onChange={e => onChange({ ...effect, targetOrgan: e.target.value })}
      className="flex-1 p-2 border rounded text-sm"
      placeholder="Target Organ"
    />
    <input
      type="text"
      value={effect.addedOrganHediff}
      onChange={e => onChange({ ...effect, addedOrganHediff: e.target.value })}
      className="flex-1 p-2 border rounded text-sm"
      placeholder="Added Health Effect"
    />
    <label className="flex items-center gap-2 text-sm whitespace-nowrap px-2">
      <input
        type="checkbox"
        checked={effect.isAddition}
        onChange={e => onChange({ ...effect, isAddition: e.target.checked })}
        className="rounded"
      />
      Is Addition
    </label>
    <button
      onClick={onRemove}
      className="text-red-500 hover:text-red-700 px-2"
    >
      ×
    </button>
  </div>
);

const AbilityEffectEditor = ({ effect, onChange, onRemove }) => (
  <div className="flex items-center gap-2 p-3 bg-gray-50 rounded">
    <input
      type="text"
      value={effect.abilityDef}
      onChange={e => onChange({ ...effect, abilityDef: e.target.value })}
      className="flex-1 p-2 border rounded text-sm"
      placeholder="Ability Definition"
    />
    <button
      onClick={onRemove}
      className="text-red-500 hover:text-red-700 px-2"
    >
      ×
    </button>
  </div>
);

// Collapsible Effects List Component
const EffectsList = ({ title, effects = [], onChange, createEmpty, EffectComponent }) => {
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <div className="border rounded-lg bg-white shadow-sm">
      <div 
        className="flex justify-between items-center p-3 cursor-pointer hover:bg-gray-50"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-2">
          {isExpanded ? (
            <ChevronDown className="h-4 w-4 text-gray-500" />
          ) : (
            <ChevronRight className="h-4 w-4 text-gray-500" />
          )}
          <h3 className="text-sm font-medium text-gray-700">{title}</h3>
          <span className="text-xs text-gray-500">({effects.length})</span>
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onChange([...effects, createEmpty()]);
            setIsExpanded(true);
          }}
          className="px-2 py-1 text-sm text-blue-500 hover:text-blue-700 hover:bg-blue-50 rounded"
        >
          + Add
        </button>
      </div>
      
      <div className={`
        overflow-hidden transition-all duration-200 ease-in-out
        ${isExpanded ? 'max-h-[1000px]' : 'max-h-0'}
      `}>
        <div className="p-3 space-y-2 border-t">
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
            <div className="text-sm text-gray-500 text-center py-2">
              No {title.toLowerCase()} added yet
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Main TalentDefEditor Component
const TalentDefEditor = ({ currentDef, setCurrentDef }) => {
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
    <div className="bg-gray-100 p-4 rounded-lg">
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Talent Name</label>
          <input
            type="text"
            value={currentDef.defName}
            onChange={e => setCurrentDef({ ...currentDef, defName: e.target.value })}
            className="w-full p-2 text-sm border rounded"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Description</label>
          <textarea
            value={currentDef.description}
            onChange={e => setCurrentDef({ ...currentDef, description: e.target.value })}
            className="w-full p-2 text-sm border rounded"
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
          className="w-full bg-green-500 hover:bg-green-600 text-white"
        >
          Save Talent Definition
        </Button>
      </div>
    </div>
  );
};

export default TalentDefEditor;