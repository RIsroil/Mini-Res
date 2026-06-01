import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import { menuItemApi, categoryApi, restaurantApi, MenuItem, MenuItemRequest, Category, Restaurant } from '../../lib/adminApi'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import { ArrowLeft } from 'lucide-react'

export default function MenuManagement() {
  const navigate = useNavigate()
  const [menuItems, setMenuItems] = useState<MenuItem[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null)
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null)
  const [formData, setFormData] = useState<MenuItemRequest>({
    name: '',
    description: '',
    ingredients: '',
    price: 0,
    preparationTimeMinutes: 0,
    promotionText: '',
    promotionActive: false,
    hasPremiumBadge: false,
    categoryId: '',
  })

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const [menuResponse, categoryResponse, restaurantResponse] = await Promise.all([
        menuItemApi.getMyMenuItems(),
        categoryApi.getMyCategories(),
        restaurantApi.getMyRestaurant(),
      ])
      setMenuItems(menuResponse.data.data)
      setCategories(categoryResponse.data.data.filter(c => c.isActive))
      setRestaurant(restaurantResponse.data.data)
    } catch (error) {
      toast.error('Failed to load data')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      // Convert empty string to undefined for optional fields
      const submitData = {
        ...formData,
        categoryId: formData.categoryId || undefined,
        ingredients: formData.ingredients || undefined,
        preparationTimeMinutes: formData.preparationTimeMinutes || undefined,
        promotionText: formData.promotionText || undefined,
      }

      if (editingItem) {
        await menuItemApi.updateMenuItem(editingItem.id, submitData)
        toast.success('Menu item updated successfully')
      } else {
        await menuItemApi.createMenuItem(submitData)
        toast.success('Menu item created successfully')
      }
      setShowModal(false)
      resetForm()
      loadData()
    } catch (error) {
      toast.error('Failed to save menu item')
    }
  }

  const resetForm = () => {
    setEditingItem(null)
    setFormData({
      name: '',
      description: '',
      ingredients: '',
      price: 0,
      preparationTimeMinutes: 0,
      promotionText: '',
      promotionActive: false,
      hasPremiumBadge: false,
      categoryId: '',
    })
  }

  const handleEdit = (item: MenuItem) => {
    setEditingItem(item)
    setFormData({
      name: item.name,
      description: item.description,
      ingredients: item.ingredients || '',
      price: item.price,
      preparationTimeMinutes: item.preparationTimeMinutes || 0,
      promotionText: item.promotionText || '',
      promotionActive: item.promotionActive,
      hasPremiumBadge: item.hasPremiumBadge,
      categoryId: item.categoryId || '',
    })
    setShowModal(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this menu item?')) return

    try {
      await menuItemApi.deleteMenuItem(id)
      toast.success('Menu item deleted successfully')
      loadData()
    } catch (error) {
      toast.error('Failed to delete menu item')
    }
  }

  const handleToggleAvailability = async (id: string) => {
    try {
      await menuItemApi.toggleAvailability(id)
      toast.success('Availability updated')
      loadData()
    } catch (error) {
      toast.error('Failed to update availability')
    }
  }

  const handleImageUpload = async (itemId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      await menuItemApi.uploadImage(itemId, file)
      toast.success('Image uploaded successfully')
      loadData()
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to upload image')
    }
  }

  const openCreateModal = () => {
    resetForm()
    setShowModal(true)
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <button
        onClick={() => navigate('/dashboard')}
        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
      >
        <ArrowLeft className="w-5 h-5" />
        Orqaga
      </button>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Menu Management</h1>
        <Button onClick={openCreateModal}>+ Add Menu Item</Button>
      </div>

      {categories.length === 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <p className="text-yellow-800">
            Please create at least one category before adding menu items.
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {menuItems.length === 0 ? (
          <div className="col-span-full text-center py-12 text-gray-500">
            No menu items yet. Create your first menu item!
          </div>
        ) : (
          menuItems.map((item) => (
            <div key={item.id} className="bg-white rounded-lg shadow overflow-hidden">
              <div className="relative h-48 bg-gray-200">
                {item.primaryImage ? (
                  <img src={item.primaryImage} alt={item.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-400">
                    <span>No image</span>
                  </div>
                )}
                <div className="absolute top-2 right-2 flex gap-1">
                  {item.hasPremiumBadge && (
                    <span className="bg-purple-600 text-white px-2 py-1 rounded text-xs">Premium</span>
                  )}
                  {item.promotionActive && (
                    <span className="bg-red-600 text-white px-2 py-1 rounded text-xs">Promo</span>
                  )}
                </div>
              </div>
              <div className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-bold text-lg">{item.name}</h3>
                  <span className="text-lg font-bold text-green-600">${item.price}</span>
                </div>
                <p className="text-sm text-gray-600 mb-2 line-clamp-2">{item.description}</p>
                {item.categoryName && (
                  <span className="inline-block px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded mb-2">
                    {item.categoryName}
                  </span>
                )}
                <div className="flex items-center gap-2 mb-3">
                  <span className={`px-2 py-1 text-xs rounded ${
                    item.isAvailable ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {item.isAvailable ? 'Available' : 'Unavailable'}
                  </span>
                  {item.preparationTimeMinutes && (
                    <span className="text-xs text-gray-500">{item.preparationTimeMinutes} min</span>
                  )}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleToggleAvailability(item.id)}
                    className="flex-1 text-sm py-1 px-2 bg-blue-50 text-blue-700 rounded hover:bg-blue-100"
                  >
                    Toggle
                  </button>
                  <button
                    onClick={() => handleEdit(item)}
                    className="flex-1 text-sm py-1 px-2 bg-indigo-50 text-indigo-700 rounded hover:bg-indigo-100"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="flex-1 text-sm py-1 px-2 bg-red-50 text-red-700 rounded hover:bg-red-100"
                  >
                    Delete
                  </button>
                </div>
                <div className="mt-2">
                  <label className="block text-xs text-gray-600 mb-1">
                    Upload Image
                    {item.images.length > 0 && (
                      <span className="ml-2 text-blue-600">
                        ({item.images.length}/{restaurant?.isPremium ? '3' : '1'} rasm)
                      </span>
                    )}
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageUpload(item.id, e)}
                    className="text-xs w-full"
                    disabled={item.images.length >= (restaurant?.isPremium ? 3 : 1)}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {restaurant?.isPremium
                      ? 'Premium: 3 tagacha rasm yuklash mumkin'
                      : 'Standard: 1 ta rasm yuklash mumkin'}
                  </p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl m-4">
            <h2 className="text-2xl font-bold mb-4">
              {editingItem ? 'Edit Menu Item' : 'Create Menu Item'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Item Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                placeholder="e.g., Margherita Pizza"
              />

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Ingredients (optional)</label>
                <textarea
                  value={formData.ingredients}
                  onChange={(e) => setFormData({ ...formData, ingredients: e.target.value })}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Tomato, Mozzarella, Basil"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Price"
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                  required
                />
                <Input
                  label="Preparation Time (minutes)"
                  type="number"
                  value={formData.preparationTimeMinutes || ''}
                  onChange={(e) => setFormData({ ...formData, preparationTimeMinutes: parseInt(e.target.value) || 0 })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select
                  value={formData.categoryId}
                  onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">No category</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <Input
                label="Promotion Text (optional)"
                value={formData.promotionText}
                onChange={(e) => setFormData({ ...formData, promotionText: e.target.value })}
                placeholder="e.g., Buy 1 Get 1 Free"
              />

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-3">
                <label className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    checked={formData.promotionActive}
                    onChange={(e) => setFormData({ ...formData, promotionActive: e.target.checked })}
                    className="rounded mt-1"
                  />
                  <div>
                    <span className="text-sm font-medium">Promotion Active</span>
                    <p className="text-xs text-gray-600">Aksiya faol bo'lsa, menu itemda qizil "Promo" belgisi ko'rinadi va promotion text ko'rsatiladi</p>
                  </div>
                </label>
                <label className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    checked={formData.hasPremiumBadge}
                    onChange={(e) => setFormData({ ...formData, hasPremiumBadge: e.target.checked })}
                    className="rounded mt-1"
                  />
                  <div>
                    <span className="text-sm font-medium">Premium Badge</span>
                    <p className="text-xs text-gray-600">Premium belgisi qo'shilsa, menu itemda binafsha "Premium" belgisi ko'rinadi (maxsus taomlar uchun)</p>
                  </div>
                </label>
              </div>

              <div className="flex gap-2">
                <Button type="submit" className="flex-1">
                  {editingItem ? 'Update' : 'Create'}
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setShowModal(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
