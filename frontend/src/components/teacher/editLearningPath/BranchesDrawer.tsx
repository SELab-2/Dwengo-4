import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';

import NodeList from './NodeList';
import AddNodeButton from './AddNodeButton';
import { DraftNode } from '../../../context/LearningPathEditContext';
import type { LearningPathNodeWithObject } from '../../../types/type';
import { fetchLocalLearningObjectHtml } from '../../../util/teacher/localLearningObjects';

interface BranchesDrawerProps {
  mcNode: LearningPathNodeWithObject | DraftNode;
  onClose: () => void;
  openBranchesDrawer: (node: LearningPathNodeWithObject | DraftNode) => void;
}


const BranchesDrawer: React.FC<BranchesDrawerProps> = ({
  mcNode,
  onClose,
  openBranchesDrawer,
}) => {
  const { t } = useTranslation();

  // alleen lokale LO's ondersteunen hier
  const localId =
    'localLearningObjectId' in mcNode ? mcNode.localLearningObjectId : undefined;

  // HTML/JSON ophalen via react-query
  const {
    data: fetchedHtml,
    isLoading: isHtmlLoading,
    error: htmlFetchError,
  } = useQuery<string, Error>({
    queryKey: ['learningObjectHtml', localId],
    queryFn: () => fetchLocalLearningObjectHtml(localId!),
    enabled: !!localId,
  });

  // opties uit de JSON parseren
  const [options, setOptions] = useState<string[]>([]);
  useEffect(() => {
    if (!fetchedHtml) return;
    try {
      const parsed = JSON.parse(fetchedHtml);
      if (
        typeof parsed.prompt === 'string' &&
        Array.isArray(parsed.options)
      ) {
        setOptions(parsed.options);
      }
    } catch {
      // niet-JSON of onjuist formaat: negeren
    }
  }, [fetchedHtml]);

  // parentId van deze tak (nodeId of draftId)
  const parentId =
    'nodeId' in mcNode ? mcNode.nodeId : String((mcNode as DraftNode).draftId);

  const [activeTab, setActiveTab] = useState(0);

  return (
    <aside className="fixed left-0 top-0 h-full w-96 border-r bg-white shadow-lg z-50 p-6">
      {/* header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold">
          {/* TODO: translate */}Branches for “{mcNode.learningObject.title}”
        </h2>
        <button onClick={onClose} className="text-2xl leading-none">
          ✕
        </button>
      </div>

      {/* laad- en foutmeldingen */}
      {isHtmlLoading && (
        <p className="text-sm italic mb-4">
          {/* TODO: translate */}Loading question…
        </p>
      )}
      {htmlFetchError && (
        <p className="text-sm text-red-500 mb-4">
          {/* TODO: translate */}Error loading question
        </p>
      )}

      {/* zodra opties beschikbaar zijn */}
      {!isHtmlLoading && !htmlFetchError && options.length > 0 && (
        <>
          {/* tab-buttons tonen de echte antwoordtekst */}
          <div className="flex flex-wrap gap-2 mb-4">
            {options.map((opt, i) => (
              <button
                key={i}
                onClick={() => setActiveTab(i)}
                className={`px-3 py-1 rounded ${
                  activeTab === i ? 'bg-blue-600 text-white' : 'bg-gray-200'
                }`}
              >
                {String.fromCharCode(65 + i)}: {opt}
              </button>
            ))}
          </div>

          {/* NodeList voor deze branch- tak */}
          <div className="mb-4">
            <NodeList
              parentNodeId={parentId}
              viaOptionIndex={activeTab}
              openBranchesDrawer={openBranchesDrawer}
            />
          </div>

          {/* knop om nieuwe node aan deze tak toe te voegen */}
          <AddNodeButton
            nodeIndex={-1}
            label={/* TODO: translate */ 'Add node to branch'}
            parentNodeId={parentId}
            viaOptionIndex={activeTab}
          />
        </>
      )}

      {/* fallback als geen opties */}
      {!isHtmlLoading && !htmlFetchError && options.length === 0 && (
        <p className="text-sm italic">
          {/* TODO: translate */}No choices found for this question.
        </p>
      )}
    </aside>
  );
};

export default BranchesDrawer;
