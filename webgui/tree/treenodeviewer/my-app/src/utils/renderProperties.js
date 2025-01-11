
  export const renderPropertyEditor = (propName, propDef, value, onChange) => {
    if (typeof propDef === 'string') {
      switch (propDef) {
        case 'string':
          return (
            <input
              type="text"
              value={value || ''}
              onChange={e => onChange(e.target.value)}
              className="w-full p-2 border rounded"
            />
          );
        case 'number':
          return (
            <input
              type="number"
              value={value || 0}
              onChange={e => onChange(Number(e.target.value))}
              className="w-full p-2 border rounded"
            />
          );
        case 'defList':
          return (
            <div>
              {(value || []).map((item, idx) => (
                <div key={idx} className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={item}
                    onChange={e => {
                      const newList = [...value];
                      newList[idx] = e.target.value;
                      onChange(newList);
                    }}
                    className="flex-1 p-2 border rounded"
                  />
                  <button
                    onClick={() => onChange(value.filter((_, i) => i !== idx))}
                    className="px-2 py-1 bg-red-500 text-white rounded"
                  >
                    ×
                  </button>
                </div>
              ))}
              <button
                onClick={() => onChange([...(value || []), ''])}
                className="w-full p-2 bg-blue-500 text-white rounded"
              >
                Add Item
              </button>
            </div>
          );
        default: return null;
      }
    }

    if (propDef.type === 'vector2') {
      return (
        <div className="flex gap-2">
          <input
            type="number"
            value={value?.x || 0}
            onChange={e => onChange({ ...value, x: Number(e.target.value) })}
            className="w-1/2 p-2 border rounded"
            placeholder="X"
          />
          <input
            type="number"
            value={value?.y || 0}
            onChange={e => onChange({ ...value, y: Number(e.target.value) })}
            className="w-1/2 p-2 border rounded"
            placeholder="Y"
          />
        </div>
      );
    }

    if (propDef.type === 'enum') {
      return (
        <select
          value={value || propDef.values[0]}
          onChange={e => onChange(e.target.value)}
          className="w-full p-2 border rounded"
        >
          {propDef.values.map(val => (
            <option key={val} value={val}>{val}</option>
          ))}
        </select>
      );
    }

    return null;
  };
