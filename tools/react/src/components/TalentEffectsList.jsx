import React, { useState, useCallback } from 'react';
import { ChevronDown, ChevronRight, X } from 'lucide-react';


export const EffectsList = ({ 
  title, 
  effects = [], 
  onChange, 
  createEmpty, 
  EffectComponent,
}) => {
  const [isExpanded, setIsExpanded] = useState(true);

  const handleAdd = useCallback(() => {
    const newEffect = createEmpty();
    onChange([...effects, newEffect]);
    setIsExpanded(true);
  }, [effects, onChange, createEmpty]);
  return (
    <div className="rounded-lg border border-gray-800 bg-gray-900/50 shadow-lg">
      <div className="flex flex-col">
        <div className="flex justify-between items-center">
          <button
            className="flex-1 flex items-center gap-2 p-4 hover:bg-gray-800/50 transition-colors text-left"
            onClick={() => setIsExpanded(!isExpanded)}
            aria-expanded={isExpanded}
          >
            {isExpanded ? (
              <ChevronDown className="h-4 w-4 text-gray-400" />
            ) : (
              <ChevronRight className="h-4 w-4 text-gray-400" />
            )}
            <h3 className="text-sm font-medium text-gray-200">{title}</h3>
            <span className="text-xs text-gray-400">({effects.length})</span>
          </button>
          <button
            onClick={handleAdd}
            className="px-3 py-1 mr-4 text-sm text-blue-400 hover:text-blue-300 hover:bg-gray-800 rounded-md transition-colors"
          >
            Add {title.slice(0, -1)}
          </button>
        </div>
      </div>
      
      <div className={`
        overflow-hidden transition-all duration-300 ease-in-out
        ${isExpanded ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'}
      `}>
        <div className="p-4 space-y-3 border-t border-gray-800">
          {effects.map((effect, index) => (
            <EffectComponent
              key={index}
              effect={effect}
              onChange={newEffect => {
                const newEffects = [...effects];
                newEffects[index] = newEffect;
                onChange(newEffects);
              }}
              onRemove={() => onChange(effects.filter((_, i) => i !== index))}

            />
          ))}
          {effects.length === 0 && (
            <p className="text-sm text-gray-400 text-center py-2">
              No {title.toLowerCase()} added yet
            </p>
          )}
        </div>
      </div>
    </div>
  );
};


