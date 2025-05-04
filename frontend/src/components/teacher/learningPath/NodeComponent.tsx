import React, { memo, useRef, useState } from 'react';
import AddNodeButton from './AddNodeButton';
import {
  DraftNode,
  useLPEditContext,
} from '../../../context/LearningPathEditContext';
import { LearningPathNodeWithObject } from '../../../types/type';
import { useDrag, useDrop } from 'react-dnd';

const DRAG_N_DROP_TYPE = 'NODE';
interface DragItem {
  index: number;
}

interface NodeComponentProps {
  node: LearningPathNodeWithObject | DraftNode;
  index: number; // index of the node in the list (needed to keep track of node order while dragging)
  moveNode: (dragIndex: number, hoverIndex: number) => void; // for dragging and dropping nodes
  onOpenLearningObject: () => void;
}

const NodeComponent: React.FC<NodeComponentProps> = memo(
  ({ node, index, moveNode, onOpenLearningObject }) => {
    const { isAddingNode, currentNodeIndex } = useLPEditContext();
    const [isHovered, setIsHovered] = useState(false); // use to conditionally render the button to add new node underneath current node

    const nodeRef = useRef<HTMLDivElement | null>(null);
    const dragHandleRef = useRef<HTMLDivElement | null>(null);

    const [{ isDragging }, drop] = useDrop<
      DragItem,
      unknown,
      { isDragging: boolean } // true if ANY node is being dragged (not just this one)
    >({
      accept: DRAG_N_DROP_TYPE,
      collect: (monitor) => ({
        isDragging: monitor.getItemType() !== null,
      }),
      hover: (item: DragItem, monitor) => {
        if (!nodeRef.current) return;

        const dragIndex = item.index; // index of the node being dragged
        const hoverIndex = index; // index of the node being hovered over

        // Don't replace items with themselves
        if (dragIndex === hoverIndex) return;

        // Determine rectangle on screen
        const hoverBoundingRect = nodeRef.current?.getBoundingClientRect();
        const hoverMiddleY =
          (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;
        const clientOffset = monitor.getClientOffset();
        if (!clientOffset) return;
        const hoverClientY = clientOffset.y - hoverBoundingRect.top; // get the y position of the mouse relative to the hovered node

        // Only perform the move when the mouse has crossed half of the items height
        if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) return;
        if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) return;

        // actually perform the action
        moveNode(dragIndex, hoverIndex);
        item.index = hoverIndex;
      },
    });

    const [, drag, preview] = useDrag({
      type: DRAG_N_DROP_TYPE,
      item: { index },
      canDrag: () => !isAddingNode, // disable dragging when isAddingNode is true
    });

    drop(nodeRef);
    drag(dragHandleRef); // attach drag to the dragHandleRef (so you can only drag the node by the drag handle)
    preview(nodeRef); // attach preview to entire node, so you don't only see the drag handle icon when dragging

    const isCurrentNode = isAddingNode && currentNodeIndex === index;

    return (
      <div
        ref={nodeRef}
        className="border p-2 border-gray-200 bg-white hover:bg-gray-100 transition-colors duration-200"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="flex items-center">
          {/* drag handle - exclude from hover effects */}
          <div
            ref={dragHandleRef}
            className="cursor-grab p-2 mr-4 bg-gray-200 rounded flex-shrink-0"
            onMouseEnter={() => setIsHovered(false)}
            onMouseLeave={() => setIsHovered(true)}
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
          <div className="flex-1 flex justify-between items-center w-full py-2 pe-4">
            <button
              onClick={() => onOpenLearningObject()}
              className="text-left"
            >
              {node.learningObject?.title || 'Untitled Node'}
            </button>

            {/* delete button */}
            {isHovered && !isDragging && !isAddingNode && (
              <button
                onClick={() => console.log('delete node')}
                className="bg-dwengo-red-200 hover:bg-dwengo-red-dark text-sm text-white rounded p-1 flex-shrink-0"
                title="Delete node"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="1.5"
                  stroke="currentColor"
                  className="size-6"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d={`m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16
                    19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456
                    0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0
                    0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32
                    0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0`}
                  />
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* button for adding a new node underneath current node */}
        {((isHovered && !isAddingNode) || (isAddingNode && isCurrentNode)) && (
          <div className="mt-2">
            <AddNodeButton nodeIndex={index} label="Add node here" />
          </div>
        )}
      </div>
    );
  },
);

export default NodeComponent;
