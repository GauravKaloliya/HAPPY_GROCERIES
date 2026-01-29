export const SECURITY_CONFIG = {
    SESSION_TIMEOUT: 30 * 60 * 1000,
    MAX_LOGIN_ATTEMPTS: 5,
    LOGIN_ATTEMPT_WINDOW: 15 * 60 * 1000,
    MAX_CONCURRENT_SESSIONS: 2,
    TOKEN_REFRESH_INTERVAL: 25 * 60 * 1000,
    STORAGE_KEY_PREFIX: 'happyGroceries_',
    STORAGE_VERSION: 'v1',
    
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
    
    SQL_INJECTION_PATTERNS: [
        /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|EXECUTE|UNION|DECLARE)\b)/gi,
        /(--|;|\/\*|\*\/|xp_|sp_)/gi,
        /('|"|`|\||&|\^)/gi
    ],
    
    XSS_PATTERNS: [
        /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
        /<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi,
        /javascript:/gi,
        /on\w+\s*=/gi,
        /<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi,
        /<embed\b[^>]*>/gi
    ],
    
    ALLOWED_CATEGORIES: ['Fruits', 'Vegetables', 'Dairy', 'Snacks', 'Beverages']
};

export const TAX_RATE = 0.18;
export const DELIVERY_CHARGE = 25;
export const FREE_DELIVERY_THRESHOLD = 500;