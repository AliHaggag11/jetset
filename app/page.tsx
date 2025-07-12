import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Plane, 
  MapPin, 
  DollarSign, 
  Sparkles, 
  Users, 
  ArrowRight,
  CheckCircle,
  Star,
  Zap,
  Brain,
  Clock
} from 'lucide-react'
import Link from 'next/link'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative">
        <div className="container mx-auto px-4 pt-20 pb-16 lg:pt-32 lg:pb-24">
          <div className="max-w-4xl mx-auto text-center">
            <Badge variant="secondary" className="mb-8 bg-primary/10 text-primary border-primary/20">
              <Sparkles className="w-4 h-4 mr-2" />
              AI-Powered Travel Planning
            </Badge>
            
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-foreground mb-8 tracking-tight">
              Plan amazing trips
              <span className="block text-primary">in minutes, not hours</span>
            </h1>
            
            <p className="text-xl text-muted-foreground mb-12 max-w-2xl mx-auto leading-relaxed">
              Create personalized itineraries with AI. Get the perfect trip plan 
              tailored to your budget, style, and interests.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
              <Button 
                size="lg" 
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 text-lg font-medium shadow-sm"
                asChild
              >
                <Link href="/plan" className="flex items-center space-x-2">
                  <span>Start planning free</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </Button>
              
              <Button 
                size="lg" 
                variant="outline" 
                className="border-gray-300 text-gray-700 px-8 py-3 text-lg font-medium"
                asChild
              >
                <Link href="/dashboard">View example</Link>
              </Button>
            </div>
            
            <div className="flex items-center justify-center space-x-8 text-sm text-gray-500">
              <div className="flex items-center space-x-2">
                <div className="flex space-x-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <span>4.9/5 from 2,000+ users</span>
              </div>
              <div className="hidden sm:block h-4 w-px bg-gray-300"></div>
              <span className="hidden sm:inline">Free to start • No credit card required</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-20">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Everything you need to plan the perfect trip
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Powered by AI, designed for travelers who want more time exploring and less time planning.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <Card className="border-0 shadow-sm bg-white p-8 text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-6">
                <Brain className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">AI-Powered Planning</h3>
              <p className="text-gray-600 leading-relaxed">
                Get personalized itineraries created by advanced AI that understands your preferences and budget.
              </p>
            </Card>
            
            <Card className="border-0 shadow-sm bg-white p-8 text-center">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-6">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Smart Budgeting</h3>
              <p className="text-gray-600 leading-relaxed">
                Stay within budget with intelligent cost tracking and suggestions for the best value experiences.
              </p>
            </Card>
            
            <Card className="border-0 shadow-sm bg-white p-8 text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-6">
                <Clock className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Save Hours of Research</h3>
              <p className="text-gray-600 leading-relaxed">
                Skip the endless searching. Get detailed plans with activities, restaurants, and hidden gems instantly.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-20">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              How it works
            </h2>
            <p className="text-xl text-gray-600">
              Get your perfect itinerary in just a few simple steps
            </p>
          </div>
          
          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center mb-16">
              <div>
                <div className="flex items-center mb-4">
                  <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold text-sm mr-4">
                    1
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900">Tell us about your trip</h3>
                </div>
                <p className="text-gray-600 leading-relaxed ml-12">
                  Share your destination, dates, budget, and travel style. The more we know, the better your itinerary.
                </p>
              </div>
              <div className="bg-gray-50 rounded-lg p-8 h-48 flex items-center justify-center">
                <div className="text-center text-gray-400">
                  <MapPin className="w-12 h-12 mx-auto mb-2" />
                  <span className="text-sm">Trip details form</span>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center mb-16">
              <div className="bg-gray-50 rounded-lg p-8 h-48 flex items-center justify-center md:order-1">
                <div className="text-center text-gray-400">
                  <Zap className="w-12 h-12 mx-auto mb-2" />
                  <span className="text-sm">AI generating itinerary</span>
                </div>
              </div>
              <div className="md:order-2">
                <div className="flex items-center mb-4">
                  <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold text-sm mr-4">
                    2
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900">AI creates your itinerary</h3>
                </div>
                <p className="text-gray-600 leading-relaxed ml-12">
                  Our AI analyzes thousands of destinations and creates a personalized day-by-day plan just for you.
                </p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
              <div>
                <div className="flex items-center mb-4">
                  <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold text-sm mr-4">
                    3
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900">Enjoy your perfect trip</h3>
                </div>
                <p className="text-gray-600 leading-relaxed ml-12">
                  Get detailed recommendations, costs, and timing. Modify anything you want and start exploring.
                </p>
              </div>
              <div className="bg-gray-50 rounded-lg p-8 h-48 flex items-center justify-center">
                <div className="text-center text-gray-400">
                  <Plane className="w-12 h-12 mx-auto mb-2" />
                  <span className="text-sm">Your itinerary ready</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="py-24 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Loved by travelers worldwide
              </h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
              <Card className="border-0 shadow-sm bg-white p-8">
                <div className="flex space-x-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-gray-600 mb-6 leading-relaxed">
                  "JetSet planned our entire 2-week Europe trip in under 10 minutes. The recommendations were spot-on and we saved over $800 compared to booking separately."
                </p>
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold text-sm mr-3">
                    S
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">Sarah Chen</div>
                    <div className="text-sm text-gray-500">San Francisco, CA</div>
                  </div>
                </div>
              </Card>
              
              <Card className="border-0 shadow-sm bg-white p-8">
                <div className="flex space-x-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-gray-600 mb-6 leading-relaxed">
                  "As someone who hates planning, this was a game-changer. The AI understood exactly what I wanted - budget-friendly but still amazing experiences."
                </p>
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center text-white font-semibold text-sm mr-3">
                    M
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">Mike Rodriguez</div>
                    <div className="text-sm text-gray-500">Austin, TX</div>
                  </div>
                </div>
              </Card>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
              <div>
                <div className="text-3xl font-bold text-gray-900 mb-2">2,000+</div>
                <div className="text-gray-600">Happy travelers</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-gray-900 mb-2">15 hours</div>
                <div className="text-gray-600">Average time saved</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-gray-900 mb-2">$850</div>
                <div className="text-gray-600">Average money saved</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
              Ready to plan your next adventure?
            </h2>
            <p className="text-xl text-gray-600 mb-8">
              Join thousands of travelers who are planning smarter, not harder.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 text-lg font-medium"
                asChild
              >
                <Link href="/plan" className="flex items-center space-x-2">
                  <span>Start planning free</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </Button>
            </div>
            <p className="text-sm text-gray-500 mt-6">
              No credit card required • Free to start • Upgrade anytime
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}
