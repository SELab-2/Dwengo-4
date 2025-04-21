import React, { memo, useRef, useState } from 'react';
import AddNodeButton from './AddNodeButton';
import { useNodeCreationContext } from '../../../context/NodeCreationContext';
import { LearningPathNodeWithObject } from '../../../types/type';
import { useDrag, useDrop } from 'react-dnd';

const DRAG_N_DROP_TYPE = 'NODE';
interface DragItem {
  index: number;
}

interface NodeComponentProps {
  node: LearningPathNodeWithObject;
  index: number; // index of the node in the list (needed to keep track of node order while dragging)
  moveNode: (dragIndex: number, hoverIndex: number) => void; // for dragging and dropping nodes
  onOpenLearningObject: () => void;
}

const NodeComponent: React.FC<NodeComponentProps> = memo(
  function NodeComponent({ node, index, moveNode, onOpenLearningObject }) {
    const { isAddingNode, currentNodeId } = useNodeCreationContext();
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

    const isCurrentNode = isAddingNode && currentNodeId === node.nodeId;

    return (
      <div
        ref={nodeRef}
        className="relative flex items-center p-2 border-b border-gray-200 bg-white hover:bg-gray-100 transition-colors duration-200"
      >
        {/* Drag Handle */}
        <div
          ref={dragHandleRef}
          className="cursor-grab p-2 mr-4 bg-gray-200 rounded"
        >
          {/* Drag handle icon */}
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
        <div
          className="relative"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {/* Button to open the learning object */}
          <button
            className="w-full text-left p-4 border-b border-gray-200 bg-white hover:bg-gray-100 transition-colors duration-200"
            onClick={() => onOpenLearningObject()}
          >
            {node.learningObject?.title || 'Untitled Node'}
          </button>

          {/* Plus icon for creating a new node */}
          {((isHovered && !isAddingNode) || (isAddingNode && isCurrentNode)) &&
            !isDragging && (
              <AddNodeButton nodeId={node.nodeId} label="Add node here" />
            )}
        </div>
      </div>
    );
  },
);

export default NodeComponent;
