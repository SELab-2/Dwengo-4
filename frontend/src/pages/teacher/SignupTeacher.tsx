import React, { useRef } from "react";
import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import InputWithChecks from "../../components/shared/InputWithChecks";
import {
  validateEmail,
  validateRequired,
  validateForm,
  validateMinLength,
} from "../../util/shared/validation";
import Container from "../../components/shared/Container";
import PrimaryButton from "../../components/shared/PrimaryButton";
import BoxBorder from "../../components/shared/BoxBorder";
import { signupTeacher } from "../../util/teacher/httpTeacher";
import LoadingIndicatorButton from "../../components/shared/LoadingIndicatorButton";

// ✅ Definieer het type voor de registratiegegevens
interface SignupFormData {
  email: string;
  password: string;
}

// ✅ Definieer het type voor de ref van InputWithChecks
interface InputWithChecksHandle {
  validateInput: () => boolean;
  getValue: () => string;
}

const SignupTeacher: React.FC = () => {
  // ✅ Typing voor useRef met InputWithChecks-handle functies
  const emailRef = useRef<InputWithChecksHandle | null>(null);
  const passwordRef = useRef<InputWithChecksHandle | null>(null);
  const navigate = useNavigate();

  // ✅ Gebruik useMutation met juiste types
  const { mutate, isPending, isError, error } = useMutation<
    void,
    Error,
    SignupFormData
  >({
    mutationFn: signupTeacher,
    onSuccess: () => {
      navigate("/teacher/inloggen");
    },
  });

  // ✅ TypeScript fix voor form event en null-checks
  const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const emailValid = emailRef.current?.validateInput() ?? false;
    const passwordValid = passwordRef.current?.validateInput() ?? false;

    if (emailValid && passwordValid && emailRef.current && passwordRef.current) {
      const formData: SignupFormData = {
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
          <h2>Leerkracht Registreren</h2>
          <form className="g-20" onSubmit={handleFormSubmit}>
            <InputWithChecks
              ref={emailRef}
              label="E-mailadres"
              inputType="email"
              validate={(value: string) =>
                validateForm(value, [validateRequired, validateEmail])
              }
              placeholder="Voer je e-mailadres in"
            />
            <InputWithChecks
              ref={passwordRef}
              label="Wachtwoord"
              inputType="password"
              validate={(value: string) =>
                validateForm(value, [
                  validateRequired,
                  (v: string) => validateMinLength(v, 6),
                ])
              }
              placeholder="Voer je wachtwoord in"
            />
            {isError && (
              <div className="c-r">
                {(error as any)?.info?.message ||
                  "Er is iets fout gelopen tijdens het registreren"}
              </div>
            )}
            <div>
              <PrimaryButton type="submit" disabled={isPending}>
                Registreren
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
