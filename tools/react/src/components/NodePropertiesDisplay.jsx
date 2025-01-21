import React, { useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';

const PropertySection = ({ title, children, defaultOpen = false }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="border-b border-gray-200">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full p-2 hover:bg-gray-50"
      >
        <span className="font-medium text-sm text-gray-700">{title}</span>
        {isOpen ? (
          <ChevronDown className="h-4 w-4 text-gray-500" />
        ) : (
          <ChevronRight className="h-4 w-4 text-gray-500" />
        )}
      </button>
      {isOpen && (
        <div className="p-2 bg-gray-50">
          {children}
        </div>
      )}
    </div>
  );
};

const ArrayDisplay = ({ items }) => {
  if (!items || items.length === 0) return <span className="text-gray-500 text-sm">None</span>;
  
  return (
    <div className="max-h-32 overflow-y-auto rounded border border-gray-200">
      {items.map((item, index) => (
        <div key={index} className="p-1 text-sm border-b border-gray-200 last:border-b-0">
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
    'ExclusivePaths' : []
  };

  return (
    <div className="w-full max-w-md bg-white rounded-lg shadow divide-y divide-gray-200">
      <PropertySection title="Basic Properties" defaultOpen={true}>
        {Object.entries(basicProps).map(([key, value]) => (
          <div key={key} className="flex justify-between py-1">
            <span className="text-sm text-gray-600">{key}:</span>
            <span className="text-sm font-medium">{value}</span>
          </div>
        ))}
      </PropertySection>

      <PropertySection title="Position & Size">
        {Object.entries(positionProps).map(([key, value]) => (
          <div key={key} className="flex justify-between py-1">
            <span className="text-sm text-gray-600">{key}:</span>
            <span className="text-sm font-medium">{Math.round(value)}</span>
          </div>
        ))}
      </PropertySection>

      <PropertySection title="Paths & Upgrades">
        {Object.entries(pathProps).map(([key, value]) => (
          <div key={key} className="flex flex-col py-1">
            <span className="text-sm text-gray-600">{key}:</span>
            <span className="text-sm font-medium break-words">{value || 'None'}</span>
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