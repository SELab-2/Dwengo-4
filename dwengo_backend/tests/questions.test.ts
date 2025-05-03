import { describe, it, beforeEach, expect } from "vitest";
import request from "supertest";
import app from "../index";
import prisma from "../config/prisma"; // <- important for DB assertions 

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

describe("🧪 Question Endpoints with DB assertions", () => {
  let teacherUser: any;
  let studentUser: any;
  let classroom: any;
  let learningPath: any;
  let assignment: any;
  let team: any;
  let localLOId: string;

  beforeEach(async () => {
    teacherUser = await createTeacher("Q", "Teacher", "q.teacher@example.com");
    studentUser = await createStudent("Q", "Student", "q.student@example.com");
    classroom = await createClass("QClass", "JOINQ1");
    await addTeacherToClass(teacherUser.id, classroom.id);

    learningPath = await createLearningPath("Q Path", "desc", teacherUser.teacher.userId);
    assignment = await createAssignment(classroom.id, learningPath.id, "Q Assignment", "desc", new Date(Date.now() + 86400000));
    team = await createTeamWithStudents("Q Team", classroom.id, [studentUser.student]);
    await giveAssignmentToTeam(assignment.id, team.id);

    const lo = await LocalLearningObjectService.createLearningObject(teacherUser.id, {
      title: "Q LO",
      description: "For testing",
      contentType: "TEXT_PLAIN"
    });
    localLOId = lo.id;
  });

  it("POST /question/specific/assignment/:assignmentId > creates a specific question and stores it in DB", async () => {
    const res = await request(app)
      .post(`/question/specific/assignment/${assignment.id}`)
      .set("Authorization", `Bearer ${teacherUser.token}`)
      .send({
        teamId: team.id,
        title: "Specific Q",
        text: "Explain quantum physics",
        isExternal: false,
        isPrivate: false,
        localLearningObjectId: localLOId
      });

    expect(res.status).toBe(201);
    const qId = res.body.questionId;
    const dbQ = await prisma.question.findUnique({ where: { id: qId } });
    expect(dbQ?.title).toBe("Specific Q");
    expect(dbQ?.teamId).toBe(team.id);
    expect(dbQ?.assignmentId).toBe(assignment.id);
  });

  it("POST /question/specific/assignment/:assignmentId > fails on missing fields", async () => {
    const res = await request(app)
      .post(`/question/specific/assignment/${assignment.id}`)
      .set("Authorization", `Bearer ${teacherUser.token}`)
      .send({ isExternal: false });

    expect(res.status).toBe(400);
    expect(res.body.error).toBeDefined();
  });

  it("POST /question/general/assignment/:assignmentId > creates a general question and stores it in DB", async () => {
    const res = await request(app)
      .post(`/question/general/assignment/${assignment.id}`)
      .set("Authorization", `Bearer ${teacherUser.token}`)
      .send({
        teamId: team.id,
        title: "General Q",
        text: "What is knowledge?",
        isExternal: false,
        isPrivate: false,
        pathRef: learningPath.id
      });

    expect(res.status).toBe(201);
    const qId = res.body.questionId;
    const dbQ = await prisma.question.findUnique({ where: { id: qId } });
    expect(dbQ?.title).toBe("General Q");
    expect(dbQ?.type).toBe("GENERAL");
    expect(dbQ?.assignmentId).toBe(assignment.id);
  });

  it("POST /question/general/assignment/:assignmentId > fails on missing fields", async () => {
    const res = await request(app)
      .post(`/question/general/assignment/${assignment.id}`)
      .set("Authorization", `Bearer ${teacherUser.token}`)
      .send({
        isExternal: false,
        isPrivate: false,
      });

    expect(res.status).toBe(400);
    expect(res.body.error).toBeDefined();
  });

  it("PATCH /question/:id (update) > updates title in DB", async () => {
    const createQ = await request(app)
      .post(`/question/specific/assignment/${assignment.id}`)
      .set("Authorization", `Bearer ${teacherUser.token}`)
      .send({
        teamId: team.id,
        title: "Update Me",
        text: "Old title",
        isExternal: false,
        isPrivate: false,
        localLearningObjectId: localLOId
      });

    const qId = createQ.body.questionId;
    const newTitle = "Updated Title";
    const res = await request(app)
      .patch(`/question/${qId}`)
      .set("Authorization", `Bearer ${teacherUser.token}`)
      .send({ title: newTitle });

    expect(res.status).toBe(200);
    const updated = await prisma.question.findUnique({ where: { id: qId } });
    expect(updated?.title).toBe(newTitle);
  });

  it("POST /question/:id/message (and verify DB) > creates a message for question in DB", async () => {
    const createQ = await request(app)
      .post(`/question/specific/assignment/${assignment.id}`)
      .set("Authorization", `Bearer ${teacherUser.token}`)
      .send({
        teamId: team.id,
        title: "Msg Q",
        text: "Base Q",
        isExternal: false,
        isPrivate: false,
        localLearningObjectId: localLOId
      });

    const qId = createQ.body.questionId;
    const msg = await request(app)
      .post(`/question/${qId}/message`)
      .set("Authorization", `Bearer ${teacherUser.token}`)
      .send({ text: "Hello msg" });

    expect(msg.status).toBe(201);
    const dbMsg = await prisma.questionMessage.findUnique({ where: { id: msg.body.id } });
    expect(dbMsg?.text).toBe("Hello msg");
    expect(dbMsg?.questionId).toBe(qId);
  });

  it("DELETE /question/:id/message/:id > deletes message from DB", async () => {
    const createQ = await request(app)
      .post(`/question/specific/assignment/${assignment.id}`)
      .set("Authorization", `Bearer ${teacherUser.token}`)
      .send({
        teamId: team.id,
        title: "DeleteMsg",
        text: "Test Delete",
        isExternal: false,
        isPrivate: false,
        localLearningObjectId: localLOId
      });

    const qId = createQ.body.questionId;
    const msg = await request(app)
      .post(`/question/${qId}/message`)
      .set("Authorization", `Bearer ${teacherUser.token}`)
      .send({ text: "To be deleted" });

    const msgId = msg.body.id;
    const del = await request(app)
      .delete(`/question/${qId}/message/${msgId}`)
      .set("Authorization", `Bearer ${teacherUser.token}`);

    expect(del.status).toBe(204);
    const dbCheck = await prisma.questionMessage.findUnique({ where: { id: msgId } });
    expect(dbCheck).toBeNull();
  });
});
describe("🔐 Authorization & integrity tests", () => {
  let teacherA: any, teacherB: any;
  let studentInTeam: any, studentOutsider: any;
  let teamA: any, assignmentA: any, learningPathA: any;
  let loA: string;
  let questionId: number;

  beforeEach(async () => {
    teacherA = await createTeacher("Alice", "Teach", "a@edu.com");
    teacherB = await createTeacher("Bob", "Other", "b@edu.com");
    studentInTeam = await createStudent("In", "Team", "in@team.com");
    studentOutsider = await createStudent("Out", "Side", "out@team.com");

    const klass = await createClass("Class A", "JOIN1234");
    await addTeacherToClass(teacherA.id, klass.id);

    learningPathA = await createLearningPath("LP A", "desc", teacherA.teacher.userId);
    assignmentA = await createAssignment(klass.id, learningPathA.id, "AssignA", "Desc", new Date(Date.now() + 86400000));
    teamA = await createTeamWithStudents("TeamA", klass.id, [studentInTeam.student]);
    await giveAssignmentToTeam(assignmentA.id, teamA.id);

    loA = (await LocalLearningObjectService.createLearningObject(teacherA.id, {
      title: "Shared LO",
      description: "Test",
      contentType: "TEXT_PLAIN"
    })).id;

    const q = await request(app)
      .post(`/question/specific/assignment/${assignmentA.id}`)
      .set("Authorization", `Bearer ${teacherA.token}`)
      .send({
        teamId: teamA.id,
        title: "Lock Test",
        text: "Test q",
        isExternal: false,
        isPrivate: false,
        localLearningObjectId: loA,
      });

    questionId = q.body.questionId;
  });

  it("❌ Student outside team cannot GET question", async () => {
    const res = await request(app)
      .get(`/question/${questionId}`)
      .set("Authorization", `Bearer ${studentOutsider.token}`);
    expect([401, 403]).toContain(res.status);
  });

  it("✅ Student inside team can GET question", async () => {
    const res = await request(app)
      .get(`/question/${questionId}`)
      .set("Authorization", `Bearer ${studentInTeam.token}`);
    expect(res.status).toBe(200);
    expect(res.body.id).toBe(questionId);
  });

  

  it("❌ Other teacher cannot DELETE question", async () => {
    const del = await request(app)
      .delete(`/question/${questionId}`)
      .set("Authorization", `Bearer ${teacherB.token}`);
    expect([401, 403]).toContain(del.status);
  });

  

  it("✅ Student in team can POST message", async () => {
    const postMsg = await request(app)
      .post(`/question/${questionId}/message`)
      .set("Authorization", `Bearer ${studentInTeam.token}`)
      .send({ text: "Student msg" });
    expect(postMsg.status).toBe(201);
  });

  it("❌ Student NOT in team cannot POST message", async () => {
    const postMsg = await request(app)
      .post(`/question/${questionId}/message`)
      .set("Authorization", `Bearer ${studentOutsider.token}`)
      .send({ text: "Not allowed" });
    expect([401, 403]).toContain(postMsg.status);
  });
});
