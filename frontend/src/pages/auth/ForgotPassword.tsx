import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link, useNavigate } from 'react-router-dom'
import { Phone, ArrowLeft } from 'lucide-react'
import toast from 'react-hot-toast'
import AuthLayout from '../../components/layout/AuthLayout'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import { authApi } from '../../lib/api'

interface ForgotPasswordForm {
  phone: string
}

export default function ForgotPassword() {
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordForm>()

  const onSubmit = async (data: ForgotPasswordForm) => {
    setIsLoading(true)
    try {
      await authApi.forgotPassword(data.phone)
      toast.success('OTP sent to your phone!')
      navigate('/reset-password', { state: { phone: data.phone } })
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to send OTP')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AuthLayout
      title="Forgot Password"
      subtitle="We'll send you an OTP to reset your password"
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

        <Button
          type="submit"
          variant="primary"
          isLoading={isLoading}
          className="w-full"
        >
          Send OTP
        </Button>

        <div className="text-center">
          <Link
            to="/login"
            className="inline-flex items-center gap-2 text-sm text-secondary-600 hover:text-secondary-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to login
          </Link>
        </div>
      </form>
    </AuthLayout>
  )
}
