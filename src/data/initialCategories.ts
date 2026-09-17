export interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string;
  description: string;
  image: string;
}

export const CATEGORIES: Category[] = [
  {
    id: 'party-dress',
    name: 'Đầm Dự Tiệc & Dạ Hội',
    slug: 'dam-da-hoi',
    icon: 'Sparkles',
    description: 'Quyến rũ, sang trọng và kiêu sa cho nàng thơ dự tiệc đêm',
    image: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'ao-dai',
    name: 'Áo Dài Nàng Thơ & Cách Tân',
    slug: 'ao-dai',
    icon: 'Heart',
    description: 'Dịu dàng, đằm thắm nét đẹp thiếu nữ Việt Nam truyền thống',
    image: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'vest-blazer',
    name: 'Set Blazer & Váy Tiểu Thư',
    slug: 'blazer-tieu-thu',
    icon: 'Briefcase',
    description: 'Phong cách tiểu thư đài các, ngọt ngào và thanh lịch',
    image: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'wedding',
    name: 'Váy Cưới & Đầm Công Chúa',
    slug: 'vay-cuoi',
    icon: 'Crown',
    description: 'Bồng bềnh tinh khôi như bước ra từ câu chuyện cổ tích',
    image: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'streetwear',
    name: 'Váy Hoa Nhí & Maxi Đi Biển',
    slug: 'vay-hoa-nhi',
    icon: 'Smile',
    description: 'Nàng thơ du lịch Đà Lạt, biển xanh mộng mơ bay bổng',
    image: 'https://images.unsplash.com/photo-1516575334481-f85287c2c82d?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'office',
    name: 'Váy Công Sở Nàng Thơ',
    slug: 'vay-cong-so',
    icon: 'Layers',
    description: 'Trang nhã, tôn dáng nhẹ nhàng nơi văn phòng hiện đại',
    image: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'co-ords',
    name: 'Set Váy Yếm & Lookbook Vintage',
    slug: 'set-vay-vintage',
    icon: 'Sparkles',
    description: 'Phong cách nàng thơ Châu Á, nhẹ nhàng thơ mộng',
    image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'accessories',
    name: 'Túi Xách & Phụ Kiện Nữ',
    slug: 'phu-kien-nu',
    icon: 'Gem',
    description: 'Túi ngọc trai, kẹp tóc lụa hoàn thiện vẻ đẹp kiều diễm',
    image: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=600&q=80',
  }
];
