import React from 'react';
import { useLPEditContext } from '../../../context/LearningPathEditContext';

interface AddNodeButtonProps {
  label: string;
  nodeIndex: number;
}

const AddNodeButton: React.FC<AddNodeButtonProps> = ({ label, nodeIndex }) => {
  const { isAddingNode, startAddingNode: startCreatingNode } =
    useLPEditContext();

  return isAddingNode ? (
    <div className="w-full text-left p-4 border-b border-gray-200 bg-gray-100">
      <span className="text-gray-500 italic">Adding node...</span>
    </div>
  ) : (
    <button
      className={`
        mt-4 px-4 py-2 text-base font-normal rounded 
        bg-dwengo-neutral-ivory text-gray 
        border border-gray-300 cursor-pointer transition-colors 
        duration-200 hover:bg-gray-200 flex items-center gap-2
      `}
      onClick={() => startCreatingNode(nodeIndex)}
    >
      {/* Plus Icon */}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth="1.5"
        stroke="currentColor"
        className="h-5 w-5"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M12 4.5v15m7.5-7.5h-15"
        />
      </svg>
      <span className="text-sm font-medium">{label}</span>
    </button>
  );
};

export default AddNodeButton;
