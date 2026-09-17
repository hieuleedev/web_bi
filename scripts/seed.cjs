const { createClient } = require('@supabase/supabase-js');
const supabase = createClient('https://uotzztasrxdxdxunleny.supabase.co', 'sb_publishable_raif2dls9os3gJmZ0aqEcg_b0G_kxBb');

const initialDresses = [
  {
    id: 'prod-1',
    title: 'Đầm Trắng Nàng Thơ Cổ Vuông Tay Bồng Xòe Tơ Lụa',
    description: 'Mẫu đầm trắng tinh khôi độc quyền từ Bi Bi Boutique. Thiết kế cổ vuông quý phái, tay bồng công chúa xếp nếp bồng bềnh, tùng váy nhiều tầng mềm mại như mây. Hình chụp tĩnh sản phẩm trên giá treo studio cực nét, không người mẫu.',
    category: 'party-dress',
    brand: 'Nàng Thơ Boutique',
    type: 'both',
    status: 'active',
    buy_price: 1850000,
    rent_price_1day: 250000,
    rent_price_3days: 550000,
    rent_price_7days: 980000,
    deposit: 800000,
    sizes: ['S', 'M', 'L'],
    colors: ['Trắng Thuần Khiết', 'Trắng Kem Vani'],
    material: 'Tơ organza dệt hoa chìm cao cấp, lót lụa tơ tằm',
    condition: 'Mới 100%',
    featured_image: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1594552072238-b8a33785b261?auto=format&fit=crop&w=1000&q=80'
    ],
    seller_id: 'user-seller-1',
    seller_name: 'Bi Bi Boutique (Linh Bi)',
    seller_avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    seller_rating: 4.9,
    location: 'Khối 1 - Xã Núi Thành - Thành Phố Đà Nẵng',
    views: 1820,
    rating: 4.9,
    reviews_count: 42
  },
  {
    id: 'prod-2',
    title: 'Áo Dài Lụa Tơ Tằm Trắng Thêu Sen Thủ Công',
    description: 'Tác phẩm áo dài lụa tơ tằm trắng ngà tinh khôi thêu hoa sen. Tà áo lụa Nha Xá mềm rủ, phom dáng truyền thống thướt tha. Ảnh chụp tĩnh chi tiết chất liệu lụa tự nhiên.',
    category: 'ao-dai',
    brand: 'Heritage Bi Bi',
    type: 'both',
    status: 'active',
    buy_price: 2450000,
    rent_price_1day: 280000,
    rent_price_3days: 620000,
    rent_price_7days: 1100000,
    deposit: 1000000,
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['Trắng Tinh Khôi', 'Trắng Ngà Tự Nhiên'],
    material: '100% Lụa tơ tằm Nha Xá mềm mại',
    condition: '99% Like New',
    featured_image: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=1000&q=80'
    ],
    seller_id: 'user-seller-1',
    seller_name: 'Bi Bi Boutique (Linh Bi)',
    seller_avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    seller_rating: 4.9,
    location: 'Khối 1 - Xã Núi Thành - Thành Phố Đà Nẵng',
    views: 1450,
    rating: 5.0,
    reviews_count: 31
  },
  {
    id: 'prod-3',
    title: 'Đầm Xòe Trắng Tiểu Thư Cổ Vuông Đính Nơ Satin',
    description: 'Mẫu váy trắng xòe bồng tiểu thư chụp trải sàn flat-lay cực kỳ tinh tế. Chi tiết cổ vuông viền ren, đính nơ satin thanh lịch và tùng váy xếp ly nhiều tầng.',
    category: 'streetwear',
    brand: 'Mộc Lan Vintage',
    type: 'both',
    status: 'active',
    buy_price: 950000,
    rent_price_1day: 130000,
    rent_price_3days: 290000,
    rent_price_7days: 520000,
    deposit: 400000,
    sizes: ['S', 'M', 'L'],
    colors: ['Trắng Tinh Khôi', 'Trắng Sữa'],
    material: 'Voan tơ dệt nổi mềm mại, lót lụa êm ái',
    condition: 'Mới 100%',
    featured_image: 'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?auto=format&fit=crop&w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?auto=format&fit=crop&w=1000&q=80'
    ],
    seller_id: 'user-seller-1',
    seller_name: 'Bi Bi Boutique (Linh Bi)',
    seller_avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    seller_rating: 4.9,
    location: 'Khối 1 - Xã Núi Thành - Thành Phố Đà Nẵng',
    views: 1650,
    rating: 4.9,
    reviews_count: 38
  },
  {
    id: 'prod-4',
    title: 'Váy Cưới Hoàng Gia Trắng Ren Chuông Mannequin Showroom',
    description: 'Váy cưới công chúa xòe bồng cao cấp trưng bày trên mannequin showroom. Tùng váy ren hoa chuông đa tầng lộng lẫy, gọng định hình eo corsage tôn dáng.',
    category: 'wedding',
    brand: 'Bi Bi Bridal Couture',
    type: 'rent',
    status: 'active',
    buy_price: 0,
    rent_price_1day: 1200000,
    rent_price_3days: 2500000,
    rent_price_7days: 4500000,
    deposit: 2500000,
    sizes: ['S', 'M'],
    colors: ['Trắng Ngà Tự Nhiên (Ivory)', 'Trắng Tinh'],
    material: 'Ren dệt sợi cotton mềm cao cấp, lót lụa satin co giãn thoải mái',
    condition: '99% Like New',
    featured_image: 'https://images.unsplash.com/photo-1594552072238-b8a33785b261?auto=format&fit=crop&w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1594552072238-b8a33785b261?auto=format&fit=crop&w=1000&q=80'
    ],
    seller_id: 'user-seller-1',
    seller_name: 'Bi Bi Boutique (Linh Bi)',
    seller_avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    seller_rating: 4.9,
    location: 'Khối 1 - Xã Núi Thành - Thành Phố Đà Nẵng',
    views: 2100,
    rating: 5.0,
    reviews_count: 26
  }
];

async function seed() {
  for (const item of initialDresses) {
    const { error } = await supabase.from('products').upsert(item);
    if (error) console.error('Error seeding item', item.id, error);
    else console.log('Successfully seeded item to Supabase:', item.title);
  }
}
seed();
