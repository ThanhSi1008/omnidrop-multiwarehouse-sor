import React, { useState } from 'react';
import { ProductItem, WarehouseStock } from '../../types';
import { X, Star, ShoppingCart, ShieldCheck, Clock, Plus, Minus, MapPin } from 'lucide-react';

interface ProductDetailModalProps {
  product: ProductItem | null;
  onClose: () => void;
  onAddToCart: (product: ProductItem, quantity: number) => void;
  onQuickBuy: (product: ProductItem, quantity: number) => void;
  flashSaleStock: number;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  onClose,
  onAddToCart,
  onQuickBuy,
  flashSaleStock,
}) => {
  const [quantity, setQuantity] = useState<number>(1);

  if (!product) return null;

  const isFlashSale = product.category === 'flash_sale';
  const availableStock = isFlashSale ? flashSaleStock : product.totalAts;
  const isOutOfStock = availableStock <= 0;

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(12px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
      <div className="glass-card glass-card-accent" style={{ width: '100%', maxWidth: '840px', maxHeight: '90vh', overflowY: 'auto', padding: '32px', position: 'relative', background: '#0f172a' }}>
        {/* Close Button */}
        <button
          onClick={onClose}
          style={{ position: 'absolute', top: '20px', right: '20px', background: 'rgba(255,255,255,0.08)', border: '1px solid var(--border-glass)', color: '#fff', width: '36px', height: '36px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
        >
          <X size={20} />
        </button>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '32px' }}>
          {/* Product Image */}
          <div style={{ borderRadius: '16px', overflow: 'hidden', border: '1px solid var(--border-glass)', background: '#090d16', height: '360px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <img src={product.imageUrl} alt={product.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>

          {/* Product Details & Actions */}
          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '20px' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <span className="badge badge-indigo">SKU: {product.sku}</span>
                <span className={`badge ${isOutOfStock ? 'badge-rose' : 'badge-emerald'}`}>
                  {isOutOfStock ? 'Hết hàng' : `Còn ${availableStock} SP Khả Dụng`}
                </span>
              </div>

              <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '8px' }}>
                {product.title}
              </h2>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem', color: '#fbbf24', marginBottom: '16px' }}>
                <Star size={16} fill="#fbbf24" color="#fbbf24" />
                <strong>{product.rating} / 5.0</strong>
                <span style={{ color: 'var(--text-dim)' }}>({product.reviewsCount} Đánh giá chất lượng)</span>
              </div>

              {/* Price */}
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px', marginBottom: '16px' }}>
                <span style={{ fontSize: '2.2rem', fontWeight: 800, color: '#4ade80' }}>
                  {product.price.toLocaleString()} ₫
                </span>
                {product.originalPrice > product.price && (
                  <span style={{ fontSize: '1.1rem', color: 'var(--text-dim)', textDecoration: 'line-through' }}>
                    {product.originalPrice.toLocaleString()} ₫
                  </span>
                )}
              </div>

              <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: 1.6, marginBottom: '20px' }}>
                {product.description}
              </p>

              {/* Real Multi-Warehouse Physical Stock Breakdown */}
              <div style={{ padding: '16px', borderRadius: '12px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-glass)', marginBottom: '20px' }}>
                <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <MapPin size={16} color="#38bdf8" /> Phân Bổ Tồn Kho Vật Lý Đa Kho (SOR):
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.88rem' }}>
                  {product.warehouses && product.warehouses.length > 0 ? (
                    product.warehouses.map((wh: WarehouseStock) => (
                      <div key={wh.warehouseCode} style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
                        <span>📍 {wh.warehouseName} ({wh.warehouseCode}):</span>
                        <strong style={{ color: '#38bdf8' }}>{wh.availableToSell} SP khả dụng</strong>
                      </div>
                    ))
                  ) : (
                    <div style={{ color: 'var(--text-dim)' }}>Đang đồng bộ số liệu tồn kho...</div>
                  )}
                </div>
              </div>

              {/* Quantity Counter */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
                <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: 600 }}>Số lượng:</span>
                <div style={{ display: 'flex', alignItems: 'center', border: '1px solid var(--border-glass)', borderRadius: '10px', overflow: 'hidden', background: 'rgba(255,255,255,0.05)' }}>
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    style={{ padding: '8px 12px', background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer' }}
                  >
                    <Minus size={16} />
                  </button>
                  <span style={{ padding: '0 16px', fontWeight: 800, fontSize: '1rem', color: 'var(--text-main)' }}>{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    style={{ padding: '8px 12px', background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer' }}
                  >
                    <Plus size={16} />
                  </button>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
              <button
                className="btn-secondary"
                style={{ padding: '14px', fontSize: '1rem', justifyContent: 'center' }}
                onClick={() => {
                  onAddToCart(product, quantity);
                  onClose();
                }}
                disabled={isOutOfStock}
              >
                <ShoppingCart size={20} /> Thêm Vào Giỏ
              </button>

              <button
                className="btn-primary"
                style={{ padding: '14px', fontSize: '1rem', justifyContent: 'center' }}
                onClick={() => {
                  onQuickBuy(product, quantity);
                  onClose();
                }}
                disabled={isOutOfStock}
              >
                Mua Ngay ({(product.price * quantity).toLocaleString()} ₫)
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
