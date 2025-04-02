import {
    addStudentToClass,
    addTeacherToClass,
    createClass,
    createEvaluation,
    createLearningPath,
    createStudent,
    createTeacher,
    createTeamWithStudents
} from "./testDataCreation";
import {
    Class,
    ContentType,
    Evaluation,
    EvaluationType,
    LearningObject,
    LearningPath,
    Student,
    Teacher,
    Team,
    User
} from "@prisma/client";
import LocalLearningObjectService from "../../services/localLearningObjectService";

export async function setupTestData() {
    // Create a teacher
    const teacher: User & { teacher: Teacher, token: string }  = await createTeacher("Sponge", "Bob", "sponge.bob@gmail.com");
    const teacherId: number = teacher.teacher.userId;

    // Create a student
    const student: User & { student: Student, token: string } = await createStudent("Patrick", "Star", "patrick.star@gmail.com");
    const studentId: number = student.student.userId;

    // Create a class
    const classroom: Class = await createClass("Moderne Talen 5A", "ABCD");
    const classroomId: number = classroom.id;

    // Assign teacher and student to the class
    await addTeacherToClass(teacherId, classroomId);
    await addStudentToClass(studentId, classroomId);

    // Data for LocalLearningObject
    const data = {
        title: "Test LO",
        description: "Niet voor echt gebruik",
        contentType: ContentType.TEXT_PLAIN,
    };

    // Create a LocalLearningObject
    const LO: LearningObject = await LocalLearningObjectService.createLearningObject(
        teacherId,
        data
    );

    // Create an evaluation
    const evaluation: Evaluation = await createEvaluation(LO.id, EvaluationType.OPEN);
    const evalId: string = evaluation.id;

    // Create a learning path
    const learningPath: LearningPath = await createLearningPath(
        "Fake learning path",
        "This path is solely used for testing.",
        teacherId
    );

    // Create a team
    const team: Team = await createTeamWithStudents(
        "Testing teamName",
        classroomId,
        [student.student]
    );
    const teamId: number = team.id;

    return {
        teacher,
        teacherId,
        student,
        studentId,
        classroom,
        classroomId,
        team,
        teamId,
        evaluation,
        evalId,
        learningPath,
    };
}