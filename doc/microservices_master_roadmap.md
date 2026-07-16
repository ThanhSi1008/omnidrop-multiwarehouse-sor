# Bản đồ lộ trình phát triển hệ thống Microservices Omni (End-to-End)

- **Dự án:** Hệ thống E-commerce Omni đa kho tích hợp Flash Sale Engine Chịu Tải Cao
- **Vai trò:** Kỹ sư trưởng (Lead Full-stack Developer / System Architect)
- **Mục tiêu:** Chống sập hệ thống khi giật tải, chống bán quá số lượng kho (*Anti-overselling*), điều phối kho vận thông minh (*Smart Order Routing*) và tối ưu hóa trải nghiệm người dùng Omni dưới 2 giây.

---

## 🗺️ Tổng quan kiến trúc hệ thống Omni (3 Services chiến lược)

Để đảm bảo trải nghiệm thực chiến Microservices chuẩn chỉ nhưng không làm cồng kềnh hạ tầng vận hành giai đoạn đầu, hệ thống Omni được phân rã thành 3 dịch vụ độc lập kết nối qua một Gateway duy nhất:

```text
                  ┌────────────────────────┐
                  │   Khách hàng & Admin   │
                  └───────────┬────────────┘
                              │ HTTPS (REST API / SSE / WebSockets)
                              ▼
                  ┌────────────────────────┐
                  │      API GATEWAY       │
                  └────┬──────────────┬────┘
                       │              │
         /products     │              │ /purchase (Flash Sale)
                       ▼              ▼
           ┌──────────────┐        ┌──────────────┐
           │ Core Service │        │  Flash Sale  │
           │ (CRUD - DB)  │        │ Engine (RAM) │
           └──────┬───────┘        └──────┬───────┘
                  │                       │
                  │ PostgreSQL            │ Redis (Lua Script)
                  ▼                       ▼
           ┌──────────────┐        ┌──────────────┐
           │  PostgreSQL  │        │  RabbitMQ    │◄─── (Message Queue)
           │   Database   │        └──────┬───────┘
           └──────────────┘               │
                                          │ Event: order.created
                                          ▼
                                   ┌──────────────┐
                                   │   Order &    │
                                   │Routing Serv. │
                                   └──────────────┘
```

- **API Gateway (Cửa ngõ Omni):** Điểm tiếp nhận request duy nhất. Xử lý định tuyến proxy, xác thực người dùng (*Authentication*) và giới hạn tần suất gọi (*Rate Limiting*).
- **Core Service (Dịch vụ Tải thường):** Quản lý sản phẩm, danh mục, cấu hình combo (*Bundles*), tài khoản và giỏ hàng thông thường. Sử dụng PostgreSQL làm Database lưu trữ chính.
- **Flash Sale Engine (Dịch vụ Chịu tải cao):** Chuyên trách xử lý kiểm tra tồn kho và giữ chỗ (*Hold*). Chỉ làm việc trực tiếp trên bộ nhớ RAM với Redis (chạy Lua Script) để đạt tốc độ phản hồi cực hạn.
- **Order & Routing Service (Dịch vụ Logic Nghiệp vụ):** Tiêu thụ (*consume*) tin nhắn đơn hàng từ hàng đợi RabbitMQ, thực hiện thuật toán điều phối thông minh (*Smart Order Routing*) chia kho HN/HCM, tách đơn và lưu đơn vào PostgreSQL.

---

## 📅 Lộ trình triển khai 6 giai đoạn chi tiết

### Giai đoạn 1: Khởi động & thiết lập hạ tầng (Infrastructure & DevOps)

**Mục tiêu:** Dựng "khung xương" để các dịch vụ Omni có thể khởi chạy và giao tiếp mượt mà với nhau dưới môi trường local.

