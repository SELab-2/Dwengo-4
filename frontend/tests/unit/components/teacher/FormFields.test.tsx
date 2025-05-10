import React from 'react';
import { describe, it, vi, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';

import FormFields from '@/components/teacher/assignment/FormFields';
import { ClassItem, LearningPath } from '@/types/type';

vi.mock('@/components/teacher/assignment/CustomDropdownMultiselect', () => ({
  default: ({
    selectedOptions,
    onChange,
  }: {
    selectedOptions: ClassItem[];
    onChange: (c: ClassItem[]) => void;
  }) => (
    <button
      data-testid="dropdown"
      onClick={() => {
        const fake = { id: '1', name: '1A' } as ClassItem;
        onChange(selectedOptions.some((c) => c.id === fake.id) ? [] : [fake]);
      }}
    >
      DROPDOWN
    </button>
  ),
}));

const classesData: ClassItem[] = [{ id: '1', name: '1A' } as ClassItem];

const learningPaths: LearningPath[] = [
  { id: 'lp1', title: 'LP-1' } as LearningPath,
  { id: 'lp2', title: 'LP-2' } as LearningPath,
];

const baseProps = () => ({
  title: 'Opdracht',
  setTitle: vi.fn(),
  description: 'Beschrijving',
  setDescription: vi.fn(),
  selectedClasses: [] as ClassItem[],
  setSelectedClasses: vi.fn(),
  classesData,
  isEditing: false,
  formErrors: {},
  learningPaths,
  selectedLearningPath: undefined as LearningPath | undefined,
  handleLearningPathChange: vi.fn(),
  isLearningPathsLoading: false,
  isLearningPathsError: false,
  learningPathsError: undefined,
});

describe('FormFields', () => {
  beforeEach(() => vi.clearAllMocks());

  it('rendert basisvelden en placeholder-optie in select', () => {
    render(<FormFields {...baseProps()} />);

    // label-tekst aanwezig
    expect(screen.getByText(/choose class/i)).toBeInTheDocument();

    // placeholder optie in de learning-path-select
    expect(
      screen.getByRole('option', { name: /-select a path-/i }),
    ).toBeInTheDocument();
  });

  it('geeft een foutmelding weer wanneer formErrors.classes is gezet', () => {
    render(<FormFields {...baseProps()} formErrors={{ classes: 'Error!' }} />);
    expect(screen.getByText('Error!')).toBeInTheDocument();
  });

  it('toont “Loading learning paths…” bij loading-state', () => {
    render(
      <FormFields {...baseProps()} isLearningPathsLoading learningPaths={[]} />,
    );
    expect(screen.getByText(/loading learning paths/i)).toBeInTheDocument();
  });

  it('toont foutmelding bij error-state van learning paths', () => {
    const err = new Error('Boom');
    render(
      <FormFields
        {...baseProps()}
        isLearningPathsError
        learningPathsError={err}
      />,
    );
    expect(screen.getByText(/boom/i)).toBeInTheDocument();
  });

  it('roept callbacks aan bij wijzigen titel, description en select', () => {
    const props = baseProps();
    render(<FormFields {...props} />);

    fireEvent.change(screen.getByLabelText(/add title/i), {
      target: { value: 'Nieuw' },
    });
    expect(props.setTitle).toHaveBeenCalledWith('Nieuw');

    fireEvent.change(screen.getByLabelText(/add description/i), {
      target: { value: 'Desc' },
    });
    expect(props.setDescription).toHaveBeenCalledWith('Desc');

    fireEvent.change(screen.getByLabelText(/choose learning path/i), {
      target: { value: 'lp2' },
    });
    expect(props.handleLearningPathChange).toHaveBeenCalled();
  });

  it('staat toe om klassen te selecteren via het dropdown-stub', () => {
    const props = baseProps();
    render(<FormFields {...props} />);
    fireEvent.click(screen.getByTestId('dropdown'));
    expect(props.setSelectedClasses).toHaveBeenCalledWith([
      { id: '1', name: '1A' },
    ]);
  });
});
