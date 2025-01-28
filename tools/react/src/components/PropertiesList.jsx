import { List } from "lucide-react";
import DefSelector from "./DefRefSelector";

export const ListEditor = ({ 
    node, 
    propName, 
    list, 
    onItemChange, 
    onItemRemove, 
    onItemAdd,
    defType = "TalentDef" 
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
                className="flex-1 p-1.5 text-sm bg-gray-700 border border-gray-600 rounded 
                  text-gray-300 focus:ring-1 focus:ring-blue-500 focus:border-blue-500
                  placeholder-gray-500" 
                placeholder={`${propName} ${index + 1}`}
              />
              <button
                onClick={() => onItemRemove(propName, index)}
                className="px-2 py-1 bg-red-600 text-gray-200 rounded hover:bg-red-700 
                  transition-colors h-8"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Fixed action buttons */}
      <div className="flex space-x-2 pt-1">
        <div className="flex-2">
          <DefSelector
            defType={defType}
            onChange={(e) => onItemAdd(propName, e)}
          />
        </div>
        <button
          onClick={() => onItemAdd(propName)}
          className="flex-1 p-1.5 bg-gray-600 text-gray-200 rounded hover:bg-blue-700 
            transition-colors text-sm"
        >
          Add Empty
        </button>  
      </div>
    </div>
  );
};
   
export default ListEditor;