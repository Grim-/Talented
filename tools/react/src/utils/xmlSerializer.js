export const DefTypeConfig = {
  NODE: 'TalentTreeNodeDef',
  TREE: 'TalentTreeDef',
  PATH: 'TalentPathDef',
  UPGRADE: 'TalentDef',
  GENE: 'TalentedGeneDef'
};


export const NamespaceConfig = {
  prefix: 'Talented',
  separator: '.'
};

// Helper to generate full def type name
const getFullDefName = (defType) => {
  return `${NamespaceConfig.prefix}${NamespaceConfig.separator}${defType}`;
};

export const serializeDefToXml = (def, config = DefTypeConfig) => {
  const fullDefType = getFullDefName(def.type);
  let xml = `  <${fullDefType}>\n`;
  xml += `    <defName>${def.defName}</defName>\n`;

  Object.entries(def).forEach(([key, value]) => {
    if (key !== 'type' && key !== 'defName') {
      xml += serializeProperty(key, value, 2);
    }
  });

  xml += `  </${fullDefType}>\n\n`;
  return xml;
};


export const stripNamespace = (fullDefType) => {
  return fullDefType.replace(`${NamespaceConfig.prefix}${NamespaceConfig.separator}`, '');
};


export const handleXmlImport = async (event, savedDefs, setSavedDefs, config = DefTypeConfig) => {
  const files = event.target.files;
  let newDefs = { ...savedDefs };

  for (const file of Array.from(files)) {
    try {
      const text = await file.text();
      const xmlDoc = new DOMParser().parseFromString(text, "text/xml");

      // Get ALL elements
      const allElements = xmlDoc.getElementsByTagName('*');

      // Filter for our def types
      for (const element of Array.from(allElements)) {
        Object.values(config).forEach(defType => {
          const fullDefType = getFullDefName(defType);
          // Check if this element matches our def type
          if (element.tagName === fullDefType) {
            const defName = element.getElementsByTagName("defName")[0]?.textContent;
            if (!defName) return;

            const def = { defName, type: defType };
            Array.from(element.children).forEach(child => {
              if (child.tagName === 'defName') return;
              if (!child.children.length) {
                def[child.tagName] = child.textContent;
                return;
              }
              const liElements = Array.from(child.getElementsByTagName('li'));
              if (liElements.length) {
                def[child.tagName] = liElements.map(li => {
                  if (!li.children.length) return li.textContent;
                  return Array.from(li.children).reduce((obj, prop) => ({
                    ...obj,
                    [prop.tagName]: prop.textContent
                  }), {});
                });
                return;
              }
              def[child.tagName] = Array.from(child.children).reduce((obj, prop) => ({
                ...obj,
                [prop.tagName]: prop.textContent
              }), {});
            });

            // Console log to verify we found and processed the def
            console.log("Found and processing def:", fullDefType, defName);

            newDefs[defType] = { ...(newDefs[defType] || {}), [defName]: def };
          }
        });
      }
    } catch (e) {
      console.error(`Error parsing ${file.name}:`, e);
    }
  }

  console.log("Current savedDefs:", savedDefs);
  setSavedDefs(newDefs);
  console.log("New savedDefs:", newDefs);

  event.target.value = '';
};

export const exportToXml = (nodes, paths, treeName, treeSize, treeDisplayStrat, treePointsFormula, treeHandler, config = DefTypeConfig) => {
  try {
    // Reset export state at the start
    exportState.idMapping = null;
    
    // Collect all unique paths used in nodes
    const usedPaths = new Set(nodes.map(node => node.path).filter(Boolean));
    const allPaths = [...paths];
    
    // Add any paths used in nodes but not in paths array
    usedPaths.forEach(pathName => {
      if (!paths.find(p => p.name === pathName)) {
        allPaths.push({
          name: pathName,
          description: '',
          exclusiveWith: []
        });
      }
    });

    let xml = '<?xml version="1.0" encoding="utf-8" ?>\n<Defs>\n';
    // Generate unique tree name if not provided
    const uniqueTreeName = treeName || generateUniqueDefName('Tree');
    xml += exportTalentTree(nodes, allPaths, uniqueTreeName, treeSize, treeDisplayStrat, treePointsFormula, treeHandler);
    xml += exportPaths(allPaths, config);
    xml += exportNodes(nodes, treeSize, config);
    xml += '</Defs>';
    return xml;
  } catch (error) {
    // Ensure export state is reset even if there's an error
    exportState.idMapping = null;
    throw error;
  }
};

