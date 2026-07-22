import React, { useState } from 'react';
import { ProductItem, WarehouseStock } from '../../types';
import { ProductCard } from './ProductCard';
import { ArrowLeft, Star, ShoppingCart, Truck, ShieldCheck, Clock, Plus, Minus, MapPin, Check } from 'lucide-react';

interface ProductDetailPageProps {
  product: ProductItem;
  allProducts: ProductItem[];
  flashSaleStock: number;
  onBack: () => void;
  onAddToCart: (product: ProductItem, quantity: number) => void;
  onQuickBuy: (product: ProductItem, quantity: number) => void;
  onSelectProduct: (product: ProductItem) => void;
}

export const ProductDetailPage: React.FC<ProductDetailPageProps> = ({
  product,
  allProducts,
  flashSaleStock,
  onBack,
  onAddToCart,
  onQuickBuy,
  onSelectProduct,
}) => {
  const [quantity, setQuantity] = useState<number>(1);
  const [selectedColor, setSelectedColor] = useState<string>('Đen Obsidian');
  const [selectedSize, setSelectedSize] = useState<string>('Size M');
  const [activeTab, setActiveTab] = useState<'desc' | 'specs' | 'reviews'>('desc');

  const isFlashSale = product.category === 'flash_sale';
  const availableStock = isFlashSale ? flashSaleStock : product.totalAts;
  const isOutOfStock = availableStock <= 0;

  // Filter related products
  const relatedProducts = allProducts.filter((p) => p.id !== product.id).slice(0, 3);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '36px' }}>
      
      {/* Top Back Navigation */}
      <div>
        <button className="btn-secondary" style={{ padding: '8px 14px', fontSize: '0.85rem' }} onClick={onBack}>
          <ArrowLeft size={16} /> Quay Lại Danh Mục Sản Phẩm
        </button>
      </div>

      {/* Main Product Showcase Grid */}
      <div className="glass-card" style={{ padding: '36px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '40px' }}>
        
        {/* Left Column: Product Gallery Image Box */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ borderRadius: '20px', overflow: 'hidden', border: '1px solid var(--border-glass)', background: '#090d16', height: '420px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <img src={product.imageUrl} alt={product.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>

          {/* Gallery Thumbnails */}
          <div style={{ display: 'flex', gap: '12px' }}>
            {[product.imageUrl, product.imageUrl, product.imageUrl].map((img, idx) => (
              <div
                key={idx}
                style={{
                  width: '80px',
                  height: '80px',
                  borderRadius: '12px',
                  overflow: 'hidden',
                  border: idx === 0 ? '2px solid var(--accent-primary)' : '1px solid var(--border-glass)',
                  cursor: 'pointer',
                  background: '#090d16',
                }}
              >
                <img src={img} alt="Thumbnail" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Specifications & Variant Options */}
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '24px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
              <span className="badge badge-indigo">SKU: {product.sku}</span>
              <span className={`badge ${isOutOfStock ? 'badge-rose' : 'badge-emerald'}`}>
                {isOutOfStock ? 'Hết hàng' : `Còn ${availableStock} SP Khả Dụng`}
              </span>
            </div>

            <h1 style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--text-main)', lineHeight: 1.2, marginBottom: '12px' }}>
              {product.title}
            </h1>

            {/* Rating Stars */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.95rem', color: '#fbbf24', marginBottom: '20px' }}>
              <Star size={18} fill="#fbbf24" color="#fbbf24" />
              <strong>{product.rating} / 5.0</strong>
              <span style={{ color: 'var(--text-dim)' }}>({product.reviewsCount} Đánh giá mua hàng)</span>
            </div>

            {/* Price Box */}
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '14px', marginBottom: '24px', padding: '16px 20px', borderRadius: '14px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-glass)' }}>
              <span style={{ fontSize: '2.6rem', fontWeight: 800, color: '#4ade80' }}>
                {product.price.toLocaleString()} ₫
              </span>
              {product.originalPrice > product.price && (
                <span style={{ fontSize: '1.2rem', color: 'var(--text-dim)', textDecoration: 'line-through' }}>
                  {product.originalPrice.toLocaleString()} ₫
                </span>
              )}
            </div>

            {/* Color Selector Pills */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '8px' }}>
                Màu Sắc: <span style={{ color: 'var(--text-main)' }}>{selectedColor}</span>
              </label>
              <div style={{ display: 'flex', gap: '10px' }}>
                {['Đen Obsidian', 'Trắng Silver', 'Xám Titan'].map((color) => (
                  <button
                    key={color}
                    onClick={() => setSelectedColor(color)}
                    style={{
                      padding: '8px 16px',
                      borderRadius: '10px',
                      border: selectedColor === color ? '2px solid var(--accent-primary)' : '1px solid var(--border-glass)',
                      background: selectedColor === color ? 'rgba(99, 102, 241, 0.15)' : 'rgba(255,255,255,0.03)',
                      color: selectedColor === color ? '#818cf8' : 'var(--text-muted)',
                      fontWeight: selectedColor === color ? 700 : 500,
                      fontSize: '0.88rem',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                    }}
                  >
                    {selectedColor === color && <Check size={14} />} {color}
                  </button>
                ))}
              </div>
            </div>

            {/* Size Selector Pills */}
            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '8px' }}>
                Kích Thước: <span style={{ color: 'var(--text-main)' }}>{selectedSize}</span>
              </label>
              <div style={{ display: 'flex', gap: '10px' }}>
                {['Size S', 'Size M', 'Size L', 'Freesize'].map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    style={{
                      padding: '8px 16px',
                      borderRadius: '10px',
                      border: selectedSize === size ? '2px solid var(--accent-primary)' : '1px solid var(--border-glass)',
                      background: selectedSize === size ? 'rgba(99, 102, 241, 0.15)' : 'rgba(255,255,255,0.03)',
                      color: selectedSize === size ? '#818cf8' : 'var(--text-muted)',
                      fontWeight: selectedSize === size ? 700 : 500,
                      fontSize: '0.88rem',
                      cursor: 'pointer',
                    }}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {/* Multi-Warehouse ATS Breakdown */}
            <div style={{ padding: '16px', borderRadius: '14px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-glass)', marginBottom: '24px' }}>
              <div style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
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
                  <div style={{ color: 'var(--text-dim)' }}>Đang kết nối cơ sở dữ liệu đa kho...</div>
                )}
              </div>
            </div>

            {/* Quantity Selector */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
              <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: 600 }}>Số lượng:</span>
              <div style={{ display: 'flex', alignItems: 'center', border: '1px solid var(--border-glass)', borderRadius: '10px', overflow: 'hidden', background: 'rgba(255,255,255,0.05)' }}>
                <button onClick={() => setQuantity(Math.max(1, quantity - 1))} style={{ padding: '10px 14px', background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer' }}>
                  <Minus size={16} />
                </button>
                <span style={{ padding: '0 20px', fontWeight: 800, fontSize: '1.05rem', color: 'var(--text-main)' }}>{quantity}</span>
                <button onClick={() => setQuantity(quantity + 1)} style={{ padding: '10px 14px', background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer' }}>
                  <Plus size={16} />
                </button>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <button
              className="btn-secondary"
              style={{ padding: '16px', fontSize: '1.05rem', justifyContent: 'center' }}
              onClick={() => onAddToCart(product, quantity)}
              disabled={isOutOfStock}
            >
              <ShoppingCart size={22} /> Thêm Vào Giỏ Hàng
            </button>

            <button
              className="btn-primary"
              style={{ padding: '16px', fontSize: '1.05rem', justifyContent: 'center' }}
              onClick={() => onQuickBuy(product, quantity)}
              disabled={isOutOfStock}
            >
              MUA NGAY ({(product.price * quantity).toLocaleString()} ₫)
            </button>
          </div>

        </div>
      </div>

      {/* Tabs Section: Description, Specs, Reviews */}
      <div className="glass-card" style={{ padding: '32px' }}>
        <div style={{ display: 'flex', gap: '16px', borderBottom: '1px solid var(--border-glass)', paddingBottom: '16px', marginBottom: '24px' }}>
          <button
            onClick={() => setActiveTab('desc')}
            style={{
              padding: '8px 16px',
              borderRadius: '8px',
              border: 'none',
              fontWeight: 700,
              fontSize: '0.95rem',
              cursor: 'pointer',
              background: activeTab === 'desc' ? 'var(--accent-primary)' : 'transparent',
              color: activeTab === 'desc' ? '#fff' : 'var(--text-muted)',
            }}
          >
            Mô Tả Sản Phẩm
          </button>
          <button
            onClick={() => setActiveTab('specs')}
            style={{
              padding: '8px 16px',
              borderRadius: '8px',
              border: 'none',
              fontWeight: 700,
              fontSize: '0.95rem',
              cursor: 'pointer',
              background: activeTab === 'specs' ? 'var(--accent-primary)' : 'transparent',
              color: activeTab === 'specs' ? '#fff' : 'var(--text-muted)',
            }}
          >
            Thông Số Kỹ Thuật
          </button>
          <button
            onClick={() => setActiveTab('reviews')}
            style={{
              padding: '8px 16px',
              borderRadius: '8px',
              border: 'none',
              fontWeight: 700,
              fontSize: '0.95rem',
              cursor: 'pointer',
              background: activeTab === 'reviews' ? 'var(--accent-primary)' : 'transparent',
              color: activeTab === 'reviews' ? '#fff' : 'var(--text-muted)',
            }}
          >
            Đánh Giá Khách Hàng (128)
          </button>
        </div>

        {activeTab === 'desc' && (
          <div style={{ fontSize: '0.95rem', color: 'var(--text-muted)', lineHeight: 1.7 }}>
            <p>{product.description}</p>
            <p style={{ marginTop: '12px' }}>
              Sản phẩm được cắt may tỉ mỉ với tiêu chuẩn chất lượng xuất khẩu Châu Âu. Sử dụng sợi vải Cotton tự nhiên co giãn 4 chiều mềm mịn, thấm hút mồ hôi tốt mang lại sự thoải mái tuyệt đối khi mặc.
            </p>
          </div>
        )}

        {activeTab === 'specs' && (
          <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr', gap: '12px', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
            <strong>Mã SKU:</strong> <span>{product.sku}</span>
            <strong>Chất liệu vải:</strong> <span>100% Cotton Premium / Bamboo chống nhăn</span>
            <strong>Kiểu dáng:</strong> <span>Slim-Fit / Oversized Châu Âu</span>
            <strong>Xuất xứ:</strong> <span>Omnidrop Fashion Brand Vietnam</span>
          </div>
        )}

        {activeTab === 'reviews' && (
          <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
            <p>⭐ 4.9/5.0 từ 128 khách hàng đã mua sản phẩm.</p>
          </div>
        )}
      </div>

      {/* Related Products Carousel */}
      <div>
        <h2 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '20px' }}>
          Sản Phẩm Tương Tự Có Thể Bạn Thích
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '24px' }}>
          {relatedProducts.map((p) => (
            <ProductCard
              key={p.id}
              product={p}
              flashSaleStock={flashSaleStock}
              onSelectProduct={onSelectProduct}
              onAddToCart={(item) => onAddToCart(item, 1)}
              onQuickBuy={(item) => onQuickBuy(item, 1)}
            />
          ))}
        </div>
      </div>

    </div>
  );
};
