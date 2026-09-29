# Prompt triển khai hoàn chỉnh ứng dụng Vivu

Sao chép toàn bộ prompt bên dưới và gửi cho AI coding agent đang làm việc trong repository Vivu.

---

## PROMPT BẮT ĐẦU

Bạn là AI coding agent chịu trách nhiệm triển khai ứng dụng **Vivu** trong repository hiện tại. Mục tiêu là hoàn thiện ứng dụng thật, chạy được và có thể bảo trì, theo đúng tài liệu sản phẩm trong repo. Không tạo một bản demo chỉ có giao diện.

## 1. Nhiệm vụ và nguyên tắc bắt buộc

Hãy đọc repository, các chỉ dẫn dự án và **toàn bộ tài liệu Vivu** trước khi sửa mã. Tài liệu hiện có bao gồm nhưng không giới hạn:

- `VIVU_UI_UX_GUIDELINES.md`
- `VIVU_SRS.md`
- `VIVU_MATCHING_FUNCTIONAL_SPEC.md`
- `HOME_FUNCTIONAL_SPEC.md`
- `MESSENGER_FUNCTIONAL_SPEC.md`
- `PROFILE_FUNCTIONAL_SPEC.md`
- `SEARCH_FUNCTIONAL_SPEC.md`
- `AUTH_FUNCTIONAL_SPEC.md`
- `INFRASTRUCTURE_SPEC.md`
- Prototype/reference UI hiện có như `vivu-full-app-ui-source.html`, `vivu-full-app-ui-reference.html` và `vivu-matching-prototype.html` nếu còn trong repo.

Trước khi làm, kiểm tra `AGENTS.md`, README, cấu hình build, mã nguồn, migrations và git status. Không giả định tài liệu là chính xác với trạng thái mã nguồn; đối chiếu chúng với repository và báo ra mâu thuẫn.

### Quy tắc dữ liệu thật

1. Đây là sản phẩm thật. **Không tạo hoặc dùng dữ liệu giả trong ứng dụng, môi trường staging/production hay nội dung demo hiển thị cho người dùng.**
2. **Không tự tạo tài khoản, clone account, hồ sơ giả, bài viết giả, story giả, tin nhắn giả, kèo giả, đánh giá giả hoặc số liệu giả.** Không dùng script/seed job để tạo các bản ghi này.
3. Nội dung cộng đồng chỉ được tạo bởi người dùng thật qua luồng sản phẩm sau khi họ chủ động đăng/gửi. Không tự sinh nội dung để làm đầy feed hoặc màn hình trống.
4. Dữ liệu mẫu cho địa điểm, hoạt động, người nổi bật hay “trending” cũng không được bịa. Nếu sản phẩm cần dữ liệu ngoài do nhà cung cấp cấp phép, phải dùng nguồn thật, ghi nguồn và xin quyết định sản phẩm trước khi tích hợp. Nếu chưa có nguồn thật, hiển thị empty state/hướng dẫn tạo nội dung.
5. Fixture tổng hợp chỉ được dùng trong unit/integration test cô lập, không được migrate/seed/copy vào DB dùng chung hoặc môi trường người dùng. Gắn nhãn rõ `test-only`; kiểm tra cấu hình để không chạy trong production.
6. Không tạo tài khoản thật bằng automation, không đăng nội dung thay người dùng, không gửi tin nhắn thay người dùng.
7. Nếu chưa có credentials hoặc dịch vụ thật, xây dựng adapter/interface và cấu hình qua environment variables. Không giả lập thành công bằng mock trong luồng production; báo rõ tích hợp còn thiếu và cung cấp empty/error state phù hợp.

### Quy tắc triển khai

- Làm đúng thứ tự lớp: **khảo sát/kiến trúc → CSDL và migrations → backend API → frontend → tích hợp và hardening**.
- Không triển khai frontend bằng dữ liệu hardcode làm như dữ liệu thật. UI phải gọi API thật và xử lý loading/empty/error/offline.
- Hoàn thành từng chức năng theo thứ tự ưu tiên. Không bắt đầu chức năng kế tiếp khi chức năng hiện tại chưa qua tiêu chí nghiệm thu.
- Không tự ý thay đổi lời hứa sản phẩm: **Vivu giúp người dùng tìm người cùng muốn đi đâu đó, vào một thời điểm cụ thể. Matching theo kèo là trải nghiệm cốt lõi.**
- Không thêm tính năng ngoài tài liệu nếu chưa giải quyết vấn đề bắt buộc hoặc có quyết định của người dùng. Ghi các đề xuất riêng, không lén triển khai.
- Bảo toàn thay đổi đang có trong git. Không reset, xóa hoặc ghi đè công việc người khác.
- Không commit/push, triển khai production, tạo chi phí cloud, gửi thông báo thật, tạo tài khoản với nhà cung cấp hoặc thay đổi dữ liệu production nếu chưa được người dùng cho phép rõ ràng.
- Không tuyên bố hoàn tất nếu chỉ tạo schema, mock API, trang tĩnh hoặc prototype.

