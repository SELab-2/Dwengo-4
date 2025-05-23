import React from 'react';
import { useTranslation } from 'react-i18next';

import { useLPEditContext } from '../../../context/LearningPathEditContext';

interface AddNodeButtonProps {
  label: string;
  nodeIndex: number;                  // positie NA welke node wordt ingevoegd
  parentNodeId?: string | null;       // null  ⇒ root-lijst
  viaOptionIndex?: number | null;     // null  ⇒ geen MC-branch
}

const AddNodeButton: React.FC<AddNodeButtonProps> = ({
  label,
  nodeIndex,
  parentNodeId = null,
  viaOptionIndex = null,
}) => {
  const { t } = useTranslation();
  const { isAddingNode, startAddingNode, cancelAddingNode } = useLPEditContext();

  /* ───── wanneer er al een “add flow” bezig is ───── */
  if (isAddingNode) {
    return (
      <div className="w-full p-3 bg-gray-100 flex justify-between items-center">
        <span className="text-gray-500 italic cursor-default">
          {t('edit_learning_path.add_node_button.adding_node')}
        </span>
        <button
          className="
            px-2 py-1 cursor-pointer rounded
            bg-dwengo-red-200 text-white transition-colors duration-200 hover:bg-dwengo-red-dark
            flex items-center gap-1
          "
          onClick={cancelAddingNode}
        >
          {/* Cancel icon */}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="1.5"
            stroke="currentColor"
            className="size-5"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
          </svg>
          <span className="text-sm font-medium">
            {t('edit_learning_path.add_node_button.cancel')}
          </span>
        </button>
      </div>
    );
  }

  /* ───── standaard “Add node here” knop ───── */
  return (
    <button
      className="
        px-3 py-2 text-base font-normal rounded
        bg-dwengo-neutral-ivory text-gray
        border border-gray-300 cursor-pointer
        transition-colors duration-200 hover:bg-gray-200
        flex items-center gap-2
      "
      onClick={() => startAddingNode(nodeIndex, parentNodeId, viaOptionIndex)}
    >
      {/* Plus icon */}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth="1.5"
        stroke="currentColor"
        className="h-5 w-5"
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
      </svg>
      <span className="text-sm font-medium">{label}</span>
    </button>
  );
};

export default AddNodeButton;
