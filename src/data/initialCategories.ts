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
    name: 'Đầm Dự Tiệc & Dạ Hội Trắng',
    slug: 'dam-da-hoi',
    icon: 'Sparkles',
    description: 'Váy dạ hội trắng tinh khôi treo giá boutique cao cấp',
    image: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'ao-dai',
    name: 'Áo Dài Lụa Trắng Nàng Thơ',
    slug: 'ao-dai',
    icon: 'Heart',
    description: 'Áo dài lụa tơ tằm trắng thêu hoa sen trang nhã',
    image: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'vest-blazer',
    name: 'Set Blazer & Váy Trắng Tiểu Thư',
    slug: 'blazer-tieu-thu',
    icon: 'Briefcase',
    description: 'Blazer dạ tweed trắng phối chân váy xếp ly thanh lịch',
    image: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'wedding',
    name: 'Váy Cưới & Đầm Công Chúa Trắng',
    slug: 'vay-cuoi',
    icon: 'Crown',
    description: 'Váy cưới ren trắng bồng bềnh trưng bày mannequin lộng lẫy',
    image: 'https://images.unsplash.com/photo-1594552072238-b8a33785b261?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'streetwear',
    name: 'Váy Hoa Nhí & Maxi Trắng Đi Biển',
    slug: 'vay-hoa-nhi',
    icon: 'Smile',
    description: 'Váy maxi trắng bồng bềnh dạo phố và du lịch',
    image: 'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'office',
    name: 'Váy Công Sở Trắng Nàng Thơ',
    slug: 'vay-cong-so',
    icon: 'Layers',
    description: 'Đầm suông cổ vest trắng trang nhã nơi công sở',
    image: 'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'co-ords',
    name: 'Set Váy Xô Trắng Nàng Thơ',
    slug: 'set-vay-vintage',
    icon: 'Sparkles',
    description: 'Set váy xô đũi trắng phong cách nàng thơ vintage',
    image: 'https://images.unsplash.com/photo-1566174053879-31528523f8ae?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'accessories',
    name: 'Túi Xách & Phụ Kiện Ngọc Trai',
    slug: 'phu-kien-nu',
    icon: 'Gem',
    description: 'Clutch ngọc trai trắng sang trọng tôn vinh bộ váy',
    image: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=600&q=80',
  }
];
