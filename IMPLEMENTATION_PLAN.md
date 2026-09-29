# KẾ HOẠCH TRIỂN KHAI VÀ CẢI TIẾN ỨNG DỤNG VIVU (IMPLEMENTATION PLAN)

Dựa trên các đặc tả hệ thống (SRS, UX, Matching, Home, Auth, Infrastructure), dưới đây là kế hoạch triển khai chi tiết cho ứng dụng Vivu, tuân thủ nguyên tắc "dữ liệu thật, người dùng thật" và đảm bảo trải nghiệm cốt lõi: "Tìm người đi cùng cho một hoạt động cụ thể".

## Trạng thái dự án hiện tại
* **Đánh giá ban đầu:** Đã đọc các tài liệu đặc tả chức năng (SRS, UX, v.v.). Đã có file `PROJECT_PLAN.md` mô tả tổng quan.
* **Mục tiêu tiếp theo:** Xây dựng nền tảng dữ liệu và API chuẩn trước khi tích hợp Frontend.

---

## 1. Danh sách chức năng và thứ tự phụ thuộc (Workstreams)

| Workstream | Phạm vi (Scope) | Phụ thuộc | Trạng thái |
|---|---|---|---|
| **W0: Audit & Plan** | Rà soát repo, tài liệu, xác định gap, tạo kế hoạch này. | Không | `Done` |
| **W1: Data Foundation** | Schema DB, migrations (PostgreSQL), quan hệ (User, Event, Profile, Chat, Auth), Constraints, RLS (nếu có). | W0 | `Done` |
| **W2: Auth & Profile API** | Đăng ký/đăng nhập, OTP thật, Session, Quản lý Profile, Privacy, Block/Friend. | W1 | `Done` |
| **W3: Matching API** | Khám phá kèo, Tạo kèo, Yêu cầu tham gia, Kiểm soát số chỗ (Capacity limits), Hủy/Đóng kèo. | W1, W2 | `Done` |
| **W4: Messaging API** | Chat 1-1, Chat nhóm kèo, Realtime (Socket.io), Kiểm tra quyền thành viên. | W1, W2, W3 | `Done` |
| **W5: Content & Feed API**| Bài đăng, Tương tác (Like, Cmt), Lưu nội dung, Tìm kiếm, Thông báo. | W1, W2, W3 | `Done` |
| **W6: App Shell & Auth UI**| Cấu trúc navigation, Design tokens, Luồng đăng nhập, Onboarding (tích hợp API thật). | W2 | `Done` |
| **W7: Matching UI** | Màn hình khám phá (List/Map), Chi tiết kèo, Tạo kèo, Quản lý yêu cầu tham gia. | W2, W3 | `In progress` |
| **W8: Messenger UI** | Danh sách chat, Màn hình chat nhóm/cá nhân, Cập nhật trạng thái realtime. | W4 | `Not started` |
| **W9: Home & Profile UI** | Bảng tin (Feed), Hồ sơ cá nhân, Tìm kiếm. | W2, W5 | `Not started` |
| **W10: Hardening** | Security (XSS, Injection, Auth), Hiệu năng, Recovery, Tích hợp End-to-End. | W1-W9 | `Not started` |

---

## 2. Chi tiết công việc từng giai đoạn (Phase Breakdowns)

### Giai đoạn 1: Cơ sở dữ liệu và Migrations (W1)
- **Mục tiêu:** Thiết kế CSDL chặt chẽ cho MVP. Không dùng dữ liệu giả (fake seed) trên môi trường thật.
- **Nhiệm vụ chính:**
  - [x] Thiết kế bảng `Users`, `Profiles`, `Sessions`.
  - [x] Thiết kế bảng `Events` (Kèo), `JoinRequests`, `Memberships` (đảm bảo atomic transaction khi duyệt thành viên).
  - [x] Thiết kế bảng `Conversations`, `Messages`.
  - [x] Thiết kế bảng `Posts`, `Comments`, `SavedItems`.
  - [x] Thiết lập Indexes, Unique Constraints (chống spam yêu cầu), Postgres Extensions (pgvector nếu cần AI).
- **Điều kiện hoàn thành:** Có ERD rõ ràng, chạy thử migration trên môi trường Dev thành công.

### Giai đoạn 2: Backend API Core (W2, W3, W4, W5)
- **Mục tiêu:** Cung cấp API vững chắc, validate chặt chẽ ở server-side, bảo mật.
- **Nhiệm vụ chính:**
  - [x] Tích hợp dịch vụ SMS/Email gửi OTP thật (Đã hoàn thiện Gateway API).
  - [x] Xây dựng luồng Auth (JWT/Session).
  - [x] Chức năng Profile (cập nhật thông tin, cài đặt quyền riêng tư, chặn người dùng).
  - [x] Logic Matching & Event: Khám phá kèo theo khu vực/thời gian, logic chống vượt số chỗ khi chủ kèo duyệt.
  - [x] Realtime Messaging: Setup Socket.io với Redis adapter, phân quyền phòng chat.
  - [ ] Tích hợp Upload Media (AWS S3/Cloudinary).
- **Điều kiện hoàn thành:** Các module chạy độc lập, pass Postman/Integration tests.

### Giai đoạn 3: Frontend Integration (W6, W7, W8, W9)
- **Mục tiêu:** Kết nối giao diện React Native với API thật. Thực thi đúng UX Guidelines (Tôn trọng quyền riêng tư, CTA rõ ràng).
- **Nhiệm vụ chính:**
  - [x] Xây dựng App Shell, Auth Flow (Xử lý loading/error state).
  - [x] Tích hợp màn hình Matching (Card chứa: hoạt động, giờ, chỗ, chủ kèo).
  - [x] Flow xin tham gia kèo -> chờ duyệt -> vào nhóm chat.
  - [x] Cập nhật UI Home Feed (nội dung thật từ API) và Profile có hiển thị Điểm Uy Tín.
- **Điều kiện hoàn thành:** 100% dữ liệu lấy từ API, xử lý tốt ngoại lệ (mất mạng, lỗi server, hết chỗ).

### Giai đoạn 4: Hoàn thiện & Đóng gói (W10)
- **Mục tiêu:** Đảm bảo tải, tính ổn định và chuẩn bị cho phát hành nội bộ.
- **Nhiệm vụ chính:**
  - [ ] Load Test API (đặc biệt là feed và map discovery).
  - [ ] Cấu hình Push Notifications thật.
  - [ ] Rà soát bảo mật (Mã hóa token, phân quyền dữ liệu vị trí).
  - [ ] Xây dựng ứng dụng (EAS Build).

---

## 3. Quyết định cần chốt (Pending Decisions)
1. **Dịch vụ SMS/OTP:** Chọn nhà cung cấp  Zalo cho môi trường dev/prod?
2. **Realtime Service:** Quản lý Socket.io cluster tự host hay dùng dịch vụ managed (Pusher, Firebase RTDB)?
3. **Môi trường Cloud:** Triển khai DB (PostgreSQL) và API trên hạ tầng nào (AWS, GCP, DigitalOcean)?

*(Tài liệu này sẽ được cập nhật liên tục khi tiến độ thay đổi)*
