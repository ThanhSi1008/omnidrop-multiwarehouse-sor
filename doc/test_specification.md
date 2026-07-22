# Tài liệu Đặc tả Kiểm thử Hệ thống (System Test Specification Document)

- **Dự án:** Hệ thống E-commerce Thương hiệu Omni tích hợp Flash Sale & Điều phối đa kho (Omnidrop Multiwarehouse SOR)
- **Phiên bản:** v1.2 (Cập nhật 100% Khách hàng Persistence & Full Test Suite Matrix)
- **Tác giả:** Kỹ sư Trưởng / QA Lead
- **Trạng thái:** Hoàn tất Ma trận Test Cases cho 100% Microservices & Visual Storefront

---

## I. Tổng quan & Chiến lược Kiểm thử (Test Strategy)

Tài liệu này quy định chiến lược kiểm thử toàn diện cho tất cả 4 microservices (`api-gateway`, `core-service`, `flash-sale-service`, `order-routing-service`) và ứng dụng `web-app` thuộc hệ thống Omnidrop Multiwarehouse SOR nhằm đảm bảo các chỉ số SLA:
1. **Tính sẵn sàng & Khả năng chịu tải:** Chịu tải $\ge 3.000$ RPS / $\ge 200.000$ OPM đồng thời mà không bị sập hay gián đoạn.
2. **Chống quá bán tuyệt đối (100% Anti-overselling Integrity):** Số lượng đơn đặt thành công trong DB cộng tồn kho Redis còn lại luôn bằng đúng số tồn kho mở bán ban đầu.
3. **Chính xác trong điều phối đa kho (Smart Order Routing - SOR):** Phân bổ kho theo vị trí địa lý của khách hàng (`KHO_HN` / `KHO_HCM`), tự động chuyển kho phụ hoặc tách đơn (Split Order) khi thiếu hàng.
4. **Bền vững giao dịch phân tán (Saga Choreography Pattern):** Hoàn thành trừ kho vật lý khi thanh toán thành công và nhả kho Redis khi hết hạn 5 phút chưa thanh toán.
5. **Lưu trữ Bền Vững Khách Hàng (`core.users`):** Lưu trữ tài khoản người mua hàng trực tiếp vào CSDL PostgreSQL.

---

## II. Các Loại hình Kiểm thử & Độ Bao phủ Services (Coverage Matrix)

```
                  ┌─────────────────────────────────┐
                  │   End-to-End (E2E) Testing      │  -> Total System Flow
                  ├─────────────────────────────────┤
                  │   Concurrency & Anti-Oversell   │  -> Redis Lua / Race Conditions
                  ├─────────────────────────────────┤
                  │   Integration (gRPC/RMQ/DB)     │  -> gRPC 50052, RabbitMQ, PostgreSQL
                  ├─────────────────────────────────┤
                  │   Boundary & Exception Testing  │  -> HTTP 400, 404, Bad Data
                  ├─────────────────────────────────┤
                  │   Unit Testing (Services/Utils) │  -> Helpers, Controllers, Handlers
                  └─────────────────────────────────┘
```

### Bản đồ Độ bao phủ Theo Microservices:
- **`api-gateway` (Port 3000):** Tested in `TC-GW-01`, `TC-GW-02`, `TC-BOUND-01`, `TC-CONC-01`, `TC-USER-01`.
- **`core-service` (Port 3001 & gRPC 50052):** Tested in `TC-CORE-01`, `TC-CORE-02`, `TC-USER-01`, `TC-USER-02`, `TC-INT-01`, `TC-INT-03`.
- **`flash-sale-service` (Port 3002):** Tested in `TC-UT-01`, `TC-UT-02`, `TC-UT-03`, `TC-FLASH-01`, `TC-FLASH-02`, `TC-INT-04`.
- **`order-routing-service` (Port 3003):** Tested in `TC-UT-04`, `TC-UT-05`, `TC-ORDER-01`, `TC-ORDER-02`, `TC-SOR-01`, `TC-SOR-02`, `TC-SOR-03`, `TC-INT-02`.

---

## III. Ma trận Test Cases Chi tiết (Detailed Test Case Matrix)

### 1. Cấp độ: Unit Testing (UT)

