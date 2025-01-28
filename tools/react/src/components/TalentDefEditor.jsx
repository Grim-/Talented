import React, { useState, useCallback } from 'react';
import { StorageUtils } from '../utils/StorageUtils';
import { Download } from 'lucide-react';
import {generateTalentDefXml} from '../utils/xmlSerializer';
import { StatEffectEditor, STAT_OPERATIONS } from './StatEffectEditor';
import { HediffEffectEditor } from './HediffEffectEditor';
import { OrganEffectEditor } from './OrganEffectEditor';
import { AbilityEffectEditor } from './AbilityEffectEditor';
import { EffectsList } from './TalentEffectsList';


// Types for better type safety
const EFFECT_TYPES = {
  STAT: 'stat',
  HEDIFF: 'hediff',
  ORGAN: 'organ',
  ABILITY: 'ability',
};



const TalentDefEditor = ({ currentDef, setCurrentDef, onSave }) => {


  const handleExport = useCallback(() => {
    const xml = '<?xml version="1.0" encoding="utf-8" ?>\n<Defs>\n' + generateTalentDefXml(currentDef) + '</Defs>';
    const blob = new Blob([xml], { type: 'text/xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${currentDef.defName || 'talent'}.xml`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [currentDef]);

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
        <div className="flex gap-4 items-center">
          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2 bg-gray-600 hover:bg-blue-700 text-white rounded-md transition-colors"
            title="Export Talent Definition"
          >
            <Download className="w-4 h-4" />
            <span>Export Talent Definition</span>
          </button>
          
          <button
            onClick={handleSave}
            className="py-2 px-4 bg-gray-600 hover:bg-green-700 text-white rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:ring-offset-gray-900"
          >
            Update Talent Definition
          </button>
        </div>
      </div>
    </div>
  );
};

export default TalentDefEditor;