import { useState, useCallback } from 'react';

export const useConnectionManager = (updateNode) => {
  const [connecting, setConnecting] = useState(null);

  const startConnection = useCallback((nodeId) => {
    setConnecting(nodeId);
  }, []);

  const completeConnection = useCallback((sourceId, targetId) => {
    if (sourceId && sourceId !== targetId) {
      updateNode(sourceId, node => ({
        ...node,
        connections: [...node.connections, targetId]
      }));
    }
    setConnecting(null);
  }, [updateNode]);

  return {
    connecting,
    startConnection,
    completeConnection
  };
};
