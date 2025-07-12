'use client'

import { useEffect, useState, useMemo } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Clock, MapPin, DollarSign, Calendar, RefreshCw, Share2, Download, ExternalLink, Users, Cloud } from 'lucide-react'
import type { TripData, ItineraryDay } from '@/lib/types'
import ReactCountryFlag from 'react-country-flag'
import { fetchUnsplashImage } from '@/lib/unsplash'
import { tripService, type Trip } from '@/lib/tripService'
import { useAuth } from '@/lib/auth'
import { subscriptionService } from '@/lib/subscriptionService'
import { subscriptionManager } from '@/lib/subscriptionManager'
import UpgradeModal from '@/components/upgrade-modal'
import { getWeatherForecast, type WeatherForecast } from '@/lib/weather'
import { WeatherCard } from '@/components/weather-card'
import { WeatherOverview } from '@/components/weather-overview'

// Helper to guess country code from destination string
function guessCountryCode(destination: string): string {
  // Simple mapping for common cities/countries
  const map: Record<string, string> = {
    'united states': 'US', 'usa': 'US', 'new york': 'US', 'los angeles': 'US',
    'france': 'FR', 'paris': 'FR',
    'italy': 'IT', 'rome': 'IT',
    'spain': 'ES', 'madrid': 'ES',
    'germany': 'DE', 'berlin': 'DE',
    'japan': 'JP', 'tokyo': 'JP',
    'china': 'CN', 'beijing': 'CN',
    'india': 'IN', 'delhi': 'IN',
    'brazil': 'BR', 'rio': 'BR',
    'canada': 'CA', 'toronto': 'CA',
    'australia': 'AU', 'sydney': 'AU',
    'egypt': 'EG', 'cairo': 'EG',
    'south korea': 'KR', 'seoul': 'KR',
    'united kingdom': 'GB', 'london': 'GB',
    'thailand': 'TH', 'bangkok': 'TH',
    'mexico': 'MX', 'mexico city': 'MX',
    'uae': 'AE', 'dubai': 'AE', 'abu dhabi': 'AE',
    'singapore': 'SG',
    'netherlands': 'NL', 'amsterdam': 'NL',
    'greece': 'GR', 'athens': 'GR', 'santorini': 'GR',
    'turkey': 'TR', 'istanbul': 'TR',
    'switzerland': 'CH', 'zurich': 'CH', 'geneva': 'CH',
    'portugal': 'PT', 'lisbon': 'PT', 'porto': 'PT',
    'morocco': 'MA', 'marrakech': 'MA', 'casablanca': 'MA',
    'indonesia': 'ID', 'bali': 'ID',
    'malaysia': 'MY', 'kuala lumpur': 'MY',
    'argentina': 'AR', 'buenos aires': 'AR',
    'chile': 'CL', 'santiago': 'CL',
    'south africa': 'ZA', 'cape town': 'ZA',
    'new zealand': 'NZ', 'auckland': 'NZ',
    'sweden': 'SE', 'stockholm': 'SE',
    'norway': 'NO', 'oslo': 'NO', 'bergen': 'NO',
    'finland': 'FI', 'helsinki': 'FI',
    'denmark': 'DK', 'copenhagen': 'DK', 'aarhus': 'DK',
    'ireland': 'IE', 'dublin': 'IE',
    'belgium': 'BE', 'brussels': 'BE',
    'austria': 'AT', 'vienna': 'AT',
    'czech republic': 'CZ', 'prague': 'CZ',
    'hungary': 'HU', 'budapest': 'HU',
    'poland': 'PL', 'warsaw': 'PL',
    'russia': 'RU', 'moscow': 'RU',
    'israel': 'IL', 'tel aviv': 'IL',
    'saudi arabia': 'SA', 'riyadh': 'SA',
    'qatar': 'QA', 'doha': 'QA',
    'vietnam': 'VN', 'hanoi': 'VN',
    'philippines': 'PH', 'manila': 'PH',
    'pakistan': 'PK', 'karachi': 'PK',
    'colombia': 'CO', 'bogota': 'CO',
    'peru': 'PE', 'lima': 'PE',
    'kenya': 'KE', 'nairobi': 'KE',
    'nigeria': 'NG', 'lagos': 'NG',
    'croatia': 'HR', 'zagreb': 'HR',
    'slovenia': 'SI', 'ljubljana': 'SI',
    'romania': 'RO', 'bucharest': 'RO',
    'bulgaria': 'BG', 'sofia': 'BG',
    'serbia': 'RS', 'belgrade': 'RS',
    'ukraine': 'UA', 'kyiv': 'UA',
    'estonia': 'EE', 'tallinn': 'EE',
    'latvia': 'LV', 'riga': 'LV',
    'lithuania': 'LT', 'vilnius': 'LT',
    'iceland': 'IS', 'reykjavik': 'IS',
    'luxembourg': 'LU',
  }
  const parts = destination.toLowerCase().split(/,| /).map((s: string) => s.trim()).filter(Boolean);
  for (let i = 0; i < parts.length; i++) {
    if (map[parts[i]]) return map[parts[i]];
  }
  // Try last word as country
  const last = parts[parts.length - 1];
  if (map[last]) return map[last];
  return 'US';
}

