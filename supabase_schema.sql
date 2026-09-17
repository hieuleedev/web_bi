-- =========================================================
-- BI BI FASHION MARKETPLACE - SUPABASE DATABASE SCHEMA
-- Bán & Cho Thuê Quần Áo (Hỗ trợ quản lý lịch thuê và đặt cọc)
-- =========================================================

-- 1. Bảng sản phẩm (Products)
CREATE TABLE IF NOT EXISTS public.products (
  id TEXT PRIMARY KEY,
  seller_id TEXT,
  seller_name TEXT,
  seller_avatar TEXT,
  seller_rating NUMERIC(3, 2) DEFAULT 5.0,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  brand TEXT DEFAULT 'Thiết Kế Cao Cấp',
  type TEXT NOT NULL CHECK (type IN ('buy', 'rent', 'both')),
  condition TEXT DEFAULT 'Mới 99%',
  material TEXT,
  sizes TEXT[] DEFAULT '{"S", "M", "L"}',
  colors TEXT[] DEFAULT '{"Mặc định"}',
  buy_price NUMERIC(12, 2) DEFAULT 0,
  rent_price_1day NUMERIC(12, 2) DEFAULT 0,
  rent_price_3days NUMERIC(12, 2) DEFAULT 0,
  rent_price_7days NUMERIC(12, 2) DEFAULT 0,
  deposit NUMERIC(12, 2) DEFAULT 0,
  featured_image TEXT NOT NULL,
  images TEXT[] NOT NULL,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'pending', 'hidden')),
  views INTEGER DEFAULT 0,
  rating NUMERIC(3, 2) DEFAULT 5.0,
  reviews_count INTEGER DEFAULT 0,
  location TEXT DEFAULT 'Đà Nẵng',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Bảng lịch thuê sản phẩm (Rental Bookings)
CREATE TABLE IF NOT EXISTS public.rental_bookings (
  id TEXT PRIMARY KEY,
  product_id TEXT REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
  order_id TEXT,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  renter_name TEXT,
  renter_phone TEXT,
  status TEXT DEFAULT 'confirmed' CHECK (status IN ('pending', 'confirmed', 'completed', 'blocked', 'cancelled')),
  note TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT valid_rental_range CHECK (end_date >= start_date)
);

-- 3. Bảng đơn hàng (Orders)
CREATE TABLE IF NOT EXISTS public.orders (
  id TEXT PRIMARY KEY,
  order_code TEXT UNIQUE NOT NULL,
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  shipping_address TEXT NOT NULL,
  delivery_method TEXT DEFAULT 'standard',
  payment_method TEXT DEFAULT 'vietqr',
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'shipping', 'renting', 'returned', 'completed', 'cancelled')),
  total_rent_fee NUMERIC(12, 2) DEFAULT 0,
  total_buy_price NUMERIC(12, 2) DEFAULT 0,
  total_deposit NUMERIC(12, 2) DEFAULT 0,
  shipping_fee NUMERIC(12, 2) DEFAULT 30000,
  deposit_status TEXT DEFAULT 'held' CHECK (deposit_status IN ('none', 'held', 'refunded', 'deducted')),
  items JSONB NOT NULL,
  note TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Bật Row Level Security (RLS) và cho phép Public thao tác
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rental_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

DO $\$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public read products') THEN
    CREATE POLICY "Public read products" ON public.products FOR SELECT USING (true);
    CREATE POLICY "Public insert products" ON public.products FOR INSERT WITH CHECK (true);
    CREATE POLICY "Public update products" ON public.products FOR UPDATE USING (true);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public read rental_bookings') THEN
    CREATE POLICY "Public read rental_bookings" ON public.rental_bookings FOR SELECT USING (true);
    CREATE POLICY "Public insert rental_bookings" ON public.rental_bookings FOR INSERT WITH CHECK (true);
    CREATE POLICY "Public delete rental_bookings" ON public.rental_bookings FOR DELETE USING (true);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public read orders') THEN
    CREATE POLICY "Public read orders" ON public.orders FOR SELECT USING (true);
    CREATE POLICY "Public insert orders" ON public.orders FOR INSERT WITH CHECK (true);
    CREATE POLICY "Public update orders" ON public.orders FOR UPDATE USING (true);
  END IF;
END
$\$;
