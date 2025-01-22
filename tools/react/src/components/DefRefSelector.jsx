import React from 'react';
import { StorageUtils } from '../utils/StorageUtils';

const DefSelector = ({ defType, value, onChange, className = '' }) => {
  const defsOfType = StorageUtils.getDefsOfType(defType);
  const defNames = Object.keys(defsOfType);

  return (
    <div className="space-y-2">
      <select
        value={value || ''}
        onChange={e => {
          onChange(e.target.value);
        }}
        className={`w-full p-2 bg-gray-700 text-gray-300 border border-gray-600 rounded 
          focus:ring-1 focus:ring-blue-500 focus:border-blue-500
          hover:border-gray-500 transition-colors ${className}`}
      >
        <option value="" className="bg-gray-700">Select {defType}</option>
        {defNames.map((defName) => (
          <option key={defName} value={defName} className="bg-gray-700">
            {defName}
          </option>
        ))}
      </select>
    </div>
  );
};

export default DefSelector;