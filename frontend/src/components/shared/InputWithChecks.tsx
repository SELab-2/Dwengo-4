import React, {
  useState,
  forwardRef,
  useImperativeHandle,
  ChangeEventHandler,
  FocusEventHandler,
  InputHTMLAttributes
} from "react";
import "./InputWithChecks.css";
import { useTranslation } from "react-i18next";

// Extend native input props, but override 'type' and 'value' via our own props
interface InputWithChecksProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'value'> {
  /** Label text shown above the input */
  label?: string;
  /** Type of input, e.g. 'text', 'number' */
  inputType?: string;
  /** Function to validate input value; return error message or null */
  validate?: (value: string) => string | null;
  /** Helper/info text shown below the input */
  info?: string;
  /** Controlled initial value */
  value?: string;
}

/** Exposed methods for parent to validate and fetch the value */
export interface InputWithChecksHandle {
  validateInput: () => boolean;
  getValue: () => string;
}

const InputWithChecks = forwardRef<InputWithChecksHandle, InputWithChecksProps>(
  (
    {
      label,
      inputType = "text",
      validate,
      info,
      value = "",
      min,
      maxLength,
      ...props
    },
    ref
  ) => {
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
          min={min}
          max={max}
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