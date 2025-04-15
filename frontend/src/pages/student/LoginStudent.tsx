import React, { useRef } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import InputWithChecks from '../../components/shared/InputWithChecks';
import {
  validateEmail,
  validateRequired,
  validateForm,
  validateMinLength,
} from '../../util/shared/validation';
import BoxBorder from '../../components/shared/BoxBorder';
import { loginStudent } from '../../util/student/httpStudent';
import LoadingIndicatorButton from '../../components/shared/LoadingIndicatorButton';
import PrimaryButton from '../../components/shared/PrimaryButton';

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
      console.log(data);
      localStorage.setItem('token', token);
      localStorage.setItem('firstName', data.firstName);
      localStorage.setItem('lastName', data.lastName);
      localStorage.setItem('expiration', expires.toISOString());

      navigate('/student/dashboard');
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
          <h2>Student Inloggen</h2>
          <form className="g-20" onSubmit={handleFormSubmit}>
            <InputWithChecks
              ref={emailRef}
              label="E-mailadres"
              inputType="email"
              validate={(value) =>
                validateForm(value, [validateRequired, validateEmail])
              }
              placeholder="Voer je e-mailadres in"
            />
            <InputWithChecks
              ref={passwordRef}
              label="Wachtwoord"
              inputType="password"
              validate={(value) =>
                validateForm(value, [
                  validateRequired,
                  (v: string) => validateMinLength(v, 6),
                ])
              }
              placeholder="Voer je wachtwoord in"
            />
            {isError && (
              <div className="c-r">
                {error.message ||
                  'Er is iets fout gelopen tijdens het inloggen'}
              </div>
            )}
            <div>
              <PrimaryButton type="submit" disabled={isPending}>
                Inloggen
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
