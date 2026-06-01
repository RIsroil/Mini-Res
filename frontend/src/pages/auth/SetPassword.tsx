import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate, useLocation } from 'react-router-dom'
import { Lock } from 'lucide-react'
import toast from 'react-hot-toast'
import AuthLayout from '../../components/layout/AuthLayout'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import { authApi } from '../../lib/api'
import { useAuthStore } from '../../store/authStore'

interface SetPasswordForm {
  password: string
  confirmPassword: string
}

export default function SetPassword() {
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  const setAuth = useAuthStore((state) => state.setAuth)
  const phone = location.state?.phone

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<SetPasswordForm>()

  const password = watch('password')

  const onSubmit = async (data: SetPasswordForm) => {
    if (!phone) {
      toast.error('Phone number missing. Please register again.')
      navigate('/register')
      return
    }

    setIsLoading(true)
    try {
      // Set password
      await authApi.setPassword(phone, data.password)
      toast.success('Password set successfully!')

      // Now login with phone and password
      const response = await authApi.login({
        phone,
        password: data.password,
      })

      const authData = response.data.data
      setAuth(authData)
      toast.success('Welcome!')

      // Redirect based on role
      const redirectPath = authData.role === 'SUPER_ADMIN' ? '/superadmin' : '/dashboard'
      navigate(redirectPath)
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to set password')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AuthLayout
      title="Parol O'rnatish"
      subtitle="Hisobingiz uchun xavfsiz parol yarating"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <Input
          label="Parol"
          type="password"
          placeholder="Kamida 6 ta belgi"
          icon={<Lock className="w-5 h-5" />}
          error={errors.password?.message}
          {...register('password', {
            required: 'Parol kiritish majburiy',
            minLength: {
              value: 6,
              message: 'Parol kamida 6 ta belgidan iborat bo\'lishi kerak',
            },
          })}
        />

        <Input
          label="Parolni Tasdiqlash"
          type="password"
          placeholder="Parolni qayta kiriting"
          icon={<Lock className="w-5 h-5" />}
          error={errors.confirmPassword?.message}
          {...register('confirmPassword', {
            required: 'Parolni tasdiqlash majburiy',
            validate: (value) =>
              value === password || 'Parollar mos kelmayapti',
          })}
        />

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-800">
            <strong>Parol talablari:</strong>
          </p>
          <ul className="text-sm text-blue-700 mt-2 space-y-1">
            <li>• Kamida 6 ta belgi</li>
            <li>• Eslab qolish oson, lekin taxmin qilish qiyin</li>
          </ul>
        </div>

        <Button
          type="submit"
          variant="primary"
          isLoading={isLoading}
          className="w-full"
        >
          Parolni O'rnatish va Davom Etish
        </Button>
      </form>
    </AuthLayout>
  )
}
