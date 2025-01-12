import React, { useState } from 'react';
import { PlusCircle } from 'lucide-react';

const DefTypeButtons = ({ onSelectType }) => {
  const defTypes = {
    'UpgradeTreeNodeDef': {
      label: 'Node Definition',
      description: 'Basic node in the upgrade tree'
    },
    'UpgradeTreeDef': {
      label: 'Tree Definition',
      description: 'Defines the structure of an upgrade tree'
    },
    'UpgradeDef': {
      label: 'Upgrade Definition',
      description: 'Defines an individual upgrade'
    },
    'UpgradePathDef': {
      label: 'Path Definition',
      description: 'Defines a progression path'
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-4">
      {Object.entries(defTypes).map(([type, info]) => (
        <button
          key={type}
          onClick={() => onSelectType(type)}
          className="flex flex-col items-center p-4 bg-white border rounded-lg shadow-sm hover:bg-gray-50 transition-colors"
        >
          <div className="flex items-center justify-center w-12 h-12 mb-3 rounded-full bg-blue-50">
            <PlusCircle className="w-6 h-6 text-blue-500" />
          </div>
          <h3 className="text-sm font-medium text-gray-900">{info.label}</h3>
          <p className="mt-1 text-xs text-gray-500 text-center">{info.description}</p>
        </button>
      ))}
    </div>
  );
};
