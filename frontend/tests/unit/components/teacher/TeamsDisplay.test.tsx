import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  getTokenDuration,
  getAuthToken,
  tokenLoader,
  checkAuthLoader,
} from '@/util/student/authStudent';

describe('authStudent.ts', () => {
  const LOGIN_PATH = '/student/inloggen';

  beforeEach(() => {
    // reset storage and freeze time
    localStorage.clear();
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2020-01-01T00:00:00.000Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('getTokenDuration', () => {
    it('returns -1 if no expiration in storage', () => {
      expect(getTokenDuration()).toBe(-1);
    });

    it('returns positive ms when expiration is in the future', () => {
      const future = new Date(Date.now() + 10_000).toISOString();
      localStorage.setItem('expiration', future);
      expect(getTokenDuration()).toBe(10_000);
    });

    it('returns negative ms when expiration is in the past', () => {
      const past = new Date(Date.now() - 5_000).toISOString();
      localStorage.setItem('expiration', past);
      expect(getTokenDuration()).toBe(-5_000);
    });
  });

  describe('getAuthToken', () => {
    it('returns null if no token or wrong role in storage', () => {
      expect(getAuthToken()).toBeNull();
    });

    it('returns "EXPIRED" if token exists but expiration is missing', () => {
      localStorage.setItem('token', 'abc');
      localStorage.setItem('role', 'student');
      expect(getAuthToken()).toBe('EXPIRED');
    });

    it('returns token when expiration is in the future', () => {
      localStorage.setItem('token', 'abc');
      localStorage.setItem('role', 'student');
      const future = new Date(Date.now() + 5_000).toISOString();
      localStorage.setItem('expiration', future);
      expect(getAuthToken()).toBe('abc');
    });

    it('returns "EXPIRED" when expiration is in the past', () => {
      localStorage.setItem('token', 'abc');
      localStorage.setItem('role', 'student');
      const past = new Date(Date.now() - 5_000).toISOString();
      localStorage.setItem('expiration', past);
      expect(getAuthToken()).toBe('EXPIRED');
    });
  });

  describe('tokenLoader', () => {
    it('simply proxies getAuthToken', () => {
      localStorage.setItem('token', 'xyz');
      localStorage.setItem('role', 'student');
      const future = new Date(Date.now() + 2_000).toISOString();
      localStorage.setItem('expiration', future);
      expect(tokenLoader()).toBe('xyz');
    });
  });

  describe('checkAuthLoader', () => {
    it('redirects to login if no token or wrong role', () => {
      const result = checkAuthLoader();
      // redirect returns a Response created by react-router-dom
      expect(result).toHaveProperty('status', 302);
      expect((result as Response).headers.get('Location')).toBe(LOGIN_PATH);
    });

    it('redirects to login if token is expired', () => {
      localStorage.setItem('token', 'abc');
      localStorage.setItem('role', 'student');
      const past = new Date(Date.now() - 1_000).toISOString();
      localStorage.setItem('expiration', past);

      const result = checkAuthLoader();
      expect(result).toHaveProperty('status', 302);
      expect((result as Response).headers.get('Location')).toBe(LOGIN_PATH);
    });

    it('returns undefined when token is valid', () => {
      localStorage.setItem('token', 'ok');
      localStorage.setItem('role', 'student');
      const future = new Date(Date.now() + 3_000).toISOString();
      localStorage.setItem('expiration', future);

      expect(checkAuthLoader()).toBeUndefined();
    });
  });
});
