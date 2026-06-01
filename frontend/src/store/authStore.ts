import { create } from 'zustand'
import { AuthResponse } from '../lib/api'

interface User {
  userId: number
  phone: string
  role: string
}

interface AuthState {
  user: User | null
  accessToken: string | null
  refreshToken: string | null
  isAuthenticated: boolean
  setAuth: (data: AuthResponse) => void
  logout: () => void
  initAuth: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  accessToken: null,
  refreshToken: null,
  isAuthenticated: false,

  setAuth: (data: AuthResponse) => {
    const user = {
      userId: data.userId,
      phone: data.phone,
      role: data.role,
    }
    localStorage.setItem('accessToken', data.accessToken)
    localStorage.setItem('refreshToken', data.refreshToken)
    localStorage.setItem('user', JSON.stringify(user))

    set({
      user,
      accessToken: data.accessToken,
      refreshToken: data.refreshToken,
      isAuthenticated: true,
    })
  },

  logout: () => {
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
    localStorage.removeItem('user')

    set({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
    })
  },

  initAuth: () => {
    const accessToken = localStorage.getItem('accessToken')
    const refreshToken = localStorage.getItem('refreshToken')
    const userStr = localStorage.getItem('user')

    if (accessToken && refreshToken && userStr) {
      try {
        const user = JSON.parse(userStr)
        set({
          user,
          accessToken,
          refreshToken,
          isAuthenticated: true,
        })
      } catch (error) {
        console.error('Failed to parse user data:', error)
        localStorage.clear()
      }
    }
  },
}))

// Initialize auth on app load
useAuthStore.getState().initAuth()
