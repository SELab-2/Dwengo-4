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
import { loginTeacher } from '@/util/teacher/auth';

interface LoginFormData {
  email: string;
  password: string;
}

interface LoginResponse {
  firstName: string;
  lastName: string;
  token: string;
}

interface InputWithChecksHandle {
  validateInput: () => boolean;
  getValue: () => string;
}

const LoginTeacher: React.FC = () => {
  const emailRef = useRef<InputWithChecksHandle | null>(null);
  const passwordRef = useRef<InputWithChecksHandle | null>(null);
  const navigate = useNavigate();
  const { t } = useTranslation();

  const { mutate, isPending, isError, error } = useMutation<
    LoginResponse,
    Error,
    LoginFormData
  >({
    mutationFn: loginTeacher,
    onSuccess: (data) => {
      const token = data.token;
      const expires = new Date();
      expires.setDate(expires.getDate() + 7);
      localStorage.setItem('token', token);
      localStorage.setItem('expiration', expires.toISOString());
      localStorage.setItem('firstName', data.firstName);
      localStorage.setItem('lastName', data.lastName);
      localStorage.setItem('role', "teacher");

      navigate('/teacher');
    },
  });

  const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const emailValid = emailRef.current?.validateInput() ?? false;
    const passwordValid = passwordRef.current?.validateInput() ?? false;

    if (
      emailValid &&
      passwordValid &&
      emailRef.current &&
      passwordRef.current
    ) {
      const formData: LoginFormData = {
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
          <h2>{t('login.teacher')}</h2>
          <form className="g-20" onSubmit={handleFormSubmit}>
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
                {(error as any)?.info?.message || t('login.error')}
              </div>
            )}
            <div>
              <PrimaryButton type="submit" disabled={isPending}>
                {t('login.submit')}
                {isPending && <LoadingIndicatorButton />}
              </PrimaryButton>
            </div>
          </form>
        </BoxBorder>
      </Container>
    </section>
  );
};

export default LoginTeacher;
