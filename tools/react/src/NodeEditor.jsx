import React, { useState, useEffect } from 'react';
import Modal from './components/Modal';
import Button from './components/Button';
import Node from './components/Node';
import PropertiesPanel from './components/PropertiesPanel'
import { saveDef, loadDefs } from './utils/storage';
import { importFromXml, exportToXml, serializeDefToXml, serializeProperty } from './utils/xmlSerializer';
import { saveSessionToFile, loadSessionFromFile, clearSession } from './utils/sessions';
import { Toolbar } from './components/Toolbar';
import { ContextMenu } from './components/ContextMenu';
import NodeDisplay from './components/NodeDisplay';
import CanvasInstructions from './components/CanvasInstructions';
import { useLockBodyScroll } from "@uidotdev/usehooks";
import ConnectionsDisplay from './components/ConnectionsDisplay';

const NodeEditor = ({ nodes, setNodes, paths, setPaths, treeName, setTreeName }) => {
  useLockBodyScroll();
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
    y: 0,
    menuType: 'canvas',
    nodeId: null
  });

  const handleContextMenu = (e) => {
    e.preventDefault();
    setContextMenu({
      isOpen: true,
      x: e.clientX,
      y: e.clientY,
      menuType: 'canvas',
      nodeId: null
    });
  };

  const handleNodeContextMenu = (e, nodeId) => {
    e.preventDefault();
    e.stopPropagation();
    setContextMenu({
      isOpen: true,
      x: e.clientX,
      y: e.clientY,
      menuType: 'node',
      nodeId: nodeId
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

  const handleDeleteConnection = (sourceId, targetId) => {
    setNodes(prevNodes => {
      return prevNodes.map(node => {
        if (node.id === sourceId) {
          return {
            ...node,
            connections: node.connections.filter(id => id !== targetId)
          };
        }
        return node;
      });
    });
  };

  const addNewNode = (id = null, label = "New Node", type = 'Normal', x = 600, y = 100, width = 150, height = 80) => {
    const newID = Node.NewId();
    setNodes([...nodes, new Node(id == null ? newID : id, label, type, x, y, width, height)]);
    setSelectedNode(newID);
  };

  const contextMenuHandlers = {
    handleAddNode: (type) => {
      addNewNode(null, "New Node", type, contextMenu.x - 75, contextMenu.y - 40);
    },
    handleStartConnection: (nodeId) => {
      startConnection(nodeId);
    },
    handleCopyPath: (nodeId) => {
      const node = nodes.find(n => n.id === nodeId);
      if (node?.path) {
        copyToClipboard(node.path, 'path');
      }
    },
    handleDeleteNode: (nodeId) => {
      setNodes(prev => prev.filter(n => n.id !== nodeId));
      setSelectedNode(null);
    },
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
        menuType={contextMenu.menuType}
        onClose={() => setContextMenu(prev => ({ ...prev, isOpen: false }))}
        onSelect={(action, type) => {
          if (type === 'canvas') {
            addNewNode(null, "New Node", action, contextMenu.x - 75, contextMenu.y - 40);
          } else {
            switch (action) {
              case 'connect':
                startConnection(contextMenu.nodeId);
                break;
              case 'copy-path':
                const node = nodes.find(n => n.id === contextMenu.nodeId);
                copyToClipboard(node.path, 'path');
                break;
              case 'delete':
                setNodes(nodes.filter(n => n.id !== contextMenu.nodeId));
                setSelectedNode(null);
                break;
            }
          }
        }}
      />
      {/* Header */}
      <div className="w-80 absolute left-4 top-4 bg-white rounded-lg shadow-lg">
        <div className="px-4 py-3 border-b border-gray-200">
          <div className="flex justify-between items-center space-x-4">
            <h3 className="text-lg font-semibold text-gray-900">Properties</h3>
            <input
              type="text"
              id="treeNameField"
              placeholder="YourTalentTreeDefName"
              className={`flex-1 rounded px-2 py-1 ${treeName ? 'bg-green-500 text-white placeholder-green-200' : 'bg-red-500 text-white placeholder-red-200'
                }`}
              value={treeName}
              onChange={(e) => setTreeName(e.target.value)}
            />
          </div>
        </div>
      </div>
      {/* Properties Panel */}
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

      {/* Main canvas area */}
      <div
        className="w-full h-full"
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
      >
        <CanvasInstructions nodes={nodes} />
        {/* Connection lines */}
        <ConnectionsDisplay
          nodes={nodes}
          connecting={connecting}
          draggingNode={draggingNode}
          onDeleteConnection={handleDeleteConnection}
        />

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
          onContextMenuClick={handleNodeContextMenu}
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