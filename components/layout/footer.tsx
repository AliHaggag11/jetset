import { Plane } from 'lucide-react'
import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="bg-gray-50 border-t border-gray-200">
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Logo and Description */}
          <div className="lg:col-span-1">
            <div className="flex items-center space-x-3 mb-4">
              <div className="flex items-center justify-center w-8 h-8 bg-blue-600 rounded-lg">
                <Plane className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-semibold text-gray-900">JetSet</span>
            </div>
            <p className="text-sm text-gray-600 mb-6 max-w-sm">
              AI-powered travel planning that creates personalized itineraries 
              tailored to your budget and preferences.
            </p>
            <p className="text-xs text-gray-500">
              © 2024 JetSet. All rights reserved.
            </p>
          </div>

          {/* Product Links */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-4">
              Product
            </h3>
            <ul className="space-y-3">
              <li>
                <Link href="/plan" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
                  Plan Trip
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
                  My Trips
                </Link>
              </li>
              <li>
                <Link href="/pricing" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
                  Pricing
                </Link>
              </li>
              <li>
                <Link href="/features" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
                  Features
                </Link>
              </li>
            </ul>
          </div>

          {/* Company Links */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-4">
              Company
            </h3>
            <ul className="space-y-3">
              <li>
                <Link href="/about" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
                  About
                </Link>
              </li>
              <li>
                <Link href="/blog" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
                  Blog
                </Link>
              </li>
              <li>
                <Link href="/careers" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
                  Careers
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal Links */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-4">
              Legal
            </h3>
            <ul className="space-y-3">
              <li>
                <Link href="/privacy" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/cookies" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
                  Cookie Policy
                </Link>
              </li>
              <li>
                <Link href="/security" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
                  Security
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-gray-200">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="text-xs text-gray-500">
              Built with ❤️ for travelers worldwide
            </div>
            <div className="flex items-center space-x-6">
              <Link href="/help" className="text-xs text-gray-500 hover:text-gray-900 transition-colors">
                Help Center
              </Link>
              <Link href="/status" className="text-xs text-gray-500 hover:text-gray-900 transition-colors">
                Status
              </Link>
              <Link href="/api" className="text-xs text-gray-500 hover:text-gray-900 transition-colors">
                API
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
} 