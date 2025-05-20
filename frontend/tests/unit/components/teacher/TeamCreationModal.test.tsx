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

    fireEvent.click(screen.getByText(/alice smith/i));
    fireEvent.click(screen.getByText(/bob jones/i));
    // gebruik algemene create-knop
    fireEvent.click(screen.getByRole('button', { name: /create/i }));

    expect(setTeams).toHaveBeenCalledTimes(1);
    expect(setTeams).toHaveBeenCalledWith({
      1: [
        {
          id: 'team-1',
          students,
        },
      ],
    });
  });

  it('kan in individual-modus studenten toggelen', () => {
    /** we simuleren parent-state door na elke setter-call te rerenderen */
    let currentState = { 1: [] as StudentItem[] };
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

    // select Alice
    fireEvent.click(aliceNode);
    expect(setIndividualStudents).toHaveBeenLastCalledWith({
      1: [students[0]],
    });

    // deselect Alice
    fireEvent.click(aliceNode);
    expect(setIndividualStudents).toHaveBeenLastCalledWith({ 1: [] });
  });
});
