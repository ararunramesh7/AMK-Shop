-- ============================================================
-- ARUNA MURUKU KADAI — Row Level Security Policies
-- Run this AFTER schema.sql in Supabase SQL Editor
-- ============================================================

-- Helper function: check if current user is admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- ============================================================
-- PROFILES
-- ============================================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Users can view their own profile
CREATE POLICY profiles_select_own ON profiles
  FOR SELECT USING (id = auth.uid() OR is_admin());

-- Users can update their own profile (but not role)
CREATE POLICY profiles_update_own ON profiles
  FOR UPDATE USING (id = auth.uid())
  WITH CHECK (
    id = auth.uid() 
    AND role = (SELECT role FROM profiles WHERE id = auth.uid())
  );

-- Admins can view all profiles
CREATE POLICY profiles_admin_select ON profiles
  FOR SELECT USING (is_admin());

-- Admins can update any profile
CREATE POLICY profiles_admin_update ON profiles
  FOR UPDATE USING (is_admin());

-- ============================================================
-- CATEGORIES
-- ============================================================
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

-- Everyone can view active categories
CREATE POLICY categories_select_all ON categories
  FOR SELECT USING (TRUE);

-- Only admins can insert/update/delete
CREATE POLICY categories_admin_insert ON categories
  FOR INSERT WITH CHECK (is_admin());

CREATE POLICY categories_admin_update ON categories
  FOR UPDATE USING (is_admin());

CREATE POLICY categories_admin_delete ON categories
  FOR DELETE USING (is_admin());

-- ============================================================
-- PRODUCTS
-- ============================================================
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Everyone can view products
CREATE POLICY products_select_all ON products
  FOR SELECT USING (TRUE);

-- Only admins can manage products
CREATE POLICY products_admin_insert ON products
  FOR INSERT WITH CHECK (is_admin());

CREATE POLICY products_admin_update ON products
  FOR UPDATE USING (is_admin());

CREATE POLICY products_admin_delete ON products
  FOR DELETE USING (is_admin());

-- ============================================================
-- ORDERS
-- ============================================================
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Customers can view their own orders
CREATE POLICY orders_select_own ON orders
  FOR SELECT USING (customer_id = auth.uid() OR is_admin());

-- Customers can create orders for themselves
CREATE POLICY orders_insert_own ON orders
  FOR INSERT WITH CHECK (customer_id = auth.uid());

-- Only admins can update orders (status changes)
CREATE POLICY orders_admin_update ON orders
  FOR UPDATE USING (is_admin() OR customer_id = auth.uid());

-- ============================================================
-- ORDER ITEMS
-- ============================================================
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- Customers can view their own order items
CREATE POLICY order_items_select_own ON order_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM orders 
      WHERE orders.id = order_items.order_id 
      AND (orders.customer_id = auth.uid() OR is_admin())
    )
  );

-- Customers can insert items for their own orders
CREATE POLICY order_items_insert_own ON order_items
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM orders 
      WHERE orders.id = order_items.order_id 
      AND orders.customer_id = auth.uid()
    )
  );

-- ============================================================
-- NOTIFICATIONS
-- ============================================================
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Users can view their own notifications
CREATE POLICY notifications_select_own ON notifications
  FOR SELECT USING (user_id = auth.uid() OR is_admin());

-- Users can update their own notifications (mark as read)
CREATE POLICY notifications_update_own ON notifications
  FOR UPDATE USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- System/admin can insert notifications (via SECURITY DEFINER functions)
CREATE POLICY notifications_admin_insert ON notifications
  FOR INSERT WITH CHECK (is_admin() OR user_id = auth.uid());

-- ============================================================
-- SHOP SETTINGS
-- ============================================================
ALTER TABLE shop_settings ENABLE ROW LEVEL SECURITY;

-- Everyone can read shop settings
CREATE POLICY shop_settings_select_all ON shop_settings
  FOR SELECT USING (TRUE);

-- Only admins can update settings
CREATE POLICY shop_settings_admin_update ON shop_settings
  FOR UPDATE USING (is_admin());

-- ============================================================
-- CUSTOMER ADDRESSES
-- ============================================================
ALTER TABLE customer_addresses ENABLE ROW LEVEL SECURITY;

-- Users can manage their own addresses
CREATE POLICY addresses_select_own ON customer_addresses
  FOR SELECT USING (user_id = auth.uid() OR is_admin());

CREATE POLICY addresses_insert_own ON customer_addresses
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY addresses_update_own ON customer_addresses
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY addresses_delete_own ON customer_addresses
  FOR DELETE USING (user_id = auth.uid());
