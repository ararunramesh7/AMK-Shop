-- ============================================================
-- ARUNA MURUKU KADAI — Seed Data
-- Run AFTER schema.sql and rls-policies.sql
-- ============================================================
-- ============================================================
-- Default Main Admin (+918946003470)
-- ============================================================
DO $$
DECLARE
  v_admin_id UUID := '00000000-0000-0000-0000-000000000001';
BEGIN
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE phone = '+918946003470') THEN
    INSERT INTO auth.users (
      id, instance_id, phone, encrypted_password, phone_confirmed_at, raw_app_meta_data, raw_user_meta_data, aud, role
    ) VALUES (
      v_admin_id, '00000000-0000-0000-0000-000000000000', '+918946003470', crypt('arunboxer', gen_salt('bf')), now(),
      '{"provider":"phone","providers":["phone"]}',
      '{"full_name":"Arun Ramesh","role":"admin"}',
      'authenticated', 'authenticated'
    );
    
    INSERT INTO auth.identities (id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
    VALUES (gen_random_uuid(), v_admin_id, '+918946003470', format('{"sub":"%s","phone":"+918946003470"}', v_admin_id::TEXT)::JSONB, 'phone', now(), now(), now());

    UPDATE profiles SET role = 'admin', phone = '+918946003470' WHERE id = v_admin_id;
  END IF;
END $$;

-- Shop Settings (singleton row)
INSERT INTO shop_settings (
  id, shop_name, shop_name_ta, address, city, phone,
  shop_lat, shop_lng, delivery_radius_km, free_delivery_km,
  per_km_charge, low_stock_threshold, cancellation_window_minutes,
  business_hours_start, business_hours_end, is_open
) VALUES (
  1, 'Aruna Muruku Kadai', 'அருணா முறுக்கு கடை',
  '15, Main Road, Near Bus Stand', 'Madurai', '+91 98765 43210',
  9.9252, 78.1198, 50, 2,
  15, 5, 30,
  '08:00', '21:00', TRUE
) ON CONFLICT (id) DO NOTHING;

-- Categories
INSERT INTO categories (id, name, name_ta, name_hi, name_te, name_kn, name_ml, display_order, status) VALUES
  ('c1000001-0000-0000-0000-000000000001', 'Murukku', 'முறுக்கு', 'मुरुक्कू', 'మురుక్కు', 'ಮುರುಕ್ಕು', 'മുരുക്ക്', 1, 'active'),
  ('c1000001-0000-0000-0000-000000000002', 'Mixture', 'மிக்ஸ்சர்', 'मिक्सचर', 'మిక్చర్', 'ಮಿಕ್ಸ್ಚರ್', 'മിക്സ്ചർ', 2, 'active'),
  ('c1000001-0000-0000-0000-000000000003', 'Chips', 'சிப்ஸ்', 'चिप्स', 'చిప్స్', 'ಚಿಪ್ಸ್', 'ചിപ്സ്', 3, 'active'),
  ('c1000001-0000-0000-0000-000000000004', 'Sweets', 'இனிப்பு', 'मिठाई', 'స్వీట్స్', 'ಸಿಹಿ', 'മധുരം', 4, 'active'),
  ('c1000001-0000-0000-0000-000000000005', 'Savouries', 'காரம்', 'नमकीन', 'కారాలు', 'ಖಾರ', 'കാരം', 5, 'active'),
  ('c1000001-0000-0000-0000-000000000006', 'Combo Packs', 'காம்போ பேக்', 'कॉम्बो पैक', 'కాంబో ప్యాక్', 'ಕಾಂಬೋ ಪ್ಯಾಕ್', 'കോംബോ പാക്ക്', 6, 'active'),
  ('c1000001-0000-0000-0000-000000000007', 'Special Items', 'ஸ்பெஷல்', 'स्पेशल', 'స్పెషల్', 'ಸ್ಪೆಷಲ್', 'സ്പെഷ്യൽ', 7, 'active');

-- Products
INSERT INTO products (name, name_ta, description, category_id, price, weight, stock, is_featured, is_popular) VALUES
  -- Murukku
  ('Traditional Murukku', 'பாரம்பரிய முறுக்கு', 'Classic hand-made rice flour murukku, crispy and delicious.', 'c1000001-0000-0000-0000-000000000001', 120.00, '250g', 50, TRUE, TRUE),
  ('Butter Murukku', 'வெண்ணெய் முறுக்கு', 'Rich buttery murukku made with premium butter.', 'c1000001-0000-0000-0000-000000000001', 150.00, '250g', 35, TRUE, FALSE),
  ('Mullu Murukku', 'முள்ளு முறுக்கு', 'Spiky shaped murukku with a crunchy texture.', 'c1000001-0000-0000-0000-000000000001', 130.00, '250g', 40, FALSE, TRUE),
  ('Kai Murukku', 'கை முறுக்கு', 'Hand-pressed murukku, traditional style.', 'c1000001-0000-0000-0000-000000000001', 140.00, '250g', 30, FALSE, FALSE),

  -- Mixture
  ('South Indian Mixture', 'சவுத் இண்டியன் மிக்ஸ்சர்', 'Spicy mixture with sev, boondi, peanuts and curry leaves.', 'c1000001-0000-0000-0000-000000000002', 100.00, '200g', 60, TRUE, TRUE),
  ('Hot Mixture', 'ஹாட் மிக்ஸ்சர்', 'Extra spicy version of our classic mixture.', 'c1000001-0000-0000-0000-000000000002', 110.00, '200g', 25, FALSE, FALSE),

  -- Chips
  ('Banana Chips', 'வாழைக்காய் சிப்ஸ்', 'Crispy Kerala-style banana chips fried in coconut oil.', 'c1000001-0000-0000-0000-000000000003', 90.00, '200g', 45, FALSE, TRUE),
  ('Tapioca Chips', 'மரவள்ளிக்கிழங்கு சிப்ஸ்', 'Thin and crispy tapioca chips with salt and pepper.', 'c1000001-0000-0000-0000-000000000003', 80.00, '200g', 55, FALSE, FALSE),
  ('Potato Chips Masala', 'உருளைக்கிழங்கு சிப்ஸ்', 'Spiced potato chips with homemade masala.', 'c1000001-0000-0000-0000-000000000003', 85.00, '150g', 70, FALSE, TRUE),

  -- Sweets
  ('Mysore Pak', 'மைசூர் பாக்', 'Soft and melt-in-mouth Mysore Pak made with ghee and gram flour.', 'c1000001-0000-0000-0000-000000000004', 200.00, '250g', 20, TRUE, TRUE),
  ('Laddu', 'லட்டு', 'Traditional besan laddu made with pure ghee.', 'c1000001-0000-0000-0000-000000000004', 180.00, '250g', 30, FALSE, TRUE),
  ('Jangiri', 'ஜாங்கிரி', 'South Indian style jangiri soaked in sugar syrup.', 'c1000001-0000-0000-0000-000000000004', 160.00, '250g', 15, FALSE, FALSE),

  -- Savouries
  ('Ribbon Pakoda', 'ரிப்பன் பக்கோடா', 'Long ribbon-shaped crispy snack made with rice flour.', 'c1000001-0000-0000-0000-000000000005', 110.00, '200g', 40, FALSE, TRUE),
  ('Thattai', 'தட்டை', 'Flat crispy snack seasoned with cumin and pepper.', 'c1000001-0000-0000-0000-000000000005', 95.00, '200g', 50, FALSE, FALSE),

  -- Combo Packs
  ('Festival Combo', 'திருவிழா காம்போ', 'Murukku + Mixture + Mysore Pak combo pack for festivals.', 'c1000001-0000-0000-0000-000000000006', 350.00, '750g', 15, TRUE, FALSE),
  ('Family Pack', 'குடும்ப பேக்', 'Assorted snacks family pack — 5 varieties.', 'c1000001-0000-0000-0000-000000000006', 500.00, '1kg', 10, TRUE, TRUE),

  -- Special Items
  ('Adhirasam', 'அதிரசம்', 'Traditional sweet made with jaggery and rice flour.', 'c1000001-0000-0000-0000-000000000007', 220.00, '250g', 12, FALSE, FALSE),
  ('Seeni Urundai', 'சீனி உருண்டை', 'Sugar-coated sweet balls, perfect for festive occasions.', 'c1000001-0000-0000-0000-000000000007', 190.00, '250g', 18, FALSE, TRUE);
