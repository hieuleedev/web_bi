import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { X, Lock, Mail, User as UserIcon, Phone, ShieldCheck, Sparkles, LogIn, Eye, EyeOff, CheckCircle2 } from 'lucide-react';
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
  const [showPassword, setShowPassword] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState<UserRole>('buyer');

  if (!isOpen) return null;

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === 'login') {
      const ok = await login(email.trim(), password);
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
      await register(name.trim(), email.trim(), phone.trim(), role);
      showToast('Đăng ký tài khoản mới thành công!', 'success');
      onClose();
    }
  };

  const handleQuickLogin = async (quickEmail: string, quickPass: string, roleName: string) => {
    setEmail(quickEmail);
    setPassword(quickPass);
    const ok = await login(quickEmail, quickPass);
    if (ok) {
      showToast(`Đăng nhập thành công với vai trò ${roleName}!`, 'success');
      onClose();
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-[9999] overflow-y-auto bg-black/60 backdrop-blur-xs flex min-h-full items-center justify-center p-3 sm:p-4 text-center">
      {/* Backdrop tap to close */}
      <div className="fixed inset-0 transition-opacity" onClick={onClose} aria-hidden="true" />

      {/* Modal Container */}
      <div 
        className="relative w-full max-w-md my-auto bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden text-left z-10 flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Header - Always fixed at top of modal */}
        <div className="relative bg-gradient-to-br from-brand-700 via-brand-600 to-dark-900 text-white p-5 sm:p-6 shrink-0">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 active:scale-95 text-white transition-all"
            aria-label="Đóng"
          >
            <X className="w-5 h-5" />
          </button>
          
          <div className="flex items-center gap-2 mb-1.5">
            <img
              src="/logo.jpg"
              alt="Logo Bi Bi"
              className="w-7 h-7 rounded-full object-cover border border-white/30 shrink-0"
            />
            <span className="text-[10px] sm:text-xs uppercase tracking-widest font-bold text-brand-200">Bi Bi - Cho Thuê Đồ Núi Thành</span>
          </div>

          <h3 className="font-serif text-xl sm:text-2xl font-bold">
            {mode === 'login' ? 'Đăng Nhập Tài Khoản' : 'Đăng Ký Thành Viên'}
          </h3>
          <p className="text-[11px] sm:text-xs text-brand-100 mt-1 line-clamp-1">
            {mode === 'login' ? 'Quản lý đơn hàng, giỏ đồ và lịch thuê đồ' : 'Tạo tài khoản để mua, thuê và theo dõi đơn'}
          </p>
        </div>

        {/* Scrollable Body (Segmented Switcher + Form) */}
        <div className="overflow-y-auto flex-1 overscroll-contain">
          {/* Segmented Tab Switcher */}
          <div className="p-4 sm:p-6 pb-0">
          <div className="flex bg-gray-100 p-1 rounded-2xl">
            <button
              type="button"
              onClick={() => setMode('login')}
              className={`flex-1 py-2 sm:py-2.5 text-xs font-bold rounded-xl transition-all ${
                mode === 'login'
                  ? 'bg-white text-gray-900 shadow-xs ring-1 ring-black/5'
                  : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              Đăng Nhập
            </button>
            <button
              type="button"
              onClick={() => setMode('register')}
              className={`flex-1 py-2 sm:py-2.5 text-xs font-bold rounded-xl transition-all ${
                mode === 'register'
                  ? 'bg-white text-gray-900 shadow-xs ring-1 ring-black/5'
                  : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              Đăng Ký Mới
            </button>
          </div>
        </div>

        {/* Main Form */}
        <form onSubmit={handleFormSubmit} className="p-4 sm:p-6 space-y-3.5">
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
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-9 pr-3.5 py-2.5 text-sm sm:text-xs text-gray-900 focus:outline-none focus:border-brand-500 focus:bg-white transition-colors placeholder:text-gray-400"
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
                className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-9 pr-3.5 py-2.5 text-sm sm:text-xs text-gray-900 focus:outline-none focus:border-brand-500 focus:bg-white transition-colors placeholder:text-gray-400"
              />
              <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          {mode === 'register' && (
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Số điện thoại (Zalo)</label>
              <div className="relative">
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Ví dụ: 0795623097"
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-9 pr-3.5 py-2.5 text-sm sm:text-xs text-gray-900 focus:outline-none focus:border-brand-500 focus:bg-white transition-colors placeholder:text-gray-400"
                />
                <Phone className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              </div>
            </div>
          )}

          {mode === 'register' && (
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Bạn tham gia với vai trò</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setRole('buyer')}
                  className={`p-2 rounded-xl text-xs font-semibold border flex items-center justify-center gap-1.5 transition-all ${
                    role === 'buyer'
                      ? 'bg-brand-50 border-brand-500 text-brand-700 ring-1 ring-brand-500'
                      : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <UserIcon className="w-3.5 h-3.5 text-brand-600" />
                  <span>Khách Mua/Thuê</span>
                </button>
                <button
                  type="button"
                  onClick={() => setRole('seller')}
                  className={`p-2 rounded-xl text-xs font-semibold border flex items-center justify-center gap-1.5 transition-all ${
                    role === 'seller'
                      ? 'bg-amber-50 border-amber-500 text-amber-800 ring-1 ring-amber-500'
                      : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
                  <span>Chủ Shop</span>
                </button>
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Mật khẩu</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-9 pr-10 py-2.5 text-sm sm:text-xs text-gray-900 focus:outline-none focus:border-brand-500 focus:bg-white transition-colors placeholder:text-gray-400"
              />
              <Lock className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="p-1.5 text-gray-400 hover:text-gray-600 absolute right-2 top-1/2 -translate-y-1/2"
                aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3 sm:py-3 bg-brand-600 hover:bg-brand-700 active:scale-[0.99] text-white text-xs font-bold rounded-xl shadow-md shadow-brand-500/25 transition-all flex items-center justify-center gap-2 mt-2"
          >
            <LogIn className="w-4 h-4" />
            <span>{mode === 'login' ? 'Đăng Nhập Ngay' : 'Hoàn Tất Đăng Ký'}</span>
          </button>

          {/* Quick Demo 1-Click Login for Mobile convenience */}
          {mode === 'login' && (
            <div className="pt-2 border-t border-gray-100 space-y-1.5">
              <span className="text-[10px] text-gray-400 font-medium block text-center uppercase tracking-wider">
                Đăng nhập nhanh 1 chạm:
              </span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => handleQuickLogin('linhbi@gmail.com', '123456', 'Chủ Shop')}
                  className="p-2 rounded-xl bg-amber-50/80 hover:bg-amber-100 text-amber-900 border border-amber-200 text-[11px] font-bold text-center transition-colors flex items-center justify-center gap-1"
                >
                  <span>👑 Chủ Shop Bi Bi</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickLogin('hieulee.dev@gmail.com', '123456', 'Quản Trị Viên')}
                  className="p-2 rounded-xl bg-brand-50/80 hover:bg-brand-100 text-brand-900 border border-brand-200 text-[11px] font-bold text-center transition-colors flex items-center justify-center gap-1"
                >
                  <span>🛡️ Quản Trị Viên</span>
                </button>
              </div>
            </div>
          )}

          <div className="text-center pt-1 pb-1">
            {mode === 'login' ? (
              <p className="text-xs text-gray-500">
                Chưa có tài khoản?{' '}
                <button
                  type="button"
                  onClick={() => setMode('register')}
                  className="font-bold text-brand-600 hover:underline"
                >
                  Đăng ký ngay
                </button>
              </p>
            ) : (
              <p className="text-xs text-gray-500">
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
    </div>,
    document.body
  );
};
