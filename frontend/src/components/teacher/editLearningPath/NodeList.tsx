import React, { useState, useEffect } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { useTranslation } from 'react-i18next';

import NodeComponent from './NodeComponent';
import { useLPEditContext, DraftNode } from '../../../context/LearningPathEditContext';
import type { LearningPathNodeWithObject } from '../../../types/type';

/**
 * Toont een lijst van nodes binnen één “branch”.
 * Root-lijst = parentNodeId=null, viaOptionIndex=null
 * De MC-node blijft altijd onderaan en is niet drag-&-dropbaar.
 */
interface NodeListProps {
  parentNodeId?: string | null;
  viaOptionIndex?: number | null;
  openBranchesDrawer?: (node: LearningPathNodeWithObject | DraftNode) => void;
}

const NodeList: React.FC<NodeListProps> = ({
  parentNodeId = null,
  viaOptionIndex = null,
  openBranchesDrawer,
}) => {
  const { t } = useTranslation();
  const { orderedNodes, setOrderedNodes } = useLPEditContext();

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  useEffect(() => {
    if (!errorMessage) return;
    const id = setTimeout(() => setErrorMessage(null), 3000);
    return () => clearTimeout(id);
  }, [errorMessage]);

  // filter nodes voor deze branch
  const branchNodes = orderedNodes.filter(
    (n: any) =>
      n.parentNodeId === parentNodeId &&
      n.viaOptionIndex === viaOptionIndex
  );

  // helper om MC-vragen te herkennen
  const isMC = (n: any) =>
    n.learningObject?.contentType === 'EVAL_MULTIPLE_CHOICE';

  // splits MC-node eruit
  const otherNodes = branchNodes.filter((n) => !isMC(n));
  const mcNodes = branchNodes.filter(isMC);
  const mcIndex = otherNodes.length; // MC altijd ná alle otherNodes

  /**
   * Verplaatst een node binnen de niet-MC nodes.
   */
  const moveNode = (dragIdx: number, hoverIdx: number) => {
    const global = otherNodes.map((bn) => orderedNodes.indexOf(bn));
    const dragGlobal = global[dragIdx];
    const hoverGlobal = global[hoverIdx];
    const updated = Array.from(orderedNodes);
    const [removed] = updated.splice(dragGlobal, 1);
    updated.splice(hoverGlobal, 0, removed);
    setOrderedNodes(updated);
  };

  return (
    <>
      {errorMessage && (
        <div className="bg-red-100 text-red-800 px-3 py-2 rounded mb-2">
          {errorMessage}
        </div>
      )}

      <div className="flex items-center gap-1 mb-2 text-gray-400">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-4 w-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <span className="text-xs cursor-default bg-white">
          {t('edit_learning_path.node_list_instructions')}
        </span>
      </div>

      <DndProvider backend={HTML5Backend}>
        {otherNodes.map((node, idx) => (
          <NodeComponent
            key={'nodeId' in node ? node.nodeId : node.draftId}
            node={node}
            index={idx}
            moveNode={moveNode}
            onOpenLearningObject={() => console.log('Open learning object')}
            parentNodeId={parentNodeId}
            viaOptionIndex={viaOptionIndex}
            openBranchesDrawer={openBranchesDrawer}
            branchHasMC={mcNodes.length > 0}
            branchMCIndex={mcIndex}
          />
        ))}

        {/* MC-node(s) altijd onderaan, niet verschuifbaar */}
        {mcNodes.map((node) => (
          <NodeComponent
            key={'nodeId' in node ? node.nodeId : node.draftId}
            node={node}
            index={mcIndex}
            moveNode={() => {}}
            onOpenLearningObject={() => console.log('Open learning object')}
            parentNodeId={parentNodeId}
            viaOptionIndex={viaOptionIndex}
            openBranchesDrawer={openBranchesDrawer}
            branchHasMC={mcNodes.length > 0}
            branchMCIndex={mcIndex}
          />
        ))}
      </DndProvider>
    </>
  );
};

export default NodeList;
