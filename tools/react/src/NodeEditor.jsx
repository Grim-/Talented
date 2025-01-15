import React, { useState, useEffect } from 'react';
import Modal from './components/Modal';
import Button from './components/Button';
import Node from './components/Node';
import PropertiesPanel from './components/PropertiesPanel'
import { saveDef, loadDefs } from './storage';
import { importFromXml, exportToXml, serializeDefToXml, serializeProperty } from './utils/xmlSerializer';
import {saveSessionToFile, loadSessionFromFile,  clearSession } from './utils/sessions';



const NodeEditor = ({ nodes, setNodes, paths, setPaths }) => {
  // Reference data state
  const [referenceDefs, setReferenceDefs] = useState(() => {

    const savedDefs = localStorage.getItem('nodeEditorReferenceDefs');
    return savedDefs ? JSON.parse(savedDefs) : [];
  });

  // Core state

  // UI state
  const [draggingNode, setDraggingNode] = useState(null);
  const [draggingOffset, setDraggingOffset] = useState({ x: 0, y: 0 });
  const [connecting, setConnecting] = useState(null);
  const [showExport, setShowExport] = useState(false);
  const [exportedXml, setExportedXml] = useState('');
  const [selectedNode, setSelectedNode] = useState(null);
  const [showImport, setShowImport] = useState(false);

  // Save reference data whenever it changes
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

  // XML Import/Export Functions
  const handleFileSelect = async (event) => {
    try {
      // Just use your existing importFromXml function
      const fileContents = await Promise.all(
        Array.from(event.target.files).map(file => file.text())
      );
      const { nodes: newNodes, paths: newPaths } = importFromXml(fileContents);

      setNodes([...nodes, ...newNodes]);
      setPaths([...paths, ...newPaths]);
      setShowImport(false);
    } catch (e) {
      alert(e.message);
    }
  };



  // Node event handlers
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

  return (
    <div className="w-full h-screen bg-gray-100 relative p-4">
      {/* Top toolbar */}
      <div className="absolute top-4 right-4 space-x-2">
        <Button
          onClick={() => {
            const newId = `node_${Date.now()}`;
            setNodes([...nodes, {
              id: newId,
              label: 'New Node',
              type: 'Normal',
              x: 400,
              y: 200,
              connections: [],
              path: '',
              upgrade: '',
              branchPaths: []
            }]);
            setSelectedNode(newId);
          }}
          className="bg-blue-500 text-white"
        >
          Add Node
        </Button>
        <Button onClick={() => document.getElementById('sessionLoad').click()} className="bg-green-500 text-white">
          Load Session
        </Button>
        <input
          id="sessionLoad"
          type="file"
          accept=".json"
          onChange={async (e) => {
            const data = await loadSessionFromFile(e.target.files[0]);
            setNodes(data.nodes);
            setPaths(data.paths);
          }}
          className="hidden"
        />
        <Button onClick={(e) => saveSessionToFile(nodes, paths)} className="bg-blue-500 text-white">
          Save Session
        </Button>
        <Button onClick={(e) => setShowImport(true)} className="bg-green-500 text-white">Import XML</Button>
        <Button onClick={exportToXml} className="bg-purple-500 text-white">Export XML</Button>
        <Button onClick={(e) => clearSession(setNodes, setPaths)} className="bg-red-500 text-white">Clear Session</Button>
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
        {nodes.map(node => (
          <div
            key={node.id}
            className={`absolute p-4 rounded-lg shadow-lg w-40 cursor-move
              ${node.type === 'Start' ? 'bg-green-100' : 'bg-white'}
              ${node.type === 'Branch' ? 'bg-yellow-100' : ''}
              ${selectedNode === node.id ? 'ring-2 ring-blue-500' : ''}
              ${connecting === node.id ? 'ring-2 ring-blue-300' : ''}`}
            style={{
              left: node.x,
              top: node.y
            }}
            onMouseDown={(e) => handleMouseDown(e, node.id)}
            onClick={(e) => handleNodeSelect(node.id, e)}
          >
            <div
              className="text-sm font-medium mb-2 cursor-pointer hover:bg-gray-100 px-1 rounded"
              onClick={(e) => {
                e.stopPropagation();
                copyToClipboard(node.label, 'label');
              }}
              title="Click to copy label"
            >
              {node.label}
            </div>
            <div
              className="text-xs text-gray-500 mb-2 cursor-pointer hover:bg-gray-100 px-1 rounded"
              onClick={(e) => {
                e.stopPropagation();
                copyToClipboard(node.path, 'path');
              }}
              title="Click to copy path"
            >
              {node.path && `Path: ${node.path}`}
            </div>
            <div
              className="text-xs text-gray-500 mb-2 cursor-pointer hover:bg-gray-100 px-1 rounded"
              onClick={(e) => {
                e.stopPropagation();
                copyToClipboard(node.upgrade, 'upgrade');
              }}
              title="Click to copy upgrade"
            >
              {node.upgrade && `Upgrade: ${node.upgrade}`}
            </div>
            <div className="flex justify-between items-center">
              <Button
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  startConnection(node.id);
                }}
                className="bg-blue-500 text-white"
              >
                →
              </Button>
              <Button
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  setNodes(nodes.filter(n => n.id !== node.id));
                }}
                className="bg-red-500 text-white"
              >
                ×
              </Button>
            </div>
          </div>
        ))}
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

  // Close the NodeEditor component
};

export default NodeEditor;
