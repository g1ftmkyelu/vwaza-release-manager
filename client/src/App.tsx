import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import MainLayout from './layouts/MainLayout'; 
import AuthLayout from './layouts/AuthLayout';
import DashboardLayout from './layouts/DashboardLayout';
import PublicLayout from './layouts/PublicLayout'; 
import LoadingSpinner from './components/common/LoadingSpinner';
import { Toaster } from 'react-hot-toast';
import NotFound from './pages/NotFound';
import { UserRole } from '@shared/types';
import PublicAuthRedirect from './components/common/PublicAuthRedirect'; 
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const ArtistDashboard = lazy(() => import('./pages/artist/Dashboard'));
const CreateRelease = lazy(() => import('./pages/artist/CreateRelease'));
const AdminDashboard = lazy(() => import('./pages/admin/Dashboard'));
const AdminReviewQueuePage = lazy(() => import('./pages/admin/ReviewQueuePage'));
const ReleaseReview = lazy(() => import('./components/admin/ReleaseReview'));
const Profile = lazy(() => import('./pages/Profile'));

const HomePage = lazy(() => import('./pages/public/HomePage'));
const BrowseAlbumsPage = lazy(() => import('./pages/public/BrowseAlbumsPage'));
const AlbumDetailsPage = lazy(() => import('./pages/public/AlbumDetailsPage'));
const BrowseTracksPage = lazy(() => import('./pages/public/BrowseTracksPage')); // 

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
  const { isAuthenticated, user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-dark-bg-primary">
        <LoadingSpinner />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />; page
  }

  return <>{children}</>;
};

const AppRoutes: React.FC = () => {
  const { isLoading } = useAuth(); 

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-dark-bg-primary">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen bg-dark-bg-primary">
        <LoadingSpinner />
      </div>
    }>
      <Routes>
        
        <Route path="/" element={<PublicLayout />}>
          <Route index element={<HomePage />} />
          <Route path="albums" element={<BrowseAlbumsPage />} />
          <Route path="albums/:id" element={<AlbumDetailsPage />} />
          <Route path="tracks" element={<BrowseTracksPage />} /> 
        </Route>


        <Route path="/" element={<AuthLayout />}>
          <Route path="login" element={<PublicAuthRedirect><Login /></PublicAuthRedirect>} />
          <Route path="register" element={<PublicAuthRedirect><Register /></PublicAuthRedirect>} />
          <Route path="unauthorized" element={<div className="text-red-500 text-center mt-20">You are not authorized to view this page.</div>} />
        </Route>


        <Route path="/" element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
          <Route path="artist/dashboard" element={<ProtectedRoute allowedRoles={['ARTIST']}><ArtistDashboard /></ProtectedRoute>} />
          <Route path="artist/releases/new" element={<ProtectedRoute allowedRoles={['ARTIST']}><CreateRelease /></ProtectedRoute>} />
          <Route path="admin/dashboard" element={<ProtectedRoute allowedRoles={['ADMIN']}><AdminDashboard /></ProtectedRoute>} />
          <Route path="admin/review-queue" element={<ProtectedRoute allowedRoles={['ADMIN']}><AdminReviewQueuePage /></ProtectedRoute>} />
          <Route path="admin/releases/:id/review" element={<ProtectedRoute allowedRoles={['ADMIN']}><ReleaseReview /></ProtectedRoute>} />
          <Route path="profile" element={<ProtectedRoute allowedRoles={['ARTIST', 'ADMIN']}><Profile /></ProtectedRoute>} />
        </Route>

        {/* Catch-all for 404 */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
};

const App: React.FC = () => {
  return (
    <Router>
      <AuthProvider>
        <AppRoutes />
        <Toaster position="bottom-right" reverseOrder={false} />
      </AuthProvider>
    </Router>
  );
};

export default App;