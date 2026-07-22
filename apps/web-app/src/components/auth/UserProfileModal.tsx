import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { X, User, Phone, Mail, Award, Save, LogOut, CheckCircle2, RefreshCw } from 'lucide-react';

export const UserProfileModal: React.FC = () => {
  const { user, isProfileModalOpen, setIsProfileModalOpen, updateProfile, logout } = useAuth();
  const { showToast } = useToast();

  const [fullName, setFullName] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [avatarUrl, setAvatarUrl] = useState<string>('');
  const [isSaving, setIsSaving] = useState<boolean>(false);

  useEffect(() => {
    if (user) {
      setFullName(user.fullName || '');
      setPhone(user.phone || '0987654321');
      setAvatarUrl(user.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.email}`);
    }
  }, [user, isProfileModalOpen]);

  if (!isProfileModalOpen || !user) return null;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await updateProfile({ fullName, phone, avatarUrl });
      showToast('Cập nhật thông tin tài khoản thành công vào CSDL PostgreSQL!', 'success');
      setIsProfileModalOpen(false);
    } catch (err: any) {
      showToast('Không thể cập nhật thông tin: ' + (err.message || 'Lỗi mạng'), 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleRandomAvatar = () => {
    const randomSeed = Math.random().toString(36).substring(7);
    const newAvatar = `https://api.dicebear.com/7.x/avataaars/svg?seed=${randomSeed}`;
    setAvatarUrl(newAvatar);
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(12px)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
      <div className="glass-card glass-card-accent" style={{ width: '100%', maxWidth: '520px', padding: '32px', position: 'relative', background: '#0f172a' }}>
        {/* Close Button */}
        <button
          onClick={() => setIsProfileModalOpen(false)}
          style={{ position: 'absolute', top: '20px', right: '20px', background: 'rgba(255,255,255,0.08)', border: '1px solid var(--border-glass)', color: '#fff', width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
        >
          <X size={18} />
        </button>

        {/* Profile Avatar Header */}
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div style={{ position: 'relative', width: '96px', height: '96px', margin: '0 auto 12px auto' }}>
            <img
              src={avatarUrl}
              alt={fullName}
              style={{ width: '100%', height: '100%', borderRadius: '50%', border: '3px solid var(--accent-primary)', objectFit: 'cover', background: '#1e293b' }}
            />
            <button
              type="button"
              onClick={handleRandomAvatar}
              title="Đổi ảnh đại diện ngẫu nhiên"
              style={{ position: 'absolute', bottom: '0', right: '0', background: 'var(--accent-primary)', color: '#fff', border: 'none', borderRadius: '50%', width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
            >
              <RefreshCw size={14} />
            </button>
          </div>

          <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#fff' }}>
            {user.fullName}
          </h3>

          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(52, 211, 153, 0.15)', color: '#34d399', border: '1px solid rgba(52, 211, 153, 0.3)', padding: '4px 12px', borderRadius: '20px', fontSize: '0.82rem', fontWeight: 700, marginTop: '6px' }}>
            <Award size={16} /> Member VIP ({user.loyaltyPoints || 100} PTS)
          </div>
        </div>

        {/* Profile Edit Form */}
        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
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

          <div>
            <label style={{ display: 'block', fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '6px' }}>Số Điện Thoại</label>
            <div style={{ position: 'relative' }}>
              <Phone size={18} color="var(--text-dim)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
                placeholder="0987654321"
                style={{ width: '100%', padding: '10px 12px 10px 40px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-glass)', color: '#fff' }}
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '6px' }}>Email (Định danh CSDL)</label>
            <div style={{ position: 'relative' }}>
              <Mail size={18} color="var(--text-dim)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type="email"
                value={user.email}
                disabled
                style={{ width: '100%', padding: '10px 12px 10px 40px', borderRadius: '8px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-glass)', color: 'var(--text-muted)', cursor: 'not-allowed' }}
              />
            </div>
          </div>

          {/* Form Action Buttons */}
          <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
            <button
              type="submit"
              disabled={isSaving}
              className="btn-primary"
              style={{ flex: 1, padding: '12px', justifyContent: 'center', opacity: isSaving ? 0.7 : 1 }}
            >
              <Save size={18} /> {isSaving ? 'Đang Lưu...' : 'Lưu Thay Đổi'}
            </button>

            <button
              type="button"
              onClick={() => {
                logout();
                showToast('Đã đăng xuất tài khoản', 'info');
              }}
              style={{ padding: '12px 16px', background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#f87171', borderRadius: '8px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <LogOut size={18} /> Đăng Xuất
            </button>
          </div>
        </form>

        <div style={{ marginTop: '20px', textAlign: 'center', fontSize: '0.78rem', color: 'var(--text-dim)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
          <CheckCircle2 size={14} color="#34d399" /> Đồng bộ trực tiếp với CSDL PostgreSQL schema core.users
        </div>
      </div>
    </div>
  );
};
