import { secureStorage } from '../utils/security.js';
import { TAX_RATE, DELIVERY_CHARGE, FREE_DELIVERY_THRESHOLD } from '../utils/config.js';

const CART_STORAGE_KEY = 'cart';
const COUPON_STORAGE_KEY = 'applied_coupon';
const USED_COUPONS_KEY = 'used_coupons';

// Available coupons
export const AVAILABLE_COUPONS = [
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

class CartService {
    constructor() {
        // Initialize cart counter update listener
        this.updateCartCounter = this.updateCartCounter.bind(this);
    }

    // Get cart from secure storage
    getCart() {
        return secureStorage.getItem(CART_STORAGE_KEY) || [];
    }

    // Save cart to secure storage
    saveCart(cart) {
        secureStorage.setItem(CART_STORAGE_KEY, cart);
        this.updateCartCounter();
    }

    // Add item to cart
    addToCart(product, quantity = 1) {
        const cart = this.getCart();
        const existingItem = cart.find(item => item.id === product.id);

        if (existingItem) {
            existingItem.quantity += quantity;
        } else {
            cart.push({
                ...product,
                quantity
            });
        }

        this.saveCart(cart);
        return { success: true, message: 'Added to cart 🛒' };
    }

    // Remove item from cart
    removeFromCart(productId) {
        let cart = this.getCart();
        cart = cart.filter(item => item.id !== productId);
        this.saveCart(cart);
        return { success: true, message: 'Item removed from cart' };
    }

    // Update item quantity
    updateQuantity(productId, quantity) {
        const cart = this.getCart();
        const item = cart.find(item => item.id === productId);

        if (item) {
            if (quantity <= 0) {
                this.removeFromCart(productId);
            } else {
                item.quantity = quantity;
                this.saveCart(cart);
            }
            return { success: true };
        }
        return { success: false, error: 'Item not found' };
    }

    // Clear entire cart
    clearCart() {
        secureStorage.setItem(CART_STORAGE_KEY, []);
        this.updateCartCounter();
        return { success: true, message: 'Cart cleared' };
    }

    // Calculate cart subtotal (with discounts)
    calculateSubtotal() {
        const cart = this.getCart();
        return cart.reduce((total, item) => {
            const price = this.getProductEffectivePrice(item);
            return total + (price * item.quantity);
        }, 0);
    }

    // Calculate cart subtotal (original prices)
    calculateSubtotalWithOriginalPrice() {
        const cart = this.getCart();
        return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
    }

    // Calculate tax
    calculateTax(subtotal) {
        return subtotal * TAX_RATE;
    }

    // Calculate delivery charge
    calculateDeliveryCharge(subtotal, expressDelivery = false) {
        const deliveryConfig = this.getDeliveryCharge();
        
        if (subtotal >= deliveryConfig.freeThreshold) {
            return 0;
        }
        
        return expressDelivery ? deliveryConfig.express : deliveryConfig.standard;
    }

    // Get effective product price with discount
    getProductEffectivePrice(product) {
        if (product.discountPercent && product.discountPercent > 0) {
            return product.price * (1 - product.discountPercent / 100);
        }
        return product.price;
    }

    // Calculate discounted price
    calculateDiscountedPrice(originalPrice, discountPercent) {
        return originalPrice * (1 - discountPercent / 100);
    }

    // Get delivery configuration
    getDeliveryCharge() {
        return {
            standard: 50,
            express: 100,
            freeThreshold: 500
        };
    }

    // Calculate delivery time in minutes
    calculateDeliveryMinutes(cart, expressDelivery = false) {
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

    // Format delivery time
    formatDeliveryTime(minutes) {
        const now = new Date();
        const deliveryTime = new Date(now.getTime() + (minutes * 60 * 1000));
        
        const timeOptions = {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
        };
        
        return deliveryTime.toLocaleTimeString('en-US', timeOptions);
    }

    // Get estimated delivery text
    getEstimatedDeliveryText(cart, expressDelivery = false) {
        const minutes = this.calculateDeliveryMinutes(cart, expressDelivery);
        const deliveryTime = this.formatDeliveryTime(minutes);
        
        if (expressDelivery) {
            return `Express delivery: ${minutes} minutes (by ${deliveryTime})`;
        }
        
        return `Estimated delivery: ${minutes} minutes (by ${deliveryTime})`;
    }

    // Calculate total with all charges
    calculateTotal(expressDelivery = false) {
        const subtotal = this.calculateSubtotal();
        const tax = this.calculateTax(subtotal);
        const delivery = this.calculateDeliveryCharge(subtotal, expressDelivery);
        const couponDiscount = this.calculateCouponDiscount();
        
        return subtotal + tax + delivery - couponDiscount;
    }

    // Get cart item count
    getCartCount() {
        const cart = this.getCart();
        return cart.reduce((total, item) => total + item.quantity, 0);
    }

    // Update cart counter in UI
    updateCartCounter() {
        // This will be handled by React context/state
        const count = this.getCartCount();
        // Emit custom event for components to listen to
        window.dispatchEvent(new CustomEvent('cartUpdated', { detail: { count } }));
    }

    // Applied coupon management
    getAppliedCoupon() {
        return secureStorage.getItem(COUPON_STORAGE_KEY);
    }

    setAppliedCoupon(coupon) {
        if (coupon) {
            secureStorage.setItem(COUPON_STORAGE_KEY, coupon);
        } else {
            secureStorage.removeItem(COUPON_STORAGE_KEY);
        }
    }

    // Used coupons tracking
    getUsedCoupons() {
        return secureStorage.getItem(USED_COUPONS_KEY) || [];
    }

    markCouponAsUsed(couponCode) {
        const usedCoupons = this.getUsedCoupons();
        if (!usedCoupons.includes(couponCode)) {
            usedCoupons.push(couponCode);
            secureStorage.setItem(USED_COUPONS_KEY, usedCoupons);
        }
    }

    isCouponUsed(couponCode) {
        const usedCoupons = this.getUsedCoupons();
        return usedCoupons.includes(couponCode);
    }

    // Coupon validation
    validateCoupon(couponCode, cartTotal, cart) {
        const coupon = AVAILABLE_COUPONS.find(c => c.code === couponCode);
        
        if (!coupon) {
            return { valid: false, message: 'Invalid coupon code' };
        }
        
        if (!coupon.active) {
            return { valid: false, message: 'This coupon is no longer active' };
        }
        
        if (this.isCouponExpired(coupon)) {
            return { valid: false, message: 'This coupon has expired' };
        }
        
        if (this.isCouponUsed(coupon.code)) {
            return { valid: false, message: 'This coupon has already been used' };
        }
        
        if (cartTotal < coupon.minOrderValue) {
            return { 
                valid: false, 
                message: `Minimum order value of ₹${coupon.minOrderValue} required` 
            };
        }
        
        // Check category-specific validation
        if (coupon.type === 'category') {
            const applicableCategories = this.getCouponApplicableCategories(coupon);
            const hasMatchingCategory = cart.some(item => applicableCategories.includes(item.category));
            if (!hasMatchingCategory) {
                return { 
                    valid: false, 
                    message: `This coupon requires items from: ${applicableCategories.join(', ')}` 
                };
            }
        }
        
        return { valid: true, coupon };
    }

    // Check if coupon is expired
    isCouponExpired(coupon) {
        if (!coupon.expiryDate) return false;
        const today = new Date();
        const expiry = new Date(coupon.expiryDate);
        return today > expiry;
    }

    // Get coupon applicable categories
    getCouponApplicableCategories(coupon) {
        return coupon.applicableCategories || [];
    }

    // Calculate coupon discount amount
    calculateCouponDiscountAmount(coupon, cartTotal, cart) {
        let discount = 0;
        
        switch (coupon.type) {
            case 'percentage':
                discount = cartTotal * (coupon.value / 100);
                break;
            case 'fixed':
                discount = coupon.value;
                break;
            case 'category':
                // Calculate discount only for applicable categories
                const applicableCategories = this.getCouponApplicableCategories(coupon);
                const applicableItems = cart.filter(item => 
                    applicableCategories.includes(item.category)
                );
                const applicableSubtotal = applicableItems.reduce((total, item) => {
                    const price = this.getProductEffectivePrice(item);
                    return total + (price * item.quantity);
                }, 0);
                discount = applicableSubtotal * (coupon.value / 100);
                break;
        }
        
        // Apply maximum discount limit
        if (coupon.maxDiscount && discount > coupon.maxDiscount) {
            discount = coupon.maxDiscount;
        }
        
        return discount;
    }

    // Calculate coupon discount
    calculateCouponDiscount() {
        const appliedCoupon = this.getAppliedCoupon();
        if (!appliedCoupon) return 0;
        
        const cart = this.getCart();
        const cartTotal = this.calculateSubtotal();
        return this.calculateCouponDiscountAmount(appliedCoupon, cartTotal, cart);
    }

    // Apply coupon to cart
    applyCoupon(couponCode) {
        const cart = this.getCart();
        const cartTotal = this.calculateSubtotal();
        const validation = this.validateCoupon(couponCode, cartTotal, cart);

        if (validation.valid) {
            this.setAppliedCoupon(validation.coupon);
            // Don't mark as used here - only mark as used after successful order placement
            
            const discount = this.calculateCouponDiscountAmount(validation.coupon, cartTotal, cart);
            return {
                success: true,
                coupon: validation.coupon,
                discount,
                newTotal: cartTotal - discount,
                message: `Coupon ${couponCode} applied!`
            };
        }

        return {
            success: false,
            message: validation.message
        };
    }

    // Remove coupon from cart
    removeCoupon() {
        const appliedCoupon = this.getAppliedCoupon();
        if (appliedCoupon) {
            this.setAppliedCoupon(null);
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

    // Get suggested coupons
    getSuggestedCoupons() {
        const appliedCoupon = this.getAppliedCoupon();
        const cart = this.getCart();
        const cartTotal = this.calculateSubtotal();
        
        return AVAILABLE_COUPONS.map(coupon => {
            const eligibility = this.getOfferEligibilityStatus(coupon, cartTotal, cart);
            const potentialDiscount = this.calculateCouponDiscountAmount(coupon, cartTotal, cart);
            const relevanceScore = this.calculateRelevanceScore(coupon, cart, cartTotal);
            const daysUntilExpiry = this.calculateDaysUntilExpiry(coupon.expiryDate);
            const isApplied = appliedCoupon && appliedCoupon.code === coupon.code;
            const isUsed = this.isCouponUsed(coupon.code);
            const eligibilityReason = this.getEligibilityReason(coupon, cartTotal, cart);
            const applicableCategories = this.getCouponApplicableCategories(coupon);
            
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
            if (b.eligibility === 'almost' && a.eligibility !== 'not_applicable') return 1;
            
            // Within same eligibility, sort by potential discount
            return b.potentialDiscount - a.potentialDiscount;
        });
    }

    // Get offer eligibility status
    getOfferEligibilityStatus(coupon, cartTotal, cart) {
        if (!coupon.active || this.isCouponExpired(coupon)) {
            return 'not_applicable';
        }
        
        if (this.isCouponUsed(coupon.code)) {
            return 'not_applicable';
        }
        
        // Check minimum order value
        const shortfall = coupon.minOrderValue - cartTotal;
        if (shortfall <= 0) {
            // Check category match for category-specific coupons
            const applicableCategories = this.getCouponApplicableCategories(coupon);
            if (coupon.type === 'category' && applicableCategories.length > 0) {
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

    // Get eligibility reason
    getEligibilityReason(coupon, cartTotal, cart) {
        if (!coupon.active) {
            return 'This coupon is no longer active';
        }
        
        if (this.isCouponExpired(coupon)) {
            return 'This coupon has expired';
        }
        
        if (this.isCouponUsed(coupon.code)) {
            return 'This coupon has already been used';
        }
        
        if (cartTotal < coupon.minOrderValue) {
            const shortfall = coupon.minOrderValue - cartTotal;
            return `Add ₹${shortfall} more to qualify for this offer`;
        }
        
        const applicableCategories = this.getCouponApplicableCategories(coupon);
        if (coupon.type === 'category' && applicableCategories.length > 0) {
            const hasMatchingCategory = cart.some(item => applicableCategories.includes(item.category));
            if (!hasMatchingCategory) {
                return `This coupon requires items from: ${applicableCategories.join(', ')}`;
            }
        }
        
        return 'Not eligible for this offer';
    }

    // Calculate relevance score
    calculateRelevanceScore(coupon, cart, cartTotal) {
        let score = 50; // Base score
        
        // Higher score for applicable offers
        const eligibility = this.getOfferEligibilityStatus(coupon, cartTotal, cart);
        if (eligibility === 'applicable') score += 30;
        else if (eligibility === 'almost') score += 15;
        
        // Higher score for category matches
        const applicableCategories = this.getCouponApplicableCategories(coupon);
        if (coupon.type === 'category' && applicableCategories.length > 0) {
            const matchingItems = cart.filter(item => applicableCategories.includes(item.category));
            if (matchingItems.length > 0) {
                score += 20;
                // Bonus for high percentage of cart items matching
                const matchPercentage = (matchingItems.length / cart.length) * 100;
                score += Math.min(matchPercentage, 20);
            }
        }
        
        // Higher score for higher discount amounts
        const potentialDiscount = this.calculateCouponDiscountAmount(coupon, cartTotal, cart);
        const discountRatio = potentialDiscount / cartTotal;
        score += Math.min(discountRatio * 100, 25);
        
        // Lower score for soon-to-expire offers (urgency)
        const daysLeft = this.calculateDaysUntilExpiry(coupon.expiryDate);
        if (daysLeft <= 7) score += 10;
        
        return Math.min(Math.max(score, 0), 100);
    }

    // Calculate days until expiry
    calculateDaysUntilExpiry(expiryDate) {
        if (!expiryDate) return 999;
        
        const today = new Date();
        const expiry = new Date(expiryDate);
        const diffTime = expiry - today;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        return Math.max(diffDays, 0);
    }

    // Get smart offer recommendation
    getSmartOfferRecommendation() {
        const suggestions = this.getSuggestedCoupons();
        
        // Find top applicable recommendation
        const applicableOffers = suggestions.filter(offer => offer.eligibility === 'applicable' && !offer.isApplied);
        
        if (applicableOffers.length === 0) {
            // No applicable offers, find the best alternative
            const bestOffer = suggestions.find(offer => !offer.isUsed) || suggestions[0];
            return {
                topRecommendation: bestOffer,
                alternatives: suggestions.slice(1, 3),
                explanation: bestOffer ? this.generateRecommendationExplanation(bestOffer) : "No offers available for your current cart"
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
            explanation: this.generateRecommendationExplanation(topOffer)
        };
    }

    // Generate recommendation explanation
    generateRecommendationExplanation(offer) {
        if (!offer) return "No offers available";
        
        const cartTotal = this.calculateSubtotal();
        
        if (offer.eligibility === 'applicable') {
            return `We recommend ${offer.code} - you'll save ₹${offer.potentialDiscount.toFixed(0)} on this order!`;
        } else if (offer.eligibility === 'almost') {
            return `Add ₹${offer.amountNeeded} more to unlock ${offer.code} and save ₹${offer.potentialDiscount.toFixed(0)}!`;
        } else {
            return `${offer.code} requires ${offer.eligibilityReason}`;
        }
    }
}

export const cartService = new CartService();