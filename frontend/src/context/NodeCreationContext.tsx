import React, { createContext, useContext, useState } from 'react';

interface NodeCreationContextProps {
  isCreatingNode: boolean;
  startCreatingNode: () => void;
  stopCreatingNode: () => void;
}

const NodeCreationContext = createContext<NodeCreationContextProps | undefined>(
  undefined,
);

/**
 * Using react context to keep track of node creation state to avoid prop drilling.
 * The components that need to know if a node is being created/edited:
 * - EditLearningPath: don't allow user to try to create another node while one is being created
 * - NodeComponent: can't display an AddNodeButton if a node is being created
 * - AddNodeButton: show the plus icon to create a new node if one is not being created, otherwise show that a node will be created at that spot
 * - CreateLearningObject: show the form to create a new node if one is being created, will confirm/cancel creation from here
 */
export const NodeCreationProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [isCreatingNode, setIsCreatingNode] = useState(false);

  const startCreatingNode = () => setIsCreatingNode(true);
  // todo: should add node to db (ideally we should work with drafts in the backend, but changes are immediate for now)
  const stopCreatingNode = () => setIsCreatingNode(false);

  return (
    <NodeCreationContext.Provider
      value={{ isCreatingNode, startCreatingNode, stopCreatingNode }}
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
