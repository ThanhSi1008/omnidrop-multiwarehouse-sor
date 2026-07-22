import React, { useState } from 'react';
import { ProductItem } from './types';
import { CartProvider, useCart } from './context/CartContext';
import { ToastProvider, useToast } from './context/ToastContext';
import { AuthProvider } from './context/AuthContext';
import { useProducts } from './hooks/useProducts';
import { useSseStock } from './hooks/useSseStock';
import { HeaderNav } from './components/navigation/HeaderNav';
import { HomePage } from './components/home/HomePage';
import { CatalogPage } from './components/catalog/CatalogPage';
import { ProductDetailPage } from './components/catalog/ProductDetailPage';
import { CartDrawer } from './components/checkout/CartDrawer';
import { CheckoutPage } from './components/checkout/CheckoutPage';
import { OrderHistoryModal } from './components/orders/OrderHistoryModal';
import { AuthModal } from './components/auth/AuthModal';
import { UserProfileModal } from './components/auth/UserProfileModal';
import { StoreLocatorModal } from './components/common/StoreLocatorModal';
import { AdminPortal } from './components/admin/AdminPortal';

function StorefrontContent() {
  const [activeTab, setActiveTab] = useState<'storefront' | 'admin'>('storefront');
  const [activeView, setActiveView] = useState<'home' | 'shop' | 'product_detail' | 'checkout'>('home');
  const [selectedProduct, setSelectedProduct] = useState<ProductItem | null>(null);
  const [isOrdersOpen, setIsOrdersOpen] = useState<boolean>(false);
  const [isStoreLocatorOpen, setIsStoreLocatorOpen] = useState<boolean>(false);

  // Custom Hooks
  const {
    products,
    allProducts,
    searchQuery,
    setSearchQuery,
    activeCategory,
    setActiveCategory,
    refillStock,
    refillLoading,
  } = useProducts();

  const { stock: flashSaleStock } = useSseStock('KINH-X-DEN-SIZE-M', 10);
  const { addToCart } = useCart();
  const { showToast } = useToast();

  const handleRefill = async () => {
    const success = await refillStock('KINH-X-DEN-SIZE-M', 10);
    if (success) {
      showToast('⚡ Nạp lại 10 SP Flash Sale vào Redis & mở lại lượt mua thành công!');
    } else {
      showToast('Nạp lại tồn kho thất bại', 'error');
    }
  };

  const handleAddToCart = (product: ProductItem, qty: number = 1) => {
    addToCart(product, qty);
    showToast(`Đã thêm ${qty}x ${product.title} vào giỏ hàng!`);
  };

  const handleQuickBuy = (product: ProductItem, qty: number = 1) => {
    addToCart(product, qty);
    setActiveView('checkout');
  };

  const handleSelectProduct = (product: ProductItem) => {
    setSelectedProduct(product);
    setActiveView('product_detail');
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-dark)', color: 'var(--text-main)', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <HeaderNav
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        activeView={activeView}
        setActiveView={setActiveView}
        openOrders={() => setIsOrdersOpen(true)}
        openStoreLocator={() => setIsStoreLocatorOpen(true)}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        activeCategory={activeCategory}
        setActiveCategory={setActiveCategory}
      />

      {/* Main Content Router */}
      <main style={{ maxWidth: '1280px', margin: '0 auto', width: '100%', padding: '32px 24px', flex: 1 }}>
        {activeTab === 'admin' ? (
          <AdminPortal />
        ) : activeView === 'checkout' ? (
          <CheckoutPage
            onBackToStore={() => setActiveView('shop')}
            onOrderSuccess={() => {
              setActiveView('shop');
              setIsOrdersOpen(true);
            }}
          />
        ) : activeView === 'product_detail' && selectedProduct ? (
          <ProductDetailPage
            product={selectedProduct}
            allProducts={allProducts}
            flashSaleStock={flashSaleStock}
            onBack={() => setActiveView('shop')}
            onAddToCart={handleAddToCart}
            onQuickBuy={handleQuickBuy}
            onSelectProduct={handleSelectProduct}
          />
        ) : activeView === 'shop' ? (
          <CatalogPage
            products={products}
            onSelectProduct={handleSelectProduct}
            onAddToCart={(p) => handleAddToCart(p, 1)}
            onQuickBuy={(p) => handleQuickBuy(p, 1)}
            flashSaleStock={flashSaleStock}
            activeCategory={activeCategory}
            setActiveCategory={setActiveCategory}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
          />
        ) : (
          <HomePage
            products={allProducts}
            onSelectProduct={handleSelectProduct}
            onAddToCart={(p) => handleAddToCart(p, 1)}
            onQuickBuy={(p) => handleQuickBuy(p, 1)}
            flashSaleStock={flashSaleStock}
            onRefillStock={handleRefill}
            refillLoading={refillLoading}
            onNavigateShop={() => setActiveView('shop')}
            onSelectCategory={(cat) => {
              setActiveCategory(cat);
              setActiveView('shop');
            }}
            openStoreLocator={() => setIsStoreLocatorOpen(true)}
          />
        )}
      </main>

      {/* Footer */}
      <footer style={{ borderTop: '1px solid var(--border-glass)', background: 'rgba(9, 13, 22, 0.95)', padding: '28px', textAlign: 'center', fontSize: '0.85rem', color: 'var(--text-dim)' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            © 2026 <strong>Omnidrop Store</strong> (Inspired by TopZone, Owen, Kính Mắt Anna). Smart Order Routing Engine.
          </div>
          <div style={{ display: 'flex', gap: '16px' }}>
            <span>⚡ TopZone Layout</span>
            <span>👕 Owen Fashion</span>
            <span>🕶️ Kính Mắt Anna</span>
          </div>
        </div>
      </footer>

      {/* Cart Drawer */}
      <CartDrawer onProceedToCheckout={() => setActiveView('checkout')} />

      {/* Order History Modal */}
      <OrderHistoryModal isOpen={isOrdersOpen} onClose={() => setIsOrdersOpen(false)} />

      {/* Customer Auth Modal */}
      <AuthModal />

      {/* User Profile Edit Modal */}
      <UserProfileModal />

      {/* Store Locator Modal */}
      <StoreLocatorModal isOpen={isStoreLocatorOpen} onClose={() => setIsStoreLocatorOpen(false)} />
    </div>
  );
}

export function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <CartProvider>
          <StorefrontContent />
        </CartProvider>
      </ToastProvider>
    </AuthProvider>
  );
}

export default App;
