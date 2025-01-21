import React from 'react';
import { List } from "lucide-react";

export const TagGrid = ({ 
    node, 
    propName, 
    list,
}) => {
  const items = propName === 'upgrades' ? 
    (Array.isArray(node.upgrades) ? node.upgrades :
      typeof node.upgrade === 'string' && node.upgrade !== '' ? [node.upgrade] : 
      []) :
    (Array.isArray(list) ? list :
      typeof list === 'string' && list !== '' ? [list] :
      []);
     
  return (
    <div className="flex flex-wrap gap-2">
      {items.map((item, index) => (
        <button
          key={index}
          className="px-3 py-1.5 text-sm bg-blue-100 text-blue-800 rounded-full hover:bg-blue-200 transition-colors"
        >
          {item}
        </button>
      ))}
    </div>
  );
};
   
export default TagGrid;