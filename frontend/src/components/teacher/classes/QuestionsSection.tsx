// /components/teacher/classes/QuestionsSection.tsx
import React from 'react';
import Container from '../../shared/Container';
import BoxBorder from '../../shared/BoxBorder';

const QuestionsSection: React.FC = () => {
  return (
    <Container>
      <BoxBorder extraClasses="mxw-700 m-a g-20">
        <h2>Vragen</h2>
        <p>Hier komen de vragen van leerlingen.</p>
        <div className="bg-gray-100 p-4 rounded mt-4">
          <p className="text-gray-500">Nog geen vragen beschikbaar.</p>
        </div>
      </BoxBorder>
    </Container>
  );
};

export default QuestionsSection;
