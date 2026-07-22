# Kiến Trúc Frontend & Quy Chuẩn Clean Code (Frontend Architecture & Clean Code Specification)

- **Dự án:** Hệ thống E-commerce Thương hiệu Omni tích hợp Flash Sale & Điều phối đa kho (Omnidrop Multiwarehouse SOR)
- **Ứng dụng:** Web Application (`apps/web-app`) - Vite + React + TypeScript
- **Phiên bản:** v1.0
- **Tác giả:** Lead Frontend Architect

---

## I. Tổng Quan & Triết Lý Thiết Kế (Design Philosophy & Goals)

Tài liệu này định nghĩa quy chuẩn kiến trúc và nguyên tắc **Clean Code** dành riêng cho ứng dụng Frontend của Omni. Mục tiêu nhằm đảm bảo:
1. **Tính Mô-đun hoá (Modularity & Separation of Concerns):** Tách biệt triệt để giao diện (UI Rendering), logic quản lý trạng thái (State Management) và tầng dịch vụ API (Service/Data Layer).
2. **Khả năng Bảo trì & Mở rộng (Maintainability & Scalability):** Áp dụng nguyên lý SOLID vào React Component, sử dụng Custom Hooks để đóng gói logic nghiệp vụ.
3. **An toàn Kiểu Dữ liệu (Strict Type Safety):** 100% định nghĩa Interfaces/Types cho tất cả API Contracts, Props, State và Event Handlers.
4. **Hiệu năng Cao (High Performance):** Tối ưu rendering với React Context hạt mịn, Custom Hooks memoized, không ghi lại state dư thừa.
5. **Giao diện Đẳng cấp (Visual Excellence):** Áp dụng Design Tokens, hiệu ứng Glassmorphism hiện đại, responsive trên mọi thiết bị.

---

## II. Sơ Đồ Cấu Trúc Thư Mục Clean Code (Clean Architecture Folder Structure)

Thư mục `apps/web-app/src` được tái cấu trúc theo mô hình **Atomic & Modular Domain Architecture**:

```text
apps/web-app/src/
├── assets/                  # Static assets (images, icons, fonts)
├── components/              # Single-responsibility React Components
│   ├── common/              # Dumb/UI Atomic Components (Button, Badge, Modal, Toast)
│   │   ├── Badge.tsx
│   │   ├── Button.tsx
│   │   ├── Modal.tsx
│   │   └── Toast.tsx
│   ├── catalog/             # Product Domain Components
│   │   ├── HeroBanner.tsx
│   │   ├── ProductCard.tsx
│   │   ├── ProductCatalog.tsx
│   │   └── ProductDetailModal.tsx
│   ├── checkout/            # Checkout Domain Components
│   │   ├── CartDrawer.tsx
│   │   └── CheckoutPage.tsx
│   ├── orders/              # Orders & Tracking Domain Components
│   │   └── OrderHistoryModal.tsx
│   ├── admin/               # Admin Management Domain
│   │   └── AdminPortal.tsx
│   └── navigation/          # Navigation Header & Footer
│       ├── HeaderNav.tsx
│       └── Footer.tsx
├── context/                 # Global React Context Provider Layer
│   ├── CartContext.tsx      # Quản lý Giỏ hàng (Cart State & Items)
│   ├── OrderContext.tsx     # Quản lý Đơn hàng & SSE Live Tracker
│   └── ToastContext.tsx     # Thông báo Toast toàn hệ thống
├── hooks/                   # Business Logic Custom Hooks
│   ├── useProducts.ts       # Hook gọi API danh mục sản phẩm & ATS kho
│   ├── useCart.ts           # Hook tương tác giỏ hàng, mã giảm giá
│   ├── useOrders.ts         # Hook quản lý đơn hàng & webhook pay
│   └── useSseStock.ts       # Hook đồng bộ tồn kho Redis qua SSE Stream
├── services/                # API Data Layer & Fetch Wrappers
│   └── api.ts               # Rest API client wrappers
├── types/                   # TypeScript Type Definitions & Enums
│   └── index.ts
├── App.tsx                  # Main App Shell & Router Container
├── main.tsx                 # Entry Point
└── index.css                # Global CSS Design System Tokens
```

