document.addEventListener('DOMContentLoaded', function() {
    const root = document.getElementById('productDetailsRoot');
    if (!root) return;

    const shareBtn = document.getElementById('shareBtn');
    const copyLinkBtn = document.getElementById('copyLinkBtn');

    renderLoading(root);

    const productId = getProductIdFromUrl();
    if (!productId) {
        renderNotFound(root);
        setupShareButtons(null);
        return;
    }

    const product = getProductById(productId);

    setTimeout(() => {
        if (!product) {
            renderNotFound(root);
            setupShareButtons(null);
            return;
        }

        document.title = `${product.name} - Happy Groceries 🛒`;

        renderProduct(product, root);
        renderRelatedProducts(product);
        renderReviews(product);
        setupShareButtons(product);

        const qtyInput = document.getElementById('productQty');
        const decreaseBtn = document.getElementById('qtyDecrease');
        const increaseBtn = document.getElementById('qtyIncrease');
        const addToCartBtn = document.getElementById('addToCartBtn');
        const wishlistBtn = document.getElementById('productWishlistBtn');

        const maxQty = getMaxQty(product);
        if (qtyInput) qtyInput.max = maxQty;

        if (decreaseBtn && qtyInput) {
            decreaseBtn.addEventListener('click', function() {
                const current = getQtyValue(qtyInput);
                qtyInput.value = Math.max(1, current - 1);
            });
        }

        if (increaseBtn && qtyInput) {
            increaseBtn.addEventListener('click', function() {
                const current = getQtyValue(qtyInput);
                qtyInput.value = Math.min(maxQty, current + 1);
            });
        }

        if (qtyInput) {
            qtyInput.addEventListener('input', function() {
                const current = getQtyValue(qtyInput);
                qtyInput.value = Math.min(maxQty, Math.max(1, current));
            });
        }

        if (addToCartBtn && qtyInput) {
            addToCartBtn.addEventListener('click', function() {
                if ((product.stock ?? 1) <= 0) {
                    showToast('Out of stock 😢');
                    return;
                }

                const quantity = Math.min(maxQty, getQtyValue(qtyInput));
                addToCart(product, quantity);

                addToCartBtn.classList.add('added');
                setTimeout(() => addToCartBtn.classList.remove('added'), 450);

                qtyInput.value = 1;
            });
        }

        if (wishlistBtn) {
            wishlistBtn.addEventListener('click', function() {
                if (!isUserLoggedIn()) {
                    showToast('Please login to use wishlist');
                    setTimeout(() => {
                        window.location.href = 'login.html';
                    }, 1000);
                    return;
                }

                const isCurrentlyWishlisted = isInWishlist(product.id);
                updateUserWishlist(product.id, !isCurrentlyWishlisted);

                wishlistBtn.textContent = !isCurrentlyWishlisted ? '💖' : '🤍';
                wishlistBtn.classList.toggle('active');

                showToast(!isCurrentlyWishlisted ? 'Added to wishlist 💖' : 'Removed from wishlist');
            });
        }

        if (shareBtn) {
            shareBtn.addEventListener('click', function() {
                shareProduct(product);
            });
        }

        if (copyLinkBtn) {
            copyLinkBtn.addEventListener('click', function() {
                copyCurrentLink();
            });
        }
    }, 150);
});

// Helper function to calculate discounted price
function calculateDiscountedPrice(originalPrice, discountPercent) {
    return originalPrice * (1 - discountPercent / 100);
}

function getProductIdFromUrl() {
    const params = new URLSearchParams(window.location.search);
    const idParam = params.get('id');
    const id = parseInt(idParam, 10);

    if (!idParam || Number.isNaN(id) || id <= 0) {
        return null;
    }

    return id;
}

function getMaxQty(product) {
    const stock = typeof product.stock === 'number' ? product.stock : 99;
    return Math.max(1, Math.min(99, stock > 0 ? stock : 1));
}

function getQtyValue(inputEl) {
    const value = parseInt(inputEl.value, 10);
    if (Number.isNaN(value) || value <= 0) return 1;
    return value;
}

function renderLoading(root) {
    root.innerHTML = `
        <div class="product-details-loading">
            <div class="loading-emoji">🛒</div>
            <h2>Loading product...</h2>
            <p>Please wait a moment ✨</p>
        </div>
    `;
}

function renderNotFound(root) {
    root.innerHTML = `
        <div class="empty-state">
            <div class="empty-state-icon">404</div>
            <h3>Product not found</h3>
            <p>We couldn't find the product you're looking for.</p>
            <a href="shop.html" class="btn-primary" style="margin-top: 1rem;">Browse Products</a>
        </div>
    `;

    const relatedSection = document.getElementById('relatedSection');
    if (relatedSection) relatedSection.style.display = 'none';

    const reviewsGrid = document.getElementById('reviewsGrid');
    if (reviewsGrid) {
        reviewsGrid.innerHTML = `
            <div class="review-card">
                <h3>No reviews available</h3>
                <p>Choose another product to see reviews.</p>
            </div>
        `;
    }
}

function getStockInfo(product) {
    const stock = typeof product.stock === 'number' ? product.stock : 0;

    if (stock <= 0) {
        return { label: 'Out of stock', className: 'out-of-stock', icon: '⛔' };
    }

    if (stock <= 5) {
        return { label: `Low stock (${stock} left)`, className: 'low-stock', icon: '⚡' };
    }

    return { label: `In stock (${stock} available)`, className: 'in-stock', icon: '✅' };
}

