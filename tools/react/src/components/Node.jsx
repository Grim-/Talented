import React from 'react';
import Button from './Button';

export class Node {
    constructor(id = null, label = "New Node", type = 'Normal', x = 600, y = 100) {
        this.id = id == null ? `node_${Date.now()}` : id;
        this.label = label;
        this.type = type;
        this.x = x;
        this.y = y;
        this.connections = [];
        this.path = '';
        this.upgrade = '';
        this.branchPaths = [];
        this.upgrades = [];
        this.descriptionString = '';
        this.points = 0;
    }

    static NewId = () => {
        return `node_${Date.now()}`
    };

    render({selected, connecting, onMouseDown, onClick, onStartConnection, onDelete, onCopyProperty}) {
        return (
            <div
                className={`absolute p-4 rounded-lg shadow-lg w-40 cursor-move
                    ${this.type === 'Start' ? 'bg-green-100' : 'bg-white'}
                    ${this.type === 'Branch' ? 'bg-yellow-100' : ''}
                    ${selected ? 'ring-2 ring-blue-500' : ''}
                    ${connecting ? 'ring-2 ring-blue-300' : ''}`}
                style={{
                    left: this.x,
                    top: this.y
                }}
                onMouseDown={onMouseDown}
                onClick={onClick}
            >
                <div
                    className="text-sm font-medium mb-2 cursor-pointer hover:bg-gray-100 px-1 rounded"
                >
                    {this.label + '  (' + this.points + ')'}
                    {this.descriptionString}                 
                </div>
                <div
                    className="text-xs text-gray-500 mb-2 cursor-pointer hover:bg-gray-100 px-1 rounded"
                    onClick={(e) => {
                        e.stopPropagation();
                        onCopyProperty(this.path, 'path');
                    }}
                    title="Click to copy path"
                >
                    {this.path && `Path: ${this.path}`}
                </div>
                {this.upgrades && Array.isArray(this.upgrades) && this.upgrades.length > 0 && (
                    this.upgrades.map((upgrade, index) => (
                        <div
                            key={index}
                            className="text-xs text-gray-500 mb-2 cursor-pointer hover:bg-gray-100 px-1 rounded"
                            onClick={(e) => {
                                e.stopPropagation();
                                onCopyProperty(upgrade, 'upgrade');
                            }}
                            title="Click to copy upgrade"
                        >
                            {`Upgrade ${index + 1}: ${upgrade}`}
                        </div>
                    ))
                )}
                <div className="flex justify-between items-center">
                    <Button
                        size="sm"
                        onClick={(e) => {
                            e.stopPropagation();
                            onStartConnection(this.id);
                        }}
                        className="bg-blue-500 text-white"
                    >
                        →
                    </Button>
                    <Button
                        size="sm"
                        onClick={(e) => {
                            e.stopPropagation();
                            onDelete(this.id);
                        }}
                        className="bg-red-500 text-white"
                    >
                        ×
                    </Button>
                </div>
            </div>
        );
    }
}

export default Node;