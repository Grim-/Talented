import React, { useState } from 'react';
import NodeEditor from './NodeEditor';
import DefEditor from './components/DefEditor';
import Button from './components/Button';
import { Node } from './components/Node';


function App() {
  const [activeTab, setActiveTab] = useState('nodes');
  const [nodes, setNodes] = useState([new Node(null, "ROOT", 'Start', 400, 100)]);
  const [paths, setPaths] = useState([]);
  const [treeName, setTreeName] = useState('TREE_CHANGEME');

  // Lift def editor state up
  const [selectedType, setSelectedType] = useState(null);
  const [currentDef, setCurrentDef] = useState(null);

  const handleTreeNameChange = (e) => {
    setTreeName(e.target.value);
  };

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
            className={`${activeTab === 'defs' ? 'bg-red-500 text-white' : 'bg-gray-200'}`}
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
            treeName={treeName}
            setTreeName={setTreeName}
          />
        ) : (
          <DefEditor
            selectedType={selectedType}
            setSelectedType={setSelectedType}
            currentDef={currentDef}
            setCurrentDef={setCurrentDef}
            treeName={treeName}
            setTreeName={setTreeName}
          />
        )}
      </div>
    </div>
  );
}

export default App;
