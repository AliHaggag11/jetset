import { notFound } from 'next/navigation';
import { tripService } from '@/lib/tripService';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, DollarSign, Calendar, Users, Clock, ChevronDown, ChevronRight } from 'lucide-react';
import ReactCountryFlag from 'react-country-flag';
import { WeatherOverview } from '@/components/weather-overview';
import { WeatherCard } from '@/components/weather-card';
import { TransportBooking } from '@/components/transport-booking';
import { Suspense } from 'react';

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  });
}

function getCategoryIcon(category: string) {
  switch (category) {
    case 'food': return '🍽️';
    case 'sightseeing': return '🏛️';
    case 'nature': return '🌿';
    case 'shopping': return '🛍️';
    case 'nightlife': return '🌙';
    case 'transportation': return '🚗';
    case 'accommodation': return '🏨';
    case 'culture': return '🎭';
    case 'adventure': return '🏔️';
    default: return '📍';
  }
}

async function getTrip(share_id: string) {
  // @ts-ignore
  return await tripService.getTripByShareId(share_id);
}

export default async function PublicItineraryPage({ params }: { params: { share_id: string } }) {
  const trip = await getTrip(params.share_id);
  if (!trip) return notFound();
  const itinerary = trip.itineraries?.sort((a: any, b: any) => a.day - b.day).map((item: any) => item.content) || [];
  const totalCost = itinerary.reduce((sum: any, day: any) => sum + day.estimatedCost, 0);
  const countryCode = trip.destination ? 'US' : 'US'; // You can use your guessCountryCode logic here

  return (
    <div className="min-h-screen bg-gray-50">
      <section className="relative h-[320px] w-full flex flex-col justify-end">
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent z-10" />
        <div className="relative z-20 w-full max-w-4xl mx-auto px-4 pb-6 flex flex-col md:flex-row md:items-end md:justify-between">
          <div>
            <div className="flex items-center space-x-3 mb-2">
              <ReactCountryFlag countryCode={countryCode} svg style={{ width: '2.5em', height: '2.5em', borderRadius: '0.5em', boxShadow: '0 2px 8px #0004' }} title={countryCode} aria-label={countryCode} />
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
        </div>
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
                  <div className="text-2xl font-semibold text-gray-900">{itinerary.reduce((sum: any, day: any) => sum + day.activities.length, 0)}</div>
                  <div className="text-sm text-gray-500">Activities</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
      <div className="container mx-auto px-4 max-w-4xl pt-24 pb-8">
        <div className="space-y-6">
          {itinerary.map((day: any, index: number) => (
            <Card key={index}>
              <CardHeader className="flex flex-row items-center justify-between">
                <div className="flex items-center gap-2">
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                  <CardTitle className="text-xl">Day {day.day} - {formatDate(day.date)}</CardTitle>
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
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {day.activities.map((activity: any, activityIndex: number) => (
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
                            <a href={activity.link} target="_blank" rel="noopener noreferrer" className="inline-flex items-center space-x-1 text-gray-700 hover:text-gray-900 text-sm font-medium border-b border-gray-300 hover:border-gray-500 transition-colors">
                              <span>Book Now</span>
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
      </div>
    </div>
  );
} 