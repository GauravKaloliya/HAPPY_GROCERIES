-- Happy Groceries Seed Data
-- Coupons: 15 total
-- Realistic 2026 Indian prices
-- =====================================================
-- CATEGORIES
-- =====================================================
INSERT INTO categories (name, description, emoji, color, created_at)
VALUES
    ('Fruits', 'Fresh fruits from local farms', '🍎', 'var(--primary-pink)', NOW()),
    ('Vegetables', 'Fresh vegetables for a healthy diet', '🥕', 'var(--primary-green)', NOW()),
    ('Dairy', 'Dairy products including milk, cheese, and more', '🥛', 'var(--primary-blue)', NOW()),
    ('Snacks', 'Delicious snacks for every mood', '🍪', 'var(--primary-orange)', NOW()),
    ('Beverages', 'Refreshing drinks and beverages', '🧃', 'var(--primary-purple)', NOW())
ON CONFLICT (name) DO NOTHING;

-- =====================================================
-- PRODUCTS (74 products)
-- =====================================================
-- FRUITS (16)
INSERT INTO products (id, name, price, category_id, emoji, rating, reviews_count, stock, discount_percent, description,
                      sku, brand, weight, weight_unit, quantity_per_unit, is_organic, is_vegetarian,
                      is_active, created_at, updated_at)
VALUES
    (1, 'Apple', 170.00, 1, '🍎', 0.0, 0, 25, 15, 'Crisp, juicy apples packed with fiber and natural sweetness. Perfect for snacking, salads, and fresh juice.',
     'FRT-APP-001', 'Fresho/Shimla', 1.00, 'kg', 'per kg', FALSE, TRUE, TRUE, NOW(), NOW()),
    (2, 'Banana', 60.00, 1, '🍌', 0.0, 0, 40, 20, 'Naturally sweet bananas rich in potassium. Great for smoothies, breakfast bowls, and quick energy.',
     'FRT-BAN-001', 'Robusta', 1.00, 'kg', 'per kg (~8-10 pcs)', FALSE, TRUE, TRUE, NOW(), NOW()),
    (3, 'Orange', 90.00, 1, '🍊', 0.0, 0, 30, 18, 'Fresh oranges bursting with vitamin C. Enjoy as a snack or squeeze for a refreshing juice.',
     'FRT-ORG-001', 'Nagpur', 1.00, 'kg', 'per kg', FALSE, TRUE, TRUE, NOW(), NOW()),
    (4, 'Grapes', 120.00, 1, '🍇', 0.0, 0, 18, 25, 'Sweet, seedless grapes that are perfect for snacking and fruit platters. Chill for extra freshness.',
     'FRT-GRP-001', 'Green Sonaka', 1.00, 'kg', 'per kg', FALSE, TRUE, TRUE, NOW(), NOW()),
    (5, 'Strawberry', 250.00, 1, '🍓', 0.0, 0, 10, 30, 'Bright, fragrant strawberries with a sweet-tart taste. Best for desserts, toppings, and smoothies.',
     'FRT-STR-001', 'Local', 0.25, 'kg', 'per 250g pack', TRUE, TRUE, TRUE, NOW(), NOW()),
    (6, 'Watermelon', 40.00, 1, '🍉', 0.0, 0, 12, 12, 'Refreshing watermelon with a high water content—great for summer hydration and fruit salads.',
     'FRT-WML-001', 'Local', 1.00, 'kg', 'per kg', FALSE, TRUE, TRUE, NOW(), NOW()),
    (25, 'Mango', 120.00, 1, '🥭', 0.0, 0, 20, 25, 'Sweet and juicy Alphonso mangoes, known as the king of fruits.',
     'FRT-MNG-001', 'Alphonso', 1.00, 'kg', 'per kg', FALSE, TRUE, TRUE, NOW(), NOW()),
    (26, 'Pineapple', 80.00, 1, '🍍', 0.0, 0, 15, 20, 'Tropical pineapples with a sweet and tangy flavor. Great for desserts and juices.',
     'FRT-PNA-001', 'Local', 1.00, 'piece', 'per piece (~1-1.5 kg)', FALSE, TRUE, TRUE, NOW(), NOW()),
    (27, 'Kiwi', 300.00, 1, '🥝', 0.0, 0, 25, 0, 'Tangy and vitamin-rich kiwis with a unique flavor and vibrant green flesh.',
     'FRT-KWI-001', 'Imported', 1.00, 'kg', 'per kg (~8-10 pcs)', FALSE, TRUE, TRUE, NOW(), NOW()),
    (28, 'Papaya', 50.00, 1, '🍈', 0.0, 0, 18, 18, 'Ripe and sweet papayas, perfect for a healthy breakfast or snack.',
     'FRT-PPY-001', 'Local', 1.00, 'kg', 'per kg', FALSE, TRUE, TRUE, NOW(), NOW()),
    (29, 'Guava', 60.00, 1, '🍈', 0.0, 0, 30, 22, 'Fresh pink guavas, crunchy and full of vitamin C. Great with a pinch of salt and chili.',
     'FRT-GUV-001', 'Local', 1.00, 'kg', 'per kg', FALSE, TRUE, TRUE, NOW(), NOW()),
    (30, 'Pomegranate', 180.00, 1, '🍎', 0.0, 0, 12, 0, 'Juicy red pomegranate pearls, packed with antioxidants and sweet-tart flavor.',
     'FRT-PMG-001', 'Local', 1.00, 'kg', 'per kg', FALSE, TRUE, TRUE, NOW(), NOW()),
    (31, 'Blueberry', 900.00, 1, '🫐', 0.0, 0, 10, 0, 'Premium fresh blueberries, perfect for smoothies, pancakes, or healthy snacking.',
     'FRT-BLB-001', 'Imported', 0.125, 'kg', 'per 125g punnet', TRUE, TRUE, TRUE, NOW(), NOW()),
    (32, 'Peach', 250.00, 1, '🍑', 0.0, 0, 14, 0, 'Soft and sweet peaches with a delicate aroma. Ideal for desserts and salads.',
     'FRT-PCH-001', 'Imported', 1.00, 'kg', 'per kg', FALSE, TRUE, TRUE, NOW(), NOW()),
    (33, 'Cherry', 500.00, 1, '🍒', 0.0, 0, 8, 0, 'Sweet red cherries, a perfect seasonal treat for snacking or baking.',
     'FRT-CHR-001', 'Imported', 1.00, 'kg', 'per kg', FALSE, TRUE, TRUE, NOW(), NOW()),
    (34, 'Avocado', 200.00, 1, '🥑', 0.0, 0, 12, 0, 'Creamy ripe avocados, perfect for toast, salads, and healthy fats.',
     'FRT-AVD-001', 'Imported', 1.00, 'piece', 'per piece', FALSE, TRUE, TRUE, NOW(), NOW())
