import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi } from '../services/api.js';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(() => {
        const cached = localStorage.getItem('nadoda_user');
        if (cached) {
            try {
                return JSON.parse(cached);
            } catch {
                return null;
            }
        }
        return null;
    });

    const [token, setToken] = useState(() => localStorage.getItem('nadoda_token') || null);
    const [loading, setLoading] = useState(false);
    const [initialCheckDone, setInitialCheckDone] = useState(false);

    // Verify session on mount if token exists
    useEffect(() => {
        const verifySession = async () => {
            if (token) {
                try {
                    const res = await authApi.getMe();
                    if (res.success && res.data) {
                        setUser(res.data);
                        localStorage.setItem('nadoda_user', JSON.stringify(res.data));
                    }
                } catch (err) {
                    console.warn('Session expired or invalid, logging out:', err.message);
                    logout();
                }
            }
            setInitialCheckDone(true);
        };

        verifySession();
    }, []);

    const login = async (identifier, password) => {
        setLoading(true);
        try {
            const res = await authApi.login(identifier, password);
            if (res.success && res.token) {
                setToken(res.token);
                setUser(res.data);
                localStorage.setItem('nadoda_token', res.token);
                localStorage.setItem('nadoda_user', JSON.stringify(res.data));
                return res.data;
            }
        } catch (err) {
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const forgotPassword = async (identifier) => {
        setLoading(true);
        try {
            const res = await authApi.forgotPassword(identifier);
            return res;
        } catch (err) {
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const setPassword = async (identifier, otp, newPassword) => {
        setLoading(true);
        try {
            const res = await authApi.setPassword(identifier, otp, newPassword);
            if (res.success && res.token) {
                setToken(res.token);
                setUser(res.data);
                localStorage.setItem('nadoda_token', res.token);
                localStorage.setItem('nadoda_user', JSON.stringify(res.data));
                return res.data;
            }
        } catch (err) {
            throw err;
        } finally {
            setLoading(false);
        }
    };

    // Keep session active with periodic heartbeat every 2 minutes while user is logged in
    useEffect(() => {
        if (!token || !user) return;

        // Immediate ping
        authApi.heartbeat().catch(() => {});

        const intervalId = setInterval(() => {
            authApi.heartbeat().catch(() => {});
        }, 2 * 60 * 1000);

        return () => clearInterval(intervalId);
    }, [token, user]);

    const logout = () => {
        try {
            authApi.logout().catch(() => {});
        } catch {}
        setUser(null);
        setToken(null);
        localStorage.removeItem('nadoda_token');
        localStorage.removeItem('nadoda_user');
    };

    /**
     * Check if current user can manage a specific village
     */
    const canManageVillage = (villageId) => {
        if (!user) return false;
        if (user.role === 'super_admin') return true;
        if (user.role === 'village_admin') {
            const assigned = typeof user.assignedVillageId === 'object' && user.assignedVillageId !== null
                ? user.assignedVillageId._id
                : user.assignedVillageId;
            return String(assigned) === String(villageId);
        }
        return false;
    };

    const isSuperAdmin = user?.role === 'super_admin';
    const isVillageAdmin = user?.role === 'village_admin';

    return (
        <AuthContext.Provider
            value={{
                user,
                token,
                isAuthenticated: Boolean(user && token),
                initialCheckDone,
                loading,
                login,
                forgotPassword,
                setPassword,
                logout,
                canManageVillage,
                isSuperAdmin,
                isVillageAdmin
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
