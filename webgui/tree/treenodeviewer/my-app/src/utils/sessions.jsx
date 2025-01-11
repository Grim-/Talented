
// Session management functions
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

export const loadSessionFromFile = async (event, setNodes, setPaths) => {
  const file = event.target.files[0];
  if (file) {
    try {
      const text = await file.text();
      const sessionData = JSON.parse(text);
      setNodes(sessionData.nodes);
      setPaths(sessionData.paths);
    } catch (e) {
      alert('Error loading session file: ' + e.message);
    }
  }
};

// Clear only session data
export const clearSession = (setNodes, setPaths) => {
  if (window.confirm('Clear current session? Reference data will be preserved.')) {
    setNodes([{
      id: 'start',
      label: 'Basic Parasite Metabolism',
      type: 'Start',
      x: 200,
      y: 50,
      connections: [],
      path: '',
      upgrade: 'BasicParasiteMetabolism',
      branchPaths: []
    }]);
    setPaths([]);
  }
};
