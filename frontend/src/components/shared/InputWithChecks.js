import React, {
   useState,
   forwardRef,
   useImperativeHandle,
} from "react";
import "./InputWithChecks.css";

const InputWithChecks = forwardRef(
   ({ label, inputType = "text", validate, info, value = "", ...props }, ref) => {
      const [inputValue, setInputValue] = useState(value);
      const [errorMessage, setErrorMessage] = useState("");

      const handleBlur = () => {
         if (validate) {
            const validationResult = validate(inputValue);
            setErrorMessage(validationResult || "");
         }
      };

      const handleChange = (e) => {
         setInputValue(e.target.value);
         if (validate) {
            setErrorMessage(validate(e.target.value));
         }
      };

      useImperativeHandle(ref, () => ({
         validateInput: () => {
            const validationResult = validate ? validate(inputValue) : "";
            setErrorMessage(validationResult || "");
            return !validationResult;
         },
         getValue: () => inputValue,
      }));

      return (
         <div className="input-container">
            {label && <label>{label}</label>}
            <input
               {...props}
               type={inputType}
               value={inputValue}
               onChange={handleChange}
               onBlur={handleBlur}
               className={errorMessage ? "border-red" : ""}
            />
            {info && <div className="input-info">{info}</div>}
            {errorMessage && <div className="c-r">{errorMessage}</div>}
         </div>
      );
   }
);

export default InputWithChecks;
