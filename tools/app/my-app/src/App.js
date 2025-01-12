import React, { useState } from 'react';
import NodeEditor from './NodeEditor';
import DefEditor from './components/DefEditor';
import Button from './components/Button';

function App() {
  const [activeTab, setActiveTab] = useState('nodes');

  // Lift node editor state up
  const [nodes, setNodes] = useState([{
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

  const [paths, setPaths] = useState([]);

  // Lift def editor state up
  const [selectedType, setSelectedType] = useState(null);
  const [currentDef, setCurrentDef] = useState(null);

  return (
    <div className="App">
      <div className="bg-white border-b p-4">
        <div className="flex gap-2">
          <Button
            onClick={() => setActiveTab('nodes')}
            className={`${activeTab === 'nodes' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
          >
            Node Editor
          </Button>
          <Button
            onClick={() => setActiveTab('defs')}
            className={`${activeTab === 'defs' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
          >
            Def Editor
          </Button>
        </div>
      </div>
      <div className="p-4">
        {activeTab === 'nodes' ? (
          <NodeEditor
            nodes={nodes}
            setNodes={setNodes}
            paths={paths}
            setPaths={setPaths}
          />
        ) : (
          <DefEditor
            selectedType={selectedType}
            setSelectedType={setSelectedType}
            currentDef={currentDef}
            setCurrentDef={setCurrentDef}
          />
        )}
      </div>
    </div>
  );
}

export default App;
