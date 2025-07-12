'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Calendar, 
  MapPin, 
  DollarSign, 
  Plus, 
  Eye, 
  Edit,
  Trash2,
  Plane
} from 'lucide-react'
import Link from 'next/link'

export default function DashboardPage() {
  const [trips, setTrips] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Load trips from localStorage
    const savedTrips = JSON.parse(localStorage.getItem('jetset_trips') || '[]')
    setTrips(savedTrips)
    setLoading(false)
  }, [])

  const deleteTrip = (tripId: string) => {
    const updatedTrips = trips.filter(trip => trip.id !== tripId)
    setTrips(updatedTrips)
    localStorage.setItem('jetset_trips', JSON.stringify(updatedTrips))
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const getPersonaLabel = (persona: string) => {
    const personaMap: { [key: string]: string } = {
      'budget-backpacker': 'Budget Backpacker',
      'luxury-traveler': 'Luxury Traveler',
      'family-friendly': 'Family Traveler',
      'adventure-seeker': 'Adventure Seeker',
      'culture-enthusiast': 'Culture Enthusiast',
      'foodie': 'Foodie',
      'business-traveler': 'Business Traveler',
      'romantic-couple': 'Romantic Couple'
    }
    return personaMap[persona] || persona
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Loading your trips...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Trips</h1>
            <p className="text-gray-600 mt-1">
              Manage your travel plans and itineraries
            </p>
          </div>
          <Button asChild className="flex items-center space-x-2">
            <Link href="/plan">
              <Plus className="w-4 h-4" />
              <span>New Trip</span>
            </Link>
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Trips</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{trips.length}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Budget</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                ${trips.reduce((sum, trip) => sum + (trip.budget || 0), 0).toLocaleString()}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Destinations</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {new Set(trips.map(trip => trip.destination)).size}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">This Month</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">
                {trips.filter(trip => 
                  new Date(trip.created_at).getMonth() === new Date().getMonth()
                ).length}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Trips Grid */}
        {trips.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <Plane className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No trips planned yet
              </h3>
              <p className="text-gray-600 mb-6">
                Start planning your first AI-powered trip itinerary
              </p>
              <Button asChild>
                <Link href="/plan">
                  <Plus className="w-4 h-4 mr-2" />
                  Plan Your First Trip
                </Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {trips.map((trip) => (
              <Card key={trip.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg line-clamp-2">{trip.title}</CardTitle>
                      <div className="flex items-center space-x-1 mt-1 text-gray-600">
                        <MapPin className="w-4 h-4" />
                        <span className="text-sm">{trip.destination}</span>
                      </div>
                    </div>
                    <Badge variant="secondary" className="ml-2">
                      {getPersonaLabel(trip.persona)}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center space-x-1 text-gray-600">
                        <Calendar className="w-4 h-4" />
                        <span>{formatDate(trip.startDate)} - {formatDate(trip.endDate)}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-1 text-gray-600">
                      <DollarSign className="w-4 h-4" />
                      <span className="font-semibold">${trip.budget.toLocaleString()}</span>
                    </div>
                    
                    <div className="flex items-center space-x-2 pt-2">
                      <Button size="sm" variant="outline" asChild className="flex-1">
                        <Link href={`/itinerary/${trip.id}`}>
                          <Eye className="w-4 h-4 mr-1" />
                          View
                        </Link>
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={() => deleteTrip(trip.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
} 