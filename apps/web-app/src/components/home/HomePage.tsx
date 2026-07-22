import React from 'react';
import { ProductItem } from '../../types';
import { ProductCard } from '../catalog/ProductCard';
import { Flame, ShieldCheck, Truck, Clock, Sparkles, ArrowRight, Star, Award, RotateCcw, Shirt, Gift, MapPin } from 'lucide-react';

interface HomePageProps {
  products: ProductItem[];
  onSelectProduct: (product: ProductItem) => void;
  onAddToCart: (product: ProductItem) => void;
  onQuickBuy: (product: ProductItem) => void;
  flashSaleStock: number;
  onRefillStock: () => void;
  refillLoading: boolean;
  onNavigateShop: () => void;
  onSelectCategory: (cat: string) => void;
  openStoreLocator: () => void;
}

export const HomePage: React.FC<HomePageProps> = ({
  products,
  onSelectProduct,
  onAddToCart,
  onQuickBuy,
  flashSaleStock,
  onRefillStock,
  refillLoading,
  onNavigateShop,
  onSelectCategory,
  openStoreLocator,
}) => {
  const trendingProducts = products.slice(0, 4);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '44px' }}>
      
      {/* 1. Hero Brand Showcase Slider */}
      <div className="glass-card glass-card-accent" style={{ padding: '44px 36px', position: 'relative', overflow: 'hidden', minHeight: '340px' }}>
        <div style={{ position: 'absolute', right: '-80px', top: '-80px', width: '420px', height: '420px', background: 'radial-gradient(circle, rgba(99,102,241,0.28) 0%, transparent 70%)', pointerEvents: 'none' }} />

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '32px' }}>
          <div style={{ maxWidth: '680px' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '6px 16px', borderRadius: '20px', background: 'rgba(99, 102, 241, 0.15)', border: '1px solid rgba(99, 102, 241, 0.3)', color: '#818cf8', fontSize: '0.88rem', fontWeight: 700, marginBottom: '16px' }}>
              <Sparkles size={16} color="#818cf8" /> THỜI TRANG NĂM 2026 - BỘ SƯU TẬP QUẦN ÁO NAM OMNIDROP
            </div>

            <h1 className="gradient-text" style={{ fontSize: '3rem', fontWeight: 800, lineHeight: 1.15, letterSpacing: '-0.02em', marginBottom: '16px' }}>
              Thời Trang Lịch Lãm - Khóa Kho Chống Quá Bán 100%
            </h1>

            <p style={{ color: 'var(--text-muted)', fontSize: '1.05rem', lineHeight: 1.6, marginBottom: '24px' }}>
              Khám phá bộ sưu tập Áo Polo Nam Cool-Tech, Áo Hoodie Oversized 400gsm, Áo Sơ Mi Chống Nhăn và Quần Khaki Co Giãn. Hệ thống tự động phân bổ đơn hàng xuất từ Kho Hà Nội (HN) hoặc TP. HCM tối ưu tốc độ giao hàng.
            </p>

            <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
              <button className="btn-primary" style={{ padding: '14px 28px', fontSize: '1.05rem' }} onClick={onNavigateShop}>
                Khám Phá Bộ Sưu Tập <ArrowRight size={18} />
              </button>

              <button className="btn-secondary" style={{ padding: '14px 24px', fontSize: '1rem' }} onClick={onRefillStock} disabled={refillLoading}>
                <RotateCcw size={16} /> {refillLoading ? 'Đang Nạp...' : '⚡ Nạp Áo Polo Flash Sale'}
              </button>
            </div>
          </div>

          {/* Flash Sale Widget */}
          <div className="glass-card" style={{ padding: '28px', width: '300px', display: 'flex', flexDirection: 'column', gap: '16px', background: 'rgba(15, 23, 42, 0.85)', border: '1px solid rgba(244, 63, 94, 0.4)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span className="badge badge-rose">
                <Flame size={12} fill="#f43f5e" /> FLASH SALE POLO
              </span>
              <span style={{ fontSize: '0.8rem', color: '#34d399', fontWeight: 700 }}>LIVE REALTIME</span>
            </div>

            <div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Tồn Kho Redis Áo Polo Hiện Tại:</div>
              <div style={{ fontSize: '2.2rem', fontWeight: 800, color: flashSaleStock > 0 ? '#34d399' : '#f87171', marginTop: '4px' }}>
                {flashSaleStock} Sản Phẩm
              </div>
            </div>

            <div style={{ padding: '10px', borderRadius: '8px', background: 'rgba(255,255,255,0.03)', fontSize: '0.8rem', color: 'var(--text-dim)' }}>
              ⚡ Giảm giá 50% chỉ còn <strong>325.000 ₫</strong> (Giá gốc 650.000 ₫)
            </div>
          </div>
        </div>
      </div>

      {/* 2. TopZone Style Category Cards Grid (Pure Apparel) */}
      <div>
        <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-muted)', marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          DANH MỤC THỜI TRANG QUẦN ÁO
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: '16px' }}>
          {[
            { id: 'flash_sale', icon: <Flame size={32} color="#f43f5e" />, title: 'Flash Sale Polo 50%', sub: 'Nạp kho liên tục' },
            { id: 'apparel', icon: <Shirt size={32} color="#38bdf8" />, title: 'Áo Hoodie & Sweater', sub: 'Cotton 400gsm' },
            { id: 'apparel', icon: <Shirt size={32} color="#818cf8" />, title: 'Áo Sơ Mi Công Sở', sub: 'Chống nhăn cao cấp' },
            { id: 'apparel', icon: <Shirt size={32} color="#fbbf24" />, title: 'Quần Khaki Slim-Fit', sub: 'Co giãn 4 chiều' },
            { id: 'bundles', icon: <Gift size={32} color="#ec4899" />, title: 'Combo 3 Áo Thun', sub: 'Set basic mềm mịn' },
            { id: 'store_locator', icon: <MapPin size={32} color="#34d399" />, title: 'Hệ Thống Cửa Hàng', sub: 'Hà Nội & TP. HCM' },
          ].map((cat, idx) => (
            <div
              key={idx}
              onClick={() => {
                if (cat.id === 'store_locator') {
                  openStoreLocator();
                } else {
                  onSelectCategory(cat.id);
                }
              }}
              className="glass-card"
              style={{
                padding: '24px 16px',
                textAlign: 'center',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '10px',
                transition: 'all 0.25s ease',
                background: 'rgba(30, 41, 59, 0.6)',
              }}
            >
              {cat.icon}
              <div>
                <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--text-main)' }}>{cat.title}</h4>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '2px', display: 'block' }}>{cat.sub}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 3. Brand Guarantee Badges */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px' }}>
        {[
          { icon: <ShieldCheck size={28} color="#34d399" />, title: 'Vải Premium 100%', desc: 'Cam kết chất lượng Cotton, Nỉ Chân Cua & Bamboo' },
          { icon: <Truck size={28} color="#38bdf8" />, title: 'Điều Phối Đa Kho SOR', desc: 'Tự động xuất kho từ Hà Nội hoặc TP. HCM gần nhất' },
          { icon: <Clock size={28} color="#fbbf24" />, title: 'Giao Hàng Tốc Độ', desc: 'Giao nhanh 1-2 ngày nội thành HN & HCM' },
          { icon: <Award size={28} color="#a855f7" />, title: 'Đổi Size Trong 7 Ngày', desc: 'Bảo hành 12 tháng lỗi đường may dệt' },
        ].map((item, idx) => (
          <div key={idx} className="glass-card" style={{ padding: '24px', display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
            {item.icon}
            <div>
              <h4 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '4px' }}>{item.title}</h4>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>{item.desc}</p>
            </div>
          </div>
        ))}
      </div>

      {/* 4. Trending Apparel Products Grid */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <div>
            <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-main)' }}>
              🔥 Mẫu Quần Áo Bán Chạy Mới Nhất
            </h2>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginTop: '4px' }}>
              Những mẫu áo polo, hoodie, sơ mi và quần khaki nam hot nhất mùa này
            </p>
          </div>

          <button className="btn-secondary" style={{ padding: '10px 18px', fontSize: '0.9rem' }} onClick={onNavigateShop}>
            Xem Tất Cả Mẫu Áo <ArrowRight size={16} />
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '24px' }}>
          {trendingProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              flashSaleStock={flashSaleStock}
              onSelectProduct={onSelectProduct}
              onAddToCart={onAddToCart}
              onQuickBuy={onQuickBuy}
            />
          ))}
        </div>
      </div>

      {/* 5. Customer Testimonials */}
      <div className="glass-card" style={{ padding: '36px' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 800, textAlign: 'center', marginBottom: '28px' }}>
          ⭐ Đánh Giá Chất Lượng Phom Dáng & Vải Quần Áo
        </h2>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
          {[
            { name: 'Trần Hoàng Nam (Hà Nội)', comment: 'Áo polo mặc cực mát và đứng form! Giao hàng từ Kho HN chỉ đúng 1 ngày là nhận được.', rating: 5 },
            { name: 'Lê Minh Anh (TP. HCM)', comment: 'Áo hoodie vải nỉ dày dặn đúng chuẩn 400gsm. Kho HCM đóng gói rất kỹ, hỗ trợ đổi size nhiệt tình!', rating: 5 },
            { name: 'Nguyễn Thanh Tùng (Đà Nẵng)', comment: 'Quần Khaki Slim-fit co giãn mặc thoải mái lắm. Thích nhất giao diện mua hàng chuẩn hiện đại!', rating: 5 },
          ].map((t, idx) => (
            <div key={idx} style={{ padding: '20px', borderRadius: '12px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-glass)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div style={{ display: 'flex', gap: '4px', marginBottom: '10px' }}>
                  {[...Array(t.rating)].map((_, i) => (
                    <Star key={i} size={16} fill="#fbbf24" color="#fbbf24" />
                  ))}
                </div>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: 1.5, fontStyle: 'italic' }}>
                  "{t.comment}"
                </p>
              </div>
              <div style={{ marginTop: '14px', fontSize: '0.85rem', fontWeight: 700, color: '#38bdf8' }}>
                {t.name}
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
