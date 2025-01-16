export const saveSessionToFile = (nodes, paths) => {
  const sessionData = {
    nodes,
    paths,
    timestamp: new Date().toISOString()
  };
  const blob = new Blob([JSON.stringify(sessionData, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `node-editor-session-${new Date().toISOString().slice(0,10)}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

// Instead of taking setNodes/setPaths, return the new state
export const loadSessionFromFile = async (file) => {
  if (!file) return null;

  try {
    const text = await file.text();
    const sessionData = JSON.parse(text);
    return {
      nodes: sessionData.nodes,
      paths: sessionData.paths
    };
  } catch (e) {
    throw new Error('Error loading session file: ' + e.message);
  }
};

// Return default state instead of setting it directly
export const clearSession = (setNodes, setPaths) => {
  const initialSession = {
    nodes: [{
      id: 'start',
      label: 'RootNode',
      type: 'Start',
      x: 200,
      y: 50,
      connections: [],
      path: '',
      upgrade: ['BasicParasiteMetabolism'],
      branchPaths: []
    }],
    paths: []
  };

  setNodes(initialSession.nodes);
  setPaths(initialSession.paths);
};
