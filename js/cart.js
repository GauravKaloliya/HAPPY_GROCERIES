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
        expiryDate: '2027-12-31'
    },
    {
        code: 'FRESH15',
        description: '15% off on fruits & vegetables',
        type: 'category',
        value: 15,
        applicableCategories: ['Fruits', 'Vegetables'],
        minOrderValue: 200,
        maxDiscount: 75,
        active: true,
        expiryDate: '2027-12-31'
    },
    {
        code: 'WELCOME50',
        description: '₹50 off first order',
        type: 'fixed',
        value: 50,
        minOrderValue: 300,
        maxDiscount: 50,
        active: true,
        expiryDate: '2027-12-31',
        firstOrderOnly: true
    },
    {
        code: 'DAIRY10',
        description: '10% off on dairy products',
        type: 'category',
        value: 10,
        applicableCategories: ['Dairy'],
        minOrderValue: 150,
        maxDiscount: 50,
        active: true,
        expiryDate: '2027-12-31'
    },
    {
        code: 'SNACKS25',
        description: '₹25 off snacks orders',
        type: 'fixed',
        value: 25,
        applicableCategories: ['Snacks'],
        minOrderValue: 100,
        maxDiscount: 25,
        active: true,
        expiryDate: '2027-12-31'
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
    const normalizedCode = (code || '').toUpperCase();
    if (!normalizedCode) return;

    const used = getUsedCoupons();
    if (!used.includes(normalizedCode)) {
        used.push(normalizedCode);
        localStorage.setItem(USED_COUPONS_KEY, JSON.stringify(used));
    }
}

