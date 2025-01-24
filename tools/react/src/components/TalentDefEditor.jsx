import React, { useState, useCallback } from 'react';
import { StorageUtils } from '../utils/StorageUtils';
import { ChevronDown, ChevronRight, X } from 'lucide-react';

// Types for better type safety
const EFFECT_TYPES = {
  STAT: 'stat',
  HEDIFF: 'hediff',
  ORGAN: 'organ',
  ABILITY: 'ability',
};

const STAT_OPERATIONS = {
  ADD: 'Add',
  MULTIPLY: 'Multiply',
  OVERRIDE: 'Override',
};


const EffectEditorBase = ({ children, onRemove }) => (
  <div className="flex items-center gap-3 p-4 bg-gray-800/50 rounded-lg border border-gray-700/50 hover:border-gray-700 transition-colors">
    {children}
    <button
      onClick={onRemove}
      className="p-1 rounded-full hover:bg-gray-700 transition-colors group"
      aria-label="Remove effect"
    >
      <X className="h-4 w-4 text-gray-400 group-hover:text-red-400" />
    </button>
  </div>
);

const StatEffectEditor = ({ effect, onChange, onRemove }) => (
  <EffectEditorBase onRemove={onRemove}>
    <input
      type="text"
      value={effect.statDef}
      onChange={e => onChange({ ...effect, statDef: e.target.value })}
      className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      placeholder="Stat Definition"
    />
    <select
      value={effect.operation}
      onChange={e => onChange({ ...effect, operation: e.target.value })}
      className="w-32 px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
    >
      {Object.values(STAT_OPERATIONS).map(op => (
        <option key={op} value={op}>{op}</option>
      ))}
    </select>
    <input
      type="number"
      value={effect.value}
      onChange={e => onChange({ ...effect, value: parseFloat(e.target.value) || 0 })}
      className="w-24 px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      placeholder="Value"
    />
  </EffectEditorBase>
);

const HediffEffectEditor = ({ effect, onChange, onRemove }) => (
  <EffectEditorBase onRemove={onRemove}>
    <input
      type="text"
      value={effect.hediffDef}
      onChange={e => onChange({ ...effect, hediffDef: e.target.value })}
      className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      placeholder="Health Effect Definition"
    />
    <input
      type="number"
      value={effect.severity}
      onChange={e => onChange({ ...effect, severity: parseFloat(e.target.value) || 0 })}
      className="w-24 px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      placeholder="Severity"
    />
  </EffectEditorBase>
);

const OrganEffectEditor = ({ effect, onChange, onRemove }) => (
  <EffectEditorBase onRemove={onRemove}>
    <input
      type="text"
      value={effect.targetOrgan}
      onChange={e => onChange({ ...effect, targetOrgan: e.target.value })}
      className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      placeholder="Target Organ"
    />
    <input
      type="text"
      value={effect.addedOrganHediff}
      onChange={e => onChange({ ...effect, addedOrganHediff: e.target.value })}
      className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      placeholder="Added Health Effect"
    />
    <label className="flex items-center gap-2 cursor-pointer">
      <input
        type="checkbox"
        checked={effect.isAddition}
        onChange={e => onChange({ ...effect, isAddition: e.target.checked })}
        className="w-4 h-4 rounded bg-gray-700 border-gray-600 text-blue-500 focus:ring-blue-500 focus:ring-offset-gray-900"
      />
      <span className="text-sm text-gray-300 whitespace-nowrap">Is Addition</span>
    </label>
  </EffectEditorBase>
);

const AbilityEffectEditor = ({ effect, onChange, onRemove }) => (
  <EffectEditorBase onRemove={onRemove}>
    <input
      type="text"
      value={effect.abilityDef}
      onChange={e => onChange({ ...effect, abilityDef: e.target.value })}
      className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      placeholder="Ability Definition"
    />
  </EffectEditorBase>
);

