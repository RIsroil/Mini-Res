import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate, useLocation } from 'react-router-dom'
import { Lock, Phone } from 'lucide-react'
import toast from 'react-hot-toast'
import AuthLayout from '../../components/layout/AuthLayout'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import { authApi } from '../../lib/api'

interface ResetPasswordForm {
  phone: string
  otp: string
  newPassword: string
  confirmPassword: string
}

export default function ResetPassword() {
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  const phoneFromState = location.state?.phone || ''

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<ResetPasswordForm>({
    defaultValues: {
      phone: phoneFromState,
    },
  })

  const password = watch('newPassword')

  const onSubmit = async (data: ResetPasswordForm) => {
    setIsLoading(true)
    try {
      await authApi.resetPassword({
        phone: data.phone,
        otp: data.otp,
        newPassword: data.newPassword,
      })
      toast.success('Password reset successfully!')
      navigate('/login')
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to reset password')
    } finally {
      setIsLoading(false)
    }
  }

  const resendOTP = async () => {
    const phone = watch('phone')
    if (!phone) {
      toast.error('Please enter your phone number')
      return
    }

    try {
      await authApi.forgotPassword(phone)
      toast.success('OTP resent successfully!')
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to resend OTP')
    }
  }

  return (
    <AuthLayout
      title="Reset Password"
      subtitle="Enter the OTP and set your new password"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <Input
          label="Phone Number"
          placeholder="+998901234567"
          icon={<Phone className="w-5 h-5" />}
          error={errors.phone?.message}
          {...register('phone', {
            required: 'Phone number is required',
            pattern: {
              value: /^\+998[0-9]{9}$/,
              message: 'Phone must be in format +998XXXXXXXXX',
            },
          })}
        />

        <Input
          label="OTP Code"
          placeholder="Enter 6-digit code"
          icon={<Lock className="w-5 h-5" />}
          maxLength={6}
          error={errors.otp?.message}
          {...register('otp', {
            required: 'OTP is required',
            pattern: {
              value: /^[0-9]{6}$/,
              message: 'OTP must be 6 digits',
            },
          })}
        />

        <Input
          label="New Password"
          type="password"
          placeholder="Enter new password"
          icon={<Lock className="w-5 h-5" />}
          error={errors.newPassword?.message}
          {...register('newPassword', {
            required: 'Password is required',
            minLength: {
              value: 8,
              message: 'Password must be at least 8 characters',
            },
          })}
        />

        <Input
          label="Confirm Password"
          type="password"
          placeholder="Confirm new password"
          icon={<Lock className="w-5 h-5" />}
          error={errors.confirmPassword?.message}
          {...register('confirmPassword', {
            required: 'Please confirm your password',
            validate: (value) =>
              value === password || 'Passwords do not match',
          })}
        />

        <Button
          type="submit"
          variant="primary"
          isLoading={isLoading}
          className="w-full"
        >
          Reset Password
        </Button>

        <div className="text-center">
          <button
            type="button"
            onClick={resendOTP}
            className="text-sm text-primary-600 hover:text-primary-700 font-medium transition-colors"
          >
            Resend OTP
          </button>
        </div>
      </form>
    </AuthLayout>
  )
}
