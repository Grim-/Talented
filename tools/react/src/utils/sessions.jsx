import Node from "../components/Node";

export const loadSessionFromFile = (sessionData) => {
  // Create new Node instances to ensure proper defaults
  const nodes = sessionData.nodes.map(nodeData => {
    const node = new Node(
      nodeData.id,
      nodeData.label,
      nodeData.type,
      nodeData.x,
      nodeData.y
    );
    // Copy over additional properties
    return {
      ...node,
      connections: nodeData.connections || [],
      path: nodeData.path || '',
      upgrade: nodeData.upgrade || '',
      branchPaths: nodeData.branchPaths || [],
      upgrades: nodeData.upgrades || [],
      descriptionString: nodeData.descriptionString || '',
      levelRequired: nodeData.levelRequired || 0,
      canDrag: nodeData.canDrag !== undefined ? nodeData.canDrag : true
    };
  });

  return {
    nodes,
    paths: sessionData.paths,
    treeName: sessionData.treeName,
    treeSize: sessionData.treeSize,
    treeDisplay: sessionData.treeDisplay,
    treePointStrategy: sessionData.treePointStrategy,
    treeHandler: sessionData.treeHandler
  };
};

export const saveSessionToFile = (nodes, paths, treeName = "TalentTreeDef_CHANGEME", treeSize, treeDisplay, treePointStrategy, treeHandler) => {
  // Remove width and height from nodes before saving
  const nodesToSave = nodes.map(({ width, height, ...nodeWithoutSize }) => nodeWithoutSize);

  const sessionData = {
    nodes: nodesToSave,
    paths,
    treeName,
    treeSize,
    treeDisplay,
    treePointStrategy,
    treeHandler,
    timestamp: new Date().toISOString()
  };

  const blob = new Blob([JSON.stringify(sessionData, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${treeName}_${new Date().toISOString().slice(0,10)}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

export const clearSession = (setNodes, setPaths, clearAll = false) => {
  const initialNode = new Node(null, "NewRootNode", 'Start', 0, 0);
  
  const initialSession = {
    nodes: [initialNode],
    paths: []
  };

  if (clearAll) {
    setNodes([]);
    setPaths([]);
  } else {
    setNodes(initialSession.nodes);
    setPaths(initialSession.paths);
  }
};


export const ensureNodeDimensions = (node) => {
  if (node.width && node.height) return node;
  const defaultNode = new Node();
  return {
    ...node,
    width: defaultNode.width,
    height: defaultNode.height
  };
};