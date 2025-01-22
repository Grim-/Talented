import React from 'react';
import Button from './Button';
import { ArrowLeftRight, Trash, ChevronDown, ChevronUp } from 'lucide-react';
import NodeProperties from './NodePropertiesDisplay';
import { Tooltip } from 'react-tooltip';

export class Node {
    constructor(id = null, label = "New Node", type = 'Normal', x = 0, y = 0, width = 350, height = 100) {
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
        this.height = height + 25;
        this.connections = [];
        this.path = '';
        this.upgrade = '';
        this.branchPaths = [];
        this.upgrades = [];
        this.descriptionString = '';
        this.levelRequired = 0;
        this.canDrag = true;
    }

    static NewId = () => {
        return `node_${Date.now()}`
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
        const tooltipId = `node-tooltip-${this.id}`;
        const upgradesText = this.upgrades && this.upgrades.length > 0 
            ? `Upgrades: \r\n ${this.upgrades.join(', ')}` 
            : 'No upgrades selected';

        return (
                <div
                    className={`absolute p-2 rounded-lg shadow-lg cursor-move transition-all duration-200
                        ${Node.getBackGroundClass(this.type)}
                        text-gray-300
                        ${selected ? 'ring-2 ring-blue-500' : ''}
                        ${connecting ? 'ring-2 ring-blue-300' : ''}`}
                    style={{
                        left: `${this.x}px`,
                        top: `${this.y}px`,
                        width: expanded ? `${this.width + 200}px` : `${this.width}px`,
                        height: expanded ? `${this.height + 200}px` : `${this.height}px`,
                        transition: 'height 0.2s ease-in-out'
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
                <div className="flex flex-col h-full">
                    <div className="flex justify-between items-center mb-2">
                        <div 
                            className="text-sm font-medium flex items-center"
                            data-tooltip-id={tooltipId}
                            data-tooltip-content={upgradesText}
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
                            className="text-xs text-gray-400 mb-2 cursor-pointer hover:bg-gray-700 px-1 rounded truncate"
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

                    <div className="flex flex-row justify-between mt-auto pt-2">
                        <Button
                            size="sm"
                            onClick={(e) => {
                                e.stopPropagation();
                                onStartConnection(this.id);
                            }}
                            className="bg-blue-600 text-white hover:bg-blue-700"
                        >
                            <ArrowLeftRight size={20}/>
                        </Button>
                        <Button
                            size="sm"
                            onClick={(e) => {
                                e.stopPropagation();
                                onDelete(this.id);
                            }}
                            className="bg-red-600 text-white hover:bg-red-700"
                        >
                            <Trash size={20}/>
                        </Button>
                    </div>
                </div>
            </div>
        );
    }
}

export default Node;