import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { toast } from 'react-hot-toast'
import { User, Phone, Shield, ArrowLeft, Edit, Lock, Trash2, X } from 'lucide-react'
import { useAuthStore } from '../store/authStore'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import { userApi } from '../lib/adminApi'

export default function Profile() {
  const navigate = useNavigate()
  const { user, logout } = useAuthStore()
  const [showChangePassword, setShowChangePassword] = useState(false)
  const [showDeleteAccount, setShowDeleteAccount] = useState(false)
  const [loading, setLoading] = useState(false)

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })

  const [deleteData, setDeleteData] = useState({
    password: '',
    confirmation: '',
  })

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('Yangi parollar mos kelmaydi')
      return
    }

    if (passwordData.newPassword.length < 6) {
      toast.error('Yangi parol kamida 6 ta belgidan iborat bo`lishi kerak')
      return
    }

    setLoading(true)
    try {
      await userApi.changePassword(passwordData.currentPassword, passwordData.newPassword)
      toast.success('Parol muvaffaqiyatli o\'zgartirildi')
      setShowChangePassword(false)
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' })
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Parolni o\'zgartirishda xatolik')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteAccount = async (e: React.FormEvent) => {
    e.preventDefault()

    if (deleteData.confirmation !== 'DELETE') {
      toast.error('Tasdiqlash uchun DELETE yozing')
      return
    }

    setLoading(true)
    try {
      await userApi.deleteAccount(deleteData.password)
      toast.success('Akkaunt o\'chirildi')
      logout()
      navigate('/login')
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Akkauntni o\'chirishda xatolik')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-secondary-50 via-white to-primary-50">
      <div className="max-w-3xl mx-auto px-4 py-8">
        <button
          onClick={() => navigate('/dashboard')}
          className="inline-flex items-center gap-2 text-secondary-600 hover:text-secondary-700 mb-6 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Orqaga
        </button>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card p-8"
        >
          <div className="flex items-center gap-4 mb-8">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center">
              <User className="w-10 h-10 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-secondary-900">Profil</h1>
              <p className="text-secondary-600">Akkaunt ma'lumotlarini boshqarish</p>
            </div>
          </div>

          <div className="space-y-6">
            <div className="p-4 rounded-xl bg-secondary-50 border border-secondary-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Phone className="w-5 h-5 text-primary-600" />
                  <div>
                    <p className="text-sm text-secondary-600">Telefon raqam</p>
                    <p className="font-semibold text-secondary-900">{user?.phone}</p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate('/update-phone')}
                  className="gap-2"
                >
                  <Edit className="w-4 h-4" />
                  O'zgartirish
                </Button>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-secondary-50 border border-secondary-200">
              <div className="flex items-center gap-3">
                <Shield className="w-5 h-5 text-primary-600" />
                <div>
                  <p className="text-sm text-secondary-600">Rol</p>
                  <p className="font-semibold text-secondary-900">{user?.role}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-8 border-t border-secondary-200">
            <h3 className="text-lg font-semibold text-secondary-900 mb-4">Akkaunt sozlamalari</h3>
            <div className="space-y-3">
              <button
                onClick={() => setShowChangePassword(true)}
                className="w-full p-4 rounded-xl border-2 border-secondary-200 hover:border-primary-500 hover:bg-primary-50 transition-all duration-200 text-left"
              >
                <div className="flex items-center gap-3">
                  <Lock className="w-5 h-5 text-primary-600" />
                  <div>
                    <h4 className="font-semibold text-secondary-900">Parolni o'zgartirish</h4>
                    <p className="text-sm text-secondary-600">Akkaunt parolini yangilash</p>
                  </div>
                </div>
              </button>

              <button
                onClick={() => setShowDeleteAccount(true)}
                className="w-full p-4 rounded-xl border-2 border-red-200 hover:border-red-500 hover:bg-red-50 transition-all duration-200 text-left"
              >
                <div className="flex items-center gap-3">
                  <Trash2 className="w-5 h-5 text-red-600" />
                  <div>
                    <h4 className="font-semibold text-red-900">Akkauntni o'chirish</h4>
                    <p className="text-sm text-red-600">Akkaunt va barcha ma'lumotlarni butunlay o'chirish</p>
                  </div>
                </div>
              </button>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Change Password Modal */}
      {showChangePassword && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl p-6 w-full max-w-md"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold">Parolni o'zgartirish</h2>
              <button
                onClick={() => setShowChangePassword(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleChangePassword} className="space-y-4">
              <Input
                label="Hozirgi parol"
                type="password"
                value={passwordData.currentPassword}
                onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                required
              />
              <Input
                label="Yangi parol"
                type="password"
                value={passwordData.newPassword}
                onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                required
                placeholder="Kamida 6 ta belgi"
              />
              <Input
                label="Yangi parolni tasdiqlang"
                type="password"
                value={passwordData.confirmPassword}
                onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                required
              />

              <div className="flex gap-3">
                <Button type="submit" isLoading={loading} className="flex-1">
                  O'zgartirish
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowChangePassword(false)}
                  className="flex-1"
                >
                  Bekor qilish
                </Button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Delete Account Modal */}
      {showDeleteAccount && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl p-6 w-full max-w-md"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-red-900">Akkauntni o'chirish</h2>
              <button
                onClick={() => setShowDeleteAccount(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
              <p className="text-red-800 text-sm font-medium">⚠️ Diqqat!</p>
              <p className="text-red-700 text-sm mt-1">
                Bu amalni qaytarib bo'lmaydi. Barcha ma'lumotlaringiz butunlay o'chiriladi.
              </p>
              <p className="text-red-700 text-sm mt-2">
                <strong>Muhim:</strong> Akkauntni o'chirish uchun avval restaurant'ni o'chirishingiz kerak.
              </p>
            </div>

            <form onSubmit={handleDeleteAccount} className="space-y-4">
              <Input
                label="Parolingizni kiriting"
                type="password"
                value={deleteData.password}
                onChange={(e) => setDeleteData({ ...deleteData, password: e.target.value })}
                required
              />
              <Input
                label="Tasdiqlash uchun DELETE yozing"
                value={deleteData.confirmation}
                onChange={(e) => setDeleteData({ ...deleteData, confirmation: e.target.value })}
                required
                placeholder="DELETE"
              />

              <div className="flex gap-3">
                <Button
                  type="submit"
                  isLoading={loading}
                  className="flex-1 bg-red-600 hover:bg-red-700"
                >
                  Akkauntni o'chirish
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowDeleteAccount(false)}
                  className="flex-1"
                >
                  Bekor qilish
                </Button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  )
}
