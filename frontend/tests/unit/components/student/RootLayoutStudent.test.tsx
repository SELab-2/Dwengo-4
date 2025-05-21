import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';

import RootLayoutStudent from '@/components/student/RootLayoutStudent';

// Stub NavStudent
vi.mock('@/components/student/NavStudent', () => ({
  default: () => <nav data-testid="nav-student">NAV</nav>,
}));

// Stub react-router-dom hooks and components
vi.mock('react-router-dom', async () => {
  const actual =
    await vi.importActual<typeof import('react-router-dom')>(
      'react-router-dom',
    );
  return {
    ...actual,
    useLoaderData: () => 'mock-token',
    useSubmit: () => vi.fn(),
    Outlet: () => <div data-testid="outlet-student">OUTLET</div>,
  };
});

describe('RootLayoutStudent', () => {
  it('renders NavStudent and an Outlet', () => {
    render(<RootLayoutStudent />);

    expect(screen.getByTestId('nav-student')).toBeInTheDocument();
    expect(screen.getByTestId('outlet-student')).toBeInTheDocument();
  });
});