// Helper to get a curated Unsplash image for popular destinations, else fallback to Unsplash search
function getCityImageUrl(destination: string) {
  const curated: Record<string, string> = {
    'egypt': 'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=1600&q=80', // Pyramids
    'cairo': 'https://images.unsplash.com/photo-1464983953574-0892a716854b?auto=format&fit=crop&w=1600&q=80',
    'paris': 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=1600&q=80', // Eiffel Tower
    'france': 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=1600&q=80',
    'new york': 'https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=1600&q=80',
    'usa': 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1600&q=80',
    'rome': 'https://images.unsplash.com/photo-1509395176047-4a66953fd231?auto=format&fit=crop&w=1600&q=80',
    'italy': 'https://images.unsplash.com/photo-1467269204594-9661b134dd2b?auto=format&fit=crop&w=1600&q=80',
    'tokyo': 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1600&q=80',
    'japan': 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1600&q=80',
    'london': 'https://images.unsplash.com/photo-1464037866556-6812c9d1c72e?auto=format&fit=crop&w=1600&q=80',
    'united kingdom': 'https://images.unsplash.com/photo-1464037866556-6812c9d1c72e?auto=format&fit=crop&w=1600&q=80',
    'dubai': 'https://images.unsplash.com/photo-1501594907352-04cda38ebc29?auto=format&fit=crop&w=1600&q=80',
    'uae': 'https://images.unsplash.com/photo-1501594907352-04cda38ebc29?auto=format&fit=crop&w=1600&q=80',
    'istanbul': 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1600&q=80',
    'turkey': 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1600&q=80',
    'rio': 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1600&q=80',
    'brazil': 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1600&q=80',
    // Add more as needed
  }
  const key = destination.toLowerCase().split(',')[0].trim()
  if (curated[key]) return curated[key]
  // Try Unsplash search for city
  const citySearch = `https://source.unsplash.com/1600x600/?${encodeURIComponent(key)},city,travel,landmark`;
  // Try Unsplash search for country (last word)
  const country = key.split(' ').pop() || key
  if (curated[country]) return curated[country]
  const countrySearch = `https://source.unsplash.com/1600x600/?${encodeURIComponent(country)},country,travel,landmark`;
  // Use city search first, then country search, then fallback
  return citySearch + ',' + countrySearch + ',travel';
}

