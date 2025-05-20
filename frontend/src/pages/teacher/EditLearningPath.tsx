import React, { useEffect, useRef, useState } from 'react';
import { LearningPath, LearningPathNodeWithObject } from '../../types/type';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  fetchLocalLearningPath,
  fetchLocalLearningPathNodes,
} from '../../util/teacher/localLearningPaths';
import AddNodeButton from '../../components/teacher/editLearningPath/AddNodeButton';
import SelectLearningObject from '../../components/teacher/editLearningPath/SelectLearningObject';
import { DraftNode, useLPEditContext } from '../../context/LearningPathEditContext';
import NodeList from '../../components/teacher/editLearningPath/NodeList';
import BranchesDrawer from '../../components/teacher/editLearningPath/BranchesDrawer'; // TODO: implement this
import {
  LearningPathDetails,
  LearningPathDetailsRef,
} from '@/components/teacher/editLearningPath/LearningPathDetails';
import { useTranslation } from 'react-i18next';

const EditLearningPath: React.FC = () => {
  const { t } = useTranslation();
  // error message to ensure at least one node is added before saving
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [branchNode, setBranchNode] = useState<
    LearningPathNodeWithObject | DraftNode | null
  >(null); // track which MC-node’s branches to edit

  const navigate = useNavigate();
  const pathDetailsRef = useRef<LearningPathDetailsRef | null>(null);
  
  const {
    isAddingNode,
    setOrderedNodes,
    orderedNodes,
    savePath,
    isSavingPath,
    isCreateMode,
    language,
    setLanguage,
  } = useLPEditContext();
  const { learningPathId } = useParams<{ learningPathId: string }>();

  const {
    data: learningPathData,
    isLoading: isLoadingPath,
    isError: isErrorPath,
    error: errorPath,
  } = useQuery<LearningPath>({
    queryKey: ['learningPaths', learningPathId],
    queryFn: () => fetchLocalLearningPath(learningPathId!),
    enabled: !isCreateMode && !!learningPathId,
  });

  const {
    data: nodesData,
    isLoading: isLoadingNodes,
    isError: isErrorNodes,
    error: errorNodes,
  } = useQuery({
    queryKey: ['learningPathNodes', learningPathId],
    queryFn: () => fetchLocalLearningPathNodes(learningPathId!),
    enabled: !isCreateMode && !!learningPathId,
  });

  // initialize orderedNodes when nodesData is fetched
  useEffect(() => {
    if (nodesData) {
      setOrderedNodes(nodesData);
    }
  }, [nodesData]);

  useEffect(() => {
    if (learningPathData) {
      setLanguage(learningPathData.language);
    }
  }, [learningPathData]);

  // dismiss error message after 5 seconds
  useEffect(() => {
    if (errorMessage) {
      const timer = setTimeout(() => {
        setErrorMessage(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [errorMessage]);

  const handleSavePath = () => {
    if (!pathDetailsRef.current || !pathDetailsRef.current.validateInput()) {
      return;
    }
    if (orderedNodes.length === 0) {
      setErrorMessage(t('edit_learning_path.no_nodes_error'));
      return;
    }
    setErrorMessage(null);
    savePath({
      newTitle: pathDetailsRef.current.title,
      newDescription: pathDetailsRef.current.description,
      newLanguage: language,
      newImage: pathDetailsRef.current.image,
      newNodes: orderedNodes,
      learningPathId,
    });
  };

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <div className="p-4 space-y-3 max-w-[405px] w-full bg-gray-50 overflow-y-scroll">
        {/* path details */}
        {isLoadingPath && !isCreateMode ? (
          <p className="text-gray-500">
            {t('edit_learning_path.loading_path_details')}
          </p>
        ) : isErrorPath ? (
          <p>Error: {errorPath?.message}</p>
        ) : (
          <LearningPathDetails
            pathDetailsRef={pathDetailsRef}
            initialTitle={learningPathData?.title}
            initialDescription={learningPathData?.description}
            initialImage={learningPathData?.image}
          />
        )}

        {errorMessage && (
          <div
            className="bg-red-100 border border-dwengo-red-dark text-dwengo-red-darker px-3 py-2 rounded relative mb-4"
            role="alert"
          >
            <span className="block sm:inline text-sm cursor-default">
              {errorMessage}
            </span>
            <span
              className="absolute top-0 bottom-0 right-0 px-4 py-3 hover:cursor-pointer"
              onClick={() => setErrorMessage(null)}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 20 20"
                strokeWidth="2"
                stroke="currentColor"
                className="size-4"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18 18 6M6 6l12 12"
                />
              </svg>
            </span>
          </div>
        )}

        <div className="rounded-lg border border-gray-200 p-2.5 bg-white">
          {isLoadingNodes ? (
            <p>{t('edit_learning_path.loading_objects')}</p>
          ) : isErrorNodes ? (
            <p>Error: {errorNodes?.message}</p>
          ) : orderedNodes.length === 0 ? (
            <AddNodeButton
              nodeIndex={0}
              label={t('edit_learning_path.add_node')}
            />
          ) : (
            <NodeList
              parentNodeId={null}
              viaOptionIndex={null}
              openBranchesDrawer={setBranchNode}
            />
          )}
        </div>
      </div>

      {/* LO selection screen */}
      {isAddingNode && <SelectLearningObject />}

      {/* Branches drawer */}
      {branchNode && (
        <BranchesDrawer
          mcNode={branchNode}
          onClose={() => setBranchNode(null)}
          openBranchesDrawer={setBranchNode}
        />
      )}

      {/* Confirm / Cancel edit */}
      <div className="fixed bottom-0 right-0 flex gap-2.5 p-2.5 justify-end border-t border-gray-200 bg-white w-full">
        <button
          className="px-6 h-10 font-bold rounded-md text-white bg-dwengo-green hover:bg-dwengo-green-dark hover:cursor-pointer"
          onClick={handleSavePath}
          disabled={isSavingPath}
        >
          {isSavingPath
            ? t('edit_learning_path.saving')
            : t('edit_learning_path.confirm')}
        </button>
        <button
          className="px-6 h-10 font-bold rounded-md bg-dwengo-red-200 text-white hover:bg-dwengo-red-dark hover:cursor-pointer"
          disabled={isSavingPath}
          onClick={() => navigate(-1)}
        >
          {t('edit_learning_path.cancel')}
        </button>
      </div>
    </div>
  );
};

export default EditLearningPath;
