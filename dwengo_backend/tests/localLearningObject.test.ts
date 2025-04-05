import { LearningObject, Student, Teacher, User } from "@prisma/client";
import { beforeEach, describe, expect, it } from "vitest";
import request from "supertest";
import prisma from "./helpers/prisma";
import app from "../index";
import { createStudent, createTeacher } from "./helpers/testDataCreation";
import { LocalLearningObjectData } from "../services/localLearningObjectService";

describe("local learning object tests", async () => {
  let teacherUser1: User & { teacher: Teacher; token: string };
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
    studentUser1 = await createStudent("Alice", "Anderson", "alan@gmail.com");
  });
  // describe("[GET] /learningObjectByTeacher", async () => {
  //     it("should return all learning objects of the teacher", async () => {});
  // });

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

  //describe("[GET] /learningObjectByTeacher/:createdLearningObjectId, async () => {});

  //describe("[PATCH] /learningObjectByTeacher/:createdLearningObjectId", async () => {});

  //describe("[DELETE] /learningObjectByTeacher/:createdLearningObjectId", async () => {});
});
