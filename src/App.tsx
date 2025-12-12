// src/App.tsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';

// Layouts
import MainLayout from './layouts/MainLayout';
import AuthLayout from './layouts/AuthLayout';
import DashboardLayout from './layouts/DashboardLayout';

// Pages publiques
import HomePage from './pages/public/HomePage';
import SearchPage from './pages/public/SearchPage';
import PharmaciesPage from './pages/public/PharmaciesPage';
import PharmacyDetailPage from './pages/public/PharmacyDetailPage';
import MedicamentsPage from './pages/public/MedicamentsPage';
import MedicamentDetailPage from './pages/public/MedicamentDetailPage';

// Pages auth
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';

// Pages dashboard - Admin
import AdminDashboard from './pages/dashboard/admin/AdminDashboard';
import UsersManagement from './pages/dashboard/admin/UsersManagement';
import PharmaciesManagement from './pages/dashboard/admin/PharmaciesManagement';
import StatisticsPage from './pages/dashboard/admin/StatisticsPage';

// Pages dashboard - Pharmacien
import PharmacienDashboard from './pages/dashboard/pharmacien/PharmacienDashboard';
import MedicamentsManagement from './pages/dashboard/pharmacien/MedicamentsManagement';
import CommandesManagement from './pages/dashboard/pharmacien/CommandesManagement';
import PharmacySettings from './pages/dashboard/pharmacien/PharmacySettings';

// Pages dashboard - Client
import ClientDashboard from './pages/dashboard/client/ClientDashboard';
import CartPage from './pages/dashboard/client/CartPage';
import CommandesPage from './pages/dashboard/client/CommandesPage';
import ProfilePage from './pages/dashboard/client/ProfilePage';

// Pages dashboard - Livreur
import LivreurDashboard from './pages/dashboard/livreur/LivreurDashboard';
import LivraisonsPage from './pages/dashboard/livreur/LivraisonsPage';
import MapTrackingPage from './pages/dashboard/livreur/MapTrackingPage';

