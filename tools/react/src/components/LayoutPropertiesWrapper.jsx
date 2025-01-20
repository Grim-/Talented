import React from 'react';
import TreePropertiesPanel from './TreePropertiesPanel';
import PropertiesPanel from './PropertiesPanel';

const PropertiesPanelsWrapper = ({
  // Tree properties props
  treeName,
  setTreeName,
  treeSize,
  setTreeSize,
  treeDisplayStrategy,
  setTreeDisplay,
  pointStrategy,
  setTreePointStrategy,
  // Node properties props
  selectedNode,
  nodes,
  updateNodeProperty,
  addBranchPath,
  updateBranchPath
}) => {
  return (
<div className="flex flex-col gap-8 p-4 fixed left-0 top-0 max-h-screen overflow-y-auto">
      <TreePropertiesPanel
        treeName={treeName}
        setTreeName={setTreeName}
        treeSize={treeSize}
        setTreeSize={setTreeSize}
        treeDisplayStrategy={treeDisplayStrategy}
        setTreeDisplay={setTreeDisplay}
        pointStrategy={pointStrategy}
        setTreePointStrategy={setTreePointStrategy}
      />
      
      {selectedNode && (
        <PropertiesPanel
          selectedNode={selectedNode}
          node={nodes.find(n => n.id === selectedNode)}
          onUpdateProperty={(property, value) => updateNodeProperty(selectedNode, property, value)}
          onAddBranchPath={() => addBranchPath(selectedNode)}
          onUpdateBranchPath={(index, property, value) => updateBranchPath(selectedNode, index, property, value)}
          treeName={treeName}
          setTreeName={setTreeName}
        />
      )}
    </div>
  );
};

export default PropertiesPanelsWrapper;