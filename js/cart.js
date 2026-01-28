const CART_STORAGE_KEY = 'happyGroceries_cart';
const COUPON_STORAGE_KEY = 'happyGroceries_applied_coupon';

// Available coupons
const AVAILABLE_COUPONS = [
    {
        code: 'SAVE20',
        description: '20% off orders above ₹500',
        type: 'percentage',
        value: 20,
        minOrderValue: 500,
        maxDiscount: 100,
        active: true,
        expiryDate: '2024-12-31'
    },
    {
        code: 'FRESH15',
        description: '15% off on fruits & vegetables',
        type: 'category',
        value: 15,
        category: ['Fruits', 'Vegetables'],
        minOrderValue: 200,
        maxDiscount: 75,
        active: true,
        expiryDate: '2024-12-31'
    },
    {
        code: 'WELCOME50',
        description: '₹50 off first order',
        type: 'fixed',
        value: 50,
        minOrderValue: 300,
        maxDiscount: 50,
        active: true,
        expiryDate: '2024-12-31',
        firstOrderOnly: true
    },
    {
        code: 'DAIRY10',
        description: '10% off on dairy products',
        type: 'category',
        value: 10,
        category: ['Dairy'],
        minOrderValue: 150,
        maxDiscount: 50,
        active: true,
        expiryDate: '2024-12-31'
    },
    {
        code: 'SNACKS25',
        description: '₹25 off snacks orders',
        type: 'fixed',
        value: 25,
        category: ['Snacks'],
        minOrderValue: 100,
        maxDiscount: 25,
        active: true,
        expiryDate: '2024-12-31'
    }
];

// Session used coupons tracking
const USED_COUPONS_KEY = 'happyGroceries_used_coupons';

function getCart() {
    const cart = localStorage.getItem(CART_STORAGE_KEY);
    return cart ? JSON.parse(cart) : [];
}

function saveCart(cart) {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
    updateCartCounter();
}

function addToCart(product, quantity = 1) {
    const cart = getCart();
    const existingItem = cart.find(item => item.id === product.id);

    if (existingItem) {
        existingItem.quantity += quantity;
    } else {
        cart.push({
            ...product,
            quantity
        });
    }

    saveCart(cart);
    showToast('Added to cart 🛒');
    return true;
}

function removeFromCart(productId) {
    let cart = getCart();
    cart = cart.filter(item => item.id !== productId);
    saveCart(cart);
    return true;
}

function updateQuantity(productId, quantity) {
    const cart = getCart();
    const item = cart.find(item => item.id === productId);

    if (item) {
        if (quantity <= 0) {
            removeFromCart(productId);
        } else {
            item.quantity = quantity;
            saveCart(cart);
        }
        return true;
    }
    return false;
}

function clearCart() {
    localStorage.removeItem(CART_STORAGE_KEY);
    updateCartCounter();
}

function calculateSubtotal() {
    const cart = getCart();
    return cart.reduce((total, item) => {
        const price = getProductEffectivePrice(item);
        return total + (price * item.quantity);
    }, 0);
}

function calculateSubtotalWithOriginalPrice() {
    const cart = getCart();
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
}

function calculateTax(subtotal) {
    return subtotal * 0.08;
}

function calculateDeliveryCharge(subtotal, expressDelivery = false) {
    const deliveryConfig = getDeliveryCharge();
    
    if (subtotal >= deliveryConfig.freeThreshold) {
        return 0;
    }
    
    return expressDelivery ? deliveryConfig.express : deliveryConfig.standard;
}

function calculateCouponDiscount() {
    const appliedCoupon = getAppliedCoupon();
    if (!appliedCoupon) return 0;
    
    const cart = getCart();
    const cartTotal = calculateSubtotal();
    return calculateCouponDiscountAmount(appliedCoupon, cartTotal, cart);
}

function calculateTotal(expressDelivery = false) {
    const subtotal = calculateSubtotal();
    const tax = calculateTax(subtotal);
    const delivery = calculateDeliveryCharge(subtotal, expressDelivery);
    const couponDiscount = calculateCouponDiscount();
    
    return subtotal + tax + delivery - couponDiscount;
}

function getCartCount() {
    const cart = getCart();
    return cart.reduce((total, item) => total + item.quantity, 0);
}

function updateCartCounter() {
    const counter = document.getElementById('cartCounter');
    if (counter) {
        const count = getCartCount();
        counter.textContent = count;
        counter.style.display = count > 0 ? 'flex' : 'none';
    }
}

function showToast(message) {
    const toast = document.getElementById('toast');
    if (toast) {
        toast.textContent = message;
        toast.classList.add('show');
        setTimeout(() => {
            toast.classList.remove('show');
        }, 3000);
    }
}

// Coupon Management Functions
function getAppliedCoupon() {
    const coupon = localStorage.getItem(COUPON_STORAGE_KEY);
    return coupon ? JSON.parse(coupon) : null;
}

function setAppliedCoupon(coupon) {
    if (coupon) {
        localStorage.setItem(COUPON_STORAGE_KEY, JSON.stringify(coupon));
    } else {
        localStorage.removeItem(COUPON_STORAGE_KEY);
    }
}

function getUsedCoupons() {
    const used = localStorage.getItem(USED_COUPONS_KEY);
    return used ? JSON.parse(used) : [];
}

function markCouponAsUsed(code) {
    const used = getUsedCoupons();
    if (!used.includes(code)) {
        used.push(code);
        localStorage.setItem(USED_COUPONS_KEY, JSON.stringify(used));
    }
}

function isCouponUsed(code) {
    const used = getUsedCoupons();
    return used.includes(code);
}

