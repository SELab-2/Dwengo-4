import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import ClassesOverviewTeacher from '@/components/teacher/ClassesOverviewTeacher';
import * as classModule from '@/util/teacher/class';
import { BrowserRouter } from 'react-router-dom';

// Mock vertaling
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      switch (key) {
        case 'classes.error':
          return 'Er is een fout opgetreden';
        case 'classes.not_found':
          return 'Geen klassen gevonden';
        case 'classes.view':
          return 'Bekijk klas';
        case 'code':
          return 'Code';
        case 'loading.loading':
          return 'Laden...';
        default:
          return key;
      }
    },
  }),
}));

const createTestClient = () =>
  new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

const renderComponent = (client: QueryClient) =>
  render(
    <QueryClientProvider client={client}>
      <BrowserRouter>
        <ClassesOverviewTeacher />
      </BrowserRouter>
    </QueryClientProvider>,
  );

describe('ClassesOverviewTeacher', () => {
  afterEach(() => vi.clearAllMocks());

  it('shows loading state initially', async () => {
    vi.spyOn(classModule, 'fetchClasses').mockReturnValue(
      new Promise(() => {}),
    );

    const client = createTestClient();
    renderComponent(client);

    expect(await screen.findByText('Laden...')).toBeInTheDocument();
  });

  it('shows error state when fetch fails with error message', async () => {
    vi.spyOn(classModule, 'fetchClasses').mockRejectedValue({
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
    vi.spyOn(classModule, 'fetchClasses').mockRejectedValue({});

    const client = createTestClient();
    renderComponent(client);

    await waitFor(() => {
      expect(screen.getByText('Er is een fout opgetreden')).toBeInTheDocument();
    });
  });

  it('shows list of classes when data is available', async () => {
    const mockClasses = [
      { id: 1, name: 'Klas A', code: 'ABC123' },
      { id: 2, name: 'Klas B', code: 'DEF456' },
    ];

    vi.spyOn(classModule, 'fetchClasses').mockResolvedValue(mockClasses);

    const client = createTestClient();
    renderComponent(client);

    const classA = await screen.findByText('Klas A');
    const classB = screen.getByText('Klas B');

    expect(classA).toBeInTheDocument();
    expect(classB).toBeInTheDocument();
    expect(screen.getAllByText('Bekijk klas')).toHaveLength(2);

    const allParagraphs = screen.getAllByText(
      (_, element) => element?.tagName.toLowerCase() === 'p',
    );

    expect(allParagraphs.some((p) => p.textContent?.includes('ABC123'))).toBe(
      true,
    );
    expect(allParagraphs.some((p) => p.textContent?.includes('DEF456'))).toBe(
      true,
    );
  });

  it('shows not_found message when no classes available', async () => {
    vi.spyOn(classModule, 'fetchClasses').mockResolvedValue([]);

    const client = createTestClient();
    renderComponent(client);

    expect(
      await screen.findByText('Geen klassen gevonden'),
    ).toBeInTheDocument();
  });
});
