import React, { createContext, useContext, useState } from 'react';
import { LearningPath, LearningPathNodeWithObject } from '../types/type';
import { useMutation } from '@tanstack/react-query';
import { APIError } from '@/types/api.types';
import {
  updateOrCreateLearningPath,
  updateOrCreateLearningPathPayload,
} from '@/util/teacher/localLearningPaths';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';

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
  currentNodeIndex: number; // indicates the index of the node where the user is adding a new node
  startAddingNode: (nodeIndex: number) => void;
  cancelAddingNode: () => void;
  addNode: (
    objectTitle: string,
    index: number,
    objectHruid: string,
    objectLanguage: string,
    ObjectVersion: number,
    localLearningObjectId?: string,
  ) => void;
  orderedNodes: (LearningPathNodeWithObject | DraftNode)[];
  setOrderedNodes: (
    newNodes: (LearningPathNodeWithObject | DraftNode)[],
  ) => void;
  deleteNode: (index: number) => void;
  savePath: (payload: updateOrCreateLearningPathPayload) => void;
  isSavingPath: boolean;
  isCreateMode: boolean; // indicates whether the user is creating a new learning path or editing an existing one
  language: string; // language of the learning path
  setLanguage: (language: string) => void;
}

const LPEditContext = createContext<LPEditContextProps | undefined>(undefined);

/**
 * Using react context to keep track of node creation state to avoid prop drilling.
 */
export const LPEditProvider: React.FC<{
  children: React.ReactNode;
  isCreateMode: boolean;
}> = ({ children, isCreateMode }) => {
  const queryClient = useQueryClient();

  const [isAddingNode, setIsAddingNode] = useState(false);
  const [currentNodeIndex, setCurrentNodeIndex] = useState<number>(0);
  const [orderedNodes, setOrderedNodes] = useState<
    (LearningPathNodeWithObject | DraftNode)[]
  >([]);
  const [draftIdCounter, setDraftIdCounter] = useState(1);
  const [language, setLanguage] = useState<string>('');

  const startAddingNode = (nodeIndex: number) => {
    setIsAddingNode(true);
    setCurrentNodeIndex(nodeIndex);
  };

  const addNode = (
    objectTitle: string,
    index: number,
    objectHruid: string,
    objectLanguage: string,
    ObjectVersion: number,
    localLearningObjectId?: string,
  ) => {
    // if no language had been set yet, set the language to the one of the learning object
    if (!language) {
      setLanguage(objectLanguage);
    }
    setIsAddingNode(false);
    setCurrentNodeIndex(0);
    const updatedNodes = Array.from(orderedNodes);
    let newNode: DraftNode;
    if (localLearningObjectId) {
      newNode = {
        draftId: draftIdCounter, // generate a unique ID for the draft node
        localLearningObjectId: localLearningObjectId,
        isExternal: false,
        learningObject: { title: objectTitle },
      };
    } else {
      newNode = {
        draftId: draftIdCounter, // generate a unique ID for the draft node
        dwengoHruid: objectHruid,
        dwengoLanguage: objectLanguage,
        dwengoVersion: ObjectVersion,
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
    const updatedNodes = Array.from(orderedNodes);
    updatedNodes.splice(index, 1); // remove node at given index
    setOrderedNodes(updatedNodes);
    if (updatedNodes.length === 0) {
      setLanguage(''); // reset language if no nodes are left
    }
  };

  const navigate = useNavigate();
  const { mutate: savePath, isPending: isSavingPath } = useMutation<
    LearningPath,
    APIError,
    updateOrCreateLearningPathPayload
  >({
    mutationFn: updateOrCreateLearningPath,
    onSuccess: (path) => {
      console.log('Learning path updated/created successfully');
      queryClient.invalidateQueries({ queryKey: ['learningPaths'] });
      navigate(`/teacher/learning-paths/${path.id}`);
    },
  });

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
        savePath,
        isSavingPath,
        isCreateMode,
        language,
        setLanguage,
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
