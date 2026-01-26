'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import api from '@/lib/api';
import { User, AuthResponse, LoginCredentials } from '@/lib/types';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => void;
  updateUser: (user: User) => void;
  refreshUser: () => Promise<User | void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // Carrega o usuário do localStorage e valida com o backend
  useEffect(() => {
    const initAuth = async () => {
      try {
        const token = localStorage.getItem('token');
        const rememberMeToken = localStorage.getItem('rememberMeToken');
        const storedUser = localStorage.getItem('user');


        if (token && storedUser) {
          try {
            // Valida o token com o backend
            const response = await api.get('/auth/me');
            let userData = response.data.data;
            
            // Se for SELLER ou AFFILIATE, busca dados adicionais do profile
            if (userData.role === 'SELLER' || userData.role === 'AFFILIATE') {
              try {
                const profileResponse = await api.get('/seller/profile');
                const profileData = profileResponse.data.data;
                // Atualiza userData com qrCodeUrl do profile
                userData = { ...userData, qrCodeUrl: profileData.qrCodeUrl, qrCode: profileData.qrCode };
              } catch (profileError) {
                console.warn('Erro ao buscar profile do seller:', profileError);
                // Continua sem qrCodeUrl se falhar
              }
            }
            
            setUser(userData);
            localStorage.setItem('user', JSON.stringify(userData));
          } catch (jwtError: any) {
            // JWT expirou, tenta rememberMeToken
            
            if (rememberMeToken) {
              try {
                const response = await api.post<{ data: AuthResponse }>('/auth/validate-remember-me', {
                  rememberMeToken,
                });
                const { token: newToken, user: userData, rememberMeToken: newRememberMeToken } = response.data.data;
                let userDataMutable = userData;

                // Se for SELLER ou AFFILIATE, busca dados adicionais do profile
                if (userDataMutable.role === 'SELLER' || userDataMutable.role === 'AFFILIATE') {
                  try {
                    const profileResponse = await api.get('/seller/profile');
                    const profileData = profileResponse.data.data;
                    // Atualiza userData com qrCodeUrl do profile
                    userDataMutable = { ...userDataMutable, qrCodeUrl: profileData.qrCodeUrl, qrCode: profileData.qrCode };
                  } catch (profileError) {
                    console.warn('Erro ao buscar profile do seller:', profileError);
                    // Continua sem qrCodeUrl se falhar
                  }
                }

                // Salva os novos tokens
                localStorage.setItem('token', newToken);
                localStorage.setItem('user', JSON.stringify(userDataMutable));
                if (newRememberMeToken) {
                  localStorage.setItem('rememberMeToken', newRememberMeToken);
                }

                setUser(userDataMutable);
              } catch (rememberError: any) {
                // Token de "lembrar" também expirou ou é inválido
                localStorage.removeItem('rememberMeToken');
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                setUser(null);
              }
            } else {
              // Sem rememberMeToken, limpa tudo
              localStorage.removeItem('token');
              localStorage.removeItem('user');
              setUser(null);
            }
          }
        } else if (rememberMeToken && !token) {
          // Tenta usar o token de "lembrar de mim" para renovar a sessão
          try {
            const response = await api.post<{ data: AuthResponse }>('/auth/validate-remember-me', {
              rememberMeToken,
            });
            const { token: newToken, user: userData, rememberMeToken: newRememberMeToken } = response.data.data;
            let userDataMutable = userData;

            // Se for SELLER ou AFFILIATE, busca dados adicionais do profile
            if (userDataMutable.role === 'SELLER' || userDataMutable.role === 'AFFILIATE') {
              try {
                const profileResponse = await api.get('/seller/profile');
                const profileData = profileResponse.data.data;
                // Atualiza userData com qrCodeUrl do profile
                userDataMutable = { ...userDataMutable, qrCodeUrl: profileData.qrCodeUrl, qrCode: profileData.qrCode };
              } catch (profileError) {
                console.warn('Erro ao buscar profile do seller:', profileError);
                // Continua sem qrCodeUrl se falhar
              }
            }

            // Salva os novos tokens
            localStorage.setItem('token', newToken);
            localStorage.setItem('user', JSON.stringify(userDataMutable));
            if (newRememberMeToken) {
              localStorage.setItem('rememberMeToken', newRememberMeToken);
            }

            setUser(userDataMutable);
          } catch (error: any) {
            // Token de "lembrar" expirou ou é inválido
            localStorage.removeItem('rememberMeToken');
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            setUser(null);
          }
        } else {
          setUser(null);
        }
      } catch (error) {
        localStorage.removeItem('token');
        localStorage.removeItem('rememberMeToken');
        localStorage.removeItem('user');
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (credentials: LoginCredentials) => {
    try {
      const response = await api.post<{ data: AuthResponse }>('/auth/login', credentials);
      const { token, user: userData, rememberMeToken } = response.data.data;

      // Salva no localStorage
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(userData));
      
      // Salva o token também em cookie para o middleware validar
      // Validade de 1 dia (86400 segundos)
      document.cookie = `token=${token}; path=/; max-age=86400; SameSite=Strict`;
      
      // Salva o token de "lembrar de mim" se foi marcado o checkbox
      if (rememberMeToken && credentials.rememberMe) {
        localStorage.setItem('rememberMeToken', rememberMeToken);
        document.cookie = `rememberMeToken=${rememberMeToken}; path=/; max-age=2592000; SameSite=Strict`;
      } else {
        // Remove se desmarcou o checkbox
        localStorage.removeItem('rememberMeToken');
        document.cookie = 'rememberMeToken=; path=/; max-age=0';
      }

      // Atualiza o estado
      setUser(userData);

      toast.success('Login realizado com sucesso!');

      // Redireciona para a página de redirect que vai fazer o direcionamento correto
      router.push('/login-redirect');
    } catch (error: any) {
      console.error('[AuthContext] Erro no login:', error.response?.status, error.response?.data);
      const message = error.response?.data?.message || 'Erro ao fazer login';
      toast.error(message);
    }
  };

  const logout = () => {
    // Limpa o storage
    localStorage.removeItem('token');
    localStorage.removeItem('rememberMeToken');
    localStorage.removeItem('user');

    // Limpa os cookies
    document.cookie = 'token=; path=/; max-age=0';
    document.cookie = 'rememberMeToken=; path=/; max-age=0';

    // Limpa o estado
    setUser(null);

    toast.success('Logout realizado com sucesso!');
    router.push('/login');
  };

  const updateUser = (updatedUser: User) => {
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
  };

  const refreshUser = async () => {
    try {
      const response = await api.get('/auth/me');
      let userData = response.data.data;
      
      // Se for SELLER ou AFFILIATE, busca dados adicionais do profile
      if (userData.role === 'SELLER' || userData.role === 'AFFILIATE') {
        try {
          const profileResponse = await api.get('/seller/profile');
          const profileData = profileResponse.data.data;
          // Atualiza userData com qrCodeUrl do profile
          userData = { ...userData, qrCodeUrl: profileData.qrCodeUrl, qrCode: profileData.qrCode };
        } catch (profileError) {
          console.warn('Erro ao buscar profile do seller:', profileError);
          // Continua sem qrCodeUrl se falhar
        }
      }
      
      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));
      return userData;
    } catch (error) {
      console.error('Erro ao atualizar usuário:', error);
      // Se falhar, faz logout
      logout();
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
        updateUser,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
}
