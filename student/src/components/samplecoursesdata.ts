export type CourseStatus = 'completed' | 'current' | 'required' | 'failed' | 'withdrawn';
export type CourseGrade = 'A' | 'A-' | 'B+' | 'B' | 'B-' | 'C+' | 'C' | 'C-' | 'D+' | 'D' | 'F' | 'W' | null;
export type CourseRequirement = 'Core Requirement' | 'General Education' | 'Elective' | 'Major Requirement';

export interface Course {
    id: string;
    code: string;
    title: string;
    grade?: CourseGrade;
    status: CourseStatus;
    semester: string;
    credits: number;
    requirementType: CourseRequirement;
    progress?: number;
    schedule?: string;
    prerequisites?: string[];
}

export interface Student {
    id: string;
    name: string;
    gpa: number;
    totalCredits: number;
    totalCreditsRequired: number;
    degreeProgress: number;
    currentSemester: string;
    creditsEnrolled: number;
    semesterGPA: number;
}

export const studentData: Student = {
    id: '123456',
    name: 'Emma Wilson',
    gpa: 3.8,
    totalCredits: 84,
    totalCreditsRequired: 120,
    degreeProgress: 68,
    currentSemester: 'Fall 2023',
    creditsEnrolled: 15,
    semesterGPA: 3.7
};

export const completedCourses: Course[] = [
    {
        id: 'cs101',
        code: 'CS 101',
        title: 'Introduction to Programming',
        grade: 'A',
        status: 'completed',
        semester: 'Fall 2021',
        credits: 3,
        requirementType: 'Core Requirement'
    },
    {
        id: 'math142',
        code: 'MATH 142',
        title: 'Calculus II',
        grade: 'B+',
        status: 'completed',
        semester: 'Fall 2021',
        credits: 4,
        requirementType: 'Core Requirement'
    },
    {
        id: 'eng201',
        code: 'ENG 201',
        title: 'Writing in Disciplines',
        grade: 'A-',
        status: 'completed',
        semester: 'Spring 2022',
        credits: 3,
        requirementType: 'General Education'
    },
    {
        id: 'cs201',
        code: 'CS 201',
        title: 'Data Structures',
        grade: 'A',
        status: 'completed',
        semester: 'Spring 2022',
        credits: 3,
        requirementType: 'Core Requirement'
    }
];

export const currentCourses: Course[] = [
    {
        id: 'cs350',
        code: 'CS 350',
        title: 'Operating Systems',
        status: 'current',
        semester: 'Fall 2023',
        credits: 3,
        requirementType: 'Core Requirement',
        progress: 62,
        schedule: 'Mon, Wed 10:00 AM'
    },
    {
        id: 'cs330',
        code: 'CS 330',
        title: 'Database Systems',
        status: 'current',
        semester: 'Fall 2023',
        credits: 3,
        requirementType: 'Core Requirement',
        progress: 58,
        schedule: 'Tue, Thu 1:30 PM'
    },
    {
        id: 'cs450',
        code: 'CS 450',
        title: 'Machine Learning',
        status: 'current',
        semester: 'Fall 2023',
        credits: 3,
        requirementType: 'Major Requirement',
        progress: 45,
        schedule: 'Mon, Wed 2:00 PM'
    }
];

export const remainingCourses: Course[] = [
    {
        id: 'cs400',
        code: 'CS 400',
        title: 'Computer Networks',
        status: 'required',
        semester: 'Spring 2024',
        credits: 3,
        requirementType: 'Core Requirement',
        prerequisites: ['CS 201', 'CS 350']
    },
    {
        id: 'cs410',
        code: 'CS 410',
        title: 'Software Engineering',
        status: 'required',
        semester: 'Spring 2024',
        credits: 3,
        requirementType: 'Core Requirement',
        prerequisites: ['CS 330']
    }
];

export const failedCourses: Course[] = [
    {
        id: 'phys201',
        code: 'PHYS 201',
        title: 'Physics II',
        grade: 'F',
        status: 'failed',
        semester: 'Spring 2022',
        credits: 4,
        requirementType: 'Core Requirement'
    },
    {
        id: 'math241',
        code: 'MATH 241',
        title: 'Linear Algebra',
        grade: 'W',
        status: 'withdrawn',
        semester: 'Fall 2022',
        credits: 3,
        requirementType: 'Core Requirement'
    }
];
