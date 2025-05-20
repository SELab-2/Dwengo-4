import React, { useState } from 'react';
import InputWithChecks from '../../../shared/InputWithChecks';
import { FormStepProps } from '../types';

const UsageSettingsStep: React.FC<FormStepProps> = ({
  licenceRef,
  copyrightRef,
  difficultyRef,
  estimatedTimeRef,
  contentLocationRef,
  step1Data,
}) => {
  const [showAdvanced, setShowAdvanced] = useState(false);

  return (
    <>
      <h3 className="text-xl font-medium mb-4">Usage Settings</h3>

      {/* Always visible fields */}
      <InputWithChecks
        ref={difficultyRef}
        label="Difficulty (1-5)"
        inputType="number"
        min={1}
        max={5}
        value={step1Data.difficulty.toString()}
        validate={(val) => {
          const n = Number(val);
          if (isNaN(n) || n < 1 || n > 5) return 'Value moet tussen 1 en 5 liggen';
          return null;
        }}
      />
      <InputWithChecks
        ref={estimatedTimeRef}
        label="Estimated Time (min)"
        inputType="number"
        value={step1Data.estimatedTime.toString()}
        validate={(val) => {
          const n = Number(val);
          if (isNaN(n) || n < 0) return 'Voer een geldig aantal minuten in';
          return null;
        }}
      />

      {/* Advanced settings toggle */}
      <button
        type="button"
        className="mt-4 mb-2 text-sm text-blue-600 hover:underline"
        onClick={() => setShowAdvanced(prev => !prev)}
      >
        {showAdvanced ? 'Hide advanced settings' : 'Show advanced settings'}
      </button>

      {showAdvanced && (
        <div className="advanced-settings space-y-4">
          <InputWithChecks
            ref={licenceRef}
            label="Licence (optional)"
            value={step1Data.licence}
          />
          <InputWithChecks
            ref={copyrightRef}
            label="Copyright (optional)"
            value={step1Data.copyright}
          />
          <InputWithChecks
            ref={contentLocationRef}
            label="Content Location (optional)"
            value={step1Data.contentLocation}
          />
        </div>
      )}
    </>
  );
};

export default UsageSettingsStep;
