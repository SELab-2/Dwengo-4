import React from 'react';
import { vi } from 'vitest';
import { render } from '@testing-library/react';
import { useLoaderData, useSubmit } from 'react-router-dom';
import RootLayoutDashboardTeacher from '../../../../src/components/teacher/RootLayoutDashboardTeacher';
import * as authTeacher from '../../../../src/util/teacher/authTeacher';

// Mock react-router-dom hooks
vi.mock('react-router-dom', async (importOriginal) => {
  const actual = (await importOriginal()) as typeof import('react-router-dom');
  return {
    ...actual,
    useLoaderData: vi.fn(),
    useSubmit: vi.fn(),
    Outlet: vi.fn(() => <div data-testid="outlet" />),
  };
});

// Mock setTimeout to run immediately
vi.useFakeTimers();

describe('RootLayoutDashboardTeacher', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('renders without crashing', () => {
    (useLoaderData as unknown as jest.Mock).mockReturnValue(null);
    (useSubmit as unknown as jest.Mock).mockReturnValue(vi.fn());

    const { getByTestId } = render(<RootLayoutDashboardTeacher />);
    expect(getByTestId('outlet')).toBeInTheDocument();
  });

  it('does nothing if there is no token', () => {
    (useLoaderData as unknown as jest.Mock).mockReturnValue(null);
    const submitMock = vi.fn();
    (useSubmit as unknown as jest.Mock).mockReturnValue(submitMock);

    render(<RootLayoutDashboardTeacher />);

    expect(submitMock).not.toHaveBeenCalled();
  });

  it('logs out immediately if token is EXPIRED', () => {
    (useLoaderData as unknown as jest.Mock).mockReturnValue('EXPIRED');
    const submitMock = vi.fn();
    (useSubmit as unknown as jest.Mock).mockReturnValue(submitMock);

    render(<RootLayoutDashboardTeacher />);
    expect(submitMock).toHaveBeenCalledWith(null, {
      action: '/logout',
      method: 'post',
    });
  });

  it('sets a timeout to logout after token duration', () => {
    (useLoaderData as unknown as jest.Mock).mockReturnValue('VALID_TOKEN');
    const submitMock = vi.fn();
    (useSubmit as unknown as jest.Mock).mockReturnValue(submitMock);

    // Mock getTokenDuration to return a fake duration
    const getTokenDurationSpy = vi
      .spyOn(authTeacher, 'getTokenDuration')
      .mockReturnValue(5000);

    render(<RootLayoutDashboardTeacher />);

    expect(getTokenDurationSpy).toHaveBeenCalled();
    expect(submitMock).not.toHaveBeenCalled();

    // Fast-forward time
    vi.advanceTimersByTime(5000);

    expect(submitMock).toHaveBeenCalledWith(null, {
      action: '/logout',
      method: 'post',
    });
  });

  it('renders the Outlet component', () => {
    (useLoaderData as unknown as jest.Mock).mockReturnValue('VALID_TOKEN');
    (useSubmit as unknown as jest.Mock).mockReturnValue(vi.fn());

    const { getByTestId } = render(<RootLayoutDashboardTeacher />);
    expect(getByTestId('outlet')).toBeInTheDocument();
  });
});
