import React from 'react';

export const renderOrganEffectEditor = (handleListItemAdd, handleListItemChange, handleListItemRemove, propName, item, index) => (
  <div className="space-y-2 p-4 bg-white rounded">
    <input
      type="text"
      value={item.targetOrgan}
      onChange={e => handleListItemChange(propName, index, 'targetOrgan', e.target.value)}
      className="w-full p-2 border rounded"
      placeholder="Target Organ"
    />
    <input
      type="text"
      value={item.addedOrganHediff}
      onChange={e => handleListItemChange(propName, index, 'addedOrganHediff', e.target.value)}
      className="w-full p-2 border rounded"
      placeholder="Added Organ Hediff"
    />
    <label className="flex items-center gap-2">
      <input
        type="checkbox"
        checked={item.isAddition}
        onChange={e => handleListItemChange(propName, index, 'isAddition', e.target.checked)}
        className="rounded"
      />
      Is Addition
    </label>
  </div>
);

export const renderAbilityEffectEditor = (handleListItemAdd, handleListItemChange, handleListItemRemove, propName, item, index) => (
  <div className="space-y-2 p-4 bg-white rounded">
    <input
      type="text"
      value={item.abilityDef}
      onChange={e => handleListItemChange(propName, index, 'abilityDef', e.target.value)}
      className="w-full p-2 border rounded"
      placeholder="Ability Def Name"
    />
  </div>
);

export const renderPrerequisiteEditor = (handleListItemAdd, handleListItemChange, handleListItemRemove, propName, item, index) => (
  <input
    type="text"
    value={item}
    onChange={e => handleListItemChange(propName, index, null, e.target.value)}
    className="w-full p-2 border rounded"
    placeholder="Prerequisite Def Name"
  />
);

const renderListEditor = (handleListItemAdd, handleListItemChange, handleListItemRemove, propName, list) => (
  <div className="space-y-2">
    <button
      onClick={() => handleListItemAdd(propName)}
      className="w-full p-2 bg-blue-500 text-white rounded hover:bg-blue-600 mb-2"
    >
      Add Item
    </button>
    {(typeof list === 'string' ? [list] : (list || [])).map((item, index) => (
      <div key={index} className="flex gap-2 items-start">
        <div className="flex-1">
          <input
            type="text"
            value={item || ''}
            onChange={e => handleListItemChange(propName, index, null, e.target.value)}
            className="w-full p-2 border rounded"
          />
        </div>
        <button
          onClick={() => handleListItemRemove(propName, index)}
          className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
        >
          ×
        </button>
      </div>
    ))}
  </div>
);

// Usage example:
const ListEditorWrapper = ({ node, handleListItemAdd, handleListItemChange, handleListItemRemove }) => (
  <div>
    <label className="block text-sm font-medium mb-1">Upgrades</label>
    {renderListEditor(
      handleListItemAdd,
      handleListItemChange,
      handleListItemRemove,
      'upgrade',
      node?.upgrade // Using optional chaining here
    )}
  </div>
);
