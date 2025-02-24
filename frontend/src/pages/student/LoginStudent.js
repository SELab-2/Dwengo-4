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
import { loginStudent } from "../../util/student/httpStudent";
import LoadingIndicatorButton from "../../components/shared/LoadingIndicatorButton";

const LoginStudent = () => {
  const emailRef = useRef(null);
  const passwordRef = useRef(null);
  const navigate = useNavigate();

  const { mutate, isPending, isError, error } = useMutation({
    mutationFn: loginStudent,
    onSuccess: (data) => {
      const token = data.token;
      const expires = new Date();
      expires.setDate(expires.getDate() + 7);
      localStorage.setItem("token", token);
      localStorage.setItem("expiration", expires.toISOString());

      navigate("/student/dashboard");
    },
  });

  const handleFormSubmit = (e) => {
    e.preventDefault();

    const emailValid = emailRef.current?.validateInput();
    const passwordValid = passwordRef.current?.validateInput();

    if (emailValid && passwordValid) {
      const formData = {
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
                  (v) => validateMinLength(v, 6),
                ])
              }
              placeholder="Voer je wachtwoord in"
            />
            {isError && (
              <div className="c-r">
                {error.info?.message || "Er is iets fout gelopen tijdens het inloggen"}
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
      </Container>
    </section>
  );
};

export default LoginStudent;
