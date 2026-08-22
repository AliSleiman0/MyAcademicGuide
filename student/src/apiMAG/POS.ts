import api from './api';

export interface Prerequisite {
    courseid: number;
    prerequisitecourseid: number;
    corerequisiteid: number | null;
    created_at: string;
    updated_at: string;
}

export interface Course {
    courseid: number;
    coursecode: string | null;
    coursename: string;
    credits: number;
    semester: string;
    coursetype: string;
    status: string;
    prerequisites: Prerequisite[];
    postrequisites: number[];
    corerequisites: number[];
}

export const getPOS = async (): Promise<Course[]> => {
    try {
        const response = await api.get('/pos');
        return response.data["All Courses"];
    } catch (error: any) {
        const errorMessage = error.response?.data?.message || 'Failed to fetch courses';
        throw new Error(errorMessage);
    }
};