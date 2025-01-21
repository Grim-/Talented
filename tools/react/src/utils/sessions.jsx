import Node from "../components/Node";


//TODO :: FIX SESSION SAVE AND LOAD

export const saveSessionToFile = (nodes, paths, treeName = "TalentTreeDef_CHANGEME", treeSize, treeDisplay, treePointStrategy, treeHandler) => {
  const sessionData = {
    nodes,
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


export const loadSessionFromFile = async (file) => {
  if (!file) return null;

  try {
    const text = await file.text();
    const sessionData = JSON.parse(text);
    return {
      nodes: sessionData.nodes,
      paths: sessionData.paths,
      treeName: sessionData.treeName,
      treeSize:sessionData.treeSize,
      treeDisplay:sessionData.treeDisplay,
      treePointStrategy:sessionData.treePointStrategy,
      treeHandler:sessionData.treeHandler
    };
  } catch (e) {
    throw new Error('Error loading session file: ' + e.message);
  }
};

export const clearSession = (setNodes, setPaths, clearAll = false) => {
    const initialSession = {
      nodes: [new Node(null, "NewRootNode", 'Start', 0, 0)],
      paths: []
    };

    if (clearAll)
    {
        setNodes([]);
        setPaths([]);
    }
    else
    {
        setNodes(initialSession.nodes);
        setPaths(initialSession.paths);
    }
};
