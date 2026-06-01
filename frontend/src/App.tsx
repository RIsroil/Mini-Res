import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { useAuthStore } from './store/authStore'
import Login from './pages/auth/Login'
import Register from './pages/auth/Register'
import SetPassword from './pages/auth/SetPassword'
import ForgotPassword from './pages/auth/ForgotPassword'
import ResetPassword from './pages/auth/ResetPassword'
import Dashboard from './pages/Dashboard'
import Profile from './pages/Profile'
import UpdatePhone from './pages/UpdatePhone'
import LandingPage from './pages/LandingPage'
import RestaurantManagement from './pages/admin/RestaurantManagement'
import CategoriesManagement from './pages/admin/CategoriesManagement'
import MenuManagement from './pages/admin/MenuManagement'
import QRCodeView from './pages/admin/QRCodeView'
import ExploreRestaurants from './pages/public/ExploreRestaurants'
import RestaurantMenu from './pages/public/RestaurantMenu'
import SuperAdminDashboard from './pages/superadmin/SuperAdminDashboard'
import RestaurantsManagement from './pages/superadmin/RestaurantsManagement'

function ProtectedRoute({
  children,
  allowedRoles
}: {
  children: React.ReactNode
  allowedRoles?: string[]
}) {
  const { isAuthenticated, user } = useAuthStore()

  if (!isAuthenticated) {
    return <Navigate to="/login" />
  }

  // If specific roles are required, check them
  if (allowedRoles && allowedRoles.length > 0) {
    if (!user || !allowedRoles.includes(user.role)) {
      // Redirect to appropriate dashboard based on role
      const redirectPath = user?.role === 'SUPER_ADMIN' ? '/superadmin' : '/dashboard'
      return <Navigate to={redirectPath} />
    }
  }

  return <>{children}</>
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, user } = useAuthStore()
  if (!isAuthenticated) return <>{children}</>
  // Redirect based on role
  const redirectPath = user?.role === 'SUPER_ADMIN' ? '/superadmin' : '/dashboard'
  return <Navigate to={redirectPath} />
}

function App() {
  return (
    <BrowserRouter>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#fff',
            color: '#0f172a',
            borderRadius: '12px',
            border: '1px solid #e2e8f0',
            padding: '16px',
            fontSize: '14px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
          },
          success: {
            iconTheme: {
              primary: '#10b981',
              secondary: '#fff',
            },
          },
          error: {
            iconTheme: {
              primary: '#ef4444',
              secondary: '#fff',
            },
          },
        }}
      />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route
          path="/login"
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          }
        />
        <Route
          path="/register"
          element={
            <PublicRoute>
              <Register />
            </PublicRoute>
          }
        />
        <Route path="/set-password" element={<SetPassword />} />
        <Route
          path="/forgot-password"
          element={
            <PublicRoute>
              <ForgotPassword />
            </PublicRoute>
          }
        />
        <Route
          path="/reset-password"
          element={
            <PublicRoute>
              <ResetPassword />
            </PublicRoute>
          }
        />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute allowedRoles={['RESTAURANT_ADMIN']}>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/update-phone"
          element={
            <ProtectedRoute>
              <UpdatePhone />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/restaurant"
          element={
            <ProtectedRoute allowedRoles={['RESTAURANT_ADMIN']}>
              <RestaurantManagement />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/categories"
          element={
            <ProtectedRoute allowedRoles={['RESTAURANT_ADMIN']}>
              <CategoriesManagement />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/menu"
          element={
            <ProtectedRoute allowedRoles={['RESTAURANT_ADMIN']}>
              <MenuManagement />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/qr-code"
          element={
            <ProtectedRoute allowedRoles={['RESTAURANT_ADMIN']}>
              <QRCodeView />
            </ProtectedRoute>
          }
        />
        {/* Super Admin Routes */}
        <Route
          path="/superadmin"
          element={
            <ProtectedRoute allowedRoles={['SUPER_ADMIN']}>
              <SuperAdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/superadmin/restaurants"
          element={
            <ProtectedRoute allowedRoles={['SUPER_ADMIN']}>
              <RestaurantsManagement />
            </ProtectedRoute>
          }
        />
        {/* Public Routes - No Authentication Required */}
        <Route path="/explore" element={<ExploreRestaurants />} />
        <Route path="/r/:slug" element={<RestaurantMenu />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
