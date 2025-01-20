import { List } from "lucide-react";
import DefSelector from "./DefRefSelector";

export const ListEditor = ({ 
    node, 
    propName, 
    list, 
    onItemChange, 
    onItemRemove, 
    onItemAdd 
}) => {
  const items = propName === 'upgrades' ? 
    (Array.isArray(node.upgrades) ? node.upgrades :
      typeof node.upgrade === 'string' && node.upgrade !== '' ? [node.upgrade] : 
      []) :
    (Array.isArray(list) ? list :
      typeof list === 'string' && list !== '' ? [list] :
      []);
     
  return (
    <div className="flex flex-col space-y-2">
      {/* Scrollable list container */}
      <div className="max-h-32 overflow-y-auto pr-1">
        <div className="space-y-2">
          {items.map((item, index) => (
            <div key={index} className="flex gap-2 items-start">
              <input
                type="text"
                value={item}
                onChange={e => onItemChange(propName, index, e.target.value)}
                className="flex-1 p-1.5 text-sm border rounded" 
                placeholder={`${propName} ${index + 1}`}
              />
              <button
                onClick={() => onItemRemove(propName, index)}
                className="px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600 h-8"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Fixed action buttons */}
      <div className="flex space-x-2 pt-1">
        <div className="flex-1">
          <DefSelector
            defType="TalentDef"
            onChange={(e) => onItemAdd('upgrades', e)}
          />
        </div>
        <button
          onClick={() => onItemAdd(propName)}
          className="flex-1 p-1.5 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
        >
          Add Empty
        </button>  
      </div>
    </div>
  );
};
   
export default ListEditor;