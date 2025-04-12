import React from 'react';
import { useParams } from 'react-router-dom';
import AssignmentsForClassOverview from '../../components/student/AssignmentClassOverview';

const StudentClassIndex: React.FC = () => {
  const { classId } = useParams<{ classId: string }>();

  return (
    <>
      <div className="px-10 bg-gray-300">
        <div className="text-6xl pt-12 font-bold">Naam klas TODO</div>

        <h2 className="mt-8 text-2xl font-bold">Opdrachten</h2>
        <div className="w-full mt-4 overflow-x-auto ">
          <AssignmentsForClassOverview classId={classId} />
        </div>
      </div>
    </>
  );
};

export default StudentClassIndex;
