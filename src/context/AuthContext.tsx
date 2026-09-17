import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, UserRole } from '../types';
import { MOCK_USERS } from '../data/mockUsers';

interface AuthContextType {
  currentUser: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (email: string, password?: string) => boolean;
  register: (name: string, email: string, phone: string, role?: UserRole) => void;
  changePassword: (oldPass: string, newPass: string) => { success: boolean; message: string };
  switchRole: (role: UserRole) => void;
  switchUser: (userId: string) => void;
  updateProfile: (updatedData: Partial<User>) => void;
  logout: () => void;
  allUsers: User[];
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_USER_KEY = 'bibi_current_user_v2';
const AUTH_TOKEN_KEY = 'bibi_auth_token';
const ALL_USERS_KEY = 'bibi_all_users_v2';

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem(AUTH_TOKEN_KEY);
  });

  const [users, setUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem(ALL_USERS_KEY);
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* ignore */ }
    }
    return MOCK_USERS;
  });

  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem(AUTH_USER_KEY);
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* ignore */ }
    }
    return null; // Default to guest (not logged in)
  });

  useEffect(() => {
    localStorage.setItem(ALL_USERS_KEY, JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    if (currentUser && token) {
      localStorage.setItem(AUTH_USER_KEY, JSON.stringify(currentUser));
      localStorage.setItem(AUTH_TOKEN_KEY, token);
    } else {
      localStorage.removeItem(AUTH_USER_KEY);
      localStorage.removeItem(AUTH_TOKEN_KEY);
    }
  }, [currentUser, token]);

  const login = (email: string, _password?: string): boolean => {
    const found = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (found) {
      const generatedToken = `bibi_jwt_${found.id}_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`;
      setToken(generatedToken);
      setCurrentUser(found);
      localStorage.setItem(AUTH_TOKEN_KEY, generatedToken);
      localStorage.setItem(AUTH_USER_KEY, JSON.stringify(found));
      return true;
    }
    return false;
  };

  const register = (name: string, email: string, phone: string, role: UserRole = 'buyer') => {
    const newUser: User = {
      id: `user-${Date.now()}`,
      name,
      email,
      phone,
      avatar: `https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80`,
      role,
      rating: 5.0,
      ratingCount: 0,
      location: 'Việt Nam',
      joinedDate: new Date().toISOString().split('T')[0],
    };
    const generatedToken = `bibi_jwt_${newUser.id}_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`;
    setToken(generatedToken);
    setUsers((prev) => [...prev, newUser]);
    setCurrentUser(newUser);
    localStorage.setItem(AUTH_TOKEN_KEY, generatedToken);
    localStorage.setItem(AUTH_USER_KEY, JSON.stringify(newUser));
  };

  const switchRole = (role: UserRole) => {
    // Find pre-configured user matching this role or create one
    const targetUser = users.find((u) => u.role === role);
    if (targetUser) {
      setCurrentUser(targetUser);
    } else if (currentUser) {
      const updated = { ...currentUser, role };
      setCurrentUser(updated);
      setUsers((prev) => prev.map((u) => (u.id === updated.id ? updated : u)));
    }
  };

  const switchUser = (userId: string) => {
    const user = users.find((u) => u.id === userId);
    if (user) {
      setCurrentUser(user);
    }
  };

  const changePassword = (oldPass: string, newPass: string): { success: boolean; message: string } => {
    if (!currentUser) {
      return { success: false, message: 'Bạn chưa đăng nhập!' };
    }
    if (!newPass || newPass.length < 6) {
      return { success: false, message: 'Mật khẩu mới phải có tối thiểu 6 ký tự!' };
    }
    // Update password hash/string in localStorage
    const PASS_KEY = `bibi_pass_${currentUser.id}`;
    const currentStoredPass = localStorage.getItem(PASS_KEY) || '123456';

    if (oldPass !== currentStoredPass) {
      return { success: false, message: 'Mật khẩu hiện tại không chính xác!' };
    }

    localStorage.setItem(PASS_KEY, newPass);
    return { success: true, message: 'Đổi mật khẩu thành công!' };
  };

  const updateProfile = (updatedData: Partial<User>) => {
    if (!currentUser) return;
    const updated = { ...currentUser, ...updatedData };
    setCurrentUser(updated);
    setUsers((prev) => prev.map((u) => (u.id === updated.id ? updated : u)));
  };

  const logout = () => {
    localStorage.removeItem(AUTH_USER_KEY);
    localStorage.removeItem(AUTH_TOKEN_KEY);
    setToken(null);
    setCurrentUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        token,
        isAuthenticated: !!currentUser && !!token,
        login,
        register,
        changePassword,
        switchRole,
        switchUser,
        updateProfile,
        logout,
        allUsers: users,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