const exportTalentTree = (nodes, paths, treeName, treeSize, treeDisplayStrat, treePointsFormula, treeHandler) => {
  // Generate the ID mapping first since the tree export happens before node export
  exportState.idMapping = createIdMapping(nodes);
  
  const fullDefType = getFullDefName(DefTypeConfig.TREE);
  let xml = `  <${fullDefType}>\n`;
  xml += `    <defName>${treeName}</defName>\n`;
  xml += `    <dimensions>(${treeSize.width},${treeSize.height})</dimensions>\n`;
  xml += `    <handlerClass>${treeHandler}</handlerClass>\n`;
  
  // Add root nodes with updated IDs
  xml += '    <nodes>\n';
  nodes.filter(node => node.type === 'Start')
       .forEach(node => {
         const newId = exportState.idMapping.get(node.id);
         xml += `      <li>${newId}</li>\n`;
       });
  xml += '    </nodes>\n';
  
  // Add available paths
  xml += '    <availablePaths>\n';
  paths?.forEach(path => {
    xml += `      <li>${path.name}</li>\n`;
  });
  xml += '    </availablePaths>\n';

  xml += `    <displayStrategy>${treeDisplayStrat}</displayStrategy>\n`;
  xml += `    <talentPointFormula>${treePointsFormula}</talentPointFormula>\n`;
  xml += `  </${fullDefType}>\n\n`;
  
  return xml;
};


const validateAndFixPaths = (paths) => {
  // Create a deep copy to avoid mutating the original paths
  const validatedPaths = JSON.parse(JSON.stringify(paths));
  
  // For each path
  validatedPaths.forEach(pathA => {
    // Initialize exclusivePaths array if it doesn't exist
    if (!pathA.exclusivePaths) {
      pathA.exclusivePaths = [];
    }

    // Check each exclusive path
    pathA.exclusivePaths.forEach(exclusiveName => {
      // Find the corresponding path
      const pathB = validatedPaths.find(p => p.name === exclusiveName);
      
      if (pathB) {
        // Initialize exclusivePaths array if it doesn't exist for pathB
        if (!pathB.exclusivePaths) {
          pathB.exclusivePaths = [];
        }
        
        // If pathA is not in pathB's exclusive list, add it
        if (!pathB.exclusivePaths.includes(pathA.name)) {
          pathB.exclusivePaths.push(pathA.name);
        }
      }
    });
  });

  return validatedPaths;
};


const exportPaths = (paths, config) => {
  const validatedPaths = validateAndFixPaths(paths);
  
  let xml = '';
  validatedPaths.forEach(path => {
    xml += '<Talented.TalentPathDef>\n';
    xml += `    <defName>${path.name}</defName>\n`;
    xml += `    <pathDescription>${path.description}</pathDescription>\n`;
    xml += `    <exclusiveWith>\n`;

    if (path.exclusivePaths && path.exclusivePaths.length > 0) {
      path.exclusivePaths.forEach(exclusivePath => {
        xml += `      <li>${exclusivePath}</li>\n`;
      });
    }

    xml += `    </exclusiveWith>\n`;
    xml += `  </Talented.TalentPathDef>\n\n`;
  });
  return xml;
};


const calculateScaledPosition = (node, treeSize) => {
  const canvasDiv = document.getElementById('mainContent');
  const canvasWidth = canvasDiv.clientWidth;
  const canvasHeight = canvasDiv.clientHeight;
  
  const scaleX = treeSize.width / canvasWidth;
  const scaleY = treeSize.height / canvasHeight;
  
  const scaledX = Math.round(node.x * scaleX);
  const scaledY = Math.round(node.y * scaleY);
  
  return `(${scaledX},${scaledY})`;
};


const generateUniqueDefName = (basePrefix) => {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 10000);
  return `${basePrefix}_${timestamp}_${random}`;
};

const createIdMapping = (nodes) => {
  const mapping = new Map();
  nodes.forEach(node => {
    mapping.set(node.id, generateUniqueDefName('Node'));
  });
  return mapping;
};

const updateConnections = (connections, idMapping) => {
  if (!connections || !connections.length) return [];
  return connections.map(conn => idMapping.get(conn) || conn);
};

const updateBranchPaths = (branchPaths, idMapping) => {
  if (!branchPaths || !branchPaths.length) return [];
  
  return branchPaths.map(branch => ({
    path: branch.path,
    nodes: branch.nodes.map(nodeId => idMapping.get(nodeId) || nodeId)
  }));
};

// Create a shared state object to maintain ID mappings between exports
const exportState = {
  idMapping: null
};


