export class StorageUtils {
  static TALENTED_KEY = 'TalentedDefs';
  static SAVED_DEFS_KEY = 'savedDefs';

  // Load all definitions from TalentedDefs
  static loadDefs() {
    const data = localStorage.getItem(this.TALENTED_KEY);
    return data ? JSON.parse(data) : [];
  }

  // Save a definition to TalentedDefs
  static saveDef(def) {
    const defs = this.loadDefs();
    const index = defs.findIndex(d => d.defName === def.defName && d.type === def.type);

    if (index >= 0) {
      defs[index] = def;
    } else {
      defs.push(def);
    }

    localStorage.setItem(this.TALENTED_KEY, JSON.stringify(defs));
  }

  // Delete a definition from TalentedDefs
  static deleteDef(defName, type) {
    const defs = this.loadDefs();
    const filtered = defs.filter(d => !(d.defName === defName && d.type === type));
    localStorage.setItem(this.TALENTED_KEY, JSON.stringify(filtered));
  }

  // Get definitions of a specific type from savedDefs
  static getDefsOfType(defType = "TalentDef") {
    const storedDefs = this.getSavedDefs();
    return storedDefs[defType] || {};
  }

  // Get all saved definitions
  static getSavedDefs() {
    return JSON.parse(localStorage.getItem(this.SAVED_DEFS_KEY) || '{}');
  }

  // Save definitions of a specific type
  static saveDefsOfType(defType, defs) {
    const allDefs = this.getSavedDefs();
    allDefs[defType] = defs;
    localStorage.setItem(this.SAVED_DEFS_KEY, JSON.stringify(allDefs));
  }

  // Add or update a single definition of a specific type
  static saveSingleDefOfType(defType, defName, def) {
    const defsOfType = this.getDefsOfType(defType);
    defsOfType[defName] = def;
    this.saveDefsOfType(defType, defsOfType);
  }

  // Delete a definition of a specific type
  static deleteDefOfType(defType, defName) {
    const defsOfType = this.getDefsOfType(defType);
    delete defsOfType[defName];
    this.saveDefsOfType(defType, defsOfType);
  }

  // Check if a definition exists
  static defExists(defType, defName) {
    const defsOfType = this.getDefsOfType(defType);
    return !!defsOfType[defName];
  }

  // Get a single definition by type and name
  static getSingleDef(defType, defName) {
    const defsOfType = this.getDefsOfType(defType);
    return defsOfType[defName];
  }


  static clearDefsOfType(defType) {
    const allDefs = this.getSavedDefs();
    delete allDefs[defType];
    localStorage.setItem(this.SAVED_DEFS_KEY, JSON.stringify(allDefs));
  }


  static clearAllDefs() {
    localStorage.removeItem(this.TALENTED_KEY);
    localStorage.removeItem(this.SAVED_DEFS_KEY);
  }

  static migrateDefsToNewFormat() {
    const oldDefs = this.loadDefs();
    const newDefs = this.getSavedDefs();
  
    oldDefs.forEach(def => {
      if (def.parasiteLevelRequired !== undefined) {
        def.levelRequired = def.parasiteLevelRequired;
        delete def.parasiteLevelRequired;
      }
      
      if (!newDefs[def.type]) {
        newDefs[def.type] = {};
      }
      newDefs[def.type][def.defName] = def;
    });
  
    localStorage.setItem(this.SAVED_DEFS_KEY, JSON.stringify(newDefs));
  }

  static migrateParasiteLevelToLevelRequired() {
    const savedDefs = this.getSavedDefs();
    
    Object.entries(savedDefs).forEach(([defType, defs]) => {
      Object.entries(defs).forEach(([defName, def]) => {
        if (def.parasiteLevelRequired !== undefined) {
          def.levelRequired = def.parasiteLevelRequired;
          delete def.parasiteLevelRequired;
        }
      });
    });
    
    localStorage.setItem(this.SAVED_DEFS_KEY, JSON.stringify(savedDefs));
  }
}