import React from 'react';
import { describe, it, afterEach, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import ClassesStudent from '@/components/student/ClassesStudent';
import * as classModule from '@/util/student/class';
import type { ClassItem } from '@/types/type';

// Mock translation
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const dict: Record<string, string> = {
        'loading.loading': 'Laden...',
        'classes.error': 'Er is een fout opgetreden',
        'classes.not_found': 'Geen klassen gevonden',
        'classes.view': 'Bekijk klas',
      };
      return dict[key] ?? key;
    },
  }),
}));

// Mock navigation
const mockedNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual =
    await vi.importActual<typeof import('react-router-dom')>(
      'react-router-dom',
    );
  return { ...actual, useNavigate: () => mockedNavigate };
});

const createClient = () =>
  new QueryClient({ defaultOptions: { queries: { retry: false } } });

const renderComponent = () =>
  render(
    <QueryClientProvider client={createClient()}>
      <BrowserRouter>
        <ClassesStudent />
      </BrowserRouter>
    </QueryClientProvider>,
  );

afterEach(() => {
  vi.clearAllMocks();
});

describe('ClassesStudent – student', () => {
  it('toont laadstatus', async () => {
    vi.spyOn(classModule, 'fetchClasses').mockReturnValue(
      new Promise(() => {}), // blijft hangen
    );

    renderComponent();

    expect(await screen.findByText('Laden...')).toBeInTheDocument();
  });

  it('toont foutmelding met custom message', async () => {
    vi.spyOn(classModule, 'fetchClasses').mockRejectedValue({
      info: { message: 'Er ging iets mis' },
    });

    renderComponent();

    await waitFor(() =>
      expect(screen.getByText(/Er ging iets mis/)).toBeInTheDocument(),
    );
  });

  it('toont standaard foutmelding zonder message', async () => {
    vi.spyOn(classModule, 'fetchClasses').mockRejectedValue({});

    renderComponent();

    await waitFor(() =>
      expect(screen.getByText('Er is een fout opgetreden')).toBeInTheDocument(),
    );
  });

  it('toont lijst van klassen en navigeert bij klik', async () => {
    const data: ClassItem[] = [
      { id: 1, name: 'Klas A' },
      { id: 2, name: 'Klas B' },
    ];
    vi.spyOn(classModule, 'fetchClasses').mockResolvedValue(data);

    renderComponent();

    expect(await screen.findByText('Klas A')).toBeInTheDocument();
    expect(screen.getByText('Klas B')).toBeInTheDocument();
    const buttons = screen.getAllByText('Bekijk klas');
    expect(buttons).toHaveLength(2);

    fireEvent.click(buttons[0]);
    expect(mockedNavigate).toHaveBeenCalledWith('/student/class/1');
  });

  it('toont not-found boodschap bij lege lijst', async () => {
    vi.spyOn(classModule, 'fetchClasses').mockResolvedValue([]);

    renderComponent();

    expect(
      await screen.findByText('Geen klassen gevonden'),
    ).toBeInTheDocument();
  });
});
