const CART_STORAGE_KEY = 'happyGroceries_cart';

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
    
    const subtotal = calculateSubtotal();
    return calculateCouponDiscount(appliedCoupon, subtotal);
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
