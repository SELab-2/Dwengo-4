import { beforeEach, describe, expect, it } from "vitest";
import request from "supertest";
import app from "../index";
import {
  Assignment,
  Class,
  LearningPath,
  Student,
  Teacher,
  User,
} from "@prisma/client";
import {
  addStudentToClass,
  createAssignment,
  createClass,
  createLearningPath,
  createStudent,
  createTeacher,
  stringToDate,
} from "./helpers/testDataCreation";

describe("[GET] /assignment/student", async (): Promise<void> => {
  let student1: User & { student: Student; token: string };
  let student2: User & { student: Student; token: string };
  let student3: User & { student: Student; token: string };
  let student4: User & { student: Student; token: string };
  let student5: User & { student: Student; token: string };
  let teacherUser1: User & { teacher: Teacher; token: string };

  let class1: Class;
  let class2: Class;
  let class3: Class;
  let class4: Class;

  let lp1: LearningPath;
  let lp2: LearningPath;
  let lp3: LearningPath;

  let assignment1: Assignment;
  let assignment2: Assignment;

  beforeEach(async (): Promise<void> => {
    // create some students
    student1 = await createStudent("Phret", "Pret", "phret.pret@gmail.com");
    student2 = await createStudent("Bleep", "Bloop", "bleep.bloop@gmail.com");
    student3 = await createStudent("Gerda", "Gerd", "gerda.gerd@gmail.com");
    student4 = await createStudent("Klaas", "Sinter", "klaas.sinter@gmail.com");
    student5 = await createStudent(
      "Gertrude",
      "Truede",
      "truede.gertrude@gmail.com",
    );
    // create some classes
    class1 = await createClass("1LA", "ABCD");
    class2 = await createClass("3LAWI", "EFGH");
    class3 = await createClass("5LAWI", "IJKL");
    class4 = await createClass("6LAWI", "MNOP");
    // create a teacher
    teacherUser1 = await createTeacher("Bob", "Boons", "bob.boons@gmail.com");
    // create some learning paths
    lp1 = await createLearningPath(
      "LP1",
      "Learning Path 1",
      teacherUser1.teacher.userId,
    );
    lp2 = await createLearningPath(
      "LP2",
      "Learning Path 2",
      teacherUser1.teacher.userId,
    );
    lp3 = await createLearningPath(
      "LP3",
      "Learning Path 3",
      teacherUser1.teacher.userId,
    );

    // Add students to classes
    await addStudentToClass(student2.id, class1.id);
    await addStudentToClass(student3.id, class1.id);
    await addStudentToClass(student4.id, class2.id);
    await addStudentToClass(student5.id, class3.id);
    addStudentToClass(student2.id, class4.id);

    // Create assignments
    assignment1 = await createAssignment(
      class1.id,
      lp1.id,
      "title",
      "description",
      new Date(),
    );
    assignment2 = await createAssignment(
      class1.id,
      lp2.id,
      "title",
      "description",
      new Date(),
    );
    await createAssignment(
      class2.id,
      lp3.id,
      "title",
      "description",
      new Date(),
    );

    await createAssignment(
      class3.id,
      lp2.id,
      "title",
      "description",
      new Date("2026-10-17"),
    );
    await createAssignment(
      class3.id,
      lp3.id,
      "title",
      "description",
      new Date("2025-05-28"),
    );
  });

  describe("GET /assignment/student", async (): Promise<void> => {
    it("should respond with a `200` status code and a list of assignments,\
        this list will be empty because student doesn't have any assignments", async (): Promise<void> => {
      // set up scenario where student has no assignments
      const { status, body } = await request(app)
        .get("/assignment/student")
        .set("Authorization", `Bearer ${student1.token}`);

      expect(status).toBe(200);
      expect(body).toStrictEqual([]);
    });

    it("should respond with a `200` status code and a list of 2 assignments", async (): Promise<void> => {
      const { status, body } = await request(app)
        .get("/assignment/student")
        .set("Authorization", `Bearer ${student2.token}`);

      expect(status).toBe(200);
      expect(body).toHaveLength(2);
      for (let i: number = 0; i < 2; i += 1) {
        body[i].createdAt = new Date(body[i].createdAt);
        body[i].updatedAt = new Date(body[i].updatedAt);
        body[i].deadline = new Date(body[i].deadline);
      }
      expect(body[0]).toStrictEqual(assignment1);
      expect(body[1]).toStrictEqual(assignment2);
    });

    it("should return the same array of assignments for all students in the same class", async (): Promise<void> => {
      let req = await request(app)
        .get("/assignment/student")
        .set("Authorization", `Bearer ${student2.token}`);

      const s: number = req.status;
      const b = req.body;

      expect(s).toBe(200);
      expect(b).toHaveLength(2);

      req = await request(app)
        .get("/assignment/student")
        .set("Authorization", `Bearer ${student3.token}`);

      const s1: number = req.status;
      const b1 = req.body;

      b1.sort((o1: LearningPath, o2: LearningPath): boolean => o1.id < o2.id);
      b.sort((o1: LearningPath, o2: LearningPath): boolean => o1.id < o2.id);

      expect(s1).toBe(200);
      expect(b1).toStrictEqual(b);
    });

    it("should not return the same array of assignments for students in other classes", async (): Promise<void> => {
      let req = await request(app)
        .get("/assignment/student")
        .set("Authorization", `Bearer ${student2.token}`);

      const s: number = req.status;
      const b = req.body;

      expect(s).toBe(200);
      expect(b).toHaveLength(2);

      req = await request(app)
        .get("/assignment/student")
        .set("Authorization", `Bearer ${student4.token}`);

      const s1: number = req.status;
      const b1 = req.body;

      b.sort((o1: LearningPath, o2: LearningPath): boolean => o1.id < o2.id);
      b1.sort((o1: LearningPath, o2: LearningPath): boolean => o1.id < o2.id);

      expect(s1).toBe(200);
      expect(b1).toHaveLength(1);
      expect(b1 !== b);
    });

    it("should return a sorted list of assignments in descending order based on the deadline", async (): Promise<void> => {
      const { status, body } = await request(app)
        .get("/assignment/student")
        .query({ sort: "deadline", order: "desc" })
        .set("Authorization", `Bearer ${student5.token}`);

      stringToDate(body, 2);

      expect(status).toBe(200);
      expect(body).toHaveLength(2);
      expect(body[0].deadline > body[1].deadline);
    });

    it("should return a sorted list of assignments in ascending order based on the deadline", async (): Promise<void> => {
      const { status, body } = await request(app)
        .get("/assignment/student")
        .query({ sort: "deadline", order: "asc" })
        .set("Authorization", `Bearer ${student5.token}`);

      stringToDate(body, 2);

      expect(status).toBe(200);
      expect(body).toHaveLength(2);
      expect(body[0].deadline < body[1].deadline);
    });

    it("should return a sorted list of assignments in descending order based on createdAt", async (): Promise<void> => {
      const { status, body } = await request(app)
        .get("/assignment/student")
        .query({ sort: "createdAt", order: "desc" })
        .set("Authorization", `Bearer ${student5.token}`);

      stringToDate(body, 2);

      expect(status).toBe(200);
      expect(body).toHaveLength(2);
      expect(body[0].createdAt > body[1].createdAt);
    });

    it("should return a sorted list of assignments in ascending order based on createdAt", async (): Promise<void> => {
      const { status, body } = await request(app)
        .get("/assignment/student")
        .query({ sort: "createdAt", order: "asc" })
        .set("Authorization", `Bearer ${student5.token}`);

      stringToDate(body, 2);

      expect(status).toBe(200);
      expect(body).toHaveLength(2);
      expect(body[0].createdAt > body[1].createdAt);
    });

    it("should return a sorted list of assignments in descending order based on updatedAt", async (): Promise<void> => {
      const { status, body } = await request(app)
        .get("/assignment/student")
        .query({ sort: "updatedAt", order: "desc" })
        .set("Authorization", `Bearer ${student5.token}`);

      stringToDate(body, 2);

      expect(status).toBe(200);
      expect(body).toHaveLength(2);
      expect(body[0].updatedAt > body[1].updatedAt);
    });

    it("should return a sorted list of assignments in ascending order based on updatedAt", async (): Promise<void> => {
      const { status, body } = await request(app)
        .get("/assignment/student")
        .query({ sort: "updatedAt", order: "asc" })
        .set("Authorization", `Bearer ${student5.token}`);

      stringToDate(body, 2);

      expect(status).toBe(200);
      expect(body).toHaveLength(2);
      expect(body[0].updatedAt < body[1].updatedAt);
    });

    it("should return a sorted list of 1 assignment due to limit", async (): Promise<void> => {
      const { status, body } = await request(app)
        .get("/assignment/student")
        .query({ limit: 1 })
        .set("Authorization", `Bearer ${student5.token}`);

      stringToDate(body, 1);

      expect(status).toBe(200);
      expect(body).toHaveLength(1);
    });

    it("should only return 2 assignments even though limit is higher", async (): Promise<void> => {
      const { status, body } = await request(app)
        .get("/assignment/student")
        .query({ limit: 10 })
        .set("Authorization", `Bearer ${student5.token}`);

      stringToDate(body, 2);

      expect(status).toBe(200);
      expect(body).toHaveLength(2);
    });
  });

  describe("GET /assignment/student/class/:classId", async (): Promise<void> => {
    it("should respond with a `200` status code and a list of assignments,\
        this list will be empty because student doesn't have any assignments", async (): Promise<void> => {
      // set up scenario where student has no assignments
      const { status, body } = await request(app)
        .get(`/assignment/student/class/${class4.id}`)
        .set("Authorization", `Bearer ${student2.token}`);

      expect(status).toBe(200);
      expect(body).toStrictEqual([]);
    });

    it("should respond with a `200` status code and a list of 2 assignments", async (): Promise<void> => {
      const { status, body } = await request(app)
        .get(`/assignment/student/class/${class1.id}`)
        .set("Authorization", `Bearer ${student2.token}`);

      expect(status).toBe(200);
      expect(body).toHaveLength(2);
      for (let i: number = 0; i < 2; i += 1) {
        body[i].createdAt = new Date(body[i].createdAt);
        body[i].updatedAt = new Date(body[i].updatedAt);
        body[i].deadline = new Date(body[i].deadline);
      }
      expect(body[0]).toStrictEqual(assignment1);
      expect(body[1]).toStrictEqual(assignment2);
    });

    it("should return the same array of assignments for all students in the same class", async (): Promise<void> => {
      let req = await request(app)
        .get(`/assignment/student/class/${class1.id}`)
        .set("Authorization", `Bearer ${student2.token}`);

      const s: number = req.status;
      const b = req.body;

      expect(s).toBe(200);
      expect(b).toHaveLength(2);

      req = await request(app)
        .get(`/assignment/student/class/${class1.id}`)
        .set("Authorization", `Bearer ${student3.token}`);

      const s1: number = req.status;
      const b1 = req.body;

      b1.sort((o1: LearningPath, o2: LearningPath): boolean => o1.id < o2.id);
      b.sort((o1: LearningPath, o2: LearningPath): boolean => o1.id < o2.id);

      expect(s1).toBe(200);
      expect(b1).toStrictEqual(b);
    });
  });

  it("should respond with a `403` status code when student is not in class", async (): Promise<void> => {
    const { status, body } = await request(app)
      .get(`/assignment/student/class/${class4.id}`)
      .set("Authorization", `Bearer ${student1.token}`);

    expect(status).toBe(403);
    expect(body.message).toBe("Student is not a part of this class.");
  });

  it("should return a sorted list of assignments in descending order based on the deadline", async (): Promise<void> => {
    const { status, body } = await request(app)
      .get(`/assignment/student/class/${class3.id}`)
      .query({ sort: "deadline", order: "desc" })
      .set("Authorization", `Bearer ${student5.token}`);

    stringToDate(body, 2);

    expect(status).toBe(200);
    expect(body).toHaveLength(2);
    expect(body[0].deadline > body[1].deadline);
  });

  it("should return a sorted list of assignments in ascending order based on the deadline", async (): Promise<void> => {
    const { status, body } = await request(app)
      .get(`/assignment/student/class/${class3.id}`)
      .query({ sort: "deadline", order: "asc" })
      .set("Authorization", `Bearer ${student5.token}`);

    stringToDate(body, 2);

    expect(status).toBe(200);
    expect(body).toHaveLength(2);
    expect(body[0].deadline < body[1].deadline);
  });

  it("should return a sorted list of assignments in descending order based on createdAt", async (): Promise<void> => {
    const { status, body } = await request(app)
      .get(`/assignment/student/class/${class3.id}`)
      .query({ sort: "createdAt", order: "desc" })
      .set("Authorization", `Bearer ${student5.token}`);

    stringToDate(body, 2);

    expect(status).toBe(200);
    expect(body).toHaveLength(2);
    expect(body[0].createdAt > body[1].createdAt);
  });

  it("should return a sorted list of assignments in ascending order based on createdAt", async (): Promise<void> => {
    const { status, body } = await request(app)
      .get(`/assignment/student/class/${class3.id}`)
      .query({ sort: "createdAt", order: "asc" })
      .set("Authorization", `Bearer ${student5.token}`);

    stringToDate(body, 2);

    expect(status).toBe(200);
    expect(body).toHaveLength(2);
    expect(body[0].createdAt > body[1].createdAt);
  });

  it("should return a sorted list of assignments in descending order based on updatedAt", async (): Promise<void> => {
    const { status, body } = await request(app)
      .get(`/assignment/student/class/${class3.id}`)
      .query({ sort: "updatedAt", order: "desc" })
      .set("Authorization", `Bearer ${student5.token}`);

    stringToDate(body, 2);

    expect(status).toBe(200);
    expect(body).toHaveLength(2);
    expect(body[0].updatedAt > body[1].updatedAt);
  });

  it("should return a sorted list of assignments in ascending order based on updatedAt", async (): Promise<void> => {
    const { status, body } = await request(app)
      .get(`/assignment/student/class/${class3.id}`)
      .query({ sort: "updatedAt", order: "asc" })
      .set("Authorization", `Bearer ${student5.token}`);

    stringToDate(body, 2);

    expect(status).toBe(200);
    expect(body).toHaveLength(2);
    expect(body[0].updatedAt < body[1].updatedAt);
  });

  it("should return a sorted list of 1 assignment due to limit", async (): Promise<void> => {
    const { status, body } = await request(app)
      .get(`/assignment/student/class/${class3.id}`)
      .query({ limit: 1 })
      .set("Authorization", `Bearer ${student5.token}`);

    stringToDate(body, 1);

    expect(status).toBe(200);
    expect(body).toHaveLength(1);
  });

  it("should only return 2 assignments even though limit is higher", async (): Promise<void> => {
    const { status, body } = await request(app)
      .get(`/assignment/student/class/${class3.id}`)
      .query({ limit: 10 })
      .set("Authorization", `Bearer ${student5.token}`);

    stringToDate(body, 2);

    expect(status).toBe(200);
    expect(body).toHaveLength(2);
  });
});
