import { describe, it, expect, vi, beforeEach } from 'vitest';
import joinRequestService from '../../../services/joinRequestService';
import prisma from '../../../config/prisma';
import classService from '../../../services/classService';
import { JoinRequestStatus } from '@prisma/client';
import {
  AccesDeniedError,
  BadRequestError,
  NotFoundError,
} from '../../../errors/errors';

type MockFn = ReturnType<typeof vi.fn>;

vi.mock('../../../config/prisma', () => ({
  __esModule: true,
  default: {
    joinRequest: {
      create: vi.fn() as MockFn,
      findFirst: vi.fn() as MockFn,
      update: vi.fn() as MockFn,
      findMany: vi.fn() as MockFn,
    },
  },
}));

vi.mock('../../../services/classService', () => ({
  __esModule: true,
  default: {
    getClassByJoinCode: vi.fn() as MockFn,
    isStudentInClass: vi.fn() as MockFn,
    addStudentToClass: vi.fn() as MockFn,
    isTeacherOfClass: vi.fn() as MockFn,
  },
}));

describe('joinRequestService', () => {
  const studentId = 1;
  const teacherId = 2;
  const classId = 10;
  const joinCode = 'JOIN123';

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('createJoinRequest', () => {
    it('creates a join request', async () => {
      const expected = { requestId: 1, studentId, classId, status: JoinRequestStatus.PENDING };
      (prisma.joinRequest.create as MockFn).mockResolvedValue(expected);

      const result = await joinRequestService.createJoinRequest(studentId, classId);
      expect(result).toEqual(expected);
    });
  });

  describe('createValidJoinRequest', () => {
    it('throws if student is already in class', async () => {
      (classService.getClassByJoinCode as MockFn).mockResolvedValue({ id: classId });
      (classService.isStudentInClass as MockFn).mockResolvedValue(true);

      await expect(joinRequestService.createValidJoinRequest(studentId, joinCode)).rejects.toThrow(BadRequestError);
    });

    it('throws if pending request already exists', async () => {
      (classService.getClassByJoinCode as MockFn).mockResolvedValue({ id: classId });
      (classService.isStudentInClass as MockFn).mockResolvedValue(false);
      (prisma.joinRequest.findFirst as MockFn).mockResolvedValue({});

      await expect(joinRequestService.createValidJoinRequest(studentId, joinCode)).rejects.toThrow(BadRequestError);
    });

    it('creates valid request successfully', async () => {
      const expected = { requestId: 99, studentId, classId, status: JoinRequestStatus.PENDING };
      (classService.getClassByJoinCode as MockFn).mockResolvedValue({ id: classId });
      (classService.isStudentInClass as MockFn).mockResolvedValue(false);
      (prisma.joinRequest.findFirst as MockFn).mockResolvedValue(null);
      (prisma.joinRequest.create as MockFn).mockResolvedValue(expected);

      const result = await joinRequestService.createValidJoinRequest(studentId, joinCode);
      expect(result).toEqual(expected);
    });
  });

  describe('approveRequestAndAddStudentToClass', () => {
    it('updates request to approved and adds student to class', async () => {
      const req = { requestId: 1, studentId, classId, status: JoinRequestStatus.PENDING };
      (classService.isTeacherOfClass as MockFn).mockResolvedValue(true);
      (prisma.joinRequest.findFirst as MockFn).mockResolvedValue(req);
      (prisma.joinRequest.update as MockFn).mockResolvedValue({ ...req, status: JoinRequestStatus.APPROVED });
      (classService.addStudentToClass as MockFn).mockResolvedValue(undefined);

      const result = await joinRequestService.approveRequestAndAddStudentToClass(req.requestId, teacherId, classId);
      expect(result.status).toBe(JoinRequestStatus.APPROVED);
    });
  });

  describe('denyJoinRequest', () => {
    it('updates join request to denied', async () => {
      const req = { requestId: 2, studentId, classId, status: JoinRequestStatus.PENDING };
      (classService.isTeacherOfClass as MockFn).mockResolvedValue(true);
      (prisma.joinRequest.findFirst as MockFn).mockResolvedValue(req);
      (prisma.joinRequest.update as MockFn).mockResolvedValue({ ...req, status: JoinRequestStatus.DENIED });

      const result = await joinRequestService.denyJoinRequest(req.requestId, teacherId, classId);
      expect(result.status).toBe(JoinRequestStatus.DENIED);
    });
  });

  describe('getJoinRequestsByClass', () => {
    it('throws error if teacher not part of class', async () => {
      (classService.isTeacherOfClass as MockFn).mockResolvedValue(false);

      await expect(joinRequestService.getJoinRequestsByClass(teacherId, classId)).rejects.toThrow(AccesDeniedError);
    });

    it('returns all join requests including student info', async () => {
      (classService.isTeacherOfClass as MockFn).mockResolvedValue(true);
      (prisma.joinRequest.findMany as MockFn).mockResolvedValue([
        {
          requestId: 3,
          studentId,
          classId,
          status: JoinRequestStatus.PENDING,
          student: {
            user: {
              firstName: 'Jane',
              lastName: 'Doe',
              email: 'jane@doe.com',
            },
          },
        },
      ]);

      const result = await joinRequestService.getJoinRequestsByClass(teacherId, classId);
      expect(result).toEqual([
        {
          requestId: 3,
          studentId,
          classId,
          status: JoinRequestStatus.PENDING,
          student: {
            firstName: 'Jane',
            lastName: 'Doe',
            email: 'jane@doe.com',
          },
        },
      ]);
    });
  });

  describe('handleError', () => {
    it('throws wrapped Error', () => {
      const err = new Error('Some issue');
      expect(() => joinRequestService['handleError'](err, 'Wrapped')).toThrow('Wrapped: Some issue');
    });

    it('throws unknown error', () => {
      expect(() => joinRequestService['handleError']('string err', 'BOOM')).toThrow('BOOM: Unknown error occurred.');
    });
  });
});
