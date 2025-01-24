import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

const DropdownButton = ({ 
  primary,
  options,
  bgColor = 'bg-gray-800',
  bgColorHover = 'bg-gray-600',
  dropDownColor = 'bg-gray-600',
  dropDownColorHover = 'bg-gray-400'
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="flex">
      <button
        onClick={primary.action}
        className={`${bgColor} hover:${bgColorHover} text-white text-xs py-1 px-4 rounded-l`}
      >
        {primary.label}
      </button>
      
      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`${dropDownColor} hover:${dropDownColorHover} text-white text-xs py-1 px-2 rounded-r`}
          aria-expanded={isOpen}
        >
          <ChevronDown className="h-4 w-4" />
        </button>
        
        {isOpen && (
          <div className="absolute right-0 mt-1 w-40 bg-white rounded shadow-lg z-50">
            {options.map(({ label, action }) => (
              <button
                key={label}
                onClick={() => {
                  action();
                  setIsOpen(false);
                }}
                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                {label}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DropdownButton;