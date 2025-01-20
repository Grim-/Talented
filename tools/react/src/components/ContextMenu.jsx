import React from 'react';
import { Copy, Trash, ArrowLeftRight, Plus } from 'lucide-react';

export const ContextMenu = ({ x, y, isOpen, onClose, onSelect, menuType }) => {
  if (!isOpen) return null;

  // Different menus based on where we clicked
  const MENU_OPTIONS = {
    canvas: [
      { id: 'normal', label: 'Add Normal Node', value: 'Normal', icon: Plus },
      { id: 'start', label: 'Add Start Node', value: 'Start', icon: Plus },
      { id: 'branch', label: 'Add Branch Node', value: 'Branch', icon: Plus }
    ],
    node: [
      { id: 'connect', label: 'Connect Node', value: 'connect', icon: ArrowLeftRight },
      { id: 'copy-path', label: 'Copy Path', value: 'copy-path', icon: Copy },
      { id: 'delete', label: 'Delete Node', value: 'delete', icon: Trash }
    ]
  };

  // Get the correct menu options based on where we clicked
  const options = MENU_OPTIONS[menuType] || MENU_OPTIONS.canvas;

  return (
    <div 
      className="fixed bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 z-50"
      style={{ left: x, top: y }}
    >
      <div className="py-1">
        {options.map((option) => {
          const Icon = option.icon;
          return (
            <button
              key={option.id}
              onClick={() => {
                onSelect(option.value, menuType);
                onClose();
              }}
              className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900"
            >
              <Icon className="w-4 h-4 mr-2" />
              {option.label}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default ContextMenu;