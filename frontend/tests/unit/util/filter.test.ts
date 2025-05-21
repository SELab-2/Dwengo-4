import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { filterLearningPaths } from '@/util/filter';
import { FilterType, FilterOperator } from '@/components/ui/filters';
import type { LearningPath } from '@/types/type';
import type { Filter } from '@/components/ui/filters';

beforeEach(() => {
  // Stub de datum naar 10 januari 2022
  vi.useFakeTimers().setSystemTime(new Date('2022-01-10T00:00:00Z'));
});

afterEach(() => {
  vi.useRealTimers();
});

/** Helper om snel een Filter-object te maken met minimale velden. */
function makeFilter(type: FilterType, value: string[]): Filter {
  return {
    id: '',
    type,
    operator: FilterOperator.IS,
    value,
  };
}

describe('filterLearningPaths', () => {
  const basePaths: LearningPath[] = [
    {
      id: '1',
      title: 'Alpha Path',
      createdAt: '2022-01-05T12:00:00Z', // 5 dagen geleden
      language: 'nl',
      creator: { user: { firstName: 'Jan', lastName: 'Janssen' } },
    } as any,
    {
      id: '2',
      title: 'Beta Course',
      createdAt: '2021-12-20T12:00:00Z', // 21 dagen geleden
      language: 'en',
      creator: { user: { firstName: 'Jane', lastName: 'Doe' } },
    } as any,
    {
      id: '3',
      title: 'Gamma Tutorial',
      createdAt: '2021-10-01T12:00:00Z', // > 3 maanden geleden
      language: null,
      creator: null,
    } as any,
  ];

  it('geeft [] terug als paths null of undefined is', () => {
    // @ts-expect-error: test null-guard
    expect(filterLearningPaths(null, [], '')).toEqual([]);
    // @ts-expect-error: test undefined-guard
    expect(filterLearningPaths(undefined, [], '')).toEqual([]);
  });

  it('zonder filters en lege searchQuery geeft alle paden terug', () => {
    expect(filterLearningPaths(basePaths, [], '')).toEqual(basePaths);
  });

  it('filtert op searchQuery (case-insensitive)', () => {
    const result = filterLearningPaths(basePaths, [], 'beta');
    expect(result.map((p) => p.id)).toEqual(['2']);
  });

  it('hanteert taal-filter correct', () => {
    const nlOnly = filterLearningPaths(
      basePaths,
      [makeFilter(FilterType.LANGUAGE, ['nl'])],
      '',
    );
    expect(nlOnly.map((p) => p.id)).toEqual(['1']);

    const allLang = filterLearningPaths(
      basePaths,
      [makeFilter(FilterType.LANGUAGE, [])],
      '',
    );
    expect(allLang.map((p) => p.id)).toEqual(['1', '2', '3']);

    const enOnly = filterLearningPaths(
      basePaths,
      [makeFilter(FilterType.LANGUAGE, ['en'])],
      '',
    );
    expect(enOnly.map((p) => p.id)).toEqual(['2']);
  });

  it('hanteert created-date-filter "week" en "month" correct', () => {
    const week = filterLearningPaths(
      basePaths,
      [makeFilter(FilterType.CREATED_DATE, ['week'])],
      '',
    );
    expect(week.map((p) => p.id)).toEqual(['1']);

    const month = filterLearningPaths(
      basePaths,
      [makeFilter(FilterType.CREATED_DATE, ['month'])],
      '',
    );
    expect(month.map((p) => p.id).sort()).toEqual(['1', '2']);

    const withInvalid = filterLearningPaths(
      [
        ...basePaths,
        {
          id: '4',
          title: 'BadDate',
          createdAt: 'niet-een-datum',
          language: 'nl',
          creator: null,
        } as any,
      ],
      [makeFilter(FilterType.CREATED_DATE, ['week'])],
      '',
    );
    expect(withInvalid.map((p) => p.id)).toEqual(['1']);
  });

  it('combineert meerdere filters en searchQuery met AND-logica', () => {
    const result = filterLearningPaths(
      basePaths,
      [
        makeFilter(FilterType.LANGUAGE, ['en']),
        makeFilter(FilterType.CREATED_DATE, ['month']),
      ],
      'beta',
    );
    expect(result.map((p) => p.id)).toEqual(['2']);
  });
});
