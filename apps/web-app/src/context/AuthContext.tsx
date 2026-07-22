import React, { createContext, useContext, useState, useEffect } from 'react';
import { loginUserApi, registerUserApi } from '../services/api';

export interface UserProfile {
  id: string;
  fullName: string;
  email: string;
  avatarUrl?: string;
  phone?: string;
  loyaltyPoints?: number;
}

interface AuthContextType {
  user: UserProfile | null;
  isAuthenticated: boolean;
  login: (email: string) => Promise<void>;
  logout: () => void;
  register: (fullName: string, email: string) => Promise<void>;
  isAuthModalOpen: boolean;
  setIsAuthModalOpen: (open: boolean) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const USER_STORAGE_KEY = 'omnidrop_user_session_v1';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(() => {
    try {
      const saved = localStorage.getItem(USER_STORAGE_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);

  useEffect(() => {
    try {
      if (user) {
        localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
      } else {
        localStorage.removeItem(USER_STORAGE_KEY);
      }
    } catch (e) {
      console.error('Failed to persist user session', e);
    }
  }, [user]);

  const login = async (email: string) => {
    try {
      const dbUser = await loginUserApi(email);
      setUser({
        id: dbUser.id,
        fullName: dbUser.fullName,
        email: dbUser.email,
        avatarUrl: dbUser.avatarUrl,
        phone: dbUser.phone,
        loyaltyPoints: dbUser.loyaltyPoints,
      });
    } catch {
      // Fallback
      const name = email.split('@')[0] || 'Khách Hàng VIP';
      setUser({
        id: `usr_${Math.floor(10000 + Math.random() * 90000)}`,
        fullName: name.charAt(0).toUpperCase() + name.slice(1),
        email,
        avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`,
        phone: '0987654321',
      });
    } finally {
      setIsAuthModalOpen(false);
    }
  };

  const register = async (fullName: string, email: string) => {
    try {
      const dbUser = await registerUserApi({ fullName, email });
      setUser({
        id: dbUser.id,
        fullName: dbUser.fullName,
        email: dbUser.email,
        avatarUrl: dbUser.avatarUrl,
        phone: dbUser.phone,
        loyaltyPoints: dbUser.loyaltyPoints,
      });
    } catch {
      // Fallback
      setUser({
        id: `usr_${Math.floor(10000 + Math.random() * 90000)}`,
        fullName,
        email,
        avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`,
        phone: '0987654321',
      });
    } finally {
      setIsAuthModalOpen(false);
    }
  };

  const logout = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        login,
        logout,
        register,
        isAuthModalOpen,
        setIsAuthModalOpen,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
