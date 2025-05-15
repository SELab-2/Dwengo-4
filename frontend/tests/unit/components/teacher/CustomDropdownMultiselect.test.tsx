import React from 'react';
import { describe, it, beforeEach, expect, vi } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';

import CustomDropdownMultiselect from '@/components/teacher/assignment/CustomDropdownMultiselect';
import { ClassItem } from '@/types/type';

const classes: ClassItem[] = [
  { id: '1', name: '1A' } as ClassItem,
  { id: '2', name: '2B' } as ClassItem,
  { id: '3', name: '3C' } as ClassItem,
];

const setup = (selected: ClassItem[] = []) => {
  const onChange = vi.fn();
  const utils = render(
    <CustomDropdownMultiselect
      options={classes}
      selectedOptions={selected}
      onChange={onChange}
    />,
  );
  return { ...utils, onChange };
};

describe('CustomDropdownMultiselect', () => {
  beforeEach(() => vi.clearAllMocks());

  it('toont placeholder als er geen klassen geselecteerd zijn', () => {
    setup();
    expect(screen.getByText(/select classes/i)).toBeInTheDocument();
  });

  it('opent het dropdown-menu en toont alle opties', () => {
    setup();
    // Toggle gebeurt door op de placeholder te klikken
    fireEvent.click(screen.getByText(/select classes/i));
    classes.forEach(({ name }) =>
      expect(screen.getByLabelText(name)).toBeInTheDocument(),
    );
  });

  it('roept onChange met juiste payload als een optie wordt aangevinkt', () => {
    const { onChange } = setup();
    fireEvent.click(screen.getByText(/select classes/i)); // open
    fireEvent.click(screen.getByLabelText('1A')); // vink aan
    expect(onChange).toHaveBeenCalledWith([classes[0]]);
  });

  it('laat chips zien voor geselecteerde klassen en kan verwijderen', () => {
    const { onChange } = setup([classes[0], classes[1]]);

    // Chips zichtbaar
    expect(screen.getByText('1A')).toBeInTheDocument();
    expect(screen.getByText('2B')).toBeInTheDocument();

    // Zoek het “×”-element binnen de chip “1A” en klik
    const chip1 = screen.getByText('1A').closest('span')!;
    const removeBtn = within(chip1).getByText('×');
    fireEvent.click(removeBtn);

    expect(onChange).toHaveBeenCalledWith([classes[1]]);
  });

  it('vinkt checkbox correct aan/uit op basis van selectie', () => {
    const { onChange } = setup([classes[2]]);
    fireEvent.click(screen.getByText(/3C/)); // chip-tekst opent ook dropdown
    const checkbox = screen.getByLabelText('3C') as HTMLInputElement;
    expect(checkbox.checked).toBe(true);

    fireEvent.click(checkbox); // uitvinken
    expect(onChange).toHaveBeenCalledWith([]);
  });
});
