import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

vi.mock('@/components/ui/filters', () => {
  const FilterType = {
    CREATOR: 'Creator',
    LANGUAGE: 'Language',
    DUE_DATE: 'Due date',
  } as const;

  const FilterOperator = { IS: 'IS', BEFORE: 'BEFORE' } as const;
  const DueDate = {
    IN_THE_PAST: 'IN_THE_PAST',
    TOMORROW: 'TOMORROW',
  } as const;

  const filterViewOptions = [
    [{ name: FilterType.LANGUAGE }],
    [{ name: FilterType.CREATOR }],
    [{ name: FilterType.DUE_DATE }],
  ];

  const filterViewToFilterOptions = {
    [FilterType.CREATOR]: [{ name: 'Alice' }, { name: 'Bob' }],
    [FilterType.LANGUAGE]: [{ name: 'nl' }, { name: 'en' }],
    [FilterType.DUE_DATE]: [
      { name: DueDate.IN_THE_PAST },
      { name: DueDate.TOMORROW },
    ],
  };

  const AnimateChangeInHeight = ({
    children,
  }: {
    children: React.ReactNode;
  }) => <>{children}</>;

  return {
    FilterType,
    FilterOperator,
    DueDate,
    filterViewOptions,
    filterViewToFilterOptions,
    AnimateChangeInHeight,
  };
});

vi.mock('@/components/ui/command', () => {
  type TagProps = React.HTMLAttributes<HTMLElement> & {
    children?: React.ReactNode;
  };

  const tag =
    <T extends keyof JSX.IntrinsicElements>(t: T) =>
    ({ children, ...p }: TagProps) =>
      React.createElement(t, p, children);

  return {
    Command: ({ children }: { children: React.ReactNode }) => (
      <div data-testid="command">{children}</div>
    ),
    CommandInput: React.forwardRef<
      HTMLInputElement,
      React.InputHTMLAttributes<HTMLInputElement>
    >((props, ref) => <input ref={ref} {...props} />),
    CommandList: tag('ul'),
    CommandGroup: tag('li'),
    CommandItem: ({
      onSelect,
      value,
      children,
    }: {
      onSelect: (v: string) => void;
      value: string;
      children: React.ReactNode;
    }) => (
      <button role="option" onClick={() => onSelect(value)}>
        {children}
      </button>
    ),
    CommandSeparator: () => <hr />,
    CommandEmpty: ({ children }: { children: React.ReactNode }) => (
      <div>{children}</div>
    ),
  };
});

vi.mock('nanoid', () => ({ nanoid: () => 'fixed-id' }));

import { FilterCommandMenu } from '@/components/learningPath/FilterCommandMenu';
import { FilterType, FilterOperator, DueDate } from '@/components/ui/filters';

/* helper: elementaire Filter‐type, alleen wat we in de assertions nodig hebben */
type Filter = {
  id: string;
  type: string;
  operator: string;
  value: string[];
};

describe('FilterCommandMenu', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
    vi.clearAllMocks();
  });

  const makeProps = (
    partial: Partial<Parameters<typeof FilterCommandMenu>[0]> = {},
  ) => {
    let recordedFilters: Filter[] = [];

    const setFilters = vi.fn((update: React.SetStateAction<Filter[]>) => {
      recordedFilters = typeof update === 'function' ? update([]) : update;
    });

    return {
      selectedView: null,
      setSelectedView: vi.fn(),
      commandInput: '',
      setCommandInput: vi.fn(),
      setOpen: vi.fn(),
      commandInputRef: {
        current: null,
      } as React.RefObject<HTMLInputElement>,
      setFilters,
      /* handig om na afloop in assertions op te vragen */
      get filtersAdded() {
        return recordedFilters;
      },
      ...partial,
    };
  };

  it('toont de hoofd-filtergroepen', () => {
    render(<FilterCommandMenu {...makeProps()} />);
    expect(screen.getByText('Language')).toBeInTheDocument();
    expect(screen.getByText('Creator')).toBeInTheDocument();
    expect(screen.getByText('Due date')).toBeInTheDocument();
  });

  it('switcht naar detail-view bij klik op "Creator"', () => {
    const props = makeProps();
    render(<FilterCommandMenu {...props} />);
    fireEvent.click(screen.getByText('Creator'));
    expect(props.setSelectedView).toHaveBeenCalledWith('Creator');
    expect(props.setCommandInput).toHaveBeenCalledWith('');
  });

  it('voegt een Creator-filter toe', () => {
    const props = makeProps({
      selectedView: 'Creator' as FilterType,
    });
    render(<FilterCommandMenu {...props} />);

    fireEvent.click(screen.getByText('Alice'));
    vi.runAllTimers(); // laat setTimeout in component aflopen

    expect(props.filtersAdded).toEqual(
      expect.arrayContaining<Filter>([
        {
          id: 'fixed-id',
          type: 'Creator',
          operator: 'IS',
          value: ['Alice'],
        },
      ]),
    );
    expect(props.setSelectedView).toHaveBeenCalledWith(null);
    expect(props.setOpen).toHaveBeenCalledWith(false);
  });

  it('gebruikt BEFORE-operator voor due-date TOMORROW', () => {
    const props = makeProps({
      selectedView: 'Due date' as FilterType,
    });
    render(<FilterCommandMenu {...props} />);

    fireEvent.click(screen.getByText(DueDate.TOMORROW));
    vi.runAllTimers();

    expect(props.filtersAdded).toEqual(
      expect.arrayContaining<Filter>([
        {
          id: 'fixed-id',
          type: 'Due date',
          operator: FilterOperator.BEFORE,
          value: [DueDate.TOMORROW],
        },
      ]),
    );
  });
});
