'use client'

import { useEffect, useState, useMemo } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Clock, MapPin, DollarSign, Calendar, RefreshCw, Share2, Download, ExternalLink, Users, Cloud, ChevronDown, ChevronRight, Sun, CloudRain, Cloud as CloudIcon, Snowflake } from 'lucide-react'
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
import { TransportBooking } from '@/components/transport-booking'
// @ts-ignore
import jsPDF from 'jspdf'
// @ts-ignore
import html2canvas from 'html2canvas'
import { renderToString } from 'react-dom/server'
import ShareModal from '@/components/share-modal';

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
  const [exporting, setExporting] = useState(false)
  const [exportHeroImageUrl, setExportHeroImageUrl] = useState<string | null>(null)
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareUrl, setShareUrl] = useState('');

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

  // Automatically fetch weather when trip is loaded
  useEffect(() => {
    if (trip && !weather && !weatherLoading) {
      fetchWeatherData()
    }
  }, [trip])

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
  const countryCode = useMemo(() => {
    if (trip?.destination) return guessCountryCode(trip.destination) || 'US';
    return 'US';
  }, [trip?.destination]);
  const cityImageUrl = useMemo(() => trip?.destination ? getCityImageUrl(trip.destination) : '', [trip?.destination])

  // Collapsible state for days
  const [expandedDays, setExpandedDays] = useState(() => itinerary.length > 0 ? [0] : [])
  useEffect(() => {
    // Reset expanded state when itinerary changes
    setExpandedDays(itinerary.length > 0 ? [0] : [])
  }, [itinerary])
  const toggleDay = (idx: number) => {
    setExpandedDays(expanded =>
      expanded.includes(idx)
        ? expanded.filter(i => i !== idx)
        : [...expanded, idx]
    )
  }
  // Helper for weather icon
  const getWeatherIcon = (desc: string) => {
    if (!desc) return <Sun className="w-4 h-4 text-yellow-400 inline-block" />
    const d = desc.toLowerCase()
    if (d.includes('rain')) return <CloudRain className="w-4 h-4 text-blue-400 inline-block" />
    if (d.includes('cloud')) return <CloudIcon className="w-4 h-4 text-gray-400 inline-block" />
    if (d.includes('snow')) return <Snowflake className="w-4 h-4 text-blue-200 inline-block" />
    if (d.includes('sun')) return <Sun className="w-4 h-4 text-yellow-400 inline-block" />
    return <Sun className="w-4 h-4 text-yellow-400 inline-block" />
  }

  // Helper to fetch image as data URL, with fallback
  const fetchImageAsDataURL = async (url: string): Promise<string> => {
    try {
      const response = await fetch(url)
      const blob = await response.blob()
      return await new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.onloadend = () => resolve(reader.result as string)
        reader.onerror = reject
        reader.readAsDataURL(blob)
      })
    } catch (e) {
      // Fallback to local image if fetch fails
      const fallbackUrl = '/hero-fallback.jpg' // Place this image in your public folder
      const response = await fetch(fallbackUrl)
      const blob = await response.blob()
      return await new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.onloadend = () => resolve(reader.result as string)
        reader.onerror = reject
        reader.readAsDataURL(blob)
      })
    }
  }

  // Print-friendly export (opens new window with styled HTML and triggers print)
  const handlePrintExport = () => {
    let weatherOverviewHtml = ''
    if (weather) {
      weatherOverviewHtml = `
        <h2 style="margin:32px 0 8px 0;font-size:1.2em;font-weight:bold;">Weather Overview</h2>
        <table style="width:100%;border-collapse:collapse;margin-bottom:32px;font-size:1em;">
          <thead>
            <tr style="background:#f3f4f6;">
              <th style="padding:8px;border:1px solid #e5e7eb;">Date</th>
              <th style="padding:8px;border:1px solid #e5e7eb;">Day</th>
              <th style="padding:8px;border:1px solid #e5e7eb;">Max</th>
              <th style="padding:8px;border:1px solid #e5e7eb;">Min</th>
              <th style="padding:8px;border:1px solid #e5e7eb;">Condition</th>
            </tr>
          </thead>
          <tbody>
            ${weather.forecast.map(day => `
              <tr>
                <td style="padding:8px;border:1px solid #e5e7eb;">${day.date}</td>
                <td style="padding:8px;border:1px solid #e5e7eb;">${new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' })}</td>
                <td style="padding:8px;border:1px solid #e5e7eb;">${Math.round(day.temperature.max)}°C</td>
                <td style="padding:8px;border:1px solid #e5e7eb;">${Math.round(day.temperature.min)}°C</td>
                <td style="padding:8px;border:1px solid #e5e7eb;">${day.condition}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      `
    }
    const html = `
      <html>
        <head>
          <title>Itinerary Export - ${trip?.destination}</title>
          <style>
            body { font-family: sans-serif; margin: 0; padding: 0; background: #f9f9f9; }
            .hero { position: relative; height: 320px; }
            .hero img { width: 100%; height: 100%; object-fit: cover; filter: brightness(0.7); }
            .hero-content { position: absolute; bottom: 24px; left: 32px; color: #fff; }
            .stats { display: flex; gap: 32px; margin: 24px 0; }
            .stat { font-size: 1.2em; }
            .itinerary-day { margin-bottom: 24px; background: #fff; border-radius: 8px; padding: 16px; }
            .activity { margin-bottom: 8px; }
          </style>
        </head>
        <body>
          <div class="hero">
            <img src="${heroImage || ''}" alt="${trip?.destination?.split(',')[0]?.trim() || ''}" />
            <div class="hero-content">
              <h1 style="font-size:2.5em; font-weight:bold;">${trip?.destination?.split(',')[0]?.trim() || ''}</h1>
              <div>${formatDate(trip?.start_date || '')} - ${formatDate(trip?.end_date || '')}</div>
              <div>${trip?.title ? `<span>${trip.title}</span>` : ''} ${trip?.persona ? `<span>(${trip.persona})</span>` : ''}</div>
            </div>
          </div>
          ${weatherOverviewHtml}
          <div class="stats">
            <div class="stat"><b>${itinerary.length}</b> Days</div>
            <div class="stat"><b>$${totalCost}</b> Estimated Total</div>
            <div class="stat"><b>${itinerary.reduce((sum, day) => sum + day.activities.length, 0)}</b> Activities</div>
          </div>
          <div>
            ${itinerary.map(day => `
              <div class="itinerary-day">
                <h2>Day ${day.day} - ${formatDate(day.date)}</h2>
                <div>${(day as any).city ? `<b>City:</b> ${(day as any).city}` : ''}</div>
                <ul>
                  ${day.activities.map(activity => `
                    <li class="activity">
                      <b>${activity.time}</b> - <b>${activity.title}</b> (${activity.location})<br/>
                      ${activity.description}<br/>
                      <span>Cost: $${activity.cost}</span>
                    </li>
                  `).join('')}
                </ul>
              </div>
            `).join('')}
          </div>
          <script>
            window.onload = function() { window.print(); }
          </script>
        </body>
      </html>
    `;
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(html);
      printWindow.document.close();
    }
  };

  // Show share modal and set share URL
  const handleShare = async () => {
    if (!trip) return;
    let shareId = trip.share_id;
    // If no share_id, generate and save one
    if (!shareId) {
      // Generate a new share_id and save to DB
      shareId = crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2);
      await fetch(`/api/trip/${trip.id}/set-share-id`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ share_id: shareId }),
      });
      trip.share_id = shareId;
    }
    const url = `${window.location.origin}/app/itinerary/share/${shareId}`;
    setShareUrl(url);
    setShowShareModal(true);
  };

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
                countryCode={String(countryCode)}
                svg
                style={{ width: '2.5em', height: '2.5em', borderRadius: '0.5em', boxShadow: '0 2px 8px #0004' }}
                title={String(countryCode)}
                aria-label={String(countryCode)}
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
            <Button variant="outline" className="flex items-center space-x-2 bg-white/80 hover:bg-white"
              onClick={handleShare}
            >
              <Share2 className="w-4 h-4 text-gray-900" />
              <span className="text-gray-900">Share</span>
            </Button>
            <Button 
              variant="outline" 
              className="flex items-center space-x-2 bg-white/80 hover:bg-white"
              onClick={handlePrintExport}
              disabled={exporting}
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
              // Weather indicator for collapsed state
              const showWeatherIndicator = !showWeather && dayWeather
              
              // Helper to infer city from day or first activity
              const inferCity = (d: ItineraryDay) => {
                if ((d as any).city) return (d as any).city;
                if (d.activities && d.activities.length > 0) {
                  const loc = d.activities[0].location;
                  if (loc && loc.includes(',')) {
                    const parts = loc.split(',');
                    const lastPart = parts[parts.length - 1];
                    return lastPart.trim();
                  }
                  return loc || trip?.destination?.split(',')[0]?.trim() || 'Unknown City';
                }
                return trip?.destination?.split(',')[0]?.trim() || 'Unknown City';
              };
              const currentCity = inferCity(day);
              const previousCity = index > 0 ? inferCity(itinerary[index - 1]) : null;
              const hasCityChange = previousCity && currentCity && previousCity !== currentCity;
              
              return (
                <div key={index}>
                  {/* Transport Booking Component - show between city changes */}
                  {hasCityChange && (
                    <div className="mb-6">
                      <TransportBooking
                        fromCity={previousCity}
                        toCity={currentCity}
                        date={day.date}
                        onBook={(option) => {
                          console.log('Transport booked:', option)
                        }}
                      />
                    </div>
                  )}
                  
                  <Card>
                    <CardHeader
                      className="cursor-pointer select-none flex flex-row items-center justify-between"
                      onClick={() => toggleDay(index)}
                    >
                      <div className="flex items-center gap-2">
                        {expandedDays.includes(index) ? (
                          <ChevronDown className="w-4 h-4 text-gray-400" />
                        ) : (
                          <ChevronRight className="w-4 h-4 text-gray-400" />
                        )}
                        <CardTitle className="text-xl">
                          Day {day.day} - {formatDate(day.date)}
                        </CardTitle>
                        {currentCity && (
                          <p className="text-sm text-gray-600 mt-1 flex items-center">
                            <MapPin className="w-3 h-3 mr-1" />
                            {currentCity}
                          </p>
                        )}
                        {showWeatherIndicator && dayWeather && typeof dayWeather.temperature?.max === 'number' && (
                          <span className="ml-2 flex items-center text-xs text-gray-500">
                            {getWeatherIcon(dayWeather.condition ? String(dayWeather.condition) : '')}
                            <span className="ml-1">{Math.round(dayWeather.temperature?.max ?? 0)}°C</span>
                          </span>
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
                    </CardHeader>
                    {expandedDays.includes(index) && (
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
                    )}
                  </Card>
                </div>
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
      <ShareModal isOpen={showShareModal} onClose={() => setShowShareModal(false)} shareUrl={shareUrl} />
    </div>
  )
} 