import { create } from 'zustand';
import { User } from '@/lib/types';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  hydrated: boolean;
  setAuth: (user: User, token: string) => void;
  clearAuth: () => void;
  loadFromStorage: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  hydrated: false,
  
  setAuth: (user, token) => {
    // Filtrar apenas os campos essenciais do usuário
    const filteredUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };

    localStorage.setItem('user', JSON.stringify(filteredUser));
    localStorage.setItem('token', token);
    set({ user: filteredUser, token, isAuthenticated: true, hydrated: true });
  },
  
  clearAuth: () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    set({ user: null, token: null, isAuthenticated: false, hydrated: true });
  },
  
  loadFromStorage: () => {
    const userStr = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    
    try {
      if (userStr && token) {
        const user = JSON.parse(userStr);
        set({ user, token, isAuthenticated: true, hydrated: true });
      } else {
        set({ hydrated: true });
      }
    } catch (error) {
      console.error('Error loading auth from storage:', error);
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      set({ user: null, token: null, isAuthenticated: false, hydrated: true });
    }
  },
}));
