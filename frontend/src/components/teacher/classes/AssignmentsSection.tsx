// /components/teacher/classes/AssignmentsSection.tsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import Container from '../../shared/Container';
import BoxBorder from '../../shared/BoxBorder';
import PrimaryButton from '../../shared/PrimaryButton';

interface AssignmentsSectionProps {
  classId: string;
}

const AssignmentsSection: React.FC<AssignmentsSectionProps> = ({ classId }) => {
  const navigate = useNavigate();
  return (
    <Container>
      <BoxBorder extraClasses="mxw-700 m-a g-20">
        <div className="flex justify-between items-center mb-4">
          <h2>Opdrachten</h2>
          <PrimaryButton onClick={() => navigate(`/teacher/classes/${classId}/add-assignment`)}>
            Nieuwe Opdracht
          </PrimaryButton>
        </div>
        <p>Hier komen de opdrachten voor deze klas.</p>
        <div className="bg-gray-100 p-4 rounded mt-4">
          <p className="text-gray-500">Nog geen opdrachten beschikbaar.</p>
        </div>
      </BoxBorder>
    </Container>
  );
};

export default AssignmentsSection;
