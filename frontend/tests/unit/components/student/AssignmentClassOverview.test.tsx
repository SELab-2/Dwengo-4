import React from 'react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import { render, screen, waitFor } from '@testing-library/react';

import AssignmentsForClassOverview from '@/components/student/AssignmentClassOverview';
import * as httpStudent from '@/util/student/httpStudent';
import type { AssignmentItem } from '@/util/student/httpStudent';

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

/** helper waardoor queries niet automatisch retried worden */
const createQueryClient = () =>
  new QueryClient({ defaultOptions: { queries: { retry: false } } });

/** rendert component binnen alle nodige providers */
const renderComponent = () =>
  render(
    <QueryClientProvider client={createQueryClient()}>
      <BrowserRouter>
        <AssignmentsForClassOverview classId="42" />
      </BrowserRouter>
    </QueryClientProvider>,
  );

describe('AssignmentClassOverview – student', () => {
  /* na elke test mocks resetten */
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('toont laadstatus', async () => {
    vi.spyOn(httpStudent, 'fetchAssignmentsForClass').mockReturnValue(
      // Promise die nooit resolve’t → in loading-state
      new Promise<AssignmentItem[]>(() => {}),
    );

    renderComponent();
    expect(await screen.findByText('Laden...')).toBeInTheDocument();
  });

  it('toont foutmelding met eigen message', async () => {
    vi.spyOn(httpStudent, 'fetchAssignmentsForClass').mockRejectedValue({
      info: { message: 'Er ging iets mis' },
    });

    renderComponent();

    await waitFor(() =>
      expect(screen.getByText(/Er ging iets mis/)).toBeInTheDocument(),
    );
  });

  it('toont standaard foutmelding zonder message', async () => {
    vi.spyOn(httpStudent, 'fetchAssignmentsForClass').mockRejectedValue({});

    renderComponent();

    await waitFor(() =>
      expect(screen.getByText('Er is een fout opgetreden')).toBeInTheDocument(),
    );
  });

  it('render­t een lijst van assignments', async () => {
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

    vi.spyOn(httpStudent, 'fetchAssignmentsForClass').mockResolvedValue(
      mockAssignments,
    );

    renderComponent();

    expect(await screen.findByText('Opdracht 1')).toBeInTheDocument();
    expect(screen.getByText('Opdracht 2')).toBeInTheDocument();
    // beide deadlines aanwezig
    expect(screen.getAllByText(/Deadline:/)).toHaveLength(2);
    // twee “Bekijk opdracht” knoppen
    expect(screen.getAllByText('Bekijk opdracht')).toHaveLength(2);
  });

  it('toont “Geen opdrachten gevonden” bij lege lijst', async () => {
    vi.spyOn(httpStudent, 'fetchAssignmentsForClass').mockResolvedValue([]);

    renderComponent();

    expect(
      await screen.findByText('Geen opdrachten gevonden'),
    ).toBeInTheDocument();
  });
});
