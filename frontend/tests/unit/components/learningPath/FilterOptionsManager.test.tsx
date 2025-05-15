import React from 'react';
import { render, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

/**
 *  Mock et filters-hulpmodule zodat we
 *     – het ennum `FilterType`
 *     – het mutabele object `filterViewToFilterOptions`
 *   gemakkelijkr kunnen inspecteren en resetten.
 */
vi.mock('@/components/ui/filters', () => {
  // minimal enum + struct die de component nodig heeft
  const FilterType = {
    CREATOR: 'CREATOR',
    LANGUAGE: 'LANGUAGE',
  } as const;

  type Filter = { type: keyof typeof FilterType; value: string[] };

  // dit is het 'single source of truth' dat de component gaat muteren
  const filterViewToFilterOptions: Record<
    (typeof FilterType)[keyof typeof FilterType],
    { name: string; icon: React.ReactNode | undefined }[]
  > = {
    CREATOR: [],
    LANGUAGE: [],
  };

  return {
    FilterType,
    filterViewToFilterOptions,
    // types alleen voor TS-compliance in de testfile
    Filter: {} as unknown as Filter,
  };
});

//  ➡️ import ná de mock, zodat de component de gemockte versie gebruikt
import { FilterOptionsManager } from '@/components/learningPath/FilterOptionsManager';
import { FilterType, filterViewToFilterOptions } from '@/components/ui/filters';

type Filter = { type: keyof typeof FilterType; value: string[] };

describe('FilterOptionsManager', () => {
  beforeEach(() => {
    // reset globale state vóór elke test
    filterViewToFilterOptions[FilterType.CREATOR] = [];
    filterViewToFilterOptions[FilterType.LANGUAGE] = [];
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('vult creators correct wanneer er nog niets geselecteerd is', async () => {
    const creators = [{ name: 'Alice' }, { name: 'Bob' }];

    render(
      <FilterOptionsManager creators={creators} languages={[]} filters={[]} />,
    );

    await waitFor(() => {
      expect(
        filterViewToFilterOptions[FilterType.CREATOR].map((o) => o.name),
      ).toEqual(['Alice', 'Bob']);
    });
  });

  it('filtert reeds geselecteerde creators eruit', async () => {
    const creators = [{ name: 'Alice' }, { name: 'Bob' }];
    const filters: Filter[] = [{ type: FilterType.CREATOR, value: ['Alice'] }];

    render(
      <FilterOptionsManager
        creators={creators}
        languages={[]}
        filters={filters}
      />,
    );

    await waitFor(() => {
      expect(
        filterViewToFilterOptions[FilterType.CREATOR].map((o) => o.name),
      ).toEqual(['Bob']); // Alice hoort eruit te zijn
    });
  });

  it('vult languages correct en sluit reeds gekozen talen uit', async () => {
    const languages = [{ name: 'nl' }, { name: 'en' }, { name: 'fr' }];
    const filters: Filter[] = [{ type: FilterType.LANGUAGE, value: ['en'] }];

    render(
      <FilterOptionsManager
        creators={[]}
        languages={languages}
        filters={filters}
      />,
    );

    await waitFor(() => {
      expect(
        filterViewToFilterOptions[FilterType.LANGUAGE].map((o) => o.name),
      ).toEqual(['nl', 'fr']); // 'en' is al gekozen
    });
  });

  it('kan creators en languages tegelijk verwerken', async () => {
    const creators = [{ name: 'Alice' }];
    const languages = [{ name: 'nl' }];
    const filters: Filter[] = [];

    render(
      <FilterOptionsManager
        creators={creators}
        languages={languages}
        filters={filters}
      />,
    );

    await waitFor(() => {
      expect(
        filterViewToFilterOptions[FilterType.CREATOR].map((o) => o.name),
      ).toEqual(['Alice']);
      expect(
        filterViewToFilterOptions[FilterType.LANGUAGE].map((o) => o.name),
      ).toEqual(['nl']);
    });
  });
});
