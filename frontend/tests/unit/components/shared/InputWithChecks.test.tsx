import React, { createRef } from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import InputWithChecks from '@/components/shared/InputWithChecks';

describe('InputWithChecks component', () => {
  // Define handle interface matching component's imperative handle
  interface Handle {
    validateInput: () => boolean;
    getValue: () => string;
  }

  const setup = (
    props: {
      label?: string;
      inputType?: string;
      validate?: (value: string) => string | null;
      info?: string;
      value?: string;
      placeholder?: string;
    } = {},
  ) => {
    const ref = createRef<Handle>();
    render(
      <InputWithChecks
        ref={ref}
        label={props.label}
        inputType={props.inputType}
        validate={props.validate}
        info={props.info}
        value={props.value}
        placeholder={props.placeholder}
      />,
    );
    const input = screen.getByRole('textbox') as HTMLInputElement;
    return { ref, input };
  };

  it('renders label when provided', () => {
    setup({ label: 'My Label' });
    expect(screen.getByText('My Label')).toBeInTheDocument();
  });

  it('renders info text when provided', () => {
    setup({ info: 'Helpful info' });
    expect(screen.getByText('Helpful info')).toBeInTheDocument();
  });

  it('sets placeholder attribute on input', () => {
    setup({ placeholder: 'Enter text' });
    const input = screen.getByPlaceholderText('Enter text');
    expect(input).toBeInTheDocument();
  });

  it('calls validate on blur and shows error message', () => {
    const validateFn = (v: string) => (v.length < 5 ? 'Too short' : null);
    const { input } = setup({ validate: validateFn });

    fireEvent.change(input, { target: { value: '123' } });
    fireEvent.blur(input);

    expect(screen.getByText('Too short')).toBeInTheDocument();
    expect(input).toHaveClass('border-red');
  });

  it('clears error message when input becomes valid', () => {
    const validateFn = (v: string) => (v !== 'ok' ? 'Invalid' : null);
    const { input } = setup({ validate: validateFn });

    // initial invalid
    fireEvent.change(input, { target: { value: 'nope' } });
    expect(screen.getByText('Invalid')).toBeInTheDocument();

    // now valid
    fireEvent.change(input, { target: { value: 'ok' } });
    expect(screen.queryByText('Invalid')).toBeNull();
    expect(input).not.toHaveClass('border-red');
  });

  it('validateInput handle returns false and sets error when invalid', async () => {
    const validateFn = (v: string) => (v.length === 0 ? 'Required' : null);
    const { ref } = setup({ validate: validateFn });

    // no change, default value is empty => invalid
    const valid = ref.current?.validateInput();
    expect(valid).toBe(false);
    await waitFor(() => {
      expect(screen.getByText('Required')).toBeInTheDocument();
    });
  });

  it('validateInput handle returns true when valid', async () => {
    const validateFn = (v: string) => (v === 'good' ? null : 'Bad');
    const { ref, input } = setup({ validate: validateFn });

    fireEvent.change(input, { target: { value: 'good' } });
    const valid = ref.current?.validateInput();
    expect(valid).toBe(true);
    await waitFor(() => {
      expect(screen.queryByText('Bad')).toBeNull();
    });
  });

  it('getValue handle returns current input value', () => {
    const { ref, input } = setup();
    fireEvent.change(input, { target: { value: 'Hello' } });
    expect(ref.current?.getValue()).toBe('Hello');
  });
});
