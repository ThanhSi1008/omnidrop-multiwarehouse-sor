# Tài Liệu Rà Soát & Đặc Tả Thiết Kế Kiến Trúc (Diagram Specification & Architectural Review)

- **Hệ thống:** Omnidrop - Multiwarehouse Smart Order Routing & Flash Sale Engine
- **Ngày cập nhật:** 23/07/2026
- **Tác giả:** System Architect & Lead Engineer

---

## I. Tổng Quan Đánh Giá Thiết Kế Thực Thể & Cơ Sở Dữ Liệu

Sau khi rà soát toàn bộ cấu trúc mã nguồn backend (`apps/core-service`, `apps/order-routing-service`, `apps/flash-sale-service`) và hệ thống cơ sở dữ liệu PostgreSQL + Redis, hệ thống đã bổ sung **Thực thể Khách hàng (`core.users`)** lưu trữ bền vững thông tin tài khoản người mua hàng trên PostgreSQL.

### 1. Điểm Mạnh Kiến Trúc Đã Đạt Được:
1. **Quản lý Khách Hàng Lưu Trữ Bền Vững (`core.users`)**:
   - Lưu vết thông tin người mua: `id` (UUID), `email`, `full_name`, `phone`, `avatar_url`, `loyalty_points`.
2. **Phân tách Schema Độc Lập (`core` và `order`)**:
   - `core` schema: Chứa Khách hàng (`users`), Quản lý Sản phẩm (`products`), Biến thể (`product_variants`), Kho hàng (`warehouses`), Tồn kho vật lý (`inventory`), Combo (`bundles`).
   - `order` schema: Chứa Đơn hàng (`orders`), Chi tiết mặt hàng (`order_items`), Vận đơn điều phối kho (`fulfillments`).
3. **Bảo toàn dữ liệu tồn kho bằng công thức $Q_{ATS} = Q_{Physical} - Q_{Reserved}$**:
   - `inventory` table lưu vết tách biệt giữa `quantity` (tồn thực trên kệ) và `reserved_quantity` (đang giữ chỗ).

---

## II. Sơ Đồ Thực Thể & Cơ Sở Dữ Liệu (Database ERD Diagram)

```mermaid
erDiagram
    %% Core Schema Tables
    users ||--|{ orders : "1-to-N (places orders)"
    products ||--|{ product_variants : "1-to-N (has variants)"
    product_variants ||--|{ inventory : "1-to-N (stocked in warehouses)"
    warehouses ||--|{ inventory : "1-to-N (holds stock)"
    bundles ||--|{ bundle_items : "1-to-N (contains items)"
    product_variants ||--|{ bundle_items : "1-to-N (is part of bundle)"

    %% Order Schema Tables
    orders ||--|{ order_items : "1-to-N (has line items)"
    orders ||--|{ fulfillments : "1-to-N (split into shipments)"
    warehouses ||--|{ fulfillments : "1-to-N (fulfills from)"

    users {
        uuid id PK
        string email UK
        string full_name
        string phone
        string avatar_url
        int loyalty_points
        timestamp created_at
        timestamp updated_at
    }

    products {
        uuid id PK
        string title
        text description
        timestamp created_at
        timestamp updated_at
    }

    product_variants {
        uuid id PK
        uuid product_id FK
        string sku UK
        decimal price
        timestamp created_at
        timestamp updated_at
    }

    warehouses {
        uuid id PK
        string code UK
        string name
        string address
        timestamp created_at
        timestamp updated_at
    }

    inventory {
        uuid id PK
        uuid warehouse_id FK
        uuid variant_id FK
        int quantity
        int reserved_quantity
        timestamp created_at
        timestamp updated_at
    }

    orders {
        uuid id PK
        string order_code UK
        string user_id FK
        string status "PENDING_PAYMENT | PAID | CANCELLED | FULFILLED"
        decimal total_amount
        jsonb shipping_address
        timestamp created_at
        timestamp updated_at
    }

    fulfillments {
        uuid id PK
        uuid order_id FK
        uuid warehouse_id FK
        string fulfillment_code UK
        string status "PREPARING | SHIPPED | DELIVERED"
        jsonb items_snapshot
        timestamp created_at
        timestamp updated_at
    }
```

---

## III. Sơ Đồ Lớp Kiến Trúc (Class Diagram)

```mermaid
classDiagram
    class GatewayAppController {
        +getProducts()
        +getUsers()
        +registerUser(payload)
        +loginUser(payload)
        +createPurchase(payload)
        +getOrders()
        +payOrder(orderId)
    }

    class CoreAppController {
        +getProducts() Product[]
        +getUsers() User[]
        +registerUser(dto) User
        +loginUser(dto) User
    }

    class UserEntity {
        +UUID id
        +String email
        +String fullName
        +String phone
        +String avatarUrl
        +Number loyaltyPoints
    }

    GatewayAppController ..> CoreAppController : REST Proxy (/users)
    CoreAppController --> UserEntity : Repository Save/Query
```
