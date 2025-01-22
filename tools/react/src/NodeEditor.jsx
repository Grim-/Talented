import React, { useState, useEffect } from 'react';
import Modal from './components/Modal';
import Button from './components/Button';
import Node from './components/Node';
import NodePropertiesPanel from './components/NodePropertiesPanel'
import { saveDef, loadDefs } from './utils/StorageUtils';
import { importFromXml, exportToXml, serializeDefToXml, serializeProperty } from './utils/xmlSerializer';
import { saveSessionToFile, loadSessionFromFile, clearSession } from './utils/sessions';
import { Toolbar } from './components/Toolbar';
import { ContextMenu } from './components/ContextMenu';
import NodeDisplay from './components/NodeDisplay';
import CanvasInstructions from './components/CanvasInstructions';
import { useLockBodyScroll } from "@uidotdev/usehooks";
import ConnectionsDisplay from './components/ConnectionsDisplay';
import TreePropertiesPanel from './components/TreePropertiesPanel';
import PathPanel from './components/PathPanel';
import TreeSizePreview from './components/TreeSizePreview';
import Minimap from './components/Minimap';
import CanvasSettings from './components/CanvasSettings';
import GridOverlay from './components/GridOverlay';


const NodeEditor = ({ 
  nodes, setNodes, 
  paths, setPaths, 
  treeName, setTreeName, 
  treeSize, setTreeSize, 
  treeDisplayStrategy, setTreeDisplay, 
  pointStrategy, setTreePointStrategy,
  treeHandler, setTreeHandler
 }) => {
  //useLockBodyScroll();
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

  const [canvasSettings, setCanvasSettings] = useState({
    lockToGrid: false,
    hierarchyMove: false
  });

  const handleSettingChange = (setting, value) => {
    setCanvasSettings(prev => ({
      ...prev,
      [setting]: value
    }));
  };
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
  const handleCanvasClick = (e) => {
    if (e.target.id === 'mainCanvas') {
      setSelectedNode(null);
      setConnecting(null);
    }
  };

  const handleMouseDown = (e, nodeId) => {
    if (e.target.tagName.toLowerCase() === 'input') return;
    
    const node = nodes.find(n => n.id === nodeId);
    if (!node) return;
    e.preventDefault();
    setDraggingNode(nodeId);
    setDraggingOffset({
      x: e.clientX - node.x,
      y: e.clientY - node.y
    });
  };

  const handleMouseMove = (e) => {
    if (!draggingNode) return;
    
    e.preventDefault();
    
    // Find the node being dragged
    const draggedNode = nodes.find(n => n.id === draggingNode);
    if (!draggedNode) return;
  
    // Calculate new position
    let newX = e.clientX - draggingOffset.x;
    let newY = e.clientY - draggingOffset.y;
  
    // Ensure we have valid numbers
    if (isNaN(newX) || isNaN(newY)) {
      newX = draggedNode.x;
      newY = draggedNode.y;
    }
  
    // Apply grid snapping if enabled
    if (canvasSettings.lockToGrid) {
      const gridSize = canvasSettings.gridSize || 20;
      newX = Math.round(newX / gridSize) * gridSize;
      newY = Math.round(newY / gridSize) * gridSize;
    }
  
    // If not doing hierarchy movement, just update the dragged node
    if (!canvasSettings.hierarchyMove) {
      setNodes(nodes.map(node => 
        node.id === draggingNode 
          ? { ...node, x: newX, y: newY }
          : node
      ));
      return;
    }
  
    // For hierarchy movement, we need to track all affected nodes
    const processedNodes = new Set();
    const updates = new Map();
  
    // Calculate initial delta
    const deltaX = newX - draggedNode.x;
    const deltaY = newY - draggedNode.y;
  
    // Recursive function to collect all nodes that need updating
    const collectConnectedNodes = (nodeId, dx, dy) => {
      if (processedNodes.has(nodeId)) return;
      processedNodes.add(nodeId);
  
      const node = nodes.find(n => n.id === nodeId);
      if (!node) return;
  
      const newPos = {
        x: node.x + dx,
        y: node.y + dy
      };
  
      // Ensure positions are valid numbers
      if (!isNaN(newPos.x) && !isNaN(newPos.y)) {
        updates.set(nodeId, newPos);
      }
  
      // Process all connected nodes
      node.connections.forEach(connectedId => {
        if (!processedNodes.has(connectedId)) {
          collectConnectedNodes(connectedId, dx, dy);
        }
      });
    };
  
    // Start with the dragged node
    updates.set(draggingNode, { x: newX, y: newY });
    processedNodes.add(draggingNode);
  
    // Collect all connected nodes that need to move
    draggedNode.connections.forEach(connectedId => {
      collectConnectedNodes(connectedId, deltaX, deltaY);
    });
  
    // Update all nodes in a single operation
    setNodes(nodes.map(node => {
      const newPos = updates.get(node.id);
      if (newPos) {
        return {
          ...node,
          x: newPos.x,
          y: newPos.y
        };
      }
      return node;
    }));
  };
  const handleMouseUp = () => {
    if (draggingNode) {
      setDraggingNode(null);
    }
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

  const addNewNode = (id = null, label = "New Node", type = 'Normal', x = 0, y = 0, width = 130, height = 80) => {
    const newID = Node.NewId();
    setNodes([...nodes, new Node(id == null ? newID : id, label, type, x, y, width, height)]);
    setSelectedNode(newID);
  };
   const onNodeStateChange = () => {
      this.forceUpdate();
  }
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
      id="mainContent"
      className="w-full h-screen bg-gray-600 border-b border-gray-700 relative p-4"
      onContextMenu={handleContextMenu}
    >
      {/* Top toolbar */}
      <Toolbar
        treeName={treeName || ''}
        onAddNode={addNewNode}
        onSaveSession={(e) => saveSessionToFile(nodes, paths, treeName, treeSize, treeDisplayStrategy, pointStrategy, treeHandler)}
        onLoadSession={(data) => {
          clearSession(setNodes, setPaths, true);
          const session = loadSessionFromFile(data);
          setNodes(session.nodes);
          setPaths(session.paths);
          setTreeName(session.treeName);
          setTreeSize(session.treeSize);
          setTreeDisplay(session.treeDisplay);
          setTreePointStrategy(session.treePointStrategy);
          setTreeHandler(session.treeHandler);
        }}
        onImportXml={handleFileSelect}
        onExportXml={() => exportToXml(nodes, paths, treeName, treeSize, treeDisplayStrategy, pointStrategy, treeHandler)}
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
      <TreePropertiesPanel
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
      {/* Properties Panel */}
      {selectedNode && (
        <NodePropertiesPanel
          selectedNode={selectedNode}
          node={nodes.find(n => n.id === selectedNode)}
          onUpdateProperty={(property, value) => updateNodeProperty(selectedNode, property, value)}
          onAddBranchPath={() => addBranchPath(selectedNode)}
          onUpdateBranchPath={(index, property, value) => updateBranchPath(selectedNode, index, property, value)}
          paths={paths}
          setPaths={setPaths}
        />
      )}

      {paths !== undefined && (
        <PathPanel 
          paths={paths}
          setPaths={setPaths}
          nodes={nodes}
      />
      )}
        <TreeSizePreview 
          width={treeSize?.width} 
          height={treeSize?.height}
          nodes={nodes}
        />
      {/* Main canvas area */}
      <div
        className="w-full h-full"
        id="mainCanvas"
        onClick={handleCanvasClick}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
      >
        <CanvasInstructions nodes={nodes} />
        <CanvasSettings 
          onSettingChange={handleSettingChange}
          initialSettings={canvasSettings}
        />
        <ConnectionsDisplay
          nodes={nodes}
          connecting={connecting}
          draggingNode={draggingNode}
          onDeleteConnection={handleDeleteConnection}
        />
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
          gameWidth={treeSize.x}
          gameHeight={treeSize.y}
        />
                <GridOverlay 
          enabled={canvasSettings.lockToGrid}
          gridSize={canvasSettings.gridSize || 20}
        />
      </div>

      {/* Export Modal */}
      <Modal isOpen={showExport} onClose={() => setShowExport(false)}>
        <pre className="bg-gray-900 p-4 rounded-lg overflow-auto max-h-96">
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