import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import { restaurantApi, Restaurant } from '../../lib/adminApi'
import Button from '../../components/ui/Button'
import { ArrowLeft, Download, Share2, Printer } from 'lucide-react'

export default function QRCodeView() {
  const navigate = useNavigate()
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadRestaurant()
  }, [])

  const loadRestaurant = async () => {
    try {
      const { data } = await restaurantApi.getMyRestaurant()
      setRestaurant(data.data)
    } catch (error: any) {
      if (error.response?.status === 404) {
        toast.error('Avval restaurant yarating')
        navigate('/admin/restaurant')
      } else {
        toast.error('Failed to load restaurant')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleDownload = () => {
    if (!restaurant?.qrCodeUrl) return
    const link = document.createElement('a')
    link.href = restaurant.qrCodeUrl
    link.download = `${restaurant.slug}-qr-code.png`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    toast.success('QR Code yuklab olindi')
  }

  const handlePrint = () => {
    if (!restaurant?.qrCodeUrl) return
    const printWindow = window.open('', '_blank')
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>QR Code - ${restaurant.name}</title>
            <style>
              body {
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                min-height: 100vh;
                margin: 0;
                font-family: Arial, sans-serif;
              }
              img {
                max-width: 400px;
                margin: 20px;
              }
              h1 {
                font-size: 24px;
                margin-bottom: 10px;
              }
              p {
                color: #666;
                margin: 5px;
              }
            </style>
          </head>
          <body>
            <h1>${restaurant.name}</h1>
            <p>Menyuni ko'rish uchun QR kodni skanerlang</p>
            <img src="${restaurant.qrCodeUrl}" alt="QR Code" />
            <p style="font-size: 12px;">https://yourdomain.com/r/${restaurant.slug}</p>
          </body>
        </html>
      `)
      printWindow.document.close()
      printWindow.print()
    }
  }

  const handleShare = async () => {
    if (!restaurant) return

    const shareData = {
      title: restaurant.name,
      text: `${restaurant.name} menusini ko'ring!`,
      url: `${window.location.origin}/r/${restaurant.slug}`,
    }

    try {
      if (navigator.share) {
        await navigator.share(shareData)
        toast.success('Ulashildi')
      } else {
        // Fallback: copy to clipboard
        await navigator.clipboard.writeText(shareData.url)
        toast.success('Link nusxalandi')
      }
    } catch (error) {
      console.error('Share failed:', error)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!restaurant || restaurant.status !== 'ACTIVE') {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <button
          onClick={() => navigate('/dashboard')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="w-5 h-5" />
          Orqaga
        </button>
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
          <h2 className="text-xl font-bold text-yellow-800 mb-2">QR Code hali tayyor emas</h2>
          <p className="text-yellow-700">
            {!restaurant
              ? 'Avval restaurant yarating'
              : `Restaurant statusi: ${restaurant.status}. Admin tomonidan tasdiqlashni kuting.`}
          </p>
          <Button
            onClick={() => navigate('/admin/restaurant')}
            className="mt-4"
          >
            Restaurant sahifasiga o'tish
          </Button>
        </div>
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
        <h1 className="text-3xl font-bold">QR Code</h1>
        <p className="text-gray-600">{restaurant.name}</p>
      </div>

      <div className="bg-white rounded-lg shadow-lg p-8">
        <div className="flex flex-col items-center">
          {restaurant.qrCodeUrl ? (
            <>
              <div className="bg-white p-6 rounded-xl shadow-md mb-6">
                <img
                  src={restaurant.qrCodeUrl}
                  alt="QR Code"
                  className="w-64 h-64"
                />
              </div>

              <div className="text-center mb-6">
                <h3 className="text-xl font-semibold mb-2">
                  Mijozlar uchun QR Code
                </h3>
                <p className="text-gray-600 mb-2">
                  Mijozlar bu QR kodni skanerlaydi va sizning menyungizni ko'radi
                </p>
                <p className="text-sm text-blue-600 font-mono bg-blue-50 px-4 py-2 rounded">
                  {window.location.origin}/r/{restaurant.slug}
                </p>
              </div>

              <div className="flex gap-3 flex-wrap justify-center">
                <Button onClick={handleDownload} className="gap-2">
                  <Download className="w-4 h-4" />
                  Yuklab olish
                </Button>
                <Button onClick={handlePrint} variant="secondary" className="gap-2">
                  <Printer className="w-4 h-4" />
                  Print qilish
                </Button>
                <Button onClick={handleShare} variant="outline" className="gap-2">
                  <Share2 className="w-4 h-4" />
                  Ulashish
                </Button>
              </div>

              <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6 w-full">
                <h4 className="font-semibold text-blue-900 mb-3">
                  QR Code'dan qanday foydalanish:
                </h4>
                <ul className="space-y-2 text-sm text-blue-800">
                  <li className="flex items-start gap-2">
                    <span className="font-bold">1.</span>
                    <span>QR kodni yuklab oling yoki print qiling</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="font-bold">2.</span>
                    <span>Stol ustida, menyu ichida yoki devor ustida joylashtiring</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="font-bold">3.</span>
                    <span>Mijozlar telefon kamerasi orqali skanerlaydi</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="font-bold">4.</span>
                    <span>Menyu avtomatik ochiladi - hech qanday app kerak emas!</span>
                  </li>
                </ul>
              </div>
            </>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-600">QR Code generatsiya qilinmoqda...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
