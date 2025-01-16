import React from 'react';

const DefSelector = ({ defType, value, onChange, className }) => {
  // Get saved definitions from localStorage
  const savedDefs = JSON.parse(localStorage.getItem('savedDefs') || '{}');
  const defsOfType = savedDefs[defType] || {};
  const defNames = Object.keys(defsOfType);

  return (
    <div className="space-y-2">
      <select
        value={value}  // The currently selected value
        onChange={e => onChange(e.target.value)}  // Update the value on change
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
