import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import {
  publicApiService,
  PublicMenuItem
} from '../../lib/publicApi'
import {
  Search,
  MapPin,
  Star,
  Heart,
  Clock,
  ShoppingCart,
  User,
  TrendingUp,
  Flame
} from 'lucide-react'

type CuisineType = 'ALL' | 'AMERICAN' | 'ITALIAN' | 'ASIAN' | 'MEXICAN' | 'SEAFOOD'

export default function ExplorePage() {
  const navigate = useNavigate()
  const [menuItems, setMenuItems] = useState<PublicMenuItem[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCuisine, setSelectedCuisine] = useState<CuisineType>('ALL')
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    loadPopularItems()
  }, [])

  const loadPopularItems = async () => {
    setLoading(true)
    try {
      const { data } = await publicApiService.getPopularMenuItems(20)
      setMenuItems(data.data)
    } catch (error) {
      console.error('Failed to load menu items:', error)
      toast.error('Failed to load menu items')
    } finally {
      setLoading(false)
    }
  }

  const cuisines: { value: CuisineType; label: string }[] = [
    { value: 'ALL', label: 'All Cuisines' },
    { value: 'AMERICAN', label: 'American' },
    { value: 'ITALIAN', label: 'Italian' },
    { value: 'ASIAN', label: 'Asian' },
    { value: 'MEXICAN', label: 'Mexican' },
    { value: 'SEAFOOD', label: 'Seafood' },
  ]

  const filteredItems = menuItems.filter((item) => {
    const matchesSearch = searchQuery
      ? item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase())
      : true
    return matchesSearch
  })

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-xl">R</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">RestaurantPro</h1>
                <p className="text-xs text-gray-500">Management Platform</p>
              </div>
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-4">
              <button className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 rounded-lg transition-colors">
                <ShoppingCart className="w-5 h-5 text-gray-700" />
                <span className="text-sm font-medium text-gray-700">Cart</span>
              </button>
              <button
                onClick={() => navigate('/login')}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <User className="w-5 h-5" />
                <span className="text-sm font-medium">Login</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Search Bar */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search restaurants, cuisines, dishes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-4 text-lg border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>
        </div>

        {/* Cuisine Filters */}
        <div className="mb-8">
          <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-hide">
            {cuisines.map((cuisine) => (
              <button
                key={cuisine.value}
                onClick={() => setSelectedCuisine(cuisine.value)}
                className={`px-6 py-3 rounded-xl font-medium whitespace-nowrap transition-all ${
                  selectedCuisine === cuisine.value
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-200'
                    : 'bg-white text-gray-700 hover:bg-gray-50 shadow'
                }`}
              >
                {cuisine.label}
              </button>
            ))}
          </div>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-2 mb-6">
          <TrendingUp className="w-5 h-5 text-orange-600" />
          <span className="text-gray-700 font-medium">
            Showing {filteredItems.length} restaurant{filteredItems.length !== 1 ? 's' : ''}
          </span>
        </div>

        {/* Menu Items Grid */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600"></div>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-gray-400 mb-4">
              <Search className="w-20 h-20 mx-auto" />
            </div>
            <h3 className="text-2xl font-bold text-gray-700 mb-2">No items found</h3>
            <p className="text-gray-500">Try adjusting your search or filters</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredItems.map((item) => (
              <RestaurantCard key={item.id} item={item} navigate={navigate} />
            ))}
          </div>
        )}
      </main>
    </div>
  )
}

// Restaurant Card Component with Figma Design
function RestaurantCard({
  item,
  navigate,
}: {
  item: PublicMenuItem
  navigate: (path: string) => void
}) {
  const [isFavorite, setIsFavorite] = useState(false)

  // Calculate rating (mock for now)
  const rating = (4.2 + Math.random() * 0.8).toFixed(1)
  const reviews = Math.floor(Math.random() * 1000) + 100
  const deliveryTime = item.preparationTimeMinutes || Math.floor(Math.random() * 20) + 15
  const distance = (Math.random() * 3 + 0.5).toFixed(1)
  const deliveryFee = (Math.random() * 2 + 0.99).toFixed(2)
  const minOrder = (Math.random() * 10 + 10).toFixed(0)

  return (
    <div className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden group cursor-pointer">
      {/* Image */}
      <div className="relative h-64 overflow-hidden">
        {item.primaryImage ? (
          <img
            src={item.primaryImage}
            alt={item.name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center">
            <span className="text-white text-6xl font-bold opacity-20">
              {item.restaurantName.charAt(0)}
            </span>
          </div>
        )}

        {/* Badges */}
        <div className="absolute top-4 left-4 flex flex-col gap-2">
          {item.promotionActive && (
            <span className="px-3 py-1 bg-orange-500 text-white text-xs font-bold rounded-full shadow-lg flex items-center gap-1">
              <Flame className="w-3 h-3" />
              Popular
            </span>
          )}
          {item.hasPremiumBadge && (
            <span className="px-3 py-1 bg-green-600 text-white text-xs font-bold rounded-full shadow-lg">
              New
            </span>
          )}
        </div>

        {/* Favorite Button */}
        <button
          onClick={(e) => {
            e.stopPropagation()
            setIsFavorite(!isFavorite)
          }}
          className="absolute top-4 right-4 w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform"
        >
          <Heart
            className={`w-5 h-5 ${isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-400'}`}
          />
        </button>
      </div>

      {/* Content */}
      <div className="p-5">
        {/* Restaurant Name & Rating */}
        <div className="flex items-start justify-between mb-2">
          <h3 className="text-xl font-bold text-gray-900 flex-1">{item.restaurantName}</h3>
          <div className="flex items-center gap-1 bg-green-50 px-2 py-1 rounded-lg ml-2">
            <Star className="w-4 h-4 fill-green-600 text-green-600" />
            <span className="text-sm font-bold text-green-700">{rating}</span>
          </div>
        </div>

        {/* Description */}
        <p className="text-sm text-gray-600 mb-3 line-clamp-1">{item.description}</p>
        <p className="text-xs text-gray-500 mb-4">{reviews} reviews</p>

        {/* Info Row */}
        <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
          <div className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            <span>{deliveryTime}-{deliveryTime + 10} min</span>
          </div>
          <div className="flex items-center gap-1">
            <MapPin className="w-4 h-4" />
            <span>{distance} km</span>
          </div>
        </div>

        {/* Delivery Info */}
        <div className="flex items-center justify-between text-sm mb-4 pb-4 border-b">
          <span className="text-gray-600">💵 ${deliveryFee} delivery</span>
          <span className="text-gray-600">🍽️ ${minOrder} minimum</span>
        </div>

        {/* View Menu Button */}
        <button
          onClick={() => navigate(`/r/${item.restaurantSlug}`)}
          className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl hover:shadow-lg hover:scale-[1.02] transition-all"
        >
          View Menu
        </button>
      </div>
    </div>
  )
}
