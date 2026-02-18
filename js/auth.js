const AUTH_STORAGE_KEY = 'happyGroceries_users';
const SESSION_STORAGE_KEY = 'happyGroceries_session';
const TOKEN_STORAGE_KEY = 'happyGroceries_access_token';

// API base URL - adjust based on your backend deployment
const API_BASE_URL = window.location.hostname === 'localhost'
    ? 'http://localhost:8000'
    : 'https://your-production-api.com';

function hashPasswordLegacy(password) {
    let hash = 0;
    for (let i = 0; i < password.length; i++) {
        const char = password.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
    }
    return hash.toString(36);
}

function checkPasswordHashFormat(storedPassword) {
    if (typeof storedPassword !== 'string') return null;
    if (storedPassword.startsWith('sha256$')) return 'secure';
    return 'legacy';
}

function getAllUsers() {
    const users = localStorage.getItem(AUTH_STORAGE_KEY);
    return users ? JSON.parse(users) : [];
}

function saveUser(user) {
    const users = getAllUsers();
    users.push(user);
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(users));
}

function findUserByPhone(phone) {
    const users = getAllUsers();
    return users.find(user => user.phone === phone);
}

function validatePhone(phone) {
    if (typeof HGValidation !== 'undefined' && HGValidation.validatePhone) {
        return HGValidation.validatePhone(phone);
    }
    const phoneRegex = /^\d{10}$/;
    return phoneRegex.test(phone);
}

function validateEmail(email) {
    if (!email) return true;
    if (typeof HGValidation !== 'undefined' && HGValidation.validateEmail) {
        return HGValidation.validateEmail(email);
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function validatePassword(password, options) {
    // Use lenient validation for Happy Groceries (6 chars minimum)
    // Ignore strict security config requirements for user-friendly experience
    return password && password.length >= 6;
}

function validateName(name) {
    if (typeof HGValidation !== 'undefined' && HGValidation.validateName) {
        return HGValidation.validateName(name);
    }
    return name && name.length >= 3;
}

// Get stored access token
function getAccessToken() {
    return localStorage.getItem(TOKEN_STORAGE_KEY);
}

// Set access token
function setAccessToken(token) {
    if (token) {
        localStorage.setItem(TOKEN_STORAGE_KEY, token);
    } else {
        localStorage.removeItem(TOKEN_STORAGE_KEY);
    }
}

// Register user via backend API
async function registerUser(name, phone, email, password) {
    // Frontend validation - check required fields first
    if (!name || !phone || !password) {
        return { success: false, error: 'Name, phone, and password are required' };
    }

    const safeName = (typeof HGValidation !== 'undefined' && HGValidation.sanitizeInput) ? HGValidation.sanitizeInput(name) : (name || '').trim();
    const safeEmail = (typeof HGValidation !== 'undefined' && HGValidation.sanitizeInput) ? HGValidation.sanitizeInput(email || '') : (email || '').trim();
    const safePhone = (phone || '').replace(/\D/g, '');

    if (!validateName(safeName)) {
        return { success: false, error: 'Name must be 3-50 characters and contain only letters, numbers, and spaces' };
    }

    if (!validatePhone(safePhone)) {
        return { success: false, error: 'Phone number must be exactly 10 digits' };
    }

    if (safeEmail && !validateEmail(safeEmail)) {
        return { success: false, error: 'Please enter a valid email address (e.g., user@example.com)' };
    }

    if (!validatePassword(password)) {
        return { success: false, error: 'Password must be at least 6 characters long' };
    }

    try {
        // Call backend API for registration
        const response = await fetch(`${API_BASE_URL}/api/auth/register/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                name: safeName,
                phone: safePhone,
                email: safeEmail || '',
                password: password
            })
        });

        const data = await response.json();

        if (!response.ok) {
            // Handle specific error messages from backend
            if (data.phone) {
                return { success: false, error: 'This phone number is already registered. Please login instead.' };
            }
            if (data.error) {
                return { success: false, error: data.error };
            }
            return { success: false, error: 'Registration failed. Please try again.' };
        }

        // Store user data and tokens
        const user = {
            id: data.user.id,
            name: data.user.name,
            phone: data.user.phone,
            email: data.user.email || '',
            createdAt: new Date().toISOString(),
            orders: [],
            wishlist: []
        };

        // Also save to localStorage for offline compatibility
        saveUser(user);

        // Store tokens
        if (data.access_token) {
            setAccessToken(data.access_token);
        }

        // Create session
        createSession(user);

        // Merge guest cart with new user if exists
        if (typeof mergeGuestCartWithUser === 'function') {
            mergeGuestCartWithUser();
        }

        return { success: true, user };
    } catch (error) {
        console.error('Registration error:', error);
        // Fallback to localStorage-based auth if backend is unavailable
        return registerUserLocal(safeName, safePhone, safeEmail, password);
    }
}

// Local fallback registration (when backend is unavailable)
function registerUserLocal(name, phone, email, password) {
    if (findUserByPhone(phone)) {
        return { success: false, error: 'This phone number is already registered. Please login instead.' };
    }

    const hashedPassword = (typeof HGSecurity !== 'undefined' && HGSecurity.hashPassword)
        ? HGSecurity.hashPassword(password)
        : hashPasswordLegacy(password);

    const user = {
        id: Date.now().toString(),
        name: name,
        phone: phone,
        email: email || '',
        password: hashedPassword,
        createdAt: new Date().toISOString(),
        orders: [],
        wishlist: []
    };

    saveUser(user);
    createSession(user);

    if (typeof mergeGuestCartWithUser === 'function') {
        mergeGuestCartWithUser();
    }

    return { success: true, user };
}

// Login user via backend API
async function loginUser(phone, password) {
    // Frontend validation
    if (!phone || !password) {
        return { success: false, error: 'Phone and password are required' };
    }

    if (!validatePhone(phone)) {
        return { success: false, error: 'Invalid phone number. Must be 10 digits.' };
    }

    try {
        // Call backend API for login
        const response = await fetch(`${API_BASE_URL}/api/auth/login/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include', // Include cookies for refresh token
            body: JSON.stringify({
                phone: phone,
                password: password
            })
        });

        const data = await response.json();

        if (!response.ok) {
            if (data.error) {
                return { success: false, error: data.error };
            }
            return { success: false, error: 'Invalid credentials' };
        }

        // Store user data and tokens
        const user = {
            id: data.user.id,
            name: data.user.name,
            phone: data.user.phone,
            email: data.user.email || '',
            createdAt: data.user.date_joined || new Date().toISOString(),
            orders: [],
            wishlist: []
        };

        // Save user to localStorage for compatibility
        const existingUsers = getAllUsers();
        const existingIndex = existingUsers.findIndex(u => u.phone === user.phone);
        if (existingIndex >= 0) {
            existingUsers[existingIndex] = { ...existingUsers[existingIndex], ...user };
        } else {
            existingUsers.push(user);
        }
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(existingUsers));

        // Store access token
        if (data.access_token) {
            setAccessToken(data.access_token);
        }

        // Create session
        createSession(user);

        // Merge guest cart with user if exists
        if (typeof mergeGuestCartWithUser === 'function') {
            mergeGuestCartWithUser();
        }

        return { success: true, user };
    } catch (error) {
        console.error('Login error:', error);
        // Fallback to localStorage-based auth if backend is unavailable
        return loginUserLocal(phone, password);
    }
}

