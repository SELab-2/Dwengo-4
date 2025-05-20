import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Container from '../../shared/Container';
import BoxBorder from '../../shared/BoxBorder';
import PrimaryButton from '../../shared/PrimaryButton';

interface AssignmentsSectionProps {
  classId: string;
  assignments: any[] | undefined;
  loading: boolean;
  error: boolean;
  errorMessage: unknown;
  filtered: any[];
  setFiltered: (arr: any[]) => void;
}

const AssignmentsSection: React.FC<AssignmentsSectionProps> = ({
  classId,
  assignments,
  loading,
  error,
  errorMessage,
  filtered,
  setFiltered,
}) => {
  const navigate = useNavigate();
  return (
    <Container>
      <BoxBorder extraClasses="mxw-700 m-a g-20">
        <div className="flex justify-between items-center mb-4">
          <h2>Opdrachten</h2>
          <Link to={`/teacher/classes/\${classId}/add-assignment`}>
            <PrimaryButton>Nieuwe Opdracht</PrimaryButton>
          </Link>
        </div>

        <div>
          <input
            type="text"
            placeholder="Zoek opdrachten..."
            className="w-full p-2 mb-4 border rounded"
            onChange={(e) => {
              const q = e.target.value.toLowerCase();
              const f =
                assignments?.filter((a: any) =>
                  a.title.toLowerCase().includes(q),
                ) || [];
              setFiltered(f);
            }}
          />

          {loading ? (
            <div>Opdrachten laden...</div>
          ) : error ? (
            <div className="text-red-500">Error: {String(errorMessage)}</div>
          ) : !filtered.length ? (
            <div className="bg-gray-100 p-4 rounded">
              <p className="text-gray-500">Geen opdrachten gevonden</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {filtered.map((assignment: any) => (
                <div
                  key={assignment.id}
                  onClick={() => navigate(`/teacher/assignment/\${assignment.id}`)}
                  className="p-4 border rounded hover:bg-gray-50 cursor-pointer transition-colors"
                >
                  <h3 className="font-bold">{assignment.title}</h3>
                  <p className="text-gray-600">{assignment.description}</p>
                  <div className="mt-2 text-sm text-gray-500">
                    Deadline: {new Date(assignment.deadline).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </BoxBorder>
    </Container>
  );
};

export default AssignmentsSection;
