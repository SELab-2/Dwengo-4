// EditLearningPath.tsx
import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useQueries } from '@tanstack/react-query';           // NEW

import AddNodeButton from '@/components/teacher/editLearningPath/AddNodeButton';
import SelectLearningObject from '@/components/teacher/editLearningPath/SelectLearningObject';
import NodeList from '@/components/teacher/editLearningPath/NodeList';
import BranchesDrawer from '@/components/teacher/editLearningPath/BranchesDrawer';
import {
  LearningPathDetails,
  LearningPathDetailsRef,
} from '@/components/teacher/editLearningPath/LearningPathDetails';

import { DraftNode, useLPEditContext } from '@/context/LearningPathEditContext';
import type {
  LearningPath,
  LearningPathNodeWithObject,
  LearningObject,
  Transition,
} from '@/types/type';
import { fetchLearningObjectsByLearningPath, fetchLearningPath } from '@/util/shared/learningPath';

const EditLearningPath: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { learningPathId } = useParams<{ learningPathId: string }>();

  /* ───── context state ───── */
  const {
    isAddingNode,
    orderedNodes,
    setOrderedNodes,
    savePath,
    isSavingPath,
    isCreateMode,
    language,
    setLanguage,
  } = useLPEditContext();

  /* ───── lokale UI state ───── */
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [branchNode, setBranchNode] = useState<LearningPathNodeWithObject | DraftNode | null>(null);
  const pathDetailsRef = useRef<LearningPathDetailsRef | null>(null);

  /* ───── data ophalen (alleen edit-mode) ───── */
  const [
    // 0 → learningPath      1 → learningObjects
    { data: lpData, isLoading: lpLoading, isError: lpError, error: lpErr },
    { data: loData, isLoading: loLoading, isError: loError, error: loErr },
  ] = useQueries({
    queries: [
      {
        queryKey: ['learningPath', learningPathId],
        queryFn: () => fetchLearningPath(learningPathId!),
        enabled: !isCreateMode && !!learningPathId,
      },
      {
        queryKey: ['learningObjects', learningPathId],
        queryFn: () => fetchLearningObjectsByLearningPath(learningPathId!),
        enabled: !isCreateMode && !!learningPathId,
      },
    ],
  });

  /* ───── omzetting learningPath → orderedNodes ───── */
  useEffect(() => {
    if (!lpData || !loData) return;

    // taal van pad instellen
    setLanguage(lpData.language);

    // nodes & transitions omzetten
    const nodesArray = buildOrderedNodes(lpData, loData);
    setOrderedNodes(nodesArray);
  }, [lpData, loData]);


  /* ───── foutmeldingen automatisch wegklikken ───── */
  useEffect(() => {
    if (!errorMessage) return;
    const id = setTimeout(() => setErrorMessage(null), 5000);
    return () => clearTimeout(id);
  }, [errorMessage]);

  /* ───── opslaan ───── */
  const handleSavePath = () => {
    if (!pathDetailsRef.current || !pathDetailsRef.current.validateInput()) return;
    if (orderedNodes.length === 0) {
      setErrorMessage(t('edit_learning_path.no_nodes_error'));
      return;
    }
    savePath({
      newTitle: pathDetailsRef.current.title,
      newDescription: pathDetailsRef.current.description,
      newLanguage: language,
      newImage: pathDetailsRef.current.image,
      newNodes: orderedNodes,
      learningPathId,
    });
  };

  /* ───── render ───── */
  const isLoading = lpLoading || loLoading;
  const isError = lpError || loError;

  return (
    <div className="flex h-screen">
      {/* ───── zijbalk ───── */}
      <div className="p-4 space-y-3 max-w-[405px] w-full border rounded overflow-y-scroll">
        {isLoading && !isCreateMode ? (
          <p className="text-gray-500">{t('edit_learning_path.loading_path_details')}</p>
        ) : isError ? (
          <p>Error: {lpErr?.message || loErr?.message}</p>
        ) : (
          <LearningPathDetails
            pathDetailsRef={pathDetailsRef}
            initialTitle={lpData?.title}
            initialDescription={lpData?.description}
            initialImage={lpData?.image}
          />
        )}

        {errorMessage && (
          <div className="bg-red-100 border border-dwengo-red-dark text-dwengo-red-darker px-3 py-2 rounded relative mb-4">
            <span className="block sm:inline text-sm">{errorMessage}</span>
            <span
              onClick={() => setErrorMessage(null)}
              className="absolute top-0 bottom-0 right-0 px-4 py-3 cursor-pointer"
            >
              ✕
            </span>
          </div>
        )}

        <div className="rounded-lg border border-gray-200 p-2.5 bg-white">
          {isLoading ? (
            <p>{t('edit_learning_path.loading_objects')}</p>
          ) : isError ? (
            <p>Error: {lpErr?.message || loErr?.message}</p>
          ) : orderedNodes.length === 0 ? (
            <AddNodeButton nodeIndex={0} label={t('edit_learning_path.add_node')} />
          ) : (
            <NodeList parentNodeId={null} viaOptionIndex={null} openBranchesDrawer={setBranchNode} />
          )}
        </div>
      </div>

      {/* ───── LO-keuze ───── */}
      {isAddingNode && <SelectLearningObject />}

      {/* ───── Branches drawer ───── */}
      {branchNode && (
        <BranchesDrawer
          mcNode={branchNode}
          onClose={() => setBranchNode(null)}
          openBranchesDrawer={setBranchNode}
        />
      )}

      {/* ───── bevestigen / annuleren ───── */}
      <div className="fixed bottom-0 right-0 flex gap-2.5 p-2.5 justify-end border-t border-gray-200 bg-white w-full">
        <button
          onClick={handleSavePath}
          disabled={isSavingPath}
          className="px-6 h-10 font-bold rounded-md text-white bg-dwengo-green hover:bg-dwengo-green-dark"
        >
          {isSavingPath ? t('edit_learning_path.saving') : t('edit_learning_path.confirm')}
        </button>
        <button
          disabled={isSavingPath}
          onClick={() => navigate(-1)}
          className="px-6 h-10 font-bold rounded-md bg-dwengo-red-200 text-white hover:bg-dwengo-red-dark"
        >
          {t('edit_learning_path.cancel')}
        </button>
      </div>
    </div>
  );
};

