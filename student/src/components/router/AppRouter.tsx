import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// no lazy loading for auth pages to avoid flickering
const AuthLayout = React.lazy(() => import('@app/components/layouts/AuthLayout/AuthLayout'));
import LoginPage from '@app/pages/LoginPage';

import ForgotPasswordPage from '@app/pages/ForgotPasswordPage';


import MainLayout from '@app/components/layouts/main/MainLayout/MainLayout';
import ProfileLayout from '@app/components/profile/ProfileLayout';

import { withLoading } from '@app/hocs/withLoading.hoc';

import Dashboard from '../../pages/30/Dashboard';
import GraphComponent from '../../pages/30/POS/POS';
import DynamicPOS from '../../pages/30/DyanmicPOS/DynamicPOS';
import CustomizedPOS from '../../pages/30/CustomizedPOS/CustomizedPOS';
import AdvisorsList from '../../pages/30/AdvisorsPage';
import SchedulingTool from '@app/pages/30/SchedulingTool/SchedulingTool';
import Messager from '../../pages/30/Messager/Messager';
import { UserProvider } from '../../Context/UserContext';
import { ProtectedRoute } from './ProtectedLayout';



const ServerErrorPage = React.lazy(() => import('@app/pages/ServerErrorPage'));
const Error404Page = React.lazy(() => import('@app/pages/Error404Page'));
const PersonalInfoPage = React.lazy(() => import('@app/pages/PersonalInfoPage'));
const SecuritySettingsPage = React.lazy(() => import('@app/pages/SecuritySettingsPage'));
const Logout = React.lazy(() => import('./Logout'));

export const NFT_DASHBOARD_PATH = '/';
export const MEDICAL_DASHBOARD_PATH = '/medical-dashboard';


// UI Components


// Maps

const ServerError = withLoading(ServerErrorPage);
const Error404 = withLoading(Error404Page);

// Profile
const PersonalInfo = withLoading(PersonalInfoPage);
const SecuritySettings = withLoading(SecuritySettingsPage);

const AuthLayoutFallback = withLoading(AuthLayout);
const LogoutFallback = withLoading(Logout);

export const AppRouter: React.FC = () => {
    const protectedLayout = (
        <ProtectedRoute>
            <MainLayout />
        </ProtectedRoute>

    );

    return (
        <BrowserRouter>
            <UserProvider>
                <Routes>
                    <Route path={NFT_DASHBOARD_PATH} element={protectedLayout}>
                        <Route index element={<Dashboard />} />
                        <Route path={"/CustomizedPOS"} element={<CustomizedPOS />} />
                        <Route path={"/DynamicPOS"} element={<DynamicPOS />} />
                        <Route path="/POS" element={<GraphComponent />} />
                        <Route path="/Messager/:receiverId" element={<Messager />} />
                        <Route path="/Messager/*" element={<Navigate to="/Messager/1" replace />} />
                        <Route path="/advisors" element={<AdvisorsList />} />
                        <Route path="/Scheduling_Tool" element={< SchedulingTool />} />/
                        <Route path="server-error" element={<ServerError />} />
                        <Route path="404" element={<Error404 />} />
                        <Route path="profile" element={<ProfileLayout />}>
                            <Route path="personal-info" element={<PersonalInfo />} />
                            <Route path="security-settings" element={<SecuritySettings />} />
                        </Route>
                    </Route>
                    <Route path="/auth" element={<AuthLayoutFallback />}>
                        <Route path="login" element={<LoginPage />} />
                        <Route path="forgot-password" element={<ForgotPasswordPage />} />
                    </Route>
                    <Route path="auth/logout" element={<LogoutFallback />} />
                </Routes>
            </UserProvider>
        </BrowserRouter>
    );
};
