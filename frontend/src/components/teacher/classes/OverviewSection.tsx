// /components/teacher/classes/OverviewSection.tsx
import React, { useEffect, useRef, useState } from 'react';
import Container from '../../shared/Container';
import BoxBorder from '../../shared/BoxBorder';
import InputWithChecks from '../../shared/InputWithChecks';
import PrimaryButton from '../../shared/PrimaryButton';
import LoadingIndicatorButton from '../../shared/LoadingIndicatorButton';
import { validateRequired, validateForm } from '../../../util/shared/validation';

export interface OverviewSectionProps {
  classData: {
    id: string;
    name: string;
    code: string;
  };
  classId: string;
  onUpdateClassName: (newName: string) => void;
  isUpdating: boolean;
  onDeleteClass: () => void;
  onRegenerateJoinLink: () => void;
}

export interface InputWithChecksRef {
  validateInput: () => boolean;
  getValue: () => string;
}

const OverviewSection: React.FC<OverviewSectionProps> = ({
  classData,
  classId,
  onUpdateClassName,
  isUpdating,
  onDeleteClass,
  onRegenerateJoinLink,
}) => {
  const [className, setClassName] = useState(classData.name);
  const classNameRef = useRef<InputWithChecksRef | null>(null);

  useEffect(() => {
    setClassName(classData.name);
  }, [classData]);

  const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (classNameRef.current && classNameRef.current.validateInput()) {
      const newName = classNameRef.current.getValue();
      onUpdateClassName(newName);
    }
  };

  return (
    <>
      <Container>
        <BoxBorder>
          <h1>Klas Bewerken</h1>
          <form className="g-20" onSubmit={handleFormSubmit}>
            <InputWithChecks
              ref={classNameRef}
              label="Klasnaam"
              inputType="text"
              validate={(value: string) => validateForm(value, [validateRequired])}
              placeholder="Voer de naam van de klas in"
              value={className}
            />
            <div className="flex gap-4">
              <PrimaryButton type="submit" disabled={isUpdating}>
                Opslaan
                {isUpdating && <LoadingIndicatorButton />}
              </PrimaryButton>
              <button
                type="button"
                className="px-7 h-10 font-bold rounded-md bg-red-500 text-white hover:bg-red-700 hover:cursor-pointer"
                onClick={onDeleteClass}
              >
                Klas Verwijderen
              </button>
            </div>
          </form>
        </BoxBorder>
      </Container>
      <Container>
        <BoxBorder extraClasses="">
          <h2>Klas Code: {classData.code}</h2>
          <p>Deel deze code met leerlingen om ze uit te nodigen voor deze klas.</p>
          <PrimaryButton
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded mt-2"
            onClick={onRegenerateJoinLink}
          >
            Genereer Nieuwe Code
          </PrimaryButton>
        </BoxBorder>
      </Container>
    </>
  );
};

export default OverviewSection;
