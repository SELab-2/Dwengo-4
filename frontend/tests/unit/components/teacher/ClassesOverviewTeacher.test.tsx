import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import ClassesOverviewTeacher from '@/components/teacher/ClassesOverviewTeacher';
import * as httpTeacher from '@/util/teacher/httpTeacher';
import { BrowserRouter } from 'react-router-dom';

// Mock vertaling
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      if (key === 'classes.error') return 'Er is een fout opgetreden';
      if (key === 'classes.not_found') return 'Geen klassen gevonden';
      if (key === 'classes.view') return 'Bekijk klas';
      if (key === 'code') return 'Code';
      if (key === 'loading.loading') return 'Laden...';
      return key;
    },
  }),
}));

const createTestClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  });

const renderComponent = (client: QueryClient) => {
  return render(
    <QueryClientProvider client={client}>
      <BrowserRouter>
        <ClassesOverviewTeacher />
      </BrowserRouter>
    </QueryClientProvider>,
  );
};

describe('ClassesOverviewTeacher', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('shows loading state initially', async () => {
    vi.spyOn(httpTeacher, 'fetchClasses').mockReturnValue(
      new Promise(() => {}), // blijft hangen
    );

    const client = createTestClient();
    renderComponent(client);

    expect(await screen.findByText('Laden...')).toBeInTheDocument();
  });

  it('shows error state when fetch fails with error message', async () => {
    vi.spyOn(httpTeacher, 'fetchClasses').mockRejectedValue({
      info: { message: 'Fout bij het laden van klassen' },
    });

    const client = createTestClient();
    renderComponent(client);

    await waitFor(() => {
      expect(
        screen.getByText(/Fout bij het laden van klassen/),
      ).toBeInTheDocument();
    });
  });

  it('shows default error message when no message in error', async () => {
    vi.spyOn(httpTeacher, 'fetchClasses').mockRejectedValue({});

    const client = createTestClient();
    renderComponent(client);

    await waitFor(() => {
      expect(screen.getByText('Er is een fout opgetreden')).toBeInTheDocument();
    });
  });

  it('shows list of classes when data is available', async () => {
    const mockClasses = [
      {
        id: 1,
        name: 'Klas A',
        code: 'ABC123',
      },
      {
        id: 2,
        name: 'Klas B',
        code: 'DEF456',
      },
    ];

    vi.spyOn(httpTeacher, 'fetchClasses').mockResolvedValue(mockClasses);

    const client = createTestClient();
    renderComponent(client);

    const classA = await screen.findByText('Klas A');
    const classB = screen.getByText('Klas B');

    expect(classA).toBeInTheDocument();
    expect(classB).toBeInTheDocument();
    expect(screen.getAllByText('Bekijk klas')).toHaveLength(2);

    // ✅ Vind de paragrafen die de code bevatten en controleer hun textContent
    const allParagraphs = screen.getAllByText((_, element) => {
      return element?.tagName.toLowerCase() === 'p';
    });

    // Controleer dat we een paragraaf hebben met ABC123 en een met DEF456
    expect(allParagraphs.some((p) => p.textContent?.includes('ABC123'))).toBe(
      true,
    );
    expect(allParagraphs.some((p) => p.textContent?.includes('DEF456'))).toBe(
      true,
    );
  });

  it('shows not_found message when no classes available', async () => {
    vi.spyOn(httpTeacher, 'fetchClasses').mockResolvedValue([]);

    const client = createTestClient();
    renderComponent(client);

    expect(
      await screen.findByText('Geen klassen gevonden'),
    ).toBeInTheDocument();
  });
});
