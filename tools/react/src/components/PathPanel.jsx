import React, { useState, useEffect } from 'react';
import { BadgeHelp, ChevronDown, ChevronUp, GitBranch, Plus, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import ListEditor from './PropertiesList';
import { StorageUtils } from '../utils/StorageUtils';

const PathPanel = ({ paths, setPaths, nodes }) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [allPaths, setAllPaths] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const talentPathDefs = StorageUtils.getDefsOfType('TalentPathDef');
    

    const pathsFromDefs = Object.entries(talentPathDefs).map(([name, def]) => ({
      name,
      description: def.description || '',
      color: def.color || '#000000',
      exclusiveWith: def.exclusiveWith || [],
      isFromTalentPathDef: true
    }));

    const usedPaths = new Set(nodes.map(node => node.path).filter(Boolean));
    const pathsFromNodes = Array.from(usedPaths)
      .filter(pathName => !pathsFromDefs.some(p => p.name === pathName))
      .filter(pathName => !paths.some(p => p.name === pathName))
      .map(pathName => ({
        name: pathName,
        description: '',
        exclusiveWith: [],
        color: '#000000'
      }));
  
    const combinedPaths = [
      ...pathsFromDefs,   
      ...paths,           
      ...pathsFromNodes   
    ];
  
    setAllPaths(combinedPaths);
  }, [paths, nodes]);

  const addPath = () => {
    setPaths([...paths, { 
      name: 'New Path', 
      color: '#000000',
      description: '',
      exclusiveWith: []
    }]);
  };

  const removePath = (index) => {
    const pathToRemove = allPaths[index];
    if (paths.find(p => p.name === pathToRemove.name)) {
      const newPaths = paths.filter(p => p.name !== pathToRemove.name);
      setPaths(newPaths);
      if (currentIndex >= allPaths.length - 1) {
        setCurrentIndex(Math.max(0, currentIndex - 1));
      }
    }
  };

  const updatePath = (index, field, value) => {
    const pathToUpdate = allPaths[index];
    if (paths.find(p => p.name === pathToUpdate.name)) {
      const newPaths = paths.map(p => 
        p.name === pathToUpdate.name 
          ? { ...p, [field]: value }
          : p
      );
      setPaths(newPaths);
    }
  };

  const handleListItemChange = (pathIndex) => (propName, itemIndex, value) => {
    const path = allPaths[pathIndex];
    if (paths.find(p => p.name === path.name)) {
      const pathInPaths = paths.find(p => p.name === path.name);
      const newList = [...(pathInPaths[propName] || [])];
      newList[itemIndex] = value;
      updatePath(pathIndex, propName, newList);
    }
  };

  const handleListItemRemove = (pathIndex) => (propName, itemIndex) => {
    const path = allPaths[pathIndex];
    if (paths.find(p => p.name === path.name)) {
      const pathInPaths = paths.find(p => p.name === path.name);
      const newList = [...(pathInPaths[propName] || [])];
      newList.splice(itemIndex, 1);
      updatePath(pathIndex, propName, newList);
    }
  };

  const handleListItemAdd = (pathIndex) => (propName, value = '') => {
    const path = allPaths[pathIndex];
    if (paths.find(p => p.name === path.name)) {
      const pathInPaths = paths.find(p => p.name === path.name);
      const currentList = pathInPaths[propName] || [];
      updatePath(pathIndex, propName, [...currentList, value]);
    }
  };

  const nextPath = () => {
    setCurrentIndex((prev) => Math.min(prev + 1, allPaths.length - 1));
  };

  const prevPath = () => {
    setCurrentIndex((prev) => Math.max(prev - 1, 0));
  };

  return (
    <div className="w-80 bg-gray-800 rounded-lg shadow-lg">
      <div 
        className="px-3 py-2 border-b border-gray-700 m-1 flex justify-between items-center cursor-pointer hover:bg-gray-700"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <GitBranch size={20} className="text-gray-300" />
        <h2 className="text-sm font-semibold text-gray-300">Paths</h2>
        {isExpanded ? (
          <ChevronUp className="h-4 w-4 text-gray-400" />
        ) : (
          <ChevronDown className="h-4 w-4 text-gray-400" />
        )}
      </div>

      <div className={`overflow-hidden transition-all duration-200 ease-in-out ${isExpanded ? 'max-h-96' : 'max-h-0'}`}>
        <div className="p-3 space-y-3">
          <button
            onClick={addPath}
            className="w-full p-2 flex items-center justify-center gap-2 text-sm text-green-400 hover:text-green-300 hover:bg-green-900 rounded-md border border-green-700"
          >
            <Plus className="h-4 w-4" /> Add New Path
          </button>

          <div className="flex justify-between items-center">
            <button
              onClick={prevPath}
              disabled={currentIndex === 0}
              className="p-1 text-gray-400 hover:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="text-sm text-gray-400">
              {allPaths.length > 0 ? `${currentIndex + 1} / ${allPaths.length}` : '0 / 0'}
            </span>
            <button
              onClick={nextPath}
              disabled={currentIndex === allPaths.length - 1}
              className="p-1 text-gray-400 hover:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          {allPaths.length > 0 && (
            <div className="space-y-2">
              {(() => {
                const path = allPaths[currentIndex];
                const isUsedByNode = nodes.some(node => node.path === path.name);
                const isInPathsList = paths.some(p => p.name === path.name);
                const isFromTalentPathDef = path.isFromTalentPathDef;

                return (
                  <div className={`space-y-2 p-3 border rounded-md ${
                    isFromTalentPathDef ? 'bg-blue-900 border-blue-700' : 
                    isUsedByNode && !isInPathsList ? 'bg-gray-700 border-gray-600' : 
                    'border-gray-700'
                  }`}>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={path.name || ''}
                        onChange={(e) => updatePath(currentIndex, 'name', e.target.value)}
                        placeholder="Path Name"
                        className="flex-1 p-1.5 text-sm bg-gray-700 border border-gray-600 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-gray-300 placeholder-gray-500 disabled:bg-gray-800"
                        disabled={!isInPathsList || isFromTalentPathDef}
                      />
                      <div className="flex items-center gap-1">
                        <input
                          type="color"
                          value={path.color || '#000000'}
                          onChange={(e) => updatePath(currentIndex, 'color', e.target.value)}
                          className="h-8 w-8 rounded border border-gray-600 bg-gray-700"
                          disabled={!isInPathsList || isFromTalentPathDef}
                        />
                        {isInPathsList && !isFromTalentPathDef && (
                          <button
                            onClick={() => removePath(currentIndex)}
                            className="p-1 text-red-400 hover:text-red-300 hover:bg-red-900 rounded"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </div>

                    <textarea
                      value={path.description || ''}
                      onChange={(e) => updatePath(currentIndex, 'description', e.target.value)}
                      placeholder="Path Description"
                      rows={2}
                      className="w-full p-1.5 text-sm bg-gray-700 border border-gray-600 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-gray-300 placeholder-gray-500 disabled:bg-gray-800"
                      disabled={!isInPathsList || isFromTalentPathDef}
                    />

                    <div>
                      <label className="block text-xs font-medium text-gray-300 mb-1">
                        <div className="flex items-center gap-1">
                          Exclusive With <BadgeHelp className="h-4 w-4 text-gray-400" />
                        </div>
                      </label>
                      <ListEditor
                        node={path}
                        propName="exclusiveWith"
                        list={path.exclusiveWith}
                        onItemChange={handleListItemChange(currentIndex)}
                        onItemRemove={handleListItemRemove(currentIndex)}
                        onItemAdd={handleListItemAdd(currentIndex)}
                        defType="TalentPathDef"
                        disabled={!isInPathsList || isFromTalentPathDef}
                      />
                    </div>
                  </div>
                );
              })()}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PathPanel;