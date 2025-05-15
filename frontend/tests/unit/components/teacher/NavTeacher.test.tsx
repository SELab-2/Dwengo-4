import React, { PropsWithChildren } from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import NavTeacher from '../../../../src/components/teacher/NavTeacher';

// Mock Container met correct type
vi.mock('../../../../src/components/shared/Container', () => ({
  default: ({ children }: PropsWithChildren) => (
    <div data-testid="container">{children}</div>
  ),
}));

// Mock NavButton met props type
type NavButtonProps = {
  label: string;
};

vi.mock('../../../../src/components/shared/NavButton', () => ({
  default: ({ label }: NavButtonProps) => <button>{label}</button>,
}));

// Mock LanguageChooser
vi.mock('../../../../src/components/shared/LanguageChooser', () => ({
  default: () => <div data-testid="language-chooser" />,
}));

// Mock i18next
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, options?: { name?: string }) =>
      options && options.name ? `${key} ${options.name}` : key,
  }),
}));

// Mock useSubmit
const submitMock = vi.fn();
vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal();
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
    render(<NavTeacher />);
    // Check dat login en register zichtbaar zijn
    expect(screen.getByText('nav.login')).toBeInTheDocument();
    expect(screen.getByText('nav.register')).toBeInTheDocument();
    // Container aanwezig
    expect(screen.getByTestId('container')).toBeInTheDocument();
    // LanguageChooser is hier NIET aanwezig, want user is niet ingelogd
  });

  it('renders NavTeacher for logged-in state (with firstName)', () => {
    localStorage.setItem('firstName', 'John');
    render(<NavTeacher />);
    // Check dat de juiste knoppen er zijn
    expect(screen.getByText('nav.home')).toBeInTheDocument();
    expect(screen.getByText('nav.classes')).toBeInTheDocument();
    expect(screen.getByText('nav.learning_paths')).toBeInTheDocument();
    // Check dat de usernaam wordt weergegeven
    expect(screen.getByText(/nav.logged_in_as John/)).toBeInTheDocument();
    // Icons zijn aanwezig (check via aria-labels)
    expect(screen.getByLabelText('Notifications')).toBeInTheDocument();
    expect(screen.getByLabelText('Settings')).toBeInTheDocument();
    expect(screen.getByLabelText('Logout')).toBeInTheDocument();
    // LanguageChooser aanwezig
    expect(screen.getByTestId('language-chooser')).toBeInTheDocument();
  });

  it('calls submit when logout button is clicked', () => {
    localStorage.setItem('firstName', 'John');
    render(<NavTeacher />);
    const logoutButton = screen.getByLabelText('Logout');
    fireEvent.click(logoutButton);
    expect(submitMock).toHaveBeenCalledWith(null, {
      action: '/teacher/logout',
      method: 'post',
    });
  });

  it('renders the logo image with correct src', () => {
    render(<NavTeacher />);
    const logo = screen.getByRole('img');
    expect(logo).toHaveAttribute('src', '/img/dwengo-groen-zwart.png');
  });
});
