import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Layout } from './components/Layout/Layout';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { ListingsPage } from './pages/ListingsPage';
import { ListingDetailPage } from './pages/ListingDetailPage';
import { CategoriesPage } from './pages/CategoriesPage';
import { CategoryDetailPage } from './pages/CategoryDetailPage';
import { CategoryAttributesPage } from './pages/CategoryAttributesPage';
import { CategoryEditPage } from './pages/CategoryEditPage';
import { UsersPage } from './pages/UsersPage';
import AdminManagementPage from './pages/AdminManagementPage';
import ElasticsearchDashboardPage from './pages/ElasticsearchDashboardPage';
import RealTimeAnalyticsPage from './pages/RealTimeAnalyticsPage';
import AnalyticsDashboardPage from './pages/AnalyticsDashboardPage';
import DataExportPage from './pages/DataExportPage';
import PerformanceTestPage from './pages/PerformanceTestPage';
import { useAuthStore } from './stores/authStore';
import { CustomThemeProvider } from './contexts/ThemeContext';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
};

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <CustomThemeProvider>
        <Router basename={import.meta.env.DEV ? undefined : '/admin'}>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <Layout>
                    <DashboardPage />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/listings"
              element={
                <ProtectedRoute>
                  <Layout>
                    <ListingsPage />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/listings/:id"
              element={
                <ProtectedRoute>
                  <Layout>
                    <ListingDetailPage />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/categories"
              element={
                <ProtectedRoute>
                  <Layout>
                    <CategoriesPage />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/categories/:path"
              element={
                <ProtectedRoute>
                  <Layout>
                    <CategoryDetailPage />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/categories/:path/attributes"
              element={
                <ProtectedRoute>
                  <Layout>
                    <CategoryAttributesPage />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/categories/:path/edit"
              element={
                <ProtectedRoute>
                  <Layout>
                    <CategoryEditPage />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/users"
              element={
                <ProtectedRoute>
                  <Layout>
                    <UsersPage />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin-management"
              element={
                <ProtectedRoute>
                  <Layout>
                    <AdminManagementPage />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/elasticsearch"
              element={
                <ProtectedRoute>
                  <Layout>
                    <ElasticsearchDashboardPage />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/real-time-analytics"
              element={
                <ProtectedRoute>
                  <Layout>
                    <RealTimeAnalyticsPage />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/analytics"
              element={
                <ProtectedRoute>
                  <Layout>
                    <RealTimeAnalyticsPage />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/analytics-dashboard"
              element={
                <ProtectedRoute>
                  <Layout>
                    <AnalyticsDashboardPage />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/data-export"
              element={
                <ProtectedRoute>
                  <Layout>
                    <DataExportPage />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/performance-test"
              element={
                <ProtectedRoute>
                  <Layout>
                    <PerformanceTestPage />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
      </CustomThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
