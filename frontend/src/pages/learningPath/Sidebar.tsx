/* Sidebar.tsx */
import React from "react";
import { LearningPath } from "../../types/type";
import PathHeader from "./PathHeader";
import Legend from "./Legend";
import LearningObjectsList, { BranchItem } from "./LearningObjectsList";

interface Props {
  t: (key: string) => string;
  learningPath: LearningPath | null;
  items?: BranchItem[];
  selectedNodeId: string | null;
  progress: number;
  isStudent: boolean;
  isLoadingPath: boolean;
  isErrorPath: boolean;
  errorPath: any;
  isLoadingLO: boolean;
  isErrorLO: boolean;
  errorLO: any;
  /** Klik‐handler met nodeId */
  onSelectNode: (nodeId: string) => void;
}

const Sidebar: React.FC<Props> = ({
  t,
  learningPath,
  items,
  selectedNodeId,
  progress,
  isStudent,
  isLoadingPath,
  isErrorPath,
  errorPath,
  isLoadingLO,
  isErrorLO,
  errorLO,
  onSelectNode,
}) => (
  <aside className="p-4 space-y-5 max-w-[405px] w-full overflow-y-scroll bg-white">
    <PathHeader
      t={t}
      learningPath={learningPath}
      isLoading={isLoadingPath}
      isError={isErrorPath}
      error={errorPath}
      progress={progress}
      isStudent={isStudent}
    />

    <Legend t={t} />

    <LearningObjectsList
      t={t}
      items={items}
      selectedNodeId={selectedNodeId}
      isLoading={isLoadingLO}
      isError={isErrorLO}
      error={errorLO}
      onSelectNode={onSelectNode}
    />
  </aside>
);

export default Sidebar;
