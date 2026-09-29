# Vivu Home — Đặc tả chức năng Trang chủ

**Phiên bản:** 1.0 · **Trạng thái:** Đề xuất MVP

## 1. Mục đích

Trang chủ là điểm vào hằng ngày của Vivu. Trang cần giúp người dùng nhanh chóng xem nội dung mới từ cộng đồng, nhận ra lời mời đi chơi phù hợp và đi đến hành động tiếp theo mà không biến thành một bảng điều khiển quá tải.

**Hành động trọng tâm:** xem nội dung cộng đồng và chuyển một cảm hứng thành kèo đi chơi.

## 2. Cấu trúc trang

1. **Thanh đầu trang:** logo Vivu, lời chào/ngày hiện tại, nút thông báo và tìm kiếm.
2. **Story hoặc hoạt động gần đây:** avatar bạn bè, trạng thái đã xem/chưa xem, nút thêm tin.
3. **Chuyển nguồn cấp:** Dành cho bạn, Đang theo dõi, Gần đây.
4. **Nguồn cấp:** bài viết, ảnh/video, tác giả, thời gian, khu vực, tương tác và CTA “Rủ đi cùng”.
5. **Khối khám phá kèo:** gợi ý kèo quanh bạn hoặc chủ đề đang quan tâm.
6. **Điều hướng chính:** Trang chủ, Đi cùng/Matching, Tạo, Messenger, Cá nhân.

## 3. Yêu cầu chức năng

| ID | Yêu cầu | Ưu tiên |
|---|---|---|
| HOME-01 | Tải nguồn cấp theo thứ tự cá nhân hóa có thể giải thích; có trạng thái tải, lỗi và làm mới. | P0 |
| HOME-02 | Chuyển giữa Dành cho bạn, Đang theo dõi và Gần đây; giữ tab trong phiên. | P0 |
| HOME-03 | Bài đăng hiển thị tác giả, thời gian, nội dung, media, khu vực tùy quyền riêng tư và số tương tác. | P0 |
| HOME-04 | Thích/bỏ thích, bình luận, lưu và chia sẻ nội bộ; cập nhật trạng thái ngay, hoàn nguyên nếu API lỗi. | P0 |
| HOME-05 | CTA “Rủ đi cùng” mở tạo kèo và có thể gắn tham chiếu tới bài/địa điểm. | P0 |
| HOME-06 | Khối “Kèo quanh bạn” mở Matching với bộ lọc theo khu vực hoặc chủ đề. | P1 |
| HOME-07 | Story có trạng thái chưa xem/đã xem; nội dung hết hạn không xuất hiện trong danh sách đang hoạt động. | P1 |
| HOME-08 | Nội dung bị ẩn, xóa hoặc từ tài khoản đã chặn không hiển thị. | P0 |

## 4. Quy tắc nguồn cấp

- Xếp hạng theo thời gian, quan hệ theo dõi, tương tác có ý nghĩa và liên quan tới hoạt động/khu vực người dùng chọn.
- Không sử dụng vị trí chính xác nếu người dùng chưa cấp quyền.
- Tải thêm theo phân trang; không tải toàn bộ nguồn cấp một lần.
- Nội dung quảng bá (nếu có trong tương lai) phải được nhận diện rõ, không trộn lẫn gây nhầm với bài tự nhiên.
- Các hành động thích/lưu phải có trạng thái đã chọn rõ ràng và hỗ trợ thao tác lại.

## 5. Trạng thái và ngoại lệ

| Tình huống | Hành vi |
|---|---|
| Người dùng mới | Hiển thị lời giải thích ngắn và bài/kèo gợi ý công khai; không để trang trống |
| Không có bài mới | Cho làm mới, xem tài khoản gợi ý hoặc khám phá kèo |
| Mất mạng | Giữ nội dung đã tải gần nhất và báo dữ liệu có thể cũ |
| Media lỗi | Dùng ảnh thay thế, giữ nội dung và hành động bài đăng |
| Thao tác tương tác lỗi | Khôi phục trạng thái trước đó và báo có thể thử lại |

## 6. Tiêu chí nghiệm thu

- Người dùng có thể chuyển tab nguồn cấp mà không mất vị trí trong phiên.
- “Rủ đi cùng” mở luồng tạo kèo; nếu bắt đầu từ bài/địa điểm thì dữ liệu liên quan được giữ lại.
- Thích, bình luận và lưu phản hồi trực quan, có trạng thái lỗi có thể phục hồi.
- Trang hỗ trợ màn hình nhỏ, vùng chạm đủ rộng, văn bản không bị media che.
- Người dùng hiểu được vì sao nội dung/kèo được đề xuất và có thể điều chỉnh khu vực hoặc sở thích.

## 7. Chỉ số

- Tỷ lệ người dùng mở Matching từ Trang chủ.
- Tỷ lệ bài có hành động có ý nghĩa (bình luận, lưu, rủ đi cùng), không chỉ lượt xem.
- Tỷ lệ quay lại nguồn cấp và tỷ lệ lỗi tải nội dung.
- Thời gian từ mở Trang chủ đến khi mở một kèo phù hợp.

## 8. Phụ thuộc

Đăng nhập, hồ sơ và quyền riêng tư, dịch vụ nguồn cấp, lưu media, tương tác/bình luận, thông báo, Matching và tạo kèo.
