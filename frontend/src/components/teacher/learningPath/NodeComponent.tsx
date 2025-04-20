import React from 'react';
import AddNodeButton from './AddNodeButton';
import { useNodeCreationContext } from '../../../context/NodeCreationContext';

interface NodeComponentProps {
  title: string;
  onOpenLearningObject: () => void;
}

const NodeComponent: React.FC<NodeComponentProps> = ({
  title,
  onOpenLearningObject,
}) => {
  const { isCreatingNode } = useNodeCreationContext();
  return (
    <div className="relative group">
      {/* Button to open the learning object */}
      <button
        className="w-full text-left p-4 border-b border-gray-200 bg-white hover:bg-gray-100 transition-colors duration-200"
        onClick={() => onOpenLearningObject()}
      >
        {title || 'Untitled Node'}
      </button>

      {/* Plus icon for creating a new node */}
      <AddNodeButton label="Add node here" />
    </div>
  );
};

export default NodeComponent;
