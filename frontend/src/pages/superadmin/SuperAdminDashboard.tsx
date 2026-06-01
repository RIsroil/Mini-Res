import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import {
  Users,
  Store,
  Shield,
  LogOut,
  Settings,
  Activity,
  Clock
} from 'lucide-react'
import { useAuthStore } from '../../store/authStore'
import { superAdminApi } from '../../lib/superAdminApi'

export default function SuperAdminDashboard() {
  const navigate = useNavigate()
  const { user, logout } = useAuthStore()
  const [stats, setStats] = useState({
    totalRestaurants: 0,
    activeRestaurants: 0,
    pendingRestaurants: 0,
    blockedRestaurants: 0,
    totalUsers: 0,
  })
  const [pendingRestaurants, setPendingRestaurants] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user?.role !== 'SUPER_ADMIN') {
      toast.error('Unauthorized access')
      navigate('/dashboard')
      return
    }
    loadStats()
  }, [user, navigate])

  const loadStats = async () => {
    setLoading(true)
    try {
      // Load restaurant stats
      const restaurantStatsRes = await superAdminApi.getRestaurantStats()
      const restaurantStats = restaurantStatsRes.data.data

      // Load user stats
      const userStatsRes = await superAdminApi.getUserStats()
      const userStats = userStatsRes.data.data

      // Load pending restaurants
      const pendingRes = await superAdminApi.getPendingRestaurants()
      setPendingRestaurants(pendingRes.data.data.slice(0, 5)) // Show only first 5

      setStats({
        totalRestaurants: restaurantStats.total,
        activeRestaurants: restaurantStats.active,
        pendingRestaurants: restaurantStats.pending,
        blockedRestaurants: restaurantStats.blocked,
        totalUsers: userStats.total,
      })
    } catch (error: any) {
      console.error('Failed to load statistics:', error)
      toast.error('Failed to load statistics')
      // Use default values on error
      setStats({
        totalRestaurants: 0,
        activeRestaurants: 0,
        pendingRestaurants: 0,
        blockedRestaurants: 0,
        totalUsers: 0,
      })
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    logout()
    navigate('/login')
    toast.success('Logged out successfully')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <Shield className="w-8 h-8 text-purple-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Super Admin Panel</h1>
                <p className="text-sm text-gray-600">System Management</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">{user?.phone}</p>
                <p className="text-xs text-purple-600">SUPER ADMIN</p>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
          </div>
        ) : (
          <>
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <StatCard
                icon={<Store className="w-6 h-6" />}
                label="Total Restaurants"
                value={stats.totalRestaurants}
                bgColor="bg-blue-500"
                onClick={() => navigate('/superadmin/restaurants')}
              />
              <StatCard
                icon={<Activity className="w-6 h-6" />}
                label="Active Restaurants"
                value={stats.activeRestaurants}
                bgColor="bg-green-500"
                onClick={() => navigate('/superadmin/restaurants')}
              />
              <StatCard
                icon={<Clock className="w-6 h-6" />}
                label="Pending Approval"
                value={stats.pendingRestaurants}
                bgColor="bg-yellow-500"
                onClick={() => navigate('/superadmin/restaurants')}
              />
              <StatCard
                icon={<Users className="w-6 h-6" />}
                label="Total Users"
                value={stats.totalUsers}
                bgColor="bg-purple-500"
              />
            </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <ActionButton
              icon={<Store className="w-5 h-5" />}
              label="Manage Restaurants"
              description="View and manage all restaurants"
              onClick={() => navigate('/superadmin/restaurants')}
            />
            <ActionButton
              icon={<Users className="w-5 h-5" />}
              label="Manage Users"
              description="View and manage all users"
              onClick={() => navigate('/superadmin/users')}
            />
            <ActionButton
              icon={<Settings className="w-5 h-5" />}
              label="System Settings"
              description="Configure system settings"
              onClick={() => toast('Coming soon', { icon: 'ℹ️' })}
            />
          </div>
        </div>

        {/* Pending Restaurants */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">Pending Approval</h2>
            {pendingRestaurants.length > 0 && (
              <button
                onClick={() => navigate('/superadmin/restaurants')}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                View All →
              </button>
            )}
          </div>
          {pendingRestaurants.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Clock className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p>No pending restaurants</p>
            </div>
          ) : (
            <div className="space-y-3">
              {pendingRestaurants.map((restaurant) => (
                <div
                  key={restaurant.id}
                  className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    {restaurant.logoUrl && (
                      <img
                        src={restaurant.logoUrl}
                        alt={restaurant.name}
                        className="w-10 h-10 rounded-lg object-cover"
                      />
                    )}
                    <div>
                      <h3 className="font-semibold text-gray-900">{restaurant.name}</h3>
                      <p className="text-sm text-gray-600">{restaurant.city}, {restaurant.country}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => navigate('/superadmin/restaurants')}
                    className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Review
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
        </>
        )}
      </main>
    </div>
  )
}

function StatCard({
  icon,
  label,
  value,
  bgColor,
  onClick,
}: {
  icon: React.ReactNode
  label: string
  value: number
  bgColor: string
  onClick?: () => void
}) {
  const cardContent = (
    <>
      <div className="flex items-center justify-between mb-4">
        <div className={`${bgColor} text-white p-3 rounded-lg`}>{icon}</div>
      </div>
      <div>
        <p className="text-sm font-medium text-gray-600 mb-1">{label}</p>
        <p className="text-3xl font-bold text-gray-900">{value}</p>
      </div>
    </>
  )

  if (onClick) {
    return (
      <button
        onClick={onClick}
        className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow text-left w-full"
      >
        {cardContent}
      </button>
    )
  }

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      {cardContent}
    </div>
  )
}

function ActionButton({
  icon,
  label,
  description,
  onClick,
}: {
  icon: React.ReactNode
  label: string
  description: string
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className="flex items-start gap-4 p-4 border border-gray-200 rounded-lg hover:border-blue-500 hover:shadow-md transition-all text-left"
    >
      <div className="bg-blue-50 text-blue-600 p-3 rounded-lg">{icon}</div>
      <div>
        <h3 className="font-semibold text-gray-900 mb-1">{label}</h3>
        <p className="text-sm text-gray-600">{description}</p>
      </div>
    </button>
  )
}
