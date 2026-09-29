# Vivu Authentication — Đặc tả Đăng ký và Đăng nhập

**Phiên bản:** 1.0 · **Trạng thái:** Đề xuất MVP

## 1. Mục tiêu

Cho phép người dùng tạo tài khoản, đăng nhập, khôi phục quyền truy cập và đăng xuất với quy trình ngắn, rõ lỗi và bảo vệ tài khoản. Tài khoản cần thiết để tạo kèo, gửi yêu cầu và nhắn tin; nội dung khám phá công khai có thể xem trước tùy chính sách sản phẩm.

## 2. Luồng đăng ký

1. Nhập email hoặc số điện thoại đã được sản phẩm chọn hỗ trợ.
2. Nhập mật khẩu hoặc chọn phương thức đăng nhập được triển khai.
3. Xác minh địa chỉ liên hệ bằng mã dùng một lần/link xác minh.
4. Đồng ý điều khoản và chính sách quyền riêng tư trước khi hoàn tất tạo tài khoản.
5. Tạo hồ sơ cơ bản: tên hiển thị, username và ngày sinh nếu chính sách độ tuổi yêu cầu.
6. Quyền vị trí, danh bạ, thông báo là tùy chọn và xin đúng lúc cần; không ép cấp quyền để đăng ký.

## 3. Luồng đăng nhập và khôi phục

- Đăng nhập bằng thông tin định danh và phương thức đã đăng ký.
- Có chức năng hiện/ẩn mật khẩu và quên mật khẩu.
- Khôi phục qua email/điện thoại đã xác minh; thông báo trả lời chung để tránh xác nhận tài khoản tồn tại.
- Link/mã đặt lại có thời hạn, dùng một lần; sau đặt lại có thể thu hồi phiên cũ theo chính sách.
- Đăng xuất khỏi thiết bị hiện tại; tùy chọn quản lý/đăng xuất các phiên khác.

## 4. Yêu cầu chức năng

| ID | Yêu cầu | Ưu tiên |
|---|---|---|
| AUTH-01 | Đăng ký tài khoản với thông tin định danh duy nhất và xác minh liên hệ. | P0 |
| AUTH-02 | Đăng nhập; lỗi không tiết lộ tài khoản/email có tồn tại hay không. | P0 |
| AUTH-03 | Kiểm tra chính sách mật khẩu phía client để hướng dẫn và phía server để thực thi. | P0 |
| AUTH-04 | Giới hạn thử đăng nhập/mã xác minh và áp dụng chống lạm dụng. | P0 |
| AUTH-05 | Quên mật khẩu và đặt lại qua kênh đã xác minh, token một lần có thời hạn. | P0 |
| AUTH-06 | Quản lý phiên, thu hồi token khi đăng xuất/đổi thông tin xác thực. | P0 |
| AUTH-07 | Thông báo khi có hoạt động đăng nhập bất thường theo năng lực hệ thống. | P1 |
| AUTH-08 | Hỗ trợ xác thực đa yếu tố nếu sản phẩm yêu cầu hoặc tài khoản có rủi ro cao. | P2 |
| AUTH-09 | Hiển thị điều khoản/chính sách và lưu phiên bản đồng ý, thời điểm đồng ý. | P0 |
| AUTH-10 | Không yêu cầu quyền vị trí, danh bạ, camera hoặc thông báo như điều kiện tạo tài khoản. | P0 |

## 5. Trạng thái và xử lý lỗi

| Tình huống | Hành vi |
|---|---|
| Thông tin sai | Thông báo ngắn, không tiết lộ tài khoản nào tồn tại |
| Mã hết hạn | Cho yêu cầu mã mới sau thời gian chờ và giới hạn gửi |
| Quá nhiều lần thử | Tạm giới hạn, cung cấp thời gian thử lại hoặc hỗ trợ |
| Email/điện thoại đã dùng | Hướng tới đăng nhập/khôi phục, không tạo tài khoản trùng |
| Mất kết nối | Giữ dữ liệu không nhạy cảm đang nhập; không lưu mật khẩu plaintext |
| Phiên hết hạn | Chuyển tới đăng nhập và giữ đích điều hướng an toàn |

## 6. Bảo mật và quyền riêng tư

- Không lưu mật khẩu dạng rõ; dùng dịch vụ xác thực hoặc hash chuyên dụng phía server.
- Cookie/token có cờ bảo mật phù hợp; access token ngắn hạn và refresh có thể thu hồi.
- Chống brute force, enumeration, replay mã và CSRF/XSS phù hợp kiến trúc.
- Không ghi mật khẩu, mã OTP, token hoặc dữ liệu nhạy cảm vào log/analytics.
- OAuth/đăng nhập bên thứ ba chỉ triển khai sau khi xác định nhà cung cấp và quyền dữ liệu.
- Tuân thủ quy định độ tuổi và luật áp dụng cần được xác nhận trước khi phát hành.

## 7. Tiêu chí nghiệm thu

- Tài khoản mới chỉ hoạt động sau các bước xác minh bắt buộc.
- Mã/link hết hạn hoặc đã dùng không thể tái sử dụng.
- Đăng xuất thu hồi phiên theo chính sách; token cũ không dùng lại được.
- Màn hình không phân biệt rõ email sai với email chưa đăng ký khi khôi phục.
- Người dùng có thể xem điều khoản và quyền riêng tư trước khi chấp thuận.

## 8. Chỉ số và phụ thuộc

Theo dõi tỷ lệ hoàn tất đăng ký, lỗi xác minh, thất bại đăng nhập, tỷ lệ khôi phục và tín hiệu lạm dụng. Phụ thuộc vào dịch vụ xác thực, email/SMS, quản lý phiên, chính sách pháp lý và hệ thống hỗ trợ.
