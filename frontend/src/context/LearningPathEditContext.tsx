import React, { createContext, useContext, useState } from 'react';
import { LearningPathNodeWithObject } from '../types/type';

// not yet added to the path, will be added once the user confirms entire learning path edit
export interface DraftNode {
  draftId: number; // temporary ID, so we can use it as a key in the list of NodeComponents
  localLearningObjectId?: string;
  dwengoHruid?: string;
  dwengoLanguage?: string;
  dwengoVersion?: number;
  isExternal: boolean;
  learningObject: { title: string };
}

interface LPEditContextProps {
  isAddingNode: boolean;
  currentNodeIndex: number;
  startAddingNode: (nodeIndex: number) => void;
  addNode: (
    localLearningObjectId: string,
    objectTitle: string,
    index: number,
  ) => void;
  orderedNodes: (LearningPathNodeWithObject | DraftNode)[];
  setOrderedNodes: (
    newNodes: (LearningPathNodeWithObject | DraftNode)[],
  ) => void;
}

const LPEditContext = createContext<LPEditContextProps | undefined>(undefined);

/**
 * Using react context to keep track of node creation state to avoid prop drilling.
 */
export const LPEditProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const [isAddingNode, setIsAddingNode] = useState(false);
  const [currentNodeIndex, setCurrentNodeIndex] = useState<number>(0);
  const [orderedNodes, setOrderedNodes] = useState<
    (LearningPathNodeWithObject | DraftNode)[]
  >([]);
  const [draftIdCounter, setDraftIdCounter] = useState(0);

  const startAddingNode = (nodeIndex: number) => {
    setIsAddingNode(true);
    setCurrentNodeIndex(nodeIndex);
  };

  const addNode = (
    localLearningObjectId: string,
    objectTitle: string,
    index: number,
  ) => {
    setIsAddingNode(false);
    setCurrentNodeIndex(0);
    const updatedNodes = Array.from(orderedNodes);
    const newNode: DraftNode = {
      draftId: draftIdCounter, // Generate a unique ID for the draft node
      localLearningObjectId: localLearningObjectId,
      isExternal: false,
      learningObject: { title: objectTitle },
    };
    updatedNodes.splice(index + 1, 0, newNode); // insert new node at given index
    setOrderedNodes(updatedNodes);
    setDraftIdCounter((prev) => prev + 1);
  };

  return (
    <LPEditContext.Provider
      value={{
        isAddingNode,
        currentNodeIndex,
        startAddingNode,
        addNode,
        orderedNodes,
        setOrderedNodes,
      }}
    >
      {children}
    </LPEditContext.Provider>
  );
};

export const useLPEditContext = () => {
  const context = useContext(LPEditContext);
  if (!context) {
    throw new Error('useLPEdit must be used within a LPEditProvider');
  }
  return context;
};
