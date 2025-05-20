import React from 'react';
import Container from '../../shared/Container';
import BoxBorder from '../../shared/BoxBorder';
import InputWithChecks from '../../shared/InputWithChecks';
import PrimaryButton from '../../shared/PrimaryButton';
import LoadingIndicatorButton from '../../shared/LoadingIndicatorButton';
import { validateForm, validateRequired } from '../../../util/shared/validation';

interface InputWithChecksRef {
  validateInput: () => boolean;
  getValue: () => string;
}

interface OverviewSectionProps {
  classId: string;
  className: string;
  classCode: string | undefined;
  classNameRef: React.RefObject<InputWithChecksRef>;
  isSaving: boolean;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  onDelete: () => void;
  onRegenerateCode: () => Promise<void>;
}

const OverviewSection: React.FC<OverviewSectionProps> = ({
  classId,
  className,
  classCode,
  classNameRef,
  isSaving,
  onSubmit,
  onDelete,
  onRegenerateCode,
}) => (
  <>
    <Container>
      <BoxBorder extraClasses="mxw-700 m-a g-20">
        <h2>Huidige klasnaam: {className}</h2>
      </BoxBorder>
      <BoxBorder>
        <h1>Klas Bewerken</h1>
        <form className="g-20" onSubmit={onSubmit}>
          <InputWithChecks
            ref={classNameRef}
            label="Klasnaam"
            inputType="text"
            validate={(v: string) => validateForm(v, [validateRequired])}
            placeholder="Voer de naam van de klas in"
            value={className}
          />
          <div className="flex gap-4">
            <PrimaryButton type="submit" disabled={isSaving}>
              Opslaan
              {isSaving && <LoadingIndicatorButton />}
            </PrimaryButton>
            <button
              type="button"
              className="px-7 h-10 font-bold rounded-md bg-red-500 text-white hover:bg-red-700"
              onClick={onDelete}
            >
              Klas Verwijderen
            </button>
          </div>
        </form>
      </BoxBorder>
    </Container>

    <Container>
      <BoxBorder>
        <h2>Klas Code: {classCode}</h2>
        <p>Deel deze code met leerlingen om ze uit te nodigen voor deze klas.</p>
        <PrimaryButton
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded mt-2"
          onClick={onRegenerateCode}
        >
          Genereer Nieuwe Code
        </PrimaryButton>
      </BoxBorder>
    </Container>
  </>
);

export default OverviewSection;
