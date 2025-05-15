import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import TeamsDisplay from '@/components/teacher/assignment/TeamsDisplay';
import type { ClassItem, Team, StudentItem } from '@/types/type';

vi.mock('@/components/teacher/assignment/AddAssignmentForm.module.css', () => ({
  default: {
    rightSide: '_rightSide_',
    teamsList: '_teamsList_',
    teamPreview: '_teamPreview_',
    editButton: '_editButton_',
    selectedCount: '_selectedCount_',
  },
}));

const alice: StudentItem = {
  id: 's1',
  firstName: 'Alice',
  lastName: 'Smith',
} as StudentItem;
const bob: StudentItem = {
  id: 's2',
  firstName: 'Bob',
  lastName: 'Jones',
} as StudentItem;

const classA: ClassItem = {
  id: '1',
  name: 'Class A',
  students: [alice, bob],
} as ClassItem;

const teams: Record<string, Team[]> = {
  1: [
    { id: 'team-1', students: [alice] } as Team,
    { id: 'team-2', students: [bob] } as Team,
  ],
};

const renderGroup = (
  override: Partial<React.ComponentProps<typeof TeamsDisplay>> = {},
) =>
  render(
    <TeamsDisplay
      assignmentType="group"
      teams={teams}
      selectedClasses={[classA]}
      individualStudents={{}}
      onEditClick={vi.fn()}
      {...override}
    />,
  );

const renderIndividual = (
  override: Partial<React.ComponentProps<typeof TeamsDisplay>> = {},
) =>
  render(
    <TeamsDisplay
      assignmentType="individual"
      teams={{}}
      selectedClasses={[classA]}
      individualStudents={{ 1: [alice] }}
      onEditClick={vi.fn()}
      {...override}
    />,
  );

describe('TeamsDisplay', () => {
  beforeEach(() => vi.resetAllMocks());

  it('rendert teams en roept onEditClick aan (group-modus)', () => {
    const onEdit = vi.fn();
    renderGroup({ onEditClick: onEdit });

    // klasse-header
    expect(screen.getByText(/class: class a/i)).toBeInTheDocument();

    // team-regels
    expect(screen.getByText(/team-1/i)).toBeInTheDocument();
    expect(screen.getByText(/team-2/i)).toBeInTheDocument();
    expect(screen.getByText(/alice smith/i)).toBeInTheDocument();
    expect(screen.getByText(/bob jones/i)).toBeInTheDocument();

    // edit-knop
    const btn = screen.getByRole('button', { name: /edit teams/i });
    fireEvent.click(btn);
    expect(onEdit).toHaveBeenCalledTimes(1);
  });

  it('toont geselecteerde studenten en roept onEditClick aan (individual-modus)', () => {
    const onEdit = vi.fn();
    renderIndividual({ onEditClick: onEdit });

    // klasse-header + count
    expect(screen.getByText(/class: class a/i)).toBeInTheDocument();
    expect(screen.getByText(/selected: 1 \/ 2/i)).toBeInTheDocument();

    // student-naam
    expect(screen.getByText(/alice smith/i)).toBeInTheDocument();

    // edit-knop
    const btn = screen.getByRole('button', { name: /edit students/i });
    fireEvent.click(btn);
    expect(onEdit).toHaveBeenCalledTimes(1);
  });
});
