// src/layouts/DashboardLayout.tsx
import React, { useState } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  Building, 
  Package, 
  ShoppingCart, 
  Truck,
  BarChart3,
  Settings,
  LogOut,
  Menu,
  X,
  User,
  Bell,
  HelpCircle,
  Home
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import NotificationBell from '../components/notifications/NotificationBell';
import { UserRole } from '../types/user.types';

interface DashboardLayoutProps {
  role: UserRole;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ role }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout } = useAuth();
  const { unreadCount } = useNotifications();
  const navigate = useNavigate();
  const location = useLocation();

  const getNavigationItems = () => {
    const commonItems = [
      { name: 'Tableau de bord', icon: LayoutDashboard, path: `/${role}`, exact: true },
    ];

    switch (role) {
      case 'admin':
        return [
          ...commonItems,
          { name: 'Utilisateurs', icon: Users, path: '/admin/users' },
          { name: 'Pharmacies', icon: Building, path: '/admin/pharmacies' },
          { name: 'Statistiques', icon: BarChart3, path: '/admin/statistics' },
          { name: 'Paramètres', icon: Settings, path: '/admin/settings' },
        ];
      
      case 'pharmacien':
        return [
          ...commonItems,
          { name: 'Médicaments', icon: Package, path: '/pharmacien/medicaments' },
          { name: 'Commandes', icon: ShoppingCart, path: '/pharmacien/commandes' },
          { name: 'Paramètres', icon: Settings, path: '/pharmacien/settings' },
        ];
      
      case 'client':
        return [
          ...commonItems,
          { name: 'Mes Commandes', icon: ShoppingCart, path: '/client/commandes' },
          { name: 'Mon Panier', icon: Package, path: '/client/cart' },
          { name: 'Mon Profil', icon: User, path: '/client/profile' },
        ];
      
      case 'livreur':
        return [
          ...commonItems,
          { name: 'Livraisons', icon: Truck, path: '/livreur/livraisons' },
          { name: 'Carte', icon: LayoutDashboard, path: '/livreur/map' },
          { name: 'Mon Profil', icon: User, path: '/livreur/profile' },
        ];
      
      default:
        return commonItems;
    }
  };

  const navigationItems = getNavigationItems();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
    }
  };

  const isActive = (path: string, exact: boolean = false) => {
    if (exact) {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Barre latérale pour mobile */}
      <div className={`fixed inset-0 z-40 lg:hidden ${sidebarOpen ? 'block' : 'hidden'}`}>
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)}></div>
        
        <div className="fixed inset-y-0 left-0 flex flex-col w-64 bg-white shadow-xl z-50">
          {/* En-tête sidebar mobile */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold">PT</span>
              </div>
              <div>
                <p className="font-bold text-gray-900">PharmaTogo</p>
                <p className="text-xs text-gray-600 capitalize">{role}</p>
              </div>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Navigation mobile */}
          <nav className="flex-1 overflow-y-auto p-4">
            <div className="space-y-1">
              {navigationItems.map((item) => (
                <Link
                  key={item.name}
                  to={item.path}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center px-3 py-2 rounded-lg ${
                    isActive(item.path, item.exact)
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <item.icon className="h-5 w-5 mr-3" />
                  {item.name}
                </Link>
              ))}
            </div>
          </nav>

          {/* Footer sidebar mobile */}
          <div className="p-4 border-t border-gray-200">
            <button
              onClick={handleLogout}
              className="flex items-center w-full px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg"
            >
              <LogOut className="h-5 w-5 mr-3" />
              Déconnexion
            </button>
          </div>
        </div>
      </div>

      {/* Barre latérale desktop */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col lg:border-r lg:border-gray-200 lg:bg-white">
        {/* En-tête sidebar desktop */}
        <div className="flex items-center p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="h-12 w-12 bg-blue-600 rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-xl">PT</span>
            </div>
            <div>
              <p className="font-bold text-gray-900">PharmaTogo</p>
              <p className="text-sm text-gray-600 capitalize">{role}</p>
            </div>
          </div>
        </div>

        {/* Navigation desktop */}
        <nav className="flex-1 overflow-y-auto p-4">
          <div className="space-y-1">
            {navigationItems.map((item) => (
              <Link
                key={item.name}
                to={item.path}
                className={`flex items-center px-3 py-2 rounded-lg ${
                  isActive(item.path, item.exact)
                    ? 'bg-blue-100 text-blue-700 font-medium'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <item.icon className="h-5 w-5 mr-3" />
                {item.name}
              </Link>
            ))}
          </div>
        </nav>

        {/* User info */}
        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
              <User className="h-5 w-5 text-blue-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">{user?.name}</p>
              <p className="text-xs text-gray-600 truncate">{user?.email}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Contenu principal */}
      <div className="lg:pl-64">
        {/* Barre de navigation supérieure */}
        <header className="sticky top-0 z-30 bg-white shadow-sm">
          <div className="flex items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
            {/* Bouton menu mobile */}
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden text-gray-600 hover:text-gray-900"
            >
              <Menu className="h-6 w-6" />
            </button>

            {/* Barre de recherche et actions */}
            <div className="flex-1 flex items-center justify-between lg:justify-end space-x-4">
              {/* Retour à l'accueil */}
              <Link
                to="/"
                className="hidden md:inline-flex items-center px-3 py-2 text-gray-600 hover:text-gray-900"
              >
                <Home className="h-5 w-5 mr-2" />
                Retour au site
              </Link>

              {/* Notifications */}
              <NotificationBell />

              {/* Aide */}
              <button className="text-gray-600 hover:text-gray-900">
                <HelpCircle className="h-6 w-6" />
              </button>

              {/* Bouton déconnexion */}
              <button
                onClick={handleLogout}
                className="hidden lg:inline-flex items-center px-3 py-2 text-red-600 hover:text-red-800"
              >
                <LogOut className="h-5 w-5 mr-2" />
                Déconnexion
              </button>
            </div>
          </div>
        </header>

        {/* Contenu */}
        <main className="py-6">
          <div className="px-4 sm:px-6 lg:px-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;