import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContent';
import ProtectedRoute from './utils/ProtectedRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import NotificationsPage from './pages/NotificationsPage';  // Add this

function App() {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <Routes>
      <Route 
        path="/login" 
        element={
          !isAuthenticated ? <Login /> : <Navigate to="/dashboard" replace />
        } 
      />
      <Route 
        path="/register" 
        element={
          !isAuthenticated ? <Register /> : <Navigate to="/dashboard" replace />
        } 
      />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/notifications"
        element={
          <ProtectedRoute>
            <NotificationsPage />
          </ProtectedRoute>
        }
      />
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

export default App;