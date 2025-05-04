import React, { useEffect, useState } from 'react';
import { LearningPath, LearningPathNodeWithObject } from '../../../types/type';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  fetchLocalLearningPath,
  fetchLocalLearningPathNodes,
} from '../../../util/teacher/httpLearningPaths';
import AddNodeButton from '../../../components/teacher/learningPath/AddNodeButton';
import SelectLearningObject from './SelectLearningObject';
import { useLPEditContext } from '../../../context/LearningPathEditContext';
import NodeList from '../../../components/teacher/learningPath/NodeList';

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
    <div className="flex max-h-[calc(100vh-80px)]">
      {/* Sidebar */}
      <div className="p-4 max-w-[416px] w-full bg-gray-50  max-h-[calc(100vh-80px)] min-h-[calc(100vh-80px)] overflow-y-scroll ">
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

      {/* Main content */}
      {isAddingNode && <SelectLearningObject />}
      {/* <div className="border-l border-gray-200 w-full p-6 pb-[74px] max-h-[calc(100vh-80px)] overflow-y-scroll">
        <div className="header">
          {!selectedLearningObject ? (
            <>
              <h3 className="w-fit mx-auto font-bold text-2xl">
                {learningPath?.title}
              </h3>
              <p className="py-2 pb-6 w-fit mx-auto">
                {learningPath?.description}
              </p>
            </>
          ) : (
            <div className="w-full max-w-3xl">
              <h4 className="text-2xl mb-4">{selectedLearningObject.title}</h4>
              <div
                className="prose max-w-none [&_img]:max-w-[200px] [&_img]:max-h-[400px] [&_img]:object-contain"
                dangerouslySetInnerHTML={{
                  __html: selectedLearningObject.raw || '',
                }}
              />
            </div>
          )}
        </div>
        <div className="fixed bottom-0 right-0 flex p-4 justify-end border-t border-l border-gray-200 bg-white w-[calc(100%-416px)] z-10">
          <button
            className="px-4 py-2 text-base font-normal rounded bg-blue-600 text-white border-none cursor-pointer transition-opacity duration-200 disabled:opacity-50"
            onClick={handleNextClick}
            disabled={!getNextLearningObject()}
          >
            {getNextLearningObject()
              ? `Up Next: ${getNextLearningObject()?.title}`
              : 'End of Path'}
          </button>
        </div>
      </div> */}
    </div>
  );
};

export default EditLearningPath;
