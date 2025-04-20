import React from 'react';
import AddNodeButton from './AddNodeButton';
import { useNodeCreationContext } from '../../../context/NodeCreationContext';
import { LearningPathNodeWithObject } from '../../../types/type';

interface NodeComponentProps {
  node: LearningPathNodeWithObject;
  onOpenLearningObject: () => void;
}

const NodeComponent: React.FC<NodeComponentProps> = ({
  node,
  onOpenLearningObject,
}) => {
  const { isCreatingNode, currentNodeId } = useNodeCreationContext();

  const isCurrentNode = isCreatingNode && currentNodeId === node.nodeId;

  return (
    <div className="relative group">
      {/* Button to open the learning object */}
      <button
        className="w-full text-left p-4 border-b border-gray-200 bg-white hover:bg-gray-100 transition-colors duration-200"
        onClick={() => onOpenLearningObject()}
      >
        {node.learningObject?.title || 'Untitled Node'}
      </button>

      {/* Plus icon for creating a new node */}
      {(!isCreatingNode || isCurrentNode) && (
        <AddNodeButton nodeId={node.nodeId} label="Add node here" />
      )}
    </div>
  );
};

export default NodeComponent;
