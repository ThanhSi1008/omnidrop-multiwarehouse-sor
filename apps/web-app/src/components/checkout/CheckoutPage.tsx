import React, { useState } from 'react';
import { useCart } from '../../context/CartContext';
import { useToast } from '../../context/ToastContext';
import { createPurchaseApi } from '../../services/api';
import { Truck, QrCode, MapPin, ArrowLeft, CreditCard } from 'lucide-react';

interface CheckoutPageProps {
  onBackToStore: () => void;
  onOrderSuccess: (orderId: string) => void;
}

export const CheckoutPage: React.FC<CheckoutPageProps> = ({ onBackToStore, onOrderSuccess }) => {
  const { cartItems, subtotal, discount, finalTotal, clearCart } = useCart();
  const { showToast } = useToast();

  const [loading, setLoading] = useState<boolean>(false);

  // Customer Form State
  const [fullName, setFullName] = useState<string>('Nguyễn Văn An');
  const [phone, setPhone] = useState<string>('0987654321');
  const [userId] = useState<string>(`khach_hang_${Math.floor(1000 + Math.random() * 9000)}`);
  const [province, setProvince] = useState<string>('Hanoi');
  const [district, setDistrict] = useState<string>('Cầu Giấy');
  const [detailAddress, setDetailAddress] = useState<string>('8 Tôn Thất Thuyết');
  const [paymentMethod, setPaymentMethod] = useState<string>('VIETQR_ONLINE');

  const shippingFee = 30000;
  const totalAmount = finalTotal + shippingFee;

  // SOR Warehouse prediction
  const predictedWarehouse =
    province.toLowerCase().includes('hcm') || province.toLowerCase().includes('ho chi minh') || province.toLowerCase().includes('nam')
      ? 'KHO_HCM (Miền Nam - TP. Hồ Chí Minh)'
      : 'KHO_HN (Miền Bắc - Hà Nội)';

  const handleCheckoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cartItems.length === 0) return;

    setLoading(true);

    const firstItem = cartItems[0];

    try {
      const data = await createPurchaseApi({
        userId,
        sku: firstItem.product.sku,
        campaignId: 'flash_sale_summer',
        quantity: firstItem.quantity,
        paymentMethod,
        deliveryAddress: {
          province,
          district,
          detailAddress: `${fullName} (${phone}) - ${detailAddress}`,
        },
      });

      showToast('Tạo đơn hàng Flash Sale thành công! Đang chuyển hướng tra cứu...', 'success');
      clearCart();
      onOrderSuccess(data.orderId);
    } catch (err: any) {
      showToast(err.message || 'Tạo đơn hàng thất bại', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '1080px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Top Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <button className="btn-secondary" style={{ padding: '8px 14px', fontSize: '0.85rem' }} onClick={onBackToStore}>
          <ArrowLeft size={16} /> Quay Lại Cửa Hàng
        </button>

        <h1 style={{ fontSize: '1.6rem', fontWeight: 800 }} className="gradient-text">
          Thanh Toán Đơn Hàng & Điều Phối Đa Kho (SOR)
        </h1>
      </div>

      <form onSubmit={handleCheckoutSubmit} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '28px' }}>
        {/* Left Column: Delivery Info & Payment Selection */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Step 1: Customer & Address */}
          <div className="glass-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '10px' }}>
              <MapPin size={20} color="#38bdf8" /> 1. Thông Tin Nhận Hàng
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '6px' }}>Họ và Tên người nhận</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-glass)', color: '#fff' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '6px' }}>Số Điện Thoại</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-glass)', color: '#fff' }}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '6px' }}>Tỉnh / Thành Phố (SOR Matching)</label>
                <select
                  value={province}
                  onChange={(e) => setProvince(e.target.value)}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', background: '#1e293b', border: '1px solid var(--border-glass)', color: '#fff', fontWeight: 600 }}
                >
                  <option value="Hanoi">Hà Nội (Kho Ưu Tiên: KHO_HN)</option>
                  <option value="Hai Phong">Hải Phòng (Kho Ưu Tiên: KHO_HN)</option>
                  <option value="HCM">TP. Hồ Chí Minh (Kho Ưu Tiên: KHO_HCM)</option>
                  <option value="Can Tho">Cần Thơ (Kho Ưu Tiên: KHO_HCM)</option>
                  <option value="Da Nang">Đà Nẵng (Kho Ưu Tiên: KHO_HN)</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '6px' }}>Quận / Huyện</label>
                <input
                  type="text"
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  required
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-glass)', color: '#fff' }}
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '6px' }}>Địa Chỉ Chi Tiết</label>
              <input
                type="text"
                value={detailAddress}
                onChange={(e) => setDetailAddress(e.target.value)}
                required
                style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-glass)', color: '#fff' }}
              />
            </div>

            {/* Smart Order Routing Preview Alert */}
            <div style={{ padding: '12px 14px', borderRadius: '10px', background: 'rgba(56, 189, 248, 0.1)', border: '1px solid rgba(56, 189, 248, 0.3)', color: '#38bdf8', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Truck size={18} /> Kho hàng được SOR tự động xuất hàng: <strong>{predictedWarehouse}</strong>
            </div>
          </div>

          {/* Step 2: Payment Options */}
          <div className="glass-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '10px' }}>
              <CreditCard size={20} color="#4ade80" /> 2. Phương Thức Thanh Toán
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <label style={{ padding: '14px', borderRadius: '10px', background: paymentMethod === 'VIETQR_ONLINE' ? 'rgba(99, 102, 241, 0.15)' : 'rgba(255,255,255,0.02)', border: paymentMethod === 'VIETQR_ONLINE' ? '1px solid var(--accent-primary)' : '1px solid var(--border-glass)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <input type="radio" name="payment" value="VIETQR_ONLINE" checked={paymentMethod === 'VIETQR_ONLINE'} onChange={(e) => setPaymentMethod(e.target.value)} />
                <QrCode size={20} color="#818cf8" />
                <div>
                  <strong style={{ display: 'block', color: 'var(--text-main)', fontSize: '0.92rem' }}>Thanh Toán Quét Mã VietQR (Chuyển Khoản Trực Tuyến)</strong>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Tự động duyệt đơn hàng tức thì ngay sau khi chuyển khoản thành công</span>
                </div>
              </label>

              <label style={{ padding: '14px', borderRadius: '10px', background: paymentMethod === 'COD' ? 'rgba(99, 102, 241, 0.15)' : 'rgba(255,255,255,0.02)', border: paymentMethod === 'COD' ? '1px solid var(--accent-primary)' : '1px solid var(--border-glass)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <input type="radio" name="payment" value="COD" checked={paymentMethod === 'COD'} onChange={(e) => setPaymentMethod(e.target.value)} />
                <Truck size={20} color="#fbbf24" />
                <div>
                  <strong style={{ display: 'block', color: 'var(--text-main)', fontSize: '0.92rem' }}>Thanh Toán Khi Nhận Hàng (COD)</strong>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Thanh toán tiền mặt cho shipper khi nhận được hàng</span>
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* Right Column: Order Summary & Confirmation */}
        <div className="glass-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: 'fit-content', gap: '20px' }}>
          <div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '16px', borderBottom: '1px solid var(--border-glass)', paddingBottom: '12px' }}>
              Tóm Tắt Đơn Hàng ({cartItems.length} sản phẩm)
            </h3>

            {/* Cart Items Summary */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px', maxHeight: '240px', overflowY: 'auto' }}>
              {cartItems.map((item) => (
                <div key={item.product.sku} style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                  <img src={item.product.imageUrl} alt={item.product.title} style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '8px' }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--text-main)' }}>{item.product.title}</div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-dim)' }}>Số lượng: x{item.quantity}</div>
                  </div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#4ade80' }}>
                    {(item.product.price * item.quantity).toLocaleString()} ₫
                  </div>
                </div>
              ))}
            </div>

            {/* Calculation Totals */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', paddingTop: '16px', borderTop: '1px solid var(--border-glass)', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Tiền hàng:</span>
                <span>{subtotal.toLocaleString()} ₫</span>
              </div>
              {discount > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#4ade80' }}>
                  <span>Giảm giá Voucher:</span>
                  <span>-{discount.toLocaleString()} ₫</span>
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Phí vận chuyển:</span>
                <span>{shippingFee.toLocaleString()} ₫</span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)', marginTop: '8px', paddingTop: '12px', borderTop: '1px solid var(--border-glass)' }}>
                <span>Tổng Thanh Toán:</span>
                <span style={{ color: '#4ade80' }}>{totalAmount.toLocaleString()} ₫</span>
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="btn-primary"
            style={{ width: '100%', padding: '16px', fontSize: '1.1rem', justifyContent: 'center' }}
            disabled={loading || cartItems.length === 0}
          >
            {loading ? 'Đang Khóa Kho & Tạo Đơn...' : 'XÁC NHẬN ĐẶT HÀNG'}
          </button>
        </div>
      </form>
    </div>
  );
};