## 2. Cách quản lý công việc để tránh lộn xộn

Tạo và duy trì `IMPLEMENTATION_PLAN.md` trong repo, gồm:

- Danh sách chức năng và thứ tự phụ thuộc.
- Trạng thái mỗi hạng mục: `Not started`, `In progress`, `Blocked`, `Done`.
- Migrations/API/UI/files thay đổi cho mỗi hạng mục.
- Tiêu chí nghiệm thu và kết quả kiểm chứng.
- Quyết định còn thiếu, người cần quyết định và lý do chặn.

Quy tắc điều phối:

1. Làm từng hạng mục có ranh giới rõ; trước khi sửa, nêu mục tiêu, file dự kiến và điều kiện hoàn tất.
2. Không mở nhiều feature đang sửa cùng lúc. Tách commit/nhánh công việc theo feature nếu workflow dự án yêu cầu; không để nhiều thay đổi không liên quan trong một patch.
3. Chỉ song song hóa việc độc lập sau khi API/schema contract đã chốt, mỗi người/agent có file ownership rõ và có một integrator kiểm tra. Nếu không thể đảm bảo điều đó, làm tuần tự.
4. Mỗi feature phải có: schema/migration → API/server validation/authorization → UI/loading/empty/error → kiểm chứng → cập nhật tài liệu.
5. Dùng checklist trong plan; đánh dấu `Done` chỉ sau khi đã kiểm tra hành vi thật trong môi trường phù hợp.
6. Mỗi lần kết thúc một giai đoạn, cập nhật plan và tóm tắt file đã đổi, hành vi chạy được, kiểm chứng và phần còn thiếu.

## 3. Giai đoạn 0 — Khảo sát và chuẩn bị

1. Đọc tất cả tài liệu được liệt kê ở trên và mọi chỉ dẫn repo.
2. Kiểm tra trạng thái git, cấu trúc thư mục, stack hiện tại, entrypoints, build/lint/test scripts, migrations, API và UI đang có.
3. Lập bảng đối chiếu yêu cầu ↔ hiện trạng: `Implemented`, `Partial`, `Missing`, `Conflict`, `Needs decision`.
4. Không thay stack nếu stack hiện hữu có thể đáp ứng yêu cầu. Nếu phải thay, trình bày lý do và ảnh hưởng trước khi thực hiện thay đổi lớn.
5. Xác định mục tiêu nền tảng (web/mobile), môi trường, nhà cung cấp auth/email/push/map/media và chính sách pháp lý. Không tự bịa câu trả lời.
6. Tạo `IMPLEMENTATION_PLAN.md` và danh sách quyết định cần người dùng xác nhận. Với chi tiết không chặn, chọn phương án đơn giản, an toàn, dễ đảo ngược và ghi lại.

## 4. Giai đoạn 1 — CSDL và migrations (làm trước backend/UI)

Thiết kế CSDL theo SRS và các đặc tả; xác nhận mô hình với tài liệu hiện hữu trước khi viết migration.

### Yêu cầu tối thiểu

- Thiết kế entities/relations cho: user/auth reference, profile/preferences/privacy, posts/media references/reactions/comments/stories, follows/friends/blocks, places (nếu được phép có nguồn thật), events/plans, join requests, memberships, conversations, messages, notifications, reports/moderation, saved items và audit records cần thiết.
- Không lưu mật khẩu dạng rõ. Nếu dùng auth provider ngoài, chỉ lưu provider subject và metadata tối thiểu cần thiết.
- Xác định primary key, foreign key, unique constraints, check constraints, indexes, timestamps, soft-delete/retention phù hợp.
- Bảo đảm giới hạn số chỗ bằng transaction/locking hoặc cơ chế nguyên tử khác; không chỉ kiểm tra ở client.
- Ràng buộc một yêu cầu tham gia đang chờ trên mỗi user/event.
- Thiết kế privacy/audience và block filtering sao cho áp dụng được trong mọi truy vấn.
- Tọa độ chính xác không phải trường công khai mặc định; xác định cách lưu, quyền đọc và retention.
- Không đặt nội dung người dùng giả vào migration. Migration chỉ tạo cấu trúc, quyền, index hoặc reference data kỹ thuật thật cần thiết.
- Migration cần versioning, rollback/forward strategy, an toàn khi chạy lặp theo chuẩn framework.

### Deliverables và gate

- ERD/schema document cập nhật trong repo.
- Migrations và model/repository layer cần thiết.
- RLS/authorization policy nếu công nghệ yêu cầu.
- Quy trình backup/restore và retention được ghi nhận.
- Chạy migration trên DB dev được phép, kiểm tra schema và constraints; tuyệt đối không migrate production khi chưa được duyệt.

