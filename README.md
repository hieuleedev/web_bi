# Bi Bi Boutique & Rental - Nền Tảng Mua Bán & Cho Thuê Thời Trang Cao Cấp

Website thương mại điện tử thời trang hiện đại hàng đầu kết hợp hai mô hình: **Mua Bán Thời Trang** và **Cho Thuê Trang Phục Theo Lịch Hẹn Chống Trùng Tự Động**.

---

## 🌟 Các Tính Năng Nổi Bật

### 1. Dành Cho Khách Hàng (Storefront)
- **Trang chủ (`/`)**: Hero banner ấn tượng với 2 CTA ("Mua ngay" & "Thuê ngay"), danh mục phong cách, sản phẩm nổi bật, trang phục sự kiện/tiệc tùng, CTA đăng đồ.
- **Trang Mua Sắm (`/shop`)**: Tìm kiếm thông minh, bộ lọc đa chiều (Danh mục, Giới tính, Size, Mức giá, Tình trạng), sắp xếp theo giá và rating.
- **Trang Cho Thuê (`/rent`)**:
  - Lọc theo ngày trống khả dụng (loại trừ các trang phục đã có người đặt trước).
  - Hiển thị rõ giá thuê theo ngày, gói 3 ngày, gói 7 ngày và tiền cọc quy định.
- **Trang Chi Tiết Sản Phẩm (`/product/:id`)**:
  - Gallery nhiều góc chụp + hiệu ứng zoom chi tiết chất liệu vải.
  - Lịch tương tác chọn ngày thuê (Start Date → End Date) với thuật toán kiểm tra chống trùng lịch:
    $$\text{requested\_start} < \text{existing\_end} \land \text{requested\_end} > \text{existing\_start}$$
  - Bảng tính tự động: Tiền thuê + Tiền cọc + Phí giặt hấp miễn phí.
  - Đánh giá sao 1-5 sao và bình luận thực tế từ người dùng.
  - Nút nhắn tin tư vấn trực tiếp với chủ đồ/shop.
- **Giỏ Hàng (`/cart`)**: Tách biệt rõ ràng sản phẩm mua đứt và sản phẩm thuê kèm số ngày, lịch nhận/trả và tiền cọc.
- **Đặt Hàng & Thanh Toán (`/checkout`)**:
  - Nhập họ tên, số điện thoại, email, địa chỉ chi tiết, ghi chú shipper.
  - Hình thức nhận: Giao tận nơi hoặc nhận tại Showroom Bi Bi.
  - Phương thức thanh toán: COD, Chuyển khoản VietQR hiển thị thông tin ngân hàng tự động, MoMo.
  - Hiệu ứng pháo hoa chúc mừng đặt hàng thành công + Mã vận đơn theo dõi.

### 2. Dành Cho Người Bán & Cho Thuê (`/sell` & `/account`)
- **Đăng Sản Phẩm (`/sell`)**:
  - Kéo thả / chọn nhiều ảnh từ máy tính (hỗ trợ preview ngay lập tức bằng Base64 và chọn ảnh bìa).
  - Tùy chọn mô hình: Bán, Cho thuê hoặc Cả hai.
  - Cấu hình giá bán, giá thuê (1 ngày, 3 ngày, 7 ngày) và tiền đặt cọc.
  - Mô tả số đo ngực-eo-mông, hướng dẫn bảo quản trang phục.
- **Quản Lý Cá Nhân (`/account`)**:
  - Quản lý sản phẩm đã đăng: Sửa trạng thái (Ẩn/Hiện), xem lượt xem, xóa sản phẩm.
  - Quản lý đơn mua & đơn thuê của bản thân.
  - Quản lý đơn khách đặt thuê đồ của shop.
  - Danh sách sản phẩm yêu thích (Wishlist).
  - Hộp thư trò chuyện (Chat) trực tiếp với khách hàng.

### 3. Phân Hệ Quản Trị Hệ Thống (Admin Dashboard `/admin`)
- Thống kê toàn sàn: Doanh thu, Tổng số đơn hàng, Số lượt thuê, Số sản phẩm.
- Kiểm duyệt sản phẩm mới đăng (Phê duyệt / Từ chối).
- Quản lý đơn hàng toàn sàn: Đổi trạng thái (Chờ xác nhận → Đang chuẩn bị → Đang giao → Đang thuê → Đã nhận lại đồ → Hoàn cọc / Hoàn tất).

---

## 🚀 Hướng Dẫn Khởi Chạy Ứng Dụng

### Khởi động môi trường phát triển (Dev Server)
```bash
npm run dev
```
Ứng dụng sẽ chạy tại địa chỉ: `http://localhost:3000` (hoặc cổng Vite thông báo).

### Kiểm tra build production
```bash
npm run build
```

---

## 👥 Tài Khoản Mẫu Để Thử Nghiệm

Hệ thống tích hợp sẵn nút **Chuyển đổi vai trò nhanh** ở thanh Topbar góc trên cùng bên phải để bạn trải nghiệm ngay lập tức:
1. **Chủ Shop (Linh Bi - Bi Bi Boutique)**: Đăng bán đồ, nhận đơn khách thuê, duyệt đơn, chat tư vấn.
2. **Khách Hàng (Hoàng Mai Yến)**: Đặt thuê đầm dạ hội, chọn ngày nhận/trả, đặt mua vest, theo dõi cọc.
3. **Quản Trị Viên (Admin Bi Bi)**: Phê duyệt sản phẩm mới đăng, quản lý toàn bộ đơn hàng và xử lý hoàn cọc.
