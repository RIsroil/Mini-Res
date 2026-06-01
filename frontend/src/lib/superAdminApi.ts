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
  status: 'PENDING' | 'ACTIVE' | 'BLOCKED'
  isPremium: boolean
  qrCodeUrl?: string
}

export interface RestaurantStats {
  total: number
  active: number
  pending: number
  blocked: number
}

// ==================== SUPER ADMIN API ====================

export const superAdminApi = {
  // Get all restaurants
  getAllRestaurants: (status?: 'PENDING' | 'ACTIVE' | 'BLOCKED') =>
    api.get<ApiResponse<Restaurant[]>>('/superadmin/restaurants/list', {
      params: status ? { status } : {},
    }),

  // Get restaurant statistics
  getRestaurantStats: () =>
    api.get<ApiResponse<RestaurantStats>>('/superadmin/restaurants/stats'),

  // Get pending restaurants
  getPendingRestaurants: () =>
    api.get<ApiResponse<Restaurant[]>>('/superadmin/restaurants/pending'),

  // Approve restaurant (PENDING -> ACTIVE)
  approveRestaurant: (id: string) =>
    api.patch<ApiResponse<void>>(`/superadmin/restaurants/${id}/approve`),

  // Block restaurant (ACTIVE -> BLOCKED)
  blockRestaurant: (id: string, reason?: string) =>
    api.patch<ApiResponse<void>>(`/superadmin/restaurants/${id}/block`, null, {
      params: reason ? { reason } : {},
    }),

  // Unblock restaurant (BLOCKED -> ACTIVE)
  unblockRestaurant: (id: string) =>
    api.patch<ApiResponse<void>>(`/superadmin/restaurants/${id}/unblock`),

  // Toggle premium status
  togglePremium: (id: string) =>
    api.patch<ApiResponse<void>>(`/superadmin/restaurants/${id}/premium`),

  // Set premium status
  setPremium: (id: string, isPremium: boolean) =>
    api.patch<ApiResponse<void>>(`/superadmin/restaurants/${id}/premium/set`, null, {
      params: { isPremium },
    }),

  // Delete restaurant (soft delete)
  deleteRestaurant: (id: string) =>
    api.delete<ApiResponse<void>>(`/superadmin/restaurants/${id}`),
}