function isCouponUsed(code) {
    const normalizedCode = (code || '').toUpperCase();
    if (!normalizedCode) return false;

    const used = getUsedCoupons();
    return used.includes(normalizedCode);
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

function getAllCoupons() {
    return AVAILABLE_COUPONS;
}

function getCouponApplicableCategories(coupon) {
    if (!coupon) return null;
    return coupon.applicableCategories || coupon.category || null;
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
    const applicableCategories = getCouponApplicableCategories(coupon);
    if (coupon.type === 'category' && Array.isArray(applicableCategories) && applicableCategories.length > 0) {
        const hasMatchingCategory = cart.some(item => applicableCategories.includes(item.category));
        if (!hasMatchingCategory) {
            return { valid: false, message: `This coupon is only valid for: ${applicableCategories.join(', ')}` };
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
        const applicableCategories = getCouponApplicableCategories(coupon);
        if (Array.isArray(applicableCategories) && applicableCategories.length > 0) {
            const categoryTotal = cart
                .filter(item => applicableCategories.includes(item.category))
                .reduce((total, item) => {
                    const price = getProductEffectivePrice(item);
                    return total + (price * item.quantity);
                }, 0);
            discountAmount = (categoryTotal * coupon.value) / 100;
        }
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

// Helper functions for offer suggestions
function getOfferEligibilityStatus(coupon, cartTotal, cart) {
    if (!coupon.active || isCouponExpired(coupon)) {
        return 'not_applicable';
    }
    
    if (coupon.firstOrderOnly) {
        const user = getCurrentUser();
        if (user && user.orders && user.orders.length > 0) {
            return 'not_applicable';
        }
    }
    
    if (isCouponUsed(coupon.code)) {
        return 'not_applicable';
    }
    
    // Check minimum order value
    const shortfall = coupon.minOrderValue - cartTotal;
    if (shortfall <= 0) {
        // Check category match for category-specific coupons
        const applicableCategories = getCouponApplicableCategories(coupon);
        if (coupon.type === 'category' && Array.isArray(applicableCategories) && applicableCategories.length > 0) {
            const hasMatchingCategory = cart.some(item => applicableCategories.includes(item.category));
            if (hasMatchingCategory) {
                return 'applicable';
            } else {
                return 'not_applicable';
            }
        }
        return 'applicable';
    } else if (shortfall <= 100) {
        // Within ₹100 of minimum - consider as "almost applicable"
        return 'almost';
    } else {
        return 'not_applicable';
    }
}

function getEligibilityReason(coupon, cartTotal, cart) {
    if (!coupon.active) {
        return 'This coupon is no longer active';
    }
    
    if (isCouponExpired(coupon)) {
        return 'This coupon has expired';
    }
    
    if (isCouponUsed(coupon.code)) {
        return 'This coupon has already been used';
    }
    
    if (coupon.firstOrderOnly) {
        const user = getCurrentUser();
        if (user && user.orders && user.orders.length > 0) {
            return 'This coupon is only valid for first-time customers';
        }
    }
    
    if (cartTotal < coupon.minOrderValue) {
        const shortfall = coupon.minOrderValue - cartTotal;
        return `Add ₹${shortfall} more to qualify for this offer`;
    }
    
    const applicableCategories = getCouponApplicableCategories(coupon);
    if (coupon.type === 'category' && Array.isArray(applicableCategories) && applicableCategories.length > 0) {
        const hasMatchingCategory = cart.some(item => applicableCategories.includes(item.category));
        if (!hasMatchingCategory) {
            return `This coupon requires items from: ${applicableCategories.join(', ')}`;
        }
    }
    
    return 'Not eligible for this offer';
}

function calculateRelevanceScore(coupon, cart, cartTotal) {
    let score = 50; // Base score
    
    // Higher score for applicable offers
    const eligibility = getOfferEligibilityStatus(coupon, cartTotal, cart);
    if (eligibility === 'applicable') score += 30;
    else if (eligibility === 'almost') score += 15;
    
    // Higher score for category matches
    const applicableCategories = getCouponApplicableCategories(coupon);
    if (coupon.type === 'category' && Array.isArray(applicableCategories) && applicableCategories.length > 0) {
        const matchingItems = cart.filter(item => applicableCategories.includes(item.category));
        if (matchingItems.length > 0) {
            score += 20;
            // Bonus for high percentage of cart items matching
            const matchPercentage = (matchingItems.length / cart.length) * 100;
            score += Math.min(matchPercentage, 20);
        }
    }
    
    // Higher score for higher discount amounts
    const potentialDiscount = calculateCouponDiscountAmount(coupon, cartTotal, cart);
    const discountRatio = potentialDiscount / cartTotal;
    score += Math.min(discountRatio * 100, 25);
    
    // Lower score for soon-to-expire offers (urgency)
    const daysLeft = calculateDaysUntilExpiry(coupon.expiryDate);
    if (daysLeft <= 7) score += 10;
    
    return Math.min(Math.max(score, 0), 100);
}

function calculateDaysUntilExpiry(expiryDate) {
    if (!expiryDate) return 999;
    
    const today = new Date();
    const expiry = new Date(expiryDate);
    const diffTime = expiry - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return Math.max(diffDays, 0);
}

function getSuggestedCoupons(cartTotal, cart) {
    const appliedCoupon = getAppliedCoupon();
    
    return AVAILABLE_COUPONS.map(coupon => {
        const eligibility = getOfferEligibilityStatus(coupon, cartTotal, cart);
        const potentialDiscount = calculateCouponDiscountAmount(coupon, cartTotal, cart);
        const relevanceScore = calculateRelevanceScore(coupon, cart, cartTotal);
        const daysUntilExpiry = calculateDaysUntilExpiry(coupon.expiryDate);
        const isApplied = appliedCoupon && appliedCoupon.code === coupon.code;
        const isUsed = isCouponUsed(coupon.code);
        const eligibilityReason = getEligibilityReason(coupon, cartTotal, cart);
        const applicableCategories = getCouponApplicableCategories(coupon);
        
        // Calculate amount needed to unlock offer
        const amountNeeded = Math.max(0, coupon.minOrderValue - cartTotal);
        const percentageToGo = amountNeeded > 0 ? (amountNeeded / coupon.minOrderValue) * 100 : 0;
        
        return {
            code: coupon.code,
            description: coupon.description,
            type: coupon.type,
            value: coupon.value,
            minOrderValue: coupon.minOrderValue,
            maxDiscount: coupon.maxDiscount,
            applicableCategories: applicableCategories,
            eligibility: eligibility,
            potentialDiscount: potentialDiscount,
            relevanceScore: relevanceScore,
            daysUntilExpiry: daysUntilExpiry,
            isApplied: isApplied,
            isUsed: isUsed,
            eligibilityReason: eligibilityReason,
            amountNeeded: amountNeeded,
            percentageToGo: percentageToGo
        };
    }).sort((a, b) => {
        // Sort by relevance and potential savings
        if (a.eligibility === 'applicable' && b.eligibility !== 'applicable') return -1;
        if (b.eligibility === 'applicable' && a.eligibility !== 'applicable') return 1;
        if (a.eligibility === 'almost' && b.eligibility === 'not_applicable') return -1;
        if (b.eligibility === 'almost' && a.eligibility === 'not_applicable') return 1;
        
        // Within same eligibility, sort by potential discount
        return b.potentialDiscount - a.potentialDiscount;
    });
}

function getSmartOfferRecommendation(cartTotal, cart) {
    const suggestions = getSuggestedCoupons(cartTotal, cart);
    
    // Find top applicable recommendation
    const applicableOffers = suggestions.filter(offer => offer.eligibility === 'applicable' && !offer.isApplied);
    
    if (applicableOffers.length === 0) {
        // No applicable offers, find the best alternative
        const bestOffer = suggestions.find(offer => !offer.isUsed) || suggestions[0];
        return {
            topRecommendation: bestOffer,
            alternatives: suggestions.slice(1, 3),
            explanation: bestOffer ? generateRecommendationExplanation(bestOffer, cartTotal) : "No offers available for your current cart"
        };
    }
    
    // Choose the best applicable offer (highest savings and relevance)
    const topOffer = applicableOffers.reduce((best, current) => {
        const currentScore = (current.potentialDiscount * 0.6) + (current.relevanceScore * 0.4);
        const bestScore = (best.potentialDiscount * 0.6) + (best.relevanceScore * 0.4);
        return currentScore > bestScore ? current : best;
    });
    
    return {
        topRecommendation: topOffer,
        alternatives: applicableOffers.slice(1, 3),
        explanation: generateRecommendationExplanation(topOffer, cartTotal)
    };
}

function generateRecommendationExplanation(offer, cartTotal) {
    if (!offer) return "No offers available";
    
    if (offer.eligibility === 'applicable') {
        return `We recommend ${offer.code} - you'll save ₹${offer.potentialDiscount.toFixed(0)} on this order!`;
    } else if (offer.eligibility === 'almost') {
        return `Add ₹${offer.amountNeeded} more to unlock ${offer.code} and save ₹${offer.potentialDiscount.toFixed(0)}!`;
    } else {
        return `${offer.code} requires ${offer.eligibilityReason}`;
    }
}

function applyOfferFromCart(couponCode) {
    const cart = getCart();
    const cartTotal = calculateSubtotal();
    const validation = validateCoupon(couponCode, cartTotal, cart);

    if (validation.valid) {
        setAppliedCoupon(validation.coupon);
        markCouponAsUsed(couponCode);

        const discount = calculateCouponDiscountAmount(validation.coupon, cartTotal, cart);
        showToast(`Coupon ${couponCode} applied!`);

        return {
            success: true,
            coupon: validation.coupon,
            discount,
            newTotal: cartTotal - discount
        };
    }

    showToast(`Error: ${validation.message}`);
    return {
        success: false,
        message: validation.message
    };
}

function removeOfferFromCart() {
    const appliedCoupon = getAppliedCoupon();
    if (appliedCoupon) {
        setAppliedCoupon(null);
        return { 
            success: true, 
            coupon: appliedCoupon,
            message: 'Coupon removed successfully'
        };
    }
    return { 
        success: false, 
        message: 'No coupon to remove' 
    };
}
