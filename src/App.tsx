import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { DownloadProvider } from './context/DownloadContext';
import { SearchProvider } from './context/SearchContext';
import { ApiConfigProvider } from './context/ApiConfigContext';
import MainLayout from './layouts/MainLayout';
import LoginPage from './pages/login/LoginPage';
import HomePage from './pages/home/HomePage';
import SearchResultsPage from './pages/search/SearchResultsPage';
import MediaDetailsPage from './pages/media/MediaDetailsPage';
import MediaResourcesPage from './pages/media/MediaResourcesPage';
import DownloadsPage from './pages/DownloadsPage';
import AdvancedSearchPage from './pages/search/AdvancedSearchPage';
import ProtectedRoute from './components/ProtectedRoute';

// Wrapper component for HomePage to manage tab state
const HomePageWrapper: React.FC = () => {
  const [currentTab, setCurrentTab] = useState(0);
  
  return (
    <MainLayout homeTab={currentTab} onHomeTabChange={setCurrentTab}>
      <HomePage currentTab={currentTab} onTabChange={setCurrentTab} />
    </MainLayout>
  );
};

const AppRoutes: React.FC = () => {
  return (
    <Router>
      <ApiConfigProvider>
        <AuthProvider>
          <DownloadProvider>
            <SearchProvider>
            <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <HomePageWrapper />
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
              path="/media/:id"
              element={
                <ProtectedRoute>
                  <MainLayout title="Media Details">
                    <MediaDetailsPage />
                  </MainLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/media/:id/resources"
              element={
                <ProtectedRoute>
                  <MainLayout title="Media Resources">
                    <MediaResourcesPage />
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
            <Route
              path="/advanced-search"
              element={
                <ProtectedRoute>
                  <MainLayout title="Advanced Search">
                    <AdvancedSearchPage />
                  </MainLayout>
                </ProtectedRoute>
              }
            />
            <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
            </SearchProvider>
          </DownloadProvider>
        </AuthProvider>
      </ApiConfigProvider>
    </Router>
  );
};

export default AppRoutes;
