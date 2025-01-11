const STORAGE_KEY = 'TalentedDefs';

export const saveDef = (def) => {
  const defs = loadDefs();
  const index = defs.findIndex(d => d.defName === def.defName && d.type === def.type);

  if (index >= 0) {
    defs[index] = def;
  } else {
    defs.push(def);
  }

  localStorage.setItem(STORAGE_KEY, JSON.stringify(defs));
};

export const loadDefs = () => {
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : [];
};

export const deleteDef = (defName, type) => {
  const defs = loadDefs();
  const filtered = defs.filter(d => !(d.defName === defName && d.type === type));
  localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
};
