import React, { useState } from 'react';
import { X, Lock, Mail, User as UserIcon, Phone, ShieldCheck, Sparkles, LogIn } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { UserRole } from '../../types';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultMode?: 'login' | 'register';
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  defaultMode = 'login',
}) => {
  const { login, register } = useAuth();
  const { showToast } = useToast();

  const [mode, setMode] = useState<'login' | 'register'>(defaultMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState<UserRole>('buyer');

  if (!isOpen) return null;

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === 'login') {
      const ok = login(email.trim(), password);
      if (ok) {
        showToast('Đăng nhập thành công vào Bi Bi Boutique!', 'success');
        onClose();
      } else {
        showToast('Tài khoản hoặc mật khẩu không chính xác!', 'error');
      }
    } else {
      if (!name.trim() || !email.trim() || !phone.trim()) {
        showToast('Vui lòng điền đầy đủ thông tin!', 'warning');
        return;
      }
      register(name.trim(), email.trim(), phone.trim(), role);
      showToast('Đăng ký tài khoản mới thành công!', 'success');
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 w-full max-w-md overflow-hidden">
        
        {/* Header */}
        <div className="relative bg-gradient-to-br from-brand-700 via-brand-600 to-dark-900 text-white p-6 pb-8">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
          
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-brand-200" />
            </div>
            <span className="text-xs uppercase tracking-widest font-semibold text-brand-200">Bi Bi Fashion</span>
          </div>

          <h3 className="font-serif text-2xl font-bold">
            {mode === 'login' ? 'Đăng Nhập Tài Khoản' : 'Đăng Ký Thành Viên'}
          </h3>
          <p className="text-xs text-brand-100 mt-1">
            {mode === 'login' ? 'Truy cập để quản lý đơn hàng, giỏ đồ và lịch thuê' : 'Tạo tài khoản để mua, thuê và đăng bán thời trang'}
          </p>
        </div>

        {/* Main Form */}
        <form onSubmit={handleFormSubmit} className="p-6 space-y-4">
          {mode === 'register' && (
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Họ và tên</label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ví dụ: Lê Thị Ngọc Ánh"
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-9 pr-3.5 py-2 text-xs text-gray-900 focus:outline-none focus:border-brand-500"
                />
                <UserIcon className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Địa chỉ Email</label>
            <div className="relative">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="email@example.com"
                className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-9 pr-3.5 py-2 text-xs text-gray-900 focus:outline-none focus:border-brand-500"
              />
              <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          {mode === 'register' && (
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Số điện thoại</label>
              <div className="relative">
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Ví dụ: 0795623097"
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-9 pr-3.5 py-2 text-xs text-gray-900 focus:outline-none focus:border-brand-500"
                />
                <Phone className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Mật khẩu</label>
            <div className="relative">
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-9 pr-3.5 py-2 text-xs text-gray-900 focus:outline-none focus:border-brand-500"
              />
              <Lock className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          {mode === 'register' && (
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Loại tài khoản</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setRole('buyer')}
                  className={role === 'buyer' ? 'py-2 text-xs rounded-xl border text-center font-medium bg-brand-50 border-brand-500 text-brand-700' : 'py-2 text-xs rounded-xl border text-center font-medium border-gray-200 text-gray-600'}
                >
                  Khách mua & thuê đồ
                </button>
                <button
                  type="button"
                  onClick={() => setRole('seller')}
                  className={role === 'seller' ? 'py-2 text-xs rounded-xl border text-center font-medium bg-brand-50 border-brand-500 text-brand-700' : 'py-2 text-xs rounded-xl border text-center font-medium border-gray-200 text-gray-600'}
                >
                  Chủ shop / Cho thuê
                </button>
              </div>
            </div>
          )}

          <button
            type="submit"
            className="w-full py-3 bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold rounded-xl shadow-lg shadow-brand-500/25 transition-all flex items-center justify-center gap-2"
          >
            <LogIn className="w-4 h-4" />
            <span>{mode === 'login' ? 'Đăng Nhập Ngay' : 'Hoàn Tất Đăng Ký'}</span>
          </button>

          <div className="text-center pt-2">
            {mode === 'login' ? (
              <p className="text-xs text-gray-600">
                Chưa có tài khoản?{' '}
                <button
                  type="button"
                  onClick={() => setMode('register')}
                  className="font-bold text-brand-600 hover:underline"
                >
                  Đăng ký miễn phí
                </button>
              </p>
            ) : (
              <p className="text-xs text-gray-600">
                Đã có tài khoản?{' '}
                <button
                  type="button"
                  onClick={() => setMode('login')}
                  className="font-bold text-brand-600 hover:underline"
                >
                  Đăng nhập
                </button>
              </p>
            )}
          </div>
        </form>

      </div>
    </div>
  );
};
