import { LearningObject, Student, Teacher, User } from "@prisma/client";
import { beforeEach, describe, expect, it } from "vitest";
import request from "supertest";
import prisma from "./helpers/prisma";
import app from "../index";
import {
  createLearningObject,
  createStudent,
  createTeacher,
} from "./helpers/testDataCreation";
import { LocalLearningObjectData } from "../services/localLearningObjectService";

describe("local learning object tests", async () => {
  let teacherUser1: User & { teacher: Teacher; token: string };
  let teacherUser2: User & { teacher: Teacher; token: string };
  let studentUser1: User & { student: Student; token: string };
  const data: LocalLearningObjectData = {
    title: "Mijn lokaal leerobject",
    description: "Korte beschrijving",
    contentType: "TEXT_MARKDOWN",
    teacherExclusive: false,
    keywords: ["nieuw", "voorbeeld"],
  };
  beforeEach(async () => {
    teacherUser1 = await createTeacher("John", "Doe", "john.doe@gmail.com");
    teacherUser2 = await createTeacher("Bob", "Boons", "bob.boons@gmail.com");
    studentUser1 = await createStudent("Alice", "Anderson", "alan@gmail.com");
  });

  describe("[GET] /learningObjectByTeacher", async () => {
    beforeEach(async () => {
      // create a few learning objects for the teacher
      await createLearningObject(teacherUser1.id, data);
      await createLearningObject(teacherUser1.id, {
        ...data,
        title: "Een ander lokaal leerobject",
      });
    });
    it("should return all learning objects of the teacher", async () => {
      const { status, body } = await request(app)
        .get("/learningObjectByTeacher")
        .set("Authorization", `Bearer ${teacherUser1.token}`);

      expect(status).toBe(200);
      expect(body.objects).toBeDefined();
      expect(body.objects.length).toBe(2);
      expect(body.objects).toEqual(
        expect.arrayContaining([
          expect.objectContaining(data),
          expect.objectContaining({
            ...data,
            title: "Een ander lokaal leerobject",
          }),
        ]),
      );
    });
    it("shouldn't let a student access this route", async () => {
      const { status, body } = await request(app)
        .get("/learningObjectByTeacher")
        .set("Authorization", `Bearer ${studentUser1.token}`);

      expect(status).toBe(401);
      expect(body.objects).toBeUndefined();
    });
    it("should only show the learning objects of the teacher", async () => {
      // there are some local learning objects created by another teacher
      // test that another teacher can't see them
      const { status, body } = await request(app)
        .get("/learningObjectByTeacher")
        .set("Authorization", `Bearer ${teacherUser2.token}`);

      expect(status).toBe(200);
      expect(body.objects).toEqual([]);
    });
  });

  describe("[POST] /learningObjectByTeacher", async () => {
    it("should create a new learning object", async () => {
      const { status, body } = await request(app)
        .post("/learningObjectByTeacher")
        .set("Authorization", `Bearer ${teacherUser1.token}`)
        .send(data);

      expect(status).toBe(201);
      expect(body.learningObject).toBeDefined();
      expect(body.learningObject.creatorId).toBe(teacherUser1.id);
      expect(body.learningObject).toMatchObject(data);

      // verify that learning object was created in the database
      await prisma.learningObject
        .findUnique({
          where: {
            id: body.learningObject.id,
          },
        })
        .then((lo) => {
          expect(lo).toBeDefined();
        });
    });
    it("shouldn't let a student create a learning object", async () => {
      const { status, body } = await request(app)
        .post("/learningObjectByTeacher")
        .set("Authorization", `Bearer ${studentUser1.token}`)
        .send(data);

      expect(status).toBe(401);
      expect(body.learningObject).toBeUndefined();

      // verify that learning object was not created in the database
      await prisma.learningObject
        .findMany()
        .then((los: LearningObject[]): void => {
          expect(los.length).toBe(0);
        });
    });
    it("should return an error if request is incomplete/incorrect", async () => {
      // TODO: add once zod validation is added
    });
  });

  describe("[GET] /learningObjectByTeacher/:createdLearningObjectId", async () => {
    let lo: LearningObject;
    beforeEach(async () => {
      // create learning object for teacher1
      lo = await createLearningObject(teacherUser1.id, data);
    });
    it("should return the learning object with the given id", async () => {
      const { status, body } = await request(app)
        .get(`/learningObjectByTeacher/${lo.id}`)
        .set("Authorization", `Bearer ${teacherUser1.token}`);

      expect(status).toBe(200);
      expect(body.learningObject).toBeDefined();
      expect(body.learningObject).toMatchObject(data);
    });
    it("should return an error if the learning object doesn't exist", async () => {
      const { status, body } = await request(app)
        .get("/learningObjectByTeacher/123456789") // non-existing learning object id
        .set("Authorization", `Bearer ${teacherUser1.token}`);

      expect(status).toBe(404);
      expect(body.learningObject).toBeUndefined();
    });
    it("shouldn't let a student access this route", async () => {
      const { status, body } = await request(app)
        .get(`/learningObjectByTeacher/${lo.id}`)
        .set("Authorization", `Bearer ${studentUser1.token}`);

      expect(status).toBe(401);
      expect(body.learningObject).toBeUndefined();
    });
    it("shouldn't let another teacher get the learning object", async () => {
      const { status, body } = await request(app)
        .get(`/learningObjectByTeacher/${lo.id}`)
        .set("Authorization", `Bearer ${teacherUser2.token}`);

      expect(status).toBe(403);
      expect(body.learningObject).toBeUndefined();
    });
  });

  //describe("[PATCH] /learningObjectByTeacher/:createdLearningObjectId", async () => {});

  //describe("[DELETE] /learningObjectByTeacher/:createdLearningObjectId", async () => {});
});
