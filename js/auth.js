const AUTH_STORAGE_KEY = 'happyGroceries_users';
const SESSION_STORAGE_KEY = 'happyGroceries_session';

function hashPassword(password) {
    let hash = 0;
    for (let i = 0; i < password.length; i++) {
        const char = password.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
    }
    return hash.toString(36);
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
    const phoneRegex = /^\d{10}$/;
    return phoneRegex.test(phone);
}

function validateEmail(email) {
    if (!email) return true;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function validatePassword(password) {
    return password.length >= 6;
}

function validateName(name) {
    return name.length >= 3;
}

function registerUser(name, phone, email, password) {
    if (!validateName(name)) {
        return { success: false, error: 'Name must be at least 3 characters' };
    }

    if (!validatePhone(phone)) {
        return { success: false, error: 'Phone number must be 10 digits' };
    }

    if (email && !validateEmail(email)) {
        return { success: false, error: 'Invalid email format' };
    }

    if (!validatePassword(password)) {
        return { success: false, error: 'Password must be at least 6 characters' };
    }

    if (findUserByPhone(phone)) {
        return { success: false, error: 'Phone number already registered' };
    }

    const user = {
        id: Date.now().toString(),
        name,
        phone,
        email: email || '',
        password: hashPassword(password),
        createdAt: new Date().toISOString(),
        orders: [],
        wishlist: []
    };

    saveUser(user);
    createSession(user);

    return { success: true, user };
}

function loginUser(phone, password) {
    if (!validatePhone(phone)) {
        return { success: false, error: 'Invalid phone number' };
    }

    const user = findUserByPhone(phone);
    if (!user) {
        return { success: false, error: 'User not found' };
    }

    if (user.password !== hashPassword(password)) {
        return { success: false, error: 'Invalid password' };
    }

    createSession(user);
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
    const session = localStorage.getItem(SESSION_STORAGE_KEY);
    if (!session) return null;

    const sessionData = JSON.parse(session);
    const users = getAllUsers();
    return users.find(user => user.id === sessionData.userId);
}

function isUserLoggedIn() {
    return getCurrentUser() !== null;
}

function logoutUser() {
    localStorage.removeItem(SESSION_STORAGE_KEY);
    window.location.href = '/index.html';
}

function getPasswordStrength(password) {
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

    // Calculate estimated delivery time in minutes
    const cart = order.items || [];
    const isExpress = order.delivery > 0 && order.delivery === getDeliveryCharge().express;
    const deliveryMinutes = calculateDeliveryMinutes(cart, isExpress);
    const deliveryTime = formatDeliveryTime(deliveryMinutes);
    
    order.estimatedDelivery = isExpress ? 
        `Express delivery: ${deliveryMinutes} minutes (by ${deliveryTime})` :
        `Standard delivery: ${deliveryMinutes} minutes (by ${deliveryTime})`;

    // Mark coupon as used if one was applied
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
