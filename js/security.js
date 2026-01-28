(function (global) {
    'use strict';

    // NOTE: This project is front-end only (localStorage). These utilities focus on:
    // - safer serialization
    // - basic tamper detection (checksums)
    // - TTL-based expiry
    // - input/output sanitization
    // - cryptographically strong token generation when available

    const cfg = global.SECURITY_CONFIG || {
        STORAGE_KEY_PREFIX: 'happyGroceries_',
        STORAGE_VERSION: 'v1',
        XSS_PATTERNS: [],
        SQL_INJECTION_PATTERNS: []
    };

    const STORAGE_PREFIX = `${cfg.STORAGE_KEY_PREFIX}${cfg.STORAGE_VERSION}_`;

    // --- Encoding helpers (base64 as an intermediate layer before localStorage) ---
    function base64Encode(str) {
        return btoa(unescape(encodeURIComponent(str)));
    }

    function base64Decode(str) {
        return decodeURIComponent(escape(atob(str)));
    }

    // --- SHA-256 (synchronous) ---
    // A compact SHA-256 implementation to avoid async crypto.subtle.digest() changes to existing code.
    function sha256(ascii) {
        function rightRotate(value, amount) {
            return (value >>> amount) | (value << (32 - amount));
        }

        const mathPow = Math.pow;
        const maxWord = mathPow(2, 32);
        let result = '';

        const words = [];
        const asciiBitLength = ascii.length * 8;

        let hash = sha256.h || [];
        let k = sha256.k || [];
        let primeCounter = k.length;

        const isComposite = {};
        for (let candidate = 2; primeCounter < 64; candidate++) {
            if (!isComposite[candidate]) {
                for (let i = 0; i < 313; i += candidate) {
                    isComposite[i] = candidate;
                }
                hash[primeCounter] = (mathPow(candidate, 0.5) * maxWord) | 0;
                k[primeCounter++] = (mathPow(candidate, 1 / 3) * maxWord) | 0;
            }
        }

        sha256.h = hash;
        sha256.k = k;

        ascii += '\x80';
        while ((ascii.length % 64) - 56) ascii += '\x00';

        for (let i = 0; i < ascii.length; i++) {
            const j = ascii.charCodeAt(i);
            words[i >> 2] |= j << (((3 - i) % 4) * 8);
        }
        words[words.length] = (asciiBitLength / maxWord) | 0;
        words[words.length] = asciiBitLength;

        for (let j = 0; j < words.length;) {
            const w = words.slice(j, (j += 16));
            const oldHash = hash.slice(0);

            for (let i = 0; i < 64; i++) {
                const w15 = w[i - 15];
                const w2 = w[i - 2];

                const a = hash[0];
                const e = hash[4];

                const temp1 =
                    hash[7] +
                    (rightRotate(e, 6) ^ rightRotate(e, 11) ^ rightRotate(e, 25)) +
                    ((e & hash[5]) ^ (~e & hash[6])) +
                    k[i] +
                    (w[i] =
                        i < 16
                            ? w[i]
                            : (w[i - 16] +
                                  (rightRotate(w15, 7) ^ rightRotate(w15, 18) ^ (w15 >>> 3)) +
                                  w[i - 7] +
                                  (rightRotate(w2, 17) ^ rightRotate(w2, 19) ^ (w2 >>> 10))) |
                              0);

                const temp2 =
                    (rightRotate(a, 2) ^ rightRotate(a, 13) ^ rightRotate(a, 22)) +
                    ((a & hash[1]) ^ (a & hash[2]) ^ (hash[1] & hash[2]));

                hash = [(temp1 + temp2) | 0].concat(hash);
                hash[4] = (hash[4] + temp1) | 0;
                hash.pop();
            }

            for (let i = 0; i < 8; i++) {
                hash[i] = (hash[i] + oldHash[i]) | 0;
            }
        }

        for (let i = 0; i < 8; i++) {
            for (let j = 3; j + 1; j--) {
                const b = (hash[i] >> (j * 8)) & 255;
                result += (b < 16 ? '0' : '') + b.toString(16);
            }
        }
        return result;
    }

    function randomHex(bytes = 32) {
        if (global.crypto && global.crypto.getRandomValues) {
            const buf = new Uint8Array(bytes);
            global.crypto.getRandomValues(buf);
            return Array.from(buf, (b) => b.toString(16).padStart(2, '0')).join('');
        }
        return `${Date.now().toString(16)}${Math.random().toString(16).slice(2)}`;
    }

    // --- Password hashing ---
    // Stored format: sha256$<salt>$<hash>
    function hashPassword(password) {
        const salt = randomHex(16);
        const digest = sha256(`${salt}:${password}`);
        return `sha256$${salt}$${digest}`;
    }

    function verifyPassword(password, stored) {
        if (!stored || typeof stored !== 'string') return false;
        const parts = stored.split('$');
        if (parts.length !== 3) return false;
        const [algo, salt, digest] = parts;
        if (algo !== 'sha256') return false;
        return sha256(`${salt}:${password}`) === digest;
    }

    // --- Lightweight encryption wrapper ---
    // NOTE: Without a backend secret, this is "obfuscation" rather than true secrecy.
    // We still implement reversible encryption to avoid plain-text localStorage.
    function xorCrypt(input, key) {
        let out = '';
        for (let i = 0; i < input.length; i++) {
            out += String.fromCharCode(input.charCodeAt(i) ^ key.charCodeAt(i % key.length));
        }
        return out;
    }

    function encryptData(data, key) {
        const raw = typeof data === 'string' ? data : JSON.stringify(data);
        const k = key || `${cfg.STORAGE_KEY_PREFIX}${cfg.STORAGE_VERSION}`;
        return base64Encode(xorCrypt(raw, k));
    }

    function decryptData(encryptedData, key) {
        try {
            const k = key || `${cfg.STORAGE_KEY_PREFIX}${cfg.STORAGE_VERSION}`;
            const raw = xorCrypt(base64Decode(encryptedData), k);
            try {
                return JSON.parse(raw);
            } catch {
                return raw;
            }
        } catch {
            return null;
        }
    }

    function generateChecksum(value) {
        const raw = typeof value === 'string' ? value : JSON.stringify(value);
        return sha256(raw).slice(0, 16);
    }

    // --- Sanitization ---
    function escapeHtml(str) {
        return str
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#x27;');
    }

    function sanitizeString(input) {
        if (typeof input !== 'string') return input;

        let s = input;
        (cfg.XSS_PATTERNS || []).forEach((re) => {
            try {
                s = s.replace(re, '');
            } catch {
                // ignore
            }
        });
        return escapeHtml(s.trim());
    }

    function sanitizeData(value, depth = 0) {
        if (depth > 10) return null;
        if (value === null || value === undefined) return value;
        if (typeof value === 'string') return sanitizeString(value);
        if (typeof value === 'number' || typeof value === 'boolean') return value;
        if (Array.isArray(value)) return value.map((v) => sanitizeData(v, depth + 1));
        if (typeof value === 'object') {
            const out = {};
            Object.keys(value).forEach((k) => {
                out[sanitizeString(k)] = sanitizeData(value[k], depth + 1);
            });
            return out;
        }
        return null;
    }

    function detectSQLInjection(input) {
        if (typeof input !== 'string') return false;
        return (cfg.SQL_INJECTION_PATTERNS || []).some((re) => re.test(input));
    }

    // --- Secure localStorage wrapper ---
    function wrapValue(value, ttlMs) {
        const sanitized = sanitizeData(value);
        const payload = {
            v: cfg.STORAGE_VERSION,
            ts: Date.now(),
            exp: typeof ttlMs === 'number' ? Date.now() + ttlMs : null,
            data: sanitized
        };
        payload.checksum = generateChecksum(payload.data);
        return payload;
    }

    function validateStorageIntegrity(key) {
        const item = getSecureItem(key, { skipSanitize: true });
        return item !== null;
    }

    function setSecureItem(key, value, ttlMs) {
        try {
            const payload = wrapValue(value, ttlMs);
            const encrypted = encryptData(payload);
            localStorage.setItem(`${STORAGE_PREFIX}${key}`, encrypted);
            return true;
        } catch {
            return false;
        }
    }

    function getSecureItem(key, opts = {}) {
        try {
            const raw = localStorage.getItem(`${STORAGE_PREFIX}${key}`);
            if (!raw) return null;

            const payload = decryptData(raw);
            if (!payload || payload.v !== cfg.STORAGE_VERSION) {
                localStorage.removeItem(`${STORAGE_PREFIX}${key}`);
                return null;
            }

            if (payload.exp && Date.now() > payload.exp) {
                localStorage.removeItem(`${STORAGE_PREFIX}${key}`);
                return null;
            }

            const expected = generateChecksum(payload.data);
            if (payload.checksum !== expected) {
                localStorage.removeItem(`${STORAGE_PREFIX}${key}`);
                return null;
            }

            return opts.skipSanitize ? payload.data : sanitizeData(payload.data);
        } catch {
            return null;
        }
    }

    function removeSecureItem(key) {
        localStorage.removeItem(`${STORAGE_PREFIX}${key}`);
    }

    function clearExpiredData() {
        const toRemove = [];
        for (let i = 0; i < localStorage.length; i++) {
            const k = localStorage.key(i);
            if (!k || !k.startsWith(STORAGE_PREFIX)) continue;

            const raw = localStorage.getItem(k);
            const payload = raw ? decryptData(raw) : null;

            if (!payload || payload.v !== cfg.STORAGE_VERSION) {
                toRemove.push(k);
                continue;
            }

            if (payload.exp && Date.now() > payload.exp) {
                toRemove.push(k);
            }
        }

        toRemove.forEach((k) => localStorage.removeItem(k));
        return toRemove.length;
    }

    function generateSessionToken() {
        return randomHex(32);
    }

    const Security = {
        sha256,
        encryptData,
        decryptData,
        hashPassword,
        verifyPassword,
        generateSessionToken,
        validateStorageIntegrity,
        setSecureItem,
        getSecureItem,
        removeSecureItem,
        clearExpiredData,
        sanitizeInput: sanitizeString,
        sanitizeOutput: escapeHtml,
        detectSQLInjection
    };

    global.HGSecurity = Security;

    // Backward-compatible global aliases (used by existing inline scripts/pages)
    global.encryptData = global.encryptData || Security.encryptData;
    global.decryptData = global.decryptData || Security.decryptData;
    global.hashPassword = global.hashPassword || Security.hashPassword;
    global.generateSessionToken = global.generateSessionToken || Security.generateSessionToken;
    global.setSecureItem = global.setSecureItem || Security.setSecureItem;
    global.getSecureItem = global.getSecureItem || Security.getSecureItem;
    global.validateStorageIntegrity = global.validateStorageIntegrity || Security.validateStorageIntegrity;
    global.clearExpiredData = global.clearExpiredData || Security.clearExpiredData;
})(typeof window !== 'undefined' ? window : globalThis);
