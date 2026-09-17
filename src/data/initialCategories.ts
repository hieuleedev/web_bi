export interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string;
  description: string;
  image?: string;
}

export const CATEGORIES: Category[] = [
  {
    id: 'party-dress',
    name: 'Đầm Dự Tiệc & Dạ Hội',
    slug: 'dam-da-hoi',
    icon: 'Sparkles',
    description: 'Váy dạ hội, đầm dự tiệc sang trọng thiết kế cao cấp',
  },
  {
    id: 'ao-dai',
    name: 'Áo Dài Truyền Thống & Cách Tân',
    slug: 'ao-dai',
    icon: 'Heart',
    description: 'Áo dài lụa tơ tằm thêu hoa sen, áo dài cưới thanh lịch',
  },
  {
    id: 'vest-blazer',
    name: 'Set Blazer & Áo Khoác Tiểu Thư',
    slug: 'blazer-tieu-thu',
    icon: 'Briefcase',
    description: 'Blazer dạ tweed phối chân váy xếp ly thanh lịch',
  },
  {
    id: 'wedding',
    name: 'Váy Cưới & Đầm Công Chúa',
    slug: 'vay-cuoi',
    icon: 'Crown',
    description: 'Váy cưới ren bồng bềnh trưng bày mannequin lộng lẫy',
  },
  {
    id: 'streetwear',
    name: 'Váy Hoa Nhí & Maxi Đi Biển',
    slug: 'vay-hoa-nhi',
    icon: 'Smile',
    description: 'Váy maxi voan tơ bồng bềnh dạo phố và du lịch',
  },
  {
    id: 'office',
    name: 'Thời Trang Công Sở Nữ',
    slug: 'vay-cong-so',
    icon: 'Layers',
    description: 'Đầm suông công sở thanh lịch, nhã nhặn',
  },
  {
    id: 'co-ords',
    name: 'Set Đồ Thiết Kế Phối Sẵn',
    slug: 'set-vay-vintage',
    icon: 'Sparkles',
    description: 'Set đồ phối sẵn tiện lợi phong cách nàng thơ',
  },
  {
    id: 'accessories',
    name: 'Túi Xách & Phụ Kiện',
    slug: 'phu-kien-nu',
    icon: 'Gem',
    description: 'Túi xách, clutch ngọc trai sang trọng tôn vinh bộ váy',
  }
];
