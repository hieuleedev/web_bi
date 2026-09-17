import { User } from '../types';

export const MOCK_USERS: User[] = [
  {
    id: 'user-seller-1',
    name: 'Bi Bi Boutique (Linh Bi)',
    email: 'bibi.fashion@gmail.com',
    phone: '0795623097',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    role: 'seller',
    rating: 4.9,
    ratingCount: 128,
    location: 'Khối 1 - Xã Núi Thành - Thành Phố Đà Nẵng, Da Nang, Vietnam, 560000',
    joinedDate: '2023-01-15',
    bio: 'Chuyên cung cấp và cho thuê đầm dạ hội, áo dài cưới thiết kế thủ công tinh xảo, cam kết chuẩn form dáng và vệ sinh giặt hấp chuẩn 5 sao.'
  },
  {
    id: 'user-admin',
    name: 'Quản Trị Viên Bi Bi',
    email: 'admin@bibifashion.vn',
    phone: '0901234567',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80',
    role: 'admin',
    rating: 5.0,
    ratingCount: 350,
    location: 'Khối 1 - Xã Núi Thành - Thành Phố Đà Nẵng, Da Nang, Vietnam, 560000',
    joinedDate: '2022-10-01',
    bio: 'Ban Quản Trị Hệ Thống Sàn Thương Mại Điện Tử Thời Trang Bi Bi.'
  },
  {
    id: 'user-buyer-1',
    name: 'Hoàng Mai Yến',
    email: 'maiyen.hoang@gmail.com',
    phone: '0912349876',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=80',
    role: 'buyer',
    rating: 5.0,
    ratingCount: 14,
    location: 'Cầu Giấy, Hà Nội',
    joinedDate: '2023-05-20',
    bio: 'Đam mê thời trang tiệc và chụp ảnh ngoại cảnh.'
  }
];
