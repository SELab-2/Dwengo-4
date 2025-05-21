import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, vi, beforeEach, expect } from 'vitest';

import TeamCreationModal from '@/components/teacher/assignment/TeamCreationModal';
import type { ClassItem, StudentItem } from '@/types/type';

vi.mock('@/components/teacher/assignment/TeamCreationModal.module.css', () => ({
  default: {},
}));
vi.mock('react-icons/fa', () => ({
  FaTrash: () => <span data-testid="trash" />,
  FaMinus: () => <span data-testid="minus" />,
}));

const students: StudentItem[] = [
  { id: 's1', firstName: 'Alice', lastName: 'Smith' } as StudentItem,
  { id: 's2', firstName: 'Bob', lastName: 'Jones' } as StudentItem,
];
const classes: ClassItem[] = [
  { id: '1', name: 'Class A', students } as ClassItem,
];

const baseProps = {
  classes,
  onClose: vi.fn(),
  selectedClasses: classes,
  teamSize: 2,
} as const;

describe('TeamCreationModal', () => {
  beforeEach(() => vi.resetAllMocks());

  it('laat studenten selecteren en maakt een team aan (team-modus)', () => {
    vi.spyOn(window, 'confirm').mockReturnValue(true);

    const setTeams = vi.fn();
    render(<TeamCreationModal {...baseProps} teams={{}} setTeams={setTeams} />);

    // selecteer beide studenten
    fireEvent.click(screen.getByText(/alice smith/i));
    fireEvent.click(screen.getByText(/bob jones/i));
    // klik op de create-knop
    fireEvent.click(screen.getByRole('button', { name: /create/i }));

    expect(setTeams).toHaveBeenCalledTimes(1);
    expect(setTeams).toHaveBeenCalledWith({
      '1': [
        expect.objectContaining({
          assignmentId: 0,
          teamId: 'team-1',
          team: expect.objectContaining({
            id: 'team-1',
            teamname: 'team-1',
            classId: '1',
            students: [{ user: students[0] }, { user: students[1] }],
          }),
        }),
      ],
    });
  });

  it('kan in individual-modus studenten toggelen', () => {
    let currentState = { '1': [] as StudentItem[] };
    const setIndividualStudents = vi.fn((newState) => {
      currentState = newState;
      rerender(
        <TeamCreationModal
          {...baseProps}
          isIndividual
          teams={{}}
          setTeams={vi.fn()}
          individualStudents={currentState}
          setIndividualStudents={setIndividualStudents}
        />,
      );
    });

    const { rerender } = render(
      <TeamCreationModal
        {...baseProps}
        isIndividual
        teams={{}}
        setTeams={vi.fn()}
        individualStudents={currentState}
        setIndividualStudents={setIndividualStudents}
      />,
    );

    const aliceNode = screen.getByText(/alice smith/i);

    // selecteer Alice
    fireEvent.click(aliceNode);
    expect(setIndividualStudents).toHaveBeenLastCalledWith({
      '1': [students[0]],
    });

    // deselecteer Alice
    fireEvent.click(aliceNode);
    expect(setIndividualStudents).toHaveBeenLastCalledWith({ '1': [] });
  });
});
