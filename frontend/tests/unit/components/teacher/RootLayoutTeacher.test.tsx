import React from 'react';
import { render, screen } from '@testing-library/react';
import RootLayoutTeacher from '../../../../src/components/teacher/RootLayoutTeacher';

// Mock de NavTeacher component
vi.mock('../../../../src/components/teacher/NavTeacher', () => ({
  default: () => <div data-testid="nav-teacher">Mocked Nav</div>,
}));

// Mock de Outlet zodat we het bestaan kunnen controleren
vi.mock('react-router-dom', async (importOriginal) => {
  const actual = (await importOriginal()) as typeof import('react-router-dom');
  return {
    ...actual,
    Outlet: () => <div data-testid="outlet" />,
  };
});

describe('RootLayoutTeacher', () => {
  it('renders without crashing', () => {
    render(<RootLayoutTeacher />);
    // Check dat zowel Nav als Outlet er zijn
    expect(screen.getByTestId('nav-teacher')).toBeInTheDocument();
    expect(screen.getByTestId('outlet')).toBeInTheDocument();
  });

  it('renders NavTeacher component', () => {
    render(<RootLayoutTeacher />);
    expect(screen.getByTestId('nav-teacher')).toBeInTheDocument();
  });

  it('renders the Outlet for nested routes', () => {
    render(<RootLayoutTeacher />);
    expect(screen.getByTestId('outlet')).toBeInTheDocument();
  });
});
