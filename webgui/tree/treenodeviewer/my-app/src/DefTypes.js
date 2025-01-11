export const DefTypes = {
  UPGRADE: 'Talented.UpgradeDef',
  UPGRADE_TREE: 'Talented.UpgradeTreeDef',
  UPGRADE_TREE_NODE: 'Talented.UpgradeTreeNodeDef',
  UPGRADE_PATH: 'Talented.UpgradePathDef'
};
// Types available for editing in the DefEditor
export const EditableDefTypes = {
  UPGRADE: 'Talented.UpgradeDef',
  UPGRADE_TREE: 'Talented.UpgradeTreeDef',
  UPGRADE_PATH: 'Talented.UpgradePathDef'
};
export const DefStructures = {
  'Talented.UpgradeDef': {
    required: ['defName', 'parasiteLevelRequired', 'pointCost'],
    properties: {
      parasiteLevelRequired: 'number',
      prerequisites: 'defList',
      uiIcon: 'string',
      pointCost: 'number',
      hediffEffects: 'defList',
      abilityEffects: 'defList',
      organEffects: 'defList'
    }
  },
  'Talented.UpgradeTreeDef': {
    required: ['defName', 'dimensions'],
    properties: {
      dimensions: {
        type: 'vector2',
        x: 'number',
        y: 'number'
      },
      handlerClass: 'string',
      skin: 'string',
      availablePaths: 'defList',
      displayStrategy: 'string'
    }
  },
  'Talented.UpgradeTreeNodeDef': {
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
  'Talented.UpgradePathDef': {
    required: ['defName'],
    properties: {
      exclusiveWith: 'defList',
      pathDescription: 'string',
      pathUIIcon: 'string'
    }
  }
};
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
            <div className="w-6 h-6 text-blue-500" />
          </div>
          <h3 className="text-sm font-medium text-gray-900">{info.label}</h3>
          <p className="mt-1 text-xs text-gray-500 text-center">{info.description}</p>
        </button>
      ))}
    </div>
  );
};
