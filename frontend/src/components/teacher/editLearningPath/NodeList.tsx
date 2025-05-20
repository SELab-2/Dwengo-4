import { DndProvider } from 'react-dnd';
import NodeComponent from './NodeComponent';
import React from 'react';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { useLPEditContext } from '../../../context/LearningPathEditContext';
import { useTranslation } from 'react-i18next';

const NodeList: React.FC = () => {
  const { t } = useTranslation();
  const { orderedNodes, setOrderedNodes } = useLPEditContext();

  const moveNode = (dragIndex: number, hoverIndex: number) => {
    const updatedNodes = Array.from(orderedNodes);
    const [removed] = updatedNodes.splice(dragIndex, 1); // remove node being dragged from orderedNodes
    updatedNodes.splice(hoverIndex, 0, removed); // insert it at the new index
    setOrderedNodes(updatedNodes);
  };

  return (
    <>
      <div className="flex items-center gap-1 mb-2 text-gray-400">
        {/* informational icon */}
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
        <span className="text-xs cursor-default">
          {t('edit_learning_path.node_list_instructions')}
        </span>
      </div>
      <DndProvider backend={HTML5Backend}>
        {orderedNodes.map((node, index) => (
          <NodeComponent
            key={'nodeId' in node ? node.nodeId : node.draftId} // use draftId for draft nodes
            node={node}
            index={index}
            moveNode={moveNode}
            onOpenLearningObject={() => console.log('Open learning object')}
          />
        ))}
      </DndProvider>
    </>
  );
};

export default NodeList;
