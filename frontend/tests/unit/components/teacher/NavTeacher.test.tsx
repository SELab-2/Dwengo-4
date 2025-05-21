import React, { PropsWithChildren } from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import NavTeacher from '@/components/teacher/NavTeacher';
import { MemoryRouter } from 'react-router-dom';
import { vi } from 'vitest';

// Mock Container met correct type
vi.mock('@/components/shared/Container', () => ({
  default: ({ children }: PropsWithChildren) => (
    <div data-testid="container">{children}</div>
  ),
}));

// Mock NavButton met props type
type NavButtonProps = {
  to?: string;
  label: string;
};
vi.mock('@/components/shared/NavButton', () => ({
  default: ({ label }: NavButtonProps) => <button>{label}</button>,
}));

// Mock LanguageChooser
vi.mock('@/components/shared/LanguageChooser', () => ({
  default: () => <div data-testid="language-chooser" />,
}));

// Mock i18next
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, options?: { name?: string }) =>
      options && options.name ? `${key} ${options.name}` : key,
  }),
}));

// Mock useSubmit but preserve the rest of react-router-dom
const submitMock = vi.fn();
vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router-dom')>();
  return {
    ...actual,
    useSubmit: () => submitMock,
  };
});

describe('NavTeacher', () => {
  beforeEach(() => {
    localStorage.clear();
    submitMock.mockClear();
  });

  it('renders NavTeacher for logged-out state (no firstName)', () => {
    render(
      <MemoryRouter>
        <NavTeacher />
      </MemoryRouter>,
    );
    // login & register links
    expect(screen.getByText('nav.login')).toBeInTheDocument();
    expect(screen.getByText('nav.register')).toBeInTheDocument();
    // Container present
    expect(screen.getByTestId('container')).toBeInTheDocument();
    // LanguageChooser should not render
    expect(screen.queryByTestId('language-chooser')).toBeNull();
  });

  it('renders NavTeacher for logged-in state (with firstName)', () => {
    localStorage.setItem('firstName', 'John');
    localStorage.setItem('role', 'teacher');
    render(
      <MemoryRouter>
        <NavTeacher />
      </MemoryRouter>,
    );
    // Main nav buttons
    expect(screen.getByText('nav.home')).toBeInTheDocument();
    expect(screen.getByText('nav.classes')).toBeInTheDocument();
    expect(screen.getByText('nav.assignments')).toBeInTheDocument();
    expect(screen.getByText('nav.learning_paths')).toBeInTheDocument();
    expect(screen.getByText('custom_content.title')).toBeInTheDocument();
    // Logged in text
    expect(screen.getByText(/nav.logged_in_as John/)).toBeInTheDocument();
    // Icons by aria-label
    expect(screen.getByLabelText('Notifications')).toBeInTheDocument();
    expect(screen.getByLabelText('Settings')).toBeInTheDocument();
    expect(screen.getByLabelText('Logout')).toBeInTheDocument();
    // LanguageChooser present
    expect(screen.getByTestId('language-chooser')).toBeInTheDocument();
  });

  it('calls submit when logout button is clicked', () => {
    localStorage.setItem('firstName', 'John');
    localStorage.setItem('role', 'teacher');
    render(
      <MemoryRouter>
        <NavTeacher />
      </MemoryRouter>,
    );
    fireEvent.click(screen.getByLabelText('Logout'));
    expect(submitMock).toHaveBeenCalledWith(null, {
      action: '/teacher/logout',
      method: 'post',
    });
  });

  it('renders the logo image with correct src', () => {
    render(
      <MemoryRouter>
        <NavTeacher />
      </MemoryRouter>,
    );
    const logo = screen.getByRole('img');
    expect(logo).toHaveAttribute('src', '/img/dwengo-groen-zwart.png');
  });
});
