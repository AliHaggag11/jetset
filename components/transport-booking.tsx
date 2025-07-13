'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Plane, 
  Train, 
  Bus, 
  Car, 
  Ship, 
  Clock, 
  DollarSign, 
  MapPin, 
  ExternalLink,
  ChevronDown,
  ChevronRight
} from 'lucide-react'

interface TransportOption {
  type: 'plane' | 'train' | 'bus' | 'car' | 'ship'
  name: string
  duration: string
  price: number
  bookingUrl: string
  departureTime: string
  arrivalTime: string
  description: string
}

interface TransportBookingProps {
  fromCity: string
  toCity: string
  date: string
  onBook?: (option: TransportOption) => void
}

const getTransportIcon = (type: string) => {
  switch (type) {
    case 'plane': return <Plane className="w-4 h-4" />
    case 'train': return <Train className="w-4 h-4" />
    case 'bus': return <Bus className="w-4 h-4" />
    case 'car': return <Car className="w-4 h-4" />
    case 'ship': return <Ship className="w-4 h-4" />
    default: return <Car className="w-4 h-4" />
  }
}

const getTransportColor = (type: string) => {
  switch (type) {
    case 'plane': return 'bg-blue-100 text-blue-800'
    case 'train': return 'bg-green-100 text-green-800'
    case 'bus': return 'bg-orange-100 text-orange-800'
    case 'car': return 'bg-purple-100 text-purple-800'
    case 'ship': return 'bg-cyan-100 text-cyan-800'
    default: return 'bg-gray-100 text-gray-800'
  }
}

export function TransportBooking({ fromCity, toCity, date, onBook }: TransportBookingProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [selectedOption, setSelectedOption] = useState<TransportOption | null>(null)

  // Mock transport options - in a real app, this would come from an API
  const transportOptions: TransportOption[] = [
    {
      type: 'plane',
      name: 'Direct Flight',
      duration: '2h 15m',
      price: 180,
      bookingUrl: `https://www.skyscanner.com/transport/flights/${fromCity.toLowerCase()}/${toCity.toLowerCase()}/${date}`,
      departureTime: '09:00',
      arrivalTime: '11:15',
      description: 'Direct flight with major airline'
    },
    {
      type: 'train',
      name: 'High-Speed Train',
      duration: '3h 45m',
      price: 85,
      bookingUrl: `https://www.raileurope.com/en-us/trains/${fromCity.toLowerCase()}-${toCity.toLowerCase()}/${date}`,
      departureTime: '08:30',
      arrivalTime: '12:15',
      description: 'Comfortable high-speed rail service'
    },
    {
      type: 'bus',
      name: 'Express Bus',
      duration: '5h 30m',
      price: 35,
      bookingUrl: `https://www.flixbus.com/route/${fromCity.toLowerCase()}-${toCity.toLowerCase()}/${date}`,
      departureTime: '07:00',
      arrivalTime: '12:30',
      description: 'Economical bus service with WiFi'
    },
    {
      type: 'car',
      name: 'Rental Car',
      duration: '4h 20m',
      price: 65,
      bookingUrl: `https://www.rentalcars.com/car-rental/${fromCity.toLowerCase()}-${toCity.toLowerCase()}/${date}`,
      departureTime: 'Flexible',
      arrivalTime: 'Flexible',
      description: 'Flexible car rental with GPS'
    }
  ]

  const handleBook = (option: TransportOption) => {
    setSelectedOption(option)
    if (onBook) {
      onBook(option)
    }
    // Open booking URL in new tab
    window.open(option.bookingUrl, '_blank', 'noopener,noreferrer')
  }

  return (
    <Card className="border-2 border-dashed border-blue-300 bg-blue-50/50">
      <CardHeader 
        className="cursor-pointer pb-3"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              <MapPin className="w-4 h-4 text-blue-600" />
              <span className="font-medium text-blue-900">{fromCity}</span>
            </div>
            <div className="flex items-center space-x-1 text-blue-600">
              <span>→</span>
            </div>
            <div className="flex items-center space-x-2">
              <MapPin className="w-4 h-4 text-blue-600" />
              <span className="font-medium text-blue-900">{toCity}</span>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-300">
              <Clock className="w-3 h-3 mr-1" />
              {date}
            </Badge>
            {isExpanded ? (
              <ChevronDown className="w-4 h-4 text-blue-600" />
            ) : (
              <ChevronRight className="w-4 h-4 text-blue-600" />
            )}
          </div>
        </div>
        <CardTitle className="text-lg text-blue-900 flex items-center space-x-2">
          <span>🚌</span>
          <span>Transport Options</span>
        </CardTitle>
      </CardHeader>
      
      {isExpanded && (
        <CardContent className="pt-0">
          <div className="space-y-3">
            {transportOptions.map((option, index) => (
              <div 
                key={index} 
                className="flex items-center justify-between p-3 bg-white rounded-lg border border-blue-200 hover:border-blue-300 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-full ${getTransportColor(option.type)}`}>
                    {getTransportIcon(option.type)}
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">{option.name}</h4>
                    <p className="text-sm text-gray-600">{option.description}</p>
                    <div className="flex items-center space-x-4 mt-1 text-xs text-gray-500">
                      <span className="flex items-center">
                        <Clock className="w-3 h-3 mr-1" />
                        {option.duration}
                      </span>
                      <span className="flex items-center">
                        <span className="mr-1">🕐</span>
                        {option.departureTime} - {option.arrivalTime}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="text-right">
                    <div className="font-semibold text-gray-900">${option.price}</div>
                    <div className="text-xs text-gray-500">per person</div>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => handleBook(option)}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    <ExternalLink className="w-3 h-3 mr-1" />
                    Book
                  </Button>
                </div>
              </div>
            ))}
          </div>
          
          {selectedOption && (
            <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center space-x-2 text-green-800">
                <span>✅</span>
                <span className="font-medium">Booking initiated for {selectedOption.name}</span>
              </div>
              <p className="text-sm text-green-700 mt-1">
                Redirecting to {selectedOption.name.toLowerCase()} booking site...
              </p>
            </div>
          )}
        </CardContent>
      )}
    </Card>
  )
} 