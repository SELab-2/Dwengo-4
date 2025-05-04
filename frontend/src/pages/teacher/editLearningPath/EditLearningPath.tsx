import React, { useEffect, useState } from 'react';
import { LearningPath, LearningPathNodeWithObject } from '../../../types/type';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  fetchLocalLearningPath,
  fetchLocalLearningPathNodes,
} from '../../../util/teacher/httpLearningPaths';
import AddNodeButton from '../../../components/teacher/editLearningPath/AddNodeButton';
import SelectLearningObject from './SelectLearningObject';
import { useLPEditContext } from '../../../context/LearningPathEditContext';
import NodeList from '../../../components/teacher/editLearningPath/NodeList';

const getOrderedNodes = (nodes: LearningPathNodeWithObject[]) => {
  const nodeMap = new Map(nodes.map((node) => [node.nodeId, node]));
  const startNode = nodes.find((node) => node.start_node);

  const orderedNodes = [];
  let currentNode = startNode;

  while (currentNode) {
    orderedNodes.push(currentNode);

    // check if there's at least one transition
    if (!currentNode.transitions || currentNode.transitions.length === 0) {
      break; // stop adding nodes if there are no transitions
    }

    const nextNodeId = currentNode.transitions[0].nextNodeId; // assumes the first transition is the default one
    currentNode = nextNodeId ? nodeMap.get(nextNodeId) : undefined;
  }

  return orderedNodes;
};

const EditLearningPath: React.FC = () => {
  const [learningPath, setLearningPath] = useState<LearningPath | null>(null);
  const { isAddingNode, setOrderedNodes, orderedNodes } = useLPEditContext();

  const { learningPathId } = useParams<{ learningPathId: string }>();
  // handle undefined learningPathId
  if (!learningPathId) {
    return (
      <div>
        <h1>Error</h1>
        <p>Learning Path ID is missing.</p>
      </div>
    );
  }

  const {
    data: thisLearningPath,
    isLoading: isLoadingPath,
    isError: isErrorPath,
    error: errorPath,
  } = useQuery<LearningPath>({
    queryKey: ['learningPaths', learningPathId],
    queryFn: () => fetchLocalLearningPath(learningPathId!),
  });

  const {
    data: nodesData,
    isLoading: isLoadingNodes,
    isError: isErrorNodes,
    error: errorNodes,
  } = useQuery({
    queryKey: ['learningPathNodes', learningPathId],
    queryFn: () => fetchLocalLearningPathNodes(learningPathId!),
  });

  // initialize orderedNodes when nodesData is fetched
  useEffect(() => {
    if (nodesData) {
      const ordered = getOrderedNodes(nodesData);
      setOrderedNodes(ordered);
    }
  }, [nodesData]);

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <div className={`p-4 max-w-[405px] w-full bg-gray-50 overflow-y-scroll`}>
        <div className="rounded-lg border border-gray-200 p-2.5 bg-white">
          {isLoadingNodes ? (
            <p>Loading learning objects...</p>
          ) : isErrorNodes ? (
            <p>Error: {errorNodes?.message}</p>
          ) : orderedNodes.length == 0 ? (
            <AddNodeButton nodeIndex={0} label="Add Node" />
          ) : (
            <NodeList />
          )}
        </div>
      </div>

      {/* LO selection screen */}
      {isAddingNode && <SelectLearningObject />}

      {/* Confirm / Candel edit */}
      <div
        className={`fixed bottom-0 right-0 flex gap-2.5 p-2.5 justify-end border-t border-gray-200 bg-white w-full`}
      >
        <button
          className={`px-6 h-10 font-bold rounded-md text-white bg-dwengo-green hover:bg-dwengo-green-dark hover:cursor-pointer`}
        >
          Confirm
        </button>
        <button
          className={`px-6 h-10 font-bold rounded-md bg-dwengo-red-200 text-white hover:bg-dwengo-red-dark hover:cursor-pointer`}
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

export default EditLearningPath;
