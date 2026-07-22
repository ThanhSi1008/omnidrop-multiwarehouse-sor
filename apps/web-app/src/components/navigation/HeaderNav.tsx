import React from 'react';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { Zap, Shield, ShoppingCart, Search, Clock, Sparkles, User, Home, Store, MapPin, ChevronLeft, ChevronRight } from 'lucide-react';

interface HeaderNavProps {
  activeTab: 'storefront' | 'admin';
  setActiveTab: (tab: 'storefront' | 'admin') => void;
  activeView: 'home' | 'shop' | 'product_detail' | 'checkout';
  setActiveView: (view: 'home' | 'shop' | 'product_detail' | 'checkout') => void;
  openOrders: () => void;
  openStoreLocator: () => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  activeCategory: string;
  setActiveCategory: (cat: string) => void;
}

export const HeaderNav: React.FC<HeaderNavProps> = ({
  activeTab,
  setActiveTab,
  activeView,
  setActiveView,
  openOrders,
  openStoreLocator,
  searchQuery,
  setSearchQuery,
  activeCategory,
  setActiveCategory,
}) => {
  const { cartCount, setIsCartOpen } = useCart();
  const { user, isAuthenticated, setIsAuthModalOpen, logout } = useAuth();

  return (
    <header
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 50,
        background: 'rgba(9, 13, 22, 0.95)',
        backdropFilter: 'blur(18px)',
        borderBottom: '1px solid var(--border-glass)',
      }}
    >
      {/* Top Announcement Bar */}
      <div
        style={{
          background: 'linear-gradient(90deg, #0d9488 0%, #06b6d4 50%, #6366f1 100%)',
          padding: '6px 16px',
          textAlign: 'center',
          fontSize: '0.82rem',
          fontWeight: 700,
          color: '#fff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '12px',
        }}
      >
        <ChevronLeft size={14} style={{ cursor: 'pointer' }} />
        <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Sparkles size={14} /> ⚡ ĐẠI TIỆC FASHION SALE 50% - FREESHIP TOÀN QUỐC CHO ĐƠN HÀNG TỪ 500.000 ₫
        </span>
        <ChevronRight size={14} style={{ cursor: 'pointer' }} />
      </div>

      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '14px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        
        {/* Brand Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }} onClick={() => { setActiveTab('storefront'); setActiveView('home'); }}>
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #06b6d4 0%, #6366f1 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 14px rgba(6, 182, 212, 0.4)',
              }}
            >
              <Zap size={24} color="#fff" />
            </div>
            <div>
              <div style={{ fontSize: '1.35rem', fontWeight: 900, letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span className="gradient-text">OMNIDROP</span>
                <span style={{ fontSize: '0.68rem', fontWeight: 800, color: '#38bdf8', padding: '2px 8px', borderRadius: '12px', background: 'rgba(56, 189, 248, 0.15)', border: '1px solid rgba(56, 189, 248, 0.3)' }}>FASHION</span>
              </div>
            </div>
          </div>

          {/* Main Links */}
          {activeTab === 'storefront' && (
            <nav style={{ display: 'flex', gap: '6px' }}>
              <button
                onClick={() => setActiveView('home')}
                style={{
                  padding: '8px 12px',
                  borderRadius: '8px',
                  border: 'none',
                  background: activeView === 'home' ? 'rgba(99, 102, 241, 0.15)' : 'transparent',
                  color: activeView === 'home' ? '#818cf8' : 'var(--text-muted)',
                  fontWeight: activeView === 'home' ? 700 : 500,
                  fontSize: '0.88rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <Home size={16} /> Trang Chủ
              </button>

              <button
                onClick={() => setActiveView('shop')}
                style={{
                  padding: '8px 12px',
                  borderRadius: '8px',
                  border: 'none',
                  background: activeView === 'shop' ? 'rgba(99, 102, 241, 0.15)' : 'transparent',
                  color: activeView === 'shop' ? '#818cf8' : 'var(--text-muted)',
                  fontWeight: activeView === 'shop' ? 700 : 500,
                  fontSize: '0.88rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <Store size={16} /> Bộ Sưu Tập Quần Áo
              </button>

              <button
                onClick={openStoreLocator}
                style={{
                  padding: '8px 12px',
                  borderRadius: '8px',
                  border: 'none',
                  background: 'transparent',
                  color: 'var(--text-muted)',
                  fontWeight: 500,
                  fontSize: '0.88rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <MapPin size={16} color="#38bdf8" /> Tìm Cửa Hàng
              </button>
            </nav>
          )}
        </div>

        {/* Search Bar */}
        <div style={{ flex: 1, maxWidth: '320px', position: 'relative' }}>
          <Search size={18} color="var(--text-dim)" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
          <input
            type="text"
            placeholder="Tìm áo polo, hoodie, quần khaki..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              if (activeView !== 'shop') setActiveView('shop');
            }}
            style={{
              width: '100%',
              padding: '10px 14px 10px 42px',
              borderRadius: '12px',
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid var(--border-glass)',
              color: '#fff',
              fontSize: '0.88rem',
            }}
          />
        </div>

        {/* Right Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {/* Admin Switcher */}
          <div style={{ display: 'flex', background: 'rgba(255,255,255,0.04)', padding: '3px', borderRadius: '12px', border: '1px solid var(--border-glass)' }}>
            <button
              onClick={() => setActiveTab('storefront')}
              style={{
                padding: '8px 12px',
                borderRadius: '9px',
                border: 'none',
                fontWeight: 700,
                fontSize: '0.82rem',
                cursor: 'pointer',
                background: activeTab === 'storefront' ? 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)' : 'transparent',
                color: activeTab === 'storefront' ? '#ffffff' : 'var(--text-muted)',
              }}
            >
              Cửa Hàng
            </button>

            <button
              onClick={() => setActiveTab('admin')}
              style={{
                padding: '8px 12px',
                borderRadius: '9px',
                border: 'none',
                fontWeight: 700,
                fontSize: '0.82rem',
                cursor: 'pointer',
                background: activeTab === 'admin' ? 'linear-gradient(135deg, #06b6d4 0%, #0284c7 100%)' : 'transparent',
                color: activeTab === 'admin' ? '#ffffff' : 'var(--text-muted)',
              }}
            >
              <Shield size={14} /> Admin
            </button>
          </div>

          {/* User Session */}
          {isAuthenticated && user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 12px', borderRadius: '10px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-glass)', fontSize: '0.85rem' }}>
              <span style={{ fontWeight: 700, color: '#4ade80' }}>👤 {user.fullName}</span>
              <button onClick={logout} style={{ background: 'transparent', border: 'none', color: '#f87171', fontSize: '0.78rem', cursor: 'pointer', marginLeft: '4px' }}>
                Thoát
              </button>
            </div>
          ) : (
            <button className="btn-secondary" style={{ padding: '8px 12px', fontSize: '0.82rem' }} onClick={() => setIsAuthModalOpen(true)}>
              <User size={15} /> Đăng Nhập
            </button>
          )}

          {/* Orders Button */}
          <button className="btn-secondary" style={{ padding: '8px 12px', fontSize: '0.82rem' }} onClick={openOrders}>
            <Clock size={15} color="#fbbf24" /> Đơn Hàng
          </button>

          {/* Cart Button */}
          <button
            className="btn-primary"
            style={{ padding: '8px 14px', fontSize: '0.85rem', position: 'relative' }}
            onClick={() => setIsCartOpen(true)}
          >
            <ShoppingCart size={16} />
            Giỏ Hàng
            {cartCount > 0 && (
              <span
                style={{
                  position: 'absolute',
                  top: '-6px',
                  right: '-6px',
                  background: '#f43f5e',
                  color: '#fff',
                  fontSize: '0.72rem',
                  fontWeight: 800,
                  width: '18px',
                  height: '18px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '2px solid #090d16',
                }}
              >
                {cartCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Apparel Sub-Category Navigation Bar */}
      {activeTab === 'storefront' && (
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', background: 'rgba(0,0,0,0.2)', padding: '8px 24px' }}>
          <div style={{ maxWidth: '1280px', margin: '0 auto', display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '2px' }}>
            {[
              { id: 'all', label: 'Tất Cả Quần Áo' },
              { id: 'flash_sale', label: '⚡ Flash Sale Áo Polo' },
              { id: 'apparel', label: '🧥 Áo Hoodie & Sweater' },
              { id: 'bundles', label: '🎁 Combo Quà Tặng Fashion' },
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => {
                  setActiveCategory(cat.id);
                  if (activeView !== 'shop') setActiveView('shop');
                }}
                style={{
                  padding: '6px 14px',
                  borderRadius: '20px',
                  border: activeCategory === cat.id ? '1px solid var(--accent-primary)' : '1px solid transparent',
                  background: activeCategory === cat.id ? 'rgba(99, 102, 241, 0.15)' : 'transparent',
                  color: activeCategory === cat.id ? '#818cf8' : 'var(--text-muted)',
                  fontWeight: activeCategory === cat.id ? 700 : 500,
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  transition: 'all 0.2s ease',
                }}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </header>
  );
};
