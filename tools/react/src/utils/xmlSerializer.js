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

export const exportToXml = (nodes, paths, treeName, config = DefTypeConfig) => {
  let xml = '<?xml version="1.0" encoding="utf-8" ?>\n<Defs>\n';

  // Add TalentTreeDef node
  xml += '  <Talented.TalentTreeDef>\n';
  xml += `    <defName>${treeName || 'GIVE_ME_A_PROPER_NAME'}</defName>\n`;
  xml += '    <dimensions>(450, 790)</dimensions>\n';
  xml += '    <nodes>\n';
  // Find and add root nodes
  nodes.filter(node => node.type === 'Start')
       .forEach(node => {
    xml += `      <li>${node.id}</li>\n`;
  });
  xml += '    </nodes>\n';
  xml += '    <availablePaths>\n';
  // Add all paths
  paths?.forEach(path => {
    xml += `      <li>${path.name}</li>\n`;
  });
  xml += '    </availablePaths>\n';
  xml += '    <displayStrategy>VerticalStrategy</displayStrategy>\n';
  xml += '    <talentPointFormula>PerLevel</talentPointFormula>\n';
  xml += '  </Talented.TalentTreeDef>\n\n';

  // Export paths
  paths?.forEach(path => {
    const pathDefType = getFullDefName(config.PATH);
    xml += `  <${pathDefType}>\n`;
    xml += `    <defName>${path.name}</defName>\n`;
    xml += `    <pathDescription>${path.description}</pathDescription>\n`;
    xml += `  </${pathDefType}>\n\n`;
  });

  // Export nodes
  nodes.forEach(node => {
    const defType = node.upgrade ? getFullDefName(config.NODE) :
                   node.dimensions ? getFullDefName(config.TREE) :
                   node.pointCost ? getFullDefName(config.UPGRADE) :
                   getFullDefName(config.NODE);

    xml += `  <${defType}>\n`;
    xml += `    <defName>${node.id}</defName>\n`;
    if (node.label) xml += `    <label>${node.label}</label>\n`;

    if (node.x !== undefined) {
      xml += `    <position>(${Math.round(node.x/50)},${Math.round(node.y/50)})</position>\n`;
    }

    xml += '    <pointCost>'+ (node.points === undefined ? 0 :  Math.max(0, Math.min(node.points, 100))) +'</pointCost>\n';

    if (node.type) xml += `    <type>${node.type}</type>\n`;
    if (node.upgrades) {
          xml += `    <upgrades>\n`;
          node.upgrades.forEach((item, i) => {
            xml += `      <li>${item}</li>\n`;
          });
          xml += `    </upgrades>\n`;
    }
    if (node.path) xml += `    <path>${node.path}</path>\n`;

    if (node.connections?.length > 0) {
      xml += `    <connections>\n`;
      node.connections.forEach(conn => {
        xml += `      <li>${conn}</li>\n`;
      });
      xml += `    </connections>\n`;
    }

    if (node.branchPaths?.length > 0) {
      xml += `    <branchPaths>\n`;
      node.branchPaths.forEach(branch => {
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

  xml += '</Defs>';
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
        id: pathDef.getElementsByTagName("defName")[0].textContent,
        name: pathDef.getElementsByTagName("defName")[0].textContent,
        description: pathDef.getElementsByTagName("pathDescription")[0]?.textContent || ''
      });
    });

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
