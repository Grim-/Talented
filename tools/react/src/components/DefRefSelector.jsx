import React from 'react';
import { StorageUtils } from '../utils/StorageUtils';

const DefSelector = ({ defType, value, onChange, className }) => {
  const defsOfType = StorageUtils.getDefsOfType(defType);
  const defNames = Object.keys(defsOfType);

  return (
    <div className="space-y-2">
      <select
        value={value || ''}
        onChange={e => {
          onChange(e.target.value);
        }}
        className={`w-full p-2 border rounded ${className}`}
      >
        <option value="">Select {defType}</option>
        {defNames.map((defName) => (
          <option key={defName} value={defName}>
            {defName}
          </option>
        ))}
      </select>
    </div>
  );
};

export default DefSelector;