const EffectsList = ({ title, effects = [], onChange, createEmpty, EffectComponent }) => {
  const [isExpanded, setIsExpanded] = useState(true);

  const handleAdd = useCallback(() => {
    onChange([...effects, createEmpty()]);
    setIsExpanded(true);
  }, [effects, onChange, createEmpty]);

  return (
    <div className="rounded-lg border border-gray-800 bg-gray-900/50 shadow-lg">
      <div className="flex justify-between items-center">
        <button
          className="flex-1 flex items-center gap-2 p-4 hover:bg-gray-800/50 transition-colors text-left"
          onClick={() => setIsExpanded(!isExpanded)}
          aria-expanded={isExpanded}
        >
          {isExpanded ? (
            <ChevronDown className="h-4 w-4 text-gray-400" />
          ) : (
            <ChevronRight className="h-4 w-4 text-gray-400" />
          )}
          <h3 className="text-sm font-medium text-gray-200">{title}</h3>
          <span className="text-xs text-gray-400">({effects.length})</span>
        </button>
        <button
          onClick={handleAdd}
          className="px-3 py-1 mr-4 text-sm text-blue-400 hover:text-blue-300 hover:bg-gray-800 rounded-md transition-colors"
        >
          Add {title.slice(0, -1)}
        </button>
      </div>
      
      <div className={`
        overflow-hidden transition-all duration-300 ease-in-out
        ${isExpanded ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'}
      `}>
        <div className="p-4 space-y-3 border-t border-gray-800">
          {effects.map((effect, index) => (
            <EffectComponent
              key={index}
              effect={effect}
              onChange={newEffect => {
                const newEffects = [...effects];
                newEffects[index] = newEffect;
                onChange(newEffects);
              }}
              onRemove={() => onChange(effects.filter((_, i) => i !== index))}
            />
          ))}
          {effects.length === 0 && (
            <p className="text-sm text-gray-400 text-center py-2">
              No {title.toLowerCase()} added yet
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

const TalentDefEditor = ({ currentDef, setCurrentDef, onSave }) => {
  const createEmptyEffect = useCallback((type) => {
    const templates = {
      [EFFECT_TYPES.STAT]: { statDef: '', value: 0, operation: STAT_OPERATIONS.ADD },
      [EFFECT_TYPES.HEDIFF]: { hediffDef: '', severity: 1.0 },
      [EFFECT_TYPES.ABILITY]: { abilityDef: '' },
      [EFFECT_TYPES.ORGAN]: { targetOrgan: '', addedOrganHediff: '', isAddition: true }
    };
    return templates[type];
  }, []);
  const [originalDefName, setOriginalDefName] = useState(currentDef.defName);
  
  const handleSave = useCallback(async () => {
    const newName = currentDef.defName.trim();
    if (!newName) {
      alert('Please enter a talent name');
      return;
    }
    
    try {
      if (newName !== currentDef.defName) {
        await StorageUtils.deleteSingleDefOfType('TalentDef', currentDef.defName);
      }
      await StorageUtils.saveSingleDefOfType('TalentDef', newName, currentDef);
      onSave?.();
    } catch (error) {
      console.error('Failed to save talent definition:', error);
      alert('Failed to save talent definition. Please try again.');
    }
  }, [currentDef, onSave]);

  return (
    <div className="bg-gray-900 p-6 rounded-lg space-y-6">
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2 text-gray-200">
            Talent Name
          </label>
          <input
            type="text"
            value={currentDef.defName}
            onChange={e => setCurrentDef({ ...currentDef, defName: e.target.value })}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter talent name"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2 text-gray-200">
            Talent Label
          </label>
          <input
            type="text"
            value={currentDef.label || 'No Label'}
            onChange={e => setCurrentDef({ ...currentDef, label: e.target.value })}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter talent label"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2 text-gray-200">
            Description
          </label>
          <textarea
            value={currentDef.description}
            onChange={e => setCurrentDef({ ...currentDef, description: e.target.value })}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter talent description"
            rows={3}
          />
        </div>

        <div className="space-y-4">
          <EffectsList
            title="Stat Effects"
            effects={currentDef.statEffects}
            onChange={effects => setCurrentDef({ ...currentDef, statEffects: effects })}
            createEmpty={() => createEmptyEffect(EFFECT_TYPES.STAT)}
            EffectComponent={StatEffectEditor}
          />

          <EffectsList
            title="Health Effects"
            effects={currentDef.hediffEffects}
            onChange={effects => setCurrentDef({ ...currentDef, hediffEffects: effects })}
            createEmpty={() => createEmptyEffect(EFFECT_TYPES.HEDIFF)}
            EffectComponent={HediffEffectEditor}
          />

          <EffectsList
            title="Organ Effects"
            effects={currentDef.organEffects}
            onChange={effects => setCurrentDef({ ...currentDef, organEffects: effects })}
            createEmpty={() => createEmptyEffect(EFFECT_TYPES.ORGAN)}
            EffectComponent={OrganEffectEditor}
          />

          <EffectsList
            title="Ability Effects"
            effects={currentDef.abilityEffects}
            onChange={effects => setCurrentDef({ ...currentDef, abilityEffects: effects })}
            createEmpty={() => createEmptyEffect(EFFECT_TYPES.ABILITY)}
            EffectComponent={AbilityEffectEditor}
          />
        </div>

        <button
          onClick={handleSave}
          className="w-full py-2 px-4 bg-green-600 hover:bg-green-700 text-white rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:ring-offset-gray-900"
        >
          Save Talent Definition
        </button>
      </div>
    </div>
  );
};

export default TalentDefEditor;