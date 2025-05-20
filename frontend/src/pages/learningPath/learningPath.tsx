import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useQueries } from '@tanstack/react-query';
import { LearningPath as LearningPathType, LearningObject } from '../../types/type';
import { useParams } from 'react-router-dom';
import {
  fetchLearningObjectsByLearningPath,
  fetchLearningPath,
} from '@/util/shared/learningPath';
import { useTranslation } from 'react-i18next';

import Sidebar from './Sidebar';
import MainContent from './MainContent';

/* ────────────────────────────────────────────────────────────────────────── */
/* Utilities                                                                 */
/* ────────────────────────────────────────────────────────────────────────── */

interface BranchItem { nodeId: string; lo: LearningObject }

function findStartNodeId(lp: LearningPathType): string | null {
  const trans = lp.transitions ?? [];
  if (trans.length === 0) return lp.nodes[0]?.nodeId ?? null;
  const pointed = new Set(trans.map(t => t.nextNodeId).filter(Boolean));
  return lp.nodes.find(n => !pointed.has(n.nodeId))?.nodeId ?? null;
}

function buildBranchPairs(
  lp: LearningPathType,
  learningObjects: LearningObject[],
  choices: Record<string, number>,
): BranchItem[] {
  const trans = lp.transitions ?? [];
  if (trans.length === 0) {
    return learningObjects.map(lo => ({ nodeId: lo.id, lo }));
  }

  const nodeById = new Map(lp.nodes.map(n => [n.nodeId, n]));
  const loById   = new Map(learningObjects.map(l => [l.id, l]));
  const outMap   = new Map(lp.nodes.map(n => [n.nodeId, trans.filter(t => t.nodeId === n.nodeId)]));

  const branch: BranchItem[] = [];
  let cur = findStartNodeId(lp);
  const seen: Record<string, number> = {};

  while (cur) {
    // voorkom infinite loops
    seen[cur] = (seen[cur] || 0) + 1;
    if (seen[cur] > 50) break;

    // push eventueel het bijbehorende LO
    const node = nodeById.get(cur);
    if (node) {
      const lo = loById.get(node.localLearningObjectId ?? '');
      if (lo) branch.push({ nodeId: cur, lo });
    }

    // haal alle uitgaande transitions
    const outs = outMap.get(cur) ?? [];
    if (outs.length === 0) break;

    // bepaal welke transition we volgen
    let nextTrans = outs[0];
    if (outs.length > 1) {
      const choice = choices[cur];
      if (choice === undefined) break;
      // vind de transitie waarvan condition === choice
      nextTrans = outs.find(t => t.condition === String(choice)) ?? null;
      if (!nextTrans) break;
    }

    // ga naar de volgende node
    if (!nextTrans.nextNodeId) break;
    cur = nextTrans.nextNodeId;
  }

  return branch;
}


/* ────────────────────────────────────────────────────────────────────────── */
/* Component                                                                 */
/* ────────────────────────────────────────────────────────────────────────── */

const LearningPath: React.FC = () => {
  const { t } = useTranslation();
  const { pathId } = useParams<{ pathId: string }>();
  const contentRef = useRef<HTMLDivElement>(null);
  const isStudent = localStorage.getItem('role') === 'student';

  const [learningPath, setLearningPath]       = useState<LearningPathType | null>(null);
  const [learningObjects, setLearningObjects] = useState<LearningObject[]>([]);
  const [choices, setChoices]                 = useState<Record<string, number>>({});
  const [branch, setBranch]                   = useState<BranchItem[]>([]);
  const [selectedNodeId, setSelectedNodeId]   = useState<string | null>(null);
  const [progress, setProgress]               = useState(0);

  /* Data fetch */
  const [
    { data: lpData, isLoading: lpLoading, isError: lpError, error: lpErr },
    { data: loData, isLoading: loLoading, isError: loError, error: loErr },
  ] = useQueries({
    queries: [
      { queryKey: ['learningPath', pathId],    queryFn: () => fetchLearningPath(pathId!) },
      { queryKey: ['learningObjects', pathId], queryFn: () => fetchLearningObjectsByLearningPath(pathId!) },
    ],
  });

  useEffect(() => { if (lpData) setLearningPath(lpData); }, [lpData]);
  useEffect(() => { if (loData) setLearningObjects(loData); }, [loData]);

  /* Rebuild branch when data or choices change */
  useEffect(() => {
    if (!learningPath || !learningObjects.length) return;
    const newBranch = buildBranchPairs(learningPath, learningObjects, choices);
    console.log('Branch pairs:', newBranch.map(p => `${p.nodeId}->${p.lo.id}`));
    setBranch(newBranch);
    if (!selectedNodeId && newBranch.length) setSelectedNodeId(newBranch[0].nodeId);
  }, [learningPath, learningObjects, choices]);

  /* Progress calculation */
  useEffect(() => {
    const doneCount = branch.filter(b => (b.lo as any).done).length;
    setProgress(branch.length ? Math.round((doneCount / branch.length) * 100) : 0);
  }, [branch]);

  /* Derived current LO */
  const selectedLO = useMemo(() => {
    return branch.find(p => p.nodeId === selectedNodeId)?.lo ?? null;
  }, [branch, selectedNodeId]);

  /* Next LO */
  const nextLO = useMemo(() => {
    if (!selectedNodeId) return null;
    const idx = branch.findIndex(p => p.nodeId === selectedNodeId);
    return branch[idx + 1]?.lo ?? null;
  }, [branch, selectedNodeId]);

  /* Handlers */
  const handleSelectNode = (nodeId: string) => {
    setSelectedNodeId(nodeId);
    contentRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleChooseTransition = (choiceIdx: number) => {
    if (!selectedNodeId) return;
    setChoices(prev => ({ ...prev, [selectedNodeId]: choiceIdx }));
  };

  /* Render */
  return (
    <div className="flex h-screen">
      <Sidebar
        t={t}
        learningPath={learningPath}
        items={branch}
        selectedNodeId={selectedNodeId}
        progress={progress}
        isStudent={isStudent}
        isLoadingPath={lpLoading}
        isErrorPath={lpError}
        errorPath={lpErr}
        isLoadingLO={loLoading}
        isErrorLO={loError}
        errorLO={loErr}
        onSelectNode={handleSelectNode}
      />

      <MainContent
        ref={contentRef}
        learningPath={learningPath}
        selectedLO={selectedLO}
        nextLO={nextLO}
        onSelectLO={lo => {
          const item = branch.find(p => p.lo.id === lo?.id);
          if (item) handleSelectNode(item.nodeId);
        }}
        onChooseTransition={handleChooseTransition}
        initialSelectedIdx={selectedNodeId ? choices[selectedNodeId] : undefined}
        t={t}
      />
    </div>
  );
};

export default LearningPath;