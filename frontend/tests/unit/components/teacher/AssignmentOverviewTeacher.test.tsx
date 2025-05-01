import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import AssignmentOverviewTeacher from '@/components/teacher/AssignmentOverviewTeacher';
import * as httpTeacher from '@/util/teacher/httpTeacher';
import { BrowserRouter } from 'react-router-dom';

// Mock vertaling
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, options?: Record<string, unknown>) => {
      if (key === 'deadline') return `Deadline: ${options?.date}`;
      if (key === 'assignments.error') return 'Er is een fout opgetreden';
      if (key === 'assignments.not_found') return 'Geen opdrachten gevonden';
      if (key === 'assignments.view') return 'Bekijk opdracht';
      if (key === 'loading.loading') return 'Laden...';
      return key;
    },
  }),
}));

const createTestClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  });

const renderComponent = (client: QueryClient) => {
  return render(
    <QueryClientProvider client={client}>
      <BrowserRouter>
        <AssignmentOverviewTeacher />
      </BrowserRouter>
    </QueryClientProvider>,
  );
};

describe('AssignmentOverviewTeacher', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('shows loading state initially', async () => {
    vi.spyOn(httpTeacher, 'fetchAllAssignments').mockReturnValue(
      new Promise(() => {}), // blijft hangen
    );

    const client = createTestClient();
    renderComponent(client);

    expect(await screen.findByText('Laden...')).toBeInTheDocument();
  });

  it('shows error state when fetch fails with error message', async () => {
    vi.spyOn(httpTeacher, 'fetchAllAssignments').mockRejectedValue({
      info: { message: 'Er ging iets mis' },
    });

    const client = createTestClient();
    renderComponent(client);

    await waitFor(() => {
      expect(screen.getByText(/Er ging iets mis/)).toBeInTheDocument();
    });
  });

  it('shows default error message when no message in error', async () => {
    vi.spyOn(httpTeacher, 'fetchAllAssignments').mockRejectedValue({});

    const client = createTestClient();
    renderComponent(client);

    await waitFor(() => {
      expect(screen.getByText('Er is een fout opgetreden')).toBeInTheDocument();
    });
  });

  it('shows list of assignments when data is available', async () => {
    const mockAssignments = [
      {
        id: 1,
        title: 'Test Assignment 1',
        description: 'This is a description for assignment 1',
        deadline: '2025-05-01T12:00:00Z',
      },
      {
        id: 2,
        title: 'Test Assignment 2',
        description: 'This is a description for assignment 2',
        deadline: '2025-06-01T12:00:00Z',
      },
    ];

    vi.spyOn(httpTeacher, 'fetchAllAssignments').mockResolvedValue(
      mockAssignments,
    );

    const client = createTestClient();
    renderComponent(client);

    expect(await screen.findByText('Test Assignment 1')).toBeInTheDocument();
    expect(screen.getByText('Test Assignment 2')).toBeInTheDocument();
    expect(screen.getAllByText(/Deadline:/, { exact: false })).toHaveLength(2);
    expect(screen.getAllByText('Bekijk opdracht')).toHaveLength(2);
  });

  it('shows not_found message when no assignments available', async () => {
    vi.spyOn(httpTeacher, 'fetchAllAssignments').mockResolvedValue([]);

    const client = createTestClient();
    renderComponent(client);

    expect(
      await screen.findByText('Geen opdrachten gevonden'),
    ).toBeInTheDocument();
  });
});
