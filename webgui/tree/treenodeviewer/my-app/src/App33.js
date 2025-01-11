import React, { useState } from 'react';
import './index.css';
// Simple Modal component
const Modal = ({ isOpen, onClose, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-3xl w-full m-4">
        {children}
        <div className="flex justify-end mt-4">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600">
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

// Reusable Button component
const Button = ({ children, className = "", onClick, size = "default" }) => {
  const sizeClasses = {
    default: "px-4 py-2",
    sm: "px-2 py-1 text-sm"
  };
  return (
    <button
      onClick={onClick}
      className={`rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2
        ${sizeClasses[size]} ${className}`}
    >
      {children}
    </button>
  );
};

const NodeEditor = () => {
  // Core state
  const [nodes, setNodes] = useState([
    {
      id: 'start',
      label: 'Basic Parasite Metabolism',
      type: 'Start',
      x: 200,
      y: 50,
      connections: [],
      path: '',
      upgrade: 'BasicParasiteMetabolism',
      branchPaths: []
    }
  ]);

  const handleFileSelect = async (event) => {
    const files = event.target.files;
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
          description: pathDef.getElementsByTagName("pathDescription")[0]?.textContent || ''
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
            branchPaths: branchPaths
          };
        });

        allNodes = [...allNodes, ...newNodes];
        allPaths = [...allPaths, ...newPaths];
      } catch (e) {
        alert(`Error parsing file ${file.name}: ${e.message}`);
      }
    }

    setPaths([...paths, ...allPaths]);
    setNodes([...nodes, ...allNodes]);
    setShowImport(false);
  };
  // UI state
  const [paths, setPaths] = useState([]);
  const [draggingNode, setDraggingNode] = useState(null);
  const [draggingOffset, setDraggingOffset] = useState({ x: 0, y: 0 });
  const [connecting, setConnecting] = useState(null);
  const [showExport, setShowExport] = useState(false);
  const [exportedXml, setExportedXml] = useState('');
  const [selectedNode, setSelectedNode] = useState(null);
  const [showImport, setShowImport] = useState(false);
  const [importXml, setImportXml] = useState('');
  // Node Manipulation Handlers
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

    // XML Import/Export
    const exportToXml = () => {
      let xml = '<?xml version="1.0" encoding="utf-8" ?>\n<Defs>\n';

      // Export paths
      paths.forEach(path => {
        xml += `  <Talented.UpgradePathDef>\n`;
        xml += `    <defName>${path.name}</defName>\n`;
        xml += `    <pathDescription>${path.description}</pathDescription>\n`;
        xml += `  </Talented.UpgradePathDef>\n\n`;
      });

      // Export nodes
      nodes.forEach(node => {
        xml += `  <Talented.UpgradeTreeNodeDef>\n`;
        xml += `    <defName>${node.id}</defName>\n`;
        xml += `    <position>(${Math.round(node.x/50)},${Math.round(node.y/50)})</position>\n`;
        xml += `    <type>${node.type}</type>\n`;
        if (node.upgrade) {
          xml += `    <upgrade>${node.upgrade}</upgrade>\n`;
        }
        if (node.path) {
          xml += `    <path>${node.path}</path>\n`;
        }
        if (node.connections.length > 0) {
          xml += `    <connections>\n`;
          node.connections.forEach(conn => {
            xml += `      <li>${conn}</li>\n`;
          });
          xml += `    </connections>\n`;
        }
        if (node.branchPaths.length > 0) {
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
        xml += `  </Talented.UpgradeTreeNodeDef>\n\n`;
      });

      xml += '</Defs>';
      setExportedXml(xml);
      setShowExport(true);
    };
    const copyToClipboard = async (text, property) => {
      try {
        await navigator.clipboard.writeText(text);
        // Could add temporary visual feedback here if desired
        console.log(`Copied ${property}: ${text}`);
      } catch (err) {
        console.error('Failed to copy text:', err);
      }
    };
    const importFromXml = () => {
      try {
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(importXml, "text/xml");

        // Import paths
        const pathDefs = xmlDoc.getElementsByTagName("Talented.UpgradePathDef");
        const newPaths = Array.from(pathDefs).map(pathDef => ({
          id: pathDef.getElementsByTagName("defName")[0].textContent,
          name: pathDef.getElementsByTagName("defName")[0].textContent,
          description: pathDef.getElementsByTagName("pathDescription")[0]?.textContent || ''
        }));

        // Import nodes
        const nodeDefs = xmlDoc.getElementsByTagName("Talented.UpgradeTreeNodeDef");
        const newNodes = Array.from(nodeDefs).map(nodeDef => {
          const position = nodeDef.getElementsByTagName("position")[0]?.textContent || "(0,0)";
          const [x, y] = position.replace(/[()]/g, '').split(',').map(n => parseInt(n) * 50);

          const connections = Array.from(nodeDef.getElementsByTagName("connections")[0]?.getElementsByTagName("li") || [])
            .map(li => li.textContent);

          // Parse branch paths if they exist
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
            branchPaths
          };
        });

        setPaths(newPaths);
        setNodes(newNodes);
        setShowImport(false);
      } catch (e) {
        alert("Error parsing XML: " + e.message);
      }
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
        <Button onClick={() => setShowImport(true)} className="bg-green-500 text-white">Import XML</Button>
        <Button onClick={exportToXml} className="bg-purple-500 text-white">Export XML</Button>
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
};

export default NodeEditor;
