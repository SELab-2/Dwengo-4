import { describe, it, beforeEach, expect } from "vitest";
import request from "supertest";
import app from "../index";

import {
  createTeacher,
  createStudent,
  createClass,
  addTeacherToClass,
  addStudentToClass,
  createLearningPath,
  createAssignment,
  createTeamWithStudents,
  giveAssignmentToTeam,
} from "./helpers/testDataCreation";
import LocalLearningObjectService from "../services/localLearningObjectService";

// Prisma-model typings
import { User, Teacher, Student, Class, Assignment, Team, LearningPath } from "@prisma/client";

type TeacherWithToken = User & { teacher: Teacher; token: string };
type StudentWithToken = User & { student: Student; token: string };

/******************************************************
 * QUESTION ENDPOINT TESTS (zonder helper-tests)
 ******************************************************/

describe("Question Endpoints Tests", () => {
  let teacherUser: TeacherWithToken;
  let studentUser: StudentWithToken;
  let classroom: Class;
  let learningPath: LearningPath;
  let assignment: Assignment;
  let team: Team;
  let localLOId: string;

  beforeEach(async () => {
    // Maak basisobjecten aan via helpers
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
    // Teacher koppelen aan de klas
    await addTeacherToClass(teacherUser.id, classroom.id);

    // Learning path + assignment + team
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
      new Date(Date.now() + 86400000)
    );
    team = await createTeamWithStudents("Question Team", classroom.id, [
      studentUser.student,
    ]);
    await giveAssignmentToTeam(assignment.id, team.id);

    // Lokaal leerobject
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
    });

    it("should return 400 error when required fields are missing", async () => {
      const response = await request(app)
        .post(`/question/specific/assignment/${assignment.id}`)
        .set("Authorization", `Bearer ${teacherUser.token}`)
        .send({
          isExternal: false,
          isPrivate: false,
          // missing teamId, title, text
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
    });

    it("should return 400 error for general question when required fields are missing", async () => {
      const response = await request(app)
        .post(`/question/general/assignment/${assignment.id}`)
        .set("Authorization", `Bearer ${teacherUser.token}`)
        .send({
          isExternal: false,
          isPrivate: false,
          // missing teamId, title, text, pathRef
        });
      expect(response.status).toBe(400);
      expect(response.body.error).toBeDefined();
    });
  });

  describe("POST /question/:questionId/message", () => {
    it("should create a message for the created question", async () => {
      // Eerst een question aanmaken
      const createQ = await request(app)
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
      expect(createQ.status).toBe(201);
      const questionId = createQ.body.questionId;

      // Nu een bericht
      const messageRes = await request(app)
        .post(`/question/${questionId}/message`)
        .set("Authorization", `Bearer ${teacherUser.token}`)
        .send({ text: "Test message from teacher" });
      expect(messageRes.status).toBe(201);
      expect(messageRes.body).toHaveProperty("id");
    });
  });

  describe("Additional Question Endpoints Tests", () => {
    let specQId: number;
    let genQId: number;
    let msgId: number;

    beforeEach(async () => {
      // maak SPECIFIC question
      const specific = await request(app)
        .post(`/question/specific/assignment/${assignment.id}`)
        .set("Authorization", `Bearer ${teacherUser.token}`)
        .send({
          teamId: team.id,
          title: "SpecQ",
          text: "SpecQ text",
          isExternal: false,
          isPrivate: false,
          localLearningObjectId: localLOId,
        });
      expect(specific.status).toBe(201);
      specQId = specific.body.questionId;

      // maak GENERAL question
      const general = await request(app)
        .post(`/question/general/assignment/${assignment.id}`)
        .set("Authorization", `Bearer ${teacherUser.token}`)
        .send({
          teamId: team.id,
          title: "GenQ",
          text: "GenQ text",
          isExternal: false,
          isPrivate: false,
          pathRef: learningPath.id,
        });
      expect(general.status).toBe(201);
      genQId = general.body.questionId;
    });

    it("should return the correct createdBy field in the specific question", async () => {
      const getRes = await request(app)
        .get(`/question/${specQId}`)
        .set("Authorization", `Bearer ${teacherUser.token}`);
      expect(getRes.status).toBe(200);
      expect(getRes.body).toHaveProperty("createdBy", teacherUser.id);
    });

    it("should update a question title", async () => {
      const newTitle = "Updated Title";
      const updateRes = await request(app)
        .patch(`/question/${specQId}`)
        .set("Authorization", `Bearer ${teacherUser.token}`)
        .send({ title: newTitle });
      expect(updateRes.status).toBe(200);
      expect(updateRes.body.title).toBe(newTitle);
    });

    it("should update a question message text", async () => {
      // message
      const msg = await request(app)
        .post(`/question/${specQId}/message`)
        .set("Authorization", `Bearer ${teacherUser.token}`)
        .send({ text: "Original message" });
      expect(msg.status).toBe(201);
      msgId = msg.body.id;

      const updatedText = "Updated message text";
      const patchRes = await request(app)
        .patch(`/question/${specQId}/message/${msgId}`)
        .set("Authorization", `Bearer ${teacherUser.token}`)
        .send({ text: updatedText });
      expect(patchRes.status).toBe(200);
      expect(patchRes.body.text).toBe(updatedText);
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
        .send({ text: "Message1" });
      await request(app)
        .post(`/question/${specQId}/message`)
        .set("Authorization", `Bearer ${teacherUser.token}`)
        .send({ text: "Message2" });

      const getMsgs = await request(app)
        .get(`/question/${specQId}/messages`)
        .set("Authorization", `Bearer ${teacherUser.token}`);
      expect(getMsgs.status).toBe(200);
      expect(Array.isArray(getMsgs.body)).toBe(true);
      expect(getMsgs.body.length).toBeGreaterThanOrEqual(2);
    });

    it("should delete a question message", async () => {
      // add a message
      const addMsg = await request(app)
      .post(`/question/${specQId}/message`)
      .set("Authorization", `Bearer ${teacherUser.token}`)
      .send({ text: "Message to be deleted" });
      expect(addMsg.status).toBe(201);
      const msgIdDel = addMsg.body.id;

      // delete
      const delMsg = await request(app)
      .delete(`/question/${specQId}/message/${msgIdDel}`)
      .set("Authorization", `Bearer ${teacherUser.token}`)
      .send({});
      expect(delMsg.status).toBe(204);

      // verify
      const getM = await request(app)
      .get(`/question/${specQId}/messages`)
      .set("Authorization", `Bearer ${teacherUser.token}`);

      interface Message {
      id: number;
      text: string;
      }

      const messages: Message[] = getM.body;
      const found = messages.find((m) => m.id === msgIdDel);
      expect(found).toBeUndefined();
    });

    
  });
});

