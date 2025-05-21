/* LearningObjectsList.tsx */
import React from "react";
import { LearningObject } from "../../types/type";

export interface BranchItem {
  nodeId: string;
  lo: LearningObject;
}

interface Props {
  t: (key: string) => string;
  items?: BranchItem[];
  /** De nodeId die actief moet zijn */
  selectedNodeId: string | null;
  isLoading: boolean;
  isError: boolean;
  error: any;
  /** Klik handler ontvangt een nodeId  */
  onSelectNode: (nodeId: string) => void;
}

const LearningObjectsList: React.FC<Props> = ({
  t,
  items,
  selectedNodeId,
  isLoading,
  isError,
  error,
  onSelectNode,
}) => (
  <div className="rounded-md border border-gray-200 overflow-hidden">
    {isLoading ? (
      <p className="p-4">{t("learning_objects.loading")}</p>
    ) : isError ? (
      <p className="p-4">Error: {error.message}</p>
    ) : (
      <div className="flex flex-col overflow-y-auto">
        {items?.map(({ nodeId, lo }) => (
          <button
            key={nodeId}
            onClick={() => onSelectNode(nodeId)}
            className={`
              p-4 text-base border-b border-gray-200 text-left
              transition-colors duration-200 hover:cursor-pointer
              ${
                lo.teacherExclusive
                  ? "bg-dwengo-green-transparent-light hover:bg-dwengo-green-transparent-dark"
                  : "hover:bg-gray-100"
              }
              ${selectedNodeId === nodeId ? "inset-shadow-sm" : ""}
            `}
          >
            <div
              className={`
                flex items-center justify-between bg-transparent
                ${
                  selectedNodeId === nodeId
                    ? "font-extrabold border-l-[4px] border-l-black pl-4"
                    : ""
                }
              `}
            >
              <span>{lo.title}</span>
              {lo.estimatedTime && (
                <span className="text-base pr-2">{lo.estimatedTime}'</span>
              )}
            </div>
          </button>
        ))}
      </div>
    )}
  </div>
);

export default LearningObjectsList;
