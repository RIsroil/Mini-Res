import axios from 'axios'

const publicApi = axios.create({
  baseURL: '/api/v1/public',
  headers: {
    'Content-Type': 'application/json',
  },
})

// ==================== TYPES ====================

export interface PublicRestaurant {
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

export interface PublicCategory {
  id: string
  name: string
  displayOrder: number
  iconUrl?: string
  menuItemCount: number
}

export interface PublicMenuItem {
  id: string
  name: string
  description: string
  ingredients?: string
  price: number
  preparationTimeMinutes?: number
  promotionText?: string
  promotionActive: boolean
  isAvailable: boolean
  hasPremiumBadge: boolean
  images: string[]
  primaryImage?: string
  categoryId?: string
  categoryName?: string
}

export interface MenuResponse {
  restaurant: PublicRestaurant
  categories: PublicCategory[]
  menuItems: PublicMenuItem[]
}

export interface NearbyRestaurant {
  id: string
  slug: string
  name: string
  description: string
  logoUrl?: string
  coverImageUrl?: string
  address: string
  city: string
  distance: number // in kilometers
  isPremium: boolean
}

export interface SearchResult {
  type: 'RESTAURANT' | 'MENU_ITEM'
  id: string
  name: string
  description: string
  imageUrl?: string
  restaurantSlug: string
  restaurantName: string
  price?: number
}

export interface ApiResponse<T> {
  success: boolean
  message: string
  data: T
}

// ==================== PUBLIC API ====================

export const publicApiService = {
  // Get restaurant by slug (QR code landing)
  getRestaurant: (slug: string) =>
    publicApi.get<ApiResponse<PublicRestaurant>>(`/restaurants/${slug}`),

  // Get full menu for a restaurant
  getMenu: (restaurantSlug: string) =>
    publicApi.get<ApiResponse<MenuResponse>>(`/menu/${restaurantSlug}`),

  // Search restaurants and menu items
  search: (query: string) =>
    publicApi.get<ApiResponse<SearchResult[]>>(`/search`, {
      params: { q: query },
    }),

  // Find nearby restaurants
  getNearbyRestaurants: (latitude: number, longitude: number, radiusKm: number = 10) =>
    publicApi.get<ApiResponse<NearbyRestaurant[]>>(`/restaurants/nearby`, {
      params: {
        lat: latitude,
        lng: longitude,
        radius: radiusKm,
      },
    }),
}

export default publicApi
