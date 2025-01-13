import React, { useState, useEffect } from 'react';
import Modal from './components/Modal';
import Button from './components/Button';
import Node from './components/Node';
import PropertiesPanel from './components/PropertiesPanel'
import { saveDef, loadDefs } from './storage';
import { serializeDefToXml, serializeProperty } from './utils/xmlSerializer';




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

  // Session management functions
  const saveSessionToFile = (setNodes, setPaths) => {
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

  const loadSessionFromFile = async (event) => {
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
  const clearSession = (setNodes, setPaths) => {
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
    const files = event.target.files;
    let allDefs = [...referenceDefs];
    let allNodes = [];
    let allPaths = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      try {
        const text = await file.text();
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(text, "text/xml");

        // Import paths from this file
        const pathDefs = xmlDoc.getElementsByTagName("Talented.UpgradePathDef");
        const newPaths = Array.from(pathDefs).map(pathDef => ({
          id: pathDef.getElementsByTagName("defName")[0].textContent,
          name: pathDef.getElementsByTagName("defName")[0].textContent,
          description: pathDef.getElementsByTagName("pathDescription")[0]?.textContent || '',
          fileName: file.name
        }));

        // Import nodes from this file
        const nodeDefs = xmlDoc.getElementsByTagName("Talented.UpgradeTreeNodeDef");
        const newNodes = Array.from(nodeDefs).map(nodeDef => {
          const position = nodeDef.getElementsByTagName("position")[0]?.textContent || "(0,0)";
          const [x, y] = position.replace(/[()]/g, '').split(',').map(n => parseInt(n) * 50);

          const connections = Array.from(nodeDef.getElementsByTagName("connections")[0]?.getElementsByTagName("li") || [])
            .map(li => li.textContent);

          const branchPathElements = nodeDef.getElementsByTagName("branchPaths")[0]?.getElementsByTagName("li") || [];
          const branchPaths = Array.from(branchPathElements).map(branchElem => ({
            path: branchElem.getElementsByTagName("path")[0]?.textContent || '',
            nodes: Array.from(branchElem.getElementsByTagName("nodes")[0]?.getElementsByTagName("li") || [])
              .map(li => li.textContent)
          }));

          return {
            id: nodeDef.getElementsByTagName("defName")[0].textContent,
            label: nodeDef.getElementsByTagName("defName")[0].textContent,
            type: nodeDef.getElementsByTagName("type")[0]?.textContent || "Normal",
            x,
            y,
            connections,
            path: nodeDef.getElementsByTagName("path")[0]?.textContent || "",
            upgrade: nodeDef.getElementsByTagName("upgrade")[0]?.textContent || "",
            branchPaths,
            fileName: file.name
          };
        });

        allNodes = [...allNodes, ...newNodes];
        allPaths = [...allPaths, ...newPaths];
      } catch (e) {
        alert(`Error parsing file ${file.name}: ${e.message}`);
      }
    }

    // Update nodes and paths
    setNodes([...nodes, ...allNodes]);
    setPaths([...paths, ...allPaths]);
    setShowImport(false);
  };

  const exportToXml = () => {
      let xml = '<?xml version="1.0" encoding="utf-8" ?>\n<Defs>\n';

      // Existing paths
      paths.forEach(path => {
        xml += `  <Talented.UpgradePathDef>\n`;
        xml += `    <defName>${path.name}</defName>\n`;
        xml += `    <pathDescription>${path.description}</pathDescription>\n`;
        xml += `  </Talented.UpgradePathDef>\n\n`;
      });

      // Existing nodes + any other node-like defs
      nodes.forEach(node => {
        // Determine the correct def type based on node properties
        const defType = node.upgrade ? 'Talented.UpgradeTreeNodeDef' :
                       node.dimensions ? 'Talented.UpgradeTreeDef' :
                       node.pointCost ? 'Talented.UpgradeDef' :
                       'Talented.UpgradeTreeNodeDef';

        xml += `  <${defType}>\n`;
        xml += `    <defName>${node.id}</defName>\n`;

        // Add all non-empty properties based on their type
        if (node.position || node.x !== undefined) {
          xml += `    <position>(${Math.round((node.x || 0)/50)},${Math.round((node.y || 0)/50)})</position>\n`;
        }
        if (node.type) xml += `    <type>${node.type}</type>\n`;

        // Convert single upgrade to upgrades list
        if (node.upgrade) {
          xml += `    <upgrades>\n`;
          xml += `      <li>${node.upgrade}</li>\n`;
          xml += `    </upgrades>\n`;
        }

        if (node.path) xml += `    <path>${node.path}</path>\n`;
        if (node.parasiteLevelRequired) xml += `    <parasiteLevelRequired>${node.parasiteLevelRequired}</parasiteLevelRequired>\n`;
        if (node.pointCost) xml += `    <pointCost>${node.pointCost}</pointCost>\n`;
        if (node.uiIcon) xml += `    <uiIcon>${node.uiIcon}</uiIcon>\n`;
        if (node.dimensions) xml += `    <dimensions>(${node.dimensions.x},${node.dimensions.y})</dimensions>\n`;

        if (node.connections?.length > 0) {
          xml += `    <connections>\n`;
          node.connections.forEach(conn => {
            xml += `      <li>${conn}</li>\n`;
          });
          xml += `    </connections>\n`;
        }
        if (node.branchPaths?.length > 0) {
          xml += `    <branchPaths>\n`;
          node.branchPaths.forEach(branch => {
            xml += `      <li>\n`;
            xml += `        <path>${branch.path}</path>\n`;
            xml += `        <nodes>\n`;
            branch.nodes.forEach(nodeId => {
              xml += `          <li>${nodeId}</li>\n`;
            });
            xml += `        </nodes>\n`;
            xml += `      </li>\n`;
          });
          xml += `    </branchPaths>\n`;
        }
        xml += `  </${defType}>\n\n`;
      });

      xml += '</Defs>';
      setExportedXml(xml);
      setShowExport(true);
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
          onChange={loadSessionFromFile}
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
      <div className="w-64 absolute left-4 top-4 bg-white rounded-lg shadow-lg p-4">
        <h3 className="font-bold mb-4">Properties</h3>
        {selectedNode && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Label</label>
              <input
                type="text"
                value={nodes.find(n => n.id === selectedNode)?.label || ''}
                onChange={(e) => updateNodeProperty(selectedNode, 'label', e.target.value)}
                className="w-full p-2 border rounded"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Type</label>
              <select
                value={nodes.find(n => n.id === selectedNode)?.type || 'Normal'}
                onChange={(e) => updateNodeProperty(selectedNode, 'type', e.target.value)}
                className="w-full p-2 border rounded"
              >
                <option>Start</option>
                <option>Normal</option>
                <option>Branch</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Path</label>
              <input
                type="text"
                value={nodes.find(n => n.id === selectedNode)?.path || ''}
                onChange={(e) => updateNodeProperty(selectedNode, 'path', e.target.value)}
                className="w-full p-2 border rounded"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Upgrade</label>
              <input
                type="text"
                value={nodes.find(n => n.id === selectedNode)?.upgrade || ''}
                onChange={(e) => updateNodeProperty(selectedNode, 'upgrade', e.target.value)}
                className="w-full p-2 border rounded"
              />
            </div>
            {nodes.find(n => n.id === selectedNode)?.type === 'Branch' && (
              <div>
                <label className="block text-sm font-medium mb-1">Branch Paths</label>
                <Button
                  onClick={() => addBranchPath(selectedNode)}
                  className="bg-blue-500 text-white mb-2 w-full"
                  size="sm"
                >
                  Add Branch Path
                </Button>
                {nodes.find(n => n.id === selectedNode)?.branchPaths.map((branch, idx) => (
                  <div key={idx} className="ml-2 mb-2">
                    <input
                      type="text"
                      placeholder="Path name"
                      value={branch.path}
                      onChange={(e) => updateBranchPath(selectedNode, idx, 'path', e.target.value)}
                      className="w-full p-2 border rounded mb-1"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

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
