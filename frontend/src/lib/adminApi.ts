import api, { ApiResponse } from './api'

// ==================== TYPES ====================

export interface Restaurant {
  id: string
  slug: string
  name: string
  phone: string
  email: string
  description: string
  logoUrl?: string
  coverImageUrl?: string
  address: string
  city: string
  country: string
  location?: {
    latitude: number
    longitude: number
  }
  addressUrl?: string
  instagramUrl?: string
  facebookUrl?: string
  websiteUrl?: string
  workingHours?: Record<string, WorkingHour>
  status: 'PENDING' | 'ACTIVE' | 'BLOCKED'
  isPremium: boolean
  globalPromotionText?: string
  promotionActive?: boolean
  qrCodeUrl?: string
}

export interface WorkingHour {
  open: string
  close: string
  closed: boolean
}

export interface Category {
  id: string
  name: string
  displayOrder: number
  iconUrl?: string
  isActive: boolean
  menuItemCount: number
  createdAt: string
  updatedAt: string
}

export interface MenuItem {
  id: string
  name: string
  description: string
  ingredients?: string
  price: number
  preparationTimeMinutes?: number
  promotionText?: string
  promotionActive: boolean
  isActive: boolean
  isAvailable: boolean
  hasPremiumBadge: boolean
  images: string[]
  primaryImage?: string
  categoryId?: string
  categoryName?: string
  restaurantId: string
  restaurantName: string
  restaurantSlug: string
}

export interface RestaurantRequest {
  name: string
  phone: string
  email: string
  description: string
  address: string
  city: string
  country: string
  addressUrl?: string
  instagramUrl?: string
  facebookUrl?: string
  websiteUrl?: string
  workingHours?: Record<string, WorkingHour>
}

export interface CategoryRequest {
  name: string
  iconUrl?: string
}

export interface MenuItemRequest {
  name: string
  description: string
  ingredients?: string
  price: number
  preparationTimeMinutes?: number
  promotionText?: string
  promotionActive?: boolean
  hasPremiumBadge?: boolean
  categoryId?: string
}

// ==================== RESTAURANT API ====================

export const restaurantApi = {
  getMyRestaurant: () =>
    api.get<ApiResponse<Restaurant>>('/admin/restaurant'),

  createRestaurant: (data: RestaurantRequest) =>
    api.post<ApiResponse<Restaurant>>('/admin/restaurant', data),

  updateRestaurant: (data: RestaurantRequest) =>
    api.put<ApiResponse<Restaurant>>('/admin/restaurant', data),

  uploadLogo: (file: File) => {
    const formData = new FormData()
    formData.append('file', file)
    return api.post<ApiResponse<{ imageUrl: string }>>('/admin/images/restaurant/logo', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  },

  uploadCover: (file: File) => {
    const formData = new FormData()
    formData.append('file', file)
    return api.post<ApiResponse<{ imageUrl: string }>>('/admin/images/restaurant/cover', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  },
}

// ==================== CATEGORY API ====================

export const categoryApi = {
  getMyCategories: () =>
    api.get<ApiResponse<Category[]>>('/admin/categories'),

  createCategory: (data: CategoryRequest) =>
    api.post<ApiResponse<Category>>('/admin/categories', data),

  updateCategory: (id: string, data: CategoryRequest) =>
    api.put<ApiResponse<Category>>(`/admin/categories/${id}`, data),

  deleteCategory: (id: string) =>
    api.delete<ApiResponse<void>>(`/admin/categories/${id}`),

  toggleActive: (id: string) =>
    api.patch<ApiResponse<void>>(`/admin/categories/${id}/toggle-active`),

  reorderCategories: (categoryIds: string[]) =>
    api.patch<ApiResponse<void>>('/admin/categories/reorder', categoryIds),
}

// ==================== AUTH/USER API ====================

export const userApi = {
  sendOTPForPhoneUpdate: (newPhone: string) =>
    api.post<ApiResponse<void>>('/auth/send-otp-for-phone-update', { phone: newPhone }),

  updatePhone: (newPhone: string, otp: string) =>
    api.post<ApiResponse<void>>('/auth/update-phone', { newPhone, otp }),

  changePassword: (currentPassword: string, newPassword: string) =>
    api.post<ApiResponse<void>>('/auth/change-password', { currentPassword, newPassword }),

  deleteAccount: (password: string) =>
    api.delete<ApiResponse<void>>('/auth/delete-account', { data: { password } }),
}

// ==================== MENU ITEM API ====================

export const menuItemApi = {
  getMyMenuItems: () =>
    api.get<ApiResponse<MenuItem[]>>('/admin/menu'),

  createMenuItem: (data: MenuItemRequest) =>
    api.post<ApiResponse<MenuItem>>('/admin/menu', data),

  updateMenuItem: (id: string, data: MenuItemRequest) =>
    api.put<ApiResponse<MenuItem>>(`/admin/menu/${id}`, data),

  deleteMenuItem: (id: string) =>
    api.delete<ApiResponse<void>>(`/admin/menu/${id}`),

  toggleAvailability: (id: string) =>
    api.patch<ApiResponse<void>>(`/admin/menu/${id}/toggle-availability`),

  uploadImage: (menuItemId: string, file: File) => {
    const formData = new FormData()
    formData.append('file', file)
    return api.post<ApiResponse<{ imageUrl: string }>>(`/admin/images/menu/${menuItemId}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  },

  deleteImage: (menuItemId: string, imageIndex: number) =>
    api.delete<ApiResponse<void>>(`/admin/images/menu/${menuItemId}/${imageIndex}`),
}
