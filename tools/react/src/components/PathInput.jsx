import React, { useState } from 'react';
import { X } from 'lucide-react';

const PathInput = ({ value, onChange, color = 'bg-green-900' }) => {
  const [isEditing, setIsEditing] = useState(!value);
  const [inputValue, setInputValue] = useState(value || '');

  const handleBlur = () => {
    onChange(inputValue);
    setIsEditing(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      onChange(inputValue);
      setIsEditing(false);
    }
  };

  const handleClear = () => {
    onChange('');
    setInputValue('');
    setIsEditing(true);
  };

  const startEditing = () => {
    setIsEditing(true);
    setInputValue(value);
  };

  return (
    <div className="flex items-center gap-2">
      {!isEditing ? (
        <div className="flex items-center w-full gap-2 bg-gray-700 rounded-md border border-gray-600">
          <button
            onClick={startEditing}
            className="flex-grow text-left text-sm text-gray-300 p-1.5 
              hover:bg-gray-600 rounded-l transition-colors"
            type="button"
          >
            {value || 'Enter path...'}
          </button>
          <button
            onClick={handleClear}
            className="px-2 rounded-r hover:bg-gray-600 text-gray-400 
              hover:text-gray-300 transition-colors"
            type="button"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          className="w-full p-1.5 text-sm bg-gray-700 border border-gray-600 
            text-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 
            focus:border-blue-500 placeholder-gray-500"
          placeholder="Enter path..."
          autoFocus
        />
      )}
    </div>
  );
};

export default PathInput;