export default EditLearningPath;

/* ────────────────────────────────────────────────────────────────────────────
   Util:   learningPath → orderedNodes (met draftId, parentNodeId, viaOptionIndex)
   ──────────────────────────────────────────────────────────────────────────── */



   
function buildOrderedNodes(
  lp: LearningPath,
  learningObjects: LearningObject[],
): Omit<DraftNode, '_visited'>[] {
  // Map learningObjects by id
  const loById = new Map<string, LearningObject>(
    learningObjects.map(lo => [lo.id, lo])
  );

  // Prepare nodes
  const nodeById = new Map<string, any>();
  lp.nodes.forEach(n => {
    nodeById.set(n.nodeId, {
      nodeId: n.nodeId,
      localLearningObjectId: n.localLearningObjectId,
      draftId: 0,
      parentNodeId: null as string | null,
      viaOptionIndex: null as string | null,
      learningObject: n.localLearningObjectId
        ? loById.get(n.localLearningObjectId)
        : loById.get(n.dwengoHruid),
      dwengoHruid: n.dwengoHruid,
      _visited: false,
    });
  });

  // Find root nodes (no inbound transitions)
  const inboundIds = new Set(lp.transitions.map(t => t.nextNodeId));
  const roots = lp.nodes
    .filter(n => !inboundIds.has(n.nodeId))
    .map(n => nodeById.get(n.nodeId));

  let draftCounter = 1;
  const orderedRaw: any[] = [];

  // DFS traversal
  const visit = (node: any, branchRoot: number | null) => {
    if (!node || node._visited) return;
    node._visited = true;
    node.draftId = draftCounter++;
    orderedRaw.push(node);


  
    let isMC = !node.dwengoHruid && node.learningObject && node.learningObject.contentType === 'EVAL_MULTIPLE_CHOICE';
    const nextBranch = isMC ? node.draftId : branchRoot;


    
    lp.transitions
      .filter(t => t.nodeId === node.nodeId)
      .sort((a, b) => Number(a.condition) - Number(b.condition))
      .forEach(t => {
        const child = nodeById.get(t.nextNodeId);
        if (child) {
          child.parentNodeId = nextBranch !== null ? String(nextBranch) : null;
              const idx = parseInt(t.condition, 10);
              child.viaOptionIndex = Number.isNaN(idx) ? null : idx;
          visit(child, nextBranch);
        }
      });
  };

  roots.forEach(root => visit(root, null));




  // Sort by draftId and map to desired shape
  // Sort by draftId and map to desired shape
  return orderedRaw
    .sort((a, b) => {
      // 1) non-null parents eerst
      if (a.parentNodeId === null && b.parentNodeId !== null) return 1;
      if (a.parentNodeId !== null && b.parentNodeId === null) return -1;

      // 2) beide non-null: op parentNodeId numeriek (of lexicaal) vergelijken
      if (a.parentNodeId !== b.parentNodeId) {
        return Number(a.parentNodeId) - Number(b.parentNodeId);
      }

      // 3) zelfde parent: viaOptionIndex vergelijken (hogere index eerst)
      //    null treaten we als -Infinity zodat echte opties altijd eerder komen
      const ia = a.viaOptionIndex !== null ? Number(a.viaOptionIndex) : -Infinity;
      const ib = b.viaOptionIndex !== null ? Number(b.viaOptionIndex) : -Infinity;
      return ib - ia;
    })
    .map(node => ({
      draftId: node.draftId,
      isExternal: !node.localLearningObjectId,
      learningObject: {
        title:
          node.learningObject?.title ||
          node.learningObject?.uuid ||
          node.dwengoHruid ||
          '',
        contentType: node.learningObject?.contentType || 'UNKNOWN',
      },
      localLearningObjectId: node.localLearningObjectId || null,
      parentNodeId: node.parentNodeId,
      viaOptionIndex:
        node.viaOptionIndex == 'null' ? null : node.viaOptionIndex,
    }));
};
