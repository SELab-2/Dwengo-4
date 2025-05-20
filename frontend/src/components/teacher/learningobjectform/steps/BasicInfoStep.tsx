import InputWithChecks from '../../../shared/InputWithChecks';
import { FormStepProps } from '../types';
import React from 'react';

const BasicInfoStep: React.FC<FormStepProps> = ({
  titleRef,
  descriptionRef,
  step1Data,
}) => (
  <>
    <h3 className="text-xl font-medium">Basic Info</h3>
    <InputWithChecks
      ref={titleRef}
      label="Title"
      value={step1Data.title}
      validate={(v) => (!v.trim() ? 'Title is required' : null)}
    />

    <InputWithChecks
      ref={descriptionRef}
      label="Description"
      inputType="textarea"
      value={step1Data.description}
      validate={(v) => (!v.trim() ? 'Description is required' : null)}
    />
  </>
);

export default BasicInfoStep;
