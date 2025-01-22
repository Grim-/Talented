import React, { useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';

const PropertySection = ({ title, children, defaultOpen = false }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="border-b border-gray-700">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full p-2 hover:bg-gray-700 transition-colors"
      >
        <span className="font-medium text-sm text-gray-300">{title}</span>
        {isOpen ? (
          <ChevronDown className="h-4 w-4 text-gray-400" />
        ) : (
          <ChevronRight className="h-4 w-4 text-gray-400" />
        )}
      </button>
      {isOpen && (
        <div className="p-2 bg-gray-800">
          {children}
        </div>
      )}
    </div>
  );
};

const ArrayDisplay = ({ items }) => {
  if (!items || items.length === 0) 
    return <span className="text-gray-500 text-sm">None</span>;
  
  return (
    <div className="max-h-32 overflow-y-auto rounded border border-gray-700 bg-gray-800">
      {items.map((item, index) => (
        <div 
          key={index} 
          className="p-1 text-sm border-b border-gray-700 last:border-b-0 text-gray-300"
        >
          {item}
        </div>
      ))}
    </div>
  );
};

const NodeProperties = ({ node }) => {
  const basicProps = {
    'ID': node.id,
    'Label': node.label,
    'Type': node.type,
    'Level Required': node.levelRequired,
  };

  const positionProps = {
    'X Position': node.x,
    'Y Position': node.y,
    'Width': node.width,
    'Height': node.height,
  };

  const pathProps = {
    'Path': node.path,
    'Description': node.descriptionString,
    'ExclusivePaths': []
  };

  return (
    <div className="w-full max-w-md bg-gray-800 rounded-lg shadow-lg divide-y divide-gray-700">
      <PropertySection title="Basic Properties" defaultOpen={true}>
        {Object.entries(basicProps).map(([key, value]) => (
          <div key={key} className="flex justify-between py-1">
            <span className="text-sm text-gray-400">{key}:</span>
            <span className="text-sm font-medium text-gray-300">{value}</span>
          </div>
        ))}
      </PropertySection>

      <PropertySection title="Position & Size">
        {Object.entries(positionProps).map(([key, value]) => (
          <div key={key} className="flex justify-between py-1">
            <span className="text-sm text-gray-400">{key}:</span>
            <span className="text-sm font-medium text-gray-300">{Math.round(value)}</span>
          </div>
        ))}
      </PropertySection>

      <PropertySection title="Paths & Upgrades">
        {Object.entries(pathProps).map(([key, value]) => (
          <div key={key} className="flex flex-col py-1">
            <span className="text-sm text-gray-400">{key}:</span>
            <span className="text-sm font-medium break-words text-gray-300">
              {value || 'None'}
            </span>
          </div>
        ))}
      </PropertySection>

      <PropertySection title="Branch Paths">
        <ArrayDisplay items={node.branchPaths} />
      </PropertySection>

      <PropertySection title="Upgrades">
        <ArrayDisplay items={node.upgrades} />
      </PropertySection>
    </div>
  );
};

export default NodeProperties;