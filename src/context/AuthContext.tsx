import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, UserRole } from '../types';
import { MOCK_USERS } from '../data/mockUsers';

interface AuthContextType {
  currentUser: User | null;
  isAuthenticated: boolean;
  login: (email: string, password?: string) => boolean;
  register: (name: string, email: string, phone: string, role?: UserRole) => void;
  switchRole: (role: UserRole) => void;
  switchUser: (userId: string) => void;
  updateProfile: (updatedData: Partial<User>) => void;
  logout: () => void;
  allUsers: User[];
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_USER_KEY = 'bibi_current_user_v2';
const ALL_USERS_KEY = 'bibi_all_users_v2';

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
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
    return MOCK_USERS[0]; // Default to Linh Bi (Seller/Owner)
  });

  useEffect(() => {
    localStorage.setItem(ALL_USERS_KEY, JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem(AUTH_USER_KEY, JSON.stringify(currentUser));
    } else {
      localStorage.removeItem(AUTH_USER_KEY);
    }
  }, [currentUser]);

  const login = (email: string, _password?: string): boolean => {
    const found = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (found) {
      setCurrentUser(found);
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
    setUsers((prev) => [...prev, newUser]);
    setCurrentUser(newUser);
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

  const updateProfile = (updatedData: Partial<User>) => {
    if (!currentUser) return;
    const updated = { ...currentUser, ...updatedData };
    setCurrentUser(updated);
    setUsers((prev) => prev.map((u) => (u.id === updated.id ? updated : u)));
  };

  const logout = () => {
    setCurrentUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        isAuthenticated: !!currentUser,
        login,
        register,
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
