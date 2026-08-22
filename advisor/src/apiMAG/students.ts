import api from './api';
export interface Course {
    courseid: number;
    coursename: string;
    credits: number;
}

export interface Student {
    userid: number;
    fullname: string;
    email: string;
    image: string | null;
    departmentid: number;
    departmentname: string;
    campusname: string;
    creditsFinished: number;
    totalCredits: string;
    currentlyRegisteredCourses: Course[];
    remainingCourses: Course[];
}
export const getStudents = async (id: number): Promise<Student[]> => {
    try {
        const response = await api.get(`/getstudents/${id}`);
        return response.data;
    } catch (error: any) {
        const errorMessage = error.response?.data?.message || 'Failed to fetch students';
        throw new Error(errorMessage);
    }
};
