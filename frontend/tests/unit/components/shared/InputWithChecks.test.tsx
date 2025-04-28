import React, { createRef } from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import InputWithChecks from '@/components/shared/InputWithChecks';

// Definieer de type voor ref
type InputWithChecksHandle = {
  validateInput: () => boolean;
  getValue: () => string;
};

describe('InputWithChecks', () => {
  it('renders label, info and input correctly', () => {
    render(
      <InputWithChecks
        label="Username"
        info="Enter your username"
        placeholder="Your username"
      />,
    );

    expect(screen.getByText('Username')).toBeInTheDocument();
    expect(screen.getByText('Enter your username')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Your username')).toBeInTheDocument();
  });

  it('allows typing into the input', async () => {
    render(<InputWithChecks placeholder="Type here" />);

    const input = screen.getByPlaceholderText('Type here') as HTMLInputElement;
    await userEvent.type(input, 'Hello World');

    expect(input.value).toBe('Hello World');
  });

  it('validates input on blur and shows error message', async () => {
    const validate = (value: string) => {
      if (value.length < 5) return 'Too short!';
      return null;
    };

    render(<InputWithChecks validate={validate} placeholder="Validate me" />);

    const input = screen.getByPlaceholderText('Validate me');
    await userEvent.type(input, 'abc');
    fireEvent.blur(input);

    expect(await screen.findByText('Too short!')).toBeInTheDocument();
  });

  it('does not show error message if input is valid', async () => {
    const validate = (value: string) => {
      if (value.length < 5) return 'Too short!';
      return null;
    };

    render(<InputWithChecks validate={validate} placeholder="Validate me" />);

    const input = screen.getByPlaceholderText('Validate me');
    await userEvent.type(input, 'abcdef');
    fireEvent.blur(input);

    expect(screen.queryByText('Too short!')).toBeNull();
  });

  it('exposes validateInput and getValue methods through ref', async () => {
    const validate = (value: string) => {
      if (value.length < 5) return 'Too short!';
      return null;
    };

    const ref = createRef<InputWithChecksHandle>();

    render(
      <InputWithChecks
        ref={ref}
        validate={validate}
        value="test"
        placeholder="Ref input"
      />,
    );

    // Initial value
    expect(ref.current?.getValue()).toBe('test');

    // Validate should return false because "test" is too short
    expect(ref.current?.validateInput()).toBe(false);
  });
});
