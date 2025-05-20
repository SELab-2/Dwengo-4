import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import { vi, beforeEach, describe, expect, it } from 'vitest';

import AddAssignmentForm from '@/components/teacher/assignment/AddAssignmentForm';
import * as learningPathModule from '@/util/shared/learningPath';
import * as assignmentModule from '@/util/teacher/assignment';

// Mock navigation
vi.mock('react-router-dom', async () => {
  const actual =
    await vi.importActual<typeof import('react-router-dom')>(
      'react-router-dom',
    );
  return { ...actual, useNavigate: () => vi.fn() };
});

// Mock translation
vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

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

const classesData = [
  { id: '10', name: '1A', code: '', createdAt: '', updatedAt: '' },
];
const learningPaths = [{ id: 'lp1', title: 'LP-1', isExternal: false }];

describe('AddAssignmentForm – teacher', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(learningPathModule, 'fetchLearningPaths').mockResolvedValue(
      learningPaths,
    );
    // Return undefined instead of any
    vi.spyOn(assignmentModule, 'postAssignment').mockResolvedValue(undefined);
    vi.spyOn(assignmentModule, 'updateAssignment').mockResolvedValue(undefined);
  });

  it('voert géén API-call uit wanneer er geen klas is geselecteerd', async () => {
    renderWithProviders(<AddAssignmentForm classesData={classesData} />);

    // wacht tot learning paths geladen zijn
    await screen.findByText('LP-1');

    // velden invullen behalve klas
    fireEvent.change(screen.getByLabelText(/assignments_form\.title/i), {
      target: { value: 'Opdracht' },
    });
    fireEvent.change(screen.getByLabelText(/assignments_form\.description/i), {
      target: { value: 'Beschrijving' },
    });
    fireEvent.change(
      screen.getByLabelText(/assignments_form\.learning_path\.choose/i),
      { target: { value: 'lp1' } },
    );
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    fireEvent.change(screen.getByLabelText(/assignments_form\.deadline/i), {
      target: { value: tomorrow.toISOString().slice(0, 10) },
    });

    // submit
    fireEvent.click(
      screen.getByRole('button', { name: /assignments_form\.submit/i }),
    );

    await waitFor(() =>
      expect(assignmentModule.postAssignment).not.toHaveBeenCalled(),
    );
  });

  it('roept updateAssignment met correct payload in edit-modus', async () => {
    const assignmentData = {
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
        10: [{ id: 'T-1', teamName: 'T-1', studentIds: [1, 2], students: [] }],
      },
    };

    renderWithProviders(
      <AddAssignmentForm
        classesData={classesData}
        isEditing
        assignmentData={assignmentData}
      />,
    );

    // submit
    fireEvent.click(
      screen.getByRole('button', { name: /assignments_form\.submit/i }),
    );

    await waitFor(() =>
      expect(assignmentModule.updateAssignment).toHaveBeenCalledTimes(1),
    );

    const [payload] = vi.mocked(assignmentModule.updateAssignment).mock
      .calls[0];
    expect(payload).toMatchObject({
      id: 1,
      title: 'Bestaande opdracht',
      classTeams: {
        10: [expect.objectContaining({ teamName: 'T-1' })],
      },
    });
  });
});
