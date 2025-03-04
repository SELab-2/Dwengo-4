import { describe, expect, it, vi } from 'vitest'
import request from 'supertest';
import prisma from './helpers/prisma'
import app from '../index';
import { AuthenticatedRequest } from '../middleware/teacherAuthMiddleware';
import { Response, NextFunction } from 'express';

// mock the protectTeacher middleware
vi.mock('../middleware/teacherAuthMiddleware', () => ({
  protectTeacher: (req: AuthenticatedRequest, res: Response, next: NextFunction) => next()
}));

describe('invite tests', async() => {
  it('should create an invite', async() => {
    // we first need to create two teachers and a class
    const teacherUser1 = await prisma.user.create({
      data: {
        firstName: "Bob",
        lastName: "Boons",
        email: "bob.boons@gmail.com",
        password: "testpassword",
        role: "TEACHER",
        teacher: {
          create: {}
        }
      },
      include: {
        teacher: true 
      }
    });
    expect(teacherUser1).not.toBeNull();
    expect(teacherUser1.teacher).not.toBeNull();

    const classroom = await prisma.class.create({
      data: {
        name: "5A",
        code: "ABCD"
      }
    });
    expect(classroom).not.toBeNull();

    const classTeacher = await prisma.classTeacher.create({
      data: {
          teacherId: teacherUser1.id,
          classId: classroom.id,
      }
    });
    expect(classTeacher).not.toBeNull();

    const teacherUser2 = await prisma.user.create({
      data: {
        firstName: "John",
        lastName: "Doe",
        email: "john.doe@gmail.com",
        password: "testpassword",
        role: "TEACHER",
        teacher: {
          create: {}
        }
      },
      include: {
        teacher: true 
      }
    });
    expect(teacherUser2).not.toBeNull();
    expect(teacherUser2.teacher).not.toBeNull();

    // now we can test the invite creation
    const { status, body } = await request(app)
      .post(`/teacher/classes/${classroom.id}/invite`)
      .send({
        user: teacherUser1,
        otherTeacherId: teacherUser2.id,
        classId: classroom.id
      })
    console.log(body);

    expect(status).toBe(201)
    // double check that data was created
    const invite = await prisma.invite.findUnique({ 
      where: {
        teacherId_classId: {
          teacherId: teacherUser2.id,
          classId: classroom.id
        }
      }
     });
    expect(invite).not.toBeNull();
    // ensure response body contains the invite as expected
    expect(body.invite).toStrictEqual(invite);
  });
});
