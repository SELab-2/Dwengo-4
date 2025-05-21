import { describe, it, expect, beforeEach, vi } from 'vitest';
import { redirect } from 'react-router-dom';

import {
  getTokenDuration,
  getAuthToken,
  tokenLoader,
  checkAuthLoader,
} from '@/util/teacher/authTeacher';

// Mock react-router-dom.redirect
vi.mock('react-router-dom', () => ({
  redirect: vi.fn((to: string) => `REDIRECT:${to}`),
}));

describe('authTeacher utilities', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  describe('getTokenDuration', () => {
    it('returns -1 when no expiration in storage', () => {
      expect(getTokenDuration()).toBe(-1);
    });

    it('returns -1 for invalid date string', () => {
      localStorage.setItem('expiration', 'not-a-date');
      expect(getTokenDuration()).toBe(-1);
    });

    it('returns positive delta for future expiration', () => {
      const now = Date.now();
      const future = new Date(now + 10000).toISOString();
      localStorage.setItem('expiration', future);
      const duration = getTokenDuration();
      expect(duration).toBeGreaterThan(0);
      expect(duration).toBeLessThanOrEqual(10000);
    });

    it('returns negative delta for past expiration', () => {
      const now = Date.now();
      const past = new Date(now - 12345).toISOString();
      localStorage.setItem('expiration', past);
      expect(getTokenDuration()).toBeLessThan(0);
    });
  });

  describe('getAuthToken & tokenLoader', () => {
    it('returns null when no token or wrong role', () => {
      // neither token nor role
      expect(getAuthToken()).toBeNull();
      expect(tokenLoader()).toBeNull();

      // token present but no role
      localStorage.setItem('token', 'abc');
      expect(getAuthToken()).toBeNull();
    });

    it('returns "EXPIRED" when token present but expired', () => {
      localStorage.setItem('role', 'teacher');
      localStorage.setItem('token', 'abc');
      const past = new Date(Date.now() - 5000).toISOString();
      localStorage.setItem('expiration', past);

      expect(getAuthToken()).toBe('EXPIRED');
      expect(tokenLoader()).toBe('EXPIRED');
    });

    it('returns token when valid and not expired', () => {
      localStorage.setItem('role', 'teacher');
      localStorage.setItem('token', 'xyz');
      const future = new Date(Date.now() + 5000).toISOString();
      localStorage.setItem('expiration', future);

      expect(getAuthToken()).toBe('xyz');
      expect(tokenLoader()).toBe('xyz');
    });
  });

  describe('checkAuthLoader', () => {
    it('redirects when no token', () => {
      const result = checkAuthLoader();
      expect(redirect).toHaveBeenCalledWith('/teacher/inloggen');
      expect(result).toBe('REDIRECT:/teacher/inloggen');
    });

    it('redirects when token expired', () => {
      localStorage.setItem('role', 'teacher');
      localStorage.setItem('token', 't');
      const past = new Date(Date.now() - 1).toISOString();
      localStorage.setItem('expiration', past);

      const result = checkAuthLoader();
      expect(redirect).toHaveBeenCalledWith('/teacher/inloggen');
      expect(result).toBe('REDIRECT:/teacher/inloggen');
    });

    it('does nothing when token valid', () => {
      localStorage.setItem('role', 'teacher');
      localStorage.setItem('token', 'ok');
      const future = new Date(Date.now() + 10000).toISOString();
      localStorage.setItem('expiration', future);

      const result = checkAuthLoader();
      expect(redirect).not.toHaveBeenCalled();
      expect(result).toBeUndefined();
    });
  });
});
