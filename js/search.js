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
        discountPercent: 15,
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
        discountPercent: 20,
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
        discountPercent: 18,
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
        discountPercent: 25,
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
        discountPercent: 30,
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
        discountPercent: 12,
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
        discountPercent: 20,
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
        discountPercent: 15,
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
        discountPercent: 18,
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
        discountPercent: 22,
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
        discountPercent: 10,
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
        discountPercent: 16,
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
        discountPercent: 10,
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
        discountPercent: 15,
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
        discountPercent: 8,
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
        discountPercent: 12,
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
        discountPercent: 25,
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
        discountPercent: 20,
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
        discountPercent: 30,
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
        discountPercent: 35,
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
        discountPercent: 15,
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
        discountPercent: 20,
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
        discountPercent: 18,
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
        discountPercent: 0,
        description: "Classic fizzy soda—cool and refreshing. Best served chilled with ice."
    },
    {
        id: 25,
        name: "Mango",
        price: 100,
        category: "Fruits",
        emoji: "🥭",
        rating: 4.7,
        reviewsCount: 115,
        stock: 20,
        discountPercent: 25,
        description: "Sweet and juicy Alphonso mangoes, known as the king of fruits."
    },
    {
        id: 26,
        name: "Pineapple",
        price: 80,
        category: "Fruits",
        emoji: "🍍",
        rating: 4.5,
        reviewsCount: 82,
        stock: 15,
        discountPercent: 20,
        description: "Tropical pineapples with a sweet and tangy flavor. Great for desserts and juices."
    },
    {
        id: 27,
        name: "Kiwi",
        price: 120,
        category: "Fruits",
        emoji: "🥝",
        rating: 4.6,
        reviewsCount: 64,
        stock: 25,
        discountPercent: 0,
        description: "Tangy and vitamin-rich kiwis with a unique flavor and vibrant green flesh."
    },
    {
        id: 28,
        name: "Papaya",
        price: 50,
        category: "Fruits",
        emoji: "🍈",
        rating: 4.2,
        reviewsCount: 45,
        stock: 18,
        discountPercent: 18,
        description: "Ripe and sweet papayas, perfect for a healthy breakfast or snack."
    },
    {
        id: 29,
        name: "Guava",
        price: 40,
        category: "Fruits",
        emoji: "🍈",
        rating: 4.1,
        reviewsCount: 38,
        stock: 30,
        discountPercent: 22,
        description: "Fresh pink guavas, crunchy and full of vitamin C. Great with a pinch of salt and chili."
    },
    {
        id: 30,
        name: "Pomegranate",
        price: 150,
        category: "Fruits",
        emoji: "🍎",
        rating: 4.8,
        reviewsCount: 92,
        stock: 12,
        discountPercent: 0,
        description: "Juicy red pomegranate pearls, packed with antioxidants and sweet-tart flavor."
    },
    {
        id: 31,
        name: "Blueberry",
        price: 300,
        category: "Fruits",
        emoji: "🫐",
        rating: 4.9,
        reviewsCount: 156,
        stock: 10,
        discountPercent: 0,
        description: "Premium fresh blueberries, perfect for smoothies, pancakes, or healthy snacking."
    },
    {
        id: 32,
        name: "Peach",
        price: 180,
        category: "Fruits",
        emoji: "🍑",
        rating: 4.4,
        reviewsCount: 53,
        stock: 14,
        discountPercent: 0,
        description: "Soft and sweet peaches with a delicate aroma. Ideal for desserts and salads."
    },
    {
        id: 33,
        name: "Cherry",
        price: 250,
        category: "Fruits",
        emoji: "🍒",
        rating: 4.7,
        reviewsCount: 124,
        stock: 8,
        discountPercent: 0,
        description: "Sweet red cherries, a perfect seasonal treat for snacking or baking."
    },
    {
        id: 34,
        name: "Avocado",
        price: 200,
        category: "Fruits",
        emoji: "🥑",
        rating: 4.3,
        reviewsCount: 89,
        stock: 12,
        discountPercent: 0,
        description: "Creamy ripe avocados, perfect for toast, salads, and healthy fats."
    },
    {
        id: 35,
        name: "Spinach",
        price: 30,
        category: "Vegetables",
        emoji: "🥬",
        rating: 4.5,
        reviewsCount: 78,
        stock: 40,
        discountPercent: 15,
        description: "Fresh green spinach leaves, nutrient-dense and versatile for cooking."
    },
    {
        id: 36,
        name: "Cauliflower",
        price: 50,
        category: "Vegetables",
        emoji: "🥦",
        rating: 4.1,
        reviewsCount: 42,
        stock: 22,
        discountPercent: 18,
        description: "Fresh white cauliflower florets, great for curries, roasting, or stir-frying."
    },
    {
        id: 37,
        name: "Cabbage",
        price: 40,
        category: "Vegetables",
        emoji: "🥬",
        rating: 4.0,
        reviewsCount: 35,
        stock: 25,
        discountPercent: 20,
        description: "Crunchy green cabbage, perfect for salads, slaws, and stir-fries."
    },
    {
        id: 38,
        name: "Onion",
        price: 45,
        category: "Vegetables",
        emoji: "🧅",
        rating: 4.2,
        reviewsCount: 160,
        stock: 100,
        discountPercent: 10,
        description: "Essential red onions for every kitchen. Adds flavor and crunch to any dish."
    },
    {
        id: 39,
        name: "Garlic",
        price: 20,
        category: "Vegetables",
        emoji: "🧄",
        rating: 4.6,
        reviewsCount: 95,
        stock: 60,
        discountPercent: 12,
        description: "Pungent and flavorful garlic cloves, a must-have for seasoning and health."
    },
    {
        id: 40,
        name: "Bell Pepper",
        price: 80,
        category: "Vegetables",
        emoji: "🫑",
        rating: 4.4,
        reviewsCount: 67,
        stock: 15,
        discountPercent: 15,
        description: "Vibrant and crunchy bell peppers, perfect for stir-fries, salads, and stuffing."
    },
    {
        id: 41,
        name: "Sweet Potato",
        price: 60,
        category: "Vegetables",
        emoji: "🍠",
        rating: 4.3,
        reviewsCount: 48,
        stock: 30,
        discountPercent: 18,
        description: "Nutritious sweet potatoes, great for roasting, mashing, or as a healthy snack."
    },
    {
        id: 42,
        name: "Peas",
        price: 70,
        category: "Vegetables",
        emoji: "🫛",
        rating: 4.5,
        reviewsCount: 52,
        stock: 20,
        discountPercent: 20,
        description: "Fresh green peas, sweet and tender. Ideal for curries, pulao, and side dishes."
    },
    {
        id: 43,
        name: "Beans",
        price: 50,
        category: "Vegetables",
        emoji: "🫛",
        rating: 4.2,
        reviewsCount: 41,
        stock: 25,
        discountPercent: 16,
        description: "Fresh green beans, crunchy and nutritious. Great for stir-frying and steaming."
    },
    {
        id: 44,
        name: "Mushrooms",
        price: 90,
        category: "Vegetables",
        emoji: "🍄",
        rating: 4.7,
        reviewsCount: 84,
        stock: 12,
        discountPercent: 0,
        description: "Fresh button mushrooms, earthy and savory. Perfect for pasta, pizzas, and stir-fries."
    },
    {
        id: 45,
        name: "Paneer",
        price: 120,
        category: "Dairy",
        emoji: "🧀",
        rating: 4.8,
        reviewsCount: 142,
        stock: 18,
        discountPercent: 12,
        description: "Fresh and soft cottage cheese (paneer), a versatile protein for Indian dishes."
    },
    {
        id: 46,
        name: "Ghee",
        price: 600,
        category: "Dairy",
        emoji: "🧈",
        rating: 4.9,
        reviewsCount: 215,
        stock: 15,
        discountPercent: 10,
        description: "Pure cow ghee, aromatic and rich. Perfect for cooking and adding flavor to meals."
    },
    {
        id: 47,
        name: "Ice Cream",
        price: 250,
        category: "Dairy",
        emoji: "🍦",
        rating: 4.7,
        reviewsCount: 188,
        stock: 10,
        discountPercent: 15,
        description: "Creamy vanilla ice cream, the perfect dessert to satisfy your sweet cravings."
    },
    {
        id: 48,
        name: "Buttermilk",
        price: 30,
        category: "Dairy",
        emoji: "🥛",
        rating: 4.2,
        reviewsCount: 63,
        stock: 40,
        discountPercent: 8,
        description: "Refreshing and cooling buttermilk, great for digestion and summer heat."
    },
    {
        id: 49,
        name: "Flavored Yogurt",
        price: 80,
        category: "Dairy",
        emoji: "🥛",
        rating: 4.5,
        reviewsCount: 76,
        stock: 25,
        discountPercent: 12,
        description: "Delicious fruit-flavored yogurt, a healthy and tasty snack for any time."
    },
    {
        id: 50,
        name: "Whipped Cream",
        price: 150,
        category: "Dairy",
        emoji: "🥛",
        rating: 4.3,
        reviewsCount: 45,
        stock: 12,
        discountPercent: 0,
        description: "Light and fluffy whipped cream, perfect for topping desserts and fruits."
    },
    {
        id: 51,
        name: "Sour Cream",
        price: 120,
        category: "Dairy",
        emoji: "🥛",
        rating: 4.1,
        reviewsCount: 32,
        stock: 15,
        discountPercent: 0,
        description: "Thick and tangy sour cream, ideal for dips, baked potatoes, and tacos."
    },
    {
        id: 52,
        name: "Condensed Milk",
        price: 180,
        category: "Dairy",
        emoji: "🥛",
        rating: 4.6,
        reviewsCount: 87,
        stock: 20,
        discountPercent: 10,
        description: "Sweetened condensed milk, a key ingredient for many delicious desserts."
    },
    {
        id: 53,
        name: "Soya Milk",
        price: 90,
        category: "Dairy",
        emoji: "🥛",
        rating: 4.0,
        reviewsCount: 42,
        stock: 18,
        discountPercent: 15,
        description: "Nutritious plant-based soya milk, a great dairy alternative for health-conscious users."
    },
    {
        id: 54,
        name: "Almond Milk",
        price: 250,
        category: "Dairy",
        emoji: "🥛",
        rating: 4.4,
        reviewsCount: 59,
        stock: 14,
        discountPercent: 0,
        description: "Creamy almond milk, a delicious and healthy non-dairy milk alternative."
    },
    {
        id: 55,
        name: "Almonds",
        price: 400,
        category: "Snacks",
        emoji: "🥜",
        rating: 4.8,
        reviewsCount: 134,
        stock: 30,
        discountPercent: 15,
        description: "Premium roasted almonds, a crunchy and nutritious snack packed with vitamin E."
    },
    {
        id: 56,
        name: "Cashews",
        price: 500,
        category: "Snacks",
        emoji: "🥜",
        rating: 4.9,
        reviewsCount: 122,
        stock: 25,
        discountPercent: 18,
        description: "Creamy and delicious cashew nuts, perfect for snacking or adding to desserts."
    },
    {
        id: 57,
        name: "Walnuts",
        price: 600,
        category: "Snacks",
        emoji: "🥜",
        rating: 4.7,
        reviewsCount: 88,
        stock: 20,
        discountPercent: 20,
        description: "Healthy walnuts, rich in omega-3 fatty acids. Great for brain health and snacking."
    },
    {
        id: 58,
        name: "Raisins",
        price: 150,
        category: "Snacks",
        emoji: "🍇",
        rating: 4.5,
        reviewsCount: 67,
        stock: 35,
        discountPercent: 22,
        description: "Sweet and chewy raisins, a natural energy booster for your day."
    },
    {
        id: 59,
        name: "Granola",
        price: 250,
        category: "Snacks",
        emoji: "🥣",
        rating: 4.4,
        reviewsCount: 91,
        stock: 15,
        discountPercent: 25,
        description: "Crunchy granola with nuts and honey, perfect for a healthy breakfast or snack."
    },
    {
        id: 60,
        name: "Trail Mix",
        price: 300,
        category: "Snacks",
        emoji: "🥜",
        rating: 4.6,
        reviewsCount: 73,
        stock: 20,
        discountPercent: 20,
        description: "A mix of nuts, seeds, and dried fruits for sustained energy on the go."
    },
    {
        id: 61,
        name: "Pretzels",
        price: 100,
        category: "Snacks",
        emoji: "🥨",
        rating: 4.2,
        reviewsCount: 54,
        stock: 40,
        discountPercent: 30,
        description: "Classic salted pretzels, a crunchy and satisfying snack for any time."
    },
    {
        id: 62,
        name: "Nachos",
        price: 90,
        category: "Snacks",
        emoji: "🌮",
        rating: 4.3,
        reviewsCount: 86,
        stock: 30,
        discountPercent: 25,
        description: "Crispy corn nachos, perfect with cheese dip or salsa for movie nights."
    },
    {
        id: 63,
        name: "Peanuts",
        price: 60,
        category: "Snacks",
        emoji: "🥜",
        rating: 4.1,
        reviewsCount: 102,
        stock: 50,
        discountPercent: 15,
        description: "Roasted and salted peanuts, a classic and affordable high-protein snack."
    },
    {
        id: 64,
        name: "Pistachios",
        price: 700,
        category: "Snacks",
        emoji: "🥜",
        rating: 4.8,
        reviewsCount: 115,
        stock: 18,
        discountPercent: 0,
        description: "Delicious roasted pistachios, fun to crack and full of nutrients."
    },
    {
        id: 65,
        name: "Mango Juice",
        price: 80,
        category: "Beverages",
        emoji: "🥭",
        rating: 4.6,
        reviewsCount: 94,
        stock: 25,
        discountPercent: 18,
        description: "Sweet and thick mango nectar, made from the finest ripe mangoes."
    },
    {
        id: 66,
        name: "Apple Juice",
        price: 90,
        category: "Beverages",
        emoji: "🍎",
        rating: 4.5,
        reviewsCount: 78,
        stock: 22,
        discountPercent: 15,
        description: "Clear and refreshing apple juice, naturally sweet and full of flavor."
    },
    {
        id: 67,
        name: "Cranberry Juice",
        price: 150,
        category: "Beverages",
        emoji: "🥤",
        rating: 4.4,
        reviewsCount: 52,
        stock: 15,
        discountPercent: 0,
        description: "Tart and refreshing cranberry juice, great on its own or as a mixer."
    },
    {
        id: 68,
        name: "Green Tea",
        price: 180,
        category: "Beverages",
        emoji: "🍵",
        rating: 4.7,
        reviewsCount: 145,
        stock: 30,
        discountPercent: 20,
        description: "Healthy green tea leaves, rich in antioxidants for a revitalizing break."
    },
    {
        id: 69,
        name: "Energy Drink",
        price: 120,
        category: "Beverages",
        emoji: "⚡",
        rating: 4.1,
        reviewsCount: 63,
        stock: 40,
        discountPercent: 25,
        description: "Instant energy boost to keep you going through your busy day."
    },
    {
        id: 70,
        name: "Coconut Water",
        price: 60,
        category: "Beverages",
        emoji: "🥥",
        rating: 4.9,
        reviewsCount: 112,
        stock: 50,
        discountPercent: 12,
        description: "Natural and refreshing coconut water, perfect for hydration and electrolytes."
    },
    {
        id: 71,
        name: "Smoothie",
        price: 150,
        category: "Beverages",
        emoji: "🥤",
        rating: 4.8,
        reviewsCount: 89,
        stock: 12,
        discountPercent: 20,
        description: "Delicious mixed fruit smoothie, a healthy and filling drink for any time."
    },
    {
        id: 72,
        name: "Milkshake",
        price: 120,
        category: "Beverages",
        emoji: "🥤",
        rating: 4.7,
        reviewsCount: 134,
        stock: 15,
        discountPercent: 18,
        description: "Thick and creamy chocolate milkshake, a classic treat for all ages."
    },
    {
        id: 73,
        name: "Lemonade",
        price: 40,
        category: "Beverages",
        emoji: "🍋",
        rating: 4.3,
        reviewsCount: 72,
        stock: 45,
        discountPercent: 15,
        description: "Zesty and refreshing lemonade, the perfect thirst quencher on a hot day."
    },
    {
        id: 74,
        name: "Hot Chocolate",
        price: 100,
        category: "Beverages",
        emoji: "☕",
        rating: 4.6,
        reviewsCount: 121,
        stock: 20,
        discountPercent: 10,
        description: "Rich and comforting hot chocolate, perfect for cozy evenings."
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
