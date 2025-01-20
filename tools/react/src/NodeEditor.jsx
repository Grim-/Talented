import React, { useState, useEffect } from 'react';
import Modal from './components/Modal';
import Button from './components/Button';
import Node from './components/Node';
import PropertiesPanel from './components/PropertiesPanel'
import { saveDef, loadDefs } from './storage';
import { importFromXml, exportToXml, serializeDefToXml, serializeProperty } from './utils/xmlSerializer';
import {saveSessionToFile, loadSessionFromFile,  clearSession } from './utils/sessions';
import { Toolbar} from './components/Toolbar';
import { ContextMenu }  from './components/ContextMenu';
import NodeDisplay from './components/NodeDisplay';

const NodeEditor = ({ nodes, setNodes, paths, setPaths, treeName, setTreeName }) => {

  //state
  const [referenceDefs, setReferenceDefs] = useState(() => {

    const savedDefs = localStorage.getItem('nodeEditorReferenceDefs');
    return savedDefs ? JSON.parse(savedDefs) : [];
  });
  const [draggingNode, setDraggingNode] = useState(null);
  const [draggingOffset, setDraggingOffset] = useState({ x: 0, y: 0 });
  const [connecting, setConnecting] = useState(null);
  const [showExport, setShowExport] = useState(false);
  const [exportedXml, setExportedXml] = useState('');
  const [selectedNode, setSelectedNode] = useState(null);
  const [showImport, setShowImport] = useState(false);
  const [contextMenu, setContextMenu] = useState({
    isOpen: false,
    x: 0,
    y: 0
  });

  const handleContextMenu = (e) => {
    e.preventDefault();
    setContextMenu({
      isOpen: true,
      x: e.clientX,
      y: e.clientY
    });
  };

  useEffect(() => {
    if (contextMenu.isOpen) {
      const handleClick = () => {
        setContextMenu(prev => ({ ...prev, isOpen: false }));
      };
      document.addEventListener('click', handleClick);
      return () => document.removeEventListener('click', handleClick);
    }
  }, [contextMenu.isOpen]);


  useEffect(() => {
    localStorage.setItem('nodeEditorReferenceDefs', JSON.stringify(referenceDefs));
  }, [referenceDefs]);

  const clearReferenceDefs = () => {
    if (window.confirm('Clear all reference data? This will not affect your current session.')) {
      setReferenceDefs([]);
    }
  };

  const copyToClipboard = async (text, property) => {
    try {
      await navigator.clipboard.writeText(text);
      console.log(`Copied ${property}: ${text}`);
    } catch (err) {
      console.error('Failed to copy text:', err);
    }
  };

  const handleFileSelect = async (event) => {
    try {
      const fileContents = await Promise.all(
        Array.from(event.target.files).map(file => file.text())
      );
      const { nodes: newNodes, paths: newPaths } = importFromXml(fileContents);
      clearSession(setNodes, setPaths, true);
      setNodes([...nodes, ...newNodes]);
      setPaths([...paths, ...newPaths]);
      setShowImport(false);
    } catch (e) {
      alert(e.message);
    }
  };


  const handleMouseDown = (e, nodeId) => {
    if (e.target.tagName.toLowerCase() === 'input') return;

    const node = nodes.find(n => n.id === nodeId);
    setDraggingNode(nodeId);
    setDraggingOffset({
      x: e.clientX - node.x,
      y: e.clientY - node.y
    });
  };

  const handleMouseMove = (e) => {
    if (draggingNode) {
      setNodes(nodes.map(node => {
        if (node.id === draggingNode) {
          return {
            ...node,
            x: e.clientX - draggingOffset.x,
            y: e.clientY - draggingOffset.y
          };
        }
        return node;
      }));
    }
  };

  const handleMouseUp = () => {
    setDraggingNode(null);
  };

  const handleNodeSelect = (nodeId, e) => {
    if (e.target.tagName.toLowerCase() !== 'input') {
      if (connecting) {
        completeConnection(nodeId);
      } else {
        setSelectedNode(nodeId);
      }
    }
  };

  // Node Property Updates
  const updateNodeProperty = (nodeId, property, value) => {
    setNodes(nodes.map(node =>
      node.id === nodeId ? { ...node, [property]: value } : node
    ));
  };

  // Connection Management
  const startConnection = (nodeId) => {
    setConnecting(nodeId);
  };

  const completeConnection = (targetId) => {
    if (connecting && connecting !== targetId) {
      setNodes(nodes.map(node => {
        if (node.id === connecting) {
          return {
            ...node,
            connections: [...node.connections, targetId]
          };
        }
        return node;
      }));
    }
    setConnecting(null);
  };

  // Branch Path Management
  const addBranchPath = (nodeId) => {
    setNodes(nodes.map(node => {
      if (node.id === nodeId) {
        return {
          ...node,
          branchPaths: [...node.branchPaths, { path: '', nodes: [] }]
        };
      }
      return node;
    }));
  };

  const updateBranchPath = (nodeId, index, property, value) => {
    setNodes(nodes.map(node => {
      if (node.id === nodeId) {
        const newBranchPaths = [...node.branchPaths];
        newBranchPaths[index] = { ...newBranchPaths[index], [property]: value };
        return { ...node, branchPaths: newBranchPaths };
      }
      return node;
    }));
  };


  const addNewNode = (id = null, label = "New Node", type = 'Normal', x = 600, y = 100) =>
  {
    const newID = Node.NewId();
    setNodes([...nodes, new Node(id == null ? newID : id, label, type, x, y)]);
    setSelectedNode(newID);
  };

  return (
    <div 
      className="w-full h-screen bg-gray-100 relative p-4"
      onContextMenu={handleContextMenu}
    >
      {/* Top toolbar */}
      <Toolbar 
        treeName={treeName || ''}
        onAddNode={addNewNode}
        onSaveSession={(e) => saveSessionToFile(nodes, paths)}
        onLoadSession={async (data) => {
          setNodes(data.nodes);
          setPaths(data.paths);
        }}
        onImportXml={handleFileSelect}
        onExportXml={() => exportToXml(nodes, paths, treeName)}
        onClearSession={() => clearSession(setNodes, setPaths)}
        setTreeName={setTreeName}
      />
      <ContextMenu
        isOpen={contextMenu.isOpen}
        x={contextMenu.x}
        y={contextMenu.y}
        onClose={() => setContextMenu({ ...contextMenu, isOpen: false })}
        onSelect={(nodeType) => {
          addNewNode(null, "New Node", nodeType, contextMenu.x - 50, contextMenu.y - 50);
      }}
    />
      <div className="w-65 absolute left-4 top-4 bg-white rounded-lg shadow-lg p-4">
      <label>Talent Tree Name </label>
      <input type="field"
        id="treeNameField"
        placeholder = "treeName"
        className = "bg-green-500 text-white rounded px-4 py-2"
        value={treeName || ''}
        onChange={(e) => setTreeName(e.target.value)}
        />
      </div>
      {/* Properties Panel */}
      {selectedNode && (
        <PropertiesPanel
          selectedNode={selectedNode}
          node={nodes.find(n => n.id === selectedNode)}
          onUpdateProperty={(property, value) => updateNodeProperty(selectedNode, property, value)}
          onAddBranchPath={() => addBranchPath(selectedNode)}
          onUpdateBranchPath={(index, property, value) => updateBranchPath(selectedNode, index, property, value)}
        />
      )}

      {/* Main canvas area */}
      <div
        className="w-full h-full"
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
      >
        {/* Connection lines */}
        <svg className="w-full h-full absolute top-0 left-0 pointer-events-none">
          {nodes.map(node =>
            node.connections.map(targetId => {
              const target = nodes.find(n => n.id === targetId);
              if (!target) return null;
              return (
                <line
                  key={`${node.id}-${targetId}`}
                  x1={node.x + 75}
                  y1={node.y + 25}
                  x2={target.x + 75}
                  y2={target.y + 25}
                  stroke="black"
                  strokeWidth="2"
                />
              );
            })
          )}
          {connecting && (
            <line
              x1={nodes.find(n => n.id === connecting)?.x + 75 || 0}
              y1={nodes.find(n => n.id === connecting)?.y + 25 || 0}
              x2={draggingNode ? nodes.find(n => n.id === draggingNode)?.x + 75 : 0}
              y2={draggingNode ? nodes.find(n => n.id === draggingNode)?.y + 25 : 0}
              stroke="blue"
              strokeWidth="2"
              strokeDasharray="5,5"
            />
          )}
        </svg>

        {/* Nodes */}
        <NodeDisplay 
          nodes={nodes}
          selectedNode={selectedNode}
          connecting={connecting}
          handleMouseDown={handleMouseDown}
          handleNodeSelect={handleNodeSelect}
          startConnection={startConnection}
          setNodes={setNodes}
          copyToClipboard={copyToClipboard}
        />
      </div>

      {/* Export Modal */}
      <Modal isOpen={showExport} onClose={() => setShowExport(false)}>
        <pre className="bg-gray-100 p-4 rounded-lg overflow-auto max-h-96">
          {exportedXml}
        </pre>
      </Modal>

      {/* Import Modal */}
      <Modal isOpen={showImport} onClose={() => setShowImport(false)}>
        <div className="p-4">
          <h2 className="text-xl font-bold mb-4">Import XML Files</h2>
          <input
            type="file"
            multiple
            accept=".xml"
            onChange={handleFileSelect}
            className="block w-full text-sm text-gray-500
              file:mr-4 file:py-2 file:px-4
              file:rounded-md file:border-0
              file:text-sm file:font-semibold
              file:bg-blue-50 file:text-blue-700
              hover:file:bg-blue-100"
          />
          <div className="mt-4">
            <Button onClick={() => setShowImport(false)} className="bg-gray-500 text-white">
              Cancel
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );


};

export default NodeEditor;