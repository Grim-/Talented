import React, { useEffect, useState } from 'react';

export const ContextMenu = ({ x, y, isOpen, onClose, onSelect }) => {
  const options = ['Normal', 'Start', 'Branch'];

  if (!isOpen) return null;

  return (
    <div 
      className="fixed bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 z-50"
      style={{ left: x, top: y }}
    >
      <div className="py-1">
        {options.map((option) => (
          <button
            key={option}
            onClick={() => {
              onSelect(option);
              onClose();
            }}
            className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900"
          >
            {option}
          </button>
        ))}
      </div>
    </div>
  );
};

export default ContextMenu;