import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import PrimaryButton from '@/components/shared/PrimaryButton';

describe('PrimaryButton', () => {
  it('renders correctly with children', () => {
    render(<PrimaryButton>Click me!</PrimaryButton>);

    const buttonElement = screen.getByRole('button', { name: /click me!/i });
    expect(buttonElement).toBeInTheDocument();
  });

  it('has the correct base classes', () => {
    render(<PrimaryButton>Click me!</PrimaryButton>);

    const buttonElement = screen.getByRole('button', { name: /click me!/i });
    expect(buttonElement.className).toContain('px-7');
    expect(buttonElement.className).toContain('h-10');
    expect(buttonElement.className).toContain('font-bold');
    expect(buttonElement.className).toContain('rounded-md');
    expect(buttonElement.className).toContain('text-white');
    expect(buttonElement.className).toContain('bg-dwengo-green');
  });

  it('calls onClick handler when clicked', async () => {
    const user = userEvent.setup();
    const handleClick = vi.fn();

    render(<PrimaryButton onClick={handleClick}>Click me!</PrimaryButton>);

    const buttonElement = screen.getByRole('button', { name: /click me!/i });
    await user.click(buttonElement);

    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('applies additional props correctly (e.g., type="submit")', () => {
    render(<PrimaryButton type="submit">Submit</PrimaryButton>);

    const buttonElement = screen.getByRole('button', { name: /submit/i });
    expect(buttonElement).toHaveAttribute('type', 'submit');
  });
});
