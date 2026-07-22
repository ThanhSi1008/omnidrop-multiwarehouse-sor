import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { X, Mail, Lock, User, ArrowRight, ShieldCheck } from 'lucide-react';

export const AuthModal: React.FC = () => {
  const { isAuthModalOpen, setIsAuthModalOpen, login, register } = useAuth();
  const { showToast } = useToast();

  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState<string>('khachhang@omnidrop.vn');
  const [password, setPassword] = useState<string>('password123');
  const [fullName, setFullName] = useState<string>('Nguyễn Văn An');

  if (!isAuthModalOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === 'login') {
      login(email);
      showToast(`Đăng nhập thành công! Chào mừng bạn quay trở lại.`, 'success');
    } else {
      register(fullName, email);
      showToast(`Đăng ký tài khoản thành công!`, 'success');
    }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(12px)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
      <div className="glass-card glass-card-accent" style={{ width: '100%', maxWidth: '440px', padding: '32px', position: 'relative', background: '#0f172a' }}>
        {/* Close Button */}
        <button
          onClick={() => setIsAuthModalOpen(false)}
          style={{ position: 'absolute', top: '20px', right: '20px', background: 'rgba(255,255,255,0.08)', border: '1px solid var(--border-glass)', color: '#fff', width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
        >
          <X size={18} />
        </button>

        {/* Brand Header */}
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }} className="gradient-text">
            OMNIDROP ACCOUNT
          </h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            Đăng nhập để tích điểm và trải nghiệm mua sắm bán hàng đa kho
          </p>
        </div>

        {/* Tab Switcher */}
        <div style={{ display: 'flex', background: 'rgba(255,255,255,0.05)', borderRadius: '10px', padding: '4px', marginBottom: '24px', border: '1px solid var(--border-glass)' }}>
          <button
            onClick={() => setMode('login')}
            style={{
              flex: 1,
              padding: '10px',
              borderRadius: '8px',
              border: 'none',
              fontWeight: 700,
              fontSize: '0.88rem',
              cursor: 'pointer',
              background: mode === 'login' ? 'var(--accent-primary)' : 'transparent',
              color: mode === 'login' ? '#fff' : 'var(--text-muted)',
              transition: 'all 0.2s ease',
            }}
          >
            Đăng Nhập
          </button>
          <button
            onClick={() => setMode('register')}
            style={{
              flex: 1,
              padding: '10px',
              borderRadius: '8px',
              border: 'none',
              fontWeight: 700,
              fontSize: '0.88rem',
              cursor: 'pointer',
              background: mode === 'register' ? 'var(--accent-primary)' : 'transparent',
              color: mode === 'register' ? '#fff' : 'var(--text-muted)',
              transition: 'all 0.2s ease',
            }}
          >
            Đăng Ký
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {mode === 'register' && (
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '6px' }}>Họ và Tên</label>
              <div style={{ position: 'relative' }}>
                <User size={18} color="var(--text-dim)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  placeholder="Nguyễn Văn An"
                  style={{ width: '100%', padding: '10px 12px 10px 40px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-glass)', color: '#fff' }}
                />
              </div>
            </div>
          )}

          <div>
            <label style={{ display: 'block', fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '6px' }}>Địa chỉ Email</label>
            <div style={{ position: 'relative' }}>
              <Mail size={18} color="var(--text-dim)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="name@example.com"
                style={{ width: '100%', padding: '10px 12px 10px 40px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-glass)', color: '#fff' }}
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '6px' }}>Mật Khẩu</label>
            <div style={{ position: 'relative' }}>
              <Lock size={18} color="var(--text-dim)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                style={{ width: '100%', padding: '10px 12px 10px 40px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-glass)', color: '#fff' }}
              />
            </div>
          </div>

          <button type="submit" className="btn-primary" style={{ width: '100%', padding: '14px', marginTop: '8px', fontSize: '1rem', justifyContent: 'center' }}>
            {mode === 'login' ? 'Đăng Nhập Ngay' : 'Tạo Tài Khoản Mới'} <ArrowRight size={18} />
          </button>
        </form>

        {/* Footer Security Note */}
        <div style={{ marginTop: '20px', textAlign: 'center', fontSize: '0.78rem', color: 'var(--text-dim)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
          <ShieldCheck size={14} color="#34d399" /> Bảo mật thông tin giao dịch mã hóa 256-bit
        </div>
      </div>
    </div>
  );
};