ON CONFLICT DO NOTHING;

-- VEGETABLES (16 products - rating 0.0, reviews 0)
INSERT INTO products (id, name, price, category_id, emoji, rating, reviews_count, stock, discount_percent, description,
                      sku, brand, weight, weight_unit, quantity_per_unit, is_organic, is_vegetarian,
                      is_active, created_at, updated_at)
VALUES
    (7, 'Carrot', 40.00, 2, '🥕', 0.0, 0, 35, 20, 'Crunchy carrots rich in beta-carotene. Ideal for salads, soups, and healthy snacking.',
     'VEG-CRT-001', 'Fresho', 1.00, 'kg', 'per kg', FALSE, TRUE, TRUE, NOW(), NOW()),
    (8, 'Tomato', 45.00, 2, '🍅', 0.0, 0, 28, 15, 'Juicy tomatoes that add flavor to curries, sandwiches, and salads. A kitchen staple!',
     'VEG-TOM-001', 'Local', 1.00, 'kg', 'per kg', FALSE, TRUE, TRUE, NOW(), NOW()),
    (9, 'Broccoli', 100.00, 2, '🥦', 0.0, 0, 16, 18, 'Fresh broccoli florets loaded with nutrients. Steam, stir-fry, or roast for a delicious side.',
     'VEG-BRC-001', 'Fresho', 0.50, 'kg', 'per 500g pack', TRUE, TRUE, TRUE, NOW(), NOW()),
    (10, 'Cucumber', 40.00, 2, '🥒', 0.0, 0, 22, 22, 'Cool and crisp cucumbers—perfect for salads, raita, and refreshing hydration.',
     'VEG-CUC-001', 'Local', 1.00, 'kg', 'per kg', FALSE, TRUE, TRUE, NOW(), NOW()),
    (11, 'Potato', 25.00, 2, '🥔', 0.0, 0, 50, 10, 'Versatile potatoes for curries, fries, and snacks. A must-have for everyday cooking.',
     'VEG-POT-001', 'Local', 1.00, 'kg', 'per kg', FALSE, TRUE, TRUE, NOW(), NOW()),
    (12, 'Corn', 50.00, 2, '🌽', 0.0, 0, 20, 16, 'Sweet corn that''s great boiled, grilled, or tossed into soups and salads for extra crunch.',
     'VEG-CRN-001', 'Local', 1.00, 'kg', 'per kg (~4-5 cobs)', FALSE, TRUE, TRUE, NOW(), NOW()),
    (35, 'Spinach', 40.00, 2, '🥬', 0.0, 0, 40, 15, 'Fresh green spinach leaves, nutrient-dense and versatile for cooking.',
     'VEG-SPN-001', 'Fresho', 0.30, 'kg', 'per bunch (~250-300g)', FALSE, TRUE, TRUE, NOW(), NOW()),
    (36, 'Cauliflower', 60.00, 2, '🥦', 0.0, 0, 22, 18, 'Fresh white cauliflower florets, great for curries, roasting, or stir-frying.',
     'VEG-CFL-001', 'Local', 1.00, 'piece', 'per piece (~800g-1kg)', FALSE, TRUE, TRUE, NOW(), NOW()),
    (37, 'Cabbage', 40.00, 2, '🥬', 0.0, 0, 25, 20, 'Crunchy green cabbage, perfect for salads, slaws, and stir-fries.',
     'VEG-CAB-001', 'Local', 1.00, 'piece', 'per piece (~1kg)', FALSE, TRUE, TRUE, NOW(), NOW()),
    (38, 'Onion', 35.00, 2, '🧅', 0.0, 0, 100, 10, 'Essential red onions for every kitchen. Adds flavor and crunch to any dish.',
     'VEG-ONN-001', 'Local', 1.00, 'kg', 'per kg', FALSE, TRUE, TRUE, NOW(), NOW()),
    (39, 'Garlic', 100.00, 2, '🧄', 0.0, 0, 60, 12, 'Pungent and flavorful garlic cloves, a must-have for seasoning and health.',
     'VEG-GRL-001', 'Local', 1.00, 'kg', 'per kg', FALSE, TRUE, TRUE, NOW(), NOW()),
    (40, 'Bell Pepper', 80.00, 2, '🫑', 0.0, 0, 15, 15, 'Vibrant and crunchy bell peppers, perfect for stir-fries, salads, and stuffing.',
     'VEG-BLP-001', 'Fresho', 1.00, 'kg', 'per kg', FALSE, TRUE, TRUE, NOW(), NOW()),
    (41, 'Sweet Potato', 50.00, 2, '🍠', 0.0, 0, 30, 18, 'Nutritious sweet potatoes, great for roasting, mashing, or as a healthy snack.',
     'VEG-SPT-001', 'Local', 1.00, 'kg', 'per kg', FALSE, TRUE, TRUE, NOW(), NOW()),
    (42, 'Peas', 80.00, 2, '🫛', 0.0, 0, 20, 20, 'Fresh green peas, sweet and tender. Ideal for curries, pulao, and side dishes.',
     'VEG-PEA-001', 'Fresho', 1.00, 'kg', 'per kg', FALSE, TRUE, TRUE, NOW(), NOW()),
    (43, 'Beans', 70.00, 2, '🫛', 0.0, 0, 25, 16, 'Fresh green beans, crunchy and nutritious. Great for stir-frying and steaming.',
     'VEG-BNS-001', 'Local', 1.00, 'kg', 'per kg', FALSE, TRUE, TRUE, NOW(), NOW()),
    (44, 'Mushrooms', 180.00, 2, '🍄', 0.0, 0, 12, 0, 'Fresh button mushrooms, earthy and savory. Perfect for pasta, pizzas, and stir-fries.',
     'VEG-MSH-001', 'Fresho', 0.20, 'kg', 'per 200g pack', FALSE, TRUE, TRUE, NOW(), NOW())
