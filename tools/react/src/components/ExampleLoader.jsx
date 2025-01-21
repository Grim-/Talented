import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { importFromXml } from '../utils/xmlSerializer';

const ExampleLoader = ({ setNodes, setPaths, setTreeName, setTreeSize, setTreeDisplay, setTreePointStrategy }) => {
  const { exampleName } = useParams();

  useEffect(() => {
    const loadExample = async () => {
      try {
        const response = await fetch(`${process.env.PUBLIC_URL}/examples/${exampleName}.xml`);
        const xmlContent = await response.text();
        
        const { nodes, paths, treeName, treeSize, displayStrategy, pointStrategy } = 
          importFromXml([xmlContent]);
        
        setNodes(nodes);
        setPaths(paths);
        if (treeName) setTreeName(treeName);
        if (treeSize) setTreeSize(treeSize);
        if (displayStrategy) setTreeDisplay(displayStrategy);
        if (pointStrategy) setTreePointStrategy(pointStrategy);
      } catch (error) {
        console.error('Error loading example tree:', error);
      }
    };

    if (exampleName) {
      loadExample();
    }
  }, [exampleName]);

  return null;
};

export default ExampleLoader;