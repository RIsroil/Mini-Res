import axios from 'axios'

const api = axios.create({
  baseURL: '/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true
      const refreshToken = localStorage.getItem('refreshToken')

      if (refreshToken) {
        try {
          const { data } = await axios.post('/api/v1/auth/refresh', null, {
            params: { refreshToken },
          })
          localStorage.setItem('accessToken', data.data.accessToken)
          originalRequest.headers.Authorization = `Bearer ${data.data.accessToken}`
          return api(originalRequest)
        } catch (refreshError) {
          localStorage.removeItem('accessToken')
          localStorage.removeItem('refreshToken')
          localStorage.removeItem('user')
          window.location.href = '/login'
        }
      }
    }

    return Promise.reject(error)
  }
)

export interface ApiResponse<T> {
  success: boolean
  message: string
  data: T
}

export interface AuthResponse {
  accessToken: string
  refreshToken: string
  tokenType: string
  expiresIn: number
  userId: number
  phone: string
  role: string
}

export const authApi = {
  register: (data: { phone: string; fullName: string; email: string }) =>
    api.post<ApiResponse<void>>('/auth/register', data),

  login: (data: { phone: string; password: string }) =>
    api.post<ApiResponse<AuthResponse>>('/auth/login', data),

  sendOTP: (phone: string) =>
    api.post<ApiResponse<void>>('/auth/send-otp', { phone }),

  verifyOTP: (phone: string, code: string) =>
    api.post<ApiResponse<AuthResponse>>('/auth/verify-otp', { phone, code }),

  forgotPassword: (phone: string) =>
    api.post<ApiResponse<void>>('/auth/forgot-password', { phone }),

  resetPassword: (data: { phone: string; otp: string; newPassword: string }) =>
    api.post<ApiResponse<void>>('/auth/reset-password', data),

  sendOTPForPhoneUpdate: (phone: string) =>
    api.post<ApiResponse<void>>('/auth/send-otp-for-phone-update', { phone }),

  updatePhone: (data: { newPhone: string; otp: string }) =>
    api.post<ApiResponse<void>>('/auth/update-phone', data),

  setPassword: (data: { phone: string; password: string }) =>
    api.post<ApiResponse<void>>('/auth/set-password', data),
}

export default api
