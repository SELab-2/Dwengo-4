import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import { vi, beforeEach, describe, expect, it } from 'vitest';

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

/* Router – voorkom echte navigation */
vi.mock('react-router-dom', async () => {
  const actual =
    await vi.importActual<typeof import('react-router-dom')>(
      'react-router-dom',
    );
  return { ...actual, useNavigate: () => vi.fn() };
});

/* vertalingen */
vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (k: string) => k }),
}));

/* API-helpers */
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

describe('AddAssignmentForm – teacher', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    /* laat de learning-path-query meteen data teruggeven */
    vi.spyOn(httpTeacher, 'fetchLearningPaths').mockResolvedValue(
      learningPaths,
    );
  });

  it('voert géén API-call uit wanneer er geen klas is geselecteerd', async () => {
    renderWithProviders(<AddAssignmentForm classesData={classesData} />);

    /* wachten tot learning paths zichtbaar zijn */
    await screen.findByText('LP-1');

    /* overige velden invullen */
    fireEvent.change(screen.getByLabelText(/add title/i), {
      target: { value: 'Opdracht' },
    });
    fireEvent.change(screen.getByLabelText(/add description/i), {
      target: { value: 'Beschrijving' },
    });
    fireEvent.change(screen.getByLabelText(/choose learning path/i), {
      target: { value: 'lp1' },
    });

    /* deadline = morgen */
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    fireEvent.change(screen.getByLabelText(/choose deadline/i), {
      target: { value: tomorrow.toISOString().slice(0, 10) },
    });

    /* submit */
    fireEvent.click(screen.getByRole('button', { name: /confirm/i }));

    await waitFor(() =>
      expect(httpTeacher.postAssignment).not.toHaveBeenCalled(),
    );
  });

  it('roept updateAssignment met juist payload in edit-modus', async () => {
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

    /* direct submit (geen wijzigingen) */
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
