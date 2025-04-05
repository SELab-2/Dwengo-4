import { beforeEach, describe, expect, it } from "vitest";
import request from "supertest";
import app from "../index";
import {
  createLearningObject,
  createStudent,
  createTeacher,
} from "./helpers/testDataCreation";
import { Student, Teacher, User } from "@prisma/client";
import { LocalLearningObjectData } from "../services/localLearningObjectService";

// since the tests shouldn't depend on the dwengo API, mock calls to it
// vi.mock("../services/dwengoLearningObjectService", async () => {
//   const actual = await vi.importActual("../services/dwengoLearningObjectService");
//   return {
//     ...actual,
//     fetchAllDwengoObjects: async () => {
//       return [
//         {
//           id: "66bb5da038f572595c0d4872",
//           uuid: "48c64b36-7040-4f23-a576-3e1dc4580c60",
//           hruid: "test",
//           version: 3,
//           language: "nl",
//           title: "This is a titleeeee",
//           description: "This is a description",
//           contentType: "text/markdown",
//           keywords: ["voorbeeld", "voorbeeld2"],
//           targetAges: [10, 11, 12, 13, 14],
//           teacherExclusive: true,
//           skosConcepts: ["http://ilearn.ilabt.imec.be/vocab/curr1/s-computers-en-systemen"],
//           copyright: "dwengo",
//           licence: "dwengo",
//           difficulty: 3,
//           estimatedTime: 20,
//           available: true,
//           contentLocation: "content/location/http",
//           createdAt: "2024-08-13T13:20:32.904Z",
//           updatedAt: "2024-08-13T13:20:32.904Z",
//           origin: "dwengo",
//         },
//         {
//           id: "66bb5da138f572595c0d4883",
//           uuid: "a10fb2b7-818b-43a5-80fd-551ac72ce0ad",
//           hruid: "test-v2",
//           version: 3,
//           language: "nl",
//           title: "This is a titlee",
//           description: "This is a description",
//           contentType: "audio/mpeg",
//           keywords: ["voorbeeld", "voorbeeld2"],
//           targetAges: [10, 11, 12, 13, 14],
//           teacherExclusive: true,
//           skosConcepts: ["http://ilearn.ilabt.imec.be/vocab/curr1/s-computers-en-systemen"],
//           copyright: "dwengo",
//           licence: "dwengo",
//           difficulty: 3,
//           estimatedTime: 20,
//           available: true,
//           contentLocation: "example-location",
//           createdAt: "2024-08-13T13:20:33.124Z",
//           updatedAt: "2024-08-13T13:20:33.124Z",
//           origin: "dwengo",
//         },
//         {
//           id: "66bb5da138f572595c0d4892",
//           uuid: "4e682145-a5c9-4c4c-9f04-f98ee66a0bee",
//           hruid: "test-v3",
//           version: 3,
//           language: "nl",
//           title: "This is a titlee",
//           description: "This is a description",
//           contentType: "text/markdown",
//           keywords: ["voorbeeld", "voorbeeld2"],
//           targetAges: [10, 11, 12, 13, 14],
//           teacherExclusive: false,
//           skosConcepts: ["http://ilearn.ilabt.imec.be/vocab/curr1/s-computers-en-systemen"],
//           copyright: "dwengo",
//           licence: "dwengo",
//           difficulty: 3,
//           estimatedTime: 20,
//           available: true,
//           contentLocation: "example-location",
//           createdAt: "2024-08-13T13:20:33.221Z",
//           updatedAt: "2024-08-13T13:20:33.221Z",
//           origin: "dwengo",
//         },
//       ];
//     },
//   };
// });

describe("learning object tests", async () => {
  let teacherUser1: User & { teacher: Teacher; token: string };
  let studentUser1: User & { student: Student; token: string };
  beforeEach(async () => {
    teacherUser1 = await createTeacher("Bob", "Boons", "bob.boons@gmail.com");
    studentUser1 = await createStudent("Alice", "Anderson", "alan@gmail.com");
  });

  describe("[GET] learningObject/teacher", async () => {
    it("should return all learning objects", async () => {
      // create local learning object for this teacher
      const data: LocalLearningObjectData = {
        title: "Mijn lokaal leerobject",
        description: "Korte beschrijving",
        contentType: "TEXT_MARKDOWN",
        teacherExclusive: false,
        keywords: ["nieuw", "voorbeeld"],
      };
      await createLearningObject(teacherUser1.id, data);

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
        .get("/learningObject/teacher/search?q=voorbeeld")
        .set("Authorization", `Bearer ${teacherUser1.token}`);

      console.log(body);
      expect(status).toBe(200);
      expect(body).toBeDefined();

      // check that all returned objects contain the search term in at least one field
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
  });

  // describe("[GET] learningObject/teacher/lookup", async () => {});

  // describe("[GET] /learningObject/:learningObjectId", async () => {});

  // describe("[GET] /learningObject/learningPath/:pathId", async () => {});
});
