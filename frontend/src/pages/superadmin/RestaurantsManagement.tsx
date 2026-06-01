import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import {
  superAdminApi,
  Restaurant,
} from '../../lib/superAdminApi'
import {
  ArrowLeft,
  Check,
  X,
  Ban,
  CheckCircle,
  Star,
  Trash2,
  Filter,
  Loader2,
  AlertCircle,
  Store,
  Phone,
  Mail,
  MapPin
} from 'lucide-react'

type StatusFilter = 'ALL' | 'PENDING' | 'ACTIVE' | 'BLOCKED'

export default function RestaurantsManagement() {
  const navigate = useNavigate()
  const [restaurants, setRestaurants] = useState<Restaurant[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('ALL')
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  useEffect(() => {
    loadRestaurants()
  }, [statusFilter])

  const loadRestaurants = async () => {
    setLoading(true)
    try {
      const status = statusFilter === 'ALL' ? undefined : statusFilter
      const { data } = await superAdminApi.getAllRestaurants(status)
      setRestaurants(data.data)
    } catch (error) {
      toast.error('Failed to load restaurants')
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async (id: string) => {
    setActionLoading(id)
    try {
      await superAdminApi.approveRestaurant(id)
      toast.success('Restaurant approved successfully')
      loadRestaurants()
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to approve restaurant')
    } finally {
      setActionLoading(null)
    }
  }

  const handleBlock = async (id: string) => {
    if (!confirm('Are you sure you want to block this restaurant?')) return

    const reason = prompt('Enter reason for blocking (optional):')
    setActionLoading(id)
    try {
      await superAdminApi.blockRestaurant(id, reason || undefined)
      toast.success('Restaurant blocked successfully')
      loadRestaurants()
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to block restaurant')
    } finally {
      setActionLoading(null)
    }
  }

  const handleUnblock = async (id: string) => {
    setActionLoading(id)
    try {
      await superAdminApi.unblockRestaurant(id)
      toast.success('Restaurant unblocked successfully')
      loadRestaurants()
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to unblock restaurant')
    } finally {
      setActionLoading(null)
    }
  }

  const handleTogglePremium = async (id: string) => {
    setActionLoading(id)
    try {
      await superAdminApi.togglePremium(id)
      toast.success('Premium status updated')
      loadRestaurants()
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update premium status')
    } finally {
      setActionLoading(null)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this restaurant? This action cannot be undone.')) return

    setActionLoading(id)
    try {
      await superAdminApi.deleteRestaurant(id)
      toast.success('Restaurant deleted successfully')
      loadRestaurants()
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to delete restaurant')
    } finally {
      setActionLoading(null)
    }
  }

  const filteredRestaurants = restaurants

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/superadmin')}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div className="flex items-center gap-3">
                <Store className="w-8 h-8 text-blue-600" />
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Restaurants Management</h1>
                  <p className="text-sm text-gray-600">
                    {filteredRestaurants.length} restaurant{filteredRestaurants.length !== 1 ? 's' : ''}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
          <div className="flex items-center gap-2 mb-3">
            <Filter className="w-5 h-5 text-gray-600" />
            <span className="font-semibold text-gray-900">Filter by Status</span>
          </div>
          <div className="flex gap-2 flex-wrap">
            {(['ALL', 'PENDING', 'ACTIVE', 'BLOCKED'] as StatusFilter[]).map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  statusFilter === status
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        {/* Restaurants List */}
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
          </div>
        ) : filteredRestaurants.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <Store className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No restaurants found</h3>
            <p className="text-gray-500">
              {statusFilter === 'ALL' ? 'No restaurants in the system yet.' : `No ${statusFilter.toLowerCase()} restaurants.`}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredRestaurants.map((restaurant) => (
              <RestaurantCard
                key={restaurant.id}
                restaurant={restaurant}
                actionLoading={actionLoading === restaurant.id}
                onApprove={handleApprove}
                onBlock={handleBlock}
                onUnblock={handleUnblock}
                onTogglePremium={handleTogglePremium}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  )
}

// Restaurant Card Component
function RestaurantCard({
  restaurant,
  actionLoading,
  onApprove,
  onBlock,
  onUnblock,
  onTogglePremium,
  onDelete,
}: {
  restaurant: Restaurant
  actionLoading: boolean
  onApprove: (id: string) => void
  onBlock: (id: string) => void
  onUnblock: (id: string) => void
  onTogglePremium: (id: string) => void
  onDelete: (id: string) => void
}) {
  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200 hover:shadow-md transition-shadow">
      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-start gap-4 flex-1">
            {restaurant.logoUrl && (
              <img
                src={restaurant.logoUrl}
                alt={restaurant.name}
                className="w-16 h-16 rounded-lg object-cover border border-gray-200"
              />
            )}
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h3 className="text-xl font-bold text-gray-900">{restaurant.name}</h3>
                <StatusBadge status={restaurant.status} />
                {restaurant.isPremium && (
                  <span className="flex items-center gap-1 px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-semibold rounded-full">
                    <Star className="w-3 h-3 fill-current" />
                    PREMIUM
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-600 mb-3">{restaurant.description}</p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm">
                <div className="flex items-center gap-2 text-gray-700">
                  <Phone className="w-4 h-4 text-blue-600" />
                  <span>{restaurant.phone}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-700">
                  <Mail className="w-4 h-4 text-blue-600" />
                  <span>{restaurant.email}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-700">
                  <MapPin className="w-4 h-4 text-blue-600" />
                  <span>{restaurant.city}, {restaurant.country}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 pt-4 border-t">
          {actionLoading ? (
            <div className="flex items-center gap-2 text-gray-600">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="text-sm">Processing...</span>
            </div>
          ) : (
            <>
              {restaurant.status === 'PENDING' && (
                <button
                  onClick={() => onApprove(restaurant.id)}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
                >
                  <Check className="w-4 h-4" />
                  Approve
                </button>
              )}

              {restaurant.status === 'ACTIVE' && (
                <button
                  onClick={() => onBlock(restaurant.id)}
                  className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
                >
                  <Ban className="w-4 h-4" />
                  Block
                </button>
              )}

              {restaurant.status === 'BLOCKED' && (
                <button
                  onClick={() => onUnblock(restaurant.id)}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                >
                  <CheckCircle className="w-4 h-4" />
                  Unblock
                </button>
              )}

              <button
                onClick={() => onTogglePremium(restaurant.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors text-sm font-medium ${
                  restaurant.isPremium
                    ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    : 'bg-yellow-500 text-white hover:bg-yellow-600'
                }`}
              >
                <Star className="w-4 h-4" />
                {restaurant.isPremium ? 'Remove Premium' : 'Make Premium'}
              </button>

              <button
                onClick={() => onDelete(restaurant.id)}
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-red-600 rounded-lg hover:bg-red-50 transition-colors text-sm font-medium ml-auto"
              >
                <Trash2 className="w-4 h-4" />
                Delete
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  const config = {
    PENDING: { bg: 'bg-yellow-100', text: 'text-yellow-800', icon: AlertCircle },
    ACTIVE: { bg: 'bg-green-100', text: 'text-green-800', icon: CheckCircle },
    BLOCKED: { bg: 'bg-red-100', text: 'text-red-800', icon: Ban },
  }[status] || { bg: 'bg-gray-100', text: 'text-gray-800', icon: AlertCircle }

  const Icon = config.icon

  return (
    <span className={`flex items-center gap-1 px-3 py-1 ${config.bg} ${config.text} text-xs font-semibold rounded-full`}>
      <Icon className="w-3 h-3" />
      {status}
    </span>
  )
}
