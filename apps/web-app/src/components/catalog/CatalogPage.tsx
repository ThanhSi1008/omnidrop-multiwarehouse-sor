import React, { useState, useMemo } from 'react';
import { ProductItem } from '../../types';
import { ProductCard } from './ProductCard';
import { SlidersHorizontal, LayoutGrid, List, Search, ChevronRight, Home } from 'lucide-react';

interface CatalogPageProps {
  products: ProductItem[];
  onSelectProduct: (product: ProductItem) => void;
  onAddToCart: (product: ProductItem) => void;
  onQuickBuy: (product: ProductItem) => void;
  flashSaleStock: number;
  activeCategory: string;
  setActiveCategory: (cat: string) => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
}

export const CatalogPage: React.FC<CatalogPageProps> = ({
  products,
  onSelectProduct,
  onAddToCart,
  onQuickBuy,
  flashSaleStock,
  activeCategory,
  setActiveCategory,
  searchQuery,
  setSearchQuery,
}) => {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<'featured' | 'price_low' | 'price_high' | 'rating'>('featured');
  const [onlyInStock, setOnlyInStock] = useState<boolean>(false);
  const [maxPrice, setMaxPrice] = useState<number>(1200000);
  const [activeSubTag, setActiveSubTag] = useState<string>('all');

  // Filter & Sort Processing
  const filteredProducts = useMemo(() => {
    let result = products.filter((p) => {
      const matchesSearch =
        p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.sku.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = activeCategory === 'all' || p.category === activeCategory;
      const matchesPrice = p.price <= maxPrice;
      const stock = p.category === 'flash_sale' ? flashSaleStock : p.totalAts;
      const matchesStock = !onlyInStock || stock > 0;

      return matchesSearch && matchesCategory && matchesPrice && matchesStock;
    });

    if (sortBy === 'price_low') {
      result.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price_high') {
      result.sort((a, b) => b.price - a.price);
    } else if (sortBy === 'rating') {
      result.sort((a, b) => b.rating - a.rating);
    }

    return result;
  }, [products, searchQuery, activeCategory, maxPrice, onlyInStock, sortBy, flashSaleStock]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* Owen Style Breadcrumbs */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.82rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
        <span style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
          <Home size={14} /> TRANG CHỦ
        </span>
        <ChevronRight size={14} />
        <span style={{ color: '#fff', fontWeight: 700 }}>CỬA HÀNG QUẦN ÁO</span>
      </div>

      {/* Owen Style Filter Pills Tag Sub-Bar */}
      <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }}>
        {[
          { id: 'all', label: 'TẤT CẢ QUẦN ÁO' },
          { id: 'new', label: '✨ HÀNG MỚI VỀ' },
          { id: 'collection', label: '🖼️ BỘ SƯU TẬP 2026' },
          { id: 'best_price', label: '🏷️ GIÁ TỐT' },
          { id: 'polo', label: '👕 ÁO POLO' },
          { id: 'hoodie', label: '🧥 ÁO HOODIE' },
          { id: 'shirts', label: '👔 ÁO SƠ MI' },
          { id: 'pants', label: '👖 QUẦN KHAKI' },
        ].map((tag) => (
          <button
            key={tag.id}
            onClick={() => setActiveSubTag(tag.id)}
            style={{
              padding: '8px 16px',
              borderRadius: '20px',
              border: activeSubTag === tag.id ? '1px solid var(--accent-primary)' : '1px solid var(--border-glass)',
              background: activeSubTag === tag.id ? 'var(--accent-primary)' : 'rgba(255,255,255,0.03)',
              color: '#fff',
              fontWeight: activeSubTag === tag.id ? 700 : 500,
              fontSize: '0.82rem',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              transition: 'all 0.2s ease',
            }}
          >
            {tag.label}
          </button>
        ))}
      </div>

      {/* Main Layout Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: '32px', marginTop: '8px' }}>
        
        {/* Left Filter Sidebar */}
        <aside className="glass-card" style={{ padding: '24px', height: 'fit-content', display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-glass)', paddingBottom: '12px' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px', textTransform: 'uppercase' }}>
              <SlidersHorizontal size={18} color="#818cf8" /> BỘ LỌC QUẦN ÁO
            </h3>
            <button
              onClick={() => {
                setActiveCategory('all');
                setSearchQuery('');
                setOnlyInStock(false);
                setMaxPrice(1200000);
                setActiveSubTag('all');
              }}
              style={{ background: 'transparent', border: 'none', color: '#818cf8', fontSize: '0.8rem', cursor: 'pointer' }}
            >
              Xóa Lọc
            </button>
          </div>

          {/* Categories Filter */}
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '10px' }}>Danh Mục Thời Trang</label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {[
                { id: 'all', label: 'Tất Cả Quần Áo' },
                { id: 'flash_sale', label: '⚡ Flash Sale Áo Polo' },
                { id: 'apparel', label: '🧥 Áo Hoodie & Sweater' },
                { id: 'bundles', label: '🎁 Combo Quà Tặng Fashion' },
              ].map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  style={{
                    padding: '8px 12px',
                    borderRadius: '8px',
                    border: 'none',
                    textAlign: 'left',
                    background: activeCategory === cat.id ? 'rgba(99, 102, 241, 0.15)' : 'transparent',
                    color: activeCategory === cat.id ? '#818cf8' : 'var(--text-muted)',
                    fontWeight: activeCategory === cat.id ? 700 : 500,
                    fontSize: '0.88rem',
                    cursor: 'pointer',
                  }}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Price Slider */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', fontWeight: 700, marginBottom: '8px' }}>
              <span>Giá Tối Đa:</span>
              <span style={{ color: '#4ade80' }}>{maxPrice.toLocaleString()} ₫</span>
            </div>
            <input
              type="range"
              min="300000"
              max="1200000"
              step="50000"
              value={maxPrice}
              onChange={(e) => setMaxPrice(Number(e.target.value))}
              style={{ width: '100%', accentColor: 'var(--accent-primary)', cursor: 'pointer' }}
            />
          </div>

          {/* In Stock Toggle */}
          <label style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.88rem', color: 'var(--text-main)', cursor: 'pointer' }}>
            <input type="checkbox" checked={onlyInStock} onChange={(e) => setOnlyInStock(e.target.checked)} style={{ accentColor: 'var(--accent-primary)', width: '16px', height: '16px' }} />
            <span>Chỉ hiện mẫu còn hàng</span>
          </label>
        </aside>

        {/* Catalog Control Bar & Grid */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Top Controls */}
          <div className="glass-card" style={{ padding: '14px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
            <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
              Hiển thị <strong style={{ color: '#fff' }}>{filteredProducts.length}</strong> mẫu quần áo khả dụng
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                <span>Sắp xếp:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  style={{ padding: '6px 12px', borderRadius: '8px', background: '#1e293b', border: '1px solid var(--border-glass)', color: '#fff', fontSize: '0.85rem' }}
                >
                  <option value="featured">Nổi Bật Nhất</option>
                  <option value="price_low">Giá: Thấp đến Cao</option>
                  <option value="price_high">Giá: Cao đến Thấp</option>
                  <option value="rating">Đánh Giá Cao Nhất</option>
                </select>
              </div>

              <div style={{ display: 'flex', background: 'rgba(255,255,255,0.05)', padding: '2px', borderRadius: '8px', border: '1px solid var(--border-glass)' }}>
                <button
                  onClick={() => setViewMode('grid')}
                  style={{ padding: '6px 10px', borderRadius: '6px', border: 'none', background: viewMode === 'grid' ? 'var(--accent-primary)' : 'transparent', color: '#fff', cursor: 'pointer' }}
                >
                  <LayoutGrid size={16} />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  style={{ padding: '6px 10px', borderRadius: '6px', border: 'none', background: viewMode === 'list' ? 'var(--accent-primary)' : 'transparent', color: '#fff', cursor: 'pointer' }}
                >
                  <List size={16} />
                </button>
              </div>
            </div>
          </div>

          {/* Products List */}
          {filteredProducts.length === 0 ? (
            <div className="glass-card" style={{ padding: '60px', textAlign: 'center', color: 'var(--text-muted)' }}>
              <Search size={48} color="var(--text-dim)" style={{ marginBottom: '16px' }} />
              <h3>Không tìm thấy mẫu quần áo phù hợp</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-dim)', marginTop: '6px' }}>Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: viewMode === 'grid' ? 'repeat(auto-fill, minmax(280px, 1fr))' : '1fr', gap: '24px' }}>
              {filteredProducts.map((product) => (
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
          )}
        </div>

      </div>

    </div>
  );
};
