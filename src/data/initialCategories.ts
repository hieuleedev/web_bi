export interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string; // emoji or lucide icon name
  description: string;
  image: string;
}

export const CATEGORIES: Category[] = [
  {
    id: 'party-dress',
    name: 'Đầm Dạ Hội & Dự Tiệc',
    slug: 'dam-da-hoi',
    icon: 'Sparkles',
    description: 'Quyến rũ, sang trọng cho sự kiện gala và tiệc tối',
    image: 'https://images.unsplash.com/photo-1566174053879-31528523f8ae?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'ao-dai',
    name: 'Áo Dài Truyền Thống & Cách Tân',
    slug: 'ao-dai',
    icon: 'Heart',
    description: 'Thanh thoát, quý phái cho lễ tết, chụp ảnh kỷ yếu và cưới hỏi',
    image: 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'vest-blazer',
    name: 'Vest & Blazer Cao Cấp',
    slug: 'vest-blazer',
    icon: 'Briefcase',
    description: 'Lịch lãm, quyền lực cho doanh nhân và sự kiện trang trọng',
    image: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'wedding',
    name: 'Váy Cưới & Phù Dâu',
    slug: 'vay-cuoi',
    icon: 'Crown',
    description: 'Lung linh trọn vẹn khoảnh khắc trọng đại của cuộc đời',
    image: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'streetwear',
    name: 'Váy Thiết Kế & Dạo Phố',
    slug: 'vay-thiet-ke',
    icon: 'Smile',
    description: 'Trẻ trung, thời thượng cho những chuyến du lịch và hẹn hò',
    image: 'https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'office',
    name: 'Đồ Công Sở Thời Thượng',
    slug: 'do-cong-so',
    icon: 'Layers',
    description: 'Thanh lịch và tự tin nơi văn phòng hiện đại',
    image: 'https://images.unsplash.com/photo-1487222477894-8943e31ef7b2?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'men-fashion',
    name: 'Thời Trang Nam',
    slug: 'thoi-trang-nam',
    icon: 'User',
    description: 'Phong cách nam tính, tinh tế cho phái mạnh',
    image: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'accessories',
    name: 'Phụ Kiện & Trang Sức',
    slug: 'phu-kien',
    icon: 'Gem',
    description: 'Điểm nhấn hoàn hảo cho bộ trang phục của bạn',
    image: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=600&q=80',
  }
];
