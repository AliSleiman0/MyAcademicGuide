import api from './api';

export interface Advisor {
    userid: number;
    fullname: string;
    email: string;
    image: string;
}

export const getRespectiveAdvisors = async (): Promise<Advisor[]> => {
    try {
        const response = await api.get('/getadvisors');
        return response.data;
    } catch (error:any) {
        const errorMessage = error.response?.data?.message || 'Failed to fetch advisors';
        throw new Error(errorMessage);
    }
};