import React from 'react';
import { describe, it, afterEach, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter, LinkProps } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import AssignmentOverview from '@/components/student/AssignmentOverview';
import * as assignmentModule from '@/util/student/assignment';
import type { AssignmentItem } from '@/util/student/assignment';

// Mock translation
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, opts?: Record<string, unknown>) => {
      if (key === 'deadline') return `Deadline: ${opts?.date}`;
      if (key === 'loading.loading') return 'Laden...';
      if (key === 'assignments.error') return 'Er is een fout opgetreden';
      if (key === 'assignments.not_found') return 'Geen opdrachten gevonden';
      if (key === 'assignments.view') return 'Bekijk opdracht';
      return key;
    },
  }),
}));

// Mock Link component with proper typing
vi.mock('react-router-dom', async () => {
  const actual =
    await vi.importActual<typeof import('react-router-dom')>(
      'react-router-dom',
    );
  const StubLink: React.FC<LinkProps> = ({ children, to, ...rest }) => (
    <a href={typeof to === 'string' ? to : ''} {...rest}>
      {children}
    </a>
  );
  return { ...actual, Link: StubLink };
});

// Disable query retries
const createClient = () =>
  new QueryClient({ defaultOptions: { queries: { retry: false } } });

// Render component helper
const renderComponent = () =>
  render(
    <QueryClientProvider client={createClient()}>
      <BrowserRouter>
        <AssignmentOverview />
      </BrowserRouter>
    </QueryClientProvider>,
  );

afterEach(() => vi.clearAllMocks());

describe('AssignmentOverview – student', () => {
  it('toont laadstatus', async () => {
    vi.spyOn(assignmentModule, 'fetchAssignments').mockReturnValue(
      new Promise<AssignmentItem[]>(() => {}),
    );

    renderComponent();
    expect(await screen.findByText('Laden...')).toBeInTheDocument();
  });

  it('toont foutmelding met custom message', async () => {
    vi.spyOn(assignmentModule, 'fetchAssignments').mockRejectedValue({
      info: { message: 'Er ging iets mis' },
    });

    renderComponent();
    await waitFor(() =>
      expect(screen.getByText(/Er ging iets mis/)).toBeInTheDocument(),
    );
  });

  it('toont standaard foutmelding zonder message', async () => {
    vi.spyOn(assignmentModule, 'fetchAssignments').mockRejectedValue({});

    renderComponent();
    await waitFor(() =>
      expect(screen.getByText('Er is een fout opgetreden')).toBeInTheDocument(),
    );
  });

  it('toont lijst van assignments', async () => {
    const data: AssignmentItem[] = [
      {
        id: 1,
        title: 'Opdracht 1',
        description: 'Beschrijving 1',
        deadline: '2025-05-20T12:00:00Z',
      },
      {
        id: 2,
        title: 'Opdracht 2',
        description: 'Beschrijving 2',
        deadline: '2025-06-01T12:00:00Z',
      },
    ];
    vi.spyOn(assignmentModule, 'fetchAssignments').mockResolvedValue(data);

    renderComponent();
    expect(await screen.findByText('Opdracht 1')).toBeInTheDocument();
    expect(screen.getByText('Opdracht 2')).toBeInTheDocument();
    // beide deadlines zichtbaar
    expect(screen.getAllByText(/Deadline:/)).toHaveLength(2);
    // beide “Bekijk opdracht” knoppen
    expect(screen.getAllByText('Bekijk opdracht')).toHaveLength(2);
  });

  it('toont not-found boodschap bij lege lijst', async () => {
    vi.spyOn(assignmentModule, 'fetchAssignments').mockResolvedValue([]);

    renderComponent();
    expect(
      await screen.findByText('Geen opdrachten gevonden'),
    ).toBeInTheDocument();
  });
});
