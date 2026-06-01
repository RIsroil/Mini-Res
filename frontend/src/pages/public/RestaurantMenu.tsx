import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import {
  publicApiService,
  MenuResponse,
  PublicMenuItem
} from '../../lib/publicApi'
import {
  MapPin,
  Phone,
  Mail,
  Globe,
  Instagram,
  Facebook,
  Clock,
  ChevronLeft,
  Star
} from 'lucide-react'

export default function RestaurantMenu() {
  const { slug } = useParams<{ slug: string }>()
  const navigate = useNavigate()
  const [menuData, setMenuData] = useState<MenuResponse | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (slug) {
      loadMenu(slug)
    }
  }, [slug])

  const loadMenu = async (restaurantSlug: string) => {
    try {
      const { data } = await publicApiService.getMenu(restaurantSlug)
      setMenuData(data.data)
    } catch (error: any) {
      if (error.response?.status === 404) {
        toast.error('Restaurant not found')
      } else {
        toast.error('Failed to load menu')
      }
    } finally {
      setLoading(false)
    }
  }

  const filteredItems = menuData?.menuItems.filter(item =>
    selectedCategory ? item.categoryId === selectedCategory : true
  ).filter(item => item.isAvailable) || []

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600"></div>
      </div>
    )
  }

  if (!menuData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">Restaurant Not Found</h1>
        <button
          onClick={() => navigate('/explore')}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Explore Restaurants
        </button>
      </div>
    )
  }

  const { restaurant, categories } = menuData

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header/Cover */}
      <div className="relative">
        {restaurant.coverImageUrl ? (
          <div
            className="h-64 bg-cover bg-center"
            style={{ backgroundImage: `url(${restaurant.coverImageUrl})` }}
          >
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          </div>
        ) : (
          <div className="h-64 bg-gradient-to-br from-blue-600 to-purple-600" />
        )}

        {/* Restaurant Info Overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
          <div className="max-w-7xl mx-auto flex items-end gap-6">
            {restaurant.logoUrl && (
              <img
                src={restaurant.logoUrl}
                alt={restaurant.name}
                className="w-24 h-24 rounded-xl border-4 border-white shadow-xl object-cover"
              />
            )}
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-4xl font-bold">{restaurant.name}</h1>
                {restaurant.isPremium && (
                  <span className="px-3 py-1 bg-yellow-500 text-yellow-900 rounded-full text-sm font-semibold flex items-center gap-1">
                    <Star className="w-4 h-4 fill-current" />
                    Premium
                  </span>
                )}
              </div>
              <p className="text-gray-100 text-lg">{restaurant.description}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Promotion Banner */}
      {restaurant.promotionActive && restaurant.globalPromotionText && (
        <div className="bg-gradient-to-r from-red-500 to-pink-500 text-white py-3 px-6 text-center font-semibold">
          🎉 {restaurant.globalPromotionText}
        </div>
      )}

      {/* Restaurant Details */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="flex items-center gap-3 text-gray-700">
              <MapPin className="w-5 h-5 text-blue-600" />
              <div>
                <p className="font-medium">Address</p>
                <p className="text-sm">{restaurant.address}, {restaurant.city}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 text-gray-700">
              <Phone className="w-5 h-5 text-blue-600" />
              <div>
                <p className="font-medium">Phone</p>
                <p className="text-sm">{restaurant.phone}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 text-gray-700">
              <Mail className="w-5 h-5 text-blue-600" />
              <div>
                <p className="font-medium">Email</p>
                <p className="text-sm">{restaurant.email}</p>
              </div>
            </div>
          </div>

          {/* Social Links */}
          <div className="flex gap-4 mt-6 pt-6 border-t">
            {restaurant.websiteUrl && (
              <a
                href={restaurant.websiteUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-blue-600 hover:text-blue-700"
              >
                <Globe className="w-5 h-5" />
                Website
              </a>
            )}
            {restaurant.instagramUrl && (
              <a
                href={restaurant.instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-pink-600 hover:text-pink-700"
              >
                <Instagram className="w-5 h-5" />
                Instagram
              </a>
            )}
            {restaurant.facebookUrl && (
              <a
                href={restaurant.facebookUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-blue-700 hover:text-blue-800"
              >
                <Facebook className="w-5 h-5" />
                Facebook
              </a>
            )}
            {restaurant.addressUrl && (
              <a
                href={restaurant.addressUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-red-600 hover:text-red-700"
              >
                <MapPin className="w-5 h-5" />
                Directions
              </a>
            )}
          </div>
        </div>

        {/* Category Filter */}
        <div className="sticky top-0 z-10 bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="flex gap-2 overflow-x-auto pb-2">
            <button
              onClick={() => setSelectedCategory(null)}
              className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${
                selectedCategory === null
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All Items
            </button>
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${
                  selectedCategory === category.id
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {category.name} ({category.menuItemCount})
              </button>
            ))}
          </div>
        </div>

        {/* Menu Items Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.length === 0 ? (
            <div className="col-span-full text-center py-12 text-gray-500">
              No items available in this category
            </div>
          ) : (
            filteredItems.map((item) => (
              <MenuItem key={item.id} item={item} isPremium={restaurant.isPremium} />
            ))
          )}
        </div>
      </div>

      {/* Back Button */}
      <button
        onClick={() => navigate('/explore')}
        className="fixed bottom-6 left-6 bg-white text-gray-700 px-4 py-3 rounded-full shadow-lg hover:shadow-xl transition-all flex items-center gap-2"
      >
        <ChevronLeft className="w-5 h-5" />
        Explore More
      </button>
    </div>
  )
}

// MenuItem Card Component
function MenuItem({ item, isPremium }: { item: PublicMenuItem; isPremium: boolean }) {
  return (
    <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow overflow-hidden">
      {/* Image */}
      <div className="relative h-48 bg-gray-200">
        {item.primaryImage ? (
          <img
            src={item.primaryImage}
            alt={item.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            No image
          </div>
        )}

        {/* Badges */}
        <div className="absolute top-3 right-3 flex flex-col gap-2">
          {item.hasPremiumBadge && (
            <span className="bg-purple-600 text-white px-3 py-1 rounded-full text-xs font-semibold shadow-lg">
              Premium
            </span>
          )}
          {item.promotionActive && item.promotionText && (
            <span className="bg-red-600 text-white px-3 py-1 rounded-full text-xs font-semibold shadow-lg">
              Promo
            </span>
          )}
        </div>

        {/* Multiple Images Indicator */}
        {isPremium && item.images.length > 1 && (
          <div className="absolute bottom-3 right-3 bg-black/50 text-white px-2 py-1 rounded text-xs">
            +{item.images.length - 1} photos
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-lg font-bold text-gray-900">{item.name}</h3>
          <span className="text-xl font-bold text-green-600">${item.price}</span>
        </div>

        <p className="text-sm text-gray-600 mb-3 line-clamp-2">{item.description}</p>

        {item.ingredients && (
          <p className="text-xs text-gray-500 mb-2 line-clamp-1">
            <span className="font-semibold">Ingredients:</span> {item.ingredients}
          </p>
        )}

        {item.promotionActive && item.promotionText && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-2 mb-3">
            <p className="text-sm text-red-800 font-medium">🎉 {item.promotionText}</p>
          </div>
        )}

        <div className="flex items-center justify-between text-xs text-gray-500">
          {item.preparationTimeMinutes && (
            <span className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              {item.preparationTimeMinutes} min
            </span>
          )}
          {item.categoryName && (
            <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">
              {item.categoryName}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
