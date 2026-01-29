import CryptoJS from 'crypto-js';
import { secureStorage, validatePhone, validateEmail, validatePassword, validateName, sanitizeInput, generateCSRFToken } from '../utils/security.js';
import { SECURITY_CONFIG } from '../utils/config.js';

const AUTH_STORAGE_KEY = 'users';
const SESSION_STORAGE_KEY = 'session';
const RATE_LIMIT_KEY = 'rate_limit';

class AuthService {
    constructor() {
        this.initializeRateLimiter();
    }

    // Initialize rate limiting
    initializeRateLimiter() {
        this.rateLimit = new Map();
    }

    // Check rate limiting
    checkRateLimit(action, identifier) {
        const key = `${action}_${identifier}`;
        const now = Date.now();
        const windowMs = SECURITY_CONFIG.LOGIN_ATTEMPT_WINDOW;
        const maxAttempts = action === 'register' ? 3 : SECURITY_CONFIG.MAX_LOGIN_ATTEMPTS;

        if (!this.rateLimit.has(key)) {
            this.rateLimit.set(key, []);
        }

        const attempts = this.rateLimit.get(key);
        const validAttempts = attempts.filter(time => now - time < windowMs);
        
        if (validAttempts.length >= maxAttempts) {
            return {
                allowed: false,
                remainingTime: windowMs - (now - validAttempts[0])
            };
        }

        validAttempts.push(now);
        this.rateLimit.set(key, validAttempts);

        return {
            allowed: true,
            remainingAttempts: maxAttempts - validAttempts.length
        };
    }

    // Get all users from secure storage
    getAllUsers() {
        return secureStorage.getItem(AUTH_STORAGE_KEY) || [];
    }

    // Save user to secure storage
    saveUser(user) {
        const users = this.getAllUsers();
        users.push(user);
        secureStorage.setItem(AUTH_STORAGE_KEY, users);
    }

    // Find user by phone
    findUserByPhone(phone) {
        const users = this.getAllUsers();
        return users.find(user => user.phone === phone);
    }

    // Hash password
    hashPassword(password) {
        return CryptoJS.SHA256(password).toString();
    }

    // Validate and sanitize registration data
    validateRegistrationData({ name, phone, email, password }) {
        const sanitizedData = {
            name: sanitizeInput(name),
            phone: sanitizeInput(phone),
            email: sanitizeInput(email || ''),
            password
        };

        if (!validateName(sanitizedData.name)) {
            return { isValid: false, error: 'Name must be 3-50 characters' };
        }

        if (!validatePhone(sanitizedData.phone)) {
            return { isValid: false, error: 'Phone number must be 10 digits' };
        }

        if (sanitizedData.email && !validateEmail(sanitizedData.email)) {
            return { isValid: false, error: 'Invalid email format' };
        }

        if (!validatePassword(sanitizedData.password)) {
            return { isValid: false, error: 'Password must be at least 6 characters' };
        }

        return { isValid: true, data: sanitizedData };
    }

    // Register new user
    async registerUser(name, phone, email, password) {
        // Check rate limiting
        const rateCheck = this.checkRateLimit('register', phone);
        if (!rateCheck.allowed) {
            return { 
                success: false, 
                error: `Too many attempts. Try again in ${Math.ceil(rateCheck.remainingTime / 60000)} minutes` 
            };
        }

        const validation = this.validateRegistrationData({ name, phone, email, password });
        if (!validation.isValid) {
            return { success: false, error: validation.error };
        }

        const { data } = validation;

        // Check if user already exists
        if (this.findUserByPhone(data.phone)) {
            return { success: false, error: 'Phone number already registered' };
        }

        // Create new user
        const newUser = {
            id: Date.now().toString(),
            name: data.name,
            phone: data.phone,
            email: data.email,
            password: this.hashPassword(data.password),
            createdAt: new Date().toISOString(),
            isActive: true,
            profile: {
                wishlist: [],
                addresses: [],
                preferences: {}
            }
        };

        this.saveUser(newUser);

        return { 
            success: true, 
            message: 'Registration successful! Please login.',
            user: { id: newUser.id, name: newUser.name, phone: newUser.phone, email: newUser.email }
        };
    }

