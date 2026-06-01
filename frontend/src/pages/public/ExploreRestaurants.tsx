import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import {
  publicApiService,
  NearbyRestaurant,
  SearchResult,
  PublicMenuItem
} from '../../lib/publicApi'
import {
  Search,
  MapPin,
  Navigation,
  Star,
  ChevronRight,
  Loader2,
  TrendingUp,
  Clock
} from 'lucide-react'

export default function ExploreRestaurants() {
  const navigate = useNavigate()
  const [nearbyRestaurants, setNearbyRestaurants] = useState<NearbyRestaurant[]>([])
  const [popularMenuItems, setPopularMenuItems] = useState<PublicMenuItem[]>([])
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [locationLoading, setLocationLoading] = useState(false)
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [radiusKm, setRadiusKm] = useState(10)

  useEffect(() => {
    // Try to get user location on mount
    getCurrentLocation()
    // Load popular items regardless of location
    loadPopularItems()
  }, [])

  const loadPopularItems = async () => {
    try {
      const { data } = await publicApiService.getPopularMenuItems(20)
      setPopularMenuItems(data.data)
    } catch (error) {
      console.error('Failed to load popular items:', error)
    }
  }

  const getCurrentLocation = () => {
    setLocationLoading(true)
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          }
          setUserLocation(location)
          loadNearbyRestaurants(location.lat, location.lng, radiusKm)
          setLocationLoading(false)
        },
        (error) => {
          console.error('Location error:', error)
          toast.error('Could not get your location. Please enable location access.')
          setLocationLoading(false)
        }
      )
    } else {
      toast.error('Geolocation is not supported by your browser')
      setLocationLoading(false)
    }
  }

  const loadNearbyRestaurants = async (lat: number, lng: number, radius: number) => {
    setLoading(true)
    try {
      const { data } = await publicApiService.getNearbyRestaurants(lat, lng, radius)
      setNearbyRestaurants(data.data)
    } catch (error) {
      toast.error('Failed to load nearby restaurants')
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = async (query: string) => {
    setSearchQuery(query)
    if (query.length < 2) {
      setSearchResults([])
      return
    }

    try {
      const { data } = await publicApiService.search(query)
      setSearchResults(data.data)
    } catch (error) {
      toast.error('Search failed')
    }
  }

  const handleRadiusChange = (newRadius: number) => {
    setRadiusKm(newRadius)
    if (userLocation) {
      loadNearbyRestaurants(userLocation.lat, userLocation.lng, newRadius)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-br from-blue-600 to-purple-600 text-white py-12">
        <div className="max-w-7xl mx-auto px-4">
          <h1 className="text-4xl font-bold mb-4">Explore Restaurants</h1>
          <p className="text-blue-100 text-lg">
            Discover amazing restaurants near you
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Search Bar */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search restaurants or menu items..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Search Results Dropdown */}
          {searchResults.length > 0 && (
            <div className="mt-4 border-t pt-4">
              <h3 className="font-semibold text-gray-700 mb-3">Search Results</h3>
              <div className="space-y-2">
                {searchResults.map((result, index) => (
                  <button
                    key={index}
                    onClick={() => navigate(`/r/${result.restaurantSlug}`)}
                    className="w-full flex items-center gap-4 p-3 hover:bg-gray-50 rounded-lg transition-colors text-left"
                  >
                    {result.imageUrl && (
                      <img
                        src={result.imageUrl}
                        alt={result.name}
                        className="w-16 h-16 rounded-lg object-cover"
                      />
                    )}
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                          {result.type === 'RESTAURANT' ? 'Restaurant' : 'Menu Item'}
                        </span>
                        <h4 className="font-semibold text-gray-900">{result.name}</h4>
                      </div>
                      <p className="text-sm text-gray-600">{result.description}</p>
                      <p className="text-xs text-gray-500 mt-1">{result.restaurantName}</p>
                    </div>
                    {result.price && (
                      <span className="text-lg font-bold text-green-600">${result.price}</span>
                    )}
                    <ChevronRight className="w-5 h-5 text-gray-400" />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Location Controls */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <div className="flex flex-wrap items-center gap-4">
            <button
              onClick={getCurrentLocation}
              disabled={locationLoading}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {locationLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Navigation className="w-5 h-5" />
              )}
              {userLocation ? 'Update Location' : 'Get My Location'}
            </button>

            {userLocation && (
              <>
                <div className="flex items-center gap-2 text-gray-700">
                  <MapPin className="w-5 h-5 text-blue-600" />
                  <span className="text-sm">
                    {userLocation.lat.toFixed(4)}, {userLocation.lng.toFixed(4)}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <label className="text-sm font-medium text-gray-700">Radius:</label>
                  <select
                    value={radiusKm}
                    onChange={(e) => handleRadiusChange(Number(e.target.value))}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value={1}>1 km</option>
                    <option value={5}>5 km</option>
                    <option value={10}>10 km</option>
                    <option value={20}>20 km</option>
                    <option value={50}>50 km</option>
                  </select>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Nearby Restaurants or Popular Items */}
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
          </div>
        ) : nearbyRestaurants.length > 0 ? (
          <>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Nearby Restaurants ({nearbyRestaurants.length})
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {nearbyRestaurants.map((restaurant) => (
                <RestaurantCard
                  key={restaurant.id}
                  restaurant={restaurant}
                  onClick={() => navigate(`/r/${restaurant.slug}`)}
                />
              ))}
            </div>
          </>
        ) : (
          <>
            {!userLocation && (
              <div className="text-center py-8 mb-8 bg-blue-50 rounded-lg">
                <MapPin className="w-12 h-12 text-blue-400 mx-auto mb-3" />
                <h3 className="text-lg font-semibold text-gray-700 mb-2">
                  Enable location to find restaurants near you
                </h3>
                <p className="text-gray-600 mb-4">
                  Or browse our popular menu items below
                </p>
              </div>
            )}

            {/* Popular Menu Items */}
            {popularMenuItems.length > 0 && (
              <>
                <div className="flex items-center gap-2 mb-6">
                  <TrendingUp className="w-6 h-6 text-red-600" />
                  <h2 className="text-2xl font-bold text-gray-900">
                    Popular Menu Items
                  </h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {popularMenuItems.map((item) => (
                    <MenuItemCard
                      key={item.id}
                      item={item}
                      onClick={() => navigate(`/r/${item.restaurantSlug}`)}
                    />
                  ))}
                </div>
              </>
            )}

            {userLocation && nearbyRestaurants.length === 0 && (
              <div className="text-center py-12 mt-8">
                <p className="text-gray-500">
                  No restaurants found nearby. Try increasing the search radius.
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

// Restaurant Card Component
function RestaurantCard({
  restaurant,
  onClick,
}: {
  restaurant: NearbyRestaurant
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-all overflow-hidden text-left group"
    >
      {/* Cover Image */}
      <div className="relative h-48 bg-gray-200">
        {restaurant.coverImageUrl ? (
          <img
            src={restaurant.coverImageUrl}
            alt={restaurant.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-blue-400 to-purple-500" />
        )}

        {/* Premium Badge */}
        {restaurant.isPremium && (
          <div className="absolute top-3 right-3 bg-yellow-500 text-yellow-900 px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 shadow-lg">
            <Star className="w-3 h-3 fill-current" />
            Premium
          </div>
        )}

        {/* Logo Overlay */}
        {restaurant.logoUrl && (
          <div className="absolute -bottom-8 left-4">
            <img
              src={restaurant.logoUrl}
              alt={restaurant.name}
              className="w-16 h-16 rounded-xl border-4 border-white shadow-lg object-cover"
            />
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4 pt-10">
        <h3 className="text-xl font-bold text-gray-900 mb-1">{restaurant.name}</h3>
        <p className="text-sm text-gray-600 mb-3 line-clamp-2">{restaurant.description}</p>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1 text-gray-700">
            <MapPin className="w-4 h-4 text-blue-600" />
            <span className="text-sm">{restaurant.address}</span>
          </div>
        </div>

        {/* Distance */}
        <div className="mt-3 pt-3 border-t flex items-center justify-between">
          <span className="text-sm text-gray-500">{restaurant.city}</span>
          <span className="text-sm font-semibold text-blue-600">
            {restaurant.distance.toFixed(1)} km away
          </span>
        </div>
      </div>
    </button>
  )
}

// Menu Item Card Component
function MenuItemCard({
  item,
  onClick,
}: {
  item: PublicMenuItem
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all overflow-hidden text-left group"
    >
      {/* Image */}
      <div className="relative h-40 bg-gray-200">
        {item.primaryImage ? (
          <img
            src={item.primaryImage}
            alt={item.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            <span className="text-sm">No image</span>
          </div>
        )}

        {/* Badges */}
        <div className="absolute top-2 right-2 flex flex-col gap-1">
          {item.hasPremiumBadge && (
            <span className="bg-purple-600 text-white px-2 py-1 rounded-full text-xs font-semibold shadow">
              Premium
            </span>
          )}
          {item.promotionActive && item.promotionText && (
            <span className="bg-red-600 text-white px-2 py-1 rounded-full text-xs font-semibold shadow">
              Promo
            </span>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-3">
        <div className="flex justify-between items-start mb-1">
          <h3 className="text-base font-bold text-gray-900 line-clamp-1">{item.name}</h3>
          <span className="text-lg font-bold text-green-600 ml-2">${item.price}</span>
        </div>

        <p className="text-xs text-gray-600 mb-2 line-clamp-2">{item.description}</p>

        <div className="flex items-center justify-between pt-2 border-t">
          <span className="text-xs text-gray-500">{item.restaurantName}</span>
          {item.preparationTimeMinutes && (
            <span className="flex items-center gap-1 text-xs text-gray-500">
              <Clock className="w-3 h-3" />
              {item.preparationTimeMinutes}m
            </span>
          )}
        </div>
      </div>
    </button>
  )
}
