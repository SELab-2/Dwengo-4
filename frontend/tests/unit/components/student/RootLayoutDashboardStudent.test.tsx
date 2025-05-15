import React from 'react';
import { describe, it, afterEach, beforeEach, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import RootLayoutDashboardStudent from '@/components/student/RootLayoutDashboardStudent';

const submitSpy = vi.fn();

/* we mock enkel de hooks die de component gebruikt */
vi.mock('react-router-dom', async () => {
  const actual =
    await vi.importActual<typeof import('react-router-dom')>(
      'react-router-dom',
    );
  return {
    ...actual,
    useLoaderData: vi.fn(), // we vullen per test afzonderlijk in
    useSubmit: () => submitSpy, // altijd dezelfde spy
    Outlet: () => <div data-testid="outlet" />, // simpele placeholder
  };
});

import * as RR from 'react-router-dom';
import * as Auth from '@/util/student/authStudent';

beforeEach(() => {
  vi.useFakeTimers();
  submitSpy.mockClear();
});
afterEach(() => {
  vi.clearAllMocks();
  vi.useRealTimers();
});

describe('RootLayoutDashboardStudent', () => {
  it('doet niets wanneer er geen token is', () => {
    (RR.useLoaderData as unknown as vi.Mock).mockReturnValue(null);

    render(<RootLayoutDashboardStudent />);
    expect(submitSpy).not.toHaveBeenCalled();
  });

  it('logt direct uit wanneer token "EXPIRED" is', () => {
    (RR.useLoaderData as unknown as vi.Mock).mockReturnValue('EXPIRED');

    render(<RootLayoutDashboardStudent />);
    expect(submitSpy).toHaveBeenCalledWith(null, {
      action: '/logout',
      method: 'post',
    });
  });

  it('plant logout na token-duur wanneer token nog geldig is', () => {
    (RR.useLoaderData as unknown as vi.Mock).mockReturnValue('valid-token');

    /* mock getTokenDuration → 1000 ms */
    vi.spyOn(Auth, 'getTokenDuration').mockReturnValue(1000);

    render(<RootLayoutDashboardStudent />);

    /* nog niet verlopen → geen submit */
    expect(submitSpy).not.toHaveBeenCalled();

    /* timer vooruit draaien */
    vi.advanceTimersByTime(1000);

    expect(submitSpy).toHaveBeenCalledWith(null, {
      action: '/logout',
      method: 'post',
    });
  });
});
