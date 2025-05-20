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
    <h3 className="text-xl font-medium mb-4">Content Details</h3>

    <div className="mb-4">
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
      label="Keywords (comma-separated, e.g. math,science,history)"
      placeholder="math,science,history"
      value={
        Array.isArray(step1Data.keywords)
          ? step1Data.keywords.join(',')
          : ''
      }
    />

    <InputWithChecks
      ref={targetAgesRef}
      label="Target Ages (comma-separated, e.g. 12,13,14)"
      placeholder="12,13,14"
      onKeyPress={(e) => {
        const input = e.currentTarget;
        const { selectionStart: start, selectionEnd: end, value } = input;
        // Simuleer de nieuwe waarde na intoetsen
        const proposed =
          value.slice(0, start ?? 0) + e.key + value.slice(end ?? 0);
        // Cijfers, groepen „,<opt. spatie><cijfers>“, en een optionele trailing komma of spatie
        const pattern = /^\d+(?:,\s?\d+)*(?:[,\s])?$/;
        if (!pattern.test(proposed)) {
          e.preventDefault();
        }
      }}


      value={
        step1Data.targetAges?.[0]
          ? step1Data.targetAges.join(',')
          : ''
      }
    />


    <InputWithChecks
      ref={skosRef}
      label="SKOS Concepts (comma-separated, e.g. biology,physics)"
      placeholder="biology,physics"
      value={
        Array.isArray(step1Data.skosConcepts)
          ? step1Data.skosConcepts.join(',')
          : ''
      }
    />
  </>
);

export default ContentDetailsStep;
