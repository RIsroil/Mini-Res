import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { Phone, Lock, ArrowLeft } from 'lucide-react'
import toast from 'react-hot-toast'
import AuthLayout from '../components/layout/AuthLayout'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import { userApi } from '../lib/adminApi'

interface UpdatePhoneForm {
  newPhone: string
  otp: string
}

export default function UpdatePhone() {
  const [step, setStep] = useState<'send-otp' | 'verify'>('send-otp')
  const [isLoading, setIsLoading] = useState(false)
  const [newPhone, setNewPhone] = useState('')
  const navigate = useNavigate()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<UpdatePhoneForm>()

  const onSendOTP = async (data: UpdatePhoneForm) => {
    setIsLoading(true)
    try {
      await userApi.sendOTPForPhoneUpdate(data.newPhone)
      setNewPhone(data.newPhone)
      setStep('verify')
      toast.success('OTP yangi raqamga yuborildi!')
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'OTP yuborishda xatolik')
    } finally {
      setIsLoading(false)
    }
  }

  const onVerifyOTP = async (data: UpdatePhoneForm) => {
    setIsLoading(true)
    try {
      await userApi.updatePhone(newPhone, data.otp)
      toast.success('Telefon raqam muvaffaqiyatli yangilandi!')
      navigate('/profile')
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Telefon yangilashda xatolik')
    } finally {
      setIsLoading(false)
    }
  }

  const resendOTP = async () => {
    try {
      await userApi.sendOTPForPhoneUpdate(newPhone)
      toast.success('OTP qayta yuborildi!')
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'OTP yuborishda xatolik')
    }
  }

  return (
    <AuthLayout
      title={step === 'send-otp' ? 'Telefon raqamni yangilash' : 'Yangi raqamni tasdiqlash'}
      subtitle={
        step === 'send-otp'
          ? 'Yangi telefon raqamingizni kiriting'
          : 'Yangi raqamga yuborilgan OTP kodni kiriting'
      }
    >
      {step === 'send-otp' ? (
        <form onSubmit={handleSubmit(onSendOTP)} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Yangi telefon raqam
            </label>
            <input
              type="tel"
              placeholder="+998901234567"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              {...register('newPhone', {
                required: 'Telefon raqam kiritilishi shart',
                pattern: {
                  value: /^\+998[0-9]{9}$/,
                  message: 'Telefon raqam +998XXXXXXXXX formatida bo\'lishi kerak',
                },
              })}
            />
            {errors.newPhone && (
              <p className="mt-1 text-sm text-red-600">{errors.newPhone.message}</p>
            )}
          </div>

          <Button
            type="submit"
            variant="primary"
            isLoading={isLoading}
            className="w-full"
          >
            OTP Yuborish
          </Button>

          <div className="text-center">
            <button
              type="button"
              onClick={() => navigate('/profile')}
              className="inline-flex items-center gap-2 text-sm text-secondary-600 hover:text-secondary-700 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Profilga qaytish
            </button>
          </div>
        </form>
      ) : (
        <form onSubmit={handleSubmit(onVerifyOTP)} className="space-y-5">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
            <p className="text-sm text-blue-800">
              OTP kod <strong>{newPhone}</strong> raqamiga yuborildi
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              OTP Kod
            </label>
            <input
              type="text"
              placeholder="123456"
              maxLength={6}
              className="w-full px-4 py-3 text-center text-2xl tracking-widest border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              {...register('otp', {
                required: 'OTP kiritilishi shart',
                pattern: {
                  value: /^[0-9]{6}$/,
                  message: 'OTP 6 ta raqamdan iborat bo\'lishi kerak',
                },
              })}
            />
            {errors.otp && (
              <p className="mt-1 text-sm text-red-600">{errors.otp.message}</p>
            )}
          </div>

          <Button
            type="submit"
            variant="primary"
            isLoading={isLoading}
            className="w-full"
          >
            Tasdiqlash va Yangilash
          </Button>

          <div className="text-center">
            <button
              type="button"
              onClick={resendOTP}
              className="text-sm text-primary-600 hover:text-primary-700 font-medium transition-colors"
            >
              OTP ni qayta yuborish
            </button>
          </div>

          <div className="text-center">
            <button
              type="button"
              onClick={() => setStep('send-otp')}
              className="text-sm text-secondary-600 hover:text-secondary-700 transition-colors"
            >
              Raqamni o'zgartirish
            </button>
          </div>
        </form>
      )}
    </AuthLayout>
  )
}