/******************************************************
 * AUTHENTICATION (Teacher vs. Student)
 ******************************************************/
describe("Authentication Tests for Questions", () => {
  let questionId: number;
  let teacher: TeacherWithToken;
  let student: StudentWithToken;
  let classX: Class;
  let lpX: LearningPath;
  let assignX: Assignment;
  let teamX: Team;
  let loX: string;

  beforeEach(async () => {
    teacher = await createTeacher("AuthQ", "Teacher", "authQ.teacher@example.com");
    student = await createStudent("AuthQ", "Student", "authQ.student@example.com");

    classX = await createClass("AuthClassQ", "JOIN1111");
    await addTeacherToClass(teacher.id, classX.id);

    lpX = await createLearningPath("AuthQ LP", "For question auth", teacher.teacher.userId);

    assignX = await createAssignment(
      classX.id,
      lpX.id,
      "AuthQ Assignment",
      "Testing question auth",
      new Date(Date.now() + 86400000)
    );

    teamX = await createTeamWithStudents("AuthQTeam", classX.id, [student.student]);
    await giveAssignmentToTeam(assignX.id, teamX.id);

    const data = {
      title: "AuthQ LO",
      description: "Testing local LO for Q",
      contentType: "TEXT_PLAIN",
    };
    const localLO = await LocalLearningObjectService.createLearningObject(
      teacher.id,
      data
    );
    loX = localLO.id;

    // Teacher maakt question
    const createQ = await request(app)
      .post(`/question/specific/assignment/${assignX.id}`)
      .set("Authorization", `Bearer ${teacher.token}`)
      .send({
        teamId: teamX.id,
        title: "AuthTestQuestion",
        text: "Question from teacher",
        isExternal: false,
        isPrivate: false,
        localLearningObjectId: loX,
      });
    expect(createQ.status).toBe(201);
    questionId = createQ.body.questionId;
  });

  it("should not allow student to update teacher's question", async () => {
    const newTitle = "Student tries to rename question";
    const upd = await request(app)
      .patch(`/question/${questionId}`)
      .set("Authorization", `Bearer ${student.token}`)
      .send({ title: newTitle });
    expect([401,403]).toContain(upd.status);
  });

  it("should allow student to GET the question if they are in the same team", async () => {
    const getQ = await request(app)
      .get(`/question/${questionId}`)
      .set("Authorization", `Bearer ${student.token}`);
    expect(getQ.status).toBe(200);
    expect(getQ.body).toHaveProperty("id", questionId);
  });

  it("should allow student to POST a message if they're in the team", async () => {
    const postMsg = await request(app)
      .post(`/question/${questionId}/message`)
      .set("Authorization", `Bearer ${student.token}`)
      .send({ text: "Hello from student" });
    expect(postMsg.status).toBe(201);
    expect(postMsg.body).toHaveProperty("id");
  });
});


