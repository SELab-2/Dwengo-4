import InputWithChecks from '../../../shared/InputWithChecks';
import { FormStepProps } from '../types';
import React from 'react';

const UsageSettingsStep: React.FC<FormStepProps> = ({
  licenceRef,
  copyrightRef,
  difficultyRef,
  estimatedTimeRef,
  contentLocationRef,
  step1Data,
}) => (
  <>
    <h3 className="text-xl font-medium">Usage Settings</h3>

    <InputWithChecks ref={licenceRef} label="Licence" value={step1Data.licence} />
    <InputWithChecks ref={copyrightRef} label="Copyright" value={step1Data.copyright} />
    <InputWithChecks
      ref={difficultyRef}
      label="Difficulty (1-5)"
      inputType="number"
      value={step1Data.difficulty.toString()}
    />
    <InputWithChecks
      ref={estimatedTimeRef}
      label="Estimated Time (min)"
      inputType="number"
      value={step1Data.estimatedTime.toString()}
    />
    <InputWithChecks
      ref={contentLocationRef}
      label="Content Location"
      value={step1Data.contentLocation}
    />
  </>
);

export default UsageSettingsStep;
