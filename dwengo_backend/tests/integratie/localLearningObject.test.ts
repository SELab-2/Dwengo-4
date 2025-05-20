import { LearningObject, Student, Teacher, User } from "@prisma/client";
import { beforeEach, describe, expect, it } from "vitest";
import request from "supertest";
import prisma from "../helpers/prisma";
import app from "../../index";
import {
  createLearningObject,
  createStudent,
  createTeacher,
} from "../helpers/testDataCreation";
import { LocalLearningObjectData } from "../../services/localLearningObjectService";

// TODO: once zod validation and error handling is added, add tests for those things aswell
// or existing tests might need to be updated

describe("local learning object tests", async () => {
  let teacherUser1: User & { teacher: Teacher; token: string };
  let teacherUser2: User & { teacher: Teacher; token: string };
  let studentUser1: User & { student: Student; token: string };
  const data: LocalLearningObjectData = {
    title: "Mijn lokaal leerobject",
    description: "Korte beschrijving",
    contentType: "TEXT_PLAIN",
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
        .get("/api/learningObjectByTeacher")
        .set("Authorization", `Bearer ${teacherUser1.token}`);

      expect(status).toBe(200);
      expect(body).toBeDefined();
      expect(body.length).toBe(2);
      expect(body).toEqual(
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
        .get("/api/learningObjectByTeacher")
        .set("Authorization", `Bearer ${studentUser1.token}`);

      expect(status).toBe(401);
      expect(body.error).toEqual("UnauthorizedError");
    });
    it("should only show the learning objects of the teacher", async () => {
      // there are some local learning objects created by another teacher
      // test that another teacher can't see them
      const { status, body } = await request(app)
        .get("/api/learningObjectByTeacher")
        .set("Authorization", `Bearer ${teacherUser2.token}`);

      expect(status).toBe(200);
      expect(body).toEqual([]);
    });
  });

  describe("[POST] /learningObjectByTeacher", async () => {
    it("should create a new learning object", async () => {
      data.contentType = "text/plain";
      const { status, body } = await request(app)
        .post("/api/learningObjectByTeacher")
        .set("Authorization", `Bearer ${teacherUser1.token}`)
        .send(data);

      expect(status).toBe(201);
      expect(body.learningObject).toBeDefined();
      expect(body.learningObject.creatorId).toBe(teacherUser1.id);
      data.contentType = "TEXT_PLAIN";
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
        .post("/api/learningObjectByTeacher")
        .set("Authorization", `Bearer ${studentUser1.token}`)
        .send(data);

      expect(status).toBe(401);
      expect(body.error).toEqual("UnauthorizedError");

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
        .get(`/api/learningObjectByTeacher/${lo.id}`)
        .set("Authorization", `Bearer ${teacherUser1.token}`);

      expect(status).toBe(200);
      expect(body).toMatchObject(data);
    });
    it("should return an error if the learning object doesn't exist", async () => {
      const { status, body } = await request(app)
        .get("/api/learningObjectByTeacher/123456789") // non-existing learning object id
        .set("Authorization", `Bearer ${teacherUser1.token}`);

      expect(status).toBe(404);
      expect(body.error).toEqual("NotFoundError");
    });
    it("shouldn't let a student access this route", async () => {
      const { status, body } = await request(app)
        .get(`/api/learningObjectByTeacher/${lo.id}`)
        .set("Authorization", `Bearer ${studentUser1.token}`);

      expect(status).toBe(401);
      expect(body.error).toEqual("UnauthorizedError");
    });
    it("shouldn't let another teacher get the learning object", async () => {
      const { status, body } = await request(app)
        .get(`/api/learningObjectByTeacher/${lo.id}`)
        .set("Authorization", `Bearer ${teacherUser2.token}`);

      expect(status).toBe(403);
      expect(body.error).toEqual("AccessDeniedError");
    });
  });

  describe("[PATCH] /learningObjectByTeacher/:createdLearningObjectId", async () => {
    const updatedData = {
      title: "Bijgewerkt leerobject",
      description: "Bijgewerkt leerobject",
      contentType: "text/plain",
      keywords: ["bijgewerkt", "voorbeeld"],
    };
    it("should update the learning object", async () => {
      const lo = await createLearningObject(teacherUser1.id, data);

      const { status, body } = await request(app)
        .patch(`/api/learningObjectByTeacher/${lo.id}`)
        .set("Authorization", `Bearer ${teacherUser1.token}`)
        .send(updatedData);

      expect(status).toBe(200);
      expect(body.learningObject).toBeDefined();
      expect(body.learningObject.id).toEqual(lo.id);
      updatedData.contentType = "TEXT_PLAIN"; 
      expect(body.learningObject).toMatchObject(updatedData);

      // verify that learning object was updated in the database
      await prisma.learningObject
        .findUnique({
          where: {
            id: lo.id,
          },
        })
        .then((lo) => {
          expect(lo).toMatchObject(updatedData);
        });
    });
    it("should return an error if the learning object doesn't exist", async () => {
      const { status, body } = await request(app)
        .patch("/api/learningObjectByTeacher/123456789") // non-existing learning object id
        .set("Authorization", `Bearer ${teacherUser1.token}`)
        .send(updatedData);

      expect(status).toBe(404);
      expect(body.learningObject).toBeUndefined();
      expect(body.error).toEqual("NotFoundError");
    });
    it("shouldn't let a student update a learning object", async () => {
      const lo = await createLearningObject(teacherUser1.id, data);
      const { status, body } = await request(app)
        .patch(`/api/learningObjectByTeacher/${lo.id}`)
        .set("Authorization", `Bearer ${studentUser1.token}`)
        .send(updatedData);

      expect(status).toBe(401);
      expect(body.learningObject).toBeUndefined();
      expect(body.error).toEqual("UnauthorizedError");

      // verify that learning object was not updated in the database
      await prisma.learningObject
        .findUnique({
          where: {
            id: lo.id,
          },
        })
        .then((lo) => {
          expect(lo).toMatchObject(data);
        });
    });
    it("shouldn't let another teacher update the learning object", async () => {
      const lo = await createLearningObject(teacherUser1.id, data);
      const { status, body } = await request(app)
        .patch(`/api/learningObjectByTeacher/${lo.id}`)
        .set("Authorization", `Bearer ${teacherUser2.token}`) // another teacher tries to update the learning object
        .send(updatedData);

      expect(status).toBe(403);
      expect(body.learningObject).toBeUndefined();
      expect(body.error).toEqual("AccessDeniedError");

      // verify that learning object was not updated in the database
      await prisma.learningObject
        .findUnique({
          where: {
            id: lo.id,
          },
        })
        .then((lo) => {
          expect(lo).toMatchObject(data);
        });
    });
  });

  describe("[DELETE] /learningObjectByTeacher/:createdLearningObjectId", async () => {
    it("should delete the learning object", async () => {
      const lo = await createLearningObject(teacherUser1.id, data);

      const { status } = await request(app)
        .delete(`/api/learningObjectByTeacher/${lo.id}`)
        .set("Authorization", `Bearer ${teacherUser1.token}`);

      expect(status).toBe(204);

      // verify that learning object was deleted in the database
      await prisma.learningObject
        .findUnique({
          where: {
            id: lo.id,
          },
        })
        .then((lo) => {
          expect(lo).toBeNull();
        });
    });
    it("should return an error if the learning object doesn't exist", async () => {
      const { status, body } = await request(app)
        .delete("/api/learningObjectByTeacher/123456789") // non-existing learning object id
        .set("Authorization", `Bearer ${teacherUser1.token}`);

      expect(status).toBe(404);
      expect(body.error).toEqual("NotFoundError");
      expect(body.message).toBe("Learning object not found.");
    });
    it("shouldn't let a student delete a learning object", async () => {
      const lo = await createLearningObject(teacherUser1.id, data);
      const response = await request(app)
        .delete(`/api/learningObjectByTeacher/${lo.id}`)
        .set("Authorization", `Bearer ${studentUser1.token}`);

      expect(response.status).toBe(401);
      expect(response.body.error).toEqual("UnauthorizedError");

      // verify that learning object was not deleted in the database
      await prisma.learningObject
        .findUnique({
          where: {
            id: lo.id,
          },
        })
        .then((lo) => {
          expect(lo).not.toBeNull();
        });
    });
    it("shouldn't let another teacher delete the learning object", async () => {
      const lo = await createLearningObject(teacherUser1.id, data);
      const response = await request(app)
        .delete(`/api/learningObjectByTeacher/${lo.id}`)
        .set("Authorization", `Bearer ${teacherUser2.token}`); // another teacher tries to delete the learning object

      expect(response.status).toBe(403);
      expect(response.body.error).toEqual("AccessDeniedError");

      // verify that learning object was not deleted in the database
      await prisma.learningObject
        .findUnique({
          where: {
            id: lo.id,
          },
        })
        .then((lo) => {
          expect(lo).not.toBeNull();
        });
    });
  });
});
