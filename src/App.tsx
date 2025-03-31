import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { DownloadProvider } from './context/DownloadContext';
import MainLayout from './layouts/MainLayout';
import LoginPage from './pages/LoginPage';
import HomePage from './pages/HomePage';
import SearchResultsPage from './pages/SearchResultsPage';
import MovieDetailsPage from './pages/MovieDetailsPage';
import MovieResourcesPage from './pages/MovieResourcesPage';
import DownloadsPage from './pages/DownloadsPage';
import ProtectedRoute from './components/ProtectedRoute';

const AppRoutes: React.FC = () => {
  return (
    <Router>
      <AuthProvider>
        <DownloadProvider>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <MainLayout>
                    <HomePage />
                  </MainLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/search"
              element={
                <ProtectedRoute>
                  <MainLayout title="Search Results">
                    <SearchResultsPage />
                  </MainLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/movie/:id"
              element={
                <ProtectedRoute>
                  <MainLayout title="Movie Details">
                    <MovieDetailsPage />
                  </MainLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/movie/:id/resources"
              element={
                <ProtectedRoute>
                  <MainLayout title="Movie Resources">
                    <MovieResourcesPage />
                  </MainLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/downloads"
              element={
                <ProtectedRoute>
                  <MainLayout title="Downloads">
                    <DownloadsPage />
                  </MainLayout>
                </ProtectedRoute>
              }
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </DownloadProvider>
      </AuthProvider>
    </Router>
  );
};

export default AppRoutes;
