// utils/xmlSerializer.js - New file for XML handling
import { EditableDefTypes, DefStructures } from '../DefTypes';

export const serializeDefToXml = (def) => {
  let xml = `  <${def.type}>\n`;
  xml += `    <defName>${def.defName}</defName>\n`;

  Object.entries(def).forEach(([key, value]) => {
    if (key !== 'type' && key !== 'defName') {
      xml += serializeProperty(key, value, 2);
    }
  });

  xml += `  </${def.type}>\n\n`;
  return xml;
};
export const handleXmlImport = async (event, savedDefs, setSavedDefs) => {
  const files = event.target.files;
  let newDefs = { ...savedDefs };

  for (const file of Array.from(files)) {
    try {
      const text = await file.text();
      const xmlDoc = new DOMParser().parseFromString(text, "text/xml");

      Object.values(EditableDefTypes).forEach(defType => {
        Array.from(xmlDoc.getElementsByTagName(defType)).forEach(defNode => {
          const defName = defNode.getElementsByTagName("defName")[0]?.textContent;
          if (!defName) return;

          const def = { defName, type: defType };
          Array.from(defNode.children).forEach(child => {
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

          newDefs[defType] = { ...(newDefs[defType] || {}), [defName]: def };
        });
      });
    } catch (e) {
      console.error(`Error parsing ${file.name}:`, e);
    }
  }

  setSavedDefs(newDefs);
  event.target.value = '';
};
export const exportToXml = (nodes, paths) => {
  let xml = '<?xml version="1.0" encoding="utf-8" ?>\n<Defs>\n';

  paths?.forEach(path => {
    xml += `  <Talented.UpgradePathDef>\n`;
    xml += `    <defName>${path.name}</defName>\n`;
    xml += `    <pathDescription>${path.description}</pathDescription>\n`;
    xml += `  </Talented.UpgradePathDef>\n\n`;
  });

  nodes.forEach(node => {
    const defType = node.upgrade ? 'Talented.UpgradeTreeNodeDef' :
                   node.dimensions ? 'Talented.UpgradeTreeDef' :
                   node.pointCost ? 'Talented.UpgradeDef' :
                   'Talented.UpgradeTreeNodeDef';

    xml += `  <${defType}>\n`;
    xml += `    <defName>${node.id}</defName>\n`;

    if (node.x !== undefined) {
      xml += `    <position>(${Math.round(node.x/50)},${Math.round(node.y/50)})</position>\n`;
    }
    if (node.type) xml += `    <type>${node.type}</type>\n`;
    if (node.upgrade) xml += `    <upgrade>${node.upgrade}</upgrade>\n`;
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

export const importFromXml = (xmlContents) => {
  const parser = new DOMParser();
  const nodes = [];
  const paths = [];

  xmlContents.forEach(content => {
    const xmlDoc = parser.parseFromString(content, "text/xml");

    Array.from(xmlDoc.getElementsByTagName("Talented.UpgradePathDef")).forEach(pathDef => {
      paths.push({
        id: pathDef.getElementsByTagName("defName")[0].textContent,
        name: pathDef.getElementsByTagName("defName")[0].textContent,
        description: pathDef.getElementsByTagName("pathDescription")[0]?.textContent || ''
      });
    });

    Array.from(xmlDoc.getElementsByTagName("Talented.UpgradeTreeNodeDef")).forEach(nodeDef => {
      const position = nodeDef.getElementsByTagName("position")[0]?.textContent || "(0,0)";
      const [x, y] = position.replace(/[()]/g, '').split(',').map(n => parseInt(n) * 50);

      const connections = Array.from(nodeDef.getElementsByTagName("connections")[0]?.getElementsByTagName("li") || [])
        .map(li => li.textContent);

      const branchPaths = Array.from(nodeDef.getElementsByTagName("branchPaths")[0]?.getElementsByTagName("li") || [])
        .map(branchElem => ({
          path: branchElem.getElementsByTagName("path")[0]?.textContent || '',
          nodes: Array.from(branchElem.getElementsByTagName("nodes")[0]?.getElementsByTagName("li") || [])
            .map(li => li.textContent)
        }));

      nodes.push({
        id: nodeDef.getElementsByTagName("defName")[0].textContent,
        label: nodeDef.getElementsByTagName("defName")[0].textContent,
        type: nodeDef.getElementsByTagName("type")[0]?.textContent || "Normal",
        x,
        y,
        connections,
        path: nodeDef.getElementsByTagName("path")[0]?.textContent || "",
        upgrade: nodeDef.getElementsByTagName("upgrade")[0]?.textContent || "",
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
