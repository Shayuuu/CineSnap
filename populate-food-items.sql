-- =====================================================
-- Populate Food & Beverages Items
-- =====================================================
-- Add popular cinema snacks and drinks
-- =====================================================

-- Popcorn
INSERT INTO "FoodItem" (id, name, description, price, category, "imageUrl", available) VALUES
('food_popcorn_small', 'Small Popcorn', 'Freshly popped corn with butter', 20000, 'POPCORN', 'https://images.unsplash.com/photo-1607604275103-b32fe7148a60?w=400', TRUE),
('food_popcorn_medium', 'Medium Popcorn', 'Freshly popped corn with butter', 30000, 'POPCORN', 'https://images.unsplash.com/photo-1607604275103-b32fe7148a60?w=400', TRUE),
('food_popcorn_large', 'Large Popcorn', 'Freshly popped corn with butter', 40000, 'POPCORN', 'https://images.unsplash.com/photo-1607604275103-b32fe7148a60?w=400', TRUE),
('food_popcorn_caramel', 'Caramel Popcorn', 'Sweet caramel flavored popcorn', 35000, 'POPCORN', 'https://images.unsplash.com/photo-1607604275103-b32fe7148a60?w=400', TRUE)
ON CONFLICT (id) DO NOTHING;

-- Drinks
INSERT INTO "FoodItem" (id, name, description, price, category, "imageUrl", available) VALUES
('food_drink_pepsi', 'Pepsi (500ml)', 'Chilled Pepsi', 12000, 'DRINKS', 'https://images.unsplash.com/photo-1554866585-cd94860890b7?w=400', TRUE),
('food_drink_coke', 'Coca-Cola (500ml)', 'Chilled Coca-Cola', 12000, 'DRINKS', 'https://images.unsplash.com/photo-1554866585-cd94860890b7?w=400', TRUE),
('food_drink_sprite', 'Sprite (500ml)', 'Chilled Sprite', 12000, 'DRINKS', 'https://images.unsplash.com/photo-1554866585-cd94860890b7?w=400', TRUE),
('food_drink_water', 'Mineral Water (500ml)', 'Bottled water', 8000, 'DRINKS', 'https://images.unsplash.com/photo-1554866585-cd94860890b7?w=400', TRUE),
('food_drink_coffee', 'Hot Coffee', 'Freshly brewed coffee', 15000, 'DRINKS', 'https://images.unsplash.com/photo-1517487881594-2787fef5ebf7?w=400', TRUE)
ON CONFLICT (id) DO NOTHING;

-- Snacks
INSERT INTO "FoodItem" (id, name, description, price, category, "imageUrl", available) VALUES
('food_nachos', 'Nachos with Cheese', 'Crispy nachos with warm cheese sauce', 25000, 'SNACKS', 'https://images.unsplash.com/photo-1513456852971-30c0b8199d4d?w=400', TRUE),
('food_fries', 'French Fries', 'Crispy golden fries', 18000, 'SNACKS', 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=400', TRUE),
('food_sandwich', 'Veg Sandwich', 'Fresh vegetable sandwich', 22000, 'SNACKS', 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=400', TRUE),
('food_burger', 'Veg Burger', 'Classic veg burger with fries', 28000, 'SNACKS', 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400', TRUE),
('food_pizza', 'Pizza Slice', 'Hot pizza slice', 30000, 'SNACKS', 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400', TRUE),
('food_chocolate', 'Chocolate Bar', 'Premium chocolate bar', 10000, 'SNACKS', 'https://images.unsplash.com/photo-1606312619070-d48b4cbc6b7c?w=400', TRUE)
ON CONFLICT (id) DO NOTHING;

-- Combos
INSERT INTO "FoodItem" (id, name, description, price, category, "imageUrl", available) VALUES
('food_combo_small', 'Small Combo', 'Small Popcorn + Soft Drink', 35000, 'COMBO', 'https://images.unsplash.com/photo-1607604275103-b32fe7148a60?w=400', TRUE),
('food_combo_medium', 'Medium Combo', 'Medium Popcorn + Soft Drink + Nachos', 55000, 'COMBO', 'https://images.unsplash.com/photo-1607604275103-b32fe7148a60?w=400', TRUE),
('food_combo_large', 'Large Combo', 'Large Popcorn + 2 Soft Drinks + Nachos + Fries', 85000, 'COMBO', 'https://images.unsplash.com/photo-1607604275103-b32fe7148a60?w=400', TRUE),
('food_combo_family', 'Family Combo', '2 Large Popcorn + 4 Soft Drinks + Nachos + Fries + Pizza', 150000, 'COMBO', 'https://images.unsplash.com/photo-1607604275103-b32fe7148a60?w=400', TRUE)
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- VERIFICATION
-- =====================================================

-- Check food items by category
-- SELECT category, COUNT(*) as count, SUM(price) / 100.0 as total_price_rupees
-- FROM "FoodItem"
-- GROUP BY category
-- ORDER BY category;

-- List all available food items
-- SELECT name, description, price / 100.0 as price_rupees, category
-- FROM "FoodItem"
-- WHERE available = TRUE
-- ORDER BY category, price;