    // Login user
    async loginUser(phone, password) {
        // Check rate limiting
        const rateCheck = this.checkRateLimit('login', phone);
        if (!rateCheck.allowed) {
            return { 
                success: false, 
                error: `Too many login attempts. Try again in ${Math.ceil(rateCheck.remainingTime / 60000)} minutes` 
            };
        }

        const sanitizedPhone = sanitizeInput(phone);
        const user = this.findUserByPhone(sanitizedPhone);

        if (!user) {
            return { success: false, error: 'Invalid phone number or password' };
        }

        if (!user.isActive) {
            return { success: false, error: 'Account is deactivated' };
        }

        const hashedPassword = this.hashPassword(password);
        if (user.password !== hashedPassword) {
            return { success: false, error: 'Invalid phone number or password' };
        }

        // Create session
        const session = {
            userId: user.id,
            token: generateCSRFToken(),
            loginTime: new Date().toISOString(),
            lastActivity: new Date().toISOString(),
            expiresAt: new Date(Date.now() + SECURITY_CONFIG.SESSION_TIMEOUT).toISOString()
        };

        secureStorage.setItem(SESSION_STORAGE_KEY, session);

        return {
            success: true,
            message: 'Login successful!',
            user: { 
                id: user.id, 
                name: user.name, 
                phone: user.phone, 
                email: user.email,
                profile: user.profile
            },
            session
        };
    }

    // Logout user
    logoutUser() {
        secureStorage.removeItem(SESSION_STORAGE_KEY);
        return { success: true, message: 'Logged out successfully' };
    }

    // Get current session
    getCurrentSession() {
        const session = secureStorage.getItem(SESSION_STORAGE_KEY);
        if (!session) return null;

        // Check if session is expired
        if (new Date(session.expiresAt) < new Date()) {
            this.logoutUser();
            return null;
        }

        return session;
    }

    // Get current user
    getCurrentUser() {
        const session = this.getCurrentSession();
        if (!session) return null;

        const user = this.findUserByPhone(session.userId);
        return user ? { 
            id: user.id, 
            name: user.name, 
            phone: user.phone, 
            email: user.email,
            profile: user.profile 
        } : null;
    }

    // Check if user is logged in
    isUserLoggedIn() {
        return this.getCurrentSession() !== null;
    }

    // Update user profile
    updateUserProfile(userId, updates) {
        const users = this.getAllUsers();
        const userIndex = users.findIndex(user => user.id === userId);
        
        if (userIndex === -1) {
            return { success: false, error: 'User not found' };
        }

        // Sanitize updates
        const sanitizedUpdates = {};
        if (updates.name) sanitizedUpdates.name = sanitizeInput(updates.name);
        if (updates.email) sanitizedUpdates.email = sanitizeInput(updates.email);
        if (updates.profile) sanitizedUpdates.profile = updates.profile;

        users[userIndex] = { ...users[userIndex], ...sanitizedUpdates };
        secureStorage.setItem(AUTH_STORAGE_KEY, users);

        return { success: true, message: 'Profile updated successfully' };
    }

    // Add address to user profile
    addAddress(userId, address) {
        const users = this.getAllUsers();
        const userIndex = users.findIndex(user => user.id === userId);
        
        if (userIndex === -1) {
            return { success: false, error: 'User not found' };
        }

        const newAddress = {
            id: Date.now().toString(),
            ...address,
            createdAt: new Date().toISOString()
        };

        users[userIndex].profile.addresses.push(newAddress);
        secureStorage.setItem(AUTH_STORAGE_KEY, users);

        return { success: true, message: 'Address added successfully', address: newAddress };
    }

    // Check password strength
    checkPasswordStrength(password) {
        const checks = {
            length: password.length >= 6,
            hasUpper: /[A-Z]/.test(password),
            hasLower: /[a-z]/.test(password),
            hasNumber: /\d/.test(password),
            hasSpecial: /[!@#$%^&*(),.?":{}|<>]/.test(password)
        };

        const score = Object.values(checks).filter(Boolean).length;
        
        let strength = 'Weak';
        let color = '#e74c3c';
        
        if (score >= 4) {
            strength = 'Strong';
            color = '#27ae60';
        } else if (score >= 3) {
            strength = 'Medium';
            color = '#f39c12';
        }

        return { strength, color, checks };
    }

    // Extend session
    extendSession() {
        const session = this.getCurrentSession();
        if (session) {
            const updatedSession = {
                ...session,
                lastActivity: new Date().toISOString(),
                expiresAt: new Date(Date.now() + SECURITY_CONFIG.SESSION_TIMEOUT).toISOString()
            };
            secureStorage.setItem(SESSION_STORAGE_KEY, updatedSession);
            return true;
        }
        return false;
    }
}

export const authService = new AuthService();