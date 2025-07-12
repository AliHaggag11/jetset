'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Clock, MapPin, DollarSign, Calendar, RefreshCw, Share2, Download, ExternalLink, Users } from 'lucide-react'
import { generateItinerary } from '@/lib/groq'
import type { TripData, ItineraryDay } from '@/lib/types'

export default function ItineraryPage() {
  const params = useParams()
  const router = useRouter()
  const tripId = params.id as string
  
  const [trip, setTrip] = useState<any>(null)
  const [itinerary, setItinerary] = useState<ItineraryDay[]>([])
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isIncomplete, setIsIncomplete] = useState(false)
  const [expectedDays, setExpectedDays] = useState(0)

  useEffect(() => {
    // Load trip data from localStorage
    const trips = JSON.parse(localStorage.getItem('jetset_trips') || '[]')
    const currentTrip = trips.find((t: any) => t.id === tripId)
    
    if (currentTrip) {
      setTrip(currentTrip)
      generateTripItinerary(currentTrip)
    } else {
      router.push('/plan')
    }
  }, [tripId, router])

  const generateTripItinerary = async (tripData: any) => {
    setIsGenerating(true)
    setError(null)
    
    try {
      const geminiTripData: TripData = {
        destination: tripData.destination,
        startDate: tripData.startDate,
        endDate: tripData.endDate,
        budget: tripData.budget,
        persona: tripData.persona,
        interests: tripData.interests
      }
      
      const response = await fetch('/api/generate-itinerary', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(geminiTripData),
      })

      if (!response.ok) {
        throw new Error('Failed to generate itinerary')
      }

      const data = await response.json()
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to generate itinerary')
      }

      const generatedItinerary = data.itinerary || []
      setItinerary(generatedItinerary)
      
      // Show warning if itinerary is incomplete
      if (!data.isComplete && data.generatedDays < data.totalDays) {
        console.warn(`Incomplete itinerary: Generated ${data.generatedDays} days out of ${data.totalDays} requested`)
        setIsIncomplete(true)
        setExpectedDays(data.totalDays)
      } else {
        setIsIncomplete(false)
        setExpectedDays(0)
      }
      
      // Save itinerary to localStorage
      const trips = JSON.parse(localStorage.getItem('jetset_trips') || '[]')
      const updatedTrips = trips.map((t: any) => 
        t.id === tripId 
          ? { ...t, itinerary: generatedItinerary, generated_at: new Date().toISOString() }
          : t
      )
      localStorage.setItem('jetset_trips', JSON.stringify(updatedTrips))
      
    } catch (err) {
      console.error('Error generating itinerary:', err)
      setError('Failed to generate itinerary. Please try again.')
    } finally {
      setIsGenerating(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'food':
        return '🍽️'
      case 'sightseeing':
        return '🏛️'
      case 'nature':
        return '🌿'
      case 'shopping':
        return '🛍️'
      case 'nightlife':
        return '🌙'
      case 'transportation':
        return '🚗'
      case 'accommodation':
        return '🏨'
      case 'culture':
        return '🎭'
      case 'adventure':
        return '🏔️'
      default:
        return '📍'
    }
  }

  const totalCost = itinerary.reduce((sum, day) => sum + day.estimatedCost, 0)

  if (!trip) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Loading trip...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Trip Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{trip.title}</h1>
              <div className="flex items-center space-x-4 mt-2 text-gray-600">
                <div className="flex items-center space-x-1">
                  <MapPin className="w-4 h-4" />
                  <span>{trip.destination}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Calendar className="w-4 h-4" />
                  <span>{formatDate(trip.startDate)} - {formatDate(trip.endDate)}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <DollarSign className="w-4 h-4" />
                  <span>${trip.budget}</span>
                </div>
              </div>
            </div>
            
            <div className="flex space-x-2">
              <Button
                variant="outline"
                onClick={() => generateTripItinerary(trip)}
                disabled={isGenerating}
                className="flex items-center space-x-2"
              >
                <RefreshCw className={`w-4 h-4 ${isGenerating ? 'animate-spin' : ''}`} />
                <span>Regenerate</span>
              </Button>
              <Button variant="outline" className="flex items-center space-x-2">
                <Share2 className="w-4 h-4" />
                <span>Share</span>
              </Button>
              <Button variant="outline" className="flex items-center space-x-2">
                <Download className="w-4 h-4" />
                <span>Export</span>
              </Button>
            </div>
          </div>
          
          {/* Trip Summary */}
          <Card>
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{itinerary.length}</div>
                  <div className="text-sm text-gray-600">Days</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">${totalCost}</div>
                  <div className="text-sm text-gray-600">Estimated Total</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    {itinerary.reduce((sum, day) => sum + day.activities.length, 0)}
                  </div>
                  <div className="text-sm text-gray-600">Activities</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Incomplete Itinerary Warning */}
        {isIncomplete && (
          <Card className="mb-6 border-orange-200 bg-orange-50">
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2 text-orange-800">
                <div className="w-4 h-4 bg-orange-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs">!</span>
                </div>
                <div>
                  <p className="font-semibold">Incomplete Itinerary</p>
                  <p className="text-sm">
                    Generated {itinerary.length} days out of {expectedDays} requested days. 
                    <Button 
                      variant="link" 
                      className="text-orange-800 underline p-0 h-auto ml-1"
                      onClick={() => generateTripItinerary(trip)}
                    >
                      Try regenerating
                    </Button>
                    for a complete itinerary.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Loading State */}
        {isGenerating && (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-lg font-semibold">Generating your itinerary...</p>
            <p className="text-gray-600">This may take a moment</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center text-red-600">
                <p className="font-semibold">Error</p>
                <p>{error}</p>
                <Button 
                  className="mt-4" 
                  onClick={() => generateTripItinerary(trip)}
                >
                  Try Again
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Itinerary */}
        {itinerary.length > 0 && (
          <div className="space-y-6">
            {itinerary.map((day, index) => (
              <Card key={index}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-xl">
                        Day {day.day} - {formatDate(day.date)}
                      </CardTitle>
                      {(day as any).city && (
                        <p className="text-sm text-gray-600 mt-1 flex items-center">
                          <MapPin className="w-3 h-3 mr-1" />
                          {(day as any).city}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant="secondary" className="flex items-center space-x-1">
                        <DollarSign className="w-3 h-3" />
                        <span>${day.estimatedCost}</span>
                      </Badge>
                      <Badge variant="outline" className="flex items-center space-x-1">
                        <span>{day.activities.length} activities</span>
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {day.activities.map((activity, activityIndex) => (
                      <div key={activityIndex} className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                        <div className="flex-shrink-0">
                          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                            <span className="text-lg">{getCategoryIcon(activity.category)}</span>
                          </div>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-semibold text-gray-900">{activity.title}</h4>
                            <div className="flex items-center space-x-2">
                              <Badge variant="outline" className="flex items-center space-x-1">
                                <Clock className="w-3 h-3" />
                                <span>{activity.time}</span>
                              </Badge>
                              <Badge variant="outline" className="flex items-center space-x-1">
                                <Users className="w-3 h-3" />
                                <span>${activity.pricePerPerson || activity.cost}/pp</span>
                              </Badge>
                              <Badge variant="outline" className="flex items-center space-x-1">
                                <DollarSign className="w-3 h-3" />
                                <span>Total: ${activity.cost}</span>
                              </Badge>
                            </div>
                          </div>
                          <p className="text-gray-600 mb-3">{activity.description}</p>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-1 text-sm text-gray-500">
                              <MapPin className="w-3 h-3" />
                              <span>{activity.location}</span>
                            </div>
                            {activity.link && (
                              <a 
                                href={activity.link} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="inline-flex items-center space-x-1 text-blue-600 hover:text-blue-800 text-sm font-medium"
                              >
                                <span>Book Now</span>
                                <ExternalLink className="w-3 h-3" />
                              </a>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
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