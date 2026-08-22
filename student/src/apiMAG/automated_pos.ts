import api from "./api";

export interface Corerequisite {
    courseid: number;
    prerequisitecourseid: number | null;
    corerequisiteid: number | null;
    created_at: string;
    updated_at: string;
}

export interface Course {
    courseid: number;
    coursename: string;
    coursecode: string | null;
    coursetype: string;
    credits: number;
    corerequisites: Corerequisite[];
    postrequisitFor: number;
    score: number;
}

export interface SemesterInfo {
    semester: string;
    year: string;
    courses: Course[];
    totalCredits?: number;
}

export interface GraduationInfo {
    semester: string;
    year: string;
}

export interface RegistrationData {
    doneCourses: number;
    untaken_courses: Course[];
    graduation_info: GraduationInfo;
    offeredCourses: SemesterInfo[];
    recommendedforRegestration: SemesterInfo[];
    completedCredits: number;
    total_credits: number;
    remaining_semesters: number;
    recommended_max_credits: number;
}
export const getDynamicPOS = async (): Promise<RegistrationData> => {
    try {
        const response = await api.get('/automated_pos');
        
        // 1. Add debug logging to see actual response structure
        console.log('Raw API Response:', response.data);
        
        // 2. Directly return the response data
        return response.data;
    } catch (error: any) {
        // 3. Improved error handling
        const errorMessage = error.response?.data?.message || 
                            error.message || 
                            'Failed to fetch academic plan';
        throw new Error(errorMessage);
    }
};