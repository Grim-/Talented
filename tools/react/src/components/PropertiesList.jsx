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
   
    const savedDefs = JSON.parse(localStorage.getItem('savedDefs') || '{}');
    const availableDefs = Object.keys(savedDefs['TalentUpgradeDef'] || {});
   
    return (
      <div className="space-y-2">
        {items.map((item, index) => (
          <div key={index} className="flex gap-2 items-start">
            <input
              type="text"
              value={item}
              onChange={e => onItemChange(propName, index, e.target.value)}
              className="flex-1 p-2 border rounded" 
              placeholder={`${propName} ${index + 1}`}
            />
            <button
              onClick={() => onItemRemove(propName, index)}
              className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 h-10"
            >
              ×
            </button>
          </div>
        ))}
   
        <div className="space-y-2">
          <button
            onClick={() => onItemAdd(propName)}
            className="w-full p-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Add Empty
          </button>
   
          {availableDefs.length > 0 && (
            <DefSelector
              defType="TalentUpgradeDef"
              value={[]}
              onChange={newValue => onItemAdd(propName, newValue)}
              className="w-full p-2 border rounded"
            />
          )}
        </div>
      </div>
    );
   };
   
export default ListEditor;