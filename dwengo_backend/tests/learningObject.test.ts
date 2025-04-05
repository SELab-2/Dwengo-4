import { beforeEach, describe, expect, it } from "vitest";
import request from "supertest";
import app from "../index";
import {
  createLearningObject,
  createStudent,
  createTeacher,
} from "./helpers/testDataCreation";
import { LearningObject, Student, Teacher, User } from "@prisma/client";
import { LocalLearningObjectData } from "../services/localLearningObjectService";
import { LearningPathDto } from "../services/learningPathService";

// TODO: once request validation with zod has been added, add tests for that as well
// TODO: learning objects and paths definitely need unit tests, where the dwengo API is mocked

describe("learning object tests", async () => {
  let teacherUser1: User & { teacher: Teacher; token: string };
  let studentUser1: User & { student: Student; token: string };
  let lo: LearningObject;
  beforeEach(async () => {
    teacherUser1 = await createTeacher("Bob", "Boons", "bob.boons@gmail.com");
    studentUser1 = await createStudent("Alice", "Anderson", "alan@gmail.com");

    // create local learning object
    const data: LocalLearningObjectData = {
      title: "Mijn lokaal leerobject",
      description: "Korte beschrijving",
      contentType: "TEXT_MARKDOWN",
      teacherExclusive: false,
      keywords: ["nieuw", "test"],
    };
    lo = await createLearningObject(teacherUser1.id, data);
  });

  describe("[GET] learningObject/teacher", async () => {
    it("should return all learning objects", async () => {
      const { status, body } = await request(app)
        .get("/learningObject/teacher")
        .set("Authorization", `Bearer ${teacherUser1.token}`);

      expect(status).toBe(200);
      expect(body.objects).toBeDefined();
      // response should contain both local and dwengo learning objects
      expect(body.objects).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            origin: "dwengo",
          }),
          expect.objectContaining({
            origin: "local",
          }),
        ]),
      );
    });

    it("shouldn't let a student access this route", async () => {
      const { status, body } = await request(app)
        .get("/learningObject/teacher")
        .set("Authorization", `Bearer ${studentUser1.token}`);

      expect(status).toBe(401);
      expect(body.object).toBeUndefined();
    });
  });

  describe("[GET] learningObject/teacher/search", async () => {
    it("should return all learning objects that match the search term", async () => {
      const searchTerm: string = "voorbeeld";
      const { status, body } = await request(app)
        .get(`/learningObject/teacher/search?q=${searchTerm}`)
        .set("Authorization", `Bearer ${teacherUser1.token}`);

      expect(status).toBe(200);
      expect(body.results).toBeDefined();

      // check that all returned objects contain the search term in at least one relevant field
      const allMatch = body.results.every(
        (obj: any) =>
          ["title", "description"].some((field) =>
            obj[field]?.toLowerCase().includes(searchTerm.toLowerCase()),
          ) ||
          obj["keywords"]?.some((keyword: string) =>
            keyword.toLowerCase().includes(searchTerm.toLowerCase()),
          ),
      );
      expect(allMatch).toBe(true);
    });

    it("should work the same if search term is uppercase", async () => {
      // create local learning object with the search term
      const data: LocalLearningObjectData = {
        title: "test lokaal leerobject",
        description: "VooRBeelD", // search term with mixed upper and lowercase
        contentType: "TEXT_MARKDOWN",
        teacherExclusive: false,
        keywords: ["nieuw", "voorbeeld"],
      };
      await createLearningObject(teacherUser1.id, data);

      // search for the term in lowercase
      const res1 = await request(app)
        .get("/learningObject/teacher/search?q=voorbeeld")
        .set("Authorization", `Bearer ${teacherUser1.token}`);

      // search for the term in uppercase
      const res2 = await request(app)
        .get("/learningObject/teacher/search?q=VOORBEELD")
        .set("Authorization", `Bearer ${teacherUser1.token}`);

      // results should be the same
      expect(res1.body).toEqual(res2.body);
      expect(res1.status).toEqual(res2.status);
      expect(res1.status).toBe(200);

      // should contain the mixed case object
      expect(res1.body.results).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            origin: "local",
            description: "VooRBeelD",
          }),
        ]),
      );
    });

    it("shouldn't let a student access this route", async () => {
      const { status, body } = await request(app)
        .get("/learningObject/teacher/search?q=voorbeeld")
        .set("Authorization", `Bearer ${studentUser1.token}`);

      expect(status).toBe(401);
      expect(body.object).toBeUndefined();
    });
  });

  describe("[GET] learningObject/teacher/lookup", async () => {
    it("should return the local learning object with the given hruid, language and version", async () => {
      const { status, body } = await request(app)
        .get(
          `/learningObject/teacher/lookup?hruid=${lo.hruid}&language=${lo.language}&version=${lo.version}`,
        )
        .set("Authorization", `Bearer ${teacherUser1.token}`);

      expect(status).toBe(200);
      expect(body.learningObject).toBeDefined();
      expect(body.learningObject.hruid).toEqual(lo.hruid);
      expect(body.learningObject.language).toEqual(lo.language);
      expect(body.learningObject.version).toEqual(lo.version);
    });

    it("should return the dwengo learning object with the given hruid, language and version", async () => {
      // get an existing dwengo learning object
      const res1 = await request(app)
        .get("/learningObject/teacher")
        .set("Authorization", `Bearer ${teacherUser1.token}`);
      const dwengo_lo: LearningObject = res1.body.objects[0]; // get first dwengo learning object

      const { status, body } = await request(app)
        .get(
          `/learningObject/teacher/lookup?hruid=${dwengo_lo.hruid}&language=${dwengo_lo.language}&version=${dwengo_lo.version}`,
        )
        .set("Authorization", `Bearer ${teacherUser1.token}`);

      expect(status).toBe(200);
      expect(body.learningObject).toBeDefined();
      expect(body.learningObject.hruid).toEqual(dwengo_lo.hruid);
      expect(body.learningObject.language).toEqual(dwengo_lo.language);
      expect(body.learningObject.version).toEqual(dwengo_lo.version);
    });

    it("shouldn't let a student access this route", async () => {
      const { status, body } = await request(app)
        .get(
          "/learningObject/teacher/lookup?hruid=test-v1&language=nl&version=3",
        )
        .set("Authorization", `Bearer ${studentUser1.token}`);

      expect(status).toBe(401);
      expect(body.learningObject).toBeUndefined();
    });
  });

  describe("[GET] /learningObject/:learningObjectId", async () => {
    // there should ideally be a test for a dwengo learning object as well, but
    // the dwengo API doesn't implement this correctly, so it won't work
    // if this is fixed in the future, this test case should be added
    it("should return the local learning object with the given id", async () => {
      const { status, body } = await request(app)
        .get(`/learningObject/${lo.id}`)
        .set("Authorization", `Bearer ${teacherUser1.token}`);

      expect(status).toBe(200);
      expect(body.learningObject).toBeDefined();
      expect(body.learningObject.id).toEqual(lo.id);
    });

    it("shouldn't let an unauthorized user use this route", async () => {
      const { status, body } = await request(app).get(
        `/learningObject/${lo.id}`,
      ); // don't add auth header

      expect(status).toBe(401);
      expect(body.learningObject).toBeUndefined();
    });
  });

  describe("[GET] /learningObject/learningPath/:pathId", async () => {
    let lp: LearningPathDto;
    beforeEach(async () => {
      // get a dwengo learning path
      const res = await request(app)
        .get("/learningPath?all=")
        .set("Authorization", `Bearer ${teacherUser1.token}`);
      lp = res.body.results[0]; // get first dwengo learning path
    });
    it("should return all learning objects that belong to the given learning path", async () => {
      const { status, body } = await request(app)
        .get(`/learningObject/learningPath/${lp._id}`)
        .set("Authorization", `Bearer ${teacherUser1.token}`);

      expect(status).toBe(200);
      expect(body.objects).toBeDefined();
      // check that all returned objects belong to the given learning path
      expect(body.objects.map((obj: any) => obj.hruid)).toEqual(
        expect.arrayContaining(
          lp.nodes.map((node: any) => node.learningobject_hruid),
        ),
      );
    });

    it("shouldn't let an unauthorized user use this route", async () => {
      const { status, body } = await request(app).get(
        `/learningObject/learningPath/${lp._id}`,
      );

      expect(status).toBe(401);
      expect(body.objects).toBeUndefined();
    });
  });
});
