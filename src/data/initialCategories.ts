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
    id: 'dam-dai',
    name: 'Đầm dài',
    slug: 'dam-dai',
    icon: 'Sparkles',
    description: 'Đầm dạ hội, đầm dự tiệc dáng dài, đầm maxi thướt tha sang trọng',
  },
  {
    id: 'dam-ngan',
    name: 'Đầm ngắn',
    slug: 'dam-ngan',
    icon: 'Heart',
    description: 'Váy ngắn dự tiệc, đầm xòe công chúa, đầm mini trẻ trung',
  },
  {
    id: 'set',
    name: 'Set',
    slug: 'set',
    icon: 'Layers',
    description: 'Set đồ phối sẵn, set blazer dạ tweed, set áo váy thanh lịch',
  },
  {
    id: 'tui-xach',
    name: 'Túi xách',
    slug: 'tui-xach',
    icon: 'ShoppingBag',
    description: 'Túi xách cao cấp, clutch cầm tay dự tiệc, túi đeo chéo',
  },
  {
    id: 'giay-dep',
    name: 'Giày dép',
    slug: 'giay-dep',
    icon: 'Footprints',
    description: 'Giày cao gót, sandal dự tiệc, guốc tiểu thư thanh lịch',
  },
  {
    id: 'phu-kien',
    name: 'Phụ kiện',
    slug: 'phu-kien',
    icon: 'Gem',
    description: 'Trang sức, khuyên tai, vòng cổ, phụ kiện cài tóc lung linh',
  }
];
