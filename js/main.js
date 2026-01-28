document.addEventListener('DOMContentLoaded', function() {
    initializeNavbar();
    initializeDarkMode();
    updateCartCounter();
    
    const currentPage = window.location.pathname;
    
    if (currentPage.includes('index.html') || currentPage === '/' || currentPage === '') {
        loadFeaturedProducts();
    }
    
    const hamburger = document.getElementById('hamburger');
    const navMenu = document.getElementById('navMenu');
    
    if (hamburger && navMenu) {
        hamburger.addEventListener('click', () => {
            hamburger.classList.toggle('active');
            navMenu.classList.toggle('active');
        });
        
        document.addEventListener('click', (e) => {
            if (!hamburger.contains(e.target) && !navMenu.contains(e.target)) {
                hamburger.classList.remove('active');
                navMenu.classList.remove('active');
            }
        });
    }
    
    const profileBtn = document.getElementById('profileBtn');
    const profileDropdown = document.getElementById('profileDropdown');
    
    if (profileBtn && profileDropdown) {
        profileBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            profileDropdown.classList.toggle('active');
        });
        
        document.addEventListener('click', (e) => {
            if (!profileBtn.contains(e.target) && !profileDropdown.contains(e.target)) {
                profileDropdown.classList.remove('active');
            }
        });
    }
    
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            logoutUser();
        });
    }
});

function initializeNavbar() {
    const isLoggedIn = isUserLoggedIn();
    const authButtons = document.getElementById('authButtons');
    const userProfile = document.getElementById('userProfile');
    const userName = document.getElementById('userName');
    
    if (isLoggedIn) {
        const user = getCurrentUser();
        if (authButtons) authButtons.style.display = 'none';
        if (userProfile) userProfile.style.display = 'block';
        if (userName) userName.textContent = user.name.split(' ')[0];
    } else {
        if (authButtons) authButtons.style.display = 'flex';
        if (userProfile) userProfile.style.display = 'none';
    }
    
    updateActiveNavLink();
}

function updateActiveNavLink() {
    const currentPath = window.location.pathname;
    const navLinks = document.querySelectorAll('.nav-link');
    
    navLinks.forEach(link => {
        link.classList.remove('active');
        const linkPath = link.getAttribute('href');
        
        if (currentPath.includes(linkPath) || 
            (currentPath === '/' && linkPath === 'index.html')) {
            link.classList.add('active');
        }
    });
}

function initializeDarkMode() {
    const themeToggle = document.getElementById('themeToggle');
    const themeIcon = themeToggle?.querySelector('.theme-icon');
    const savedTheme = localStorage.getItem('theme');
    
    if (savedTheme === 'dark') {
        document.body.classList.add('dark-mode');
        if (themeIcon) themeIcon.textContent = '☀️';
    }
    
    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            document.body.classList.toggle('dark-mode');
            const isDark = document.body.classList.contains('dark-mode');
            if (themeIcon) themeIcon.textContent = isDark ? '☀️' : '🌙';
            localStorage.setItem('theme', isDark ? 'dark' : 'light');
        });
    }
}

function loadFeaturedProducts() {
    const container = document.getElementById('featuredProducts');
    if (!container) return;
    
    const featuredProducts = getAllProducts().slice(0, 8);
    container.innerHTML = featuredProducts.map(product => createProductCard(product)).join('');
    
    attachProductCardListeners();
}

function createProductCard(product) {
    const isWishlisted = isInWishlist(product.id);
    const heartIcon = isWishlisted ? '💖' : '🤍';
    
    return `
        <div class="product-card" data-product-id="${product.id}">
            <button class="wishlist-btn ${isWishlisted ? 'active' : ''}" data-product-id="${product.id}">
                ${heartIcon}
            </button>
            <div class="product-image">${product.emoji}</div>
            <h3 class="product-name">${product.name}</h3>
            <span class="product-category">${product.category}</span>
            <div class="product-rating">${renderStars(product.rating)} (${product.rating})</div>
            <p class="product-price">₹${product.price}</p>
            <div class="product-actions">
                <div class="quantity-controls">
                    <button class="qty-btn qty-decrease" data-product-id="${product.id}">−</button>
                    <input type="number" class="qty-input" value="1" min="1" max="99" data-product-id="${product.id}">
                    <button class="qty-btn qty-increase" data-product-id="${product.id}">+</button>
                </div>
                <button class="btn-add-cart" data-product-id="${product.id}">Add to Cart</button>
            </div>
        </div>
    `;
}

function attachProductCardListeners() {
    document.querySelectorAll('.btn-add-cart').forEach(btn => {
        btn.addEventListener('click', handleAddToCart);
    });
    
    document.querySelectorAll('.qty-decrease').forEach(btn => {
        btn.addEventListener('click', handleQuantityDecrease);
    });
    
    document.querySelectorAll('.qty-increase').forEach(btn => {
        btn.addEventListener('click', handleQuantityIncrease);
    });
    
    document.querySelectorAll('.wishlist-btn').forEach(btn => {
        btn.addEventListener('click', handleWishlistToggle);
    });
    
    document.querySelectorAll('.qty-input').forEach(input => {
        input.addEventListener('input', handleQuantityInput);
    });
}

function handleAddToCart(e) {
    const productId = parseInt(e.target.dataset.productId);
    const product = getProductById(productId);
    const qtyInput = document.querySelector(`.qty-input[data-product-id="${productId}"]`);
    const quantity = parseInt(qtyInput.value) || 1;
    
    if (product) {
        addToCart(product, quantity);
        qtyInput.value = 1;
    }
}

function handleQuantityDecrease(e) {
    const productId = e.target.dataset.productId;
    const input = document.querySelector(`.qty-input[data-product-id="${productId}"]`);
    let value = parseInt(input.value) || 1;
    if (value > 1) {
        input.value = value - 1;
    }
}

function handleQuantityIncrease(e) {
    const productId = e.target.dataset.productId;
    const input = document.querySelector(`.qty-input[data-product-id="${productId}"]`);
    let value = parseInt(input.value) || 1;
    if (value < 99) {
        input.value = value + 1;
    }
}

function handleQuantityInput(e) {
    let value = parseInt(e.target.value);
    if (isNaN(value) || value < 1) {
        e.target.value = 1;
    } else if (value > 99) {
        e.target.value = 99;
    }
}

function handleWishlistToggle(e) {
    e.stopPropagation();
    
    if (!isUserLoggedIn()) {
        showToast('Please login to use wishlist');
        setTimeout(() => {
            window.location.href = '../pages/login.html';
        }, 1000);
        return;
    }
    
    const productId = parseInt(e.target.dataset.productId);
    const isCurrentlyWishlisted = isInWishlist(productId);
    
    updateUserWishlist(productId, !isCurrentlyWishlisted);
    
    e.target.textContent = !isCurrentlyWishlisted ? '💖' : '🤍';
    e.target.classList.toggle('active');
    
    showToast(!isCurrentlyWishlisted ? 'Added to wishlist 💖' : 'Removed from wishlist');
}

function renderProductGrid(products, containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    if (products.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">😢</div>
                <h3>No products found</h3>
                <p>Try adjusting your search or filters</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = products.map(product => createProductCard(product)).join('');
    attachProductCardListeners();
}
