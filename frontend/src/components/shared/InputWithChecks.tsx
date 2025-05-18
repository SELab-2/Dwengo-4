import React, {
  useState,
  forwardRef,
  useImperativeHandle,
  ChangeEventHandler,
  FocusEventHandler,
} from "react";
import { useTranslation } from "react-i18next";
import "./InputWithChecks.css";

interface InputWithChecksProps {
  label?: string;
  inputType?: string;
  validate?: (value: string) => string | null;
  info?: string;
  value?: string;
  placeholder?: string;
  maxLength?: number;
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

    const { t } = useTranslation();

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
          {...(props.maxLength ? { maxLength: props.maxLength } : {})}
        />
        {props.maxLength && (
          <div className="input-length">
            {props.maxLength - inputValue.length} {t("characters")}
          </div>
        )}
        {info && <div className="input-info">{info}</div>}
        {errorMessage && <div className="c-r">{errorMessage}</div>}
      </div>
    );
  }
);

export default InputWithChecks;
