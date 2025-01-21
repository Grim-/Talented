import React from 'react';
import Button from './Button';
import { ArrowLeftRight, Trash, ChevronDown, ChevronUp } from 'lucide-react';
import NodeProperties from './NodePropertiesDisplay';

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

    static getBackGroundClass = (type) => {
        let backgroundClass = 'bg-white';
        if(type === 'Start') {
            backgroundClass = 'bg-green-100';
        }
        else if(type === 'Branch') {
            backgroundClass = 'bg-yellow-100';
        }
        else {
            backgroundClass = 'bg-white';
        }
        return backgroundClass;
    };

    render({selected, connecting, onMouseDown, onClick, onStartConnection, onDelete, onCopyProperty, onContextMenuClick, expanded, onToggleExpand}) {
        return (
            <div
                className={`absolute p-2 rounded-lg shadow-lg cursor-move transition-all duration-200
                    ${Node.getBackGroundClass(this.type)}
                    ${selected ? 'ring-2 ring-blue-500' : ''}
                    ${connecting ? 'ring-2 ring-blue-300' : ''}`}
                style={{
                    left: this.x,
                    top: this.y,
                    width: expanded ? `${this.width + 200}px` : `${this.width}px`,
                    height: expanded ? `${this.height + 200}px` : `${this.height}px`,
                    transition: 'height 0.2s ease-in-out'
                }}
                onMouseDown={onMouseDown}
                onClick={onClick}
                onContextMenu={onContextMenuClick}
            >
                <div className="flex flex-col h-full">
                    <div className="flex justify-between items-center mb-2">
                        <div className="text-sm font-medium">{this.label}</div>
                        <button 
                            onClick={(e) => {
                                e.stopPropagation();
                                onToggleExpand(this.id);
                            }}
                            className="p-1 hover:bg-gray-100 rounded"
                        >
                            {expanded ? 
                                <ChevronUp size={16} /> : 
                                <ChevronDown size={16} />
                            }
                        </button>
                    </div>

                    {this.path && (
                    <div
                        className="text-xs text-gray-500 mb-2 cursor-pointer hover:bg-gray-100 px-1 rounded truncate"
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
                        <div className="flex-1 overflow-y-auto mb-2">
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
                            className="bg-blue-500 text-white"
                        >
                            <ArrowLeftRight size={20}/>
                        </Button>
                        <Button
                            size="sm"
                            onClick={(e) => {
                                e.stopPropagation();
                                onDelete(this.id);
                            }}
                            className="bg-red-500 text-white"
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