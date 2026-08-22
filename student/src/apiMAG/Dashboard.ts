import api from './api';

// Interface for Course
export interface Course {
    courseid: number;
    coursecode: string;
    coursename: string;
    credits: number;
    semester: string;
    coursetype: string;
    created_at: string | null;
    updated_at: string | null;
    semestertaken: string;
    yeartaken: string;
    grade: string | null;
    canregister?: boolean;
}

// Interface for RemainingCourse
export interface RemainingCourse {
    courseid: number;
    coursename: string;
    credits: number;
    semester: string;
    coursetype: string;
    canregister: boolean;
}

// Interface for CourseStatusData
export interface CourseStatusData {
    course_count: number;
    course_percentage: number;
    credits_count: number;
    credits_percentage: number;
    courses: Course[];
}

// Interface for CoursesDistribution
export interface CoursesDistribution {
    Failed: CourseStatusData;
    Registered: CourseStatusData;
    Passed: CourseStatusData;
    WithDrawn: CourseStatusData;
}

// Interface for GradesDistribution
export interface GradesDistribution {
    [key: string]: number;
}

// Main Dashboard Data Interface
export interface DashboardData {
    courses_destribution_by_status: CoursesDistribution;
    remaining_courses: RemainingCourse[];
    grades_distribution: GradesDistribution;
    total_courses: number;
    total_credits: string;
}

// API call to fetch dashboard data
export const getDashboardData = async (): Promise<DashboardData> => {
    try {
        const response = await api.get('/index');
        return response.data;
    } catch (error: any) {
        const errorMessage = error.response?.data?.message || 'Failed to fetch dashboard data';
        throw new Error(errorMessage);
    }
};