ON CONFLICT DO NOTHING;

-- DAIRY (14 products - rating 0.0, reviews 0)
INSERT INTO products (id, name, price, category_id, emoji, rating, reviews_count, stock, discount_percent, description,
                      sku, brand, weight, weight_unit, quantity_per_unit, is_organic, is_vegetarian,
                      is_active, created_at, updated_at)
VALUES
    (13, 'Milk', 62.00, 3, '🥛', 0.0, 0, 24, 10, 'Fresh, creamy milk—perfect for tea, coffee, cereals, and everyday nutrition.',
     'DRY-MLK-001', 'Amul/Tone', 1.00, 'ltr', 'per litre', FALSE, TRUE, TRUE, NOW(), NOW()),
    (14, 'Cheese', 400.00, 3, '🧀', 0.0, 0, 14, 15, 'Rich and flavorful cheese that melts beautifully. Great for sandwiches, pasta, and snacks.',
     'DRY-CHS-001', 'Amul', 1.00, 'kg', 'per kg', FALSE, TRUE, TRUE, NOW(), NOW()),
    (15, 'Butter', 500.00, 3, '🧈', 0.0, 0, 9, 8, 'Creamy butter for spreading, baking, and cooking. Adds a delicious richness to any dish.',
     'DRY-BTR-001', 'Amul', 0.50, 'kg', 'per 500g pack', FALSE, TRUE, TRUE, NOW(), NOW()),
    (16, 'Yogurt', 60.00, 3, '🥛', 0.0, 0, 18, 12, 'Smooth yogurt that''s great for breakfast, smoothies, and homemade raita.',
     'DRY-YGT-001', 'Amul', 1.00, 'kg', 'per kg', FALSE, TRUE, TRUE, NOW(), NOW()),
    (45, 'Paneer', 380.00, 3, '🧀', 0.0, 0, 18, 12, 'Fresh and soft cottage cheese (paneer), a versatile protein for Indian dishes.',
     'DRY-PNR-001', 'Amul/Mother Dairy', 1.00, 'kg', 'per kg', FALSE, TRUE, TRUE, NOW(), NOW()),
    (46, 'Ghee', 720.00, 3, '🧈', 0.0, 0, 15, 10, 'Pure cow ghee, aromatic and rich. Perfect for cooking and adding flavor to meals.',
     'DRY-GHE-001', 'Amul', 1.00, 'kg', 'per kg (jar)', FALSE, TRUE, TRUE, NOW(), NOW()),
    (47, 'Ice Cream', 250.00, 3, '🍦', 0.0, 0, 10, 15, 'Creamy vanilla ice cream, the perfect dessert to satisfy your sweet cravings.',
     'DRY-ICM-001', 'Amul', 1.00, 'ltr', 'per 1 litre tub', FALSE, TRUE, TRUE, NOW(), NOW()),
    (48, 'Buttermilk', 30.00, 3, '🥛', 0.0, 0, 40, 8, 'Refreshing and cooling buttermilk, great for digestion and summer heat.',
     'DRY-BTM-001', 'Amul', 1.00, 'ltr', 'per litre', FALSE, TRUE, TRUE, NOW(), NOW()),
    (49, 'Flavored Yogurt', 90.00, 3, '🥛', 0.0, 0, 25, 12, 'Delicious fruit-flavored yogurt, a healthy and tasty snack for any time.',
     'DRY-FYG-001', 'Epigamia/Amul', 0.40, 'kg', 'per 400g cup', FALSE, TRUE, TRUE, NOW(), NOW()),
    (50, 'Whipped Cream', 250.00, 3, '🥛', 0.0, 0, 12, 0, 'Light and fluffy whipped cream, perfect for topping desserts and fruits.',
     'DRY-WCR-001', 'Imported', 0.20, 'kg', 'per 200g can', FALSE, TRUE, TRUE, NOW(), NOW()),
    (51, 'Sour Cream', 300.00, 3, '🥛', 0.0, 0, 15, 0, 'Thick and tangy sour cream, ideal for dips, baked potatoes, and tacos.',
     'DRY-SCR-001', 'Imported', 0.20, 'kg', 'per 200g pack', FALSE, TRUE, TRUE, NOW(), NOW()),
    (52, 'Condensed Milk', 180.00, 3, '🥛', 0.0, 0, 20, 10, 'Sweetened condensed milk, a key ingredient for many delicious desserts.',
     'DRY-CML-001', 'Milkmaid', 0.40, 'kg', 'per 400g tin', FALSE, TRUE, TRUE, NOW(), NOW()),
    (53, 'Soya Milk', 100.00, 3, '🥛', 0.0, 0, 18, 15, 'Nutritious plant-based soya milk, a great dairy alternative for health-conscious users.',
     'DRY-SML-001', 'Sofit', 1.00, 'ltr', 'per litre', FALSE, TRUE, TRUE, NOW(), NOW()),
    (54, 'Almond Milk', 220.00, 3, '🥛', 0.0, 0, 14, 0, 'Creamy almond milk, a delicious and healthy non-dairy milk alternative.',
     'DRY-AML-001', 'Sofit/Imported', 1.00, 'ltr', 'per litre', FALSE, TRUE, TRUE, NOW(), NOW())
