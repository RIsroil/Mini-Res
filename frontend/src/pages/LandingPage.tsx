import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { QrCode, Smartphone, BarChart3, Menu, ArrowRight, Search } from 'lucide-react'
import Button from '../components/ui/Button'

export default function LandingPage() {
  const navigate = useNavigate()

  const features = [
    {
      icon: QrCode,
      title: 'QR Code Menus',
      description: 'Generate unique QR codes for your restaurant menu',
      color: 'from-blue-500 to-blue-600',
    },
    {
      icon: Smartphone,
      title: 'Mobile Friendly',
      description: 'Beautiful mobile-optimized menu viewing experience',
      color: 'from-green-500 to-green-600',
    },
    {
      icon: Menu,
      title: 'Easy Management',
      description: 'Update your menu items instantly from anywhere',
      color: 'from-purple-500 to-purple-600',
    },
    {
      icon: BarChart3,
      title: 'Analytics',
      description: 'Track views, scans, and popular items',
      color: 'from-orange-500 to-orange-600',
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-secondary-50 via-white to-primary-50">
      <nav className="bg-white/80 backdrop-blur-lg border-b border-secondary-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center">
                <QrCode className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-xl font-bold gradient-text">QR Menu</h1>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                onClick={() => navigate('/explore')}
                className="gap-2"
              >
                <Search className="w-4 h-4" />
                Explore Restaurants
              </Button>
              <Button
                variant="secondary"
                onClick={() => navigate('/login')}
              >
                Login
              </Button>
              <Button
                variant="primary"
                onClick={() => navigate('/register')}
              >
                Get Started
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <main>
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-3xl mx-auto mb-16"
          >
            <h1 className="text-5xl md:text-6xl font-bold text-secondary-900 mb-6">
              Modern{' '}
              <span className="gradient-text">QR Menu Platform</span>
              {' '}for Restaurants
            </h1>
            <p className="text-xl text-secondary-600 mb-8">
              Transform your restaurant experience with contactless digital menus.
              Easy to setup, beautiful to use, powerful to manage.
            </p>
            <Button
              variant="primary"
              size="lg"
              onClick={() => navigate('/register')}
              className="gap-2 text-lg"
            >
              Start Free Trial
              <ArrowRight className="w-5 h-5" />
            </Button>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-20">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="card p-6 text-center"
              >
                <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mx-auto mb-4 shadow-lg`}>
                  <feature.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-lg font-bold text-secondary-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-secondary-600 text-sm">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </section>

        <section className="bg-gradient-to-r from-primary-600 to-primary-700 py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                Ready to digitize your menu?
              </h2>
              <p className="text-primary-100 text-lg mb-8">
                Join hundreds of restaurants already using QR Menu Platform
              </p>
              <Button
                variant="secondary"
                size="lg"
                onClick={() => navigate('/register')}
                className="gap-2"
              >
                Get Started Now
                <ArrowRight className="w-5 h-5" />
              </Button>
            </motion.div>
          </div>
        </section>
      </main>

      <footer className="bg-white border-t border-secondary-200 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-secondary-600">
          <p>&copy; 2026 QR Menu Platform. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
