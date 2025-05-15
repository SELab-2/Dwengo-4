import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import JoinRequestForm from '@/components/student/classes/JoinRequestForm';
import * as httpStudent from '@/util/student/classJoin';

// Mock translation
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (k: string, opts?: Record<string, unknown>) =>
      k === 'deadline' ? `Deadline: ${opts?.date}` : k,
  }),
}));

// Stub shared components
vi.mock('@/components/shared/InputWithChecks', () => {
  type Props = { label: string; placeholder?: string };
  return {
    __esModule: true,
    default: React.forwardRef<
      { validateInput: () => boolean; getValue: () => string },
      Props
    >((props, ref) => {
      React.useImperativeHandle(ref, () => ({
        validateInput: () => true,
        getValue: () => 'input',
      }));
      return <input aria-label={props.label} placeholder={props.placeholder} />;
    }),
  };
});
vi.mock('@/components/shared/Modal', () => ({
  __esModule: true,
  default: React.forwardRef((_, ref) => {
    React.useImperativeHandle(ref, () => ({ open: vi.fn(), close: vi.fn() }));
    return <div role="dialog" data-testid="modal" />;
  }),
}));
vi.mock('@/components/shared/SuccessMessage', () => ({
  default: ({ title, description }: { title: string; description: string }) => (
    <div data-testid="success">
      {title}
      {description}
    </div>
  ),
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
  let joinClassSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    vi.clearAllMocks();
    joinClassSpy = vi
      .spyOn(httpStudent, 'joinClass')
      .mockResolvedValue(undefined);
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
      expect(joinClassSpy).toHaveBeenCalledWith({ joinCode: 'ABC123' });
      expect(screen.getByTestId('modal')).toBeInTheDocument();
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