ON CONFLICT DO NOTHING;

-- SNACKS (14 products - rating 0.0, reviews 0)
INSERT INTO products (id, name, price, category_id, emoji, rating, reviews_count, stock, discount_percent, description,
                      sku, brand, weight, weight_unit, quantity_per_unit, is_organic, is_vegetarian,
                      is_active, created_at, updated_at)
VALUES
    (17, 'Cookies', 150.00, 4, '🍪', 0.0, 0, 32, 25, 'Crunchy cookies with a delightful sweetness—perfect with tea, coffee, or as a quick treat.',
     'SNK-CKI-001', 'Parle/Britannia', 0.20, 'kg', 'per 200g pack', FALSE, TRUE, TRUE, NOW(), NOW()),
    (18, 'Chips', 60.00, 4, '🥔', 0.0, 0, 45, 20, 'Crispy, salty chips for movie nights and snack cravings. Enjoy the crunch!',
     'SNK-CHP-001', 'Lay''s', 0.15, 'kg', 'per 150g pack', FALSE, TRUE, TRUE, NOW(), NOW()),
    (19, 'Chocolate', 120.00, 4, '🍫', 0.0, 0, 27, 30, 'Smooth, indulgent chocolate to satisfy your sweet tooth. Great for gifting and desserts.',
     'SNK-CHC-001', 'Cadbury', 0.10, 'kg', 'per 100g bar', FALSE, TRUE, TRUE, NOW(), NOW()),
    (20, 'Popcorn', 80.00, 4, '🍿', 0.0, 0, 38, 35, 'Light and fluffy popcorn—perfect for binge-watching and quick snacking.',
     'SNK-POP-001', 'Act II', 0.10, 'kg', 'per 100g pack', FALSE, TRUE, TRUE, NOW(), NOW()),
    (55, 'Almonds', 750.00, 4, '🥜', 0.0, 0, 30, 15, 'Premium roasted almonds, a crunchy and nutritious snack packed with vitamin E.',
     'SNK-ALM-001', 'Tata Sampann', 1.00, 'kg', 'per kg', FALSE, TRUE, TRUE, NOW(), NOW()),
    (56, 'Cashews', 850.00, 4, '🥜', 0.0, 0, 25, 18, 'Creamy and delicious cashew nuts, perfect for snacking or adding to desserts.',
     'SNK-CSW-001', 'Tata Sampann', 1.00, 'kg', 'per kg', FALSE, TRUE, TRUE, NOW(), NOW()),
    (57, 'Walnuts', 900.00, 4, '🥜', 0.0, 0, 20, 20, 'Healthy walnuts, rich in omega-3 fatty acids. Great for brain health and snacking.',
     'SNK-WLN-001', 'Local', 1.00, 'kg', 'per kg', FALSE, TRUE, TRUE, NOW(), NOW()),
    (58, 'Raisins', 200.00, 4, '🍇', 0.0, 0, 35, 22, 'Sweet and chewy raisins, a natural energy booster for your day.',
     'SNK-RAI-001', 'Local', 1.00, 'kg', 'per kg', FALSE, TRUE, TRUE, NOW(), NOW()),
    (59, 'Granola', 300.00, 4, '🥣', 0.0, 0, 15, 25, 'Crunchy granola with nuts and honey, perfect for a healthy breakfast or snack.',
     'SNK-GRN-001', 'Bagrry''s', 0.50, 'kg', 'per 500g pack', FALSE, TRUE, TRUE, NOW(), NOW()),
    (60, 'Trail Mix', 400.00, 4, '🥜', 0.0, 0, 20, 20, 'A mix of nuts, seeds, and dried fruits for sustained energy on the go.',
     'SNK-TRL-001', 'Local', 0.50, 'kg', 'per 500g pack', FALSE, TRUE, TRUE, NOW(), NOW()),
    (61, 'Pretzels', 150.00, 4, '🥨', 0.0, 0, 40, 30, 'Classic salted pretzels, a crunchy and satisfying snack for any time.',
     'SNK-PTZ-001', 'Local', 0.15, 'kg', 'per 150g pack', FALSE, TRUE, TRUE, NOW(), NOW()),
    (62, 'Nachos', 100.00, 4, '🌮', 0.0, 0, 30, 25, 'Crispy corn nachos, perfect with cheese dip or salsa for movie nights.',
     'SNK-NCH-001', 'Doritos', 0.15, 'kg', 'per 150g pack', FALSE, TRUE, TRUE, NOW(), NOW()),
    (63, 'Peanuts', 120.00, 4, '🥜', 0.0, 0, 50, 15, 'Roasted and salted peanuts, a classic and affordable high-protein snack.',
     'SNK-PNT-001', 'Local', 1.00, 'kg', 'per kg', FALSE, TRUE, TRUE, NOW(), NOW()),
    (64, 'Pistachios', 1000.00, 4, '🥜', 0.0, 0, 18, 0, 'Delicious roasted pistachios, fun to crack and full of nutrients.',
     'SNK-PST-001', 'Tata Sampann', 1.00, 'kg', 'per kg', FALSE, TRUE, TRUE, NOW(), NOW())
