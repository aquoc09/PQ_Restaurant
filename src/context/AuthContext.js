import React, { createContext, useContext, useState } from 'react';
import { useAuth } from '../hooks/useAuth';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    // Lấy toàn bộ hàm và giá trị từ hook
    const authFunctions = useAuth();

    // Tạo state để theo dõi trạng thái xác thực
    const [isAuthenticatedState, setIsAuthenticatedState] = useState(authFunctions.isAuthenticated());

    // Hàm giúp buộc cập nhật trạng thái
    const refreshAuthStatus = () => {
        setIsAuthenticatedState(authFunctions.isAuthenticated());
    };

    // Giá trị được cung cấp cho toàn bộ app
    const value = { 
        ...authFunctions, 
        isAuthenticatedState,
        refreshAuthStatus,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuthContext = () => {
    return useContext(AuthContext);
};