// Local fallback login (when backend is unavailable)
function loginUserLocal(phone, password) {
    const user = findUserByPhone(phone);
    if (!user) {
        return { success: false, error: 'User not found' };
    }

    const hashFormat = checkPasswordHashFormat(user.password);
    let passwordMatch = false;

    if (hashFormat === 'secure' && typeof HGSecurity !== 'undefined' && HGSecurity.verifyPassword) {
        passwordMatch = HGSecurity.verifyPassword(password, user.password);
    } else if (hashFormat === 'legacy') {
        passwordMatch = user.password === hashPasswordLegacy(password);

        if (passwordMatch && typeof HGSecurity !== 'undefined' && HGSecurity.hashPassword) {
            user.password = HGSecurity.hashPassword(password);
            const users = getAllUsers();
            const userIndex = users.findIndex(u => u.id === user.id);
            if (userIndex !== -1) {
                users[userIndex] = user;
                localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(users));
            }
        }
    }

    if (!passwordMatch) {
        return { success: false, error: 'Invalid password' };
    }

    createSession(user);

    if (typeof mergeGuestCartWithUser === 'function') {
        mergeGuestCartWithUser();
    }

    return { success: true, user };
}

// Logout user via backend API
async function logoutUser() {
    try {
        const accessToken = getAccessToken();

        // Call backend logout API
        const response = await fetch(`${API_BASE_URL}/api/auth/logout/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${accessToken}`
            },
            credentials: 'include'
        });

        // Clear local session regardless of API response
        clearLocalSession();

    } catch (error) {
        console.error('Logout error:', error);
        // Still clear local session on error
        clearLocalSession();
    }
}

// Clear local session data
function clearLocalSession() {
    if (typeof HGSession !== 'undefined' && HGSession.endSession) {
        HGSession.endSession();
    } else {
        localStorage.removeItem(SESSION_STORAGE_KEY);
    }

    // Clear access token
    setAccessToken(null);

    // Determine correct redirect path based on current location
    const currentPath = window.location.pathname;
    const inPagesDir = currentPath.includes('/pages/');
    window.location.href = inPagesDir ? '../index.html' : 'index.html';
}

