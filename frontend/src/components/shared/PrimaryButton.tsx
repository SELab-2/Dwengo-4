import React, {
  ButtonHTMLAttributes,
  ReactNode,
  AnchorHTMLAttributes,
} from "react";

interface PrimaryButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
}
interface SecondaryButtonProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  children: ReactNode;
}
const PrimaryButton: React.FC<PrimaryButtonProps> = ({
  children,
  ...props
}) => {
  return (
    <button {...props} className="btn-primary">
      {children}
    </button>
  );
};

const SecondaryButton: React.FC<SecondaryButtonProps> = ({
  children,
  ...props
}) => {
  return (
    <a {...props} className="btn-primary">
      {children}
    </a>
  );
};
export { PrimaryButton, SecondaryButton };
