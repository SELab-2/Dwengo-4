import { ClassItem } from '../../types/type';
import { APIError, CreateClassPayload, StudentItem, UpdateClassPayload } from '../../types/api.types';
import { getAuthToken } from './authTeacher';
import { apiRequest, BACKEND } from '../shared/config';



/**
 * Fetches all classes for the authenticated teacher
 * @param {boolean} includeStudents - Whether to include student details
 * @returns {Promise<ClassItem[]>} List of classes
 * @throws {APIError} When fetching fails
 */
export async function fetchClasses(
    includeStudents: boolean = false,
): Promise<ClassItem[]> {
    let response;
    if (includeStudents) {
        response = await fetch(`${BACKEND}/class/teacher/student`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${getAuthToken()}`,
            },
        });
    } else {
        response = await fetch(`${BACKEND}/class/teacher`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${getAuthToken()}`,
            },
        });
    }

    if (!response.ok) {
        const error: APIError = new Error(
            'Er is iets misgegaan bij het ophalen van de klassen.',
        );
        error.code = response.status;
        error.info = await response.json();
        throw error;
    }

    let classrooms = await response.json();
    classrooms = classrooms.classrooms;

    if (includeStudents) {
        classrooms.forEach((classroom: any) => {
            classroom.students = classroom.classLinks.map(
                (link: any) => link.student.user,
            );
        });
    }
    return classrooms;
}

/**
 * Creates a new class for the authenticated teacher
 * @param {CreateClassPayload} payload - The class details
 * @returns {Promise<ClassItem>} The created class
 * @throws {APIError} When creation fails
 */
export async function createClass({
    name,
}: CreateClassPayload): Promise<ClassItem> {

    return await apiRequest({
        method: 'POST',
        endpoint: '/class/teacher',
        body: { name },
        getToken: getAuthToken,
    });
}

/**
 * Updates an existing class
 * @param {UpdateClassPayload} payload - The updated class details
 * @returns {Promise<ClassItem>} The updated class
 * @throws {APIError} When update fails
 */
export async function updateClass({
    name,
    classId,
}: UpdateClassPayload): Promise<ClassItem> {

    return await apiRequest({
        method: 'PATCH',
        endpoint: `/class/teacher/${classId}`,
        body: { name },
        getToken: getAuthToken,
    });
}

/**
 * Fetches a specific class by ID
 * @param {number} classId - The ID of the class
 * @returns {Promise<ClassItem>} The class details
 * @throws {APIError} When fetching fails
 */
export async function fetchClass({
    classId,
}: {
    classId: number;
}): Promise<ClassItem> {
    const response = await apiRequest<{ classroom: ClassItem }>({
        method: 'GET',
        endpoint: `/class/teacher/${classId}`,
        getToken: getAuthToken,
    });
    return response.classroom;
}


/**
 * Fetches all students in a specific class
 * @param {number} classId - The ID of the class
 * @returns {Promise<StudentItem[]>} List of students
 * @throws {APIError} When fetching fails
 */
export async function fetchStudentsByClass({
    classId,
}: {
    classId: number;
}): Promise<StudentItem[]> {

    const response = await apiRequest<{ students: StudentItem[] }>({
        method: 'GET',
        endpoint: `/class/teacher/${classId}/student`,
        getToken: getAuthToken,
    })

    return response.students;
}
