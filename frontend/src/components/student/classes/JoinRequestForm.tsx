import React, { useRef } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import InputWithChecks from '../../shared/InputWithChecks';
import {
  validateForm,
  validateRequired,
} from '../../../util/shared/validation';
import Container from '../../shared/Container';
import PrimaryButton from '../../shared/PrimaryButton';
import BoxBorder from '../../shared/BoxBorder';
import LoadingIndicatorButton from '../../shared/LoadingIndicatorButton';
import Modal from '../../shared/Modal';
import SuccessMessage from '../../shared/SuccessMessage';
import { useTranslation } from 'react-i18next';
import { joinClass } from '@/util/student/classJoin';

interface InputWithChecksRef {
  validateInput: () => boolean;
  getValue: () => string;
}

interface JoinClassPayload {
  joinCode: string;
}

const JoinClass: React.FC = () => {
  const { t } = useTranslation();
  const joinCodeRef = useRef<InputWithChecksRef | null>(null);
  const queryClient = useQueryClient();
  const modalRef = useRef<{ open: () => void; close: () => void } | null>(null);

  const { mutate, isPending, isError, error } = useMutation<
    void,
    Error,
    JoinClassPayload
  >({
    mutationFn: joinClass,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['studentClasses'] });
      modalRef.current?.open(); // Open modal on success
    },
  });

  const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (joinCodeRef.current && joinCodeRef.current.validateInput()) {
      const formData = {
        joinCode: joinCodeRef.current.getValue(),
      };
      mutate(formData);
    }
  };

  return (
    <section>
      <Container>
        <BoxBorder extraClasses="mxw-700 m-a g-20">
          <h2>{t('join_class.title')}</h2>
          <form className="g-20" onSubmit={handleFormSubmit}>
            <InputWithChecks
              ref={joinCodeRef}
              label={t('join_class.code.label')}
              inputType="text"
              validate={(value: string) =>
                validateForm(value, [validateRequired])
              }
              placeholder={t('join_class.code.placeholder')}
            />
            {isError && (
              <div className="c-r">
                {(error as any)?.info?.message || t('join_class.error')}
              </div>
            )}
            <div>
              <PrimaryButton type="submit" disabled={isPending}>
                {t('join_class.submit')}
                {isPending && <LoadingIndicatorButton />}
              </PrimaryButton>
            </div>
          </form>
        </BoxBorder>
      </Container>
      {/* Modal for success message */}
      <Modal ref={modalRef}>
        <SuccessMessage title="Succes!" description={t('join_class.success')} />
      </Modal>
    </section>
  );
};

export default JoinClass;
