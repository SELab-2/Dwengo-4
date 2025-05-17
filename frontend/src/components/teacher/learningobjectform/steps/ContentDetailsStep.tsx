import InputWithChecks from '../../../shared/InputWithChecks';
import { FormStepProps } from '../types';
import { ContentType } from '../../../../util/teacher/localLearningObjects';
import React from 'react';

const ContentDetailsStep: React.FC<FormStepProps> = ({
  contentTypeRef,
  keywordsRef,
  targetAgesRef,
  skosRef,
  step1Data,
}) => (
  <>
    <h3 className="text-xl font-medium">Content Details</h3>

    <div>
      <label className="block mb-1">Content Type</label>
      <select
        ref={contentTypeRef}
        defaultValue={step1Data.contentType}
        className="w-full border rounded p-2"
      >
        {Object.values(ContentType).map((ct) => (
          <option key={ct} value={ct}>
            {ct}
          </option>
        ))}
      </select>
    </div>

    <InputWithChecks
      ref={keywordsRef}
      label="Keywords (comma-separated)"
      value={step1Data.keywords.join(',')}
    />

    <InputWithChecks
      ref={targetAgesRef}
      label="Target Ages (comma-separated)"
      value={step1Data.targetAges.join(',')}
    />

    <InputWithChecks
      ref={skosRef}
      label="SKOS Concepts (comma-separated)"
      value={step1Data.skosConcepts.join(',')}
    />
  </>
);

export default ContentDetailsStep;
