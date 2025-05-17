import { FormStepProps } from '../types';
import React from 'react';

const AvailabilityStep: React.FC<FormStepProps> = ({
  teacherExclusiveRef,
  availableRef,
  step1Data,
}) => (
  <>
    <h3 className="text-xl font-medium">Availability</h3>

    <div>
      <label className="block mb-1">Teacher Exclusive</label>
      <select
        ref={teacherExclusiveRef}
        defaultValue={step1Data.teacherExclusive.toString()}
        className="w-full border rounded p-2"
      >
        <option value="true">Yes</option>
        <option value="false">No</option>
      </select>
    </div>

    <div>
      <label className="block mb-1">Available</label>
      <select
        ref={availableRef}
        defaultValue={step1Data.available.toString()}
        className="w-full border rounded p-2"
      >
        <option value="true">Yes</option>
        <option value="false">No</option>
      </select>
    </div>
  </>
);

export default AvailabilityStep;
