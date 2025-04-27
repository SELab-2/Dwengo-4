import React, { useRef } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import InputWithChecks from '../../components/shared/InputWithChecks';
import {
  validateEmail,
  validateForm,
  validateMinLength,
  validateRequired,
} from '../../util/shared/validation';
import Container from '../../components/shared/Container';
import BoxBorder from '../../components/shared/BoxBorder';
import LoadingIndicatorButton from '../../components/shared/LoadingIndicatorButton';
import PrimaryButton from '../../components/shared/PrimaryButton';
import { useTranslation } from 'react-i18next';
import { signupTeacher } from '@/util/teacher/auth';

interface SignupFormData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

interface AuthResponse {
  token: string;
}

interface InputWithChecksHandle {
  validateInput: () => boolean;
  getValue: () => string;
}

const SignupTeacher: React.FC = () => {
  const firstNameRef = useRef<InputWithChecksHandle | null>(null);
  const lastNameRef = useRef<InputWithChecksHandle | null>(null);
  const emailRef = useRef<InputWithChecksHandle | null>(null);
  const passwordRef = useRef<InputWithChecksHandle | null>(null);
  const navigate = useNavigate();
  const { t } = useTranslation();

  const { mutate, isPending, isError, error } = useMutation<
    AuthResponse,
    Error,
    SignupFormData
  >({
    mutationFn: signupTeacher,
    onSuccess: () => {
      navigate('/teacher/inloggen');
    },
  });

  const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const firstNameValid = firstNameRef.current?.validateInput() ?? false;
    const lastNameValid = lastNameRef.current?.validateInput() ?? false;
    const emailValid = emailRef.current?.validateInput() ?? false;
    const passwordValid = passwordRef.current?.validateInput() ?? false;

    if (
      firstNameValid &&
      lastNameValid &&
      emailValid &&
      passwordValid &&
      firstNameRef.current &&
      lastNameRef.current &&
      emailRef.current &&
      passwordRef.current
    ) {
      const formData: SignupFormData = {
        firstName: firstNameRef.current.getValue(),
        lastName: lastNameRef.current.getValue(),
        email: emailRef.current.getValue(),
        password: passwordRef.current.getValue(),
      };

      mutate(formData);
    }
  };

  return (
    <section>
      <Container>
        <BoxBorder extraClasses="mxw-700 m-a g-20">
          <h2>{t('register.teacher')}</h2>
          <form className="g-20" onSubmit={handleFormSubmit}>
            <InputWithChecks
              ref={firstNameRef}
              label={t('login.firstName.label')}
              inputType="text"
              validate={(value: string) =>
                validateForm(value, [validateRequired])
              }
              placeholder={t('login.firstName.placeholder')}
            />
            <InputWithChecks
              ref={lastNameRef}
              label={t('login.lastName.label')}
              inputType="text"
              validate={(value: string) =>
                validateForm(value, [validateRequired])
              }
              placeholder={t('login.lastName.placeholder')}
            />
            <InputWithChecks
              ref={emailRef}
              label={t('login.email.label')}
              inputType="email"
              validate={(value: string) =>
                validateForm(value, [validateRequired, validateEmail])
              }
              placeholder={t('login.email.placeholder')}
            />
            <InputWithChecks
              ref={passwordRef}
              label={t('login.password.label')}
              inputType="password"
              validate={(value: string) =>
                validateForm(value, [
                  validateRequired,
                  (v: string) => validateMinLength(v, 6),
                ])
              }
              placeholder={t('login.password.placeholder')}
            />
            {isError && (
              <div className="c-r">
                {(error as any)?.info?.message || t('register.error')}
              </div>
            )}
            <div>
              <PrimaryButton type="submit" disabled={isPending}>
                {t('register.submit')}
                {isPending && <LoadingIndicatorButton />}
              </PrimaryButton>
            </div>
          </form>
        </BoxBorder>
      </Container>
    </section>
  );
};

export default SignupTeacher;
