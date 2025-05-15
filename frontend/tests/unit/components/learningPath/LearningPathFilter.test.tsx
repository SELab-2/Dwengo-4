import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';

interface Filter {
  id: string;
  type: string;
  value: string[];
}

vi.mock('@/components/ui/button', () => ({
  Button: ({
    children,
    ...rest
  }: React.PropsWithChildren<
    React.ButtonHTMLAttributes<HTMLButtonElement>
  >) => (
    <button {...rest} data-testid="button">
      {children}
    </button>
  ),
}));

vi.mock('@/components/ui/popover', () => {
  const Wrap =
    (tag: keyof JSX.IntrinsicElements = 'div') =>
    ({ children }: { children: React.ReactNode }) =>
      React.createElement(tag, null, children);

  return {
    Popover: Wrap(),
    PopoverTrigger: ({ children }: { children: React.ReactNode }) => (
      <>{children}</>
    ),
    PopoverContent: Wrap(),
  };
});

vi.mock('lucide-react', () => ({
  ListFilter: () => <svg data-testid="icon" />,
}));

vi.mock('@/components/ui/filters', () => {
  const Filters = ({ filters }: { filters: Filter[] }) => (
    <ul data-testid="filters">
      {filters.map((f) => (
        <li key={f.id}>{f.type}</li>
      ))}
    </ul>
  );

  return {
    default: Filters,
    FilterType: { CREATOR: 'Creator' },
  };
});

vi.mock('@/components/learningPath/FilterOptionsManager', () => ({
  FilterOptionsManager: () => <div data-testid="options-manager" />,
}));

vi.mock('@/components/learningPath/FilterCommandMenu', () => ({
  FilterCommandMenu: () => <div data-testid="command-menu">CMD</div>,
}));

import { LearningPathFilter } from '@/components/learningPath/learningPathFilter';

const creatorFilter: Filter = {
  id: '1',
  type: 'Creator',
  value: ['Alice'],
};

const renderComponent = (initialFilters: Filter[] = []) => {
  const setFilters = vi.fn();
  render(
    <LearningPathFilter
      filters={initialFilters}
      setFilters={setFilters}
      creators={[{ name: 'Alice' }]}
      languages={[{ name: 'nl' }]}
    />,
  );
  return { setFilters };
};

describe('LearningPathFilter', () => {
  it('toont “Filter”-tekst wanneer er geen filters zijn', () => {
    renderComponent();

    expect(screen.getByText(/^filter$/i)).toBeInTheDocument();
    expect(screen.getByTestId('icon')).toBeInTheDocument();
  });

  it('toont enkel icoon + Clear-knop bij bestaande filters', () => {
    renderComponent([creatorFilter]);

    // tekst “Filter” zou weg moeten zijn
    expect(screen.queryByText(/^filter$/i)).toBeNull();
    expect(screen.getByRole('button', { name: /clear/i })).toBeInTheDocument();
  });

  it('roept setFilters([]) aan via Clear-knop', () => {
    const { setFilters } = renderComponent([creatorFilter]);
    fireEvent.click(screen.getByRole('button', { name: /clear/i }));

    expect(setFilters).toHaveBeenCalledWith([]);
  });

  it('opent pop-over en toont FilterCommandMenu', () => {
    renderComponent();

    // combobox-button (PopoverTrigger) heeft role="combobox"
    fireEvent.click(screen.getByRole('combobox'));

    expect(screen.getByText('CMD')).toBeInTheDocument();
  });
});
