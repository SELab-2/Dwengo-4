import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';

import AssignmentTypeSelection from '@/components/teacher/assignment/AssignmentTypeSelection';

const defaultProps = (overrides = {}) => ({
  assignmentType: '',
  teamSize: 2,
  onAssignmentTypeChange: vi.fn(),
  onTeamSizeChange: vi.fn(),
  ...overrides,
});

describe('AssignmentTypeSelection', () => {
  it('render t een keuzelijst met standaardwaarde', () => {
    render(<AssignmentTypeSelection {...defaultProps()} />);
    const select = screen.getByLabelText(
      /assignment type/i,
    ) as HTMLSelectElement;
    expect(select.value).toBe('');
    // team-size-veld hoort NIET zichtbaar te zijn
    expect(screen.queryByRole('spinbutton')).toBeNull();
  });

  it('roept onAssignmentTypeChange wanneer een optie wordt gekozen', () => {
    const onChange = vi.fn();
    render(
      <AssignmentTypeSelection
        {...defaultProps({ onAssignmentTypeChange: onChange })}
      />,
    );
    fireEvent.change(screen.getByLabelText(/assignment type/i), {
      target: { value: 'group' },
    });
    expect(onChange).toHaveBeenCalled();
  });

  it('toont en verwerkt team-size input als type "group" is geselecteerd', () => {
    const onSizeChange = vi.fn();
    render(
      <AssignmentTypeSelection
        {...defaultProps({
          assignmentType: 'group',
          teamSize: 3,
          onTeamSizeChange: onSizeChange,
        })}
      />,
    );

    // team-size input verschijnt
    const input = screen.getByRole('spinbutton') as HTMLInputElement;
    expect(input.value).toBe('3');

    // wijzig waarde
    fireEvent.change(input, { target: { value: '4' } });
    expect(onSizeChange).toHaveBeenCalled();
  });

  it('verbergt team-size input bij type "individual"', () => {
    render(
      <AssignmentTypeSelection
        {...defaultProps({ assignmentType: 'individual' })}
      />,
    );
    expect(screen.queryByRole('spinbutton')).toBeNull();
  });
});
