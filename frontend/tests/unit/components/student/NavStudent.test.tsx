import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, beforeEach, afterEach, expect, vi } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import NavStudent from '@/components/student/NavStudent';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, opts?: Record<string, unknown>) => {
      const dict: Record<
        string,
        string | ((o: Record<string, unknown>) => string)
      > = {
        'nav.home': 'Home',
        'nav.classes': 'Klassen',
        'nav.login': 'Login',
        'nav.register': 'Register',
        'nav.logged_in_as': ({ name }: { name: string }) =>
          `Aangemeld als ${name}`,
      };
      const val = dict[key];
      return typeof val === 'function' ? val(opts ?? {}) : (val ?? key);
    },
    i18n: {
      language: 'en',
      changeLanguage: vi.fn(),
    },
  }),
}));

const submitSpy = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual =
    await vi.importActual<typeof import('react-router-dom')>(
      'react-router-dom',
    );
  return {
    ...actual,
    useSubmit: () => submitSpy,
  };
});

const renderComponent = () =>
  render(
    <BrowserRouter>
      <NavStudent />
    </BrowserRouter>,
  );

beforeEach(() => {
  localStorage.clear();
  submitSpy.mockClear();
});
afterEach(() => vi.clearAllMocks());

describe('NavStudent', () => {
  it('rendert login & register knoppen wanneer niet ingelogd', () => {
    renderComponent();

    expect(screen.getByText('Login')).toBeInTheDocument();
    expect(screen.getByText('Register')).toBeInTheDocument();

    expect(screen.queryByText('Home')).not.toBeInTheDocument();
    expect(screen.queryByText('Klassen')).not.toBeInTheDocument();
  });

  it('toont navigatie voor ingelogde student en voert logout uit', () => {
    localStorage.setItem('firstName', 'Piet');
    localStorage.setItem('role', 'student');
    renderComponent();

    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('Klassen')).toBeInTheDocument();
    expect(screen.getByText('Aangemeld als Piet')).toBeInTheDocument();

    const logoutBtn = screen.getByLabelText('Logout');
    fireEvent.click(logoutBtn);

    expect(submitSpy).toHaveBeenCalledWith(null, {
      action: '/student/logout',
      method: 'post',
    });
  });
});
