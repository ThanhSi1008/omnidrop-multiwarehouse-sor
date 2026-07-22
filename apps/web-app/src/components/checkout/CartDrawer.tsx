import React, { useState } from 'react';
import { useCart } from '../../context/CartContext';
import { useToast } from '../../context/ToastContext';
import { X, ShoppingCart, Trash2, Plus, Minus, ArrowRight } from 'lucide-react';

interface CartDrawerProps {
  onProceedToCheckout: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({ onProceedToCheckout }) => {
  const {
    cartItems,
    isCartOpen,
    setIsCartOpen,
    updateQuantity,
    removeFromCart,
    subtotal,
    discount,
    finalTotal,
    applyVoucher,
  } = useCart();
  const { showToast } = useToast();

  const [voucherCode, setVoucherCode] = useState<string>('');

  if (!isCartOpen) return null;

  const handleApplyVoucher = (e: React.FormEvent) => {
    e.preventDefault();
    if (!voucherCode.trim()) return;
    const res = applyVoucher(voucherCode);
    showToast(res.message, res.success ? 'success' : 'error');
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)', zIndex: 1000, display: 'flex', justifyContent: 'flex-end' }}>
      <div
        className="glass-card"
        style={{
          width: '100%',
          maxWidth: '460px',
          height: '100%',
          borderRadius: 0,
          padding: '24px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          background: '#090d16',
          borderLeft: '1px solid var(--border-glass)',
        }}
      >
        {/* Cart Header */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', paddingBottom: '16px', borderBottom: '1px solid var(--border-glass)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <ShoppingCart size={22} color="#818cf8" />
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Giỏ Hàng Của Bạn ({cartItems.length})</h2>
            </div>
            <button onClick={() => setIsCartOpen(false)} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
              <X size={22} />
            </button>
          </div>

          {/* Cart Items List */}
          {cartItems.length === 0 ? (
            <div style={{ padding: '60px 20px', textAlign: 'center', color: 'var(--text-muted)' }}>
              <ShoppingCart size={48} color="var(--text-dim)" style={{ marginBottom: '16px' }} />
              <p style={{ fontSize: '1rem', fontWeight: 600 }}>Giỏ hàng của bạn đang trống</p>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-dim)', marginTop: '6px' }}>Hãy chọn thêm sản phẩm vào giỏ để bắt đầu đặt hàng!</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxHeight: '55vh', overflowY: 'auto', paddingRight: '4px' }}>
              {cartItems.map((item) => (
                <div key={item.product.sku} style={{ display: 'flex', gap: '14px', padding: '12px', borderRadius: '12px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-glass)' }}>
                  <img src={item.product.imageUrl} alt={item.product.title} style={{ width: '70px', height: '70px', objectFit: 'cover', borderRadius: '8px' }} />

                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-main)', lineHeight: 1.3 }}>{item.product.title}</h4>
                        <button onClick={() => removeFromCart(item.product.sku)} style={{ background: 'transparent', border: 'none', color: '#f87171', cursor: 'pointer', padding: '2px' }}>
                          <Trash2 size={16} />
                        </button>
                      </div>
                      <span className="font-mono" style={{ fontSize: '0.78rem', color: 'var(--text-dim)' }}>SKU: {item.product.sku}</span>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px' }}>
                      <span style={{ fontWeight: 800, color: '#4ade80', fontSize: '0.95rem' }}>
                        {(item.product.price * item.quantity).toLocaleString()} ₫
                      </span>

                      <div style={{ display: 'flex', alignItems: 'center', border: '1px solid var(--border-glass)', borderRadius: '6px', overflow: 'hidden', background: 'rgba(255,255,255,0.05)' }}>
                        <button onClick={() => updateQuantity(item.product.sku, -1)} style={{ padding: '2px 6px', background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer' }}>
                          <Minus size={12} />
                        </button>
                        <span style={{ padding: '0 8px', fontSize: '0.82rem', fontWeight: 700 }}>{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.product.sku, 1)} style={{ padding: '2px 6px', background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer' }}>
                          <Plus size={12} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Cart Footer Summary & Checkout Action */}
        {cartItems.length > 0 && (
          <div style={{ paddingTop: '16px', borderTop: '1px solid var(--border-glass)', display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {/* Voucher Promo Input */}
            <form onSubmit={handleApplyVoucher} style={{ display: 'flex', gap: '8px' }}>
              <input
                type="text"
                placeholder="Nhập mã voucher (OMNI50)"
                value={voucherCode}
                onChange={(e) => setVoucherCode(e.target.value)}
                style={{ flex: 1, padding: '8px 12px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-glass)', color: '#fff', fontSize: '0.85rem' }}
              />
              <button type="submit" className="btn-secondary" style={{ padding: '8px 14px', fontSize: '0.82rem' }}>
                Áp Dụng
              </button>
            </form>

            {/* Total Calculations */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Tạm tính:</span>
                <span>{subtotal.toLocaleString()} ₫</span>
              </div>
              {discount > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#4ade80' }}>
                  <span>Giảm giá:</span>
                  <span>-{discount.toLocaleString()} ₫</span>
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-main)', marginTop: '4px' }}>
                <span>Tổng tiền:</span>
                <span style={{ color: '#4ade80' }}>{finalTotal.toLocaleString()} ₫</span>
              </div>
            </div>

            <button
              className="btn-primary"
              style={{ width: '100%', padding: '14px', fontSize: '1rem', justifyContent: 'center' }}
              onClick={() => {
                setIsCartOpen(false);
                onProceedToCheckout();
              }}
            >
              Tiến Hành Thanh Toán <ArrowRight size={18} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