ON CONFLICT DO NOTHING;

-- BEVERAGES (14 products - rating 0.0, reviews 0)
INSERT INTO products (id, name, price, category_id, emoji, rating, reviews_count, stock, discount_percent, description,
                      sku, brand, weight, weight_unit, quantity_per_unit, is_organic, is_vegetarian,
                      is_active, created_at, updated_at)
VALUES
    (21, 'Orange Juice', 100.00, 5, '🧃', 0.0, 0, 20, 15, 'Refreshing orange juice with a citrusy punch. Serve chilled for the best taste.',
     'BEV-OJU-001', 'Real/Tropicana', 1.00, 'ltr', 'per litre', FALSE, TRUE, TRUE, NOW(), NOW()),
    (22, 'Coffee', 300.00, 5, '☕', 0.0, 0, 15, 20, 'Aromatic coffee to kickstart your day. Enjoy hot, iced, or with your favorite milk.',
     'BEV-COF-001', 'Bru/Nescafe', 0.20, 'kg', 'per 200g pack (instant)', FALSE, TRUE, TRUE, NOW(), NOW()),
    (23, 'Tea', 200.00, 5, '🍵', 0.0, 0, 22, 18, 'Comforting tea for every mood. Brew strong or light—your perfect cup awaits.',
     'BEV-TEA-001', 'Tata Tea', 0.50, 'kg', 'per 500g pack', FALSE, TRUE, TRUE, NOW(), NOW()),
    (24, 'Soda', 40.00, 5, '🥤', 0.0, 0, 0, 0, 'Classic fizzy soda—cool and refreshing. Best served chilled with ice.',
     'BEV-SOD-001', 'Coca-Cola', 0.60, 'ltr', 'per 600ml bottle', FALSE, TRUE, FALSE, NOW(), NOW()),
    (65, 'Mango Juice', 90.00, 5, '🥭', 0.0, 0, 25, 18, 'Sweet and thick mango nectar, made from the finest ripe mangoes.',
     'BEV-MJU-001', 'Real', 1.00, 'ltr', 'per litre', FALSE, TRUE, TRUE, NOW(), NOW()),
    (66, 'Apple Juice', 100.00, 5, '🍎', 0.0, 0, 22, 15, 'Clear and refreshing apple juice, naturally sweet and full of flavor.',
     'BEV-AJU-001', 'Real', 1.00, 'ltr', 'per litre', FALSE, TRUE, TRUE, NOW(), NOW()),
    (67, 'Cranberry Juice', 250.00, 5, '🥤', 0.0, 0, 15, 0, 'Tart and refreshing cranberry juice, great on its own or as a mixer.',
     'BEV-CRJ-001', 'Ocean Spray', 1.00, 'ltr', 'per litre', FALSE, TRUE, TRUE, NOW(), NOW()),
    (68, 'Green Tea', 220.00, 5, '🍵', 0.0, 0, 30, 20, 'Healthy green tea leaves, rich in antioxidants for a revitalizing break.',
     'BEV-GTE-001', 'Lipton/Tetley', 0.10, 'kg', 'per 100g pack (20-25 bags)', FALSE, TRUE, TRUE, NOW(), NOW()),
    (69, 'Energy Drink', 100.00, 5, '⚡', 0.0, 0, 40, 25, 'Instant energy boost to keep you going through your busy day.',
     'BEV-END-001', 'Red Bull', 0.25, 'ltr', 'per 250ml can', FALSE, TRUE, TRUE, NOW(), NOW()),
    (70, 'Coconut Water', 60.00, 5, '🥥', 0.0, 0, 50, 12, 'Natural and refreshing coconut water, perfect for hydration and electrolytes.',
     'BEV-CCW-001', 'Tender Coconut', 1.00, 'ltr', 'per 1 litre tetra', FALSE, TRUE, TRUE, NOW(), NOW()),
    (71, 'Smoothie', 180.00, 5, '🥤', 0.0, 0, 12, 20, 'Delicious mixed fruit smoothie, a healthy and filling drink for any time.',
     'BEV-SMT-001', 'Local', 0.30, 'ltr', 'per 300ml bottle', FALSE, TRUE, TRUE, NOW(), NOW()),
    (72, 'Milkshake', 140.00, 5, '🥤', 0.0, 0, 15, 18, 'Thick and creamy chocolate milkshake, a classic treat for all ages.',
     'BEV-MSK-001', 'Amul', 0.30, 'ltr', 'per 300ml bottle', FALSE, TRUE, TRUE, NOW(), NOW()),
    (73, 'Lemonade', 50.00, 5, '🍋', 0.0, 0, 45, 15, 'Zesty and refreshing lemonade, the perfect thirst quencher on a hot day.',
     'BEV-LEM-001', 'Local', 0.50, 'ltr', 'per 500ml bottle', FALSE, TRUE, TRUE, NOW(), NOW()),
    (74, 'Hot Chocolate', 150.00, 5, '☕', 0.0, 0, 20, 10, 'Rich and comforting hot chocolate, perfect for cozy evenings.',
     'BEV-HCH-001', 'Cadbury', 0.20, 'kg', 'per 200g pack', FALSE, TRUE, TRUE, NOW(), NOW())
