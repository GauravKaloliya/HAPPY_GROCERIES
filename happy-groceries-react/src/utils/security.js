import CryptoJS from 'crypto-js';

// XOR encryption for localStorage obfuscation
export const XOR_KEY = 'happyGroceries2024';

export const encryptData = (data) => {
    try {
        const jsonString = JSON.stringify(data);
        return CryptoJS.AES.encrypt(jsonString, XOR_KEY).toString();
    } catch (error) {
        console.error('Encryption error:', error);
        return null;
    }
};

export const decryptData = (encryptedData) => {
    try {
        const bytes = CryptoJS.AES.decrypt(encryptedData, XOR_KEY);
        const decryptedString = bytes.toString(CryptoJS.enc.Utf8);
        return JSON.parse(decryptedString);
    } catch (error) {
        console.error('Decryption error:', error);
        return null;
    }
};

// Secure localStorage operations
export const secureStorage = {
    setItem: (key, value) => {
        try {
            const encrypted = encryptData(value);
            if (encrypted) {
                localStorage.setItem(`happyGroceries_${key}`, encrypted);
                return true;
            }
            return false;
        } catch (error) {
            console.error('Secure storage set error:', error);
            return false;
        }
    },

    getItem: (key) => {
        try {
            const encrypted = localStorage.getItem(`happyGroceries_${key}`);
            if (encrypted) {
                return decryptData(encrypted);
            }
            return null;
        } catch (error) {
            console.error('Secure storage get error:', error);
            return null;
        }
    },

    removeItem: (key) => {
        try {
            localStorage.removeItem(`happyGroceries_${key}`);
            return true;
        } catch (error) {
            console.error('Secure storage remove error:', error);
            return false;
        }
    }
};

// Password hashing using SHA-256
export const hashPassword = (password) => {
    return CryptoJS.SHA256(password).toString();
};

// Input sanitization
export const sanitizeInput = (input) => {
    if (typeof input !== 'string') return '';
    
    return input
        .replace(/[<>]/g, '') // Remove < and >
        .replace(/javascript:/gi, '') // Remove javascript: protocol
        .replace(/on\w+\s*=/gi, '') // Remove event handlers
        .trim();
};

// XSS protection
export const isXSSSafe = (input) => {
    const xssPatterns = [
        /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
        /<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi,
        /javascript:/gi,
        /on\w+\s*=/gi,
        /<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi,
        /<embed\b[^>]*>/gi
    ];

    return !xssPatterns.some(pattern => pattern.test(input));
};

// CSRF token generation
export const generateCSRFToken = () => {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
};

// Validate phone number
export const validatePhone = (phone) => {
    const phoneRegex = /^\d{10}$/;
    return phoneRegex.test(phone);
};

// Validate email
export const validateEmail = (email) => {
    if (!email) return true; // Email is optional
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

// Validate password (lenient 6 chars for user-friendliness)
export const validatePassword = (password) => {
    return password && password.length >= 6;
};

// Validate name
export const validateName = (name) => {
    return name && name.length >= 3 && name.length <= 50;
};

// Generate unique ID
export const generateUniqueId = () => {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

// Rate limiting
export const createRateLimiter = (maxAttempts, windowMs) => {
    const attempts = new Map();

    return {
        check: (key) => {
            const now = Date.now();
            const windowStart = now - windowMs;
            
            if (!attempts.has(key)) {
                attempts.set(key, []);
            }
            
            const userAttempts = attempts.get(key);
            
            // Remove old attempts outside the window
            const validAttempts = userAttempts.filter(time => time > windowStart);
            attempts.set(key, validAttempts);
            
            if (validAttempts.length >= maxAttempts) {
                return {
                    allowed: false,
                    remainingTime: windowMs - (now - validAttempts[0])
                };
            }
            
            // Add current attempt
            validAttempts.push(now);
            attempts.set(key, validAttempts);
            
            return {
                allowed: true,
                remainingAttempts: maxAttempts - validAttempts.length
            };
        }
    };
};

// Session timeout tracking
export const createSessionManager = (timeoutMs) => {
    let timeoutId;
    let lastActivity = Date.now();

    const updateActivity = () => {
        lastActivity = Date.now();
        resetTimeout();
    };

    const resetTimeout = () => {
        if (timeoutId) {
            clearTimeout(timeoutId);
        }
        
        timeoutId = setTimeout(() => {
            if (Date.now() - lastActivity >= timeoutMs) {
                // Session expired
                window.dispatchEvent(new CustomEvent('sessionExpired'));
            }
        }, timeoutMs);
    };

    const isExpired = () => {
        return Date.now() - lastActivity >= timeoutMs;
    };

    const getTimeRemaining = () => {
        const elapsed = Date.now() - lastActivity;
        return Math.max(0, timeoutMs - elapsed);
    };

    // Set up activity listeners
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
    events.forEach(event => {
        document.addEventListener(event, updateActivity, true);
    });

    return {
        isExpired,
        getTimeRemaining,
        updateActivity,
        destroy: () => {
            if (timeoutId) {
                clearTimeout(timeoutId);
            }
            events.forEach(event => {
                document.removeEventListener(event, updateActivity, true);
            });
        }
    };
};