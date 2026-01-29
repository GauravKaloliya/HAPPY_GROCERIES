import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { authService } from '../services/authService.js';
import { toast } from 'react-toastify';

// Initial state
const initialState = {
    user: null,
    session: null,
    isAuthenticated: false,
    loading: false,
    error: null
};

// Action types
const AuthActionTypes = {
    LOGIN_START: 'LOGIN_START',
    LOGIN_SUCCESS: 'LOGIN_SUCCESS',
    LOGIN_FAILURE: 'LOGIN_FAILURE',
    LOGOUT: 'LOGOUT',
    REGISTER_START: 'REGISTER_START',
    REGISTER_SUCCESS: 'REGISTER_SUCCESS',
    REGISTER_FAILURE: 'REGISTER_FAILURE',
    UPDATE_PROFILE: 'UPDATE_PROFILE',
    EXTEND_SESSION: 'EXTEND_SESSION',
    CLEAR_ERROR: 'CLEAR_ERROR'
};

// Reducer
const authReducer = (state, action) => {
    switch (action.type) {
        case AuthActionTypes.LOGIN_START:
        case AuthActionTypes.REGISTER_START:
            return {
                ...state,
                loading: true,
                error: null
            };

        case AuthActionTypes.LOGIN_SUCCESS:
            return {
                ...state,
                user: action.payload.user,
                session: action.payload.session,
                isAuthenticated: true,
                loading: false,
                error: null
            };

        case AuthActionTypes.REGISTER_SUCCESS:
            return {
                ...state,
                loading: false,
                error: null,
                message: action.payload.message
            };

        case AuthActionTypes.LOGIN_FAILURE:
        case AuthActionTypes.REGISTER_FAILURE:
            return {
                ...state,
                loading: false,
                error: action.payload,
                isAuthenticated: false,
                user: null,
                session: null
            };

        case AuthActionTypes.LOGOUT:
            return {
                ...initialState
            };

        case AuthActionTypes.UPDATE_PROFILE:
            return {
                ...state,
                user: { ...state.user, ...action.payload }
            };

        case AuthActionTypes.EXTEND_SESSION:
            return {
                ...state,
                session: { ...state.session, ...action.payload }
            };

        case AuthActionTypes.CLEAR_ERROR:
            return {
                ...state,
                error: null
            };

        default:
            return state;
    }
};

// Create context
const AuthContext = createContext();

// Provider component
export const AuthProvider = ({ children }) => {
    const [state, dispatch] = useReducer(authReducer, initialState);

    // Initialize auth state on mount
    useEffect(() => {
        const currentUser = authService.getCurrentUser();
        const currentSession = authService.getCurrentSession();

        if (currentUser && currentSession) {
            dispatch({
                type: AuthActionTypes.LOGIN_SUCCESS,
                payload: { user: currentUser, session: currentSession }
            });
        }

        // Set up session timeout monitoring
        const setupSessionTimeout = () => {
            const checkSession = () => {
                const session = authService.getCurrentSession();
                if (!session) {
                    dispatch({ type: AuthActionTypes.LOGOUT });
                    toast.info('Your session has expired. Please login again.');
                }
            };

            // Check every minute
            const interval = setInterval(checkSession, 60000);
            
            return () => clearInterval(interval);
        };

        const cleanup = setupSessionTimeout();
        return cleanup;
    }, []);

    // Login
    const login = async (phone, password) => {
        dispatch({ type: AuthActionTypes.LOGIN_START });

        try {
            const result = await authService.loginUser(phone, password);
            
            if (result.success) {
                dispatch({
                    type: AuthActionTypes.LOGIN_SUCCESS,
                    payload: { user: result.user, session: result.session }
                });
                toast.success(result.message);
                return { success: true };
            } else {
                dispatch({
                    type: AuthActionTypes.LOGIN_FAILURE,
                    payload: result.error
                });
                toast.error(result.error);
                return { success: false, error: result.error };
            }
        } catch (error) {
            const errorMessage = 'An unexpected error occurred';
            dispatch({
                type: AuthActionTypes.LOGIN_FAILURE,
                payload: errorMessage
            });
            toast.error(errorMessage);
            return { success: false, error: errorMessage };
        }
    };

    // Register
    const register = async (name, phone, email, password) => {
        dispatch({ type: AuthActionTypes.REGISTER_START });

        try {
            const result = await authService.registerUser(name, phone, email, password);
            
            if (result.success) {
                dispatch({
                    type: AuthActionTypes.REGISTER_SUCCESS,
                    payload: result
                });
                toast.success(result.message);
                return { success: true };
            } else {
                dispatch({
                    type: AuthActionTypes.REGISTER_FAILURE,
                    payload: result.error
                });
                toast.error(result.error);
                return { success: false, error: result.error };
            }
        } catch (error) {
            const errorMessage = 'An unexpected error occurred';
            dispatch({
                type: AuthActionTypes.REGISTER_FAILURE,
                payload: errorMessage
            });
            toast.error(errorMessage);
            return { success: false, error: errorMessage };
        }
    };

    // Logout
    const logout = () => {
        authService.logoutUser();
        dispatch({ type: AuthActionTypes.LOGOUT });
        toast.info('Logged out successfully');
    };

    // Update profile
    const updateProfile = async (updates) => {
        if (!state.user) return { success: false, error: 'Not authenticated' };

        try {
            const result = authService.updateUserProfile(state.user.id, updates);
            
            if (result.success) {
                dispatch({
                    type: AuthActionTypes.UPDATE_PROFILE,
                    payload: updates
                });
                toast.success(result.message);
                return { success: true };
            } else {
                toast.error(result.error);
                return { success: false, error: result.error };
            }
        } catch (error) {
            const errorMessage = 'Failed to update profile';
            toast.error(errorMessage);
            return { success: false, error: errorMessage };
        }
    };

    // Extend session
    const extendSession = () => {
        const extended = authService.extendSession();
        if (extended) {
            dispatch({
                type: AuthActionTypes.EXTEND_SESSION,
                payload: { lastActivity: new Date().toISOString() }
            });
        }
        return extended;
    };

    // Check password strength
    const checkPasswordStrength = (password) => {
        return authService.checkPasswordStrength(password);
    };

    // Clear error
    const clearError = () => {
        dispatch({ type: AuthActionTypes.CLEAR_ERROR });
    };

    // Add address
    const addAddress = async (address) => {
        if (!state.user) return { success: false, error: 'Not authenticated' };

        try {
            const result = authService.addAddress(state.user.id, address);
            
            if (result.success) {
                dispatch({
                    type: AuthActionTypes.UPDATE_PROFILE,
                    payload: {
                        profile: {
                            ...state.user.profile,
                            addresses: [...(state.user.profile.addresses || []), result.address]
                        }
                    }
                });
                toast.success(result.message);
                return { success: true };
            } else {
                toast.error(result.error);
                return { success: false, error: result.error };
            }
        } catch (error) {
            const errorMessage = 'Failed to add address';
            toast.error(errorMessage);
            return { success: false, error: errorMessage };
        }
    };

    // Value object
    const value = {
        ...state,
        login,
        register,
        logout,
        updateProfile,
        extendSession,
        checkPasswordStrength,
        clearError,
        addAddress
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

// Custom hook
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};