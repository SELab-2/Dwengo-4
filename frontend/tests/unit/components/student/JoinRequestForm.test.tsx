import React, { useImperativeHandle, useState } from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { describe, it, expect, vi, beforeEach } from 'vitest';

import JoinRequestForm from '@/components/student/classes/JoinRequestForm';
import * as httpStudent from '@/util/student/httpStudent';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    // eenvoudige “vertaling”
    t: (k: string, o?: Record<string, unknown>) =>
      k === 'deadline' ? `Deadline: ${o?.date}` : k,
  }),
}));

vi.mock('@/components/shared/InputWithChecks', () => {
  type Props = { label: string; placeholder?: string };

  const Stub = React.forwardRef<
    { validateInput: () => boolean; getValue: () => string },
    Props
  >(({ label, placeholder }, ref) => {
    const [value, setValue] = useState('');
    useImperativeHandle(ref, () => ({
      validateInput: () => value.trim().length > 0,
      getValue: () => value,
    }));
    return (
      <input
        aria-label={label}
        placeholder={placeholder}
        value={value}
        onChange={(e) => setValue(e.target.value)}
      />
    );
  });

  return { default: Stub };
});

const openSpy = vi.fn();

vi.mock('@/components/shared/Modal', () => {
  type Handle = { open: () => void; close: () => void };
  type Props = React.PropsWithChildren;

  const Stub = React.forwardRef<Handle, Props>(({ children }, ref) => {
    useImperativeHandle(ref, () => ({ open: openSpy, close: vi.fn() }));
    return (
      <div role="dialog" data-testid="modal">
        {children}
      </div>
    );
  });

  return { default: Stub };
});

vi.mock('@/components/shared/SuccessMessage', () => ({
  default: ({ title, description }: { title: string; description: string }) => (
    <div data-testid="success">
      {title}
      {description}
    </div>
  ),
}));

function createPassthrough<Tag extends keyof JSX.IntrinsicElements>(
  tag: Tag,
  tid?: string,
) {
  return ({
    children,
    ...rest
  }: React.PropsWithChildren<Record<string, unknown>>) =>
    React.createElement(
      tag,
      { ...(tid ? { 'data-testid': tid } : {}), ...rest },
      children,
    );
}

vi.mock('@/components/shared/BoxBorder', () => ({
  default: createPassthrough('div'),
}));

vi.mock('@/components/shared/Container', () => ({
  default: createPassthrough('div', 'container'),
}));

vi.mock('@/components/shared/PrimaryButton', () => ({
  default: ({
    children,
    ...rest
  }: React.PropsWithChildren<Record<string, unknown>>) => (
    <button {...rest}>{children}</button>
  ),
}));

vi.mock('@/components/shared/LoadingIndicatorButton', () => ({
  default: () => <span data-testid="loading">⋯</span>,
}));

const renderForm = () => {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={client}>
      <JoinRequestForm />
    </QueryClientProvider>,
  );
};

describe('JoinRequestForm – student', () => {
  const joinClassSpy = vi
    .spyOn(httpStudent, 'joinClass')
    .mockResolvedValue(undefined); // standaard: succes

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('valideert invoer: lege code ⇒ geen API-call', () => {
    renderForm();

    fireEvent.click(screen.getByRole('button', { name: 'join_class.submit' }));

    expect(joinClassSpy).not.toHaveBeenCalled();
  });

  it('stuurt join-code naar API en opent modal bij succes', async () => {
    renderForm();

    fireEvent.change(screen.getByLabelText('join_class.code.label'), {
      target: { value: 'ABC123' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'join_class.submit' }));

    await waitFor(() => {
      expect(joinClassSpy).toHaveBeenCalledWith({
        joinCode: 'ABC123',
      });
      expect(openSpy).toHaveBeenCalled();
    });
  });

  it('toont API-foutmelding (custom)', async () => {
    joinClassSpy.mockRejectedValueOnce({ info: { message: 'Oops' } });

    renderForm();
    fireEvent.change(screen.getByLabelText('join_class.code.label'), {
      target: { value: 'XYZ' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'join_class.submit' }));

    expect(await screen.findByText(/Oops/)).toBeInTheDocument();
  });

  it('toont standaard foutmelding bij onbekende error', async () => {
    joinClassSpy.mockRejectedValueOnce({});

    renderForm();
    fireEvent.change(screen.getByLabelText('join_class.code.label'), {
      target: { value: 'XYZ' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'join_class.submit' }));

    expect(await screen.findByText('join_class.error')).toBeInTheDocument();
  });
});
