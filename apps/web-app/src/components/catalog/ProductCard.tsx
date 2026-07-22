import React from 'react';
import { ProductItem } from '../../types';
import { Star, ShoppingCart, Flame } from 'lucide-react';

interface ProductCardProps {
  product: ProductItem;
  flashSaleStock: number;
  onSelectProduct: (product: ProductItem) => void;
  onAddToCart: (product: ProductItem) => void;
  onQuickBuy: (product: ProductItem) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  flashSaleStock,
  onSelectProduct,
  onAddToCart,
  onQuickBuy,
}) => {
  const isFlashSale = product.category === 'flash_sale';
  const currentStock = isFlashSale ? flashSaleStock : product.totalAts;
  const isOutOfStock = currentStock <= 0;

  return (
    <div
      className="glass-card"
      style={{
        borderRadius: '16px',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        transition: 'transform 0.3s ease, border-color 0.3s ease',
        border: isFlashSale ? '1px solid rgba(244, 63, 94, 0.4)' : '1px solid var(--border-glass)',
      }}
    >
      {/* Product Image Box */}
      <div
        style={{
          height: '240px',
          position: 'relative',
          overflow: 'hidden',
          background: '#090d16',
          cursor: 'pointer',
        }}
        onClick={() => onSelectProduct(product)}
      >
        <img
          src={product.imageUrl}
          alt={product.title}
          style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.5s ease' }}
          onMouseOver={(e) => (e.currentTarget.style.transform = 'scale(1.06)')}
          onMouseOut={(e) => (e.currentTarget.style.transform = 'scale(1)')}
        />

        {/* Badges Overlay */}
        <div style={{ position: 'absolute', top: '12px', left: '12px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {isFlashSale && (
            <span className="badge badge-rose" style={{ boxShadow: '0 4px 12px rgba(244,63,94,0.4)' }}>
              <Flame size={12} fill="#f43f5e" /> Flash Sale -50%
            </span>
          )}
          {product.badge && !isFlashSale && <span className="badge badge-indigo">{product.badge}</span>}
        </div>

        {/* Stock Status Tag */}
        <div style={{ position: 'absolute', bottom: '12px', right: '12px' }}>
          <span className={`badge ${isOutOfStock ? 'badge-rose' : 'badge-emerald'}`}>
            {isOutOfStock ? 'Hết hàng' : `Còn ${currentStock} SP`}
          </span>
        </div>
      </div>

      {/* Product Info Content */}
      <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px', flex: 1, justifyContent: 'space-between' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem', color: '#fbbf24', marginBottom: '4px' }}>
            <Star size={14} fill="#fbbf24" color="#fbbf24" />
            <strong>{product.rating}</strong>
            <span style={{ color: 'var(--text-dim)' }}>({product.reviewsCount} đánh giá)</span>
          </div>

          <h3
            style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-main)', cursor: 'pointer', lineHeight: 1.4 }}
            onClick={() => onSelectProduct(product)}
          >
            {product.title}
          </h3>

          <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)', marginTop: '6px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
            {product.description}
          </p>
        </div>

        {/* Price & Add to Cart Actions */}
        <div style={{ paddingTop: '12px', borderTop: '1px solid var(--border-glass)' }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginBottom: '14px' }}>
            <span style={{ fontSize: '1.35rem', fontWeight: 800, color: '#4ade80' }}>
              {product.price.toLocaleString()} ₫
            </span>
            {product.originalPrice > product.price && (
              <span style={{ fontSize: '0.9rem', color: 'var(--text-dim)', textDecoration: 'line-through' }}>
                {product.originalPrice.toLocaleString()} ₫
              </span>
            )}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <button
              className="btn-secondary"
              style={{ padding: '10px', fontSize: '0.85rem', justifyContent: 'center' }}
              onClick={() => onAddToCart(product)}
              disabled={isOutOfStock}
            >
              <ShoppingCart size={16} /> Thêm Giỏ
            </button>

            <button
              className="btn-primary"
              style={{ padding: '10px', fontSize: '0.85rem', justifyContent: 'center' }}
              onClick={() => onQuickBuy(product)}
              disabled={isOutOfStock}
            >
              Mua Ngay
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
