const products = [
    { id: 1, name: "Apple", price: 50, category: "Fruits", emoji: "🍎", rating: 4.5 },
    { id: 2, name: "Banana", price: 30, category: "Fruits", emoji: "🍌", rating: 4.2 },
    { id: 3, name: "Orange", price: 40, category: "Fruits", emoji: "🍊", rating: 4.3 },
    { id: 4, name: "Grapes", price: 80, category: "Fruits", emoji: "🍇", rating: 4.6 },
    { id: 5, name: "Strawberry", price: 120, category: "Fruits", emoji: "🍓", rating: 4.8 },
    { id: 6, name: "Watermelon", price: 60, category: "Fruits", emoji: "🍉", rating: 4.4 },
    
    { id: 7, name: "Carrot", price: 30, category: "Vegetables", emoji: "🥕", rating: 4.0 },
    { id: 8, name: "Tomato", price: 25, category: "Vegetables", emoji: "🍅", rating: 4.1 },
    { id: 9, name: "Broccoli", price: 45, category: "Vegetables", emoji: "🥦", rating: 4.2 },
    { id: 10, name: "Cucumber", price: 35, category: "Vegetables", emoji: "🥒", rating: 3.9 },
    { id: 11, name: "Potato", price: 20, category: "Vegetables", emoji: "🥔", rating: 4.0 },
    { id: 12, name: "Corn", price: 40, category: "Vegetables", emoji: "🌽", rating: 4.3 },
    
    { id: 13, name: "Milk", price: 55, category: "Dairy", emoji: "🥛", rating: 4.5 },
    { id: 14, name: "Cheese", price: 150, category: "Dairy", emoji: "🧀", rating: 4.7 },
    { id: 15, name: "Butter", price: 180, category: "Dairy", emoji: "🧈", rating: 4.6 },
    { id: 16, name: "Yogurt", price: 60, category: "Dairy", emoji: "🥛", rating: 4.4 },
    
    { id: 17, name: "Cookies", price: 80, category: "Snacks", emoji: "🍪", rating: 4.8 },
    { id: 18, name: "Chips", price: 50, category: "Snacks", emoji: "🥔", rating: 4.5 },
    { id: 19, name: "Chocolate", price: 100, category: "Snacks", emoji: "🍫", rating: 4.9 },
    { id: 20, name: "Popcorn", price: 70, category: "Snacks", emoji: "🍿", rating: 4.3 },
    
    { id: 21, name: "Orange Juice", price: 90, category: "Beverages", emoji: "🧃", rating: 4.4 },
    { id: 22, name: "Coffee", price: 200, category: "Beverages", emoji: "☕", rating: 4.7 },
    { id: 23, name: "Tea", price: 120, category: "Beverages", emoji: "🍵", rating: 4.5 },
    { id: 24, name: "Soda", price: 40, category: "Beverages", emoji: "🥤", rating: 3.8 }
];

function getAllProducts() {
    return [...products];
}

function getProductById(id) {
    return products.find(product => product.id === id);
}

function getProductsByCategory(category) {
    if (!category || category === 'All') return products;
    return products.filter(product => product.category === category);
}

function searchProducts(query) {
    if (!query) return products;
    const lowercaseQuery = query.toLowerCase();
    return products.filter(product => 
        product.name.toLowerCase().includes(lowercaseQuery) ||
        product.category.toLowerCase().includes(lowercaseQuery)
    );
}

function sortProducts(products, sortBy) {
    const sortedProducts = [...products];
    
    switch (sortBy) {
        case 'price-low':
            return sortedProducts.sort((a, b) => a.price - b.price);
        case 'price-high':
            return sortedProducts.sort((a, b) => b.price - a.price);
        case 'name-asc':
            return sortedProducts.sort((a, b) => a.name.localeCompare(b.name));
        case 'name-desc':
            return sortedProducts.sort((a, b) => b.name.localeCompare(a.name));
        case 'rating':
            return sortedProducts.sort((a, b) => b.rating - a.rating);
        default:
            return sortedProducts;
    }
}

function filterAndSearchProducts(query = '', category = 'All', sortBy = 'default') {
    let results = getAllProducts();
    
    if (category !== 'All') {
        results = getProductsByCategory(category);
    }
    
    if (query) {
        results = results.filter(product =>
            product.name.toLowerCase().includes(query.toLowerCase()) ||
            product.category.toLowerCase().includes(query.toLowerCase())
        );
    }
    
    if (sortBy !== 'default') {
        results = sortProducts(results, sortBy);
    }
    
    return results;
}

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

function renderStars(rating) {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    let stars = '';
    
    for (let i = 0; i < fullStars; i++) {
        stars += '⭐';
    }
    if (hasHalfStar) {
        stars += '⭐';
    }
    
    return stars;
}
