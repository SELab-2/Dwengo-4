import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import RootLayoutStudent from '@/components/student/RootLayoutStudent';

vi.mock('@/components/student/NavStudent', () => ({
  default: () => <nav data-testid="nav-student">NAV</nav>,
}));

vi.mock('react-router-dom', async () => {
  const actual =
    await vi.importActual<typeof import('react-router-dom')>(
      'react-router-dom',
    );
  return {
    ...actual,
    Outlet: () => <div data-testid="outlet-student">OUTLET</div>,
  };
});

describe('RootLayoutStudent', () => {
  it('rendert NavStudent en een Outlet', () => {
    render(<RootLayoutStudent />);

    expect(screen.getByTestId('nav-student')).toBeInTheDocument();
    expect(screen.getByTestId('outlet-student')).toBeInTheDocument();
  });
});
