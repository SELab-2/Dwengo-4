import { DndProvider } from 'react-dnd';
import NodeComponent from './NodeComponent';
import React from 'react';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { LearningPathNodeWithObject } from '../../../types/type';

interface NodeListProps {
  nodes: LearningPathNodeWithObject[];
}

const NodeList: React.FC<NodeListProps> = ({ nodes }) => {
  const [orderedNodes, setOrderedNodes] =
    React.useState<LearningPathNodeWithObject[]>(nodes);

  const moveNode = (dragIndex: number, hoverIndex: number) => {
    const updatedNodes = Array.from(orderedNodes);
    const [removed] = updatedNodes.splice(dragIndex, 1); // remove node being dragged from orderedNodes
    updatedNodes.splice(hoverIndex, 0, removed); // insert it at the new index
    setOrderedNodes(updatedNodes);
  };

  return (
    <>
      <p className="text-gray-500">
        hover over a node to add a new node below it
      </p>
      <DndProvider backend={HTML5Backend}>
        {orderedNodes.map((node, index) => (
          <NodeComponent
            key={node.nodeId}
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
