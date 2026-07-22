import React, { useState, useEffect } from 'react';
import { Shield, RefreshCw, Database, Layers, CheckCircle2, Clock, XCircle, RotateCcw, Sliders, Warehouse } from 'lucide-react';

interface ProductVariantItem {
  id: string;
  sku: string;
  price: number;
  title: string;
  description: string;
  warehouses: {
    warehouseCode: string;
    warehouseName: string;
    quantity: number;
    reservedQuantity: number;
    availableToSell: number;
  }[];
  totalAts: number;
}

interface OrderItem {
  id: string;
  orderCode: string;
  userId: string;
  status: string;
  totalPrice: number;
  province: string;
  district: string;
  detailAddress: string;
  campaignId: string;
  createdAt: string;
  fulfillments: { id: string; warehouseCode: string; status: string }[];
}

export const AdminPortal: React.FC = () => {
  const [products, setProducts] = useState<ProductVariantItem[]>([]);
  const [orders, setOrders] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  // Admin Campaign state
  const [campaignStock, setCampaignStock] = useState<number>(3);
  const [settingStock, setSettingStock] = useState<boolean>(false);
  const [adminMsg, setAdminMsg] = useState<string | null>(null);

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const [prodRes, orderRes] = await Promise.all([
        fetch('/api/products'),
        fetch('/api/orders'),
      ]);

      if (prodRes.ok) {
        const prodData = await prodRes.json();
        setProducts(prodData);
      }

      if (orderRes.ok) {
        const orderData = await orderRes.json();
        setOrders(orderData);
      }
    } catch (err) {
      console.error('Failed to fetch admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSetCampaignStock = async (e: React.FormEvent) => {
    e.preventDefault();
    setSettingStock(true);
    setAdminMsg(null);

    try {
      const res = await fetch('/api/purchase/admin/campaign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sku: 'KINH-X-DEN-SIZE-M',
          stock: Number(campaignStock),
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setAdminMsg(`Updated Redis Flash Sale stock to ${campaignStock} and cleared ${data.clearedLimitsCount} user limit locks.`);
        fetchAdminData();
      } else {
        setAdminMsg(data.message || 'Failed to update campaign stock');
      }
    } catch (err: any) {
      setAdminMsg(err.message || 'Failed to update Redis stock');
    } finally {
      setSettingStock(false);
    }
  };

  const handleTriggerTimeouts = async () => {
    try {
      const res = await fetch('/api/orders/check-timeouts-trigger');
      const data = await res.json();
      if (res.ok) {
        alert(`Timeout check complete! Cancelled ${data.cancelledCount} timed out orders.`);
        fetchAdminData();
      }
    } catch (err) {
      console.error('Error triggering timeout check:', err);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      
      {/* Header Banner */}
      <div className="glass-card" style={{ padding: '28px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <span className="badge badge-indigo">
              <Shield size={14} /> Admin Control Portal
            </span>
            <span className="badge badge-emerald">PostgreSQL Schema Isolated</span>
          </div>
          <h1 className="gradient-text-cyan" style={{ fontSize: '2rem', fontWeight: 800 }}>
            Multi-Warehouse Inventory & Order Routing Control
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
            Real-time management of physical stocks (HN & HCM), Redis Flash Sale allocations, and SOR fulfillments.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <button className="btn-secondary" onClick={fetchAdminData} disabled={loading}>
            <RefreshCw size={16} /> {loading ? 'Syncing...' : 'Sync Admin Data'}
          </button>

          <button className="btn-secondary" onClick={handleTriggerTimeouts}>
            <RotateCcw size={16} /> Run Timeout Scanner
          </button>
        </div>
      </div>

      {/* Grid: Warehouse Inventory vs Redis Campaign Config */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '24px' }}>
        
        {/* Left: Physical Warehouse Inventories */}
        <div className="glass-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Warehouse size={22} color="#38bdf8" />
            <h2 style={{ fontSize: '1.2rem', fontWeight: 700 }}>Physical Warehouses (Schema core)</h2>
          </div>

          {products.length === 0 ? (
            <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-dim)' }}>Loading inventory...</div>
          ) : (
            products.map((p) => (
              <div key={p.id} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <div>
                    <strong style={{ fontSize: '1.05rem', color: 'var(--text-main)' }}>{p.title}</strong>
                    <span className="font-mono" style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-dim)' }}>{p.sku}</span>
                  </div>
                  <span style={{ fontWeight: 800, color: '#4ade80', fontSize: '1.1rem' }}>
                    {p.price.toLocaleString()} ₫
                  </span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  {p.warehouses.map((w) => (
                    <div key={w.warehouseCode} style={{ padding: '14px', borderRadius: '12px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-glass)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                        <span style={{ fontWeight: 700, fontSize: '0.9rem', color: '#a5b4fc' }}>{w.warehouseCode}</span>
                        <span className="badge badge-emerald" style={{ fontSize: '0.65rem' }}>ATS: {w.availableToSell}</span>
                      </div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <div>Physical Quantity: <strong style={{ color: '#fff' }}>{w.quantity}</strong></div>
                        <div>Reserved Quantity: <strong style={{ color: '#fbbf24' }}>{w.reservedQuantity}</strong></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Right: Redis Campaign Controller */}
        <div className="glass-card glass-card-accent" style={{ padding: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '20px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
              <Sliders size={22} color="#ec4899" />
              <h2 style={{ fontSize: '1.2rem', fontWeight: 700 }}>Redis Flash Sale Campaign Controller</h2>
            </div>

            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '20px' }}>
              Configure active Flash Sale inventory in Redis for <code>inventory:flash_sale:KINH-X-DEN-SIZE-M</code> and reset all active user purchase limit locks (<code>user:limit:*</code>).
            </p>

            <form onSubmit={handleSetCampaignStock} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '6px' }}>Target Redis Flash Stock</label>
                <input 
                  type="number" 
                  min="0" 
                  max="100" 
                  value={campaignStock} 
                  onChange={(e) => setCampaignStock(Number(e.target.value))} 
                  required
                  style={{ width: '100%', padding: '12px 16px', borderRadius: '10px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-glass)', color: '#fff', fontSize: '1.1rem', fontWeight: 700, fontFamily: 'var(--font-mono)' }}
                />
              </div>

              {adminMsg && (
                <div style={{ padding: '12px', borderRadius: '8px', background: 'rgba(99, 102, 241, 0.15)', border: '1px solid rgba(99, 102, 241, 0.3)', color: '#a5b4fc', fontSize: '0.85rem' }}>
                  {adminMsg}
                </div>
              )}

              <button type="submit" className="btn-primary" style={{ padding: '14px' }} disabled={settingStock}>
                {settingStock ? 'Updating Redis...' : 'Update Redis Stock & Clear Limits'}
              </button>
            </form>
          </div>

          <div style={{ padding: '12px', borderRadius: '8px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-glass)', fontSize: '0.8rem', color: 'var(--text-dim)' }}>
            ⚡ Changes reflect immediately on the Customer Storefront via Server-Sent Events (SSE).
          </div>
        </div>

      </div>

      {/* Global Orders & SOR Fulfillment Monitor */}
      <div className="glass-card" style={{ padding: '28px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Layers size={22} color="#818cf8" />
            <h2 style={{ fontSize: '1.3rem', fontWeight: 700 }}>Global Orders & SOR Fulfillment Monitor (Schema order)</h2>
          </div>
          <span className="badge badge-indigo">{orders.length} Total Orders</span>
        </div>

        {orders.length === 0 ? (
          <div style={{ padding: '32px', textAlign: 'center', color: 'var(--text-dim)' }}>No orders placed yet.</div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-glass)', color: 'var(--text-dim)', textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.05em' }}>
                  <th style={{ padding: '12px 16px' }}>Order Code</th>
                  <th style={{ padding: '12px 16px' }}>User ID</th>
                  <th style={{ padding: '12px 16px' }}>Province</th>
                  <th style={{ padding: '12px 16px' }}>Total Price</th>
                  <th style={{ padding: '12px 16px' }}>Status</th>
                  <th style={{ padding: '12px 16px' }}>Assigned Warehouse (SOR)</th>
                  <th style={{ padding: '12px 16px' }}>Created At</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((o) => (
                  <tr key={o.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', transition: 'background 0.2s' }}>
                    <td style={{ padding: '14px 16px' }} className="font-mono">
                      <strong style={{ color: 'var(--text-main)' }}>{o.orderCode}</strong>
                    </td>
                    <td style={{ padding: '14px 16px', color: 'var(--text-muted)' }} className="font-mono">
                      {o.userId}
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <span style={{ color: 'var(--text-main)', fontWeight: 600 }}>{o.province}</span>
                    </td>
                    <td style={{ padding: '14px 16px', fontWeight: 700, color: '#4ade80' }}>
                      {Number(o.totalPrice).toLocaleString()} ₫
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <span className={`badge ${o.status === 'PAID' ? 'badge-emerald' : o.status === 'CANCELLED' ? 'badge-rose' : 'badge-amber'}`}>
                        {o.status === 'PAID' && <CheckCircle2 size={12} />}
                        {o.status === 'PENDING_PAYMENT' && <Clock size={12} />}
                        {o.status === 'CANCELLED' && <XCircle size={12} />}
                        {o.status}
                      </span>
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      {o.fulfillments && o.fulfillments.length > 0 ? (
                        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                          {o.fulfillments.map((f) => (
                            <span key={f.id} className="badge badge-indigo">
                              {f.warehouseCode} ({f.status})
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span style={{ color: 'var(--text-dim)' }}>Pending...</span>
                      )}
                    </td>
                    <td style={{ padding: '14px 16px', color: 'var(--text-dim)', fontSize: '0.8rem' }} className="font-mono">
                      {new Date(o.createdAt).toLocaleTimeString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
};