ON CONFLICT DO NOTHING;

-- =====================================================
-- COUPONS (15 total - original 5 + 10 new)
-- =====================================================
INSERT INTO coupons (code, description, coupon_type, value, min_order_value, max_discount, applicable_categories, first_order_only, is_active, valid_from, valid_until, created_at, usage_limit)
VALUES
    -- Original 5
    ('SAVE20', '20% off orders above ₹500', 'percentage', 20.00, 500.00, 100.00, '[]'::JSONB, FALSE, TRUE, NOW(), NOW() + INTERVAL '1 year', NOW(), NULL),
    ('FRESH15', '15% off on fruits & vegetables', 'category', 15.00, 200.00, 75.00, '["Fruits", "Vegetables"]'::JSONB, FALSE, TRUE, NOW(), NOW() + INTERVAL '1 year', NOW(), NULL),
    ('WELCOME50', '₹50 off first order', 'fixed', 50.00, 300.00, 50.00, '[]'::JSONB, TRUE, TRUE, NOW(), NOW() + INTERVAL '1 year', NOW(), 1),
    ('DAIRY10', '10% off on dairy products', 'category', 10.00, 150.00, 50.00, '["Dairy"]'::JSONB, FALSE, TRUE, NOW(), NOW() + INTERVAL '1 year', NOW(), NULL),
    ('SNACKS25', '₹25 off snacks orders', 'fixed', 25.00, 100.00, 25.00, '["Snacks"]'::JSONB, FALSE, TRUE, NOW(), NOW() + INTERVAL '1 year', NOW(), NULL),

    -- 10 NEW coupons
    ('FIRST100', '₹100 off first order above ₹600', 'fixed', 100.00, 600.00, 100.00, '[]'::JSONB, TRUE, TRUE, NOW(), NOW() + INTERVAL '1 year', NOW(), 1),
    ('VEG20OFF', '20% off vegetables above ₹300', 'percentage', 20.00, 300.00, 80.00, '["Vegetables"]'::JSONB, FALSE, TRUE, NOW(), NOW() + INTERVAL '1 year', NOW(), NULL),
    ('DAILY10OFF', 'Flat ₹10 off every order above ₹200', 'fixed', 10.00, 200.00, 10.00, '[]'::JSONB, FALSE, TRUE, NOW(), NOW() + INTERVAL '1 year', NOW(), NULL),
    ('NUTS30', '₹30 off nuts & dry fruits above ₹400', 'fixed', 30.00, 400.00, 30.00, '["Snacks"]'::JSONB, FALSE, TRUE, NOW(), NOW() + INTERVAL '1 year', NOW(), NULL),
    ('SUMMER25', '25% off summer fruits & beverages', 'percentage', 25.00, 250.00, 100.00, '["Fruits", "Beverages"]'::JSONB, FALSE, TRUE, NOW(), NOW() + INTERVAL '3 months', NOW(), NULL),
    ('REFER50', '₹50 off for both referrer & friend', 'fixed', 50.00, 300.00, 50.00, '[]'::JSONB, FALSE, TRUE, NOW(), NOW() + INTERVAL '1 year', NOW(), NULL),
    ('MILK5OFF', '₹5 off per litre milk (max 10 litres)', 'fixed', 5.00, 0.00, 50.00, '["Dairy"]'::JSONB, FALSE, TRUE, NOW(), NOW() + INTERVAL '1 year', NOW(), 10),
    ('WEEKEND30', '30% off snacks on weekends', 'percentage', 30.00, 100.00, 80.00, '["Snacks"]'::JSONB, FALSE, TRUE, NOW(), NOW() + INTERVAL '1 year', NOW(), NULL),
    ('PANTRY100', '₹100 off grocery order above ₹800', 'fixed', 100.00, 800.00, 100.00, '[]'::JSONB, FALSE, TRUE, NOW(), NOW() + INTERVAL '1 year', NOW(), NULL),
    ('ORGANIC20', '20% off organic products', 'percentage', 20.00, 250.00, 80.00, '[]'::JSONB, FALSE, TRUE, NOW(), NOW() + INTERVAL '1 year', NOW(), NULL)
ON CONFLICT (code) DO NOTHING;

-- =====================================================
-- SITE SETTINGS
-- =====================================================
INSERT INTO site_settings (tax_rate, standard_delivery_charge, express_delivery_charge, free_delivery_threshold, min_order_value, max_cod_order_value, site_name, site_currency, created_at, updated_at)
VALUES (
    0.0500, 40.00, 60.00, 499.00, 100.00, 2000.00, 'HappyGroceries', '₹', NOW(), NOW()
) ON CONFLICT DO NOTHING;

-- =====================================================
-- SORT OPTIONS
-- =====================================================
INSERT INTO sort_options (value, label, "order", is_active) VALUES
    ('popular', 'Most Popular', 1, TRUE),
    ('price_low', 'Price: Low to High', 2, TRUE),
    ('price_high', 'Price: High to Low', 3, TRUE),
    ('rating', 'Highest Rated', 4, TRUE),
    ('newest', 'Newest First', 5, TRUE)
ON CONFLICT (value) DO NOTHING;

-- =====================================================
-- SUMMARY
-- =====================================================
-- Products: 74
-- Coupons: 15 total (realistic mix)
-- =====================================================