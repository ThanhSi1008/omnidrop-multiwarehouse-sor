import React, { useEffect } from 'react';
import { useOrders } from '../../hooks/useOrders';
import { useToast } from '../../context/ToastContext';
import { X, Clock, RefreshCw, CreditCard } from 'lucide-react';

interface OrderHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const OrderHistoryModal: React.FC<OrderHistoryModalProps> = ({ isOpen, onClose }) => {
  const { orders, loading, payingId, loadOrders, payOrder } = useOrders();
  const { showToast } = useToast();

  useEffect(() => {
    if (isOpen) {
      loadOrders();
    }
  }, [isOpen, loadOrders]);

  const handlePay = async (orderId: string) => {
    const success = await payOrder(orderId);
    if (success) {
      showToast('Xác nhận thanh toán VietQR Webhook thành công! Đơn hàng chuyển sang trạng thái PAID.');
    } else {
      showToast('Thanh toán đơn hàng thất bại!', 'error');
    }
  };

  if (!isOpen) return null;

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(10px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
      <div className="glass-card glass-card-accent" style={{ width: '100%', maxWidth: '860px', maxHeight: '88vh', overflowY: 'auto', padding: '32px', position: 'relative', background: '#0f172a' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', paddingBottom: '16px', borderBottom: '1px solid var(--border-glass)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Clock size={24} color="#fbbf24" />
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800 }}>Lịch Sử Đơn Hàng & Tra Cứu Tracking</h2>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button className="btn-secondary" style={{ padding: '6px 12px', fontSize: '0.82rem' }} onClick={loadOrders}>
              <RefreshCw size={14} /> Làm Mới
            </button>
            <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer' }}>
              <X size={24} />
            </button>
          </div>
        </div>

        {/* Orders List */}
        {loading ? (
          <div style={{ padding: '60px', textAlign: 'center', color: 'var(--text-muted)' }}>
            Đang tải danh sách đơn hàng...
          </div>
        ) : orders.length === 0 ? (
          <div style={{ padding: '60px', textAlign: 'center', color: 'var(--text-muted)' }}>
            Chưa có đơn hàng nào được tạo. Hãy quay lại cửa hàng để đặt mua nhé!
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {orders.map((order) => {
              const warehouses = order.fulfillments ? order.fulfillments.map((f) => f.warehouseCode).join(', ') : 'Đang điều phối SOR...';

              return (
                <div key={order.id} className="glass-card" style={{ padding: '20px', borderLeft: order.status === 'PAID' ? '4px solid #10b981' : order.status === 'CANCELLED' ? '4px solid #f43f5e' : '4px solid #fbbf24' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '14px' }}>
                    <div>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>Mã Đơn Hàng:</span>
                      <strong className="font-mono" style={{ color: 'var(--text-main)', fontSize: '1.05rem', marginLeft: '6px' }}>
                        {order.orderCode}
                      </strong>
                    </div>

                    <span className={`badge ${order.status === 'PAID' ? 'badge-emerald' : order.status === 'CANCELLED' ? 'badge-rose' : 'badge-amber'}`}>
                      {order.status === 'PAID' && 'ĐÃ THANH TOÁN (PAID)'}
                      {order.status === 'PENDING_PAYMENT' && 'CHỜ THANH TOÁN (PENDING)'}
                      {order.status === 'CANCELLED' && 'ĐÃ HỦY ĐƠN (CANCELLED)'}
                    </span>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px', fontSize: '0.88rem', color: 'var(--text-muted)', marginBottom: '14px' }}>
                    <div>
                      <span style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-dim)' }}>Thời gian tạo</span>
                      <span>{new Date(order.createdAt).toLocaleString('vi-VN')}</span>
                    </div>

                    <div>
                      <span style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-dim)' }}>Kho Phân Phối (SOR)</span>
                      <strong style={{ color: '#818cf8' }}>{warehouses}</strong>
                    </div>

                    <div>
                      <span style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-dim)' }}>Địa chỉ nhận</span>
                      <span style={{ color: 'var(--text-main)' }}>
                        {order.detailAddress}, {order.district}, {order.province}
                      </span>
                    </div>

                    <div>
                      <span style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-dim)' }}>Tổng Tiền</span>
                      <strong style={{ color: '#4ade80', fontSize: '1.05rem' }}>{Number(order.totalPrice).toLocaleString()} ₫</strong>
                    </div>
                  </div>

                  {order.status === 'PENDING_PAYMENT' && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '12px', borderTop: '1px solid var(--border-glass)', flexWrap: 'wrap', gap: '12px' }}>
                      <span style={{ fontSize: '0.82rem', color: '#fbbf24' }}>
                        💡 Đơn hàng đang được giữ chỗ trong 5 phút. Hãy bấm nút bên phải để giả lập Webhook thanh toán!
                      </span>

                      <button
                        className="btn-primary"
                        style={{ padding: '8px 16px', fontSize: '0.88rem', background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' }}
                        onClick={() => handlePay(order.id)}
                        disabled={payingId === order.id}
                      >
                        <CreditCard size={16} />
                        {payingId === order.id ? 'Đang Xử Lý...' : 'Thanh Toán Ngay (VietQR Webhook)'}
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
