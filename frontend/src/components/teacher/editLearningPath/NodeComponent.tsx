import React, { memo, useRef, useState, useEffect } from 'react';
import { useDrag, useDrop } from 'react-dnd';
import { useTranslation } from 'react-i18next';

import AddNodeButton from './AddNodeButton';
import DeleteNodeButton from './DeleteNodeButton';
import {
  DraftNode,
  useLPEditContext,
} from '../../../context/LearningPathEditContext';
import { LearningPathNodeWithObject } from '../../../types/type';

const DRAG_N_DROP_TYPE = 'NODE';

interface DragItem {
  index: number;
}

interface NodeComponentProps {
  node: LearningPathNodeWithObject | DraftNode;
  index: number;                                      // positie binnen deze branch
  moveNode: (dragIndex: number, hoverIndex: number) => void;
  onOpenLearningObject: () => void;

  parentNodeId: string | null;
  viaOptionIndex: number | null;

  openBranchesDrawer?: (
    node: LearningPathNodeWithObject | DraftNode
  ) => void;

  /** of deze branch al een MC-node bevat */
  branchHasMC?: boolean;
  /** de index van de MC-node in deze branch */
  branchMCIndex?: number;
}

const NodeComponent: React.FC<NodeComponentProps> = memo(
  ({
    node,
    index,
    moveNode,
    onOpenLearningObject,
    parentNodeId,
    viaOptionIndex,
    openBranchesDrawer,
    branchHasMC = false,
    branchMCIndex = -1,
  }) => {
    const { t } = useTranslation();
    const { isAddingNode, currentNodeIndex, deleteNode } = useLPEditContext();

    const nodeRef = useRef<HTMLDivElement | null>(null);
    const dragHandleRef = useRef<HTMLDivElement | null>(null);

    // lokale foutmelding voor add-button
    const [addError, setAddError] = useState<string | null>(null);
    useEffect(() => {
      if (addError) {
        const timer = setTimeout(() => setAddError(null), 3000);
        return () => clearTimeout(timer);
      }
    }, [addError]);

    /* Drag & drop setup */
    const [{ isDragging }, drop] = useDrop<DragItem, unknown, { isDragging: boolean }>({
      accept: DRAG_N_DROP_TYPE,
      canDrop: (item) => {
        // blokkeren van droppen als target of source achter de MC-node ligt
        if (branchHasMC) {
          const dragIdx = item.index;
          const hoverIdx = index;
          if (dragIdx > branchMCIndex || hoverIdx > branchMCIndex) {
            return false;
          }
        }
        return true;
      },
      collect: (monitor) => ({
        isDragging: !!monitor.getItem(),
      }),
      hover: (item, monitor) => {
        if (!nodeRef.current) return;

        const dragIdx = item.index;
        const hoverIdx = index;

        // nogmaals blokkeren bij hover
        if (branchHasMC && (dragIdx > branchMCIndex || hoverIdx > branchMCIndex)) {
          return;
        }

        if (dragIdx === hoverIdx) return;

        const hoverRect = nodeRef.current.getBoundingClientRect();
        const hoverMiddleY = (hoverRect.bottom - hoverRect.top) / 2;
        const clientOffset = monitor.getClientOffset();
        if (!clientOffset) return;
        const hoverClientY = clientOffset.y - hoverRect.top;
        if (dragIdx < hoverIdx && hoverClientY < hoverMiddleY) return;
        if (dragIdx > hoverIdx && hoverClientY > hoverMiddleY) return;

        moveNode(dragIdx, hoverIdx);
        item.index = hoverIdx;
      },
    });

    const [, drag, preview] = useDrag({
      type: DRAG_N_DROP_TYPE,
      item: { index },
      canDrag: () => {
        // blokkeren van drag van nodes achter MC-node
        if (isAddingNode) return false;
        if (branchHasMC && index > branchMCIndex) return false;
        return true;
      },
    });

    drop(nodeRef);
    drag(dragHandleRef);
    preview(nodeRef);

    const isCurrentNode = isAddingNode && currentNodeIndex === index;

    // bepalen of toevoegen na MC is
    const isAfterMC = branchHasMC && index >= branchMCIndex;

    return (
      <div
        ref={nodeRef}
        className="group border p-2 border-gray-200 bg-white hover:bg-gray-100 transition-colors duration-200"
      >
        <div className="flex items-center bg-white group-hover:bg-gray-100">
          {/* drag handle */}
          <div
            ref={dragHandleRef}
            className="cursor-grab p-2 mr-4 bg-gray-200 rounded flex-shrink-0"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="size-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
              />
            </svg>
          </div>

          {/* lo title and delete button */}
          <div className="flex-1 flex justify-between items-center w-full py-2 pe-4 bg-white group-hover:bg-gray-100">
            {/* learning object title*/}
            <button
              onClick={() => onOpenLearningObject()}
              className="text-left"
            >
              {node.learningObject?.title ||
                t('edit_learning_path.node_component.untitled_node')}
            </button>

            {!isDragging && !isAddingNode && (
              <div className="hidden group-hover:flex items-center gap-2">
                <DeleteNodeButton onDelete={() => deleteNode(index)} />
                {node.learningObject?.contentType === 'EVAL_MULTIPLE_CHOICE' && (
                  <button
                    onClick={() => openBranchesDrawer?.(node)}
                    className="text-xs px-2 py-1 bg-blue-50 hover:bg-blue-100 rounded"
                  >
                    Maak hier je Branches
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* add-node onder huidige node */}
        {(isCurrentNode || !isAddingNode) && !isDragging && (
          <div className={`mt-2 ${!isAddingNode ? 'hidden group-hover:block' : ''}`}>
            {isAfterMC ? (
              <>
                <div className="text-red-600 text-sm mb-1">
                  Je mag geen leerobjecten toevoegen na een meerkeuzevraag. Je moet dit in de branches doen.
                </div>
                <button
                  onClick={() => setAddError(t('edit_learning_path.add_after_mc_error'))}
                  className="px-3 py-2 w-full text-sm text-white bg-gray-400 rounded cursor-not-allowed"
                  disabled
                >
                  {t('edit_learning_path.node_component.add_node_here')}
                </button>
              </>
            ) : (
              <AddNodeButton
                nodeIndex={index}
                label={t('edit_learning_path.node_component.add_node_here')}
                parentNodeId={parentNodeId}
                viaOptionIndex={viaOptionIndex}
              />
            )}
          </div>
        )}
      </div>
    );
  }
);

export default NodeComponent;
