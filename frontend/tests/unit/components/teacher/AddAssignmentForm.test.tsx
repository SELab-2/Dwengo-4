import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';

import AddAssignmentForm from '@/components/teacher/assignment/AddAssignmentForm';
import * as httpTeacher from '@/util/teacher/httpTeacher';

type ClassItemT = {
  id: string;
  name: string;
  code: string;
  createdAt: string;
  updatedAt: string;
};

type LearningPathT = { id: string; title: string; isExternal: boolean };

type AssignmentT = {
  id: number;
  title: string;
  description: string;
  deadline: string;
  pathRef: string;
  teamSize: number;
  isExternal: boolean;
  classAssignments: { class: ClassItemT }[];
  classTeams: Record<
    string,
    { id: string; teamName: string; studentIds: number[]; students: [] }[]
  >;
};

vi.mock('react-router-dom', async () => {
  const actual =
    await vi.importActual<typeof import('react-router-dom')>(
      'react-router-dom',
    );
  return { ...actual, useNavigate: () => vi.fn() };
});

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (k: string) => k }),
}));

vi.mock('@/util/teacher/httpTeacher');

const renderWithProviders = (ui: React.ReactElement) => {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={client}>
      <BrowserRouter>{ui}</BrowserRouter>
    </QueryClientProvider>,
  );
};

const classesData: ClassItemT[] = [
  {
    id: '10',
    name: '1A',
    code: '',
    createdAt: '',
    updatedAt: '',
  },
];

const learningPaths: LearningPathT[] = [
  { id: 'lp1', title: 'LP-1', isExternal: false },
];

describe('AddAssignmentForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(httpTeacher, 'fetchLearningPaths').mockResolvedValue(
      learningPaths,
    );
  });

  it('roept géén API-call wanneer geen klas is geselecteerd', async () => {
    renderWithProviders(<AddAssignmentForm classesData={classesData} />);

    /* wachten tot learning paths zichtbaar zijn */
    await screen.findByText('LP-1');

    /* verplichte velden invullen (behalve klas) */
    fireEvent.change(screen.getByLabelText(/add title/i), {
      target: { value: 'Opdracht' },
    });
    fireEvent.change(screen.getByLabelText(/add description/i), {
      target: { value: 'Beschrijving' },
    });
    fireEvent.change(screen.getByLabelText(/choose learning path/i), {
      target: { value: 'lp1' },
    });
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    fireEvent.change(screen.getByLabelText(/choose deadline/i), {
      target: { value: tomorrow.toISOString().slice(0, 10) },
    });

    fireEvent.click(screen.getByRole('button', { name: /confirm/i }));

    await waitFor(() =>
      expect(httpTeacher.postAssignment).not.toHaveBeenCalled(),
    );
  });

  it('roept updateAssignment met correct payload in edit-modus', async () => {
    const assignmentData: AssignmentT = {
      id: 1,
      title: 'Bestaande opdracht',
      description: 'Bestaande beschrijving',
      deadline: new Date('2099-01-01').toISOString(),
      pathRef: 'lp1',
      teamSize: 2,
      isExternal: false,
      classAssignments: [
        {
          class: {
            id: '10',
            name: '1A',
            code: '',
            createdAt: '',
            updatedAt: '',
          },
        },
      ],
      classTeams: {
        10: [
          {
            id: 'T-1',
            teamName: 'T-1',
            studentIds: [1, 2],
            students: [],
          },
        ],
      },
    };

    vi.spyOn(httpTeacher, 'updateAssignment').mockResolvedValue({});

    renderWithProviders(
      <AddAssignmentForm
        classesData={classesData}
        isEditing
        assignmentData={assignmentData}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: /confirm/i }));

    await waitFor(() =>
      expect(httpTeacher.updateAssignment).toHaveBeenCalledTimes(1),
    );

    const [payload] = vi.mocked(httpTeacher.updateAssignment).mock.calls[0];

    expect(payload).toMatchObject({
      id: 1,
      title: 'Bestaande opdracht',
      classTeams: {
        10: [expect.objectContaining({ teamName: 'T-1' })],
      },
    });
  });
});
