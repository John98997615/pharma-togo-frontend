// src/context/AuthContext.tsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types/user.types';
import { authService } from '../services/api/auth.service';

interface AuthContextType {
  user: User | null;
  isLoading: boolean; // Ajoutez cette ligne
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  register: (data: any) => Promise<void>;
  updateProfile: (data: any) => Promise<User>; // Ajoutez cette ligne
  updateUser: (user: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true); // Renommez en isLoading

  // Initialisation
  useEffect(() => {
    const initAuth = async () => {
      try {
        const storedUser = authService.getStoredUser();

        if (storedUser && authService.isAuthenticated()) {
          // Vérifier avec le serveur
          const freshUser = await authService.getCurrentUser();
          setUser(freshUser);
        }
      } catch (error) {
        console.log('Session expirée, nettoyage...');
        localStorage.removeItem('access_token');
        localStorage.removeItem('user');
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (email: string, password: string): Promise<void> => {
    setIsLoading(true);
    try {
      const { user: userData } = await authService.login({ email, password });
      setUser(userData);
    } catch (error: any) {
      // Gestion des erreurs...
      // src/context/AuthContext.tsx - dans initAuth ou login
      console.log('User data:', user);
      console.log('User pharmacy:', user?.pharmacy);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    await authService.logout();
    setUser(null);
  };

  const register = async (data: any): Promise<void> => {
    setIsLoading(true);
    try {
      const { user: userData } = await authService.register(data);
      setUser(userData);
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Ajoutez cette fonction
  const updateProfile = async (data: any): Promise<User> => {
    if (!user) throw new Error('Utilisateur non connecté');

    setIsLoading(true);
    try {
      const updatedUser = await authService.updateProfile(user.id, data);
      setUser(updatedUser);
      return updatedUser;
    } finally {
      setIsLoading(false);
    }
  };

  const updateUser = (updatedUser: User) => {
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
  };

  const value: AuthContextType = {
    user,
    isLoading, // Utilisez isLoading
    login,
    logout,
    register,
    updateProfile, // Ajoutez cette ligne
    updateUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};