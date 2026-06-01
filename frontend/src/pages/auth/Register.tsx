import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link, useNavigate } from 'react-router-dom'
import { Phone, User, Mail, Lock } from 'lucide-react'
import toast from 'react-hot-toast'
import AuthLayout from '../../components/layout/AuthLayout'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import { authApi } from '../../lib/api'
import { useAuthStore } from '../../store/authStore'

interface RegisterForm {
  phone: string
  fullName: string
  email: string
  otp: string
}

export default function Register() {
  const [step, setStep] = useState<'register' | 'verify'>('register')
  const [isLoading, setIsLoading] = useState(false)
  const [phoneNumber, setPhoneNumber] = useState('')
  const navigate = useNavigate()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterForm>()

  const onRegister = async (data: RegisterForm) => {
    setIsLoading(true)
    try {
      await authApi.register({
        phone: data.phone,
        fullName: data.fullName,
        email: data.email,
      })
      setPhoneNumber(data.phone)
      setStep('verify')
      toast.success('OTP sent to your phone!')
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Registration failed')
    } finally {
      setIsLoading(false)
    }
  }

  const onVerifyOTP = async (data: RegisterForm) => {
    setIsLoading(true)
    try {
      await authApi.verifyOTP(phoneNumber, data.otp)
      toast.success('OTP verified! Please set your password.')
      navigate('/set-password', { state: { phone: phoneNumber } })
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'OTP verification failed')
    } finally {
      setIsLoading(false)
    }
  }

  const resendOTP = async () => {
    try {
      await authApi.sendOTP(phoneNumber)
      toast.success('OTP resent successfully!')
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to resend OTP')
    }
  }

  return (
    <AuthLayout
      title={step === 'register' ? 'Create Account' : 'Verify Phone'}
      subtitle={
        step === 'register'
          ? 'Start your restaurant journey'
          : 'Enter the OTP sent to your phone'
      }
    >
      {step === 'register' ? (
        <form onSubmit={handleSubmit(onRegister)} className="space-y-5">
          <Input
            label="Full Name"
            placeholder="John Doe"
            icon={<User className="w-5 h-5" />}
            error={errors.fullName?.message}
            {...register('fullName', {
              required: 'Full name is required',
              minLength: {
                value: 2,
                message: 'Name must be at least 2 characters',
              },
            })}
          />

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
            label="Email"
            type="email"
            placeholder="john@example.com"
            icon={<Mail className="w-5 h-5" />}
            error={errors.email?.message}
            {...register('email', {
              required: 'Email is required',
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: 'Invalid email address',
              },
            })}
          />

          <Button
            type="submit"
            variant="primary"
            isLoading={isLoading}
            className="w-full"
          >
            Create Account
          </Button>

          <div className="text-center text-sm text-secondary-600">
            Already have an account?{' '}
            <Link
              to="/login"
              className="text-primary-600 hover:text-primary-700 font-semibold transition-colors"
            >
              Login here
            </Link>
          </div>
        </form>
      ) : (
        <form onSubmit={handleSubmit(onVerifyOTP)} className="space-y-5">
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

          <Button
            type="submit"
            variant="primary"
            isLoading={isLoading}
            className="w-full"
          >
            Verify & Continue
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

          <div className="text-center">
            <button
              type="button"
              onClick={() => setStep('register')}
              className="text-sm text-secondary-600 hover:text-secondary-700 transition-colors"
            >
              Back to registration
            </button>
          </div>
        </form>
      )}
    </AuthLayout>
  )
}
