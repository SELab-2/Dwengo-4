import React, { createContext, useContext, useState } from 'react';

interface NodeCreationContextProps {
  isAddingNode: boolean;
  currentNodeId?: string;
  startCreatingNode: (nodeId: string | undefined) => void;
  stopCreatingNode: () => void;
}

const NodeCreationContext = createContext<NodeCreationContextProps | undefined>(
  undefined,
);

/**
 * Using react context to keep track of node creation state to avoid prop drilling.
 */
export const NodeCreationProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [isAddingNode, setIsCreatingNode] = useState(false);
  const [currentNodeId, setCurrentNodeId] = useState<string | undefined>(
    undefined,
  );

  const startCreatingNode = (nodeId: string | undefined) => {
    setIsCreatingNode(true);
    setCurrentNodeId(nodeId);
  };
  // todo: should add node to db (ideally we should work with drafts in the backend, but changes are immediate for now)
  const stopCreatingNode = () => {
    setIsCreatingNode(false);
    setCurrentNodeId(undefined);
  };

  return (
    <NodeCreationContext.Provider
      value={{
        isAddingNode,
        currentNodeId,
        startCreatingNode,
        stopCreatingNode,
      }}
    >
      {children}
    </NodeCreationContext.Provider>
  );
};

export const useNodeCreationContext = () => {
  const context = useContext(NodeCreationContext);
  if (!context) {
    throw new Error(
      'useNodeCreation must be used within a NodeCreationProvider',
    );
  }
  return context;
};
