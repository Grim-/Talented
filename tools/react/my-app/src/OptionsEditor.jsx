import React, { useState } from 'react';
import Button from './components/Button';

const OptionsEditor = () => {
  const [defTypes, setDefTypes] = useState([
    {
      key: 'UPGRADE',
      value: 'Talented.UpgradeDef',
      editable: true
    },
    {
      key: 'UPGRADE_TREE',
      value: 'Talented.UpgradeTreeDef',
      editable: true
    },
    {
      key: 'UPGRADE_TREE_NODE',
      value: 'Talented.UpgradeTreeNodeDef',
      editable: false
    },
    {
      key: 'UPGRADE_PATH',
      value: 'Talented.UpgradePathDef',
      editable: true
    }
  ]);

  const [structures, setStructures] = useState([
    {
      type: 'Talented.UpgradeDef',
      fields: [
        { name: 'parasiteLevelRequired', type: 'number', required: true },
        { name: 'prerequisites', type: 'defList', required: false },
        { name: 'uiIcon', type: 'string', required: false },
        { name: 'pointCost', type: 'number', required: true }
      ],
      lists: [
        {
          name: 'hediffEffects',
          fields: [
            { name: 'hediffDef', type: 'string' }
          ]
        },
        {
          name: 'abilityEffects',
          fields: [
            { name: 'abilities', type: 'defList' }
          ]
        },
        {
          name: 'organEffects',
          fields: [
            { name: 'targetOrgan', type: 'string' },
            { name: 'addedOrganHediff', type: 'string' },
            { name: 'isAddition', type: 'boolean' }
          ]
        }
      ]
    },
    // Add other structures similarly
  ]);

  // Save everything as a proper DefTypes/DefStructures format
  const saveChanges = () => {
    const newDefTypes = {};
    const newEditableDefTypes = {};
    const newDefStructures = {};

    defTypes.forEach(def => {
      newDefTypes[def.key] = def.value;
      if (def.editable) {
        newEditableDefTypes[def.key] = def.value;
      }
    });

    structures.forEach(struct => {
      const required = struct.fields.filter(f => f.required).map(f => f.name);
      const properties = {};

      struct.fields.forEach(field => {
        properties[field.name] = field.type;
      });

      struct.lists.forEach(list => {
        properties[list.name] = {
          type: 'list',
          of: Object.fromEntries(list.fields.map(f => [f.name, f.type]))
        };
      });

      newDefStructures[struct.type] = {
        required,
        properties
      };
    });

    console.log('New DefTypes:', newDefTypes);
    console.log('New EditableDefTypes:', newEditableDefTypes);
    console.log('New DefStructures:', newDefStructures);

    // Here you'd save these changes wherever you need them
  };

  const addField = (structureIndex) => {
    const newStructures = [...structures];
    newStructures[structureIndex].fields.push({
      name: '',
      type: 'string',
      required: false
    });
    setStructures(newStructures);
  };

  const addListField = (structureIndex, listIndex) => {
    const newStructures = [...structures];
    newStructures[structureIndex].lists[listIndex].fields.push({
      name: '',
      type: 'string'
    });
    setStructures(newStructures);
  };

  return (
    <div className="p-4 space-y-8">
      <div>
        <h2 className="text-xl font-bold mb-4">Def Types</h2>
        {defTypes.map((def, index) => (
          <div key={index} className="flex gap-4 mb-2">
            <input
              className="p-2 border rounded"
              value={def.key}
              onChange={(e) => {
                const newDefTypes = [...defTypes];
                newDefTypes[index].key = e.target.value;
                setDefTypes(newDefTypes);
              }}
            />
            <input
              className="p-2 border rounded flex-1"
              value={def.value}
              onChange={(e) => {
                const newDefTypes = [...defTypes];
                newDefTypes[index].value = e.target.value;
                setDefTypes(newDefTypes);
              }}
            />
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={def.editable}
                onChange={(e) => {
                  const newDefTypes = [...defTypes];
                  newDefTypes[index].editable = e.target.checked;
                  setDefTypes(newDefTypes);
                }}
              />
              Editable
            </label>
          </div>
        ))}
      </div>

      <div>
        <h2 className="text-xl font-bold mb-4">Structures</h2>
        {structures.map((struct, structIndex) => (
          <div key={structIndex} className="mb-8 p-4 border rounded">
            <h3 className="font-bold mb-2">{struct.type}</h3>

            <div className="mb-4">
              <h4 className="font-medium mb-2">Fields</h4>
              {struct.fields.map((field, fieldIndex) => (
                <div key={fieldIndex} className="flex gap-2 mb-2">
                  <input
                    className="p-2 border rounded"
                    placeholder="Field name"
                    value={field.name}
                    onChange={(e) => {
                      const newStructures = [...structures];
                      newStructures[structIndex].fields[fieldIndex].name = e.target.value;
                      setStructures(newStructures);
                    }}
                  />
                  <select
                    className="p-2 border rounded"
                    value={field.type}
                    onChange={(e) => {
                      const newStructures = [...structures];
                      newStructures[structIndex].fields[fieldIndex].type = e.target.value;
                      setStructures(newStructures);
                    }}
                  >
                    <option>string</option>
                    <option>number</option>
                    <option>boolean</option>
                    <option>defList</option>
                  </select>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={field.required}
                      onChange={(e) => {
                        const newStructures = [...structures];
                        newStructures[structIndex].fields[fieldIndex].required = e.target.checked;
                        setStructures(newStructures);
                      }}
                    />
                    Required
                  </label>
                </div>
              ))}
              <Button
                onClick={() => addField(structIndex)}
                className="bg-blue-500 text-white mt-2"
              >
                Add Field
              </Button>
            </div>

            <div>
              <h4 className="font-medium mb-2">Lists</h4>
              {struct.lists.map((list, listIndex) => (
                <div key={listIndex} className="mb-4 p-2 border rounded">
                  <input
                    className="p-2 border rounded mb-2 w-full"
                    placeholder="List name"
                    value={list.name}
                    onChange={(e) => {
                      const newStructures = [...structures];
                      newStructures[structIndex].lists[listIndex].name = e.target.value;
                      setStructures(newStructures);
                    }}
                  />
                  {list.fields.map((field, fieldIndex) => (
                    <div key={fieldIndex} className="flex gap-2 mb-2">
                      <input
                        className="p-2 border rounded"
                        placeholder="Field name"
                        value={field.name}
                        onChange={(e) => {
                          const newStructures = [...structures];
                          newStructures[structIndex].lists[listIndex].fields[fieldIndex].name = e.target.value;
                          setStructures(newStructures);
                        }}
                      />
                      <select
                        className="p-2 border rounded"
                        value={field.type}
                        onChange={(e) => {
                          const newStructures = [...structures];
                          newStructures[structIndex].lists[listIndex].fields[fieldIndex].type = e.target.value;
                          setStructures(newStructures);
                        }}
                      >
                        <option>string</option>
                        <option>number</option>
                        <option>boolean</option>
                        <option>defList</option>
                      </select>
                    </div>
                  ))}
                  <Button
                    onClick={() => addListField(structIndex, listIndex)}
                    className="bg-blue-500 text-white mt-2"
                  >
                    Add List Field
                  </Button>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <Button onClick={saveChanges} className="bg-green-500 text-white">
        Save Changes
      </Button>
    </div>
  );
};

export default OptionsEditor;