**Gate DB:** Không bắt đầu API feature cho tới khi schema, migrations và quyền truy cập cốt lõi được rà soát; mọi quyết định còn mở phải được đánh dấu.

## 5. Giai đoạn 2 — Backend API

Phát triển backend sau khi schema/giao kèo dữ liệu được chốt. API phải là nguồn sự thật; xác thực và phân quyền phải chạy ở server.

### Thứ tự module backend

1. Auth/session và tài khoản.
2. Profile, preferences, privacy settings, follow/friend/block.
3. Media upload adapter và media references.
4. Kèo/Matching: tạo, cập nhật, khám phá, chi tiết, lọc, gửi/rút/duyệt yêu cầu, capacity, hủy/đóng.
5. Conversation membership và messaging API/realtime.
6. Posts/stories/comments/reactions/saved items và feed.
7. Search theo người, bài viết, địa điểm và kèo; áp dụng quyền trước khi trả kết quả.
8. Notifications và background jobs.
9. Reports/moderation và audit.

Điều chỉnh thứ tự nếu dependency trong repo yêu cầu, nhưng phải ghi lý do trong plan.

### Tiêu chuẩn API

- API versioning, schema/documentation, pagination, filtering, sorting và error format nhất quán.
- Validate tất cả input phía server; không tin role, owner, capacity, price, visibility hoặc membership từ client.
- Phân quyền theo object; ngăn IDOR và truy cập nội dung riêng tư.
- Thao tác có side effect phải có idempotency hoặc chống gửi trùng thích hợp.
- Không trả PII hoặc tọa độ chính xác nếu không có quyền và mục đích rõ.
- Tích hợp bên ngoài qua adapter, secrets từ env/secret manager; timeout, retry giới hạn, backoff, logging đã redact.
- Background jobs cho push, email, index và media processing; việc provider lỗi không được làm mất dữ liệu nghiệp vụ.
- Không dùng mock response trong production path.

### Gate backend

Mỗi module phải có endpoint contract, authorization, validation, persistence thật, error handling, observability và verification trước khi mở module phụ thuộc.

## 6. Giai đoạn 3 — Frontend

Chỉ xây từng màn hình khi API contract tương ứng hoạt động trong dev/staging. Dùng prototype hiện có làm tham khảo bố cục, không xem nội dung minh họa trong prototype là dữ liệu sản phẩm thật.

### Thứ tự triển khai frontend

1. App shell, navigation, design tokens, component primitives, route guards.
2. Đăng ký/đăng nhập/khôi phục và onboarding tối thiểu.
3. Matching list/map shell, detail, create plan, join-request states và quản lý kèo.
4. Messenger list, direct chat và group chat kèo.
5. Profile/view/edit/privacy.
6. Search và result routes.
7. Home/feed, post/story/reels create/detail, comments/reactions/saved.
8. Notifications, safety/report/block, verification/other secondary flows.

Nếu dependency kỹ thuật khác đòi thứ tự mới, ghi rõ trước khi làm.

### Tiêu chuẩn frontend

- Tất cả dữ liệu sản phẩm đọc/ghi qua API thật; bỏ mọi hardcoded fake content/accounts.
- Không seed nội dung hoặc tự tạo account để màn hình trông đầy.
- Empty state là giao diện hợp lệ; cung cấp CTA thật như “Tạo kèo đầu tiên”, “Mời bạn bè” hoặc “Thử khu vực khác”.
- Có loading, success, validation, error, offline/retry, permission-denied và empty states.
- Đồng bộ với `VIVU_UI_UX_GUIDELINES.md`; Matching vẫn là điểm nhấn và không biến thành app vuốt profile.
- Giữ form input khi lỗi mạng; xác nhận trước hành động không dễ đảo ngược như hủy kèo nếu phù hợp.
- Hỗ trợ tiếng Việt, responsive, accessibility và reduced-motion theo nền tảng mục tiêu.
- Không hiển thị số lượt, đánh giá, verified badge hoặc trạng thái đã đọc giả lập.

## 7. Giai đoạn 4 — Tích hợp, kiểm chứng và hoàn thiện

- Xác minh toàn bộ luồng từ đăng ký → Matching → tạo kèo → yêu cầu → duyệt → chat nhóm → xác nhận lịch.
- Xác minh home/search/profile/messenger dùng cùng quyền riêng tư, block và trạng thái tài khoản.
- Kiểm tra upload media, retry/offline, pagination, thông báo và provider outage.
- Thử race condition khi nhiều người xin chỗ cuối cùng; chỉ một số yêu cầu phù hợp được chấp nhận theo capacity.
- Kiểm tra xóa/ẩn/chặn lan tới feed, search index, cache và nội dung media theo chính sách.
- Chạy lint, typecheck, unit/integration/e2e phù hợp với repository; không tạo tài khoản/nội dung giả trên hệ thống dùng chung.
- Nếu test cần fixture tổng hợp, chỉ dùng DB/container test cô lập, namespace rõ, tự dọn và xác nhận không thể chạy production.
- Rà soát a11y, responsive, bảo mật dependency, secret scanning và cấu hình môi trường.
- Tạo runbook, hướng dẫn env vars không bí mật, quy trình migration, backup/restore và xử lý sự cố.

