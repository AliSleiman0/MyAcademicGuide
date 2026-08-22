import { AxiosResponse } from "axios";
import api from "./api";

// Interface for individual course input
export interface CourseInput {
    courseid: number;
    coursename: string;
    coursecode: string;
    coursetype: string;
    credits: number;
}

// Interface for schedule request input
export interface ScheduleRequestInput {
    [x: string]: any;
    courseids: CourseInput[];
    semester: string;
    year: string;
}

// Interface for schedule section
export interface Section {
    id: number;
    daysOfWeek: number[];
    days: string;
    startTime: string;
    endTime: string | null;
    instructor: string;
}

// Interface for course schedule output
export interface CourseScheduleOutput {
    courseid: number;
    coursecode: string;
    coursename: string;
    coursetype: string;
    credits: number;
    sections: Section[];
}

export const postCourseSchedule = async (
    data: ScheduleRequestInput
): Promise<CourseScheduleOutput[]> => {
    try {
        const response: AxiosResponse<CourseScheduleOutput[]> = await api.post(
            '/setschedule',
            data
        );
        return response.data;
    } catch (error) {
        if (error) {
            throw new Error(
                'Failed to generate schedule'
            );
        }
        throw new Error('Network error occurred');
    }
};
////smart schedule



export interface Break {
    days: string;        // e.g., "Tue,Wed"
    starttime: string;   // format: "HH:MM"
    endtime: string;     // format: "HH:MM"
    description: string;
}


export interface ScheduledSection {
    id: number;
    days: string; // e.g., "Tue,Thu"
    daysOfWeek: number[]; // e.g., [2, 4]
    startTime: string; // ISO 8601 format: "YYYY-MM-DDTHH:MM:SSZ"
    endTime: string;   // ISO 8601 format: "YYYY-MM-DDTHH:MM:SSZ"
    instructor: string;
    conflictCount: number;
    courseid: number;
    coursecode: string;
    coursename: string;
}
export interface CourseOffering {
    courseid: number;
    coursecode: string;
    coursename: string;
    coursetype: string; // e.g., "Major", "Core", "General Elective"
    credits: number;
    sections: Section[];
}
export interface CourseSchedulePreferences {
    CourseOfferingsPreferencesIDs: CourseOffering[];
    Breaks: Break[];
}
export const GetSmartSchedule = async (
    data: CourseSchedulePreferences
): Promise<ScheduledSection[]> => {
    try {
        const response: AxiosResponse<ScheduledSection[]> = await api.post(
            '/smartschedule',
            data
        );
        return response.data;
    } catch (error) {
        if (error) {
            throw new Error(
                'Failed to generate schedule'
            );
        }
        throw new Error('Network error occurred');
    }
};
