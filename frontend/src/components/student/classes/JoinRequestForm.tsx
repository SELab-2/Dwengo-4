import React, { useRef, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import InputWithChecks from "../../shared/InputWithChecks";
import { validateRequired, validateForm } from "../../../util/shared/validation";
import Container from "../../shared/Container";
import PrimaryButton from "../../shared/PrimaryButton";
import BoxBorder from "../../shared/BoxBorder";
import { joinClass } from "../../../util/student/httpStudent"; // Nieuwe API-functie voor studenten
import LoadingIndicatorButton from "../../shared/LoadingIndicatorButton";
import Modal from "../../shared/Modal";
import SuccessMessage from "../../shared/SuccessMessage";

interface InputWithChecksRef {
  validateInput: () => boolean;
  getValue: () => string;
}

interface JoinClassPayload {
  joinCode: string;
}

const JoinClass: React.FC = () => {
  const joinCodeRef = useRef<InputWithChecksRef | null>(null);
  const queryClient = useQueryClient();
  const modalRef = useRef<{ open: () => void; close: () => void } | null>(null);
  
  const { mutate, isPending, isError, error } = useMutation<void, Error, JoinClassPayload>({
    mutationFn: joinClass,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["studentClasses"] });
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
          <h2>Join request versturen</h2>
          <form className="g-20" onSubmit={handleFormSubmit}>
            <InputWithChecks
              ref={joinCodeRef}
              label="Klascode"
              inputType="text"
              validate={(value: string) => validateForm(value, [validateRequired])}
              placeholder="Voer de klascode in"
            />
            {isError && (
              <div className="c-r">
                {(error as any)?.info?.message ||
                  "Er is iets fout gelopen tijdens het versturen van de join request"}
              </div>
            )}
            <div>
              <PrimaryButton type="submit" disabled={isPending}>
                Join request versturen
                {isPending && <LoadingIndicatorButton />}
              </PrimaryButton>
            </div>
          </form>
        </BoxBorder>
      </Container>
      {/* Modal for success message */}
      <Modal ref={modalRef}>
        <SuccessMessage title="Succes!" description="Je join request is verstuurd." />
      </Modal>
    </section>
  );
};

export default JoinClass;