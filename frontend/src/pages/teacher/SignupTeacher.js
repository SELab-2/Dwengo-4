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

const SignupTeacher = () => {
  const firstNameRef = useRef(null);
  const lastNameRef = useRef(null);
  const emailRef = useRef(null);
  const passwordRef = useRef(null);
  const navigate = useNavigate();

  const { mutate, isPending, isError, error } = useMutation({
    mutationFn: signupTeacher,
    onSuccess: () => {
      navigate("/teacher/inloggen");
    },
  });

  const handleFormSubmit = (e) => {
    e.preventDefault();

    const firstNameValid = firstNameRef.current?.validateInput();
    const lastNameValid = lastNameRef.current?.validateInput();
    const emailValid = emailRef.current?.validateInput();
    const passwordValid = passwordRef.current?.validateInput();

    if (firstNameValid && lastNameValid && emailValid && passwordValid) {
      const formData = {
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
          <h2>Leerkracht Registreren</h2>
          <form className="g-20" onSubmit={handleFormSubmit}>
            <InputWithChecks
              ref={firstNameRef}
              label="Voornaam"
              inputType="text"
              validate={(value) => validateForm(value, [validateRequired])}
              placeholder="Voer je voornaam in"
            />
            <InputWithChecks
              ref={lastNameRef}
              label="Achternaam"
              inputType="text"
              validate={(value) => validateForm(value, [validateRequired])}
              placeholder="Voer je achternaam in"
            />
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
                  (v) => validateMinLength(v, 6),
                ])
              }
              placeholder="Voer je wachtwoord in"
            />
            {isError && (
              <div className="c-r">
                {error.info?.message ||
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
