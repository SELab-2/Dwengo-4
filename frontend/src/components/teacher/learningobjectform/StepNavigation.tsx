import PrimaryButton from '../../shared/PrimaryButton';
import SecondaryButton from '../../shared/SecondaryButton';
import LoadingIndicatorButton from '../../shared/LoadingIndicatorButton';
import { StepNavProps } from './types';
import React from 'react';

const StepNavigation: React.FC<StepNavProps> = ({
  step,
  subStep,
  setSubStep,
  setStep,
  handleNext,
  isLoading,
  isQuestionType,
  questionState,
  step1Data,
  onCancel,
}) => {
  const disableSubmit =
    isQuestionType(step1Data.contentType) &&
    (!questionState.prompt.trim() ||
      (step1Data.contentType === 'EVAL_MULTIPLE_CHOICE' &&
        (questionState.options.filter((o) => o.trim()).length < 2 ||
          questionState.options.some((o) => !o.trim()))));

  return (
    <div className="flex flex-wrap gap-4 mt-6">
      {step === 1 && subStep > 1 && (
        <SecondaryButton type="button" onClick={() => setSubStep((s) => s - 1)}>
          Back
        </SecondaryButton>
      )}

      {step === 2 && (
        <SecondaryButton
          type="button"
          onClick={() => {
            setStep(1);
            setSubStep(4);
          }}
        >
          Back
        </SecondaryButton>
      )}

      <div className="flex-1" />

      {step === 1 && (
        <PrimaryButton type="button" onClick={handleNext}>
          {subStep < 4 ? 'Next' : 'Continue'}
        </PrimaryButton>
      )}

      {step === 2 && (
        <PrimaryButton type="submit" disabled={disableSubmit}>
          {isLoading ? (
            <>
              Saving
              <LoadingIndicatorButton />
            </>
          ) : (
            'Save'
          )}
        </PrimaryButton>
      )}

      <SecondaryButton type="button" onClick={onCancel}>
        Cancel
      </SecondaryButton>
    </div>
  );
};

export default StepNavigation;
