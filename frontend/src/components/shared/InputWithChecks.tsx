import React, {
  useState,
  forwardRef,
  useImperativeHandle,
  ChangeEventHandler,
  FocusEventHandler,
  InputHTMLAttributes,
  useEffect
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
      max,
      ...props
    },
    ref
  ) => {
    const [inputValue, setInputValue] = useState<string>(value);
    const [errorMessage, setErrorMessage] = useState<string>("");

    // Add this useEffect to sync with external value changes
    useEffect(() => {
      setInputValue(value);
    }, [value]);

    const handleBlur: FocusEventHandler<HTMLInputElement> = () => {
      if (validate) {
        const validationResult = validate(inputValue);
        setErrorMessage(validationResult || "");
      }
    };

    const handleChange: ChangeEventHandler<HTMLInputElement> = (e) => {
      setInputValue(e.target.value);
      if (props.onChange) {
        props.onChange(e);
      }
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

    console.log(inputValue)


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
          {...(max ? { maxLength: max } : {})}
        />
        {max && (
          <div className="input-length" style={{
            fontSize: "0.8rem",
            textAlign: "right",
            marginTop: "-5px",
            marginBottom: "5px"
          }}>
            {max - inputValue.length} {t("characters")}
          </div>
        )}
        {info && <div className="input-info">{info}</div>}
        {errorMessage && <div className="c-r">{errorMessage}</div>}
      </div>
    );
  }
);

export default InputWithChecks;