| Test Case ID | Tên Test Case | Thành phần Target | Dữ liệu Đầu vào | Kết quả Kỳ vọng |
| :--- | :--- | :--- | :--- | :--- |
| `TC-UT-01` | Lua Script: Đặt hàng thành công khi còn tồn kho | `flash-sale-service` (Redis Lua) | Stock = 5, User = `u1`, Qty = 1 | Trả về `1` (Thành công), Stock giảm xuống `4`, Key `user:limit` được thiết lập TTL 300s. |
| `TC-UT-02` | Lua Script: Từ chối khi người dùng mua quá giới hạn (User Limit) | `flash-sale-service` (Redis Lua) | User `u1` đã có key `user:limit` | Trả về `-1` (Limit Exceeded), Stock không bị trừ. |
| `TC-UT-03` | Lua Script: Từ chối khi hết tồn kho (Out of Stock) | `flash-sale-service` (Redis Lua) | Stock = 0, User = `u2`, Qty = 1 | Trả về `-2` (Out of Stock), Stock không âm. |
| `TC-UT-04` | Phân vùng Địa lý Kho Ưu tiên Miền Bắc (Geographic Mapping) | `order-routing-service` (SOR Helper) | Province = "Hanoi" / "Hai Phong" | Trả về `primary = KHO_HN`, `secondary = KHO_HCM`. |
| `TC-UT-05` | Phân vùng Địa lý Kho Ưu tiên Miền Nam | `order-routing-service` (SOR Helper) | Province = "HCM" / "Can Tho" | Trả về `primary = KHO_HCM`, `secondary = KHO_HN`. |

---

### 2. Cấp độ: Integration Testing (INT) & User Persistence (USER)

| Test Case ID | Tên Test Case | Thành phần Target | Dữ liệu Đầu vào | Kết quả Kỳ vọng |
| :--- | :--- | :--- | :--- | :--- |
| `TC-USER-01` | Đăng ký tài khoản khách hàng lưu CSDL PostgreSQL | `api-gateway` &rarr; `core-service` | Body: `{ fullName, email, phone }` | Lưu bản ghi mới vào PostgreSQL `core.users`, trả về UUID và 100 điểm thưởng. |
| `TC-USER-02` | Đăng nhập tài khoản & Tải lại thông tin | `api-gateway` &rarr; `core-service` | Body: `{ email }` | Tìm kiếm bản ghi trong PostgreSQL `core.users`, trả về profile khách hàng. |
| `TC-INT-01` | Truy vấn gRPC Stock Check (`GetSkuStock`) | `order-routing-service` &rarr; `core-service` | SKU = `KINH-X-DEN-SIZE-M` | gRPC Client nhận mảng `stocks` chứa `quantity`, `reservedQuantity` và `price`. |
| `TC-INT-02` | Bắn và Tiêu thụ Event `order.created` qua RabbitMQ | `flash-sale-service` &rarr; RabbitMQ &rarr; `order-routing-service` | Event Payload hợp lệ | Message tới queue `order_created_queue`, `order-routing-service` tạo bản ghi Order. |
| `TC-INT-03` | Bắn và Tiêu thụ Event Saga `order.paid` | `order-routing-service` &rarr; RabbitMQ &rarr; `core-service` | Event `order.paid` | `core-service` trừ số lượng tồn kho vật lý và giải phóng `reservedQuantity` trong DB. |
| `TC-INT-04` | Bắn và Tiêu thụ Event Saga `order.timeout` | `order-routing-service` &rarr; RabbitMQ &rarr; `flash-sale-service` | Event `order.timeout` | `flash-sale-service` dùng Redis `INCRBY` nhả kho và xóa key `user:limit`. |

---

### 3. Cấp độ: Microservice API & Business Service Tests

| Test Case ID | Tên Test Case | Service | Endpoint / Action | Kết quả Kỳ vọng |
| :--- | :--- | :--- | :--- | :--- |
| `TC-GW-01` | API Gateway Health Check | `api-gateway` | `GET /` | Trả về HTTP 200: "Omnidrop Multiwarehouse SOR API Gateway is running." |
| `TC-GW-02` | Proxy Header `X-Trace-Id` Propagation | `api-gateway` | Request có `x-trace-id` | Trả về Header `X-Trace-Id` đồng bộ trên response và log. |
| `TC-CORE-01` | Lấy danh sách sản phẩm & Tồn kho đa kho | `core-service` | `GET /products` | Trả về mảng biến thể thời trang kèm tồn kho `KHO_HN` & `KHO_HCM`. |
| `TC-CORE-02` | Xử lý An toàn Event `order.paid` khi SKU giả | `core-service` | Event `order.paid` SKU giả | Log error thông báo không tìm thấy SKU, không văng ngoại lệ làm crash. |
| `TC-FLASH-01` | Lấy số lượng tồn kho Flash Sale Redis | `flash-sale-service` | `GET /purchase/stock` | Trả về JSON `{ sku, stock, timestamp }`. |
| `TC-FLASH-02` | Cấu hình Redis Campaign Stock bởi Admin | `flash-sale-service` | `POST /purchase/admin/campaign` | Cập nhật số lượng stock trên Redis và xóa sạch toàn bộ khóa `user:limit:*`. |
| `TC-ORDER-01` | Lấy danh sách Đơn hàng & Fulfillments | `order-routing-service` | `GET /orders` | Trả về mảng danh sách đơn hàng đã xếp theo thời gian tạo mới nhất. |
| `TC-ORDER-02` | Chống Thanh toán trùng lặp cho Đơn hàng đã PAID | `order-routing-service` | `POST /orders/:id/pay` (Lần 2) | Trả về thông báo: `Order status is PAID, cannot pay.` |

