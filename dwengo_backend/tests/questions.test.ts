import { describe, it, beforeEach, expect } from "vitest";
import request from "supertest";
import app from "../index";

import {
  createTeacher,
  createStudent,
  createClass,
  addTeacherToClass,
  createLearningPath,
  createAssignment,
  createTeamWithStudents,
  giveAssignmentToTeam,
} from "./helpers/testDataCreation";
import LocalLearningObjectService from "../services/localLearningObjectService";

let teacherUser: any;
let studentUser: any;
let classroom: any;
let learningPath: any;
let assignment: any;
let team: any;
let localLOId: string; // geldige local learning object id

describe("Setup Helper Tests voor Questions", () => {
  it("should create a teacher", async () => {
    const teacher = await createTeacher(
      "Test",
      "Teacher",
      "test.teacher@example.com"
    );
    expect(teacher).toHaveProperty("id");
    expect(teacher).toHaveProperty("token");
    expect(teacher).toHaveProperty("teacher");
    expect(teacher.teacher.userId).toBe(teacher.id);
  });

  it("should create a student", async () => {
    const student = await createStudent(
      "Test",
      "Student",
      "test.student@example.com"
    );
    expect(student).toHaveProperty("id");
    expect(student).toHaveProperty("token");
    expect(student).toHaveProperty("student");
    expect(student.student.userId).toBe(student.id);
  });

  it("should create a classroom", async () => {
    const cls = await createClass("Test Class", "JOIN1234");
    expect(cls).toHaveProperty("id");
    expect(cls.name).toBe("Test Class");
    expect(cls.code).toBe("JOIN1234");
  });

  it("should add teacher to classroom", async () => {
    const teacher = await createTeacher(
      "Test",
      "Teacher",
      "test.teacher2@example.com"
    );
    const cls = await createClass("Test Class", "JOIN5678");
    await addTeacherToClass(teacher.id, cls.id);
    const { default: prisma } = await import("./helpers/prisma");
    const classTeacher = await prisma.classTeacher.findUnique({
      where: {
        teacherId_classId: {
          teacherId: teacher.id,
          classId: cls.id,
        },
      },
    });
    expect(classTeacher).not.toBeNull();
    expect(classTeacher?.teacherId).toBe(teacher.id);
    expect(classTeacher?.classId).toBe(cls.id);
  });

  it("should create a learning path", async () => {
    const teacher = await createTeacher(
      "Test",
      "Teacher",
      "test.teacher3@example.com"
    );
    const lp = await createLearningPath(
      "Test Learning Path",
      "Een test leerpad",
      teacher.teacher.userId
    );
    expect(lp).toHaveProperty("id");
    expect(lp.title).toBe("Test Learning Path");
  });

  it("should create an assignment", async () => {
    const teacher = await createTeacher(
      "Test",
      "Teacher",
      "test.teacher4@example.com"
    );
    const cls = await createClass("Test Class", "JOIN9012");
    const lp = await createLearningPath(
      "Test Learning Path",
      "Een test leerpad",
      teacher.teacher.userId
    );
    const deadline = new Date(Date.now() + 86400000); // 1 dag in de toekomst
    const assign = await createAssignment(
      cls.id,
      lp.id,
      "Test Assignment",
      "Assignment Description",
      deadline
    );
    expect(assign).toHaveProperty("id");
    expect(assign.title).toBe("Test Assignment");
    const { default: prisma } = await import("./helpers/prisma");
    const classAssignment = await prisma.classAssignment.findFirst({
      where: { assignmentId: assign.id },
    });
    expect(classAssignment).not.toBeNull();
  });

  it("should create a team with students", async () => {
    const cls = await createClass("Test Class", "JOIN3456");
    const student = await createStudent(
      "Test",
      "Student",
      "test.student2@example.com"
    );
    const tm = await createTeamWithStudents("Test Team", cls.id, [
      student.student,
    ]);
    const { default: prisma } = await import("./helpers/prisma");
    const fetchedTeam = await prisma.team.findUnique({
      where: { id: tm.id },
      include: { students: true },
    });
    expect(fetchedTeam).not.toBeNull();
    expect(Array.isArray(fetchedTeam!.students)).toBe(true);
    expect(fetchedTeam!.students.length).toBeGreaterThan(0);
  });
});

