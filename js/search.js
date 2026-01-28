const products = [
    {
        id: 1,
        name: "Apple",
        price: 50,
        category: "Fruits",
        emoji: "🍎",
        rating: 4.5,
        reviewsCount: 128,
        stock: 25,
        description: "Crisp, juicy apples packed with fiber and natural sweetness. Perfect for snacking, salads, and fresh juice."
    },
    {
        id: 2,
        name: "Banana",
        price: 30,
        category: "Fruits",
        emoji: "🍌",
        rating: 4.2,
        reviewsCount: 94,
        stock: 40,
        description: "Naturally sweet bananas rich in potassium. Great for smoothies, breakfast bowls, and quick energy."
    },
    {
        id: 3,
        name: "Orange",
        price: 40,
        category: "Fruits",
        emoji: "🍊",
        rating: 4.3,
        reviewsCount: 76,
        stock: 30,
        description: "Fresh oranges bursting with vitamin C. Enjoy as a snack or squeeze for a refreshing juice."
    },
    {
        id: 4,
        name: "Grapes",
        price: 80,
        category: "Fruits",
        emoji: "🍇",
        rating: 4.6,
        reviewsCount: 62,
        stock: 18,
        description: "Sweet, seedless grapes that are perfect for snacking and fruit platters. Chill for extra freshness."
    },
    {
        id: 5,
        name: "Strawberry",
        price: 120,
        category: "Fruits",
        emoji: "🍓",
        rating: 4.8,
        reviewsCount: 141,
        stock: 10,
        description: "Bright, fragrant strawberries with a sweet-tart taste. Best for desserts, toppings, and smoothies."
    },
    {
        id: 6,
        name: "Watermelon",
        price: 60,
        category: "Fruits",
        emoji: "🍉",
        rating: 4.4,
        reviewsCount: 58,
        stock: 12,
        description: "Refreshing watermelon with a high water content—great for summer hydration and fruit salads."
    },

    {
        id: 7,
        name: "Carrot",
        price: 30,
        category: "Vegetables",
        emoji: "🥕",
        rating: 4.0,
        reviewsCount: 44,
        stock: 35,
        description: "Crunchy carrots rich in beta-carotene. Ideal for salads, soups, and healthy snacking."
    },
    {
        id: 8,
        name: "Tomato",
        price: 25,
        category: "Vegetables",
        emoji: "🍅",
        rating: 4.1,
        reviewsCount: 52,
        stock: 28,
        description: "Juicy tomatoes that add flavor to curries, sandwiches, and salads. A kitchen staple!"
    },
    {
        id: 9,
        name: "Broccoli",
        price: 45,
        category: "Vegetables",
        emoji: "🥦",
        rating: 4.2,
        reviewsCount: 39,
        stock: 16,
        description: "Fresh broccoli florets loaded with nutrients. Steam, stir-fry, or roast for a delicious side."
    },
    {
        id: 10,
        name: "Cucumber",
        price: 35,
        category: "Vegetables",
        emoji: "🥒",
        rating: 3.9,
        reviewsCount: 31,
        stock: 22,
        description: "Cool and crisp cucumbers—perfect for salads, raita, and refreshing hydration."
    },
    {
        id: 11,
        name: "Potato",
        price: 20,
        category: "Vegetables",
        emoji: "🥔",
        rating: 4.0,
        reviewsCount: 67,
        stock: 50,
        description: "Versatile potatoes for curries, fries, and snacks. A must-have for everyday cooking."
    },
    {
        id: 12,
        name: "Corn",
        price: 40,
        category: "Vegetables",
        emoji: "🌽",
        rating: 4.3,
        reviewsCount: 46,
        stock: 20,
        description: "Sweet corn that's great boiled, grilled, or tossed into soups and salads for extra crunch."
    },

    {
        id: 13,
        name: "Milk",
        price: 55,
        category: "Dairy",
        emoji: "🥛",
        rating: 4.5,
        reviewsCount: 110,
        stock: 24,
        description: "Fresh, creamy milk—perfect for tea, coffee, cereals, and everyday nutrition."
    },
    {
        id: 14,
        name: "Cheese",
        price: 150,
        category: "Dairy",
        emoji: "🧀",
        rating: 4.7,
        reviewsCount: 88,
        stock: 14,
        description: "Rich and flavorful cheese that melts beautifully. Great for sandwiches, pasta, and snacks."
    },
    {
        id: 15,
        name: "Butter",
        price: 180,
        category: "Dairy",
        emoji: "🧈",
        rating: 4.6,
        reviewsCount: 73,
        stock: 9,
        description: "Creamy butter for spreading, baking, and cooking. Adds a delicious richness to any dish."
    },
    {
        id: 16,
        name: "Yogurt",
        price: 60,
        category: "Dairy",
        emoji: "🥛",
        rating: 4.4,
        reviewsCount: 66,
        stock: 18,
        description: "Smooth yogurt that's great for breakfast, smoothies, and homemade raita."
    },

    {
        id: 17,
        name: "Cookies",
        price: 80,
        category: "Snacks",
        emoji: "🍪",
        rating: 4.8,
        reviewsCount: 152,
        stock: 32,
        description: "Crunchy cookies with a delightful sweetness—perfect with tea, coffee, or as a quick treat."
    },
    {
        id: 18,
        name: "Chips",
        price: 50,
        category: "Snacks",
        emoji: "🥔",
        rating: 4.5,
        reviewsCount: 97,
        stock: 45,
        description: "Crispy, salty chips for movie nights and snack cravings. Enjoy the crunch!"
    },
    {
        id: 19,
        name: "Chocolate",
        price: 100,
        category: "Snacks",
        emoji: "🍫",
        rating: 4.9,
        reviewsCount: 210,
        stock: 27,
        description: "Smooth, indulgent chocolate to satisfy your sweet tooth. Great for gifting and desserts."
    },
    {
        id: 20,
        name: "Popcorn",
        price: 70,
        category: "Snacks",
        emoji: "🍿",
        rating: 4.3,
        reviewsCount: 54,
        stock: 38,
        description: "Light and fluffy popcorn—perfect for binge-watching and quick snacking."
    },

    {
        id: 21,
        name: "Orange Juice",
        price: 90,
        category: "Beverages",
        emoji: "🧃",
        rating: 4.4,
        reviewsCount: 61,
        stock: 20,
        description: "Refreshing orange juice with a citrusy punch. Serve chilled for the best taste."
    },
    {
        id: 22,
        name: "Coffee",
        price: 200,
        category: "Beverages",
        emoji: "☕",
        rating: 4.7,
        reviewsCount: 139,
        stock: 15,
        description: "Aromatic coffee to kickstart your day. Enjoy hot, iced, or with your favorite milk."
    },
    {
        id: 23,
        name: "Tea",
        price: 120,
        category: "Beverages",
        emoji: "🍵",
        rating: 4.5,
        reviewsCount: 103,
        stock: 22,
        description: "Comforting tea for every mood. Brew strong or light—your perfect cup awaits."
    },
    {
        id: 24,
        name: "Soda",
        price: 40,
        category: "Beverages",
        emoji: "🥤",
        rating: 3.8,
        reviewsCount: 29,
        stock: 0,
        description: "Classic fizzy soda—cool and refreshing. Best served chilled with ice."
    }
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
