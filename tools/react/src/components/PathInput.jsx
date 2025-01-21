import React from 'react';
import { BadgeHelp, X } from 'lucide-react';

const PathInput = ({ value, onChange, color = 'bg-green-100'}) => (
  <div className="flex items-center gap-2">
    {value ? (
      <>
        <button
          onClick={() => onChange('')}
          className={ `flex-grow text-left text-sm text-gray-900 p-1.5 ${color} hover:bg-gray-100 rounded transition-colors`}
          type="button"
        >
          {value}
        </button>
        <button
          onClick={() => onChange('')}
          className="p-1 rounded hover:bg-gray-100 text-gray-500 hover:text-gray-700 transition-colors"
          type="button"
        >
          <X className="h-4 w-4" />
        </button>
      </>
    ) : (
      <input
        type="text"
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        className="w-full p-1.5 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
      />
    )}
  </div>
);

export default PathInput;