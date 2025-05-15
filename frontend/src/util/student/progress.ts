import { APIError, AssignmentItem } from '@/types/api.types';
import { getAuthToken } from './authStudent';
import { apiRequest, BACKEND } from '../shared/config';


// Create progress for a learning object
export async function createLearningObjectProgress(learningObjectId: string) {
    return await apiRequest({
        method: 'POST',
        endpoint: `/progress/student/learningObject/${learningObjectId}`,
        getToken: getAuthToken,
    });
}

// Get progress for a learning object
export async function getLearningObjectProgress(learningObjectId: string) {
    return await apiRequest({
        method: 'GET',
        endpoint: `/progress/student/learningObject/${learningObjectId}`,
        getToken: getAuthToken,
    });
}

// Update progress for a learning object
export async function updateLearningObjectProgress(learningObjectId: string, done: boolean) {
    return await apiRequest({
        method: 'PATCH',
        endpoint: `/progress/student/learningObject/${learningObjectId}`,
        body: {
            done
        },
        getToken: getAuthToken,
    });
}

// Get team progress
export async function getTeamProgress(teamId: number) {
    return await apiRequest({
        method: 'GET',
        endpoint: `/progress/student/team/${teamId}`,
        getToken: getAuthToken,
    });
}

// Get assignment progress
export async function getAssignmentProgress(assignmentId: number) {
    return await apiRequest({
        method: 'GET',
        endpoint: `/progress/student/assignment/${assignmentId}`,
        getToken: getAuthToken,
    });
}

// Get learning path progress
export async function getLearningPathProgress(learningPathId: string) {
    return await apiRequest({
        method: 'GET',
        endpoint: `/progress/student/learningPath/${learningPathId}`,
        getToken: getAuthToken,
    });
}

// ...existing code...

// Upsert progress for a learning object (create or update)
export async function upsertLearningObjectProgress(learningObjectId: string, done: boolean) {
    return await apiRequest({
        method: 'PUT',
        endpoint: `/progress/student/learningObject/${learningObjectId}`,
        body: {
            done
        },
        getToken: getAuthToken,
    });
}