function renderProduct(product, root) {
    const isWishlisted = isInWishlist(product.id);
    const stockInfo = getStockInfo(product);
    const categoryBg = typeof getCategoryColor === 'function' ? getCategoryColor(product.category) : 'var(--primary-blue)';
    
    // Calculate discount information
    const hasDiscount = product.discountPercent && product.discountPercent > 0;
    const discountedPrice = hasDiscount ? calculateDiscountedPrice(product.price, product.discountPercent) : product.price;
    const savings = hasDiscount ? product.price - discountedPrice : 0;

    root.innerHTML = `
        <div class="product-details-wrapper">
            <div class="product-details-card">
                <div class="product-details-grid">
                    <div class="product-image-section">
                        <div class="product-details-image">${product.emoji}</div>
                        ${hasDiscount ? `
                            <div class="discount-badge">
                                <span class="discount-percentage">${product.discountPercent}% OFF</span>
                            </div>
                        ` : ''}
                    </div>

                    <div>
                        <h1 class="product-details-name">${product.name}</h1>

                        <div class="product-details-meta">
                            <span class="product-category" style="background: ${categoryBg};">${product.category}</span>
                            <span class="stock-badge ${stockInfo.className}">${stockInfo.icon} ${stockInfo.label}</span>
                        </div>

                        <div class="product-rating" style="margin-bottom: 0.25rem;">
                            ${renderStars(product.rating)}
                            <span style="color: var(--text-dark);">(${product.rating})</span>
                            ${typeof product.reviewsCount === 'number' ? `<span style="color: var(--text-dark);"> • ${product.reviewsCount} reviews</span>` : ''}
                        </div>

                        <div class="product-details-price-section">
                            ${hasDiscount ? `
                                <div class="price-with-discount">
                                    <span class="original-price">₹${product.price}</span>
                                    <span class="discounted-price">₹${discountedPrice.toFixed(0)}</span>
                                </div>
                                <div class="savings-amount">You save ₹${savings.toFixed(0)}!</div>
                            ` : `
                                <div class="product-details-price">₹${product.price}</div>
                            `}
                        </div>

                        <div class="product-details-description">
                            <h3 style="margin-bottom: 0.5rem;">Details</h3>
                            <p>${product.description || 'Fresh, high-quality groceries delivered with love. 💖'}</p>
                        </div>

                        <div class="product-details-actions">
                            <div class="quantity-controls" aria-label="Quantity selector">
                                <button class="qty-btn" id="qtyDecrease" type="button" aria-label="Decrease quantity">−</button>
                                <input type="number" class="qty-input" id="productQty" value="1" min="1" max="99" aria-label="Quantity">
                                <button class="qty-btn" id="qtyIncrease" type="button" aria-label="Increase quantity">+</button>
                            </div>

                            <button class="btn-add-cart" id="addToCartBtn" type="button" ${stockInfo.className === 'out-of-stock' ? 'disabled' : ''}>
                                Add to Cart
                            </button>

                            <button class="product-details-wishlist ${isWishlisted ? 'active' : ''}" id="productWishlistBtn" type="button" aria-label="Toggle wishlist">
                                ${isWishlisted ? '💖' : '🤍'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

function renderRelatedProducts(product) {
    const relatedSection = document.getElementById('relatedSection');
    const relatedGridId = 'relatedProductsGrid';

    const sameCategory = getProductsByCategory(product.category)
        .filter(p => p.id !== product.id);

    const related = shuffleArray(sameCategory).slice(0, 4);

    if (relatedSection) {
        relatedSection.style.display = related.length > 0 ? 'block' : 'none';
    }

    if (related.length > 0) {
        renderProductGrid(related, relatedGridId);
    }
}

function renderReviews(product) {
    const reviewsGrid = document.getElementById('reviewsGrid');
    if (!reviewsGrid) return;

    const reviews = [
        {
            name: 'Aarav',
            rating: 5,
            text: `Super fresh ${product.name}! Will buy again.`
        },
        {
            name: 'Meera',
            rating: 4,
            text: 'Great quality and fast delivery. Very happy with the purchase.'
        }
    ];

    reviewsGrid.innerHTML = reviews.map(r => `
        <div class="review-card">
            <h3>${r.name} <span style="font-weight: 600; color: #ffc107;">${'⭐'.repeat(r.rating)}</span></h3>
            <p style="margin-top: 0.5rem;">${r.text}</p>
        </div>
    `).join('');
}

function setupShareButtons(product) {
    const shareBtn = document.getElementById('shareBtn');
    const copyLinkBtn = document.getElementById('copyLinkBtn');

    if (shareBtn) {
        shareBtn.style.display = typeof navigator.share === 'function' ? 'inline-block' : 'none';
        shareBtn.disabled = !product;
    }

    if (copyLinkBtn) {
        copyLinkBtn.disabled = !product;
    }
}

async function shareProduct(product) {
    if (!product) return;

    if (typeof navigator.share !== 'function') {
        copyCurrentLink();
        return;
    }

    try {
        await navigator.share({
            title: `${product.name} - Happy Groceries`,
            text: `Check out ${product.name} on Happy Groceries!`,
            url: window.location.href
        });
    } catch (err) {
        copyCurrentLink();
    }
}

async function copyCurrentLink() {
    const url = window.location.href;

    try {
        if (navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
            await navigator.clipboard.writeText(url);
            showToast('Link copied 📋');
        } else {
            window.prompt('Copy this link:', url);
        }
    } catch (err) {
        window.prompt('Copy this link:', url);
    }
}

function shuffleArray(arr) {
    const copy = [...arr];
    for (let i = copy.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
}
