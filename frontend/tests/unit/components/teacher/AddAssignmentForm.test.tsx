import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import { vi, beforeEach, describe, expect, it } from 'vitest';

import AddAssignmentForm from '@/components/teacher/assignment/AddAssignmentForm';
import * as learningPathModule from '@/util/shared/learningPath';
import * as assignmentModule from '@/util/teacher/assignment';

// Mock translation om gewoon de key terug te geven
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
    vi.spyOn(assignmentModule, 'postAssignment').mockResolvedValue(undefined);
    vi.spyOn(assignmentModule, 'updateAssignment').mockResolvedValue(undefined);
  });

  it('voert géén API-call uit wanneer er geen klas is geselecteerd', async () => {
    renderWithProviders(<AddAssignmentForm classesData={classesData} />);

    // wachten tot de learning paths geladen zijn
    await screen.findByText('LP-1');

    // titel en beschrijving invullen via textbox-role
    const [titleInput, descInput] = screen.getAllByRole('textbox');
    fireEvent.change(titleInput, { target: { value: 'Opdracht' } });
    fireEvent.change(descInput, { target: { value: 'Beschrijving' } });

    // learning path select
    fireEvent.change(
      screen.getByLabelText(/assignments_form\.learning_path\.choose/i),
      { target: { value: 'lp1' } },
    );

    // deadline invullen (morgen)
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    fireEvent.change(screen.getByLabelText(/assignments_form\.deadline/i), {
      target: { value: tomorrow.toISOString().slice(0, 10) },
    });

    // submit klikken
    fireEvent.click(
      screen.getByRole('button', { name: /assignments_form\.submit/i }),
    );

    await waitFor(() =>
      expect(assignmentModule.postAssignment).not.toHaveBeenCalled(),
    );
  });

  it('roept updateAssignment met juist payload in edit-modus', async () => {
    // We voegen nu teamAssignments toe zodat de component de teams‐state kan vullen
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
      // én teamAssignments zodat useEffect de interne teams state vult
      teamAssignments: [{ team: { id: 'T-1', classId: 10, students: [] } }],
    };

    renderWithProviders(
      <AddAssignmentForm
        classesData={classesData}
        isEditing
        assignmentData={assignmentData}
      />,
    );

    // direct submit klikken
    fireEvent.click(
      screen.getByRole('button', { name: /assignments_form\.submit/i }),
    );

    await waitFor(() =>
      expect(assignmentModule.updateAssignment).toHaveBeenCalledTimes(1),
    );

    const [[payload]] = vi.mocked(assignmentModule.updateAssignment).mock.calls;
    expect(payload).toMatchObject({
      id: 1,
      title: 'Bestaande opdracht',
      classTeams: {
        10: [expect.objectContaining({ teamName: 'T-1' })],
      },
    });
  });
});
