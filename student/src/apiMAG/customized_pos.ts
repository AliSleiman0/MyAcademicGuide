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

export interface ChosenCourse {
    courseid: number;
    coursename: string;
    coursecode: string | null;
    coursetype: string; // Consider enum if you have fixed types: 'Major' | 'Core' | etc.
    credits: number;
    corerequisites: Corerequisite[];
    postrequisitFor: number;
    score: number;
    key?: number;
    priority?: number;
}

export interface CourseSubmissionData {
    chosenCoursesIds: ChosenCourse[];
}

// Usage example with API call:
export const submitSelectedCourses = async (
    data: CourseSubmissionData
): Promise<RegistrationData> => {
    const response = await api.post('/CustomizedPOS', data);
    return response.data; // Ensure this returns SemesterInfo[]
};
