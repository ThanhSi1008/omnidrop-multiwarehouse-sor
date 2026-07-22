# Kiến Trúc Frontend & Quy Chuẩn Clean Code (Frontend Architecture & Clean Code Specification)

- **Dự án:** Hệ thống E-commerce Thương hiệu Omni tích hợp Flash Sale & Điều phối đa kho (Omnidrop Multiwarehouse SOR)
- **Ứng dụng:** Web Application (`apps/web-app`) - Vite + React + TypeScript
- **Phiên bản:** v1.1 (Cập nhật 100% Khách hàng Persistence & Multi-page Apparel Routing)
- **Tác giả:** Lead Frontend Architect

---

## I. Tổng Quan & Triết Lý Thiết Kế (Design Philosophy & Goals)

Tài liệu này định nghĩa quy chuẩn kiến trúc và nguyên tắc **Clean Code** dành riêng cho ứng dụng Frontend của Omni. Mục tiêu nhằm đảm bảo:
1. **Tính Mô-đun hoá (Modularity & Separation of Concerns):** Tách biệt triệt để giao diện (UI Rendering), logic quản lý trạng thái (State Management) và tầng dịch vụ API (Service/Data Layer).
2. **Khả năng Bảo trì & Mở rộng (Maintainability & Scalability):** Áp dụng nguyên lý SOLID vào React Component, sử dụng Custom Hooks để đóng gói logic nghiệp vụ.
3. **An toàn Kiểu Dữ liệu (Strict Type Safety):** 100% định nghĩa Interfaces/Types cho tất cả API Contracts, Props, State và Event Handlers.
4. **Hiệu năng Cao (High Performance):** Tối ưu rendering với React Context hạt mịn, Custom Hooks memoized, không ghi lại state dư thừa.
5. **Giao diện Đẳng cấp (Visual Excellence):** Áp dụng Design Tokens, hiệu ứng Glassmorphism hiện đại, responsive trên mọi thiết bị (Inspired by TopZone, Owen & Kính Mắt Anna).

---

## II. Sơ Đồ Cấu Trúc Thư Mục Clean Code (Clean Architecture Folder Structure)

Thư mục `apps/web-app/src` được triển khai theo mô hình **Atomic & Modular Domain Architecture**:

```text
apps/web-app/src/
├── assets/                  # Static assets (images, icons, fonts)
├── components/              # Single-responsibility React Components
│   ├── common/              # Dumb/UI Atomic Components (Button, Badge, Modal, Toast, StoreLocatorModal)
│   │   ├── Badge.tsx
│   │   ├── Button.tsx
│   │   ├── Modal.tsx
│   │   ├── StoreLocatorModal.tsx
│   │   └── Toast.tsx
│   ├── home/                # Home Page Domain Components (Hero Showcase, TopZone Category Grid)
│   │   └── HomePage.tsx
│   ├── catalog/             # Product Domain Components (Catalog, Detail, Search, Tag Pills)
│   │   ├── CatalogPage.tsx
│   │   ├── ProductCard.tsx
│   │   └── ProductDetailPage.tsx
│   ├── checkout/            # Checkout Domain Components
│   │   ├── CartDrawer.tsx
│   │   └── CheckoutPage.tsx
│   ├── orders/              # Orders & Tracking Domain Components
│   │   └── OrderHistoryModal.tsx
│   ├── auth/                # User Authentication Domain
│   │   └── AuthModal.tsx
│   ├── admin/               # Admin Management Domain
│   │   └── AdminPortal.tsx
│   └── navigation/          # Navigation Header & Footer
│       ├── HeaderNav.tsx
│       └── Footer.tsx
├── context/                 # Global React Context Provider Layer
│   ├── AuthContext.tsx      # Quản lý Đăng nhập & Lưu CSDL PostgreSQL (core.users)
│   ├── CartContext.tsx      # Quản lý Giỏ hàng (Cart State & Items)
│   ├── OrderContext.tsx     # Quản lý Đơn hàng & SSE Live Tracker
│   └── ToastContext.tsx     # Thông báo Toast toàn hệ thống
├── hooks/                   # Business Logic Custom Hooks
│   ├── useProducts.ts       # Hook gọi API danh mục sản phẩm & ATS kho
│   ├── useCart.ts           # Hook tương tác giỏ hàng, mã giảm giá
│   ├── useOrders.ts         # Hook quản lý đơn hàng & webhook pay
│   └── useSseStock.ts       # Hook đồng bộ tồn kho Redis qua SSE Stream
├── services/                # API Data Layer & Fetch Wrappers
│   └── api.ts               # Rest API client wrappers (products, users, purchase, orders)
├── types/                   # TypeScript Type Definitions & Enums
│   └── index.ts
├── App.tsx                  # Main App Shell & Navigation Router Container
├── main.tsx                 # Entry Point
└── index.css                # Global CSS Design System Tokens
```

---

## III. Các Nguyên Tắc Clean Code Áp Dụng (Clean Code Principles)

### 1. Nguyên lý Trách nhiệm Đơn lẻ (Single Responsibility Principle - SRP)
- **Component UI pure:** Chỉ đảm nhận duy nhất nhiệm vụ render HTML/JSX dựa trên Props.
- **Custom Hooks:** Đóng gói toàn bộ logic gọi API, lắng nghe SSE và tính toán dữ liệu nghiệp vụ ra khỏi Component.

### 2. Quản lý Trạng thái Phân tầng (Tiered State Management)
- **Local Component State:** Chỉ dùng cho UI transient state (ví dụ: mở/đóng Modal, chọn size/màu).
- **Custom Hook State:** Dùng cho dữ liệu có phạm vi mô-đun (ví dụ: danh sách sản phẩm, số lượng tồn kho SSE).
- **Global React Context:** Dùng cho dữ liệu dùng chung toàn hệ thống (`AuthContext`, `CartContext`, `ToastContext`).

### 3. Tự Động Lưu Dữ Liệu Khách Hàng (`AuthContext`)
- Khi người dùng đăng ký hoặc đăng nhập, `AuthContext` thực hiện gọi API bất đồng bộ `registerUserApi` / `loginUserApi` gửi về API Gateway để ghi thông tin khách hàng vào PostgreSQL bảng `core.users`.

---

## IV. Trạng Thái Hoàn Thành Kế Hoạch Tái Cấu Trúc (100% Completed)

1. [x] **Tập trung hóa Types:** `src/types/index.ts` định nghĩa type-safe tuyệt đối cho `ProductItem`, `WarehouseStock`, `CartItem`, `OrderItemRecord`, `UserProfile`.
2. [x] **Hệ thống Context Providers:** Triển khai `AuthContext`, `CartContext`, `ToastContext`, `OrderContext`.
3. [x] **Custom Hooks nghiệp vụ:** Hoàn thiện `useProducts`, `useSseStock`, `useOrders`.
4. [x] **Phân tách Components:** Tổ chức thư mục chuẩn Atomic Domain (`home/`, `catalog/`, `checkout/`, `orders/`, `auth/`, `admin/`, `navigation/`, `common/`).
5. [x] **Multi-page Router Container:** `App.tsx` hỗ trợ chuyển trang mượt mà giữa Trang Chủ, Danh Mục Quần Áo, Chi Tiết Sản Phẩm, Giỏ Hàng, Thanh Toán và Trạm Tìm Cửa Hàng.
6. [x] **Xác minh Biên dịch:** `npm run build` hoàn tất **0 TypeScript / Vite errors**.