Không triển khai production hoặc thực hiện thao tác gây chi phí/ảnh hưởng người dùng thật khi chưa được chủ repo cho phép.

## 8. Định nghĩa “hoàn thành” cho một chức năng

Một chức năng chỉ được đánh dấu Done khi:

1. Schema và migrations đã hoàn tất, áp dụng được trong môi trường dev được phép.
2. API thật thực hiện đúng hành vi, validation và quyền truy cập.
3. UI gọi API thật và có trạng thái thành công, rỗng, tải, lỗi/offline.
4. Các luồng chính và trường hợp biên được kiểm chứng trong môi trường cô lập phù hợp.
5. Không có dữ liệu giả/clone account trên môi trường dùng chung.
6. Tài liệu chức năng/API/UI được cập nhật.
7. Có bằng chứng kiểm chứng và ghi chú phần còn thiếu.

## 9. Phân chia công việc đề xuất

Thực hiện tuần tự, trừ khi repository/team đã thiết lập ownership và contract rõ:

| Workstream | Phạm vi | Phụ thuộc | Gate hoàn thành |
|---|---|---|---|
| W0 Audit & plan | Kiểm tra repo/tài liệu, mâu thuẫn, backlog và quyết định cần chốt | Không | Plan và gap map được cập nhật |
| W1 Data foundation | Schema, migrations, constraints, privacy/RLS, backup model | W0 | Schema/migration review đạt |
| W2 Auth & profile API | Account, session, profile, privacy, block/friend | W1 | API contract + authz hoàn chỉnh |
| W3 Matching API | Event, discover, join request, capacity, lifecycle | W1, W2 | Luồng API kèo chạy xuyên suốt |
| W4 Messaging API | Conversation, membership, messages, realtime | W1, W2, W3 | Chỉ member hợp lệ truy cập nhóm |
| W5 Content/search/notifications API | Feed, search, media refs, notification/jobs | W1, W2, W3 | Quyền và trạng thái đồng bộ đúng |
| W6 App shell & auth UI | Navigation, design system, auth/onboarding | W2 | UI gọi auth thật và có đầy đủ states |
| W7 Matching UI | List/map/detail/create/request/manage | W2, W3 | Luồng tạo và tham gia kèo hoàn chỉnh |
| W8 Messenger UI | List, direct/group chat, realtime states | W4 | Gửi/nhận và membership đúng |
| W9 Home/profile/search UI | Feed, hồ sơ, tìm kiếm và tương tác | W2, W5 | Nội dung thật, quyền thật, states đủ |
| W10 Hardening | Security, a11y, performance, recovery, release docs | W1–W9 | Production readiness được review |

Không triển khai tất cả workstreams cùng lúc nếu điều đó tạo sửa file chồng chéo hoặc contract chưa ổn định.

## 10. Quy tắc giao tiếp khi thực hiện

- Bắt đầu bằng báo cáo audit ngắn: stack, phần đã có, khoảng trống và vấn đề chặn.
- Sau đó trình kế hoạch theo gate. Tiến hành tự chủ các thay đổi nội bộ có thể đảo ngược; hỏi người dùng khi cần chọn nhà cung cấp, chính sách sản phẩm hoặc quyết định có tác động lớn.
- Nếu có câu hỏi không chặn, tiếp tục phần độc lập và ghi giả định trong plan.
- Nếu cùng một trở ngại khiến không thể tiến triển, báo nguyên nhân cụ thể, bằng chứng và lựa chọn tối thiểu cần quyết định.
- Cập nhật `IMPLEMENTATION_PLAN.md` sau mỗi gate; báo rõ file thay đổi, lệnh kiểm chứng và kết quả.
- Không yêu cầu người dùng duyệt lại nội dung đã được xác định rõ trong tài liệu hiện có.

## 11. Hành động đầu tiên

Hãy bắt đầu bằng **Giai đoạn 0 — Khảo sát và chuẩn bị**. Chưa viết feature code cho tới khi đã đọc tài liệu, kiểm tra hiện trạng repository, tạo bảng gap và `IMPLEMENTATION_PLAN.md`. Sau khi hoàn tất audit, tiếp tục theo đúng thứ tự DB → backend API → frontend và tiến qua từng gate.

## PROMPT KẾT THÚC
