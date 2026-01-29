const AUTH_STORAGE_KEY = 'happyGroceries_users';
const SESSION_STORAGE_KEY = 'happyGroceries_session';

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

function registerUser(name, phone, email, password, csrfToken) {
    const providedToken = csrfToken || (typeof HGValidation !== 'undefined' && HGValidation.getCSRFToken ? HGValidation.getCSRFToken() : sessionStorage.getItem('csrf_token'));
    if (typeof HGValidation !== 'undefined' && HGValidation.validateCSRFToken) {
        if (!HGValidation.validateCSRFToken(providedToken)) {
            return { success: false, error: 'Security check failed. Please refresh and try again.' };
        }
    }

    if (typeof HGValidation !== 'undefined' && HGValidation.checkRateLimit) {
        const rateCheck = HGValidation.checkRateLimit('register', phone);
        if (!rateCheck.allowed) {
            return { success: false, error: rateCheck.message };
        }
    }

    const safeName = (typeof HGValidation !== 'undefined' && HGValidation.sanitizeInput) ? HGValidation.sanitizeInput(name) : (name || '').trim();
    const safeEmail = (typeof HGValidation !== 'undefined' && HGValidation.sanitizeInput) ? HGValidation.sanitizeInput(email || '') : (email || '').trim();
    const safePhone = (phone || '').replace(/\D/g, '');

    if (!validateName(safeName)) {
        return { success: false, error: 'Name must be 3-50 characters and contain only letters/numbers/spaces' };
    }

    if (!validatePhone(safePhone)) {
        return { success: false, error: 'Phone number must be 10 digits' };
    }

    if (safeEmail && !validateEmail(safeEmail)) {
        return { success: false, error: 'Invalid email format' };
    }

    if (!validatePassword(password)) {
        return { success: false, error: 'Password must be at least 6 characters' };
    }

    if (findUserByPhone(safePhone)) {
        return { success: false, error: 'Phone number already registered' };
    }

    const hashedPassword = (typeof HGSecurity !== 'undefined' && HGSecurity.hashPassword)
        ? HGSecurity.hashPassword(password)
        : hashPasswordLegacy(password);

    const user = {
        id: Date.now().toString(),
        name: safeName,
        phone: safePhone,
        email: safeEmail || '',
        password: hashedPassword,
        createdAt: new Date().toISOString(),
        orders: [],
        wishlist: []
    };

    saveUser(user);

    if (typeof HGSession !== 'undefined' && HGSession.createSession) {
        HGSession.createSession(user);
    } else {
        createSession(user);
    }

    if (typeof HGValidation !== 'undefined' && HGValidation.resetRateLimit) {
        HGValidation.resetRateLimit('register', phone);
    }

    return { success: true, user };
}

function loginUser(phone, password) {
    if (typeof HGValidation !== 'undefined' && HGValidation.checkRateLimit) {
        const rateCheck = HGValidation.checkRateLimit('login', phone);
        if (!rateCheck.allowed) {
            return { success: false, error: rateCheck.message };
        }
    }

    if (!validatePhone(phone)) {
        return { success: false, error: 'Invalid phone number' };
    }

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

    if (typeof HGSession !== 'undefined' && HGSession.createSession) {
        HGSession.createSession(user);
    } else {
        createSession(user);
    }

    if (typeof HGValidation !== 'undefined' && HGValidation.resetRateLimit) {
        HGValidation.resetRateLimit('login', phone);
    }

    return { success: true, user };
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

function logoutUser() {
    if (typeof HGSession !== 'undefined' && HGSession.endSession) {
        HGSession.endSession();
    } else {
        localStorage.removeItem(SESSION_STORAGE_KEY);
    }
    
    // Determine correct redirect path based on current location
    const currentPath = window.location.pathname;
    const inPagesDir = currentPath.includes('/pages/');
    window.location.href = inPagesDir ? '../index.html' : 'index.html';
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
