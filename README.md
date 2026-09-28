# VIVU - Đi đâu cũng có bạn (Mobile App React Native / Expo)

Ứng dụng mạng xã hội khám phá du lịch, kết nối bạn bè, tìm kiếm hoạt động và nhóm sở thích tại Việt Nam (Đà Nẵng, Hội An, Hà Nội, TP.HCM,...).

---

## 📱 Danh sách 28 màn hình đã triển khai đầy đủ theo thiết kế

### 1. Luồng Khởi động & Xác thực (Screens 1 - 10)
- **1. Splash Screen**: Logo thương hiệu VIVU, gradient tím, hình ảnh bạn trẻ khám phá thành phố.
- **2. Welcome**: Giới thiệu thông điệp, nút "Bắt đầu" và chuyển hướng đăng nhập.
- **3. Đăng ký**: Đăng ký qua SĐT/Email, mật khẩu, đăng nhập mạng xã hội (Google, Apple).
- **4. Đăng nhập**: Form đăng nhập, quên mật khẩu, liên kết tạo tài khoản.
- **5. Xác thực tài khoản (OTP)**: 6 ô nhập mã OTP tự động, đồng hồ đếm ngược gửi lại mã.
- **6. Chọn thành phố**: Thanh tìm kiếm, danh sách chọn địa phương (Đà Nẵng, Hà Nội, TP.HCM, Huế, Nha Trang...).
- **7. Chọn mục tiêu**: Thẻ mục tiêu cá nhân hóa (Làm quen bạn mới, Tìm người đi ăn, Khám phá thành phố, Tìm hội nhóm, Tìm người cùng sở thích).
- **8. Chọn sở thích**: Lưới 12 danh mục sở thích (Food, Cafe, Photography, Phượt, Camping, Travel, Movie, Gaming, Hát, Sport, Music, Art) kèm bộ đếm đã chọn.
- **9. Mức độ giao tiếp**: Đánh giá độ tự tin (😄 Dễ bắt chuyện, 😊 Bình thường, 😅 Hơi ngại, 🙈 Khá rụt rè).
- **10. Thiết lập quyền riêng tư**: Bật/tắt switch cài đặt vị trí, hồ sơ, tin nhắn, thông báo trước khi vào ứng dụng.

### 2. Trang chủ & Bảng tin bài viết (Screens 11 - 15)
- **11. Home Feed**: 
  - Lời chào cá nhân hóa *"Chào buổi sáng, Tùng 👋"*, vị trí *"Đà Nẵng"*.
  - Thanh tìm kiếm địa điểm, danh mục hoạt động cuộn ngang.
  - Thẻ hoạt động gợi ý (Food tour Hội An / Đà Nẵng).
  - Bảng tin bài đăng cộng đồng (Minh Thư, Quang Anh) kèm bộ ảnh, hashtags, nút thả tim tương tác.
  - Gợi ý thông minh từ Trợ lý ảo ViVi.
- **12. Chi tiết bài viết**: Toàn văn bài đăng, album ảnh lớn, thông tin lời mời rủ đi cùng, luồng bình luận và khung gửi bình luận trực tiếp.
- **13. Tạo bài viết**: Soạn thảo nội dung, đính kèm 6 loại thông tin (Ảnh, Video, Địa điểm, Thời gian, Số người, Hashtag).
- **14. Chỉnh sửa bài viết**: Xem trước ảnh, cập nhật địa điểm, giờ giấc và số lượng người tham gia.
- **15. Bình luận bài viết**: Danh sách bình luận dạng luồng trao đổi, thẻ trợ lý ViVi gợi ý câu bắt chuyện tự động.

