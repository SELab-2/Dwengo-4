import React, { createContext, useContext, useState } from 'react';
import { LearningPath, LearningPathNodeWithObject } from '../types/type';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { APIError } from '@/types/api.types';
import {
  updateOrCreateLearningPath,
  updateOrCreateLearningPathPayload,
} from '@/util/teacher/localLearningPaths';
import { useNavigate } from 'react-router-dom';
import { ContentType } from '@/util/teacher/localLearningObjects';

// ────────────────────────────────────────────────────────────────────────────
// Types
// ────────────────────────────────────────────────────────────────────────────

export interface DraftNode {
  draftId: number;               // temp key
  parentNodeId: string | null;   // null ⇒ root-lijst
  viaOptionIndex: number | null; // null ⇒ default flow

  // identificatie van het leerobject
  localLearningObjectId?: string;
  dwengoHruid?: string;
  dwengoLanguage?: string;
  dwengoVersion?: number;
  isExternal: boolean;

  // titels én contenttype voor rendering & branch-logica
  learningObject: {
    title: string;
    contentType: String;
  };
}

interface LPEditContextProps {
  /* ───── Node-toevoegen flow ───── */
  isAddingNode: boolean;
  currentNodeIndex: number;
  currentParentNodeId: string | null;
  currentOptionIndex: number | null;

  startAddingNode: (
    afterIndex: number,
    parentId?: string | null,
    optionIdx?: number | null
  ) => void;
  cancelAddingNode: () => void;

  addNode: (
    objectTitle: string,
    afterIndex: number,
    objectHruid: string,
    objectLanguage: string,
    objectVersion: number,
    localLearningObjectId: string | undefined,
    contentType: String,
    parentId?: string | null,
    optionIdx?: number | null
  ) => void;

  /* ───── Node-lijst bewerken ───── */
  orderedNodes: (LearningPathNodeWithObject | DraftNode)[];
  setOrderedNodes: (
    n: (LearningPathNodeWithObject | DraftNode)[]
  ) => void;
  deleteNode: (index: number) => void;

  /* ───── Opslaan ───── */
  savePath: (payload: updateOrCreateLearningPathPayload) => void;
  isSavingPath: boolean;
  isCreateMode: boolean;

  /* ───── Metadata ───── */
  language: string;
  setLanguage: (lang: string) => void;
}

const LPEditContext = createContext<LPEditContextProps | undefined>(undefined);

// ────────────────────────────────────────────────────────────────────────────
// Provider
// ────────────────────────────────────────────────────────────────────────────

export const LPEditProvider: React.FC<{
  children: React.ReactNode;
  isCreateMode: boolean;
}> = ({ children, isCreateMode }) => {
  const queryClient = useQueryClient();
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
      queryClient.invalidateQueries({ queryKey: ['learningObjects', path.id] });
      navigate(`/teacher/learning-paths/${path.id}`);
    },
  });
  /* ––––– Node-toevoegen flow ––––– */
  const [isAddingNode, setIsAddingNode] = useState(false);
  const [currentNodeIndex, setCurrentNodeIndex] = useState(0);
  const [currentParentNodeId, setCurrentParentNodeId] = useState<string | null>(
    null
  );
  const [currentOptionIndex, setCurrentOptionIndex] = useState<number | null>(
    null
  );

  /* ––––– Node-data ––––– */
  const [orderedNodes, setOrderedNodes] = useState<
    (LearningPathNodeWithObject | DraftNode)[]
  >([]);
  const [draftIdCounter, setDraftIdCounter] = useState(1);

  /* ––––– Taal ––––– */
  const [language, setLanguage] = useState<string>('');

  // start “add node” flow, optionally binnen een branch
  const startAddingNode = (
    afterIndex: number,
    parentId: string | null = null,
    optionIdx: number | null = null
  ) => {
    setIsAddingNode(true);
    setCurrentNodeIndex(afterIndex);
    setCurrentParentNodeId(parentId);
    setCurrentOptionIndex(optionIdx);
  };

  const cancelAddingNode = () => {
    setIsAddingNode(false);
    setCurrentNodeIndex(0);
    setCurrentParentNodeId(null);
    setCurrentOptionIndex(null);
  };

  // nieuw node toevoegen, mét contentType voor MC-logic
  const addNode = (
    objectTitle: string,
    afterIndex: number,
    objectHruid: string,
    objectLanguage: string,
    objectVersion: number,
    localLearningObjectId: string | undefined,
    contentType: String,
    parentId: string | null = null,
    optionIdx: number | null = null
  ) => {
    if (!language) setLanguage(objectLanguage);

    setIsAddingNode(false);
    setCurrentNodeIndex(0);
    setCurrentParentNodeId(null);
    setCurrentOptionIndex(null);

    const updated = Array.from(orderedNodes);
    const newNode: DraftNode = {
      draftId: draftIdCounter,
      parentNodeId: parentId,
      viaOptionIndex: optionIdx,
      isExternal: !localLearningObjectId,
      learningObject: {
        title: objectTitle,
        contentType,
      },
      ...(localLearningObjectId
        ? { localLearningObjectId }
        : {
            dwengoHruid: objectHruid,
            dwengoLanguage: objectLanguage,
            dwengoVersion: objectVersion,
          }),
    };

    updated.splice(afterIndex + 1, 0, newNode);
    setOrderedNodes(updated);
    setDraftIdCounter((c) => c + 1);
  };

  const deleteNode = (index: number) => {
    const updated = Array.from(orderedNodes);
    updated.splice(index, 1);
    setOrderedNodes(updated);
    if (updated.length === 0) setLanguage('');
  };

  return (
    <LPEditContext.Provider
      value={{
        isAddingNode,
        currentNodeIndex,
        currentParentNodeId,
        currentOptionIndex,
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
  const ctx = useContext(LPEditContext);
  if (!ctx) throw new Error('useLPEdit must be used within a LPEditProvider');
  return ctx;
};
