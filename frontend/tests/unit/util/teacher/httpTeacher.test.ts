import { describe, it, expect, beforeEach, vi } from 'vitest';
import * as authTeacher from '@/util/teacher/authTeacher';
import * as httpTeacher from '@/util/teacher/httpTeacher';
import type {
  ClassItem,
  LearningPath,
  AssignmentPayload,
  TeamAssignment,
  Invite,
} from '@/types/type';

const BACKEND = 'http://localhost:5000';

describe('httpTeacher', () => {
  const oldFetch = global.fetch;

  beforeEach(() => {
    vi.clearAllMocks();
    // altijd een token beschikbaar maken
    vi.spyOn(authTeacher, 'getAuthToken').mockReturnValue('token123');
  });

  afterEach(() => {
    global.fetch = oldFetch;
  });

  function mockFetch(ok: boolean, body: any, status = 200) {
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok,
        status,
        json: () => Promise.resolve(body),
      } as any),
    );
  }

  describe('loginTeacher / signupTeacher', () => {
    const creds = { email: 'a@b.c', password: 'pw' };

    it('loginTeacher succeeds', async () => {
      mockFetch(true, { token: 't' });
      await expect(httpTeacher.loginTeacher(creds)).resolves.toEqual({
        token: 't',
      });
      expect(fetch).toHaveBeenCalledWith(
        `${BACKEND}/auth/teacher/login`,
        expect.any(Object),
      );
    });

    it('loginTeacher throws APIError on bad response', async () => {
      mockFetch(false, { message: 'nope' }, 401);
      await expect(httpTeacher.loginTeacher(creds)).rejects.toMatchObject({
        message: 'Er is iets misgegaan tijdens het inloggen.',
        code: 401,
        info: { message: 'nope' },
      });
    });

    it('signupTeacher succeeds', async () => {
      mockFetch(true, { token: 's' });
      await expect(
        httpTeacher.signupTeacher({ ...creds, firstName: 'f', lastName: 'l' }),
      ).resolves.toEqual({ token: 's' });
      expect(fetch).toHaveBeenCalledWith(
        `${BACKEND}/auth/teacher/register`,
        expect.any(Object),
      );
    });

    it('signupTeacher throws on bad response', async () => {
      mockFetch(false, { error: 'x' }, 400);
      await expect(
        httpTeacher.signupTeacher({ ...creds, firstName: 'f', lastName: 'l' }),
      ).rejects.toMatchObject({
        message: 'Er is iets misgegaan tijdens het registreren.',
        code: 400,
        info: { error: 'x' },
      });
    });
  });

  describe('fetchClasses', () => {
    const stubbed = {
      classrooms: [
        {
          id: '1',
          name: 'C1',
          classLinks: [
            {
              student: {
                user: { id: 's', firstName: 'A', lastName: 'B', email: '' },
              },
            },
          ],
        },
      ],
    };

    it('zonder includeStudents', async () => {
      mockFetch(true, { classrooms: [{ id: '1', name: 'C1' }] });
      const result = await httpTeacher.fetchClasses(false);
      expect(result).toEqual([{ id: '1', name: 'C1' }]);
      expect(fetch).toHaveBeenCalledWith(
        `${BACKEND}/class/teacher`,
        expect.any(Object),
      );
    });

    it('met includeStudents', async () => {
      mockFetch(true, stubbed);
      const result = await httpTeacher.fetchClasses(true);
      expect(result[0]).toHaveProperty('students');
      expect(result[0].students[0]).toEqual({
        id: 's',
        firstName: 'A',
        lastName: 'B',
        email: '',
      });
      expect(fetch).toHaveBeenCalledWith(
        `${BACKEND}/class/teacher/student`,
        expect.any(Object),
      );
    });

    it('throws on bad response', async () => {
      mockFetch(false, { msg: 'err' }, 500);
      await expect(httpTeacher.fetchClasses()).rejects.toHaveProperty(
        'message',
        'Er is iets misgegaan bij het ophalen van de klassen.',
      );
    });
  });

  describe('createClass / updateClass / fetchClass', () => {
    const classItem: ClassItem = { id: '1', name: 'X' };

    it('createClass werkt', async () => {
      mockFetch(true, classItem);
      await expect(httpTeacher.createClass({ name: 'X' })).resolves.toEqual(
        classItem,
      );
      expect(fetch).toHaveBeenCalledWith(
        `${BACKEND}/class/teacher`,
        expect.any(Object),
      );
    });

    it('updateClass werkt', async () => {
      mockFetch(true, classItem);
      await expect(
        httpTeacher.updateClass({ name: 'New', classId: 2 }),
      ).resolves.toEqual(classItem);
      expect(fetch).toHaveBeenCalledWith(
        `${BACKEND}/class/teacher/2`,
        expect.any(Object),
      );
    });

    it('fetchClass werkt', async () => {
      mockFetch(true, { classroom: classItem });
      await expect(httpTeacher.fetchClass({ classId: 3 })).resolves.toEqual(
        classItem,
      );
      expect(fetch).toHaveBeenCalledWith(
        `${BACKEND}/class/teacher/3`,
        expect.any(Object),
      );
    });

    it.each([
      ['createClass', httpTeacher.createClass],
      ['updateClass', (p: any) => httpTeacher.updateClass(p)],
      ['fetchClass', (p: any) => httpTeacher.fetchClass(p)],
    ])('%s gooit bij fout', async (_name, fn) => {
      mockFetch(false, { info: 'no' }, 422);
      await expect(
        fn(
          _name === 'fetchClass'
            ? { classId: 1 }
            : ({ name: '', classId: 1 } as any),
        ),
      ).rejects.toHaveProperty('code', 422);
    });
  });

  describe('fetchStudentsByClass', () => {
    it('succeeds', async () => {
      mockFetch(true, {
        students: [{ id: 's1', firstName: 'A', lastName: 'B', email: 'e' }],
      });
      await expect(
        httpTeacher.fetchStudentsByClass({ classId: 4 }),
      ).resolves.toEqual([
        { id: 's1', firstName: 'A', lastName: 'B', email: 'e' },
      ]);
      expect(fetch).toHaveBeenCalledWith(
        `${BACKEND}/class/teacher/4/student`,
        expect.any(Object),
      );
    });

    it('throws bij fout', async () => {
      mockFetch(false, {}, 404);
      await expect(
        httpTeacher.fetchStudentsByClass({ classId: 4 }),
      ).rejects.toBeTruthy();
    });
  });

  describe('fetchLearningPaths & fetchLearningPath', () => {
    it('fetchLearningPaths mapt en sorteert', async () => {
      const raw = [
        { _id: 'b', title: 'Beta', isExternal: false },
        { id: 'a', title: 'Alpha', isExternal: true },
      ];
      mockFetch(true, raw);
      const res = await httpTeacher.fetchLearningPaths();
      expect(res.map((p) => p.id)).toEqual(['a', 'b']);
      expect(res[0].title).toBe('Alpha');
    });

    it('fetchLearningPath werkt', async () => {
      const lp: LearningPath = {
        id: 'lp1',
        title: 'T',
        isExternal: false,
        language: null,
        creator: null,
        createdAt: '',
        updatedAt: '',
      };
      mockFetch(true, lp);
      await expect(httpTeacher.fetchLearningPath('lp1')).resolves.toEqual(lp);
    });
  });

  describe('fetchLearningObjectsByLearningPath', () => {
    it('geeft json-array terug', async () => {
      const objs = [{ foo: 1 }];
      mockFetch(true, objs);
      await expect(
        httpTeacher.fetchLearningObjectsByLearningPath('p'),
      ).resolves.toEqual(objs);
      expect(fetch).toHaveBeenCalledWith(
        `${BACKEND}/learningObject/learningPath/p`,
        expect.any(Object),
      );
    });

    it('gooit bij fout', async () => {
      mockFetch(false, {}, 500);
      await expect(
        httpTeacher.fetchLearningObjectsByLearningPath('p'),
      ).rejects.toBeTruthy();
    });
  });

  describe('assignment APIs', () => {
    it('createAssignment succeeds', async () => {
      mockFetch(true, {});
      await expect(
        httpTeacher.createAssignment({
          name: 'n',
          learningPathId: 'lp',
          students: [{ id: 's', firstName: '', lastName: '', email: '' }],
          dueDate: 'd',
          description: 'desc',
        }),
      ).resolves.toBeUndefined();
    });

    it('fetchAssignments & fetchAllAssignments', async () => {
      const data = [{ x: 1 }];
      mockFetch(true, data);
      await expect(httpTeacher.fetchAssignments('cid')).resolves.toEqual(data);

      global.fetch = vi.fn(() =>
        Promise.resolve({ ok: true, json: () => Promise.resolve(data) } as any),
      );
      await expect(httpTeacher.fetchAllAssignments()).resolves.toEqual(data);
    });

    it('fetchAssignment met includeTeams true groepeert correct', async () => {
      const ta: TeamAssignment = {
        team: {
          id: 'T1',
          classId: 'C1',
          students: [
            { user: { id: 'U1', firstName: 'F', lastName: 'L', email: '' } },
          ],
        },
      };
      const payload = { teamAssignments: [ta] } as any;
      mockFetch(true, payload);
      const res = await httpTeacher.fetchAssignment('aid', true, true);
      expect(res.classTeams).toEqual({
        C1: [
          {
            id: 'T1',
            students: [{ id: 'U1', firstName: 'F', lastName: 'L', email: '' }],
          },
        ],
      });
    });

    it('deleteAssignment, postAssignment, updateAssignment', async () => {
      // delete
      mockFetch(true, {});
      await expect(httpTeacher.deleteAssignment(5)).resolves.toBeUndefined();
      // post
      mockFetch(true, {});
      await expect(
        httpTeacher.postAssignment({
          title: 't',
          description: 'd',
          pathLanguage: 'l',
          isExternal: false,
          deadline: 'dl',
          pathRef: 'pr',
          classTeams: {},
          teamSize: 1,
        } as AssignmentPayload),
      ).resolves.toBeUndefined();
      // update
      mockFetch(true, {});
      await expect(
        httpTeacher.updateAssignment({
          id: 1,
          title: 't',
          description: 'd',
          pathLanguage: 'l',
          isExternal: false,
          deadline: 'dl',
          pathRef: 'pr',
          classTeams: {},
          teamSize: 1,
        }),
      ).resolves.toBeUndefined();
    });

    it('gooit bij fout delete/post/update', async () => {
      mockFetch(false, {}, 400);
      await expect(httpTeacher.deleteAssignment(1)).rejects.toBeTruthy();
      await expect(httpTeacher.postAssignment({} as any)).rejects.toBeTruthy();
      await expect(
        httpTeacher.updateAssignment({} as any),
      ).rejects.toBeTruthy();
    });
  });

  describe('invite & join-request APIs', () => {
    it('getPendingInvitesForClass', async () => {
      const invites: Invite[] = [
        {
          inviteId: 1,
          status: 'PENDING',
          otherTeacher: { firstName: 'F', lastName: 'L', email: 'e' },
        },
      ];
      mockFetch(true, { invites });
      await expect(
        httpTeacher.getPendingInvitesForClass('C1'),
      ).resolves.toEqual(invites);
    });

    it('createInvite', async () => {
      const inv: Invite = {
        inviteId: 2,
        status: 'APPROVED',
        otherTeacher: { firstName: 'F', lastName: 'L', email: 'e' },
      };
      mockFetch(true, { invite: inv });
      await expect(
        httpTeacher.createInvite({ classId: 'C1', otherTeacherEmail: 'x@y.z' }),
      ).resolves.toEqual(inv);
    });

    it('fetchJoinRequests', async () => {
      const jr = [{ id: 1 }];
      mockFetch(true, jr);
      await expect(httpTeacher.fetchJoinRequests('C1')).resolves.toEqual(jr);
    });

    it('approveJoinRequest & denyJoinRequest', async () => {
      mockFetch(true, { result: 'ok' });
      await expect(
        httpTeacher.approveJoinRequest({ classId: 'C', requestId: 1 }),
      ).resolves.toEqual({ result: 'ok' });

      mockFetch(true, { result: 'ok2' });
      await expect(
        httpTeacher.denyJoinRequest({ classId: 'C', requestId: 2 }),
      ).resolves.toEqual({ result: 'ok2' });
    });

    it('gooit bij falende join/invite acties', async () => {
      mockFetch(false, {}, 500);
      await expect(
        httpTeacher.getPendingInvitesForClass('C'),
      ).rejects.toBeTruthy();
      await expect(
        httpTeacher.createInvite({ classId: 'C', otherTeacherEmail: 'e' }),
      ).rejects.toBeTruthy();
      await expect(httpTeacher.fetchJoinRequests('C')).rejects.toBeTruthy();
      await expect(
        httpTeacher.approveJoinRequest({ classId: 'C', requestId: 1 }),
      ).rejects.toBeTruthy();
      await expect(
        httpTeacher.denyJoinRequest({ classId: 'C', requestId: 1 }),
      ).rejects.toBeTruthy();
    });
  });
});
