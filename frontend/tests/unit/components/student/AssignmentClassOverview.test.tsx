import React from 'react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import { render, screen, waitFor } from '@testing-library/react';

import AssignmentsForClassOverview from '@/components/student/AssignmentClassOverview';
import * as assignmentModule from '@/util/student/assignment';
import type { AssignmentItem } from '@/util/student/assignment';

// Mock translation to return the key or formatted strings
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, opts?: Record<string, unknown>) => {
      switch (key) {
        case 'deadline':
          return `Deadline: ${opts?.date}`;
        case 'loading.loading':
          return 'Laden...';
        case 'assignments.error':
          return 'Er is een fout opgetreden';
        case 'assignments.not_found':
          return 'Geen opdrachten gevonden';
        case 'assignments.view':
          return 'Bekijk opdracht';
        default:
          return key;
      }
    },
  }),
}));

// Mock react-router-dom Link
vi.mock('react-router-dom', async () => {
  const actual =
    await vi.importActual<typeof import('react-router-dom')>(
      'react-router-dom',
    );
  return {
    ...actual,
    Link: ({ children, to }) => <a href={to}>{children}</a>,
  };
});

// Helper to disable retries
const createQueryClient = () =>
  new QueryClient({ defaultOptions: { queries: { retry: false } } });

// Render component within providers
const renderComponent = (classId = '42') =>
  render(
    <QueryClientProvider client={createQueryClient()}>
      <BrowserRouter>
        <AssignmentsForClassOverview classId={classId} />
      </BrowserRouter>
    </QueryClientProvider>,
  );

afterEach(() => {
  vi.clearAllMocks();
});

describe('AssignmentClassOverview – student', () => {
  it('toont laadstatus', async () => {
    vi.spyOn(assignmentModule, 'fetchAssignmentsForClass').mockReturnValue(
      new Promise<AssignmentItem[]>(() => {}),
    );

    renderComponent();
    expect(await screen.findByText('Laden...')).toBeInTheDocument();
  });

  it('toont foutmelding met eigen message', async () => {
    vi.spyOn(assignmentModule, 'fetchAssignmentsForClass').mockRejectedValue({
      info: { message: 'Er ging iets mis' },
    });

    renderComponent();
    await waitFor(() =>
      expect(screen.getByText(/Er ging iets mis/)).toBeInTheDocument(),
    );
  });

  it('toont standaard foutmelding zonder message', async () => {
    vi.spyOn(assignmentModule, 'fetchAssignmentsForClass').mockRejectedValue(
      {},
    );

    renderComponent();
    await waitFor(() =>
      expect(screen.getByText('Er is een fout opgetreden')).toBeInTheDocument(),
    );
  });

  it('rendert een lijst van assignments met deadlines en view-knoppen', async () => {
    const mockAssignments: AssignmentItem[] = [
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
        deadline: '2025-06-10T12:00:00Z',
      },
    ];

    vi.spyOn(assignmentModule, 'fetchAssignmentsForClass').mockResolvedValue(
      mockAssignments,
    );

    renderComponent('42');

    expect(await screen.findByText('Opdracht 1')).toBeInTheDocument();
    expect(screen.getByText('Opdracht 2')).toBeInTheDocument();

    // beide deadlines aanwezig
    expect(screen.getAllByText(/Deadline:/)).toHaveLength(2);

    // twee “Bekijk opdracht” knoppen
    expect(screen.getAllByText('Bekijk opdracht')).toHaveLength(2);
  });

  it('toont “Geen opdrachten gevonden” bij lege lijst', async () => {
    vi.spyOn(assignmentModule, 'fetchAssignmentsForClass').mockResolvedValue(
      [],
    );

    renderComponent();
    expect(
      await screen.findByText('Geen opdrachten gevonden'),
    ).toBeInTheDocument();
  });
});
