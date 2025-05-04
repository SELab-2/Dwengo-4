import React, { useRef, useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import {
  createLearningPath,
  CreateLearningPathPayload,
} from '../../../util/teacher/httpLearningPaths';
import { LearningPath } from '../../../types/type';
import { useNavigate } from 'react-router-dom';
import InputWithChecks from '../../../components/shared/InputWithChecks';
import {
  validateForm,
  validateRequired,
} from '../../../util/shared/validation';
import PrimaryButton from '../../../components/shared/PrimaryButton';
import LoadingIndicatorButton from '../../../components/shared/LoadingIndicatorButton';
import { APIError } from '@/types/api.types';
import { queryClient } from '@/util/teacher/config';

interface InputWithChecksRef {
  validateInput: () => boolean;
  getValue: () => string;
}

const CreateLearningPath: React.FC = () => {
  const navigate = useNavigate();
  const learningPathNameRef = useRef<InputWithChecksRef | null>(null);
  const languageRef = useRef<InputWithChecksRef | null>(null); // should default to preferred language
  const [description, setDescription] = useState<string>('');

  const { mutate, isPending, isError, error } = useMutation<
    LearningPath,
    APIError,
    CreateLearningPathPayload
  >({
    mutationFn: createLearningPath,
    onSuccess: (learningPath) => {
      console.log('Learning path created:', learningPath);
      queryClient.invalidateQueries({ queryKey: ['learningPaths'] });
      // navigate to edit page where learning objects can be added
      navigate(`/teacher/learning-paths/${learningPath.id}/edit`);
    },
  });

  const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // make sure all required fields are filled in
    if (
      learningPathNameRef.current &&
      languageRef.current &&
      learningPathNameRef.current.validateInput() &&
      languageRef.current.validateInput()
    ) {
      mutate({
        title: learningPathNameRef.current.getValue(),
        language: languageRef.current.getValue(),
        description,
      });
    }
  };

  return (
    <div className="pt-6 px-4 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold mb-6">Leerpad Aanmaken</h1>
      <form className="g-20" onSubmit={handleFormSubmit}>
        <InputWithChecks
          ref={learningPathNameRef}
          label="Leerpad Naam"
          inputType="text"
          validate={(value: string) => validateForm(value, [validateRequired])}
          placeholder="Voer de naam van het leerpad in"
        />
        <InputWithChecks
          ref={languageRef}
          label="Taal"
          inputType="text"
          validate={(value: string) => validateForm(value, [validateRequired])}
          placeholder="Voer de taal van het leerpad in"
        />
        <div className="flex flex-col gap-y-10">
          <label htmlFor="learningPathDescription">
            Beschrijving <span className="text-gray-500">(optioneel)</span>
          </label>
          <textarea
            id="description"
            name="description"
            onChange={(e) => setDescription(e.target.value)}
            value={description}
            placeholder="Voer een beschrijving in (optioneel)"
          ></textarea>
        </div>
        {isError && (
          <div className="c-r">
            {error?.info?.message ||
              'Er is iets fout gelopen tijdens het aanmaken van het leerpad'}
          </div>
        )}
        <div>
          <PrimaryButton type="submit" disabled={isPending}>
            Leerpad Aanmaken
            {isPending && <LoadingIndicatorButton />}
          </PrimaryButton>
        </div>
      </form>
    </div>
  );
};

export default CreateLearningPath;
