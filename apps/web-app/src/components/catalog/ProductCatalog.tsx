import React from 'react';
import { ProductItem } from '../../types';
import { HeroBanner } from './HeroBanner';
import { ProductCard } from './ProductCard';

interface ProductCatalogProps {
  products: ProductItem[];
  onSelectProduct: (product: ProductItem) => void;
  onAddToCart: (product: ProductItem) => void;
  onQuickBuy: (product: ProductItem) => void;
  flashSaleStock: number;
  onRefillStock: () => void;
  refillLoading: boolean;
}

export const ProductCatalog: React.FC<ProductCatalogProps> = ({
  products,
  onSelectProduct,
  onAddToCart,
  onQuickBuy,
  flashSaleStock,
  onRefillStock,
  refillLoading,
}) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      {/* Hero Banner Section */}
      <HeroBanner
        flashSaleStock={flashSaleStock}
        onRefillStock={onRefillStock}
        refillLoading={refillLoading}
      />

      {/* Product Grid Section */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-main)' }}>
            Danh Mục Sản Phẩm Đang Mở Bán ({products.length})
          </h2>
          <span style={{ fontSize: '0.88rem', color: 'var(--text-dim)' }}>
            Hiển thị tồn kho ATS realtime từ PostgreSQL & Redis
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '24px' }}>
          {products.map((product) => (
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
    </div>
  );
};