- [x] **Thiết lập Monorepo:** Cấu trúc thư mục chứa mã nguồn của cả API Gateway và 3 Dịch vụ trong cùng một kho lưu trữ (Repository) để dễ dàng chia sẻ TypeScript Interfaces, DTOs và cấu hình chung.
- [x] **Soạn thảo Docker Compose (`docker-compose.yml`):** Định nghĩa cấu hình các hạ tầng dùng chung cho hệ thống Omni:
  - **PostgreSQL:** Lưu trữ dữ liệu quan hệ có tính toàn vẹn ACID cao.
  - **Redis:** Lưu cache và quản lý atomic counter, TTL cho cơ chế Hold kho Flash Sale.
  - **RabbitMQ:** Điều hòa tải đơn hàng, chống nghẽn nghẹt cổ chai tại Database.
  - **Jaeger / Zipkin:** Hỗ trợ Distributed Tracing (truy vết request phân tán).
- [x] **Setup API Gateway:** Khởi tạo dịch vụ Gateway bằng NestJS làm nhiệm vụ định tuyến proxy đến các dịch vụ Core và Flash Sale tương ứng.

### Giai đoạn 2: Thiết kế cơ sở dữ liệu & tạo phôi dịch vụ (Scaffolding)

**Mục tiêu:** Mô hình hóa các yêu cầu của thương hiệu Omni vào cấu trúc bảng vật lý và sẵn sàng các khung API.

- [x] **Thiết kế Database Schema (PostgreSQL):**
  - Thiết kế bảng sản phẩm `products` và biến thể `product_variants` (SKUs).
  - Thiết kế bảng kho hàng `warehouses` (`KHO_HN`, `KHO_HCM`) và bảng cầu nối quản lý tồn kho `inventory` (chứa `reserved_quantity` để giữ chỗ).
  - Thiết kế bảng định nghĩa Combo `bundles` và bảng thành phần lẻ cấu thành `bundle_items`.
- [x] **Quy hoạch Key-value trên Redis:**
  - Định nghĩa cấu trúc lưu trữ tồn kho Flash Sale tạm thời (ví dụ: `inventory:flash_sale:{sku}`).
  - Thiết lập cơ chế kiểm soát lượt mua của người dùng (ví dụ: `user:limit:{campaign_id}:{user_id}`).
- [x] **Tạo phôi dự án (Scaffolding):** Khởi tạo dự án NestJS trống cho từng service, cấu hình kết nối Database và Redis tương ứng.

### Giai đoạn 3: Phát triển Core Backend & giao tiếp phân tán (Distributed Core)

**Mục tiêu:** Giải quyết các bài toán kỹ thuật cốt lõi: Chống sập bằng Queue, Chống quá bán bằng Lua Script và Điều phối đa kho thông minh.

- [ ] **Cấu hình gRPC (Đồng bộ):** Thiết lập client-server gRPC giữa Order Service và Core Service để truy vấn thông tin sản phẩm, giá cả và thông tin combo với độ trễ tối thiểu (dưới 10ms).
- [ ] **Cấu hình RabbitMQ (Bất đồng bộ):** Định nghĩa các Exchange, Queue và Event Schema (`order.created`, `order.timeout`, `inventory.released`).
- [ ] **Viết Redis Lua Script:** Hiện thực hóa logic kiểm tra tồn kho, giới hạn lượt mua của user và trừ số lượng trong một giao dịch nguyên tử (*Atomic Transaction*) duy nhất trên Redis.
- [ ] **Triển khai Saga Pattern (Choreography):**
  - *Luồng thành công:* Đơn hàng từ Queue &rarr; Order Service xử lý Smart Routing &rarr; Ghi DB &rarr; Chờ thanh toán &rarr; Thanh toán thành công (Webhook) &rarr; Chuyển trạng thái `PAID` và trừ kho vật lý.
  - *Luồng thất bại/bù trừ (Compensating):* Quá 5 phút không thanh toán &rarr; Bắn event hủy đơn &rarr; Flash Sale Service nhả lại kho trên Redis (`INCRBY` tồn kho và xóa khóa giới hạn mua).
- [ ] **Thuật toán Smart Order Routing (SOR):** Viết logic tự động map vị trí khách hàng với kho gần nhất, tự động phân tách đơn hàng (*Split Order*) nếu không có kho nào đáp ứng đủ 100% danh sách mặt hàng yêu cầu.

### Giai đoạn 4: Phát triển giao diện (Front-end Development)

**Mục tiêu:** Giao diện Omni mượt mà, tốc độ tải nhanh dưới 2 giây và hiển thị real-time.

