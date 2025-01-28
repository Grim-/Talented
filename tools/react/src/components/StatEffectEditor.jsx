import { EffectEditorBase } from "./EffectEditorBase";
import React, { useState, useCallback } from 'react';

export const STAT_OPERATIONS = {
  ADD: 'Add',
  MULTIPLY: 'Multiply',
  OVERRIDE: 'Override',
};

export const StatEffectEditor = ({ effect, onChange, onRemove }) =>{
   
      return (      
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
}