import React, { useEffect, useImperativeHandle, useRef, useState } from 'react';
import { LearningPath } from '../../../types/type';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  fetchLocalLearningPath,
  fetchLocalLearningPathNodes,
} from '../../../util/teacher/httpLearningPaths';
import AddNodeButton from '../../../components/teacher/editLearningPath/AddNodeButton';
import SelectLearningObject from './SelectLearningObject';
import { useLPEditContext } from '../../../context/LearningPathEditContext';
import NodeList from '../../../components/teacher/editLearningPath/NodeList';

interface LearningPathDetailsRef {
  title: string;
  description: string;
  language: string;
  image: string | null;
  validateInput: () => boolean;
}

interface LearningPathDetailsProps {
  pathDetailsRef: React.RefObject<LearningPathDetailsRef | null>;
  initialTitle?: string;
  initialDescription?: string;
  initialLanguage?: string;
  initialImage?: string | null;
}

const LearningPathDetails: React.FC<LearningPathDetailsProps> = ({
  pathDetailsRef,
  initialTitle,
  initialDescription,
  initialLanguage,
  initialImage,
}) => {
  const [title, setTitle] = useState<string>(initialTitle || '');
  const [language, setLanguage] = useState<string>(initialLanguage || 'nl'); // todo: default to currently selected language
  const [description, setDescription] = useState<string>(
    initialDescription || '',
  );
  const [image, setImage] = useState<string | null>(initialImage || null);
  const [isValid, setIsValid] = useState<boolean>(true);

  useImperativeHandle(
    pathDetailsRef,
    () => ({
      title,
      language,
      description,
      image,
      validateInput: () => {
        setIsValid(!!title && !!language);
        return isValid;
      },
    }),
    [title, language, description, image],
  );

  return (
    <div className="pl-1 space-y-1">
      <input
        placeholder="Add learning path title"
        value={title}
        onChange={(e) => setTitle(e.target.value.trimStart())}
        className={`
          w-full bg-gray-50 hover:bg-gray-50 focus:bg-white transition-all text-xl p-1 focus:outline-none
          ${
            !title && !isValid
              ? 'border-red-500 border-2 placeholder-red-300'
              : `border-gray-300 focus:ring-1 focus:ring-gray-200 hover:border-gray-300 
                ${title ? 'border-transparent focus:border-gray-300' : 'border-gray-300'}`
          }
        `}
      />
      <textarea
        id="description"
        name="description"
        onChange={(e) => setDescription(e.target.value.trimStart())}
        value={description}
        placeholder="Add a description (optional)"
        className={`
          w-full bg-gray-50 hover:bg-gray-50 focus:bg-white transition-all
          focus:outline-none focus:ring-1 focus:ring-gray-200 text-sm p-1 hover:border-gray-300
          ${description ? 'border-transparent focus:hover:border-gray-300' : 'border-gray-300'}
        `}
      ></textarea>
    </div>
  );
};

const EditLearningPath: React.FC = () => {
  const navigate = useNavigate();
  const pathDetailsRef = useRef<LearningPathDetailsRef | null>(null);
  const {
    isAddingNode,
    setOrderedNodes,
    orderedNodes,
    savePath,
    isSavingPath,
    isCreateMode,
  } = useLPEditContext();

  const { learningPathId } = useParams<{ learningPathId: string }>();
  // can only happen if `isCreateMode` is set incorrectly, adding a check just in case
  if (!isCreateMode && !learningPathId) {
    return (
      <div className="p-6">
        <h2 className="text-xl font-bold text-dwengo-red">Error</h2>
        <p>Cannot edit learning path: missing learning path ID parameter</p>
        <button
          className="mt-4 px-4 py-2 bg-gray-200 rounded hover:cursor-pointer"
          onClick={() => navigate('/teacher/learning-paths')}
        >
          Back to Learning Paths
        </button>
      </div>
    );
  }

  const {
    data: learningPathData,
    isLoading: isLoadingPath,
    isError: isErrorPath,
    error: errorPath,
  } = useQuery<LearningPath>({
    queryKey: ['learningPaths', learningPathId],
    queryFn: () => fetchLocalLearningPath(learningPathId!),
    enabled: !isCreateMode && !!learningPathId, // only fetch path if in create mode
  });

  const {
    data: nodesData,
    isLoading: isLoadingNodes,
    isError: isErrorNodes,
    error: errorNodes,
  } = useQuery({
    queryKey: ['learningPathNodes', learningPathId],
    queryFn: () => fetchLocalLearningPathNodes(learningPathId!),
    enabled: !isCreateMode && !!learningPathId, // only fetch nodes if not in create mode
  });

  // initialize orderedNodes when nodesData is fetched
  useEffect(() => {
    if (nodesData) {
      setOrderedNodes(nodesData);
    }
  }, [nodesData]);

  const handleSavePath = () => {
    // make sure all required fields are filled before trying to save the path
    if (pathDetailsRef.current && pathDetailsRef.current.validateInput()) {
      savePath({
        newTitle: pathDetailsRef.current.title,
        newDescription: pathDetailsRef.current.description,
        newLanguage: pathDetailsRef.current.language,
        newImage: pathDetailsRef.current.image,
        newNodes: orderedNodes,
        learningPathId,
      });
    }
  };

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <div
        className={`p-4 space-y-3 max-w-[405px] w-full bg-gray-50 overflow-y-scroll`}
      >
        {/* path details */}
        {isLoadingPath && !isCreateMode ? (
          <p className="text-gray-500">Loading learning path details...</p>
        ) : isErrorPath ? (
          <p>Error: {errorPath?.message}</p>
        ) : (
          <LearningPathDetails
            pathDetailsRef={pathDetailsRef}
            initialTitle={learningPathData?.title}
            initialDescription={learningPathData?.description}
            initialLanguage={learningPathData?.language}
            initialImage={learningPathData?.image}
          />
        )}
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

      {/* Confirm / Cancel edit */}
      <div
        className={`fixed bottom-0 right-0 flex gap-2.5 p-2.5 justify-end border-t border-gray-200 bg-white w-full`}
      >
        <button
          className={`px-6 h-10 font-bold rounded-md text-white bg-dwengo-green hover:bg-dwengo-green-dark hover:cursor-pointer`}
          onClick={handleSavePath}
          disabled={isSavingPath}
        >
          {isSavingPath ? 'Saving...' : 'Confirm'}
        </button>
        <button
          className={`px-6 h-10 font-bold rounded-md bg-dwengo-red-200 text-white hover:bg-dwengo-red-dark hover:cursor-pointer`}
          disabled={isSavingPath}
          onClick={() => navigate(-1)}
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

export default EditLearningPath;
