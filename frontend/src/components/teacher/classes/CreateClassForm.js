import React, { useRef } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import InputWithChecks from "../../shared/InputWithChecks";
import { validateRequired, validateForm } from "../../../util/shared/validation";
import Container from "../../shared/Container";
import PrimaryButton from "../../shared/PrimaryButton";
import BoxBorder from "../../shared/BoxBorder";
import { createClass } from "../../../util/teacher/httpTeacher";
import LoadingIndicatorButton from "../../shared/LoadingIndicatorButton";

const CreateClass = () => {
  const classNameRef = useRef(null);
  const queryClient = useQueryClient();

  const { mutate, isPending, isError, error } = useMutation({
    mutationFn: createClass,
    onSuccess: () => {
      queryClient.invalidateQueries(["classes"]);
    },
  });

  const handleFormSubmit = (e) => {
    e.preventDefault();

    const classNameValid = classNameRef.current?.validateInput();

    if (classNameValid) {
      const formData = {
        name: classNameRef.current.getValue(),
      };
      mutate(formData);
    }
  };

  return (
    <section>
      <Container>
        <BoxBorder extraClasses="mxw-700 m-a g-20">
          <h2>Nieuwe Klas Aanmaken</h2>
          <form className="g-20" onSubmit={handleFormSubmit}>
            <InputWithChecks
              ref={classNameRef}
              label="Klasnaam"
              inputType="text"
              validate={(value) => validateForm(value, [validateRequired])}
              placeholder="Voer de naam van de klas in"
            />
            {isError && (
              <div className="c-r">
                {error.info?.message || "Er is iets fout gelopen tijdens het aanmaken van de klas"}
              </div>
            )}
            <div>
              <PrimaryButton type="submit" disabled={isPending}>
                Klas Aanmaken
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
