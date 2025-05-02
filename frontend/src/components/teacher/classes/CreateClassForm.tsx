import React, { useRef } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import InputWithChecks from '../../shared/InputWithChecks';
import {
  validateForm,
  validateRequired,
} from '../../../util/shared/validation';
import Container from '../../shared/Container';
import BoxBorder from '../../shared/BoxBorder';
import LoadingIndicatorButton from '../../shared/LoadingIndicatorButton';
import PrimaryButton from '../../shared/PrimaryButton';
import { ClassItem } from '../../../types/type';
import { useTranslation } from 'react-i18next';
import { createClass } from '@/util/teacher/class';

interface InputWithChecksRef {
  validateInput: () => boolean;
  getValue: () => string;
}

interface CreateClassPayload {
  name: string;
}

const CreateClass: React.FC = () => {
  const classNameRef = useRef<InputWithChecksRef | null>(null);
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  const { mutate, isPending, isError, error } = useMutation<
    ClassItem,
    Error,
    CreateClassPayload
  >({
    mutationFn: createClass,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['classes'] });
    },
  });

  const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (classNameRef.current && classNameRef.current.validateInput()) {
      const formData = {
        name: classNameRef.current.getValue(),
      };
      console.log(formData);
      mutate(formData);
    }
  };

  return (
    <section>
      <Container>
        <BoxBorder extraClasses="mxw-700 m-a g-20">
          <h2>{t('class.create')}</h2>
          <form className="g-20" onSubmit={handleFormSubmit}>
            <InputWithChecks
              ref={classNameRef}
              label={t('class.name.label')}
              inputType="text"
              validate={(value: string) =>
                validateForm(value, [validateRequired])
              }
              placeholder={t('class.name.placeholder')}
            />
            {isError && (
              <div className="c-r">
                {(error as any)?.info?.message || t('class.error')}
              </div>
            )}
            <div>
              <PrimaryButton type="submit" disabled={isPending}>
                {t('class.submit')}
                {isPending && <LoadingIndicatorButton />}
              </PrimaryButton>
            </div>
          </form>
        </BoxBorder>
      </Container>
    </section>
  );
};

export default CreateClass;
