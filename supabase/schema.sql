-- ============================================================
-- ARUNA MURUKU KADAI — Complete Database Schema
-- Run this in Supabase SQL Editor
-- ============================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- 1. PROFILES (extends Supabase auth.users)
-- ============================================================
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL DEFAULT '',
  phone TEXT NOT NULL DEFAULT '',
  address TEXT NOT NULL DEFAULT '',
  city TEXT NOT NULL DEFAULT '',
  pincode TEXT NOT NULL DEFAULT '',
  role TEXT NOT NULL DEFAULT 'customer' CHECK (role IN ('customer', 'admin', 'sub_admin')),
  language_pref TEXT NOT NULL DEFAULT 'en',
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Auto-create profile on user signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, phone, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'phone', NEW.phone, ''),
    COALESCE(NEW.raw_user_meta_data->>'role', 'customer')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ============================================================
-- 2. CATEGORIES
-- ============================================================
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  name_ta TEXT DEFAULT '',
  name_hi TEXT DEFAULT '',
  name_te TEXT DEFAULT '',
  name_kn TEXT DEFAULT '',
  name_ml TEXT DEFAULT '',
  image_url TEXT,
  display_order INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- 3. PRODUCTS
-- ============================================================
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  name_ta TEXT DEFAULT '',
  name_hi TEXT DEFAULT '',
  name_te TEXT DEFAULT '',
  name_kn TEXT DEFAULT '',
  name_ml TEXT DEFAULT '',
  description TEXT DEFAULT '',
  description_ta TEXT DEFAULT '',
  description_hi TEXT DEFAULT '',
  description_te TEXT DEFAULT '',
  description_kn TEXT DEFAULT '',
  description_ml TEXT DEFAULT '',
  image_url TEXT,
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  price NUMERIC(10,2) NOT NULL DEFAULT 0,
  weight TEXT DEFAULT '',
  stock INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0),
  low_stock_threshold INTEGER NOT NULL DEFAULT 5,
  status TEXT NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'unavailable', 'out_of_stock')),
  is_featured BOOLEAN NOT NULL DEFAULT FALSE,
  is_popular BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Auto-update status based on stock
CREATE OR REPLACE FUNCTION update_product_stock_status()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.stock = 0 AND NEW.status != 'unavailable' THEN
    NEW.status := 'out_of_stock';
  ELSIF NEW.stock > 0 AND NEW.status = 'out_of_stock' THEN
    NEW.status := 'available';
  END IF;
  NEW.updated_at := NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS on_product_stock_change ON products;
CREATE TRIGGER on_product_stock_change
  BEFORE UPDATE OF stock ON products
  FOR EACH ROW EXECUTE FUNCTION update_product_stock_status();

-- ============================================================
-- 4. ORDER NUMBER SEQUENCE
-- ============================================================
CREATE SEQUENCE IF NOT EXISTS order_number_seq START WITH 1001;

CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TEXT AS $$
BEGIN
  RETURN 'AMK' || nextval('order_number_seq')::TEXT;
END;
$$ LANGUAGE plpgsql;

-- ============================================================
-- 5. ORDERS
-- ============================================================
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_number TEXT NOT NULL UNIQUE DEFAULT generate_order_number(),
  customer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
  customer_name TEXT NOT NULL DEFAULT '',
  customer_phone TEXT NOT NULL DEFAULT '',
  delivery_address TEXT NOT NULL DEFAULT '',
  delivery_city TEXT NOT NULL DEFAULT '',
  delivery_pincode TEXT NOT NULL DEFAULT '',
  delivery_lat DOUBLE PRECISION,
  delivery_lng DOUBLE PRECISION,
  distance_km NUMERIC(6,2) DEFAULT 0,
  subtotal NUMERIC(10,2) NOT NULL DEFAULT 0,
  delivery_charge NUMERIC(10,2) NOT NULL DEFAULT 0,
  total NUMERIC(10,2) NOT NULL DEFAULT 0,
  payment_method TEXT NOT NULL DEFAULT 'cod' CHECK (payment_method IN ('cod', 'upi', 'card', 'online')),
  status TEXT NOT NULL DEFAULT 'placed' CHECK (status IN ('placed', 'confirmed', 'preparing', 'out_for_delivery', 'delivered', 'cancelled')),
  cancellation_reason TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  confirmed_at TIMESTAMPTZ,
  preparing_at TIMESTAMPTZ,
  dispatched_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  cancelled_at TIMESTAMPTZ
);