export default function ItineraryPage() {
  const params = useParams()
  const router = useRouter()
  const tripId = params.id as string
  const { user, loading: authLoading } = useAuth()
  
  const [trip, setTrip] = useState<Trip | null>(null)
  const [itinerary, setItinerary] = useState<ItineraryDay[]>([])
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isIncomplete, setIsIncomplete] = useState(false)
  const [expectedDays, setExpectedDays] = useState(0)
  const [heroImage, setHeroImage] = useState<string>('')
  const [showUpgradeModal, setShowUpgradeModal] = useState(false)
  const [upgradeReason, setUpgradeReason] = useState('')
  const [currentPlan, setCurrentPlan] = useState<'free' | 'explorer' | 'adventurer'>('free')
  const [weather, setWeather] = useState<WeatherForecast | null>(null)
  const [weatherLoading, setWeatherLoading] = useState(false)
  const [showWeather, setShowWeather] = useState(false)

  // Redirect to login if not authenticated
  if (!authLoading && !user) {
    router.push('/login')
    return null
  }

  useEffect(() => {
    if (user) {
      loadTrip()
    }
  }, [tripId, user])

  useEffect(() => {
    async function fetchPlan() {
      if (user) {
        const sub = await subscriptionService.getUserSubscription(user.id)
        setCurrentPlan(sub?.plan || 'free')
      }
    }
    fetchPlan()
  }, [user])

  const loadTrip = async () => {
    if (!user) return
    
    try {
      const currentTrip = await tripService.getTrip(tripId, user.id)
      
      if (currentTrip) {
        setTrip(currentTrip)
        
        // Load existing itinerary if available
        if (currentTrip.itineraries && currentTrip.itineraries.length > 0) {
          const savedItinerary = currentTrip.itineraries
            .sort((a: any, b: any) => a.day - b.day)
            .map((item: any) => item.content)
          setItinerary(savedItinerary)
        } else {
          // Generate new itinerary if none exists
          generateTripItinerary(currentTrip)
        }
      } else {
        router.push('/dashboard')
      }
    } catch (error) {
      console.error('Error loading trip:', error)
      router.push('/dashboard')
    }
  }

  const fetchWeatherData = async () => {
    if (!trip) return
    
    setWeatherLoading(true)
    try {
      const weatherData = await getWeatherForecast(
        trip.destination,
        trip.start_date,
        trip.end_date
      )
      setWeather(weatherData)
    } catch (error) {
      console.error('Error fetching weather:', error)
    } finally {
      setWeatherLoading(false)
    }
  }

  useEffect(() => {
    async function getImage() {
      if (trip && trip.destination) {
        let img = await fetchUnsplashImage(trip.destination);
        console.log('Tried destination:', trip.destination, '->', img);
        if (!img || img.includes('photo-1506744038136')) {
          // Try last word (country)
          const parts = trip.destination.split(/,| /).map((s: string) => s.trim()).filter(Boolean);
          if (parts.length > 1) {
            img = await fetchUnsplashImage(parts[parts.length - 1]);
            console.log('Tried country:', parts[parts.length - 1], '->', img);
          }
        }
        if (!img || img.includes('photo-1506744038136')) {
          // Try generic travel
          img = await fetchUnsplashImage('travel');
          console.log('Tried generic travel ->', img);
        }
        console.log('Hero image URL set to:', img);
        setHeroImage(img);
      }
    }
    getImage();
  }, [trip]);

  const generateTripItinerary = async (tripData: Trip) => {
    if (!user) return
    
    setIsGenerating(true)
    setError(null)
    
    try {
      // Get trip preferences for the API
      const tripPreferences = await tripService.getTrip(tripId, user.id)
      if (!tripPreferences) throw new Error('Trip not found')
      
      const geminiTripData: TripData = {
        destination: tripData.destination,
        startDate: tripData.start_date,
        endDate: tripData.end_date,
        budget: tripData.budget,
        persona: tripData.persona,
        interests: {
          culture: tripPreferences.trip_preferences?.[0]?.interest_culture || false,
          food: tripPreferences.trip_preferences?.[0]?.interest_food || false,
          nature: tripPreferences.trip_preferences?.[0]?.interest_nature || false,
          shopping: tripPreferences.trip_preferences?.[0]?.interest_shopping || false,
          nightlife: tripPreferences.trip_preferences?.[0]?.interest_nightlife || false,
        }
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
      
      // Save itinerary to database
      await tripService.saveItinerary(tripId, generatedItinerary)
      
      // Record regeneration if this is a regeneration
      if (itinerary.length > 0) {
        await subscriptionService.recordRegeneration(user.id, tripId)
      }
      
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
  const countryCode = useMemo(() => trip ? guessCountryCode(trip.destination) : 'US', [trip])
  const cityImageUrl = useMemo(() => trip ? getCityImageUrl(trip.destination) : '', [trip])

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
    <div className="min-h-screen bg-gray-50">
      {/* HERO SECTION */}
      <section className="relative h-[420px] md:h-[520px] w-full flex flex-col justify-end">
        <img
          src={heroImage || 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1600&q=80'}
          alt={trip.destination}
          className="absolute inset-0 w-full h-full object-cover object-center z-0 transition-opacity duration-500"
          style={{ filter: 'brightness(0.7)' }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent z-10" />
        <div className="relative z-20 w-full max-w-4xl mx-auto px-4 pb-6 flex flex-col md:flex-row md:items-end md:justify-between">
          <div>
            <div className="flex items-center space-x-3 mb-2">
              <ReactCountryFlag
                countryCode={countryCode}
                svg
                style={{ width: '2.5em', height: '2.5em', borderRadius: '0.5em', boxShadow: '0 2px 8px #0004' }}
                title={countryCode}
                aria-label={countryCode}
              />
              <h1 className="text-4xl md:text-5xl font-bold text-white drop-shadow-lg">{trip.destination}</h1>
            </div>
            <div className="flex items-center space-x-4 mt-2 text-gray-200">
              <div className="flex items-center space-x-1">
                <Calendar className="w-4 h-4" />
                <span>{formatDate(trip.start_date)} - {formatDate(trip.end_date)}</span>
              </div>
              <div className="flex items-center space-x-1">
                <DollarSign className="w-4 h-4" />
                <span>${trip.budget}</span>
              </div>
            </div>
            <div className="mt-2 text-gray-300 text-sm">
              {trip.title && <span className="font-semibold">{trip.title}</span>}
              {trip.persona && <span className="ml-2">({trip.persona})</span>}
            </div>
          </div>
          <div className="flex flex-col md:flex-row gap-2 md:gap-4 mt-6 md:mt-0">
            <Button
              variant="outline"
              onClick={async () => {
                if (!user) return
                // Enforce regeneration limit
                const canRegenerate = await subscriptionService.canRegenerate(user.id)
                if (!canRegenerate.allowed) {
                  setUpgradeReason(canRegenerate.reason || 'You have reached your limit.')
                  setShowUpgradeModal(true)
                  return
                }
                generateTripItinerary(trip)
              }}
              disabled={isGenerating}
              className="flex items-center space-x-2 bg-white/80 hover:bg-white"
            >
              <RefreshCw className={`w-4 h-4 ${isGenerating ? 'animate-spin' : ''}`} />
              <span className="text-gray-900">Regenerate</span>
            </Button>
            <Button 
              variant="outline" 
              className="flex items-center space-x-2 bg-white/80 hover:bg-white"
              onClick={() => {
                if (!weather) {
                  fetchWeatherData()
                }
                setShowWeather(!showWeather)
              }}
              disabled={weatherLoading}
            >
              <Cloud className={`w-4 h-4 ${weatherLoading ? 'animate-spin' : ''}`} />
              <span className="text-gray-900">
                {weatherLoading ? 'Loading...' : showWeather ? 'Hide Weather' : 'Show Weather'}
              </span>
            </Button>
            <Button variant="outline" className="flex items-center space-x-2 bg-white/80 hover:bg-white">
              <Share2 className="w-4 h-4 text-gray-900" />
              <span className="text-gray-900">Share</span>
            </Button>
            <Button 
              variant="outline" 
              className="flex items-center space-x-2 bg-white/80 hover:bg-white"
              onClick={async () => {
                if (!user) return
                
                const canExport = await subscriptionManager.canPerformAction(user.id, 'export_itinerary')
                
                if (!canExport.allowed) {
                  alert(canExport.reason)
                  router.push('/pricing')
                  return
                }
                
                // TODO: Implement PDF export
                alert('PDF export coming soon!')
              }}
            >
              <Download className="w-4 h-4 text-gray-900" />
              <span className="text-gray-900">Export</span>
            </Button>
          </div>
        </div>
        {/* Summary cards INSIDE hero */}
        <div className="relative z-30 w-full max-w-3xl mx-auto px-4 pb-0 -mb-16">
          <Card className="shadow-xl">
            <CardContent className="pt-6 pb-2">
              <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-gray-200 gap-0 bg-white rounded-xl">
                <div className="text-center py-2 md:py-0">
                  <div className="text-2xl font-semibold text-gray-900">{itinerary.length}</div>
                  <div className="text-sm text-gray-500">Days</div>
                </div>
                <div className="text-center py-2 md:py-0">
                  <div className="text-2xl font-semibold text-gray-900">${totalCost}</div>
                  <div className="text-sm text-gray-500">Estimated Total</div>
                </div>
                <div className="text-center py-2 md:py-0">
                  <div className="text-2xl font-semibold text-gray-900">
                    {itinerary.reduce((sum, day) => sum + day.activities.length, 0)}
                  </div>
                  <div className="text-sm text-gray-500">Activities</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
      {/* END HERO SECTION */}
      <div className="container mx-auto px-4 max-w-4xl pt-24 pb-8">
        {/* Weather Overview */}
        {showWeather && (
          <div className="mb-6">
            {weatherLoading ? (
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                    <p className="text-sm text-gray-600">Loading weather forecast...</p>
                  </div>
                </CardContent>
              </Card>
            ) : weather ? (
              <WeatherOverview weather={weather} />
            ) : null}
          </div>
        )}

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
            {itinerary.map((day, index) => {
              // Find weather data for this day
              const dayWeather = weather?.forecast.find(w => w.date === day.date)
              
              return (
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
                    {/* Weather Card for this day */}
                    {showWeather && dayWeather && (
                      <div className="mb-6">
                        <WeatherCard weather={dayWeather} showAdvice={true} />
                      </div>
                    )}
                    
                    <div className="space-y-4">
                      {day.activities.map((activity, activityIndex) => (
                        <div key={activityIndex} className="flex items-start space-x-4 p-4 bg-white rounded-lg border border-gray-200">
                          <div className="flex-shrink-0">
                            <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                              <span className="text-lg">{getCategoryIcon(activity.category)}</span>
                            </div>
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="font-medium text-gray-900">{activity.title}</h4>
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
                                  className="inline-flex items-center space-x-1 text-gray-700 hover:text-gray-900 text-sm font-medium border-b border-gray-300 hover:border-gray-500 transition-colors"
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
              )
            })}
          </div>
        )}
      </div>
      <UpgradeModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        currentPlan={currentPlan}
        reason={upgradeReason}
      />
    </div>
  )
} 