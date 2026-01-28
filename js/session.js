(function (global) {
    'use strict';

    const cfg = global.SECURITY_CONFIG || {
        SESSION_TIMEOUT: 30 * 60 * 1000,
        MAX_CONCURRENT_SESSIONS: 2,
        TOKEN_REFRESH_INTERVAL: 25 * 60 * 1000,
        STORAGE_KEY_PREFIX: 'happyGroceries_'
    };

    const SESSION_KEY = cfg.STORAGE_KEY_PREFIX + 'session';
    const AUDIT_LOG_KEY = cfg.STORAGE_KEY_PREFIX + 'audit_log';
    const SESSIONS_KEY = cfg.STORAGE_KEY_PREFIX + 'sessions';

    let activityTimer = null;
    let refreshTimer = null;

    function getDeviceFingerprint() {
        const nav = window.navigator;
        const screen = window.screen;

        const components = [
            nav.userAgent || '',
            nav.language || '',
            screen.colorDepth || 0,
            screen.width || 0,
            screen.height || 0,
            new Date().getTimezoneOffset()
        ];

        const raw = components.join('|');
        let hash = 0;
        for (let i = 0; i < raw.length; i++) {
            const char = raw.charCodeAt(i);
            hash = (hash << 5) - hash + char;
            hash |= 0;
        }
        return Math.abs(hash).toString(36);
    }

    function createAuditLog(action, details) {
        try {
            const logs = getAuditLogs();
            const entry = {
                action,
                details: details || {},
                timestamp: new Date().toISOString(),
                deviceFingerprint: getDeviceFingerprint()
            };
            logs.push(entry);

            if (logs.length > 100) {
                logs.shift();
            }

            localStorage.setItem(AUDIT_LOG_KEY, JSON.stringify(logs));
        } catch (error) {
            console.error('Failed to create audit log:', error);
        }
    }

    function getAuditLogs() {
        try {
            const data = localStorage.getItem(AUDIT_LOG_KEY);
            return data ? JSON.parse(data) : [];
        } catch {
            return [];
        }
    }

    function createSession(user) {
        const token = global.generateSessionToken ? global.generateSessionToken() : randomToken();
        const deviceFp = getDeviceFingerprint();
        const now = Date.now();

        const session = {
            userId: user.id,
            name: user.name,
            phone: user.phone,
            email: user.email || '',
            token,
            deviceFingerprint: deviceFp,
            createdAt: now,
            lastActivity: now,
            expiresAt: now + cfg.SESSION_TIMEOUT,
            refreshToken: randomToken()
        };

        limitConcurrentSessions(user.id, deviceFp);

        localStorage.setItem(SESSION_KEY, JSON.stringify(session));

        createAuditLog('login', { userId: user.id, phone: user.phone });

        startActivityTracking();
        startTokenRefresh();

        return session;
    }

    function randomToken() {
        return Date.now().toString(36) + Math.random().toString(36).substring(2);
    }

    function limitConcurrentSessions(userId, currentDeviceFp) {
        try {
            const allSessionsData = localStorage.getItem(SESSIONS_KEY);
            const allSessions = allSessionsData ? JSON.parse(allSessionsData) : {};

            if (!allSessions[userId]) {
                allSessions[userId] = [];
            }

            const userSessions = allSessions[userId];

            const now = Date.now();
            const activeSessions = userSessions.filter((s) => s.expiresAt > now);

            const existingIndex = activeSessions.findIndex((s) => s.deviceFp === currentDeviceFp);
            if (existingIndex !== -1) {
                activeSessions.splice(existingIndex, 1);
            }

            activeSessions.push({
                deviceFp: currentDeviceFp,
                createdAt: now,
                expiresAt: now + cfg.SESSION_TIMEOUT
            });

            while (activeSessions.length > cfg.MAX_CONCURRENT_SESSIONS) {
                activeSessions.shift();
            }

            allSessions[userId] = activeSessions;
            localStorage.setItem(SESSIONS_KEY, JSON.stringify(allSessions));
        } catch (error) {
            console.error('Failed to limit concurrent sessions:', error);
        }
    }

    function validateSession() {
        try {
            const sessionData = localStorage.getItem(SESSION_KEY);
            if (!sessionData) return false;

            const session = JSON.parse(sessionData);
            const now = Date.now();

            if (now > session.expiresAt) {
                endSession(true);
                return false;
            }

            if (now - session.lastActivity > cfg.SESSION_TIMEOUT) {
                endSession(true);
                return false;
            }

            return true;
        } catch {
            return false;
        }
    }

    function getCurrentSession() {
        try {
            const sessionData = localStorage.getItem(SESSION_KEY);
            if (!sessionData) return null;
            return JSON.parse(sessionData);
        } catch {
            return null;
        }
    }

    function trackActivity() {
        if (!validateSession()) return false;

        try {
            const session = getCurrentSession();
            if (!session) return false;

            const now = Date.now();
            session.lastActivity = now;
            session.expiresAt = now + cfg.SESSION_TIMEOUT;

            localStorage.setItem(SESSION_KEY, JSON.stringify(session));
            return true;
        } catch {
            return false;
        }
    }

    function refreshSession() {
        if (!validateSession()) return false;

        try {
            const session = getCurrentSession();
            if (!session) return false;

            const now = Date.now();
            const newToken = global.generateSessionToken ? global.generateSessionToken() : randomToken();

            session.token = newToken;
            session.lastActivity = now;
            session.expiresAt = now + cfg.SESSION_TIMEOUT;
            session.refreshToken = randomToken();

            localStorage.setItem(SESSION_KEY, JSON.stringify(session));

            createAuditLog('session_refreshed', { userId: session.userId });
            return true;
        } catch {
            return false;
        }
    }

    function endSession(isTimeout = false) {
        try {
            const session = getCurrentSession();
            if (session) {
                createAuditLog(isTimeout ? 'session_timeout' : 'logout', { userId: session.userId });
            }

            localStorage.removeItem(SESSION_KEY);

            stopActivityTracking();
            stopTokenRefresh();

            return true;
        } catch {
            return false;
        }
    }

    function enforceSessionTimeout() {
        if (!validateSession()) {
            if (global.showToast) {
                global.showToast('Session expired. Please login again.');
            }
            setTimeout(() => {
                const currentPath = window.location.pathname;
                if (!currentPath.includes('login.html')) {
                    window.location.href = currentPath.includes('/pages/')
                        ? 'login.html'
                        : 'pages/login.html';
                }
            }, 1500);
        }
    }

    function startActivityTracking() {
        stopActivityTracking();

        const events = ['click', 'keypress', 'scroll', 'mousemove', 'touchstart'];
        let lastTrack = Date.now();

        const throttledTrack = function () {
            const now = Date.now();
            if (now - lastTrack > 10000) {
                trackActivity();
                lastTrack = now;
            }
        };

        events.forEach((event) => {
            document.addEventListener(event, throttledTrack, { passive: true });
        });

        activityTimer = setInterval(() => {
            enforceSessionTimeout();
        }, 60000);
    }

    function stopActivityTracking() {
        if (activityTimer) {
            clearInterval(activityTimer);
            activityTimer = null;
        }
    }

    function startTokenRefresh() {
        stopTokenRefresh();
        refreshTimer = setInterval(() => {
            refreshSession();
        }, cfg.TOKEN_REFRESH_INTERVAL);
    }

    function stopTokenRefresh() {
        if (refreshTimer) {
            clearInterval(refreshTimer);
            refreshTimer = null;
        }
    }

    const SessionManager = {
        createSession,
        validateSession,
        getCurrentSession,
        trackActivity,
        refreshSession,
        endSession,
        enforceSessionTimeout,
        getDeviceFingerprint,
        createAuditLog,
        getAuditLogs,
        limitConcurrentSessions
    };

    global.HGSession = SessionManager;

    global.createSession = global.createSession || SessionManager.createSession;
    global.validateSession = global.validateSession || SessionManager.validateSession;
    global.trackActivity = global.trackActivity || SessionManager.trackActivity;
})(typeof window !== 'undefined' ? window : globalThis);
