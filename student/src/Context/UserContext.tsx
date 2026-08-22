import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {  UpdatePasswordInput, AddImageInput, logout, showProfile, addImage, deleteImage, resetPassword, LoginResponse, login, UserProfile } from '../apiMAG/user';
import { setAuthToken } from '../apiMAG/api';
import { LoginFormData } from '../components/auth/LoginForm/LoginForm';

interface UserContextState {
    token: string | null;
    usertype: string | null;
    department:string | null
    profile: UserProfile | null;
    loading: boolean;
    error: string | null;
    initialized: boolean;
    loginUser: (credentials: LoginFormData) => Promise<LoginResponse>;
    logoutUser: () => Promise<void>;
    refreshProfile: () => Promise<void>;
    updatePassword: (input: UpdatePasswordInput) => Promise<string>;
    uploadImage: (input: string) => Promise<string>;
    removeImage: () => Promise<string>;
}

const UserContext = createContext<UserContextState | undefined>(undefined);

interface UserProviderProps {
    children: ReactNode;
}

export const UserProvider: React.FC<UserProviderProps> = ({ children }) => {
    const [token, setToken] = useState<string | null>(null);
    const [usertype, setUsertype] = useState<string | null>(null);
    const [department, setDepartment] = useState<string | null>(null);
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [initialized, setInitialized] = useState(false);
    const [userId, setUserId] = useState<string | null>(null);
    const [rememberMe, setRememberMe] = useState<boolean>(false);
    const loginUser = async (credentials: LoginFormData): Promise<LoginResponse> => {
        setLoading(true);
        setError(null);
        try {
            const data: LoginResponse = await login({
                userid: credentials.userid,
                password: credentials.password
            });

            // Update state
            setUserId(String(credentials.userid));
            setToken(data.token);
            setUsertype(data.usertype);
            setAuthToken(data.token);
            setRememberMe(credentials.rememberMe);
           
            // Persist credentials and rememberMe choice
            if (credentials.rememberMe) {
                localStorage.setItem('rememberMe', 'true');
                localStorage.setItem('authToken', data.token);
                localStorage.setItem('userId', String(credentials.userid));
                localStorage.setItem('authUsertype', data.usertype);
            } else {
                sessionStorage.setItem('rememberMe', 'false');
                sessionStorage.setItem('authToken', data.token);
                sessionStorage.setItem('userId', String(credentials.userid));
                sessionStorage.setItem('authUsertype', data.usertype);
            }

            await refreshProfile();
            return data;
        } catch (err: any) {
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const logoutUser = async () => {
        setLoading(true);
        setError(null);
        try {
            await logout();
            // Clear all storage
            localStorage.removeItem('authToken');
            localStorage.removeItem('userId');
            localStorage.removeItem('authUsertype');
            localStorage.removeItem('rememberMe');
            sessionStorage.removeItem('authToken');
            sessionStorage.removeItem('userId');
            sessionStorage.removeItem('authUsertype');
            sessionStorage.removeItem('rememberMe');

            // Reset state
            setAuthToken(null);
            setToken(null);
            setProfile(null);
            setUsertype(null);
            setUserId(null);
            setRememberMe(false);
        } catch (err: any) {
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    };


    const refreshProfile = async () => {
        setLoading(true);
        setError(null);
        try {
            const data: UserProfile = await showProfile();
            setProfile(data);
            setDepartment(data.department)
        } catch (err: any) {
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const updatePassword = async (input: UpdatePasswordInput): Promise<string> => {
        setLoading(true);
        setError(null);
        try {
            const res = await resetPassword(input, Number(userId));
            return res ?? 'Error';
        } catch (err: any) {
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const uploadImage = async (input: string): Promise<string> => {
        setLoading(true);
        setError(null);
        try {
            const res = await addImage({ image: input }, Number(userId));
            await refreshProfile();
            return res ?? 'Error';
        } catch (err: any) {
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const removeImage = async (): Promise<string> => {
        setLoading(true);
        setError(null);
        try {
            const res = await deleteImage(Number(userId));
            await refreshProfile();
            return res ?? 'Error';
        } catch (err: any) {
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const loadFromStorage = () => {
            const remember = localStorage.getItem('rememberMe') === 'true';
            setRememberMe(remember);

            const storage = remember ? localStorage : sessionStorage;
            const storedToken = storage.getItem('authToken');
            const storedUserId = storage.getItem('userId');
            const storedUsertype = storage.getItem('authUsertype');

            if (storedToken) {
                setAuthToken(storedToken);
                setUserId(storedUserId);
                setToken(storedToken);
                setUsertype(storedUsertype);
                refreshProfile().catch(() => { });
            }
            setInitialized(true);
        };

        loadFromStorage();
    }, []);

    // Persist state changes to storage
    useEffect(() => {
        if (!token) return;

        const storage = rememberMe ? localStorage : sessionStorage;
        storage.setItem('authToken', token);
        if (userId) storage.setItem('userId', userId);
        if (usertype) storage.setItem('authUsertype', usertype);
    }, [token, userId, usertype, rememberMe]);

    return (
        <UserContext.Provider
            value={{
                token,
                department,
                usertype,
                profile,
                loading,
                error,
                loginUser,
                logoutUser,
                refreshProfile,
                updatePassword,
                uploadImage,
                removeImage,
                initialized,
            }}
        >
            {children}
        </UserContext.Provider>
    );
};

export const useUser = (): UserContextState => {
    const context = useContext(UserContext);
    if (!context) {
        throw new Error('useUser must be used within a UserProvider');
    }
    return context;
};