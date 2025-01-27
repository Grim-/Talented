import { StorageUtils } from './StorageUtils';
import {Node} from '../components/Node';

//DATA STRUCTUR
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

const exportState = {
  idMapping: null
};


export const DefTypeConfig = {
  NODE: 'TalentTreeNodeDef',
  TREE: 'TalentTreeDef',
  PATH: 'TalentPathDef',
  UPGRADE: 'TalentDef',
  GENE: 'TalentedGeneDef'
};

export const createEmptyTalentDef = () => ({
  defName: '',
  type: 'TalentDef',
  description: '',
  pointCost: 1,
  prerequisites: [],
  statEffects: [],
  hediffEffects: [],
  abilityEffects: [],
  organEffects: [],
  pathPrerequisites: [],
  pathExclusions: []
});

export const createEmptyPathDef = () => ({
  defName: '',
  type: 'TalentPathDef',
  description: '',
  color: '#000000',
  exclusiveWith: []
});

export const NamespaceConfig = {
  prefix: 'Talented',
  separator: '.'
};



//HELPERS
export const getFullDefName = (defType) => {
  return `${NamespaceConfig.prefix}${NamespaceConfig.separator}${defType}`;
};

export const stripNamespace = (fullDefType) => {
  return fullDefType.replace(`${NamespaceConfig.prefix}${NamespaceConfig.separator}`, '');
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

export const handleXmlImport = async (event, savedDefs, setSavedDefs, config = DefTypeConfig) => {
  const files = event.target.files;
  let newDefs = { ...savedDefs };

  for (const file of Array.from(files)) {
    try {
      const text = await file.text();
      const xmlDoc = new DOMParser().parseFromString(text, "text/xml");
      const allElements = xmlDoc.getElementsByTagName('*');

      for (const element of Array.from(allElements)) {
        // First handle TalentTreeDef's paths as TalentPathDefs
        if (element.tagName === 'Talented.TalentTreeDef') {
          const availablePaths = element.getElementsByTagName('availablePaths')[0];
          if (availablePaths) {
            if (!newDefs['TalentPathDef']) {
              newDefs['TalentPathDef'] = {};
            }

            Array.from(availablePaths.getElementsByTagName('li')).forEach(pathElement => {
              const name = pathElement.getElementsByTagName('name')[0]?.textContent;
              if (!name) return;

              const pathDef = {
                defName: name,
                type: 'TalentPathDef',
                description: pathElement.getElementsByTagName('pathDescription')[0]?.textContent || '',
                pathUIIcon: pathElement.getElementsByTagName('pathUIIcon')[0]?.textContent || '',
                exclusiveWith: Array.from(pathElement.getElementsByTagName('exclusiveWith')[0]?.getElementsByTagName('li') || [])
                  .map(li => li.textContent)
              };

              // Handle color conversion
              const colorElement = pathElement.getElementsByTagName('pathColor')[0];
              if (colorElement) {
                const colorText = colorElement.textContent;
                const match = colorText.match(/\(([\d.]+),([\d.]+),([\d.]+)\)/);
                if (match) {
                  const [_, r, g, b] = match;
                  const toHex = (n) => Math.round(parseFloat(n) * 255).toString(16).padStart(2, '0');
                  pathDef.color = `#${toHex(r)}${toHex(g)}${toHex(b)}`;
                }
              }

              newDefs['TalentPathDef'][name] = pathDef;
            });
          }
        }

        // Then handle normal defs as before
        Object.values(config).forEach(defType => {
          const fullDefType = getFullDefName(defType);
          if (element.tagName === fullDefType) {
            const defName = element.getElementsByTagName("defName")[0]?.textContent;
            if (!defName) return;

            if (!newDefs[defType]) {
              newDefs[defType] = {};
            }

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

            newDefs[defType] = {
              ...newDefs[defType],
              [defName]: def
            };
          }
        });
      }
    } catch (e) {
      console.error(`Error parsing ${file.name}:`, e);
    }
  }

  console.log("Current savedDefs:", savedDefs);
  console.log("New merged defs:", newDefs);
  setSavedDefs(newDefs);

  event.target.value = '';
};
// export const handleXmlImport = async (event, savedDefs, setSavedDefs, config = DefTypeConfig) => {
//   const files = event.target.files;
//   let newDefs = { ...savedDefs };

//   for (const file of Array.from(files)) {
//     try {
//       const text = await file.text();
//       const xmlDoc = new DOMParser().parseFromString(text, "text/xml");
//       const allElements = xmlDoc.getElementsByTagName('*');

//       for (const element of Array.from(allElements)) {
//         // Check if this is a TalentTreeDef and process its paths
//         if (element.tagName === 'Talented.TalentTreeDef') {
//           const availablePaths = element.getElementsByTagName('availablePaths')[0];
//           if (availablePaths) {
//             const pathElements = availablePaths.getElementsByTagName('li');
//             Array.from(pathElements).forEach(pathElement => {
//               const name = pathElement.getElementsByTagName('name')[0]?.textContent;
//               if (!name) return;

//               if (!newDefs['TalentPathDef']) {
//                 newDefs['TalentPathDef'] = {};
//               }

//               // Create path def using the same pattern as other defs
//               const pathDef = {
//                 defName: name,
//                 type: 'TalentPathDef',
//                 description: pathElement.getElementsByTagName('pathDescription')[0]?.textContent || '',
//                 pathUIIcon: pathElement.getElementsByTagName('pathUIIcon')[0]?.textContent || ''
//               };

//               // Handle color conversion from (R,G,B) format
//               const colorElement = pathElement.getElementsByTagName('pathColor')[0];
//               if (colorElement) {
//                 const colorText = colorElement.textContent;
//                 const match = colorText.match(/\(([\d.]+),([\d.]+),([\d.]+)\)/);
//                 if (match) {
//                   const [_, r, g, b] = match;
//                   const toHex = (n) => Math.round(parseFloat(n) * 255).toString(16).padStart(2, '0');
//                   pathDef.color = `#${toHex(r)}${toHex(g)}${toHex(b)}`;
//                 }
//               }

//               // Handle exclusiveWith array
//               const exclusiveWith = pathElement.getElementsByTagName('exclusiveWith')[0];
//               if (exclusiveWith) {
//                 pathDef.exclusiveWith = Array.from(exclusiveWith.getElementsByTagName('li'))
//                   .map(li => li.textContent)
//                   .filter(Boolean);
//               }

//               // Merge with existing paths
//               newDefs['TalentPathDef'] = {
//                 ...newDefs['TalentPathDef'],
//                 [name]: pathDef
//               };
//             });
//           }
//         }

//         // Original def processing
//         Object.values(config).forEach(defType => {
//           const fullDefType = getFullDefName(defType);
//           if (element.tagName === fullDefType) {
//             const defName = element.getElementsByTagName("defName")[0]?.textContent;
//             if (!defName) return;

//             if (!newDefs[defType]) {
//               newDefs[defType] = {};
//             }

//             const def = { defName, type: defType };
//             Array.from(element.children).forEach(child => {
//               if (child.tagName === 'defName') return;
//               if (!child.children.length) {
//                 def[child.tagName] = child.textContent;
//                 return;
//               }
//               const liElements = Array.from(child.getElementsByTagName('li'));
//               if (liElements.length) {
//                 def[child.tagName] = liElements.map(li => {
//                   if (!li.children.length) return li.textContent;
//                   return Array.from(li.children).reduce((obj, prop) => ({
//                     ...obj,
//                     [prop.tagName]: prop.textContent
//                   }), {});
//                 });
//                 return;
//               }
//               def[child.tagName] = Array.from(child.children).reduce((obj, prop) => ({
//                 ...obj,
//                 [prop.tagName]: prop.textContent
//               }), {});
//             });

//             newDefs[defType] = {
//               ...newDefs[defType],
//               [defName]: def
//             };
//           }
//         });
//       }
//     } catch (e) {
//       console.error(`Error parsing ${file.name}:`, e);
//     }
//   }

//   console.log("Current savedDefs:", savedDefs);
//   console.log("New merged defs:", newDefs);
//   setSavedDefs(newDefs);

//   event.target.value = '';
// };

export const exportToXml = (nodes, paths, treeName, treeSkinDefName, treeSize, treeDisplayStrat, treePointsFormula, treeHandler, config = DefTypeConfig) => {
  try {
    exportState.idMapping = null;
    
    const usedPaths = new Set(nodes.map(node => node.path).filter(Boolean));
    const allPaths = [...paths];

    usedPaths.forEach(pathName => {
      if (!paths.find(p => p.name === pathName)) {
        allPaths.push({
          name: pathName
        });
      }
    });


    const updatedTreeName = treeName || 'NoTreeName';
    // Create tree and nodes XML, using exportPaths for path definitions
    const treeXml = '<?xml version="1.0" encoding="utf-8" ?>\n<Defs>\n' +
      exportTalentTree(nodes, allPaths, updatedTreeName, treeSize, treeSkinDefName, treeDisplayStrat, treePointsFormula, treeHandler) +
      exportNodes(nodes, treeSize, config) +
      '</Defs>';



    // Download tree file
    const treeBlob = new Blob([treeXml], { type: 'text/xml' });
    const treeUrl = URL.createObjectURL(treeBlob);
    const treeLink = document.createElement('a');
    treeLink.href = treeUrl;
    treeLink.download = `${updatedTreeName}_Tree.xml`;
    document.body.appendChild(treeLink);
    treeLink.click();
    document.body.removeChild(treeLink);
    URL.revokeObjectURL(treeUrl);

    return treeXml;
  } catch (error) {
    exportState.idMapping = null;
    throw error;
  }
};
// export const exportToXml = (nodes, paths, treeName, treeSkinDefName, treeSize, treeDisplayStrat, treePointsFormula, treeHandler, config = DefTypeConfig) => {
//   try {
//     exportState.idMapping = null;
    
//     const usedPaths = new Set(nodes.map(node => node.path).filter(Boolean));
//     const allPaths = [...paths];

//     usedPaths.forEach(pathName => {
//       console.log(pathName);
//       if (!paths.find(p => p.name === pathName)) {
//         allPaths.push({
//           name: pathName,
//           description: '',
//           exclusiveWith: []
//         });
//       }
//     });

//     // Create tree and nodes XML
//     const treeXml = '<?xml version="1.0" encoding="utf-8" ?>\n<Defs>\n' +
//       exportTalentTree(nodes, allPaths, treeName, treeSize, treeSkinDefName, treeDisplayStrat, treePointsFormula, treeHandler) +
//       exportNodes(nodes, treeSize, config) +
//       '</Defs>';

//     const updatedTreeName = treeName || 'NoTreeName';

//     // Create paths XML if there are any paths
//     if (allPaths.length > 0) {
//       const pathsXml = '<?xml version="1.0" encoding="utf-8" ?>\n<Defs>\n' +
//         exportPaths(allPaths, config) +
//         '</Defs>';

//       // Download paths file
//       const pathsBlob = new Blob([pathsXml], { type: 'text/xml' });
//       const pathsUrl = URL.createObjectURL(pathsBlob);
//       const pathsLink = document.createElement('a');
//       pathsLink.href = pathsUrl;
//       pathsLink.download = `${updatedTreeName}_Paths.xml`;
//       document.body.appendChild(pathsLink);
//       pathsLink.click();
//       document.body.removeChild(pathsLink);
//       URL.revokeObjectURL(pathsUrl);
//     }

//     // Download tree file
//     const treeBlob = new Blob([treeXml], { type: 'text/xml' });
//     const treeUrl = URL.createObjectURL(treeBlob);
//     const treeLink = document.createElement('a');
//     treeLink.href = treeUrl;
//     treeLink.download = `${updatedTreeName}_Tree.xml`;
//     document.body.appendChild(treeLink);
//     treeLink.click();
//     document.body.removeChild(treeLink);
//     URL.revokeObjectURL(treeUrl);

//     return treeXml;
//   } 

//   catch (error) 
//   {
//     exportState.idMapping = null;
//     throw error;
//   }
// };



const exportTalentTree = (nodes, paths, treeName, treeSize, treeSkinDefName, treeDisplayStrat, treePointsFormula, treeHandler) => {
  exportState.idMapping = createIdMapping(nodes);
  
  const fullDefType = getFullDefName(DefTypeConfig.TREE);
  let xml = `  <${fullDefType}>\n`;
  xml += `    <defName>${treeName}</defName>\n`;
  xml += `    <dimensions>(${treeSize.width},${treeSize.height})</dimensions>\n`;
  xml += `    <handlerClass>${treeHandler}</handlerClass>\n`;
  xml += `    <skin>${treeSkinDefName || 'DefaultTreeSkin'}</skin>\n`;

  // Root nodes
  xml += '    <nodes>\n';
  nodes.filter(node => node.type === 'Start')
       .forEach(node => {
         const newId = exportState.idMapping.get(node.id);
         xml += `      <li>${newId}</li>\n`;
       });
  xml += '    </nodes>\n';
  
  // Available paths with full data from storage
  xml += '    <availablePaths>\n';
  paths?.forEach(path => {
    const storedPath = StorageUtils.getSingleDef('TalentPathDef', path.name);
    if (!storedPath) return;
    
    xml += '      <li>\n';
    xml += `        <name>${storedPath.defName}</name>\n`;
    xml += `        <pathDescription>${storedPath.description || ''}</pathDescription>\n`;
    if (storedPath.pathUIIcon) {
      xml += `        <pathUIIcon>${storedPath.pathUIIcon}</pathUIIcon>\n`;
    }
    if (storedPath.color) {
      const rgb = hexToRGB(storedPath.color);
      xml += `        <pathColor>(${rgb.r},${rgb.g},${rgb.b})</pathColor>\n`;
    }
    xml += '        <exclusiveWith>\n';
    if (Array.isArray(storedPath.exclusiveWith) && storedPath.exclusiveWith.length > 0) {
      storedPath.exclusiveWith.forEach(exclusivePath => {
        xml += `          <li>${exclusivePath}</li>\n`;
      });
    }
    xml += '        </exclusiveWith>\n';
    xml += '      </li>\n';
  });
  xml += '    </availablePaths>\n';

  xml += `    <displayStrategy>${treeDisplayStrat}</displayStrategy>\n`;
  xml += `    <talentPointFormula>${treePointsFormula}</talentPointFormula>\n`;
  xml += `  </${fullDefType}>\n\n`;
  
  return xml;
};
const hexToRGB = (hex) => {
  // Remove the # if present
  hex = hex.replace('#', '');
  
  // Convert to RGB values 0-1
  const r = parseInt(hex.substring(0, 2), 16) / 255;
  const g = parseInt(hex.substring(2, 4), 16) / 255;
  const b = parseInt(hex.substring(4, 6), 16) / 255;
  
  return { r, g, b };
};
const generateTalentDefXml = (talentDef) => {
  let xml = `  <${getFullDefName('TalentDef')}>\n`;
  xml += `    <defName>${talentDef.defName}</defName>\n`;
  xml += `    <label>${talentDef.label}</label>\n`;
  xml += `    <levelRequired>${talentDef.levelRequired || 0}</levelRequired>\n`;
  xml += `    <pointCost>${talentDef.pointCost || 1}</pointCost>\n`;
  
  if (talentDef.uiIconPath) {
    xml += `    <uiIconPath>${talentDef.uiIconPath}</uiIconPath>\n`;
  }

  if (talentDef.DescriptionString) {
    xml += `    <DescriptionString>${talentDef.DescriptionString}</DescriptionString>\n`;
  }
  
  if (talentDef.prerequisites?.length > 0) {
    xml += `    <prerequisites>\n`;
    talentDef.prerequisites.forEach(prereq => {
      xml += `      <li>${prereq.defName}</li>\n`;
    });
    xml += `    </prerequisites>\n`;
  }
  
  if (talentDef.hediffEffects?.length > 0) {
    xml += `    <hediffEffects>\n`;
    talentDef.hediffEffects.forEach(effect => {
      xml += `      <li>\n`;
      xml += `        <hediffDef>${effect.hediffDef}</hediffDef>\n`;
      xml += `      </li>\n`;
    });
    xml += `    </hediffEffects>\n`;
  }
  
  if (talentDef.abilityEffects?.length > 0) {
    xml += `    <abilityEffects>\n`;
    xml += `      <li>\n`;
    xml += `        <abilities>\n`;
    // Filter out any undefined abilities before generating XML
    const validAbilities = talentDef.abilityEffects.filter(ability => ability.abilityDef);
    validAbilities.forEach(ability => {
      xml += `          <li>\n`;
      xml += `            <abilityDef>${ability.abilityDef}</abilityDef>\n`;
      xml += `          </li>\n`;
    });
    xml += `        </abilities>\n`;
    xml += `      </li>\n`;
    xml += `    </abilityEffects>\n`;
  }
  
  if (talentDef.organEffects?.length > 0) {
    xml += `    <organEffects>\n`;
    talentDef.organEffects.forEach(effect => {
      xml += `      <li>\n`;
      xml += `        <targetOrgan>${effect.targetOrgan}</targetOrgan>\n`;
      xml += `        <addedOrganHediff>${effect.addedOrganHediff}</addedOrganHediff>\n`;
      xml += `        <isAddition>${effect.isAddition}</isAddition>\n`;
      xml += `      </li>\n`;
    });
    xml += `    </organEffects>\n`;
  }
  
  if (talentDef.statEffects?.length > 0) {
    xml += `    <statEffects>\n`;
    talentDef.statEffects.forEach(effect => {
      if (effect.statDef && effect.value && effect.operation) {
        xml += `      <li>\n`;
        xml += `        <statDef>${effect.statDef}</statDef>\n`;
        xml += `        <value>${effect.value}</value>\n`;
        xml += `        <operation>${effect.operation}</operation>\n`;
        xml += `      </li>\n`;
      }
    });
    xml += `    </statEffects>\n`;
  }
  
  xml += `  </${getFullDefName('TalentDef')}>\n`;
  return xml;
};

const generateTalentPathDefXml = (pathDef) => {
  const referenceDefs = JSON.parse(localStorage.getItem('nodeEditorReferenceDefs') || '[]');
  const referenceDef = referenceDefs.find(def => def.defName === pathDef.name);
  
  let pathData;
  if (referenceDef) {
    const exclusiveWith = Array.isArray(referenceDef.exclusiveWith) 
      ? referenceDef.exclusiveWith 
      : (referenceDef.properties?.exclusiveWith || []);
      
    pathData = {
      name: referenceDef.defName,
      description: referenceDef.pathDescription || referenceDef.description || pathDef.description || '',
      exclusiveWith: exclusiveWith
    };
  } else {
    const storedDef = StorageUtils.getSingleDef('TalentPathDef', pathDef.name);
    if (storedDef) {
      const exclusiveWith = Array.isArray(storedDef.exclusiveWith) 
        ? storedDef.exclusiveWith 
        : (storedDef.properties?.exclusiveWith || []);
        
      pathData = {
        name: storedDef.defName,
        description: storedDef.description || pathDef.description || '',
        exclusiveWith: exclusiveWith
      };
    } else {
      pathData = pathDef;
    }
  }

  let xml = `  <TalentPathDef>\n`;
  xml += `    <defName>${pathData.name}</defName>\n`;
  xml += `    <label>${pathData.label || pathData.name}</label>\n`;
  xml += `    <pathDescription>${pathData.description || ''}</pathDescription>\n`;
  xml += `    <pathUIIcon>${pathData.pathUIIcon || ''}</pathUIIcon>\n`;
  
  if (pathData.pathColor && typeof pathData.pathColor === 'object') {
    xml += `    <pathColor>(${pathData.pathColor.r},${pathData.pathColor.g},${pathData.pathColor.b})</pathColor>\n`;
  }
  
  if (Array.isArray(pathData.exclusiveWith) && pathData.exclusiveWith.length > 0) {
    xml += `    <exclusiveWith>\n`;
    pathData.exclusiveWith.forEach(exclusive => {
      xml += `      <li>${exclusive.defName || exclusive}</li>\n`;
    });
    xml += `    </exclusiveWith>\n`;
  }
  
  xml += `  </TalentPathDef>\n`;
  return xml;
};

export const exportDefEditorDefs = (exportType = 'ALL') => {
  const createXmlWrapper = (content) => {
    return '<?xml version="1.0" encoding="utf-8" ?>\n<Defs>\n' + content + '</Defs>';
  };
  
  const downloadFile = (content, filename) => {
    const blob = new Blob([content], { type: 'text/xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const talentDefs = StorageUtils.getDefsOfType('TalentDef');
  const pathDefs = StorageUtils.getDefsOfType('TalentPathDef');

  const generateTalentPathDefXml = (pathDef) => {
    const referenceDefs = JSON.parse(localStorage.getItem('nodeEditorReferenceDefs') || '[]');
    const referenceDef = referenceDefs.find(def => def.defName === pathDef.defName);
    
    let pathData;
    if (referenceDef) {
      const exclusiveWith = Array.isArray(referenceDef.exclusiveWith) 
        ? referenceDef.exclusiveWith 
        : (referenceDef.properties?.exclusiveWith || []);
        
      pathData = {
        name: referenceDef.defName,
        description: referenceDef.pathDescription || referenceDef.description || '',
        exclusiveWith: exclusiveWith
      };
    } else {
      const storedDef = StorageUtils.getSingleDef('TalentPathDef', pathDef.defName);
      if (storedDef) {
        const exclusiveWith = Array.isArray(storedDef.exclusiveWith) 
          ? storedDef.exclusiveWith 
          : (storedDef.properties?.exclusiveWith || []);
          
        pathData = {
          name: storedDef.defName,
          description: storedDef.description || '',
          exclusiveWith: exclusiveWith
        };
      } else {
        pathData = pathDef;
      }
    }

    let xml = `  <${getFullDefName('TalentPathDef')}>\n`;
    xml += `    <defName>${pathData.name}</defName>\n`;
    xml += `    <label>${pathData.label || pathData.name}</label>\n`;
    xml += `    <pathDescription>${pathData.description || ''}</pathDescription>\n`;
    xml += `    <pathUIIcon>${pathData.pathUIIcon || ''}</pathUIIcon>\n`;
    
    if (pathData.pathColor && typeof pathData.pathColor === 'object') {
      xml += `    <pathColor>(${pathData.pathColor.r},${pathData.pathColor.g},${pathData.pathColor.b})</pathColor>\n`;
    }
    
    if (Array.isArray(pathData.exclusiveWith) && pathData.exclusiveWith.length > 0) {
      xml += `    <exclusiveWith>\n`;
      pathData.exclusiveWith.forEach(exclusive => {
        xml += `      <li>${exclusive.defName || exclusive}</li>\n`;
      });
      xml += `    </exclusiveWith>\n`;
    }
    
    xml += `  </${getFullDefName('TalentPathDef')}>\n`;
    return xml;
  };

  switch(exportType) {
    case 'TALENTS':
      if (Object.keys(talentDefs).length > 0) {
        const talentXml = createXmlWrapper(
          Object.values(talentDefs)
            .map(def => generateTalentDefXml(def))
            .join('\n')
        );
        downloadFile(talentXml, 'TalentDefs.xml');
      }
      break;

    case 'PATHS':
      if (Object.keys(pathDefs).length > 0) {
        const pathXml = createXmlWrapper(
          Object.values(pathDefs)
            .map(def => generateTalentPathDefXml(def))
            .join('\n')
        );
        downloadFile(pathXml, 'PathDefs.xml');
      }
      break;

    default: // ALL
      if (Object.keys(talentDefs).length > 0) {
        const talentXml = createXmlWrapper(
          Object.values(talentDefs)
            .map(def => generateTalentDefXml(def))
            .join('\n')
        );
        downloadFile(talentXml, 'TalentDefs.xml');
      }
      
      if (Object.keys(pathDefs).length > 0) {
        const pathXml = createXmlWrapper(
          Object.values(pathDefs)
            .map(def => generateTalentPathDefXml(def))
            .join('\n')
        );
        downloadFile(pathXml, 'PathDefs.xml');
      }
  }
};


export const exportPaths = (paths, config) => {
  // Get reference definitions first
  const referenceDefs = JSON.parse(localStorage.getItem('nodeEditorReferenceDefs') || '[]');
  
  const getPathData = (path) => {
    // First check reference defs
    const referenceDef = referenceDefs.find(def => def.defName === path.name);
    
    if (referenceDef) {
      // Make sure we get the exclusiveWith array, defaulting to empty array if not present
      const exclusiveWith = Array.isArray(referenceDef.exclusiveWith) 
        ? referenceDef.exclusiveWith 
        : (referenceDef.properties?.exclusiveWith || []);
        
      return {
        name: referenceDef.defName,
        description: referenceDef.pathDescription || referenceDef.description || path.description || '',
        exclusiveWith: exclusiveWith
      };
    }
    
    // Also check StorageUtils defs as fallback
    const storedDef = StorageUtils.getSingleDef('TalentPathDef', path.name);
    if (storedDef) {
      const exclusiveWith = Array.isArray(storedDef.exclusiveWith) 
        ? storedDef.exclusiveWith 
        : (storedDef.properties?.exclusiveWith || []);
        
      return {
        name: storedDef.defName,
        description: storedDef.description || path.description || '',
        exclusiveWith: exclusiveWith
      };
    }
    
    // If no defs found, use original path data
    return path;
  };

  const validatedPaths = paths;
  
  let xml = '';
  validatedPaths.forEach(path => {
    const pathData = getPathData(path);
    
    xml += '<Talented.TalentPathDef>\n';
    xml += `    <defName>${pathData.name}</defName>\n`;
    xml += `    <pathDescription>${pathData.description}</pathDescription>\n`;
    xml += `    <exclusiveWith>\n`;

    // Make sure exclusiveWith is an array before trying to iterate
    const exclusiveWith = Array.isArray(pathData.exclusiveWith) ? pathData.exclusiveWith : [];
    if (exclusiveWith.length > 0) {
      exclusiveWith.forEach(exclusivePath => {
        xml += `      <li>${exclusivePath}</li>\n`;
      });
    }

    xml += `    </exclusiveWith>\n`;
    xml += `  </Talented.TalentPathDef>\n\n`;
  });
  
  return xml;
};


export const importFromXml = (xmlContents, setTreeName, setTreeSize, setTreeHandler, setTreeDisplay) => {
  const parser = new DOMParser();
  const nodes = [];
  const paths = [];

  xmlContents.forEach(content => {
    const xmlDoc = parser.parseFromString(content, "text/xml");
    
    // First get tree dimensions for scaling
    const treeDef = xmlDoc.getElementsByTagName('Talented.TalentTreeDef')[0];
    let treeWidth = 600, treeHeight = 400; // defaults
    
    if (treeDef) {
      const dimensions = treeDef.getElementsByTagName('dimensions')[0]?.textContent;
      if (dimensions) {
        const match = dimensions.match(/\((\d+),(\d+)\)/);
        if (match) {
          const [, width, height] = match;
          treeWidth = Number(width);
          treeHeight = Number(height);

          setTreeName("wwwwwwww");
          setTreeSize({width: treeWidth || 600, height: treeHeight || 400})
        }
      }
    }

    // Process paths first
    const availablePaths = treeDef?.getElementsByTagName('availablePaths')[0];
    if (availablePaths) {
      Array.from(availablePaths.getElementsByTagName('li')).forEach(pathElement => {
        const name = pathElement.getElementsByTagName('name')[0]?.textContent;
        if (!name) return;

        // Create the path def for storage
        const pathDef = {
          defName: name,
          type: 'TalentPathDef',
          pathDescription: pathElement.getElementsByTagName('pathDescription')[0]?.textContent || '',
          exclusiveWith: Array.from(pathElement.getElementsByTagName('exclusiveWith')[0]?.getElementsByTagName('li') || [])
            .map(li => li.textContent)
        };

        // Handle color
        const colorElement = pathElement.getElementsByTagName('pathColor')[0];
        if (colorElement) {
          const colorText = colorElement.textContent;
          const match = colorText.match(/\(([\d.]+),([\d.]+),([\d.]+)\)/);
          if (match) {
            const [, r, g, b] = match;
            const toHex = (n) => Math.round(parseFloat(n) * 255).toString(16).padStart(2, '0');
            pathDef.color = `#${toHex(r)}${toHex(g)}${toHex(b)}`;
          }
        }

        // Store in def storage if it doesn't exist
        if (!StorageUtils.getSingleDef('TalentPathDef', name)) {
          StorageUtils.saveSingleDefOfType('TalentPathDef', name, pathDef);
        }

        // Add to paths array for node editor state
        paths.push({
          name,
          description: pathDef.pathDescription,
          color: pathDef.color || '#000000'
        });
      });
    }

    // Process nodes with scaled positions
    const nodeDefs = xmlDoc.getElementsByTagName('Talented.TalentTreeNodeDef');
    Array.from(nodeDefs).forEach(nodeDef => {

      const node = Node.fromXmlDef(nodeDef);

      // Get the position string from XML e.g. "(252,320)"
      const positionStr = nodeDef.getElementsByTagName('position')[0]?.textContent;
      const match = positionStr.match(/\((\d+),(\d+)\)/);
      
      if (match) {
        // Extract the scaled coordinates from XML
        const scaledX = parseInt(match[1]);
        const scaledY = parseInt(match[2]);
        
        // Convert back to canvas coordinates
        const canvasDiv = document.getElementById('mainContent');
        const canvasWidth = canvasDiv.clientWidth;
        const canvasHeight = canvasDiv.clientHeight;
        
        // Use inverse of export scaling
        const scaleX = canvasWidth / treeWidth;
        const scaleY = canvasHeight / treeHeight;
        
        // Set node position using unscaled coordinates
        node.x = Math.round(scaledX * scaleX);
        node.y = Math.round(scaledY * scaleY);
      }
      
      if (node) nodes.push(node);
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