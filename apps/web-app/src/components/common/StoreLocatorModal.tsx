import React from 'react';
import { X, MapPin, Phone, Clock, Navigation, CheckCircle2 } from 'lucide-react';

interface StoreLocatorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const StoreLocatorModal: React.FC<StoreLocatorModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const stores = [
    {
      code: 'KHO_HN',
      region: 'Miền Bắc - Hà Nội',
      name: 'Showroom & Flagship Store Thái Hà',
      address: '102 Thái Hà, P. Trung Liệt, Q. Đống Đa, Hà Nội',
      phone: '024.7300.9999',
      hours: '08:30 - 21:30 (Cả CN & Ngày lễ)',
      status: 'Đang mở cửa - Sẵn kho 100%',
    },
    {
      code: 'KHO_HCM',
      region: 'Miền Nam - TP. Hồ Chí Minh',
      name: 'Showroom & Flagship Store Nguyễn Trãi',
      address: '246 Nguyễn Trãi, Phường Phạm Ngũ Lão, Quận 1, TP. HCM',
      phone: '028.7300.8888',
      hours: '08:30 - 22:00 (Cả CN & Ngày lễ)',
      status: 'Đang mở cửa - Sẵn kho 100%',
    },
  ];

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(12px)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
      <div className="glass-card glass-card-accent" style={{ width: '100%', maxWidth: '640px', padding: '32px', position: 'relative', background: '#0f172a' }}>
        <button
          onClick={onClose}
          style={{ position: 'absolute', top: '20px', right: '20px', background: 'rgba(255,255,255,0.08)', border: '1px solid var(--border-glass)', color: '#fff', width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
        >
          <X size={18} />
        </button>

        <div style={{ marginBottom: '24px' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '10px' }} className="gradient-text">
            <MapPin size={24} color="#818cf8" /> HỆ THỐNG CỬA HÀNG & KHO HÀNG VẬT LÝ
          </h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            Hệ thống Smart Order Routing (SOR) tự động điều phối đơn hàng từ cửa hàng gần nhất
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {stores.map((store) => (
            <div key={store.code} style={{ padding: '20px', borderRadius: '14px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-glass)', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span className="badge badge-indigo">{store.region}</span>
                <span style={{ fontSize: '0.8rem', color: '#34d399', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <CheckCircle2 size={14} /> {store.status}
                </span>
              </div>

              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-main)' }}>{store.name}</h3>

              <div style={{ fontSize: '0.88rem', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Navigation size={16} color="#38bdf8" /> {store.address}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Phone size={16} color="#fbbf24" /> Hotline: <strong style={{ color: '#fff' }}>{store.phone}</strong>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Clock size={16} color="#a855f7" /> Giờ mở cửa: {store.hours}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