// Components
import ProtectedRoute from './components/shared/ProtectedRoute';
import PharmacyCreatePage from './pages/dashboard/pharmacien/PharmacyCreatePage';
import CreatePharmacyPage from './pages/dashboard/pharmacien/PharmacyCreatePage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <NotificationProvider>
          <Router>
            <div className="min-h-screen bg-gray-50">
              <Routes>
                {/* Routes publiques */}
                <Route element={<MainLayout />}>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/search" element={<SearchPage />} />
                  <Route path="/pharmacies" element={<PharmaciesPage />} />
                  <Route path="/pharmacies/:id" element={<PharmacyDetailPage />} />
                  <Route path="/medicaments" element={<MedicamentsPage />} />
                  <Route path="/medicaments/:id" element={<MedicamentDetailPage />} />
                </Route>

                {/* Routes d'authentification */}
                <Route element={<AuthLayout />}>
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/register" element={<RegisterPage />} />
                  <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                </Route>

                {/* Routes protégées - Admin */}
                <Route path="/admin">
                  <Route index element={
                    <ProtectedRoute requiredRole="admin">
                      <DashboardLayout role="admin">
                        <AdminDashboard />
                      </DashboardLayout>
                    </ProtectedRoute>
                  } />
                  <Route path="users" element={
                    <ProtectedRoute requiredRole="admin">
                      <DashboardLayout role="admin">
                        <UsersManagement />
                      </DashboardLayout>
                    </ProtectedRoute>
                  } />
                  <Route path="pharmacies" element={
                    <ProtectedRoute requiredRole="admin">
                      <DashboardLayout role="admin">
                        <PharmaciesManagement />
                      </DashboardLayout>
                    </ProtectedRoute>
                  } />

                  // Dans src/App.tsx, ajoutez cette route dans les routes pharmacien
                  <Route path="/pharmacien/pharmacy/create" element={
                    <ProtectedRoute requiredRole="pharmacien">
                      <DashboardLayout role="pharmacien">
                        <CreatePharmacyPage />
                      </DashboardLayout>
                    </ProtectedRoute>
                  } />

                  <Route path="statistics" element={
                    <ProtectedRoute requiredRole="admin">
                      <DashboardLayout role="admin">
                        <StatisticsPage />
                      </DashboardLayout>
                    </ProtectedRoute>
                  } />
                </Route>

                {/* Routes protégées - Pharmacien */}
                <Route path="/pharmacien">
                  <Route index element={
                    <ProtectedRoute requiredRole="pharmacien">
                      <DashboardLayout role="pharmacien">
                        <PharmacienDashboard />
                      </DashboardLayout>
                    </ProtectedRoute>
                  } />
                  <Route path="medicaments" element={
                    <ProtectedRoute requiredRole="pharmacien">
                      <DashboardLayout role="pharmacien">
                        <MedicamentsManagement />
                      </DashboardLayout>
                    </ProtectedRoute>
                  } />
                  <Route path="commandes" element={
                    <ProtectedRoute requiredRole="pharmacien">
                      <DashboardLayout role="pharmacien">
                        <CommandesManagement />
                      </DashboardLayout>
                    </ProtectedRoute>
                  } />
                  <Route path="commandes/:id" element={
                    <ProtectedRoute requiredRole="pharmacien">
                      <DashboardLayout role="pharmacien">
                        <CommandesManagement />
                      </DashboardLayout>
                    </ProtectedRoute>
                  } />
                  <Route path="settings" element={
                    <ProtectedRoute requiredRole="pharmacien">
                      <DashboardLayout role="pharmacien">
                        <PharmacySettings />
                      </DashboardLayout>
                    </ProtectedRoute>
                  } />
                </Route>

                {/* Routes protégées - Client */}
                <Route path="/client">
                  <Route index element={
                    <ProtectedRoute requiredRole="client">
                      <DashboardLayout role="client">
                        <ClientDashboard />
                      </DashboardLayout>
                    </ProtectedRoute>
                  } />
                  <Route path="cart" element={
                    <ProtectedRoute requiredRole="client">
                      <DashboardLayout role="client">
                        <CartPage />
                      </DashboardLayout>
                    </ProtectedRoute>
                  } />
                  <Route path="commandes" element={
                    <ProtectedRoute requiredRole="client">
                      <DashboardLayout role="client">
                        <CommandesPage />
                      </DashboardLayout>
                    </ProtectedRoute>
                  } />
                  <Route path="profile" element={
                    <ProtectedRoute requiredRole="client">
                      <DashboardLayout role="client">
                        <ProfilePage />
                      </DashboardLayout>
                    </ProtectedRoute>
                  } />
                </Route>

                {/* Routes protégées - Livreur */}
                <Route path="/livreur">
                  <Route index element={
                    <ProtectedRoute requiredRole="livreur">
                      <DashboardLayout role="livreur">
                        <LivreurDashboard />
                      </DashboardLayout>
                    </ProtectedRoute>
                  } />
                  <Route path="livraisons" element={
                    <ProtectedRoute requiredRole="livreur">
                      <DashboardLayout role="livreur">
                        <LivraisonsPage />
                      </DashboardLayout>
                    </ProtectedRoute>
                  } />
                  <Route path="map" element={
                    <ProtectedRoute requiredRole="livreur">
                      <DashboardLayout role="livreur">
                        <MapTrackingPage />
                      </DashboardLayout>
                    </ProtectedRoute>
                  } />
                </Route>

                {/* Redirection par défaut */}
                <Route path="*" element={<Navigate to="/" />} />
              </Routes>
              <Toaster
                position="top-right"
                toastOptions={{
                  duration: 4000,
                  style: {
                    background: '#363636',
                    color: '#fff',
                  },
                  success: {
                    duration: 3000,
                    iconTheme: {
                      primary: '#10B981',
                      secondary: '#fff',
                    },
                  },
                  error: {
                    duration: 4000,
                    iconTheme: {
                      primary: '#EF4444',
                      secondary: '#fff',
                    },
                  },
                }}
              />
            </div>
          </Router>
        </NotificationProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;