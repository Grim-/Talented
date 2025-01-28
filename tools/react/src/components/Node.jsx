import React from 'react';
import Button from './Button';
import { ArrowLeftRight, Trash, ChevronDown, ChevronUp } from 'lucide-react';
import NodeProperties from './NodePropertiesDisplay';
import { Tooltip } from 'react-tooltip';



export const NodeStyleTypes = [
    'DefaultNodeStyle',
    'CapstoneNodeStyle', 
    'UltimateNodeStyle'
  ];


export class Node {
    constructor(id = null, label = "New Node", type = 'Normal', x = 0, y = 0, width = 120, height = 70) {
        this.id = id == null ? `node_${Date.now()}` : id;
        this.label = label;
        this.type = type;
        
        if(x === 0 && y === 0) {
            this.x = window.innerWidth / 2;
            this.y = window.innerHeight / 2 - 50;
        } else {
            this.x = x;
            this.y = y; 
        }

        this.width = width;
        this.height = height;
        this.connections = [];
        this.path = '';
        this.upgrade = '';
        this.branchPaths = [];
        this.upgrades = [];
        this.descriptionString = '';
        this.levelRequired = 0;
        this.canDrag = true;
        this.style = 'DefaultNodeStyle';
    }

    static NewId = () => {
        return `node_${Date.now()}`
    };
    
    static fromXmlDef = (nodeDef) => {
        const position = nodeDef.getElementsByTagName("position")[0]?.textContent || "(0,0)";
        const [x, y] = position.replace(/[()]/g, '').split(',').map(n => parseFloat(n.trim()));
        
        const node = new Node(
            nodeDef.getElementsByTagName("defName")[0].textContent,
            nodeDef.getElementsByTagName("label")[0]?.textContent || nodeDef.getElementsByTagName("defName")[0].textContent,
            nodeDef.getElementsByTagName("type")[0]?.textContent || "Normal",
            x,
            y
        );
    
        node.connections = Array.from(nodeDef.getElementsByTagName("connections")[0]?.getElementsByTagName("li") || [])
            .map(li => li.textContent);
            
        node.upgrades = Array.from(nodeDef.getElementsByTagName("upgrades")[0]?.getElementsByTagName("li") || [])
            .map(li => li.textContent);
            
        node.path = nodeDef.getElementsByTagName("path")[0]?.textContent || "";
    
        return node;
    };
    
    center = () => {
        return [
            this.x + this.width/2,
            this.y + this.height/2
        ];
    }
    clampToCanvas() {
        const canvas = document.getElementById('mainCanvas');
        if (!canvas) return;
    
        const canvasRect = canvas.getBoundingClientRect();
    
        // Clamp the position so the node stays fully inside the canvas
        this.x = Math.max(canvasRect.left, Math.min(this.x, canvasRect.right - this.width));
        this.y = Math.max(canvasRect.top, Math.min(this.y, canvasRect.bottom - this.height));
    }
    static getBackGroundClass = (type) => {
        let backgroundClass = 'bg-gray-700';
        if(type === 'Start') {
            backgroundClass = 'bg-green-700';
        }
        else if(type === 'Branch') {
            backgroundClass = 'bg-yellow-700';
        }
        return backgroundClass;
    };