---

## III. Các Nguyên Tắc Clean Code Áp Dụng (Clean Code Principles)

### 1. Nguyên lý Trách nhiệm Đơn lẻ (Single Responsibility Principle - SRP)
- **Component UI pure:** Chỉ đảm nhận duy nhất nhiệm vụ render HTML/JSX dựa trên Props.
- **Custom Hooks:** Đóng gói toàn bộ logic gọi API, lắng nghe SSE và tính toán dữ liệu nghiệp vụ ra khỏi Component.

### 2. Quản lý Trạng thái Phân tầng (Tiered State Management)
- **Local Component State:** Chỉ dùng cho UI transient state (ví dụ: mở/đóng Modal, giá trị Input form đang gõ).
- **Custom Hook State:** Dùng cho dữ liệu có phạm vi mô-đun (ví dụ: danh sách sản phẩm, số lượng tồn kho SSE).
- **Global React Context:** Dùng cho dữ liệu dùng chung toàn hệ thống (Giỏ hàng `CartContext`, Thông báo `ToastContext`).

### 3. Tối ưu hóa Custom Hooks
Mỗi hook đảm nhận một vai trò độc lập:
- `useSseStock(sku)`: Tự động mở kết nối `EventSource` tới Flash Sale Service, lắng nghe sự kiện push stock từ server và tự động `close()` khi unmount.
- `useCart()`: Cung cấp các hàm `addToCart`, `removeFromCart`, `updateQuantity`, `clearCart`, `applyVoucher` và tự động lưu vào `localStorage`.
- `useProducts()`: Quản lý việc gọi API `/api/products`, lọc sản phẩm theo danh mục/từ khóa tìm kiếm.

---

## IV. Quy Chuẩn Đặt Tên & An Toàn Kiểu Dữ Liệu (Naming Conventions & Types)

### 1. Quy chuẩn Đặt tên
- **Component & Types:** PascalCase (`ProductCard.tsx`, `ProductItem`, `CartContext`).
- **Hooks:** camelCase với tiền tố `use` (`useProducts`, `useCart`).
- **Handlers & Callbacks:** Tiền tố `handle` cho phương thức nội bộ (`handleSubmit`) và `on` cho Props truyền xuống (`onSelectProduct`).
- **Constants & Enums:** UPPER_SNAKE_CASE (`REST_API_TIMEOUT`, `DEFAULT_FLASH_SALE_SKU`).

### 2. Ma trận Types Chuẩn (`src/types/index.ts`)
Tất cả các thực thể nghiệp vụ đều được type-safe tuyệt đối:
- `ProductItem`, `WarehouseStock`, `CartItem`, `OrderItemRecord`, `FulfillmentItem`.

---

## V. Kế Hoạch Tái Cấu Trúc (Refactoring Plan)

Sau khi ban hành tài liệu quy chuẩn kiến trúc này, dự án sẽ thực hiện các bước tái cấu trúc code Frontend:

1. **Bước 1:** Tạo `src/types/index.ts` tập trung hóa toàn bộ Interfaces.
2. **Bước 2:** Xây dựng hệ thống Context Providers (`CartContext`, `ToastContext`).
3. **Bước 3:** Hiện thực các Custom Hooks nghiệp vụ (`useProducts`, `useSseStock`, `useOrders`).
4. **Bước 4:** Tách các Components theo chuẩn Atomic Domain Architecture (`common/`, `catalog/`, `checkout/`, `orders/`, `navigation/`).
5. **Bước 5:** Cập nhật `App.tsx` gọn gàng, đóng vai trò Container kết nối các Providers.
6. **Bước 6:** Chạy `npm run build` xác minh 100% không còn lỗi TypeScript hay dư thừa code.
