// ProtectedRoute.tsx
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useUser } from '../../Context/UserContext';
import { Spin } from 'antd';

export const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { token, loading, initialized } = useUser();
    
    if (!initialized || loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', marginTop: '20%' }}>
                <Spin size="large" tip="Apologies for the wait..."/>
            </div>
        );
    }


    if (!token) {
        return <Navigate to="/auth/login" replace />;
    }


  return <>{children}</>;
};