function getCouponByCode(code) {
    return AVAILABLE_COUPONS.find(coupon => coupon.code.toUpperCase() === code.toUpperCase());
}

function isCouponExpired(coupon) {
    if (!coupon.expiryDate) return false;
    const today = new Date();
    const expiry = new Date(coupon.expiryDate);
    return today > expiry;
}

function validateCoupon(code, cartTotal, cart) {
    const coupon = getCouponByCode(code);
    
    if (!coupon) {
        return { valid: false, message: 'Invalid coupon code' };
    }
    
    if (!coupon.active) {
        return { valid: false, message: 'This coupon is no longer active' };
    }
    
    if (isCouponExpired(coupon)) {
        return { valid: false, message: 'This coupon has expired' };
    }
    
    if (isCouponUsed(coupon.code)) {
        return { valid: false, message: 'This coupon has already been used' };
    }
    
    if (cartTotal < coupon.minOrderValue) {
        return { valid: false, message: `Minimum order value of ₹${coupon.minOrderValue} required` };
    }
    
    // Check category-specific coupons
    if (coupon.type === 'category' && coupon.category) {
        const hasMatchingCategory = cart.some(item => coupon.category.includes(item.category));
        if (!hasMatchingCategory) {
            return { valid: false, message: `This coupon is only valid for: ${coupon.category.join(', ')}` };
        }
    }
    
    // Check first order only
    if (coupon.firstOrderOnly) {
        const user = getCurrentUser();
        if (user && user.orders && user.orders.length > 0) {
            return { valid: false, message: 'This coupon is only valid for first-time customers' };
        }
    }
    
    return { valid: true, coupon, message: 'Coupon is valid' };
}

function calculateCouponDiscountAmount(coupon, cartTotal, cart) {
    if (!coupon) return 0;
    
    let discountAmount = 0;
    
    if (coupon.type === 'fixed') {
        discountAmount = coupon.value;
    } else if (coupon.type === 'percentage') {
        discountAmount = (cartTotal * coupon.value) / 100;
    } else if (coupon.type === 'category') {
        // Calculate discount only for items in specified categories
        const categoryTotal = cart
            .filter(item => coupon.category.includes(item.category))
            .reduce((total, item) => {
                const price = getProductEffectivePrice(item);
                return total + (price * item.quantity);
            }, 0);
        discountAmount = (categoryTotal * coupon.value) / 100;
    }
    
    // Apply max discount cap
    if (coupon.maxDiscount && discountAmount > coupon.maxDiscount) {
        discountAmount = coupon.maxDiscount;
    }
    
    // Ensure discount doesn't exceed cart total
    return Math.min(discountAmount, cartTotal);
}

function calculateCouponDiscount() {
    const appliedCoupon = getAppliedCoupon();
    if (!appliedCoupon) return 0;
    
    const cart = getCart();
    const cartTotal = calculateSubtotal();
    return calculateCouponDiscountAmount(appliedCoupon, cartTotal, cart);
}

// Delivery time calculation in minutes
function calculateDeliveryMinutes(cart, expressDelivery = false) {
    let baseMinutes = 45; // Base delivery time
    
    // Add 5 minutes per 500 items
    const totalItems = cart.reduce((total, item) => total + item.quantity, 0);
    const additionalMinutes = Math.ceil(totalItems / 500) * 5;
    
    // Express delivery reduces time
    if (expressDelivery) {
        baseMinutes = 30;
    }
    
    return baseMinutes + additionalMinutes;
}

function formatDeliveryTime(minutes) {
    const now = new Date();
    const deliveryTime = new Date(now.getTime() + (minutes * 60 * 1000));
    
    const timeOptions = {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
    };
    
    return deliveryTime.toLocaleTimeString('en-US', timeOptions);
}

function getEstimatedDeliveryText(cart, expressDelivery = false) {
    const minutes = calculateDeliveryMinutes(cart, expressDelivery);
    const deliveryTime = formatDeliveryTime(minutes);
    
    if (expressDelivery) {
        return `Express delivery: ${minutes} minutes (by ${deliveryTime})`;
    }
    
    return `Estimated delivery: ${minutes} minutes (by ${deliveryTime})`;
}

// Helper function to calculate effective price with discount
function getProductEffectivePrice(product) {
    if (product.discountPercent && product.discountPercent > 0) {
        return product.price * (1 - product.discountPercent / 100);
    }
    return product.price;
}

function calculateDiscountedPrice(originalPrice, discountPercent) {
    return originalPrice * (1 - discountPercent / 100);
}

// Delivery configuration
function getDeliveryCharge() {
    return {
        standard: 50,
        express: 100,
        freeThreshold: 500
    };
}

function getSuggestedCoupons(cartTotal, cart) {
    const suggestions = [];
    
    AVAILABLE_COUPONS.forEach(coupon => {
        if (!coupon.active || isCouponExpired(coupon) || isCouponUsed(coupon.code)) {
            return;
        }
        
        if (cartTotal >= coupon.minOrderValue) {
            // Check category match for category-specific coupons
            if (coupon.type === 'category' && coupon.category) {
                const hasMatchingCategory = cart.some(item => coupon.category.includes(item.category));
                if (hasMatchingCategory) {
                    const discountAmount = calculateCouponDiscountAmount(coupon, cartTotal, cart);
                    suggestions.push({
                        ...coupon,
                        potentialDiscount: discountAmount
                    });
                }
            } else {
                const discountAmount = calculateCouponDiscountAmount(coupon, cartTotal, cart);
                suggestions.push({
                    ...coupon,
                    potentialDiscount: discountAmount
                });
            }
        }
    });
    
    // Sort by highest potential discount
    return suggestions.sort((a, b) => b.potentialDiscount - a.potentialDiscount);
}