describe("Authorization Tests for Non-Team Students", () => {
  let realStudent: StudentWithToken;
  let strangerStudent: StudentWithToken;
  let teacherX: TeacherWithToken;
  let newClass: Class;
  let newAssignment: Assignment;
  let newTeam: Team;
  let newQuestionId: number;
  let newLocalLOId: string;

  beforeEach(async () => {
    // teacher & 2 students
    teacherX = await createTeacher("Qteacher", "TLast", "teacher.real@example.com");
    realStudent = await createStudent("Real", "Student", "student.real@example.com");
    strangerStudent = await createStudent("Strange", "Student", "student.strange@example.com");

    newClass = await createClass("AuthClassX", "JOIN9999");
    await addTeacherToClass(teacherX.id, newClass.id);

    const lp = await createLearningPath(
      "AuthTest LP",
      "Authorization test",
      teacherX.teacher.userId
    );

    newAssignment = await createAssignment(
      newClass.id,
      lp.id,
      "AuthTest Assignment",
      "Check question routes with strangers",
      new Date(Date.now() + 86400000)
    );

    newTeam = await createTeamWithStudents("AuthTeamX", newClass.id, [
      realStudent.student,
    ]);
    await giveAssignmentToTeam(newAssignment.id, newTeam.id);

    const data = {
      title: "LO for AuthTests",
      description: "Testing local LO",
      contentType: "TEXT_PLAIN",
    };
    const localLO = await LocalLearningObjectService.createLearningObject(
      teacherX.id,
      data
    );
    newLocalLOId = localLO.id;

    // Teacher maakt question
    const createQ = await request(app)
      .post(`/question/specific/assignment/${newAssignment.id}`)
      .set("Authorization", `Bearer ${teacherX.token}`)
      .send({
        teamId: newTeam.id,
        title: "Team-Only Q",
        text: "No outsiders",
        isExternal: false,
        isPrivate: false,
        localLearningObjectId: newLocalLOId,
      });
    expect(createQ.status).toBe(201);
    newQuestionId = createQ.body.questionId;
  });

  it("Stranger student should NOT be able to GET the question (403)", async () => {
    const res = await request(app)
      .get(`/question/${newQuestionId}`)
      .set("Authorization", `Bearer ${strangerStudent.token}`);
    expect([401, 403]).toContain(res.status);
  });

  it("Stranger student should NOT be able to update the question (403)", async () => {
    const updateRes = await request(app)
      .patch(`/question/${newQuestionId}`)
      .set("Authorization", `Bearer ${strangerStudent.token}`)
      .send({ title: "New Title from Stranger" });
    expect([401, 403]).toContain(updateRes.status);
  });

  it("Stranger student should NOT be able to DELETE the question (403)", async () => {
    const deleteRes = await request(app)
      .delete(`/question/${newQuestionId}`)
      .set("Authorization", `Bearer ${strangerStudent.token}`)
      .send({});
    expect([401, 403]).toContain(deleteRes.status);
  });

  it("Stranger student should NOT be able to GET messages (403)", async () => {
    const getMsgRes = await request(app)
      .get(`/question/${newQuestionId}/messages`)
      .set("Authorization", `Bearer ${strangerStudent.token}`);
    expect([401, 403]).toContain(getMsgRes.status);
  });

  it("Stranger student should NOT be able to POST a message (403)", async () => {
    const postMsgRes = await request(app)
      .post(`/question/${newQuestionId}/message`)
      .set("Authorization", `Bearer ${strangerStudent.token}`)
      .send({ text: "Stranger tries to join conversation" });
    expect([401, 403]).toContain(postMsgRes.status);
  });

  it("Stranger student should NOT be able to PATCH or DELETE a message (403)", async () => {
    const teacherMakesMsg = await request(app)
      .post(`/question/${newQuestionId}/message`)
      .set("Authorization", `Bearer ${teacherX.token}`)
      .send({ text: "Allowed message" });
    expect(teacherMakesMsg.status).toBe(201);
    const msgId = teacherMakesMsg.body.id;

    const patchRes = await request(app)
      .patch(`/question/${newQuestionId}/message/${msgId}`)
      .set("Authorization", `Bearer ${strangerStudent.token}`)
      .send({ text: "Hacked message" });
    expect([401, 403]).toContain(patchRes.status);

    const delRes = await request(app)
      .delete(`/question/${newQuestionId}/message/${msgId}`)
      .set("Authorization", `Bearer ${strangerStudent.token}`)
      .send({});
    expect([401, 403]).toContain(delRes.status);
  });
});
