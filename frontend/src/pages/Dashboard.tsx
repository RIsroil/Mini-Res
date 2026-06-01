import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { LogOut, User, QrCode, BarChart3, Menu as MenuIcon, Store, FolderOpen } from 'lucide-react'
import { useAuthStore } from '../store/authStore'
import Button from '../components/ui/Button'
import { menuItemApi } from '../lib/adminApi'
import { toast } from 'react-hot-toast'

export default function Dashboard() {
  const navigate = useNavigate()
  const { user, logout } = useAuthStore()
  const [stats, setStats] = useState({
    totalViews: 0,
    qrScans: 0,
    menuItems: 0,
  })
  const [, setLoading] = useState(true)

  useEffect(() => {
    loadStats()
  }, [])

  const loadStats = async () => {
    try {
      const [menuResponse] = await Promise.all([
        menuItemApi.getMyMenuItems(),
      ])

      setStats({
        totalViews: 0, // Analytics keyingi versiyada
        qrScans: 0,    // Analytics keyingi versiyada
        menuItems: menuResponse.data.data.length,
      })
    } catch (error) {
      console.error('Failed to load stats')
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const statsData = [
    { label: 'Total Views', value: stats.totalViews.toString(), icon: BarChart3, color: 'from-blue-500 to-blue-600' },
    { label: 'QR Scans', value: stats.qrScans.toString(), icon: QrCode, color: 'from-green-500 to-green-600' },
    { label: 'Menu Items', value: stats.menuItems.toString(), icon: MenuIcon, color: 'from-purple-500 to-purple-600' },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-secondary-50 via-white to-primary-50">
      <nav className="bg-white border-b border-secondary-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center">
                <QrCode className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-xl font-bold gradient-text">QR Menu Platform</h1>
            </div>
            <div className="flex items-center gap-4">
              <Button
                variant="secondary"
                onClick={() => navigate('/profile')}
                className="gap-2"
              >
                <User className="w-4 h-4" />
                Profile
              </Button>
              <Button
                variant="outline"
                onClick={handleLogout}
                className="gap-2"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h2 className="text-3xl font-bold text-secondary-900 mb-2">
            Welcome back, {user?.phone}!
          </h2>
          <p className="text-secondary-600">
            Here's an overview of your restaurant performance
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {statsData.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="card p-6"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-secondary-600 mb-1">{stat.label}</p>
                  <p className="text-3xl font-bold text-secondary-900">{stat.value}</p>
                </div>
                <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center shadow-lg`}>
                  <stat.icon className="w-7 h-7 text-white" />
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="card p-8"
        >
          <h3 className="text-xl font-bold text-secondary-900 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <button
              onClick={() => navigate('/admin/restaurant')}
              className="p-4 rounded-xl border-2 border-secondary-200 hover:border-primary-500 hover:bg-primary-50 transition-all duration-200 text-left"
            >
              <Store className="w-8 h-8 text-primary-600 mb-2" />
              <h4 className="font-semibold text-secondary-900">Restaurant</h4>
              <p className="text-sm text-secondary-600">Manage restaurant details</p>
            </button>
            <button
              onClick={() => navigate('/admin/categories')}
              className="p-4 rounded-xl border-2 border-secondary-200 hover:border-primary-500 hover:bg-primary-50 transition-all duration-200 text-left"
            >
              <FolderOpen className="w-8 h-8 text-primary-600 mb-2" />
              <h4 className="font-semibold text-secondary-900">Categories</h4>
              <p className="text-sm text-secondary-600">Manage menu categories</p>
            </button>
            <button
              onClick={() => navigate('/admin/menu')}
              className="p-4 rounded-xl border-2 border-secondary-200 hover:border-primary-500 hover:bg-primary-50 transition-all duration-200 text-left"
            >
              <MenuIcon className="w-8 h-8 text-primary-600 mb-2" />
              <h4 className="font-semibold text-secondary-900">Menu Items</h4>
              <p className="text-sm text-secondary-600">Add or edit menu items</p>
            </button>
            <button
              onClick={() => navigate('/admin/qr-code')}
              className="p-4 rounded-xl border-2 border-secondary-200 hover:border-primary-500 hover:bg-primary-50 transition-all duration-200 text-left"
            >
              <QrCode className="w-8 h-8 text-primary-600 mb-2" />
              <h4 className="font-semibold text-secondary-900">View QR Code</h4>
              <p className="text-sm text-secondary-600">Download your QR code</p>
            </button>
            <button
              onClick={() => toast('Analytics funksiyasi keyingi versiyada qo\'shiladi', { icon: 'ℹ️' })}
              className="p-4 rounded-xl border-2 border-secondary-200 hover:border-primary-500 hover:bg-primary-50 transition-all duration-200 text-left relative"
            >
              <BarChart3 className="w-8 h-8 text-primary-600 mb-2" />
              <h4 className="font-semibold text-secondary-900">Analytics</h4>
              <p className="text-sm text-secondary-600">View detailed statistics</p>
              <span className="absolute top-2 right-2 px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded">
                Tez kunlarda
              </span>
            </button>
            <button
              onClick={() => navigate('/profile')}
              className="p-4 rounded-xl border-2 border-secondary-200 hover:border-primary-500 hover:bg-primary-50 transition-all duration-200 text-left"
            >
              <User className="w-8 h-8 text-primary-600 mb-2" />
              <h4 className="font-semibold text-secondary-900">Profile</h4>
              <p className="text-sm text-secondary-600">Manage your account</p>
            </button>
          </div>
        </motion.div>
      </main>
    </div>
  )
}
