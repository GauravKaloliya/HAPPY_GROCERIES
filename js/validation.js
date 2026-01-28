(function (global) {
    'use strict';

    const cfg = global.SECURITY_CONFIG || {
        PASSWORD_REQUIREMENTS: {
            MIN_LENGTH: 8,
            REQUIRE_UPPERCASE: true,
            REQUIRE_LOWERCASE: true,
            REQUIRE_NUMBER: true,
            REQUIRE_SPECIAL_CHAR: true
        },
        INPUT_LIMITS: {
            NAME_MIN: 3,
            NAME_MAX: 50,
            PHONE_LENGTH: 10,
            EMAIL_MAX: 100,
            ADDRESS_MAX: 200,
            CITY_MAX: 50,
            PRODUCT_ID_MAX: 50,
            MAX_PRICE: 99999.99,
            MAX_QUANTITY: 9999
        },
        ALLOWED_CATEGORIES: ['Fruits', 'Vegetables', 'Dairy', 'Snacks', 'Beverages'],
        MAX_LOGIN_ATTEMPTS: 5,
        LOGIN_ATTEMPT_WINDOW: 15 * 60 * 1000
    };

    const limits = cfg.INPUT_LIMITS;
    const pwdReqs = cfg.PASSWORD_REQUIREMENTS;

    const RATE_LIMIT_KEY = 'happyGroceries_rateLimit';

    function validatePhone(phone) {
        if (!phone || typeof phone !== 'string') return false;
        const cleaned = phone.replace(/\D/g, '');
        if (cleaned.length !== limits.PHONE_LENGTH) return false;
        return /^\d{10}$/.test(cleaned);
    }

    function validateEmail(email) {
        if (!email || typeof email !== 'string') return false;
        if (email.length > limits.EMAIL_MAX) return false;

        const re =
            /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return re.test(String(email).toLowerCase());
    }

    function validatePassword(password, options = {}) {
        const opts = Object.assign({}, pwdReqs, options);
        if (!password || typeof password !== 'string') return false;
        if (password.length < opts.MIN_LENGTH) return false;
        if (opts.REQUIRE_UPPERCASE && !/[A-Z]/.test(password)) return false;
        if (opts.REQUIRE_LOWERCASE && !/[a-z]/.test(password)) return false;
        if (opts.REQUIRE_NUMBER && !/\d/.test(password)) return false;
        if (opts.REQUIRE_SPECIAL_CHAR && !/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password))
            return false;
        return true;
    }

    function getPasswordStrength(password) {
        if (!password) return 'weak';
        if (password.length < pwdReqs.MIN_LENGTH) return 'weak';

        let score = 0;
        if (password.length >= 10) score++;
        if (/[A-Z]/.test(password)) score++;
        if (/[a-z]/.test(password)) score++;
        if (/\d/.test(password)) score++;
        if (/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password)) score++;

        if (score >= 4) return 'strong';
        if (score >= 2) return 'medium';
        return 'weak';
    }

    function validateName(name) {
        if (!name || typeof name !== 'string') return false;
        const trimmed = name.trim();
        if (trimmed.length < limits.NAME_MIN || trimmed.length > limits.NAME_MAX) return false;
        if (!/^[a-zA-Z0-9\s\-]+$/.test(trimmed)) return false;
        return true;
    }

    function validateAddress(address) {
        if (!address || typeof address !== 'string') return false;
        if (address.length > limits.ADDRESS_MAX) return false;
        if (/[<>{}[\]\\]/.test(address)) return false;

        if (global.HGSecurity && global.HGSecurity.detectSQLInjection) {
            if (global.HGSecurity.detectSQLInjection(address)) return false;
        }
        return true;
    }

    function validateCity(city) {
        if (!city || typeof city !== 'string') return false;
        const trimmed = city.trim();
        if (trimmed.length < 2 || trimmed.length > limits.CITY_MAX) return false;
        if (!/^[a-zA-Z0-9\s\-]+$/.test(trimmed)) return false;
        return true;
    }

    function validateProductID(id) {
        if (id === null || id === undefined) return false;
        const str = String(id);
        if (str.length === 0 || str.length > limits.PRODUCT_ID_MAX) return false;
        if (!/^[a-zA-Z0-9_-]+$/.test(str)) return false;
        return true;
    }

    function validatePrice(price) {
        if (price === null || price === undefined) return false;
        const num = Number(price);
        if (isNaN(num)) return false;
        if (num < 0 || num > limits.MAX_PRICE) return false;
        return true;
    }

    function validateQuantity(qty) {
        if (qty === null || qty === undefined) return false;
        const num = parseInt(qty, 10);
        if (isNaN(num)) return false;
        if (!Number.isInteger(num)) return false;
        if (num < 1 || num > limits.MAX_QUANTITY) return false;
        return true;
    }

    function validateWhitelist(value, whitelist) {
        if (!Array.isArray(whitelist)) return false;
        return whitelist.includes(value);
    }

    function validateCategory(category) {
        return validateWhitelist(category, cfg.ALLOWED_CATEGORIES);
    }

    function sanitizeInput(input) {
        if (global.HGSecurity && global.HGSecurity.sanitizeInput) {
            return global.HGSecurity.sanitizeInput(input);
        }
        if (typeof input !== 'string') return input;
        return input
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#x27;')
            .trim();
    }

    function sanitizeOutput(data) {
        if (global.HGSecurity && global.HGSecurity.sanitizeOutput) {
            return global.HGSecurity.sanitizeOutput(data);
        }
        return data;
    }

    function generateCSRFToken() {
        if (global.HGSecurity && global.HGSecurity.generateSessionToken) {
            return global.HGSecurity.generateSessionToken();
        }
        return Date.now().toString(36) + Math.random().toString(36).slice(2);
    }

    function setCSRFToken(token) {
        sessionStorage.setItem('csrf_token', token);
    }

    function getCSRFToken() {
        return sessionStorage.getItem('csrf_token');
    }

    function validateCSRFToken(token) {
        const stored = getCSRFToken();
        return Boolean(stored && token && stored === token);
    }

    function checkRateLimit(action, userId) {
        const now = Date.now();
        const key = `${action}:${userId || 'anon'}`;
        const dataRaw = localStorage.getItem(RATE_LIMIT_KEY);
        const data = dataRaw ? JSON.parse(dataRaw) : {};

        if (!data[key]) {
            data[key] = { attempts: [], blocked: false };
        }

        const record = data[key];

        record.attempts = record.attempts.filter((t) => now - t < cfg.LOGIN_ATTEMPT_WINDOW);

        if (record.attempts.length >= cfg.MAX_LOGIN_ATTEMPTS) {
            record.blocked = true;
            localStorage.setItem(RATE_LIMIT_KEY, JSON.stringify(data));
            return { allowed: false, message: `Too many ${action} attempts. Please wait 15 minutes.` };
        }

        record.attempts.push(now);
        localStorage.setItem(RATE_LIMIT_KEY, JSON.stringify(data));
        return { allowed: true };
    }

    function resetRateLimit(action, userId) {
        const key = `${action}:${userId || 'anon'}`;
        const dataRaw = localStorage.getItem(RATE_LIMIT_KEY);
        const data = dataRaw ? JSON.parse(dataRaw) : {};
        if (data[key]) {
            delete data[key];
            localStorage.setItem(RATE_LIMIT_KEY, JSON.stringify(data));
        }
    }

    const Validation = {
        validatePhone,
        validateEmail,
        validatePassword,
        getPasswordStrength,
        validateName,
        validateAddress,
        validateCity,
        validateProductID,
        validatePrice,
        validateQuantity,
        validateWhitelist,
        validateCategory,
        sanitizeInput,
        sanitizeOutput,
        generateCSRFToken,
        setCSRFToken,
        getCSRFToken,
        validateCSRFToken,
        checkRateLimit,
        resetRateLimit
    };

    global.HGValidation = Validation;

    global.validatePhone = global.validatePhone || Validation.validatePhone;
    global.validateEmail = global.validateEmail || Validation.validateEmail;
    global.validatePassword = global.validatePassword || Validation.validatePassword;
    global.getPasswordStrength = global.getPasswordStrength || Validation.getPasswordStrength;
    global.validateName = global.validateName || Validation.validateName;
})(typeof window !== 'undefined' ? window : globalThis);
