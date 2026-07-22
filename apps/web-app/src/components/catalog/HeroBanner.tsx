import React from 'react';
import { Flame, ShieldCheck, Truck, RotateCcw } from 'lucide-react';

interface HeroBannerProps {
  flashSaleStock: number;
  onRefillStock: () => void;
  refillLoading: boolean;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({
  flashSaleStock,
  onRefillStock,
  refillLoading,
}) => {
  return (
    <div className="glass-card glass-card-accent" style={{ padding: '36px', position: 'relative', overflow: 'hidden', minHeight: '260px' }}>
      <div style={{ position: 'absolute', right: '-60px', top: '-60px', width: '320px', height: '320px', background: 'radial-gradient(circle, rgba(99,102,241,0.25) 0%, transparent 70%)', pointerEvents: 'none' }} />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '24px' }}>
        <div style={{ maxWidth: '640px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '6px 14px', borderRadius: '20px', background: 'rgba(244, 63, 94, 0.15)', border: '1px solid rgba(244, 63, 94, 0.3)', color: '#f43f5e', fontSize: '0.85rem', fontWeight: 700, marginBottom: '14px' }}>
            <Flame size={16} fill="#f43f5e" /> BỘ SƯU TẬP HÈ & MÙA FLASH SALE GIẢM GIÁ 50%
          </div>

          <h1 className="gradient-text" style={{ fontSize: '2.5rem', fontWeight: 800, lineHeight: 1.2, letterSpacing: '-0.02em', marginBottom: '12px' }}>
            Trải Nghiệm Mua Sắm Bán Hàng Trực Tải Cao
          </h1>

          <p style={{ color: 'var(--text-muted)', fontSize: '1.05rem', lineHeight: 1.6 }}>
            Hệ thống E-Commerce thương hiệu Omni tích hợp Công nghệ Khóa kho Redis Lua nguyên tử, Chống quá bán 100% và Thuật toán Điều phối Đa kho Thông minh (Smart Order Routing - SOR).
          </p>

          <div style={{ display: 'flex', gap: '16px', marginTop: '20px', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.88rem', color: '#34d399' }}>
              <ShieldCheck size={18} /> Đảm Bảo Hàng Chính Hãng 100%
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.88rem', color: '#38bdf8' }}>
              <Truck size={18} /> Tự Động Phân Bổ Kho HN & HCM
            </div>
          </div>
        </div>

        {/* Quick Demo Controls Box */}
        <div className="glass-card" style={{ padding: '24px', width: '280px', display: 'flex', flexDirection: 'column', gap: '14px', background: 'rgba(15, 23, 42, 0.8)' }}>
          <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-main)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            ⚡ Nạp Lại Kho Demo Flash Sale
          </div>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Tồn kho Redis Flash Sale SKU Kính Mát hiện tại:
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: flashSaleStock > 0 ? '#34d399' : '#f87171' }}>
            {flashSaleStock} Sản Phẩm
          </div>
          <button className="btn-secondary" style={{ width: '100%', padding: '10px', fontSize: '0.85rem', justifyContent: 'center' }} onClick={onRefillStock} disabled={refillLoading}>
            <RotateCcw size={14} color="#818cf8" /> {refillLoading ? 'Đang nạp...' : '⚡ Nạp Lại 10 SP & Mở Khóa'}
          </button>
        </div>
      </div>
    </div>
  );
};
