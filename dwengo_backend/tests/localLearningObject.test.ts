import { Teacher, User } from "@prisma/client";
import { beforeEach, describe, expect, it } from "vitest";
import request from "supertest";
import app from "../index";
import { createTeacher } from "./helpers/testDataCreation";
import { LocalLearningObjectData } from "../services/localLearningObjectService";

describe("local learning object tests", async () => {
  let teacherUser1: User & { teacher: Teacher; token: string };
  beforeEach(async () => {
    teacherUser1 = await createTeacher("John", "Doe", "john.doe@gmail.com");
  });
  // describe("[GET] teacher/learningObjects", async () => {
  //     it("should return all learning objects of the teacher", async () => {});
  // });

  describe("[POST] teacher/learningObjects", async () => {
    it("should create a new learning object", async () => {
      const data: LocalLearningObjectData = {
        title: "Mijn lokaal leerobject",
        description: "Korte beschrijving",
        contentType: "TEXT_MARKDOWN",
        teacherExclusive: false,
        keywords: ["nieuw", "voorbeeld"],
      };

      const { status, body } = await request(app)
        .post("/teacher/learningObjects")
        .set("Authorization", `Bearer ${teacherUser1.token}`)
        .send(data);

      expect(status).toBe(201);
      expect(body.message).toBe("Leerobject aangemaakt");
      expect(body.learningObject).toBeDefined();
      expect(body.learningObject.creatorId).toBe(teacherUser1.id);
      expect(body.learningObject).toMatchObject(data);
    });
    it("should return an error if not all required fields are provided", async () => {});
    it("shouldn't let a student create a learning object", async () => {});
    it("should return an error if the request contains invalid data", async () => {});
  });

  //describe("[GET] teacher/learningObjects/:id", async () => {});

  //describe("[PATCH] teacher/learningObjects/:id", async () => {});

  //describe("[DELETE] teacher/learningObjects/:id", async () => {});
});
