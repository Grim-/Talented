import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

const DropdownButton = ({ 
  primary,
  options,
  className = '',
  bgColor = 'bg-emerald-600',
  bgColorHover = 'bg-emerald-700',
  dropDownColor = 'bg-emerald-700',
  dropDownColorHover = 'bg-emerald-800',
  buttonClassName = '',
  dropdownClassName = ''
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className={`flex ${className}`}>
      <button
        onClick={primary.action}
        className={`${bgColor} hover:${bgColorHover} text-white py-2 px-4 rounded-l flex items-center ${buttonClassName}`}
      >
        {primary.label}
      </button>
      
      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`${dropDownColor} hover:${dropDownColorHover} text-white px-2 rounded-r flex items-center h-full ${dropdownClassName}`}
          aria-expanded={isOpen}
        >
          <ChevronDown className="h-4 w-4" />
        </button>
        
        {isOpen && (
          <div className="absolute right-0 mt-1 w-40 bg-gray-800 rounded shadow-lg -z-5000">
            {options.map(({ label, action }) => (
              <button
                key={label}
                onClick={() => {
                  action();
                  setIsOpen(false);
                }}
                className="block w-full text-left px-4 py-2 text-sm text-gray-100 hover:bg-gray-700"
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