function createSession(user) {
    const session = {
        userId: user.id,
        name: user.name,
        phone: user.phone,
        email: user.email,
        loginTime: new Date().toISOString()
    };
    localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
}

function getCurrentUser() {
    if (typeof HGSession !== 'undefined' && HGSession.validateSession) {
        if (!HGSession.validateSession()) {
            return null;
        }
    }

    const session = localStorage.getItem(SESSION_STORAGE_KEY);
    if (!session) return null;

    const sessionData = JSON.parse(session);
    const users = getAllUsers();
    return users.find(user => user.id === sessionData.userId);
}

function isUserLoggedIn() {
    if (typeof HGSession !== 'undefined' && HGSession.validateSession) {
        return HGSession.validateSession();
    }
    return getCurrentUser() !== null;
}

function getPasswordStrength(password) {
    if (typeof HGValidation !== 'undefined' && HGValidation.getPasswordStrength) {
        return HGValidation.getPasswordStrength(password);
    }
    if (password.length < 6) return 'weak';
    if (password.length < 10) return 'medium';
    return 'strong';
}

function updateUserWishlist(productId, add = true) {
    const user = getCurrentUser();
    if (!user) return false;

    if (add) {
        if (!user.wishlist.includes(productId)) {
            user.wishlist.push(productId);
        }
    } else {
        user.wishlist = user.wishlist.filter(id => id !== productId);
    }

    const users = getAllUsers();
    const userIndex = users.findIndex(u => u.id === user.id);
    users[userIndex] = user;
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(users));

    return true;
}

function isInWishlist(productId) {
    const user = getCurrentUser();
    if (!user) return false;
    return user.wishlist.includes(productId);
}

function addOrder(order) {
    const user = getCurrentUser();
    if (!user) return false;

    order.id = 'ORD-' + Date.now();
    order.date = new Date().toISOString();
    order.status = 'processing';

    const cart = order.items || [];
    const isExpress = order.delivery > 0 && order.delivery === getDeliveryCharge().express;
    const deliveryMinutes = calculateDeliveryMinutes(cart, isExpress);
    const deliveryTime = formatDeliveryTime(deliveryMinutes);

    order.estimatedDelivery = isExpress ?
        `Express delivery: ${deliveryMinutes} minutes (by ${deliveryTime})` :
        `Standard delivery: ${deliveryMinutes} minutes (by ${deliveryTime})`;

    const appliedCoupon = getAppliedCoupon();
    if (appliedCoupon) {
        markCouponAsUsed(appliedCoupon.code);
    }

    user.orders.push(order);

    const users = getAllUsers();
    const userIndex = users.findIndex(u => u.id === user.id);
    users[userIndex] = user;
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(users));

    return order;
}

function updateUserProfile(updates) {
    const user = getCurrentUser();
    if (!user) return false;

    const users = getAllUsers();
    const userIndex = users.findIndex(u => u.id === user.id);

    if (userIndex !== -1) {
        Object.assign(users[userIndex], updates);
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(users));
        return true;
    }

    return false;
}

// Make API request with automatic token refresh
async function apiRequest(url, options = {}) {
    const accessToken = getAccessToken();

    const defaultOptions = {
        headers: {
            'Content-Type': 'application/json',
            ...(accessToken && { 'Authorization': `Bearer ${accessToken}` })
        },
        credentials: 'include'
    };

    const mergedOptions = {
        ...defaultOptions,
        ...options,
        headers: {
            ...defaultOptions.headers,
            ...options.headers
        }
    };

    try {
        let response = await fetch(url, mergedOptions);

        // If token expired, try to refresh
        if (response.status === 401) {
            const refreshed = await refreshToken();
            if (refreshed) {
                // Retry with new token
                mergedOptions.headers['Authorization'] = `Bearer ${getAccessToken()}`;
                response = await fetch(url, mergedOptions);
            } else {
                // Refresh failed, logout user
                clearLocalSession();
                return null;
            }
        }

        return response;
    } catch (error) {
        console.error('API request error:', error);
        throw error;
    }
}

// Refresh access token using refresh token cookie
async function refreshToken() {
    try {
        const response = await fetch(`${API_BASE_URL}/api/auth/refresh/`, {
            method: 'POST',
            credentials: 'include'
        });

        if (response.ok) {
            const data = await response.json();
            if (data.access_token) {
                setAccessToken(data.access_token);
                return true;
            }
        }
        return false;
    } catch (error) {
        console.error('Token refresh error:', error);
        return false;
    }
}