- [ ] **Giao diện Khách hàng Omni (Next.js):**
  - Áp dụng Server-Side Rendering (SSR) hoặc Incremental Static Regeneration (ISR) để xây dựng trang tĩnh cho danh mục và chi tiết sản phẩm nhằm tối ưu SEO và tốc độ tải trang cực nhanh.
  - Thiết lập kết nối Server-Sent Events (SSE) hoặc WebSockets kết nối từ client đến Gateway để đẩy số lượng tồn kho Flash Sale liên tục xuống UI mà không bắt khách F5 trang.
- [ ] **Giao diện Quản trị Omni Admin (React):**
  - Xây dựng màn hình cấu hình chiến dịch Flash Sale (sản phẩm, giá ưu đãi, số lượng mở bán, thời gian).
  - Làm dashboard quản lý tồn kho đa điểm độc lập tại đầu cầu HN và HCM.

### Giai đoạn 5: Giả lập tải & tối ưu hóa (Load Testing & Performance Tuning)

**Mục tiêu:** Chứng minh tính ổn định của hệ thống Omni bằng con số cụ thể trước khi bàn giao.

- [ ] **Viết kịch bản test tải:** Sử dụng công cụ Locust hoặc k6 viết kịch bản giả lập 5.000 - 10.000 requests ùa vào API `/purchase` của API Gateway tại thời điểm mở bán Flash Sale.
- [ ] **Giám sát qua Distributed Tracing (Jaeger):** Theo dõi hành trình của request đi qua các microservices để phát hiện và xử lý triệt để các điểm thắt nút cổ chai (*Bottlenecks*) tại các kết nối mạng hay gRPC.
- [ ] **Kiểm thử tính toàn vẹn dữ liệu:** Xác minh sau đợt test tải nặng, số đơn đặt hàng được tạo ra trong PostgreSQL khớp chính xác 100% với lượng tồn kho thực tế bị trừ trên Redis, tuyệt đối không bị quá bán.

### Giai đoạn 6: Triển khai Production (Deployment)

**Mục tiêu:** Đưa toàn bộ hệ thống Omni lên môi trường Internet thực tế một cách an toàn.

- [ ] **Docker hóa (Containerization):** Viết file `Dockerfile` sử dụng kỹ thuật Multi-stage build để tối ưu hóa dung lượng hình ảnh cho từng service và giao diện Next.js.
- [ ] **Thiết lập CI/CD Pipeline:** Tự động hóa việc chạy unit test, build Docker Image và push lên Registry (GitHub Packages / GCP Artifact Registry) khi merge code vào nhánh `main`.
- [ ] **Triển khai hạ tầng Cloud:**
  - *Lựa chọn thực dụng:* Sử dụng Docker Compose trên một VPS cấu hình tốt để tối ưu chi phí trong giai đoạn đầu.
  - *Lựa chọn chuẩn doanh nghiệp:* Triển khai cụm Kubernetes (K3s hoặc EKS) để tự động hóa việc mở rộng (*Horizontal Pod Autoscaling*) cho riêng Flash Sale Engine khi phát hiện tải tăng đột biến.

---

## 💡 Nguyên tắc vàng khi làm dự án Omni

- **Keep It Simple First:** Đừng cố nhồi nhét các giải pháp bảo mật hay phân quyền quá phức tạp ở giai đoạn đầu. Hãy hoàn thiện luồng nghiệp vụ cốt lõi (Mua hàng - Giữ kho - Điều phối) trước.
- **Log có cấu trúc (Structured Logging):** Trong kiến trúc phân tán, log là công cụ sinh tồn duy nhất của bạn. Đảm bảo mọi dòng log đều được định dạng JSON và mang theo `traceId` từ API Gateway.
- **Tuyệt đối không chọc chéo Database:** Core Service và Order Service có thể dùng chung một cụm database vật lý để tiết kiệm chi phí, nhưng chúng bắt buộc phải nằm ở 2 Schema khác nhau và không được phép join bảng chéo của nhau. Mọi giao dịch lấy thông tin của nhau phải đi qua giao tiếp gRPC.
