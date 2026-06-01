import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import { restaurantApi, Restaurant, RestaurantRequest } from '../../lib/adminApi'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import { ArrowLeft } from 'lucide-react'

export default function RestaurantManagement() {
  const navigate = useNavigate()
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState<RestaurantRequest>({
    name: '',
    phone: '',
    email: '',
    description: '',
    address: '',
    city: '',
    country: '',
    addressUrl: '',
    instagramUrl: '',
    facebookUrl: '',
    websiteUrl: '',
  })

  useEffect(() => {
    loadRestaurant()
  }, [])

  const loadRestaurant = async () => {
    try {
      const { data } = await restaurantApi.getMyRestaurant()
      setRestaurant(data.data)
      setFormData({
        name: data.data.name,
        phone: data.data.phone,
        email: data.data.email,
        description: data.data.description,
        address: data.data.address,
        city: data.data.city,
        country: data.data.country,
        addressUrl: data.data.addressUrl || '',
        instagramUrl: data.data.instagramUrl || '',
        facebookUrl: data.data.facebookUrl || '',
        websiteUrl: data.data.websiteUrl || '',
      })
    } catch (error: any) {
      if (error.response?.status === 404) {
        // No restaurant yet
        setRestaurant(null)
      } else {
        toast.error('Failed to load restaurant')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      if (restaurant) {
        await restaurantApi.updateRestaurant(formData)
        toast.success('Restaurant updated successfully')
      } else {
        await restaurantApi.createRestaurant(formData)
        toast.success('Restaurant created successfully')
      }
      loadRestaurant()
    } catch (error) {
      toast.error('Failed to save restaurant')
    } finally {
      setSaving(false)
    }
  }

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      await restaurantApi.uploadLogo(file)
      toast.success('Logo uploaded successfully')
      loadRestaurant()
    } catch (error) {
      toast.error('Failed to upload logo')
    }
  }

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      await restaurantApi.uploadCover(file)
      toast.success('Cover image uploaded successfully')
      loadRestaurant()
    } catch (error) {
      toast.error('Failed to upload cover image')
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <button
        onClick={() => navigate('/dashboard')}
        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
      >
        <ArrowLeft className="w-5 h-5" />
        Orqaga
      </button>
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Restaurant Management</h1>
        {restaurant && (
          <div className="mt-2 flex items-center gap-2">
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
              restaurant.status === 'ACTIVE' ? 'bg-green-100 text-green-800' :
              restaurant.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
              'bg-red-100 text-red-800'
            }`}>
              {restaurant.status}
            </span>
            {restaurant.isPremium && (
              <span className="px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800">
                PREMIUM
              </span>
            )}
          </div>
        )}
      </div>

      {restaurant && (
        <div className="mb-6 grid grid-cols-2 gap-4">
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="font-semibold mb-2">Logo</h3>
            {restaurant.logoUrl && (
              <img src={restaurant.logoUrl} alt="Logo" className="w-32 h-32 object-cover rounded mb-2" />
            )}
            <input
              type="file"
              accept="image/*"
              onChange={handleLogoUpload}
              className="text-sm"
            />
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="font-semibold mb-2">Cover Image</h3>
            {restaurant.coverImageUrl && (
              <img src={restaurant.coverImageUrl} alt="Cover" className="w-full h-32 object-cover rounded mb-2" />
            )}
            <input
              type="file"
              accept="image/*"
              onChange={handleCoverUpload}
              className="text-sm"
            />
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Restaurant Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
          <Input
            label="Phone"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            required
          />
        </div>

        <Input
          label="Email"
          type="email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          required
        />

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <Input
          label="Address"
          value={formData.address}
          onChange={(e) => setFormData({ ...formData, address: e.target.value })}
          required
        />

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="City"
            value={formData.city}
            onChange={(e) => setFormData({ ...formData, city: e.target.value })}
            required
          />
          <Input
            label="Country"
            value={formData.country}
            onChange={(e) => setFormData({ ...formData, country: e.target.value })}
            required
          />
        </div>

        <Input
          label="Google Maps URL"
          value={formData.addressUrl}
          onChange={(e) => setFormData({ ...formData, addressUrl: e.target.value })}
          placeholder="https://maps.google.com/..."
        />

        <div className="grid grid-cols-3 gap-4">
          <Input
            label="Instagram URL"
            value={formData.instagramUrl}
            onChange={(e) => setFormData({ ...formData, instagramUrl: e.target.value })}
            placeholder="https://instagram.com/..."
          />
          <Input
            label="Facebook URL"
            value={formData.facebookUrl}
            onChange={(e) => setFormData({ ...formData, facebookUrl: e.target.value })}
            placeholder="https://facebook.com/..."
          />
          <Input
            label="Website URL"
            value={formData.websiteUrl}
            onChange={(e) => setFormData({ ...formData, websiteUrl: e.target.value })}
            placeholder="https://..."
          />
        </div>

        <Button type="submit" isLoading={saving} className="w-full">
          {restaurant ? 'Update Restaurant' : 'Create Restaurant'}
        </Button>
      </form>
    </div>
  )
}
