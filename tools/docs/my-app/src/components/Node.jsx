import React from 'react';
import Button from './Button';

const Node = ({
  node,
  selected,
  connecting,
  onMouseDown,
  onClick,
  onStartConnection,
  onDelete,
  onCopyProperty
}) => {
  return (
    <div
      className={`absolute p-4 rounded-lg shadow-lg w-20 cursor-move
        ${node.type === 'Start' ? 'bg-green-100' : 'bg-white'}
        ${node.type === 'Branch' ? 'bg-yellow-100' : ''}
        ${selected ? 'ring-2 ring-blue-500' : ''}
        ${connecting ? 'ring-2 ring-blue-300' : ''}`}
      style={{
        left: node.x,
        top: node.y
      }}
      onMouseDown={onMouseDown}
      onClick={onClick}
    >
      <div
        className="text-sm font-medium mb-2 cursor-pointer hover:bg-gray-100 px-1 rounded"
        onClick={(e) => {
          e.stopPropagation();
          onCopyProperty(node.label, 'label');
        }}
        title="Click to copy label"
      >
        {node.label}
      </div>
      <div
        className="text-xs text-gray-500 mb-2 cursor-pointer hover:bg-gray-100 px-1 rounded"
        onClick={(e) => {
          e.stopPropagation();
          onCopyProperty(node.path, 'path');
        }}
        title="Click to copy path"
      >
        {node.path && `Path: ${node.path}`}
      </div>
      <div
        className="text-xs text-gray-500 mb-2 cursor-pointer hover:bg-gray-100 px-1 rounded"
        onClick={(e) => {
          e.stopPropagation();
          onCopyProperty(node.upgrade, 'upgrade');
        }}
        title="Click to copy upgrade"
      >
        {node.upgrade && `Upgrade: ${node.upgrade}`}
      </div>
      <div className="flex justify-between items-center">
        <Button
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            onStartConnection(node.id);
          }}
          className="bg-blue-500 text-white"
        >
          →
        </Button>
        <Button
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            onDelete(node.id);
          }}
          className="bg-red-500 text-white"
        >
          ×
        </Button>
      </div>
    </div>
  );
};

export default Node;
