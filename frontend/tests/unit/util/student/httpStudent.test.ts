import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

// Mock getAuthToken to return a fixed token
vi.mock('@/util/student/authStudent', () => ({
  getAuthToken: () => 'stub-token',
}));

import {
  loginStudent,
  signupStudent,
  joinClass,
  fetchClasses,
  fetchAssignments,
  fetchAssignmentsForClass,
  fetchClass,
  fetchLeaveClass,
} from '@/util/student/httpStudent';

const BACKEND = 'http://localhost:5000';

describe('httpStudent API helpers', () => {
  beforeEach(() => {
    // Stub global.fetch
    global.fetch = vi.fn();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('loginStudent', () => {
    const creds = { email: 'a@b.com', password: 'secret' };

    it('succeeds on ok response', async () => {
      const payload = { token: 't' };
      (fetch as any).mockResolvedValue({
        ok: true,
        json: async () => payload,
      });

      const result = await loginStudent(creds);
      expect(fetch).toHaveBeenCalledWith(`${BACKEND}/auth/student/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(creds),
      });
      expect(result).toEqual(payload);
    });

    it('throws APIError on non-ok', async () => {
      const info = { message: 'nope' };
      (fetch as any).mockResolvedValue({
        ok: false,
        status: 401,
        json: async () => info,
      });

      await expect(loginStudent(creds)).rejects.toMatchObject({
        message: 'Er is iets misgegaan tijdens het inloggen.',
        code: 401,
        info,
      });
    });
  });

  describe('signupStudent', () => {
    const creds = {
      firstName: 'Alice',
      lastName: 'Liddell',
      email: 'alice@example.com',
      password: 'pwd',
    };

    it('succeeds on ok response', async () => {
      const payload = { token: 'new' };
      (fetch as any).mockResolvedValue({
        ok: true,
        json: async () => payload,
      });

      const result = await signupStudent(creds);
      expect(fetch).toHaveBeenCalledWith(`${BACKEND}/auth/student/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(creds),
      });
      expect(result).toEqual(payload);
    });

    it('throws APIError on non-ok', async () => {
      const info = { error: 'exists' };
      (fetch as any).mockResolvedValue({
        ok: false,
        status: 409,
        json: async () => info,
      });

      await expect(signupStudent(creds)).rejects.toMatchObject({
        message: 'Er is iets misgegaan tijdens het registreren.',
        code: 409,
        info,
      });
    });
  });

  describe('joinClass', () => {
    const payload = { joinCode: 'XYZ' };

    it('resolves void on ok', async () => {
      (fetch as any).mockResolvedValue({ ok: true });
      await expect(joinClass(payload)).resolves.toBeUndefined();
      expect(fetch).toHaveBeenCalledWith(`${BACKEND}/join-request/student`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer stub-token',
        },
        body: JSON.stringify(payload),
      });
    });

    it('throws APIError on non-ok', async () => {
      const info = { detail: 'bad code' };
      (fetch as any).mockResolvedValue({
        ok: false,
        status: 400,
        json: async () => info,
      });
      await expect(joinClass(payload)).rejects.toMatchObject({
        message: 'Er is iets misgegaan bij het joinen van de klas.',
        code: 400,
        info,
      });
    });
  });

  describe('fetchClasses', () => {
    it('returns classrooms array on ok', async () => {
      const resp = { classrooms: [{ id: '1', name: 'C1' }] };
      (fetch as any).mockResolvedValue({
        ok: true,
        json: async () => resp,
      });

      const result = await fetchClasses();
      expect(fetch).toHaveBeenCalledWith(`${BACKEND}/class/student`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer stub-token',
        },
      });
      expect(result).toEqual(resp.classrooms);
    });

    it('throws APIError on non-ok', async () => {
      const info = { msg: 'fail' };
      (fetch as any).mockResolvedValue({
        ok: false,
        status: 500,
        json: async () => info,
      });
      await expect(fetchClasses()).rejects.toMatchObject({
        message: 'Er is iets misgegaan bij het ophalen van de klassen.',
        code: 500,
        info,
      });
    });
  });

  describe('fetchAssignments', () => {
    it('returns assignments on ok', async () => {
      const data = [{ id: 'a', title: 'T', description: '', deadline: '' }];
      (fetch as any).mockResolvedValue({
        ok: true,
        json: async () => data,
      });
      const result = await fetchAssignments();
      expect(fetch).toHaveBeenCalledWith(`${BACKEND}/assignment/student`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer stub-token',
        },
      });
      expect(result).toEqual(data);
    });

    it('throws APIError on non-ok', async () => {
      const info = { err: true };
      (fetch as any).mockResolvedValue({
        ok: false,
        status: 502,
        json: async () => info,
      });
      await expect(fetchAssignments()).rejects.toMatchObject({
        message: 'Er is iets misgegaan bij het ophalen van de opdrachten.',
        code: 502,
        info,
      });
    });
  });

  describe('fetchAssignmentsForClass', () => {
    it('fetches by classId', async () => {
      const classId = '42';
      const data = [{ id: 'b', title: 'X', description: '', deadline: '' }];
      (fetch as any).mockResolvedValue({
        ok: true,
        json: async () => data,
      });
      const result = await fetchAssignmentsForClass({ classId });
      expect(fetch).toHaveBeenCalledWith(
        `${BACKEND}/assignment/student/class/${classId}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: 'Bearer stub-token',
          },
        },
      );
      expect(result).toEqual(data);
    });

    it('throws on non-ok', async () => {
      (fetch as any).mockResolvedValue({
        ok: false,
        status: 404,
        json: async () => ({ not: 'found' }),
      });
      await expect(
        fetchAssignmentsForClass({ classId: 'x' }),
      ).rejects.toBeDefined();
    });
  });

  describe('fetchClass', () => {
    it('returns class data', async () => {
      const classId = '99';
      const data = { id: '99', name: 'Z' };
      (fetch as any).mockResolvedValue({
        ok: true,
        json: async () => data,
      });
      const result = await fetchClass({ classId });
      expect(fetch).toHaveBeenCalledWith(
        `${BACKEND}/class/student/${classId}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: 'Bearer stub-token',
          },
        },
      );
      expect(result).toEqual(data);
    });

    it('throws on non-ok', async () => {
      (fetch as any).mockResolvedValue({
        ok: false,
        status: 403,
        json: async () => ({ err: 'nope' }),
      });
      await expect(fetchClass({ classId: 'y' })).rejects.toBeDefined();
    });
  });

  describe('fetchLeaveClass', () => {
    it('issues DELETE and returns response', async () => {
      const fakeResp = { status: 204 };
      (fetch as any).mockResolvedValue(fakeResp);
      const resp = await fetchLeaveClass({ classId: '7' });
      expect(fetch).toHaveBeenCalledWith(`${BACKEND}/class/student/7`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      expect(resp).toBe(fakeResp);
    });
  });
});
