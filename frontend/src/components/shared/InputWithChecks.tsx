import React, {
   useState,
   forwardRef,
   useImperativeHandle,
   ChangeEventHandler,
   FocusEventHandler,
 } from "react";
 import "./InputWithChecks.css";
 
 // Definieer de types voor de props
 interface InputWithChecksProps {
   label?: string;
   inputType?: string;
   validate?: (value: string) => string | null;  // Functie die een foutmelding retourneert, of null als er geen fout is
   info?: string;
   value?: string;
 }
 
 interface InputWithChecksHandle {
   validateInput: () => boolean;
   getValue: () => string;
 }
 
 const InputWithChecks = forwardRef<InputWithChecksHandle, InputWithChecksProps>(
   ({ label, inputType = "text", validate, info, value = "", ...props }, ref) => {
     const [inputValue, setInputValue] = useState<string>(value);
     const [errorMessage, setErrorMessage] = useState<string>("");
 
     const handleBlur: FocusEventHandler<HTMLInputElement> = () => {
       if (validate) {
         const validationResult = validate(inputValue);
         setErrorMessage(validationResult || "");
       }
     };
 
     const handleChange: ChangeEventHandler<HTMLInputElement> = (e) => {
       setInputValue(e.target.value);
       if (validate) {
         setErrorMessage(validate(e.target.value) || "");
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
 