    render({selected, connecting, onMouseDown, onClick, onStartConnection, onDelete, onCopyProperty, onContextMenuClick, expanded, onToggleExpand}) {
        const tooltipId = `node-tooltip-${this.id}-multiline`;
        const upgradesText = () => {
            const parts = [];
            
            // Add upgrades section if exists
            if (this.upgrades && this.upgrades.length > 0) {
              parts.push(`
                <div style="margin-bottom: 8px">
                  <strong>Upgrades:</strong>
                  <ul style="list-style-type: none; padding-left: 8px; margin: 4px 0">
                    ${this.upgrades.map(upgrade => `<li>• ${upgrade}</li>`).join('')}
                  </ul>
                </div>
              `);
            } else {
              parts.push('<div>No upgrades selected</div>');
            }
            
            // Add path section if exists
            if (this.path) {
              parts.push(`
                <div style="margin-top: 4px">
                  <strong>Path:</strong> ${this.path}
                </div>
              `);
            }
            
            return parts.join('');
          };

        return (
                <div
                    className={`absolute p-1 rounded-lg shadow-lg cursor-move transition-all duration-200
                        ${Node.getBackGroundClass(this.type)}
                        text-gray-300
                        ${selected ? 'ring-2 ring-blue-500' : ''}
                        ${connecting ? 'ring-2 ring-blue-300' : ''}`}
                    style={{
                        left: `${this.x}px`,
                        top: `${this.y}px`,
                        width: expanded ? `${this.width + 210}px` : `${this.width + 20}px`,
                        height: expanded ? `${this.height + 210}px` : `${this.height}px`,
                        transition: 'height 0.2s ease-in-out',
                        zIndex: 100
                    }}
                    onMouseDown={(e) => {
                        // Start drag or other interaction
                        // Call clampToCanvas at the end of the interaction
                        onMouseDown(e);
                        this.clampToCanvas();
                    }}
                    onClick={(e) => {
                        onClick(e);
                        this.clampToCanvas();
                    }}
                    onContextMenu={(e) => {
                        onContextMenuClick(e);
                        this.clampToCanvas();
                    }}
                >
                <div className="flex flex-col h-full pb-8">
                    <div className="flex justify-between items-center mb-2">
                        <div 
                            className="text-sm font-medium flex items-center"
                            data-tooltip-id={tooltipId}
                            data-tooltip-content={upgradesText()}
                            data-tooltip-html={upgradesText()}
                        >
                            {this.label}
                            {this.upgrades && this.upgrades.length > 0 && (
                                <span className="ml-1 inline-flex items-center justify-center w-4 h-4 text-xs bg-blue-900 text-blue-200 rounded-full">
                                    {this.upgrades.length}
                                </span>
                            )}
                        </div>
                        <Tooltip
                            id={tooltipId}
                            place="top"
                            className="max-w-xs bg-gray-900 text-gray-300 text-sm rounded px-2 py-1"

                        />
                        <button 
                            onClick={(e) => {
                                e.stopPropagation();
                                onToggleExpand(this.id);
                            }}
                            className="p-1 hover:bg-gray-700 rounded"
                        >
                            {expanded ? 
                                <ChevronUp size={16} className="text-gray-300" /> : 
                                <ChevronDown size={16} className="text-gray-300" />
                            }
                        </button>
                    </div>

                    {this.path && (
                        <div
                            className="text-xs text-gray-400 mb-2 cursor-pointer hover:bg-gray-700 px-1 rounded text-center"
                            onClick={(e) => {
                                e.stopPropagation();
                                onCopyProperty(this.path, 'path');
                            }}
                            title="Click to copy path"
                        >
                            Path: {this.path}
                        </div>
                    )}

                    {expanded && (
                        <div className="flex-1 overflow-y-auto mb-2 text-gray-300">
                            <NodeProperties node={this} />
                        </div>
                    )}

                    <div className="absolute bottom-1 left-1 right-1 flex justify-between">
                        <Button
                            size="sm"
                            onClick={(e) => {
                                e.stopPropagation();
                                onStartConnection(this.id);
                            }}
                            className="bg-blue-600 text-white hover:bg-blue-700"
                            iconSize={10}
                            leadingIcon={ArrowLeftRight}
                        />
                        <Button
                            size="sm"
                            onClick={(e) => {
                                e.stopPropagation();
                                onDelete(this.id);
                            }}
                            className="bg-red-600 text-white hover:bg-red-700"
                            iconSize={10}
                            leadingIcon={Trash}
                        />
                    </div>
                </div>
            </div>
        );
    }
}

export default Node;