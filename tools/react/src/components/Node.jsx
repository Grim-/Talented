import React from 'react';
import Button from './Button';
import { ArrowLeftRight } from 'lucide-react';
export class Node {
    constructor(id = null, label = "New Node", type = 'Normal', x = 0, y = 0, width = 200, height = 80) {
        this.id = id == null ? `node_${Date.now()}` : id;
        this.label = label;
        this.type = type;
        
        if(x == 0 && y == 0)
        {
            this.x = window.innerWidth / 2;
            this.y = window.innerHeight / 2 - 50;
        }
        else
        {
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
        this.points = 1;
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


    static getBackGroundClass = (type) =>
    {
        let backgroundClass = 'bg-white';
        if(type === 'Start')
        {
            backgroundClass = 'bg-green-100';
        }
        else if(type === 'Branch')
        {
            backgroundClass = 'bg-yellow-100';
        }
        else{
            backgroundClass = 'bg-white';
        }
        return backgroundClass;
    };

    render({selected, connecting, onMouseDown, onClick, onStartConnection, onDelete, onCopyProperty}) {
        return (
            <div
                className={`absolute p-4 rounded-lg shadow-lg w-40 cursor-move
                    ${Node.getBackGroundClass(this.type)}
                    ${selected ? 'ring-2 ring-blue-500' : ''}
                    ${connecting ? 'ring-2 ring-blue-300' : ''}`}
                style={{
                    left: this.x,
                    top: this.y,
                    width: `${this.width}px`,
                    height: `${this.height}px`
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

                <div className="flex justify-between items-center">
                    <Button
                        size="sm"
                        onClick={(e) => {
                            e.stopPropagation();
                            onStartConnection(this.id);
                        }}
                        className="bg-blue-500 text-white"
                    >
                        <ArrowLeftRight />
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