const exportNodes = (nodes, treeSize, config) => {
  // Use the existing ID mapping created during tree export
  const idMapping = exportState.idMapping;
  
  if (!idMapping) {
    console.error('Tree must be exported before nodes');
    return '';
  }
  
  let xml = '';
  nodes.forEach(node => {
    const defType = node.upgrade ? getFullDefName(config.NODE) :
                   node.dimensions ? getFullDefName(config.TREE) :
                   node.pointCost ? getFullDefName(config.UPGRADE) :
                   getFullDefName(config.NODE);

    const newDefName = idMapping.get(node.id);
    
    xml += `  <${defType}>\n`;
    xml += `    <defName>${newDefName}</defName>\n`;
    if (node.label) xml += `    <label>${node.label}</label>\n`;
    
    if (node.x !== undefined) {
      xml += `    <position>${calculateScaledPosition(node, treeSize)}</position>\n`;
    }

    if (node.type) xml += `    <type>${node.type}</type>\n`;
    
    if (node.upgrades?.length > 0) {
      xml += `    <upgrades>\n`;
      node.upgrades.forEach((item) => {
        xml += `      <li>${item}</li>\n`;
      });
      xml += `    </upgrades>\n`;
    }
    
    if (node.path) xml += `    <path>${node.path}</path>\n`;

    // Update connections with new IDs
    const updatedConnections = updateConnections(node.connections, idMapping);
    if (updatedConnections.length > 0) {
      xml += `    <connections>\n`;
      updatedConnections.forEach(conn => {
        xml += `      <li>${conn}</li>\n`;
      });
      xml += `    </connections>\n`;
    }

    // Update branchPaths with new IDs
    const updatedBranchPaths = updateBranchPaths(node.branchPaths, idMapping);
    if (updatedBranchPaths.length > 0) {
      xml += `    <branchPaths>\n`;
      updatedBranchPaths.forEach(branch => {
        xml += `      <li>\n`;
        xml += `        <path>${branch.path}</path>\n`;
        xml += `        <nodes>\n`;
        branch.nodes.forEach(nodeId => {
          xml += `          <li>${nodeId}</li>\n`;
        });
        xml += `        </nodes>\n`;
        xml += `      </li>\n`;
      });
      xml += `    </branchPaths>\n`;
    }
    
    xml += `  </${defType}>\n\n`;
  });
  
  // Clear the export state after we're done
  exportState.idMapping = null;
  
  return xml;
};

export const importFromXml = (xmlContents, config = DefTypeConfig) => {
  const parser = new DOMParser();
  const nodes = [];
  const paths = [];

  xmlContents.forEach(content => {
    const xmlDoc = parser.parseFromString(content, "text/xml");
    const pathDefType = getFullDefName(config.PATH);
    const nodeDefType = getFullDefName(config.NODE);

    Array.from(xmlDoc.getElementsByTagName(pathDefType)).forEach(pathDef => {
      paths.push({
        id : pathDef.getElementsByTagName("defName")[0].textContent,
        name: pathDef.getElementsByTagName("defName")[0].textContent,
        description: pathDef.getElementsByTagName("pathDescription")[0]?.textContent || '',
        exclusiveWith: Array.from(pathDef.getElementsByTagName("exclusiveWith")[0]?.getElementsByTagName("li") || [])
          .map(li => li.textContent)
      });
    })

    Array.from(xmlDoc.getElementsByTagName(nodeDefType)).forEach(nodeDef => {
      const position = nodeDef.getElementsByTagName("position")[0]?.textContent || "(0,0)";
      const [x, y] = position.replace(/[()]/g, '').split(',').map(n => parseInt(n) * 50);

      const connections = Array.from(nodeDef.getElementsByTagName("connections")[0]?.getElementsByTagName("li") || [])
        .map(li => li.textContent);

      // Read upgrades as a list of li elements
      const upgrades = Array.from(nodeDef.getElementsByTagName("upgrades")[0]?.getElementsByTagName("li") || [])
        .map(li => li.textContent);

      const branchPaths = Array.from(nodeDef.getElementsByTagName("branchPaths")[0]?.getElementsByTagName("li") || [])
        .map(branchElem => ({
          path: branchElem.getElementsByTagName("path")[0]?.textContent || '',
          nodes: Array.from(branchElem.getElementsByTagName("nodes")[0]?.getElementsByTagName("li") || [])
            .map(li => li.textContent)
        }));

      nodes.push({
        id: nodeDef.getElementsByTagName("defName")[0].textContent,
        label: nodeDef.getElementsByTagName("label")[0]?.textContent || "DisplayLabel",
        type: nodeDef.getElementsByTagName("type")[0]?.textContent || "Normal",
        points: nodeDef.getElementsByTagName("pointCost")?.textContent || 1,
        x,
        y,
        connections,
        path: nodeDef.getElementsByTagName("path")[0]?.textContent || "",
        upgrades: upgrades.length > 0 ? upgrades : undefined,
        branchPaths
      });
    });
  });

  return { nodes, paths };
};

export const serializeProperty = (key, value, indent) => {
  const spaces = ' '.repeat(indent * 2);

  if (Array.isArray(value)) {
    if (value.length === 0) return '';
    let xml = `${spaces}<${key}>\n`;
    value.forEach(item => {
      if (typeof item === 'object') {
        xml += `${spaces}  <li>\n`;
        Object.entries(item).forEach(([k, v]) => {
          xml += serializeProperty(k, v, indent + 2);
        });
        xml += `${spaces}  </li>\n`;
      } else {
        xml += `${spaces}  <li>${item}</li>\n`;
      }
    });
    xml += `${spaces}</${key}>\n`;
    return xml;
  }

  if (typeof value === 'object' && value !== null) {
    let xml = `${spaces}<${key}>\n`;
    Object.entries(value).forEach(([k, v]) => {
      xml += serializeProperty(k, v, indent + 1);
    });
    xml += `${spaces}</${key}>\n`;
    return xml;
  }

  if (value !== undefined && value !== '') {
    return `${spaces}<${key}>${value}</${key}>\n`;
  }

  return '';
};
