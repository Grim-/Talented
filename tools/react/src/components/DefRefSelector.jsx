import React from 'react';

const DefSelector = ({ defType, value, onChange, className }) => {
  const savedDefs = JSON.parse(localStorage.getItem('savedDefs') || '{}');
  const defsOfType = savedDefs[defType] || {};
  const defNames = Object.keys(defsOfType);

  return (
    <div className="space-y-2">
      <select
        value={value}
        onChange={e => onChange(e.target.value)} 
        className={`w-full p-2 border rounded ${className}`}
      >
        <option value="">{defType}</option>
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