-- Index for fast queries
CREATE INDEX IF NOT EXISTS idx_orders_customer ON orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created ON orders(created_at DESC);

-- ============================================================
-- 6. ORDER ITEMS
-- ============================================================
CREATE TABLE IF NOT EXISTS order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
  product_name TEXT NOT NULL DEFAULT '',
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  unit_price NUMERIC(10,2) NOT NULL,
  total_price NUMERIC(10,2) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id);

-- ============================================================
-- 7. NOTIFICATIONS
-- ============================================================
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
  title TEXT NOT NULL DEFAULT '',
  message TEXT NOT NULL DEFAULT '',
  type TEXT NOT NULL DEFAULT 'info' CHECK (type IN ('info', 'order_placed', 'order_confirmed', 'order_preparing', 'order_dispatched', 'order_delivered', 'order_cancelled', 'promotion')),
  is_read BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_unread ON notifications(user_id, is_read) WHERE is_read = FALSE;

-- ============================================================
-- 8. SHOP SETTINGS (singleton)
-- ============================================================
CREATE TABLE IF NOT EXISTS shop_settings (
  id INTEGER PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  shop_name TEXT NOT NULL DEFAULT 'Aruna Muruku Kadai',
  shop_name_ta TEXT DEFAULT 'அருணா முறுக்கு கடை',
  logo_url TEXT,
  address TEXT NOT NULL DEFAULT '',
  city TEXT NOT NULL DEFAULT '',
  phone TEXT NOT NULL DEFAULT '',
  email TEXT DEFAULT '',
  shop_lat DOUBLE PRECISION DEFAULT 0,
  shop_lng DOUBLE PRECISION DEFAULT 0,
  delivery_radius_km NUMERIC(6,2) DEFAULT 50,
  free_delivery_km NUMERIC(6,2) DEFAULT 2,
  per_km_charge NUMERIC(6,2) DEFAULT 15,
  low_stock_threshold INTEGER DEFAULT 5,
  cancellation_window_minutes INTEGER DEFAULT 30,
  business_hours_start TIME DEFAULT '08:00',
  business_hours_end TIME DEFAULT '21:00',
  is_open BOOLEAN DEFAULT TRUE,
  currency_symbol TEXT DEFAULT '₹',
  min_order_amount NUMERIC(10,2) DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- 9. CUSTOMER ADDRESSES (multiple addresses per customer)
-- ============================================================
CREATE TABLE IF NOT EXISTS customer_addresses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  label TEXT NOT NULL DEFAULT 'Home',
  address TEXT NOT NULL DEFAULT '',
  city TEXT NOT NULL DEFAULT '',
  pincode TEXT NOT NULL DEFAULT '',
  lat DOUBLE PRECISION,
  lng DOUBLE PRECISION,
  is_default BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_addresses_user ON customer_addresses(user_id);

-- ============================================================
-- 10. DATABASE FUNCTIONS
-- ============================================================

-- Calculate delivery charge
CREATE OR REPLACE FUNCTION calculate_delivery_charge(
  p_distance_km NUMERIC
)
RETURNS NUMERIC AS $$
DECLARE
  v_free_km NUMERIC;
  v_per_km NUMERIC;
  v_extra_km INTEGER;
BEGIN
  SELECT free_delivery_km, per_km_charge 
  INTO v_free_km, v_per_km 
  FROM shop_settings WHERE id = 1;

  IF p_distance_km <= v_free_km THEN
    RETURN 0;
  END IF;

  -- Charge for each started kilometer beyond free distance
  v_extra_km := CEIL(p_distance_km - v_free_km);
  RETURN v_extra_km * v_per_km;
END;
$$ LANGUAGE plpgsql STABLE;

-- Place order (atomic: creates order + deducts stock)
CREATE OR REPLACE FUNCTION place_order(
  p_customer_id UUID,
  p_customer_name TEXT,
  p_customer_phone TEXT,
  p_delivery_address TEXT,
  p_delivery_city TEXT,
  p_delivery_pincode TEXT,
  p_delivery_lat DOUBLE PRECISION DEFAULT NULL,
  p_delivery_lng DOUBLE PRECISION DEFAULT NULL,
  p_distance_km NUMERIC DEFAULT 0,
  p_items JSONB DEFAULT '[]'::JSONB,
  p_notes TEXT DEFAULT ''
)
RETURNS JSONB AS $$
DECLARE
  v_order_id UUID;
  v_order_number TEXT;
  v_subtotal NUMERIC := 0;
  v_delivery_charge NUMERIC := 0;
  v_total NUMERIC := 0;
  v_item JSONB;
  v_product RECORD;
  v_item_total NUMERIC;
BEGIN
  -- Validate items
  IF jsonb_array_length(p_items) = 0 THEN
    RAISE EXCEPTION 'Order must contain at least one item';
  END IF;

  -- Check stock and calculate subtotal
  FOR v_item IN SELECT * FROM jsonb_array_elements(p_items) LOOP
    SELECT * INTO v_product 
    FROM products 
    WHERE id = (v_item->>'product_id')::UUID
    FOR UPDATE; -- Lock the row

    IF v_product IS NULL THEN
      RAISE EXCEPTION 'Product not found: %', v_item->>'product_id';
    END IF;

    IF v_product.status = 'unavailable' OR v_product.status = 'out_of_stock' THEN
      RAISE EXCEPTION 'Product is not available: %', v_product.name;
    END IF;

    IF v_product.stock < (v_item->>'quantity')::INTEGER THEN
      RAISE EXCEPTION 'Insufficient stock for %: available %, requested %', 
        v_product.name, v_product.stock, (v_item->>'quantity')::INTEGER;
    END IF;

    v_item_total := v_product.price * (v_item->>'quantity')::INTEGER;
    v_subtotal := v_subtotal + v_item_total;
  END LOOP;

  -- Calculate delivery charge
  v_delivery_charge := calculate_delivery_charge(p_distance_km);
  v_total := v_subtotal + v_delivery_charge;

  -- Create order
  INSERT INTO orders (
    customer_id, customer_name, customer_phone,
    delivery_address, delivery_city, delivery_pincode,
    delivery_lat, delivery_lng, distance_km,
    subtotal, delivery_charge, total,
    payment_method, status, notes
  ) VALUES (
    p_customer_id, p_customer_name, p_customer_phone,
    p_delivery_address, p_delivery_city, p_delivery_pincode,
    p_delivery_lat, p_delivery_lng, p_distance_km,
    v_subtotal, v_delivery_charge, v_total,
    'cod', 'placed', p_notes
  ) RETURNING id, order_number INTO v_order_id, v_order_number;

  -- Create order items and deduct stock
  FOR v_item IN SELECT * FROM jsonb_array_elements(p_items) LOOP
    SELECT * INTO v_product 
    FROM products 
    WHERE id = (v_item->>'product_id')::UUID;

    v_item_total := v_product.price * (v_item->>'quantity')::INTEGER;

    INSERT INTO order_items (order_id, product_id, product_name, quantity, unit_price, total_price)
    VALUES (v_order_id, v_product.id, v_product.name, (v_item->>'quantity')::INTEGER, v_product.price, v_item_total);

    -- Deduct stock
    UPDATE products 
    SET stock = stock - (v_item->>'quantity')::INTEGER
    WHERE id = v_product.id;
  END LOOP;

  RETURN jsonb_build_object(
    'order_id', v_order_id,
    'order_number', v_order_number,
    'subtotal', v_subtotal,
    'delivery_charge', v_delivery_charge,
    'total', v_total
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Cancel order (atomic: updates status + restores stock)
CREATE OR REPLACE FUNCTION cancel_order(
  p_order_id UUID,
  p_user_id UUID,
  p_reason TEXT DEFAULT 'Cancelled by customer'
)
RETURNS JSONB AS $$
DECLARE
  v_order RECORD;
  v_item RECORD;
  v_is_admin BOOLEAN;
BEGIN
  -- Check if user is admin
  SELECT (role = 'admin') INTO v_is_admin FROM profiles WHERE id = p_user_id;

  -- Get order with lock
  SELECT * INTO v_order FROM orders WHERE id = p_order_id FOR UPDATE;

  IF v_order IS NULL THEN
    RAISE EXCEPTION 'Order not found';
  END IF;

  -- Only allow cancellation if order is in cancellable state
  IF v_order.status NOT IN ('placed', 'confirmed') THEN
    RAISE EXCEPTION 'Order cannot be cancelled in current status: %', v_order.status;
  END IF;

  -- Verify ownership (customer can only cancel their own orders)
  IF NOT v_is_admin AND v_order.customer_id != p_user_id THEN
    RAISE EXCEPTION 'Unauthorized to cancel this order';
  END IF;

  -- Check cancellation window for customers
  IF NOT v_is_admin THEN
    DECLARE
      v_window INTEGER;
    BEGIN
      SELECT cancellation_window_minutes INTO v_window FROM shop_settings WHERE id = 1;
      IF v_order.created_at + (v_window || ' minutes')::INTERVAL < NOW() THEN
        RAISE EXCEPTION 'Cancellation window has expired';
      END IF;
    END;
  END IF;

  -- Update order status
  UPDATE orders 
  SET status = 'cancelled', 
      cancelled_at = NOW(),
      cancellation_reason = p_reason
  WHERE id = p_order_id
  AND status NOT IN ('cancelled'); -- Prevent double cancellation

  -- Restore stock for each item
  FOR v_item IN SELECT * FROM order_items WHERE order_id = p_order_id LOOP
    UPDATE products 
    SET stock = stock + v_item.quantity
    WHERE id = v_item.product_id;
  END LOOP;

  RETURN jsonb_build_object(
    'success', TRUE,
    'order_number', v_order.order_number,
    'status', 'cancelled'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update order status (admin only)
CREATE OR REPLACE FUNCTION update_order_status(
  p_order_id UUID,
  p_new_status TEXT,
  p_admin_id UUID
)
RETURNS JSONB AS $$
DECLARE
  v_order RECORD;
  v_is_admin BOOLEAN;
BEGIN
  -- Verify admin
  SELECT (role = 'admin') INTO v_is_admin FROM profiles WHERE id = p_admin_id;
  IF NOT v_is_admin THEN
    RAISE EXCEPTION 'Only admins can update order status';
  END IF;

  SELECT * INTO v_order FROM orders WHERE id = p_order_id;
  IF v_order IS NULL THEN
    RAISE EXCEPTION 'Order not found';
  END IF;

  -- Validate status transition
  IF p_new_status = 'confirmed' AND v_order.status != 'placed' THEN
    RAISE EXCEPTION 'Can only confirm orders in "placed" status';
  ELSIF p_new_status = 'preparing' AND v_order.status != 'confirmed' THEN
    RAISE EXCEPTION 'Can only prepare orders in "confirmed" status';
  ELSIF p_new_status = 'out_for_delivery' AND v_order.status != 'preparing' THEN
    RAISE EXCEPTION 'Can only dispatch orders in "preparing" status';
  ELSIF p_new_status = 'delivered' AND v_order.status != 'out_for_delivery' THEN
    RAISE EXCEPTION 'Can only deliver orders in "out_for_delivery" status';
  END IF;

  -- Update status with timestamp
  UPDATE orders SET
    status = p_new_status,
    confirmed_at = CASE WHEN p_new_status = 'confirmed' THEN NOW() ELSE confirmed_at END,
    preparing_at = CASE WHEN p_new_status = 'preparing' THEN NOW() ELSE preparing_at END,
    dispatched_at = CASE WHEN p_new_status = 'out_for_delivery' THEN NOW() ELSE dispatched_at END,
    delivered_at = CASE WHEN p_new_status = 'delivered' THEN NOW() ELSE delivered_at END
  WHERE id = p_order_id;

  RETURN jsonb_build_object(
    'success', TRUE,
    'order_number', v_order.order_number,
    'new_status', p_new_status
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get sales summary for a date range
CREATE OR REPLACE FUNCTION get_sales_summary(
  p_start_date DATE,
  p_end_date DATE
)
RETURNS JSONB AS $$
DECLARE
  v_result JSONB;
BEGIN
  SELECT jsonb_build_object(
    'total_orders', COUNT(*),
    'delivered_orders', COUNT(*) FILTER (WHERE status = 'delivered'),
    'cancelled_orders', COUNT(*) FILTER (WHERE status = 'cancelled'),
    'pending_orders', COUNT(*) FILTER (WHERE status IN ('placed', 'confirmed', 'preparing', 'out_for_delivery')),
    'product_sales', COALESCE(SUM(subtotal) FILTER (WHERE status != 'cancelled'), 0),
    'delivery_charges', COALESCE(SUM(delivery_charge) FILTER (WHERE status != 'cancelled'), 0),
    'total_sales', COALESCE(SUM(total) FILTER (WHERE status != 'cancelled'), 0),
    'cod_orders', COUNT(*) FILTER (WHERE payment_method = 'cod' AND status != 'cancelled')
  ) INTO v_result
  FROM orders
  WHERE created_at::DATE BETWEEN p_start_date AND p_end_date;

  RETURN v_result;
END;
$$ LANGUAGE plpgsql STABLE;

-- Updated at trigger helper
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at := NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at triggers
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS update_categories_updated_at ON categories;
CREATE TRIGGER update_categories_updated_at
  BEFORE UPDATE ON categories
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS update_shop_settings_updated_at ON shop_settings;
CREATE TRIGGER update_shop_settings_updated_at
  BEFORE UPDATE ON shop_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
-- Create shop_settings table
CREATE TABLE IF NOT EXISTS public.shop_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_location text NOT NULL DEFAULT 'Main Branch',
  free_delivery_distance_km numeric NOT NULL DEFAULT 2,
  extra_charge_per_km numeric NOT NULL DEFAULT 15,
  business_hours text NOT NULL DEFAULT '09:00 AM - 08:00 PM',
  delivery_available boolean NOT NULL DEFAULT true,
  updated_at timestamptz DEFAULT now()
);

-- Insert a default row if it doesn't exist
INSERT INTO public.shop_settings (id)
SELECT '00000000-0000-0000-0000-000000000000'
WHERE NOT EXISTS (SELECT 1 FROM public.shop_settings);

-- RLS Policies
ALTER TABLE public.shop_settings ENABLE ROW LEVEL SECURITY;

-- Anyone can read settings
CREATE POLICY "Settings are viewable by everyone" ON public.shop_settings
  FOR SELECT USING (true);

-- Only admins can update settings
CREATE POLICY "Settings can be updated by admins" ON public.shop_settings
  FOR UPDATE USING (
    auth.uid() IN (SELECT id FROM public.profiles WHERE is_admin = true)
  );

-- Function to calculate delivery charge based on distance
CREATE OR REPLACE FUNCTION calculate_delivery_charge(distance_km numeric)
RETURNS numeric
LANGUAGE plpgsql
AS $$
DECLARE
  settings record;
  charge numeric := 0;
BEGIN
  SELECT * INTO settings FROM public.shop_settings LIMIT 1;
  
  IF NOT settings.delivery_available THEN
    RAISE EXCEPTION 'Delivery is currently not available';
  END IF;
-- Create shop_settings table
CREATE TABLE IF NOT EXISTS public.shop_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_location text NOT NULL DEFAULT 'Main Branch',
  free_delivery_distance_km numeric NOT NULL DEFAULT 2,
  extra_charge_per_km numeric NOT NULL DEFAULT 15,
  business_hours text NOT NULL DEFAULT '09:00 AM - 08:00 PM',
  delivery_available boolean NOT NULL DEFAULT true,
  updated_at timestamptz DEFAULT now()
);

-- Insert a default row if it doesn't exist
INSERT INTO public.shop_settings (id)
SELECT '00000000-0000-0000-0000-000000000000'
WHERE NOT EXISTS (SELECT 1 FROM public.shop_settings);

-- RLS Policies
ALTER TABLE public.shop_settings ENABLE ROW LEVEL SECURITY;

-- Anyone can read settings
CREATE POLICY "Settings are viewable by everyone" ON public.shop_settings
  FOR SELECT USING (true);

-- Only admins can update settings
CREATE POLICY "Settings can be updated by admins" ON public.shop_settings
  FOR UPDATE USING (
    auth.uid() IN (SELECT id FROM public.profiles WHERE is_admin = true)
  );

-- Function to calculate delivery charge based on distance
CREATE OR REPLACE FUNCTION calculate_delivery_charge(distance_km numeric)
RETURNS numeric
LANGUAGE plpgsql
AS $$
DECLARE
  settings record;
  charge numeric := 0;
BEGIN
  SELECT * INTO settings FROM public.shop_settings LIMIT 1;
  
  IF NOT settings.delivery_available THEN
    RAISE EXCEPTION 'Delivery is currently not available';
  END IF;

  IF distance_km > settings.free_delivery_distance_km THEN
    charge := (distance_km - settings.free_delivery_distance_km) * settings.extra_charge_per_km;
  END IF;

  RETURN charge;
END;
$$;

-- ============================================================
-- ADMIN MANAGEMENT RPCS
-- ============================================================

-- Function to create a sub-admin
CREATE OR REPLACE FUNCTION create_sub_admin(
  p_email TEXT,
  p_password TEXT,
  p_full_name TEXT
) RETURNS JSONB AS $$
DECLARE
  v_user_id UUID;
  v_encrypted_pw TEXT;
  v_caller_role TEXT;
BEGIN
  -- Verify caller is main admin
  SELECT role INTO v_caller_role FROM profiles WHERE id = auth.uid();
  IF v_caller_role != 'admin' THEN
    RAISE EXCEPTION 'Only main admin can create sub admins';
  END IF;

  v_user_id := gen_random_uuid();
  v_encrypted_pw := crypt(p_password, gen_salt('bf'));

  -- Insert into auth.users
  INSERT INTO auth.users (
    id, instance_id, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, aud, role
  ) VALUES (
    v_user_id, '00000000-0000-0000-0000-000000000000', p_email, v_encrypted_pw, now(), 
    '{"provider":"email","providers":["email"]}', 
    json_build_object('full_name', p_full_name, 'role', 'sub_admin'),
    'authenticated', 'authenticated'
  );

  -- Insert into auth.identities
  INSERT INTO auth.identities (id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
  VALUES (gen_random_uuid(), v_user_id, v_user_id::TEXT, format('{"sub":"%s","email":"%s"}', v_user_id::TEXT, p_email)::JSONB, 'email', now(), now(), now());
  
  -- The profiles trigger will create the profile with 'customer' or default, so we enforce it here
  UPDATE profiles SET role = 'sub_admin', full_name = p_full_name WHERE id = v_user_id;

  RETURN jsonb_build_object('success', TRUE, 'user_id', v_user_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to delete a sub-admin
CREATE OR REPLACE FUNCTION delete_sub_admin(
  p_sub_admin_id UUID
) RETURNS JSONB AS $$
DECLARE
  v_caller_role TEXT;
  v_target_role TEXT;
BEGIN
  -- Verify caller is main admin
  SELECT role INTO v_caller_role FROM profiles WHERE id = auth.uid();
  IF v_caller_role != 'admin' THEN
    RAISE EXCEPTION 'Only main admin can delete sub admins';
  END IF;

  -- Verify target is sub-admin
  SELECT role INTO v_target_role FROM profiles WHERE id = p_sub_admin_id;
  IF v_target_role != 'sub_admin' THEN
    RAISE EXCEPTION 'Can only delete sub admins via this function';
  END IF;

  -- Delete from auth.users (cascade deletes profile)
  DELETE FROM auth.users WHERE id = p_sub_admin_id;

  RETURN jsonb_build_object('success', TRUE);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
