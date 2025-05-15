import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import CreateClassForm from '@/components/teacher/classes/CreateClassForm';
import * as httpTeacher from '@/util/teacher/httpTeacher';
import { ClassItem } from '@/types/type';

vi.mock('@/components/shared/BoxBorder.module.css', () => ({
  default: {},
}));

vi.mock('@/components/shared/Container', () => ({
  default: (p: React.PropsWithChildren) => (
    <div data-testid="container" {...p} />
  ),
}));

vi.mock('@/components/shared/BoxBorder', () => ({
  default: (p: React.PropsWithChildren & { extraClasses?: string }) => (
    <div data-testid="boxborder" {...p} />
  ),
}));

type InputHandle = {
  validateInput: () => boolean;
  getValue: () => string;
};

const validateSpy = vi.fn();
const getValueSpy = vi.fn();

vi.mock('@/components/shared/InputWithChecks', () => ({
  __esModule: true,
  /* forwardRef → component onder test gebruikt .current */
  default: React.forwardRef<InputHandle, Record<string, unknown>>(
    (_props, ref) => {
      React.useImperativeHandle(ref, () => ({
        validateInput: validateSpy,
        getValue: getValueSpy,
      }));
      return <input data-testid="input" />;
    },
  ),
}));

const setup = () => {
  const qc = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={qc}>
      <CreateClassForm />
    </QueryClientProvider>,
  );
};

beforeEach(() => {
  vi.resetAllMocks();
  validateSpy.mockReturnValue(true);
  getValueSpy.mockReturnValue('New class');
});

describe('CreateClassForm – teacher', () => {
  it('valideert invoer en stuurt mutatie', async () => {
    const createClassMock = vi
      .spyOn(httpTeacher, 'createClass')
      .mockResolvedValue({
        id: '1',
        name: 'New class',
        students: [],
      } satisfies ClassItem);

    setup();

    fireEvent.submit(screen.getByRole('button', { name: /submit/i }));

    await waitFor(() =>
      expect(createClassMock).toHaveBeenCalledWith({
        name: 'New class',
      }),
    );
  });

  it('toont foutmelding wanneer mutatie faalt', async () => {
    vi.spyOn(httpTeacher, 'createClass').mockRejectedValue({
      info: { message: 'Name taken' },
    });

    setup();
    fireEvent.submit(screen.getByRole('button', { name: /submit/i }));

    expect(await screen.findByText(/name taken/i)).toBeInTheDocument();
  });

  it('blokkeert submit wanneer validatie faalt', () => {
    validateSpy.mockReturnValue(false);

    const createClassMock = vi
      .spyOn(httpTeacher, 'createClass')
      .mockResolvedValue({} as unknown as ClassItem);

    setup();
    fireEvent.submit(screen.getByRole('button', { name: /submit/i }));

    expect(createClassMock).not.toHaveBeenCalled();
  });
});
