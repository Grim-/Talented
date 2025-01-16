export const DefTypes = {
  UPGRADE: 'Talented.TalentDef',
  UPGRADE_TREE: 'Talented.TalentTreeDef',
  UPGRADE_TREE_NODE: 'Talented.TalentTreeNodeDef',
  UPGRADE_PATH: 'Talented.TalentPathDef'
};
// Types available for editing in the DefEditor
export const EditableDefTypes = {
  UPGRADE: 'TalentDef',
  UPGRADE_TREE: 'TalentTreeDef',
  UPGRADE_PATH: 'TalentPathDef'
};

export const DefStructures = {
  [DefTypes.UPGRADE]: {
    required: ['defName', 'parasiteLevelRequired', 'pointCost'],
    properties: {
      parasiteLevelRequired: 'number',
      prerequisites: 'defList',
      uiIconPath: 'string',
      pointCost: 'number',
      statEffects: 'defList',
      hediffEffects: 'defList',
      abilityEffects: 'defList',
      organEffects: 'defList',
      DescriptionString: 'string'
    }
  },
  [DefTypes.UPGRADE_TREE]: {
    required: ['defName', 'dimensions'],
    properties: {
      treeName: 'string',
      dimensions: {
        type: 'vector2',
        x: 'number',
        y: 'number'
      },
      nodes: 'defList',
      handlerClass: 'string',
      skin: 'string',
      availablePaths: 'defList',
      displayStrategy: 'string',
      talentPointFormula: 'string'
    }
  },
  [DefTypes.UPGRADE_TREE_NODE]: {
    required: ['defName', 'position', 'type'],
    properties: {
      upgrades: 'defList',
      position: {
        type: 'vector2',
        x: 'number',
        y: 'number'
      },
      connections: 'defList',
      type: {
        type: 'enum',
        values: ['Normal', 'Keystone', 'Start', 'Branch']
      },
      path: 'string',
      branchPaths: {
        type: 'list',
        of: {
          path: 'string',
          nodes: 'defList'
        }
      }
    }
  },
  [DefTypes.UPGRADE_PATH]: {
    required: ['defName'],
    properties: {
      exclusiveWith: 'defList',
      pathDescription: 'string',
      pathUIIcon: 'string',
      pathColor: {
        type: 'color',
        r: 'number',
        g: 'number',
        b: 'number',
        a: 'number'
      }
    }
  }
};
const DefTypeButtons = ({ onSelectType }) => {
  const defTypes = {
    [DefTypes.UPGRADE_TREE_NODE]:
    {
      label: 'Node Definition',
      description: 'Basic node in the upgrade tree'
    },
    [DefTypes.UPGRADE_TREE]:
    {
      label: 'Tree Definition',
      description: 'Defines the structure of an upgrade tree'
    },
    [DefTypes.UPGRADE]: {
      label: 'Upgrade Definition',
      description: 'Defines an individual upgrade'
    },
      [DefTypes.UPGRADE_PATH]: {
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
            <div className="w-6 h-6 text-blue-500" />
          </div>
          <h3 className="text-sm font-medium text-gray-900">{info.label}</h3>
          <p className="mt-1 text-xs text-gray-500 text-center">{info.description}</p>
        </button>
      ))}
    </div>
  );
};
