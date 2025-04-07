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
import BoxBorder from '../../components/shared/BoxBorder';
import LoadingIndicatorButton from '../../components/shared/LoadingIndicatorButton';
import PrimaryButton from '../../components/shared/PrimaryButton';
import { useTranslation } from 'react-i18next';
import { loginStudent } from '@/util/student/auth';

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

const LoginStudent: React.FC = () => {
  const emailRef = useRef<InputWithChecksHandle | null>(null);
  const passwordRef = useRef<InputWithChecksHandle | null>(null);
  const navigate = useNavigate();
  const { t } = useTranslation();

  const { mutate, isPending, isError, error } = useMutation<
    LoginResponse,
    Error,
    LoginFormData
  >({
    mutationFn: loginStudent,
    onSuccess: (data) => {
      const token = data.token;
      const expires = new Date();
      expires.setDate(expires.getDate() + 7);
      localStorage.setItem('token', token);
      localStorage.setItem('firstName', data.firstName);
      localStorage.setItem('lastName', data.lastName);
      localStorage.setItem('expiration', expires.toISOString());

      navigate('/student');
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
      <div className="container">
        <BoxBorder extraClasses="mxw-700 m-a g-20">
          <h2>{t('login.student')}</h2>
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
              <div className="c-r">{error.message || t('login.error')}</div>
            )}
            <div>
              <PrimaryButton type="submit" disabled={isPending}>
                {t('login.submit')}
                {isPending && <LoadingIndicatorButton />}
              </PrimaryButton>
            </div>
          </form>
        </BoxBorder>
      </div>
    </section>
  );
};

export default LoginStudent;