### 3. Match & Hoạt động (Screens 16 - 18)
- **16. Match Home**: Khám phá chuyến đi theo danh mục (Ăn uống, Đi dạo, Camping, Chill, Săn mây...), danh thiếp hoạt động chi tiết số người đã tham gia.
- **17. Chi tiết hoạt động**: 
  - Banner hoạt động, đánh giá ⭐ 4.8.
  - Thông tin host (Minh Thư - 94 điểm uy tín).
  - Các tab: Mô tả, Người tham gia, Trao đổi.
  - Bản đồ thu nhỏ và lộ trình.
  - Nút chuyển đổi trạng thái "Tham gia / Đã tham gia".
- **18. Danh sách người tham gia**: Danh sách thành viên cùng tham gia hoạt động, hiển thị vai trò Trưởng nhóm (Host), điểm uy tín và nút nhắn tin riêng.

### 4. Hội nhóm & Cộng đồng (Screens 19 - 21)
- **19. Group Home**: Phân loại theo tab *Dành cho bạn*, *Đang hoạt động*, *Của bạn*, thẻ nhóm sinh động (Foodie Đà Nẵng, Phượt Club, Camping Real...).
- **20. Group chi tiết**: Ảnh bìa, thông tin quản trị viên, mô tả nhóm, số lượng online, danh sách bài viết thảo luận trong nhóm.
- **21. Group Chat Room**: Phòng chat tập thể thời gian thực, hiển thị tin nhắn thành viên và bot trợ lý ảo gợi ý địa điểm.

### 5. Tin nhắn & Chat cá nhân (Screens 22 - 23)
- **22. Message Home**: Hộp thư phân loại *Tất cả* / *Chưa đọc*, huy hiệu tin nhắn mới, trạng thái hoạt động online.
- **23. Chat cá nhân**: Phòng trò chuyện 1-1 với Minh Thư, thẻ ViVi gợi ý câu trả lời nhanh chóng.

### 6. Bản đồ & Đánh giá địa điểm (Screens 24 - 25)
- **24. Map / Khám phá**: Bản đồ địa lý với các ghim vị trí (Bán đảo Sơn Trà, Cầu Rồng, Biển Mỹ Khê), bộ lọc Địa điểm/Hoạt động/Bạn bè và thẻ thông tin địa điểm nổi.
- **25. Đánh giá địa điểm**: Đánh giá Quán Bánh Tráng Thịt Heo Đại Lộc, thang điểm chi tiết (Chất lượng món, độ tươi, không gian, vị trí, phù hợp nhóm), hình ảnh review thực tế.

### 7. Hồ sơ cá nhân & Trợ lý ViVi (Screens 27 - 28)
- **27. Profile & Điểm uy tín**:
  - Huy hiệu điểm uy tín **94/100** nổi bật.
  - Bảng chi tiết minh bạch các tiêu chí uy tín: Xác thực tài khoản (20/20), Hoạt động dã ngoại (30/30), Đánh giá bạn bè (19/20), Tham gia đúng hẹn (14/15), Phản hồi cộng đồng (5/5).
  - Thống kê bài viết, sở thích và cài đặt tài khoản.
- **28. ViVi Floating Assistant**: Trợ lý ảo AI thông minh hỗ trợ viết tin nhắn làm quen, tìm chủ đề chung, gợi ý bắt chuyện và giải đáp thông tin du lịch Đà Nẵng.

---

## 🚀 Hướng dẫn chạy ứng dụng

### 1. Chạy trên điện thoại thật (iOS / Android qua Expo Go)
```bash
npx expo start
```
- Mở camera hoặc app **Expo Go** trên điện thoại và quét mã QR hiển thị trong terminal.

### 2. Chạy trên trình duyệt Web (Xem ngay trên máy tính)
```bash
npx expo start --web
```
- Trình duyệt sẽ mở ứng dụng tại `http://localhost:8081`.

### 3. Bộ chọn nhanh 28 màn hình (Quick Screen Switcher)
- Ở góc trên bên phải màn hình luôn có nút **"⚡ 28 Màn hình"**.
- Bấm vào nút này để mở bảng danh mục và nhảy ngay lập tức tới bất kỳ màn hình nào trong số 28 màn hình để kiểm tra giao diện.