---

### 4. Cấp độ: End-to-End (E2E) Flow Testing & SOR Routing Matrix

| Test Case ID | Tên Test Case | Luồng Thao tác | Đơn vị Xác minh | Kết quả Kỳ vọng |
| :--- | :--- | :--- | :--- | :--- |
| `TC-E2E-01` | Mua hàng & Thanh toán thành công (Happy Path) | 1. `POST /purchase`<br>2. Chờ SOR routing<br>3. `POST /orders/:id/pay` | PostgreSQL `order` & `core` tables | - Order `PAID`<br>- Fulfillment được gán kho `KHO_HN`<br>- Physical Stock `KHO_HN` giảm 1 đơn vị. |
| `TC-E2E-02` | Mua hàng Quá hạn & Hủy đơn tự động (Timeout Rollback) | 1. `POST /purchase`<br>2. Cập nhật created_at quá 5p<br>3. Chạy Timeout Scanner | PostgreSQL order status, Redis campaign stock | - Order `CANCELLED`<br>- Tồn kho Redis được hoàn trả +1<br>- Key giới hạn mua user bị xóa. |
| `TC-SOR-01` | SOR Điều phối Kho Ưu tiên (Primary Warehouse) | Đặt hàng địa chỉ Hà Nội khi Kho Hà Nội còn đủ hàng | PostgreSQL `fulfillments` table | Gán 1 Fulfillment xuất từ `KHO_HN`. |
| `TC-SOR-02` | SOR Chuyển hướng Kho Phụ (Secondary Warehouse Fallback) | Đặt hàng địa chỉ Hà Nội khi Kho Hà Nội hết hàng nhưng Kho HCM còn | PostgreSQL `fulfillments` table | Gán 1 Fulfillment xuất từ `KHO_HCM`. |
| `TC-SOR-03` | SOR Tách đơn Tự động (Split Order Execution) | Đặt hàng nhiều sản phẩm mà không kho nào ôm trọn giỏ hàng | PostgreSQL `fulfillments` table | Tạo 2 bản ghi Fulfillment độc lập (1 từ `KHO_HN`, 1 từ `KHO_HCM`). |

---

### 5. Cấp độ: Concurrency & Anti-Oversell Testing (CONC)

| Test Case ID | Tên Test Case | Điêu kiện Tải | Chỉ số Kiểm tra | Kết quả Kỳ vọng |
| :--- | :--- | :--- | :--- | :--- |
| `TC-CONC-01` | Đua tải Flash Sale 2.000 Requests Burst | 2.000 requests đồng thời, Stock = 50 | Redis & PostgreSQL order count | - Đúng 50 requests nhận HTTP 200/201<br>- 1.950 requests bị chặn HTTP 400 Out of Stock<br>- 0% overselling ($Orders_{DB} = 50$). |
| `TC-CONC-02` | Đua mua trùng lặp của 1 User (Single User Spurt) | 50 requests song song từ cùng 1 `userId` | Redis `user:limit` & DB orders | - Chỉ 1 request đầu tiên thành công<br>- 49 requests còn lại nhận lỗi `User purchase limit exceeded`. |

---

## IV. Danh mục Files Code Auto Test (`tests/`)

Toàn bộ code test tự động được tổ chức chặt chẽ trong thư mục `tests/`:
1. `tests/unit/sor-mapping.spec.js`: Test unit cho thuật toán phân vùng địa lý SOR (`TC-UT-04`, `TC-UT-05`).
2. `tests/unit/redis-lua.spec.js`: Test unit cho Atomic Redis Lua script (`TC-UT-01`, `TC-UT-02`, `TC-UT-03`).
3. `tests/unit/services-endpoints.spec.js`: Test unit & integration cho các API Endpoints của microservices.
4. `tests/integration/grpc-contract.spec.js`: Test tích hợp gRPC GetSkuStock (`TC-INT-01`).
5. `tests/boundary/exceptions.spec.js`: Test biên & ngoại lệ dữ liệu (`TC-BOUND-01`, `TC-BOUND-02`, `TC-BOUND-03`, `TC-BOUND-04`).
6. `scripts/load_test.js`: Test đua tải song song 2.000 requests (`TC-CONC-01`, `TC-CONC-02`).
7. `scripts/verify_integrity.js`: Test kiểm toán toàn vẹn dữ liệu & chống quá bán.
8. `tests/run_all_tests.js`: Master test runner chạy 100% bộ test và đối soát kết quả (`npm run test:all`).
