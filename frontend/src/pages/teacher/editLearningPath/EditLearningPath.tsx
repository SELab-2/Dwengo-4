import React, { useEffect, useState } from 'react';
import { LearningPath } from '../../../types/type';
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

const EditLearningPath: React.FC = () => {
  const [learningPath, setLearningPath] = useState<LearningPath | null>(null);
  const {
    isAddingNode,
    setOrderedNodes,
    orderedNodes,
    savePath,
    isSavingPath,
  } = useLPEditContext();

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
      setOrderedNodes(nodesData);
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
          onClick={() => {
            if (learningPathId) {
              savePath({ learningPathId, newNodes: orderedNodes });
            } else {
              console.error('Learning path is not defined');
            }
          }}
          disabled={isSavingPath}
        >
          {isSavingPath ? 'Saving...' : 'Confirm'}
        </button>
        <button
          className={`px-6 h-10 font-bold rounded-md bg-dwengo-red-200 text-white hover:bg-dwengo-red-dark hover:cursor-pointer`}
          disabled={isSavingPath}
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

export default EditLearningPath;
