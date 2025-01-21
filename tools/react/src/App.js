import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import NodeEditor from './NodeEditor';
import DefManager from './components/DefManager';
import Button from './components/Button';
import { Node } from './components/Node';
import ExampleLoader from './components/ExampleLoader';

function App() {
  const [activeTab, setActiveTab] = useState('nodes');
  const [nodes, setNodes] = useState([new Node(Node.NewId(), "Root", 'Start', 0, 0, 150, 80)]);
  const [paths, setPaths] = useState([]);
  const [treeName, setTreeName] = useState('');
  const [treeSize, setTreeSize] = useState({width: 600, height: 400});
  const [treeDisplayStrategy, setTreeDisplay] = useState('FixedPosition');
  const [pointStrategy, setTreePointStrategy] = useState('PerLevel');
  const [treeHandler, setTreeHandler] = useState('ActiveTreeHandler');

  return (
    <Router basename="/">
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
            <a 
              href="https://github.com/Grim-/Talented/wiki"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block rounded-md px-4 py-2 font-medium bg-gray-200 text-black hover:bg-green-300"
            >
              The Wiki
            </a>
          </div>
        </div>
        <div className="p-4">
          <Routes>
            <Route path="/:exampleName" element={
              <ExampleLoader
                setNodes={setNodes}
                setPaths={setPaths}
                setTreeName={setTreeName}
                setTreeSize={setTreeSize}
                setTreeDisplay={setTreeDisplay}
                setTreePointStrategy={setTreePointStrategy}
              />
            } />
          </Routes>
          {activeTab === 'nodes' ? (
            <NodeEditor
              nodes={nodes}
              setNodes={setNodes}
              paths={paths}
              setPaths={setPaths}
              treeName={treeName}
              setTreeName={setTreeName}
              treeSize={treeSize}
              setTreeSize={setTreeSize}
              treeDisplayStrategy={treeDisplayStrategy}
              setTreeDisplay={setTreeDisplay}
              pointStrategy={pointStrategy}
              setTreePointStrategy={setTreePointStrategy}
              treeHandler={treeHandler}
              setTreeHandler={setTreeHandler}
            />
          ) : (
            <DefManager /> 
          )}
        </div>
      </div>
    </Router>
  );
}

export default App;