describe("Question Endpoints Tests", () => {
  let specificQuestionId: number;
  let generalQuestionId: number;

  beforeEach(async () => {
    // Maak een teacher, student, class, learning path, assignment en team aan voor de tests
    teacherUser = await createTeacher(
      "Question",
      "Teacher",
      "question.teacher@example.com"
    );
    studentUser = await createStudent(
      "Question",
      "Student",
      "question.student@example.com"
    );
    classroom = await createClass("Question Class", "QJOIN123");
    await addTeacherToClass(teacherUser.id, classroom.id);
    learningPath = await createLearningPath(
      "Question Learning Path",
      "Learning path for questions",
      teacherUser.teacher.userId
    );
    assignment = await createAssignment(
      classroom.id,
      learningPath.id,
      "Question Assignment",
      "Assignment for question tests",
      new Date(Date.now() + 86400000) // deadline 1 dag in de toekomst
    );
    team = await createTeamWithStudents("Question Team", classroom.id, [
      studentUser.student,
    ]);
    // Link het team aan de assignment zodat de vraag validatie slaagt
    await giveAssignmentToTeam(assignment.id, team.id);

    // Maak een geldig lokaal leerobject aan voor non-external questions
    const data = {
      title: "Test LO for Questions",
      description: "Test description",
      contentType: "TEXT_PLAIN",
    };
    const localLO = await LocalLearningObjectService.createLearningObject(
      teacherUser.id,
      data
    );
    localLOId = localLO.id;
  });

  describe("POST /question/specific/assignment/:assignmentId", () => {
    it("should create a specific question with valid input", async () => {
      const response = await request(app)
        .post(`/question/specific/assignment/${assignment.id}`)
        .set("Authorization", `Bearer ${teacherUser.token}`)
        .send({
          teamId: team.id,
          title: "Test Specific Question",
          text: "What is the answer to life?",
          isExternal: false,
          isPrivate: false,
          localLearningObjectId: localLOId,
        });
      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty("questionId");
      specificQuestionId = response.body.questionId;
    });

    it("should return 400 error when required fields are missing", async () => {
      const response = await request(app)
        .post(`/question/specific/assignment/${assignment.id}`)
        .set("Authorization", `Bearer ${teacherUser.token}`)
        .send({
          isExternal: false,
          isPrivate: false,
          localLearningObjectId: localLOId,
        });
      expect(response.status).toBe(400);
      expect(response.body.error).toBeDefined();
    });
  });

  describe("POST /question/general/assignment/:assignmentId", () => {
    it("should create a general question with valid input", async () => {
      const response = await request(app)
        .post(`/question/general/assignment/${assignment.id}`)
        .set("Authorization", `Bearer ${teacherUser.token}`)
        .send({
          teamId: team.id,
          title: "Test General Question",
          text: "What is your opinion on testing?",
          isExternal: false,
          isPrivate: false,
          pathRef: learningPath.id,
        });
      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty("questionId");
      generalQuestionId = response.body.questionId;
    });

    it("should return 400 error for general question when required fields are missing", async () => {
      const response = await request(app)
        .post(`/question/general/assignment/${assignment.id}`)
        .set("Authorization", `Bearer ${teacherUser.token}`)
        .send({
          isExternal: false,
          isPrivate: false,
        });
      expect(response.status).toBe(400);
      expect(response.body.error).toBeDefined();
    });
  });

  describe("POST /question/:questionId/message", () => {
    it("should create a message for the created question", async () => {
      const createQuestionRes = await request(app)
        .post(`/question/specific/assignment/${assignment.id}`)
        .set("Authorization", `Bearer ${teacherUser.token}`)
        .send({
          teamId: team.id,
          title: "Question for Message",
          text: "What is the meaning of life?",
          isExternal: false,
          isPrivate: false,
          localLearningObjectId: localLOId,
        });
      expect(createQuestionRes.status).toBe(201);
      const questionId = createQuestionRes.body.questionId;
      expect(questionId).toBeDefined();

      const messageRes = await request(app)
        .post(`/question/${questionId}/message`)
        .set("Authorization", `Bearer ${teacherUser.token}`)
        .send({
          text: "This is a test message for the question.",
        });
      expect(messageRes.status).toBe(201);
      expect(messageRes.body).toHaveProperty("id");
    });
  });

  describe("Additional Question Endpoints Tests", () => {
    let specQId: number;
    let genQId: number;
    let msgId: number;

    beforeEach(async () => {
      // Creëer een specific question
      const specificRes = await request(app)
        .post(`/question/specific/assignment/${assignment.id}`)
        .set("Authorization", `Bearer ${teacherUser.token}`)
        .send({
          teamId: team.id,
          title: "Specific Question for further tests",
          text: "Specific question text",
          isExternal: false,
          isPrivate: false,
          localLearningObjectId: localLOId,
        });
      expect(specificRes.status).toBe(201);
      specQId = specificRes.body.questionId;

      // Creëer een general question
      const generalRes = await request(app)
        .post(`/question/general/assignment/${assignment.id}`)
        .set("Authorization", `Bearer ${teacherUser.token}`)
        .send({
          teamId: team.id,
          title: "General Question for further tests",
          text: "General question text",
          isExternal: false,
          isPrivate: false,
          pathRef: learningPath.id,
        });
      expect(generalRes.status).toBe(201);
      genQId = generalRes.body.questionId;
    });

    it("should return the correct createdBy field in the specific question", async () => {
      const getRes = await request(app)
        .get(`/question/${specQId}`)
        .set("Authorization", `Bearer ${teacherUser.token}`);
      expect(getRes.status).toBe(200);
      expect(getRes.body).toHaveProperty("createdBy", teacherUser.id);
    });

    it("should update a question title", async () => {
      const newTitle = "Updated Specific Question Title";
      const updateRes = await request(app)
        .patch(`/question/${specQId}`)
        .set("Authorization", `Bearer ${teacherUser.token}`)
        .send({ title: newTitle });
      expect(updateRes.status).toBe(200);
      expect(updateRes.body.title).toBe(newTitle);
    });

    it("should update a question message text", async () => {
      const msgRes = await request(app)
        .post(`/question/${specQId}/message`)
        .set("Authorization", `Bearer ${teacherUser.token}`)
        .send({ text: "Original message text" });
      expect(msgRes.status).toBe(201);
      msgId = msgRes.body.id;
      
      const newText = "Updated message text";
      const updateMsgRes = await request(app)
        .patch(`/question/${specQId}/message/${msgId}`)
        .set("Authorization", `Bearer ${teacherUser.token}`)
        .send({ text: newText });
      expect(updateMsgRes.status).toBe(200);
      expect(updateMsgRes.body.text).toBe(newText);
    });

    it("should get a question by id", async () => {
      const getRes = await request(app)
        .get(`/question/${genQId}`)
        .set("Authorization", `Bearer ${teacherUser.token}`);
      expect(getRes.status).toBe(200);
      expect(getRes.body).toHaveProperty("id", genQId);
    });

    it("should get messages for a question", async () => {
      await request(app)
        .post(`/question/${specQId}/message`)
        .set("Authorization", `Bearer ${teacherUser.token}`)
        .send({ text: "Message 1" });
      await request(app)
        .post(`/question/${specQId}/message`)
        .set("Authorization", `Bearer ${teacherUser.token}`)
        .send({ text: "Message 2" });
        
      const getMsgsRes = await request(app)
        .get(`/question/${specQId}/messages`)
        .set("Authorization", `Bearer ${teacherUser.token}`);
      expect(getMsgsRes.status).toBe(200);
      expect(Array.isArray(getMsgsRes.body)).toBe(true);
      expect(getMsgsRes.body.length).toBeGreaterThanOrEqual(2);
    });

    it("should delete a question message", async () => {
      const addMsgRes = await request(app)
        .post(`/question/${specQId}/message`)
        .set("Authorization", `Bearer ${teacherUser.token}`)
        .send({ text: "Message to delete" });
      expect(addMsgRes.status).toBe(201);
      const msgIdToDelete = addMsgRes.body.id;

      const deleteMsgRes = await request(app)
        .delete(`/question/${specQId}/message/${msgIdToDelete}`)
        .set("Authorization", `Bearer ${teacherUser.token}`)
        .send({});
      expect(deleteMsgRes.status).toBe(204);

      const getMsgRes = await request(app)
        .get(`/question/${specQId}/messages`)
        .set("Authorization", `Bearer ${teacherUser.token}`);
      const messages = getMsgRes.body;
      const found = messages.find((msg: any) => msg.id === msgIdToDelete);
      expect(found).toBeUndefined();
    });

    
  });
});

