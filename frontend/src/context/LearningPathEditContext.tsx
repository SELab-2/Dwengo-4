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
  cancelAddingNode: () => void;
  addNode: (
    objectTitle: string,
    index: number,
    localLearningObjectId?: string,
    dwengoHruid?: string,
    dwengoLanguage?: string,
    dwengoVersion?: number,
  ) => void;
  orderedNodes: (LearningPathNodeWithObject | DraftNode)[];
  setOrderedNodes: (
    newNodes: (LearningPathNodeWithObject | DraftNode)[],
  ) => void;
  deleteNode: (index: number) => void;
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
    objectTitle: string,
    index: number,
    localLearningObjectId?: string,
    dwengoHruid?: string,
    dwengoLanguage?: string,
    dwengoVersion?: number,
  ) => {
    setIsAddingNode(false);
    setCurrentNodeIndex(0);
    const updatedNodes = Array.from(orderedNodes);
    let newNode: DraftNode;
    if (localLearningObjectId) {
      newNode = {
        draftId: draftIdCounter, // Generate a unique ID for the draft node
        localLearningObjectId: localLearningObjectId,
        isExternal: false,
        learningObject: { title: objectTitle },
      };
    } else {
      newNode = {
        draftId: draftIdCounter, // Generate a unique ID for the draft node
        dwengoHruid: dwengoHruid,
        dwengoLanguage: dwengoLanguage,
        dwengoVersion: dwengoVersion,
        isExternal: true,
        learningObject: { title: objectTitle },
      };
    }

    updatedNodes.splice(index + 1, 0, newNode); // insert new node at given index
    setOrderedNodes(updatedNodes);
    setDraftIdCounter((prev) => prev + 1);
  };

  const cancelAddingNode = () => {
    setIsAddingNode(false);
    setCurrentNodeIndex(0);
  };

  const deleteNode = (index: number) => {
    // straighforward for draft nodes, gotta think about if we should keep track of deleted existing nodes to send to backend
    const updatedNodes = Array.from(orderedNodes);
    updatedNodes.splice(index, 1); // remove node at given index
    setOrderedNodes(updatedNodes);
  };

  return (
    <LPEditContext.Provider
      value={{
        isAddingNode,
        currentNodeIndex,
        startAddingNode,
        cancelAddingNode,
        addNode,
        orderedNodes,
        setOrderedNodes,
        deleteNode,
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
