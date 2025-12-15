// src/context/AuthContext.tsx
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User } from '../types/user.types';
import { authService, UpdateProfileData } from '../services/api/auth.service';
import { toast } from 'react-hot-toast';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  token: string | null;
  login: (email: string, password: string, remember?: boolean) => Promise<void>;
  logout: () => Promise<void>;
  register: (data: any) => Promise<void>;
  updateProfile: (data: UpdateProfileData | FormData) => Promise<User>;
  refreshUser: () => Promise<void>;
  updateUser: (user: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    // Initialiser depuis localStorage
    const storedUser = localStorage.getItem('user');
    return storedUser ? JSON.parse(storedUser) : null;
  });
  
  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem('access_token');
  });
  
  const [isLoading, setIsLoading] = useState(false);

  // Fonction pour synchroniser l'utilisateur avec le serveur
  const syncUserWithServer = useCallback(async () => {
    if (!token) {
      setUser(null);
      return;
    }

    try {
      const serverUser = await authService.getCurrentUser();
      setUser(serverUser);
      localStorage.setItem('user', JSON.stringify(serverUser));
    } catch (error: any) {
      console.error('Sync user error:', error);
      
      // Si erreur 401, déconnecter
      if (error.response?.status === 401) {
        await logout();
      }
    }
  }, [token]);

  // Initialiser au montage
  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('access_token');
      const storedUser = localStorage.getItem('user');

      if (storedToken && storedUser) {
        try {
          // Vérifier si le token est encore valide
          const userData = JSON.parse(storedUser);
          setUser(userData);
          setToken(storedToken);
          
          // Synchroniser en arrière-plan
          setTimeout(() => {
            syncUserWithServer();
          }, 1000);
          
        } catch (error) {
          console.error('Error parsing stored user:', error);
          localStorage.removeItem('access_token');
          localStorage.removeItem('user');
          setUser(null);
          setToken(null);
        }
      }
    };

    initAuth();
  }, [syncUserWithServer]);

  // Login function
  const login = async (email: string, password: string, remember?: boolean): Promise<void> => {
    setIsLoading(true);
    try {
      const { user: userData, access_token } = await authService.login({ 
        email, 
        password, 
        remember 
      });
      
      setUser(userData);
      setToken(access_token);
      
      // Sauvegarder dans localStorage
      localStorage.setItem('access_token', access_token);
      localStorage.setItem('user', JSON.stringify(userData));
      
    } catch (error: any) {
      const errorMessage = error.response?.data?.message 
        || error.response?.data?.error 
        || error.message 
        || 'Erreur de connexion';
      
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Logout function
  const logout = async (): Promise<void> => {
    setIsLoading(true);
    try {
      await authService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
      setToken(null);
      localStorage.removeItem('access_token');
      localStorage.removeItem('user');
      setIsLoading(false);
    }
  };

  // Register function
  const register = async (data: any): Promise<void> => {
    setIsLoading(true);
    try {
      const { user: userData, access_token } = await authService.register(data);
      setUser(userData);
      setToken(access_token);
      
      localStorage.setItem('access_token', access_token);
      localStorage.setItem('user', JSON.stringify(userData));
      
    } catch (error: any) {
      const errorMessage = error.response?.data?.message 
        || error.response?.data?.errors 
        || error.message 
        || 'Erreur d\'inscription';
      
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Update profile function - CORRIGÉ
  const updateProfile = async (data: UpdateProfileData | FormData): Promise<User> => {
    if (!user || !token) {
      throw new Error('Utilisateur non connecté');
    }

    setIsLoading(true);
    try {
      // Appeler le service avec l'ID utilisateur
      const updatedUser = await authService.updateProfile(user.id, data);
      
      // CRITIQUE : Vérifier si l'API retourne un nouveau token
      if ((updatedUser as any).access_token) {
        const newToken = (updatedUser as any).access_token;
        setToken(newToken);
        localStorage.setItem('access_token', newToken);
      }
      
      // Mettre à jour le state
      setUser(updatedUser);
      
      // Sauvegarder dans localStorage
      localStorage.setItem('user', JSON.stringify(updatedUser));
      
      return updatedUser;
    } catch (error: any) {
      console.error('Update profile context error:', error);
      
      // Vérifier si c'est une erreur d'authentification
      if (error.response?.status === 401) {
        await logout();
        throw new Error('Session expirée. Veuillez vous reconnecter.');
      }
      
      // Extraire le message d'erreur
      let errorMessage = 'Erreur lors de la mise à jour du profil';
      
      if (error.response?.data) {
        const errorData = error.response.data;
        
        if (typeof errorData === 'string') {
          errorMessage = errorData;
        } else if (errorData.message) {
          errorMessage = errorData.message;
        } else if (errorData.errors) {
          // Concaténer les erreurs de validation Laravel
          const validationErrors = Object.values(errorData.errors).flat();
          errorMessage = validationErrors.join(', ');
        }
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Rafraîchir les données utilisateur
  const refreshUser = async (): Promise<void> => {
    if (!token) return;
    
    setIsLoading(true);
    try {
      const freshUser = await authService.getCurrentUser();
      setUser(freshUser);
      localStorage.setItem('user', JSON.stringify(freshUser));
    } catch (error: any) {
      console.error('Refresh user error:', error);
      
      // Si erreur 401, déconnecter
      if (error.response?.status === 401) {
        await logout();
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Mettre à jour manuellement l'utilisateur
  const updateUser = (updatedUser: User) => {
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
  };

  // Valeur du contexte
  const value: AuthContextType = {
    user,
    isLoading,
    token,
    login,
    logout,
    register,
    updateProfile,
    refreshUser,
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