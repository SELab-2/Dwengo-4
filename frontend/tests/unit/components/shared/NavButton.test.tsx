import React from 'react';
import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import NavButton from '@/components/shared/NavButton';

describe('NavButton', () => {
  it('renders with given label and link', () => {
    const { getByText } = render(
      <MemoryRouter>
        <NavButton to="/dashboard" label="Dashboard" />
      </MemoryRouter>,
    );

    const linkElement = getByText('Dashboard');
    expect(linkElement).toBeInTheDocument();
    expect(linkElement).toHaveAttribute('href', '/dashboard');
  });

  it('applies active classes when current route matches', () => {
    const { getByText } = render(
      <MemoryRouter initialEntries={['/dashboard']}>
        <NavButton to="/dashboard" label="Dashboard" />
      </MemoryRouter>,
    );

    const linkElement = getByText('Dashboard');

    // Basis klassen
    expect(linkElement).toHaveClass('px-7', 'font-bold', 'rounded-md');
    // Actieve klassen
    expect(linkElement.className).toContain('bg-dwengo-green-darker');
    expect(linkElement.className).toContain('text-white');
    expect(linkElement.className).toContain('border-3');
  });

  it('applies inactive classes when route does not match', () => {
    const { getByText } = render(
      <MemoryRouter initialEntries={['/not-dashboard']}>
        <NavButton to="/dashboard" label="Dashboard" />
      </MemoryRouter>,
    );

    const linkElement = getByText('Dashboard');

    // Basis klassen
    expect(linkElement).toHaveClass('px-7', 'font-bold', 'rounded-md');
    // Niet-actieve klassen
    expect(linkElement.className).toContain('bg-dwengo-green');
    expect(linkElement.className).toContain('hover:bg-dwengo-green-dark');
    expect(linkElement.className).toContain('text-white');
  });

  it('renders correctly with a different label', () => {
    const { getByText } = render(
      <MemoryRouter>
        <NavButton to="/profile" label="Profile" />
      </MemoryRouter>,
    );

    const linkElement = getByText('Profile');
    expect(linkElement).toBeInTheDocument();
    expect(linkElement).toHaveAttribute('href', '/profile');
  });
});
