'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Cloud, Thermometer, Droplets, Wind, Sun } from 'lucide-react'
import type { WeatherData } from '@/lib/weather'
import { getWeatherIcon, getWeatherAdvice } from '@/lib/weather'

interface WeatherCardProps {
  weather: WeatherData
  showAdvice?: boolean
}

export function WeatherCard({ weather, showAdvice = true }: WeatherCardProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    })
  }

  const getTemperatureColor = (temp: number) => {
    if (temp >= 30) return 'text-red-600'
    if (temp >= 25) return 'text-orange-600'
    if (temp >= 20) return 'text-yellow-600'
    if (temp >= 15) return 'text-blue-600'
    if (temp >= 10) return 'text-indigo-600'
    return 'text-purple-600'
  }

  const getConditionColor = (condition: string) => {
    switch (condition.toLowerCase()) {
      case 'clear':
        return 'bg-yellow-100 text-yellow-800'
      case 'clouds':
        return 'bg-gray-100 text-gray-800'
      case 'rain':
        return 'bg-blue-100 text-blue-800'
      case 'snow':
        return 'bg-cyan-100 text-cyan-800'
      case 'thunderstorm':
        return 'bg-purple-100 text-purple-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center justify-between">
          <span>{formatDate(weather.date)}</span>
          <span className="text-2xl">{getWeatherIcon(weather.icon)}</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Temperature */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Thermometer className="w-4 h-4 text-gray-500" />
            <span className="text-sm text-gray-600">Temperature</span>
          </div>
          <div className="text-right">
            <span className={`text-lg font-semibold ${getTemperatureColor(weather.temperature.max)}`}>
              {Math.round(weather.temperature.max)}°C
            </span>
            <span className="text-sm text-gray-500 ml-1">
              / {Math.round(weather.temperature.min)}°C
            </span>
          </div>
        </div>

        {/* Condition */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Cloud className="w-4 h-4 text-gray-500" />
            <span className="text-sm text-gray-600">Condition</span>
          </div>
          <Badge variant="secondary" className={getConditionColor(weather.condition)}>
            {weather.condition}
          </Badge>
        </div>

        {/* Weather Details Grid */}
        <div className="grid grid-cols-2 gap-3 pt-2">
          {/* Humidity */}
          <div className="flex items-center space-x-2">
            <Droplets className="w-4 h-4 text-blue-500" />
            <div>
              <p className="text-xs text-gray-500">Humidity</p>
              <p className="text-sm font-medium">{weather.humidity}%</p>
            </div>
          </div>

          {/* Wind Speed */}
          <div className="flex items-center space-x-2">
            <Wind className="w-4 h-4 text-gray-500" />
            <div>
              <p className="text-xs text-gray-500">Wind</p>
              <p className="text-sm font-medium">{weather.windSpeed} m/s</p>
            </div>
          </div>

          {/* Precipitation */}
          <div className="flex items-center space-x-2">
            <Droplets className="w-4 h-4 text-blue-600" />
            <div>
              <p className="text-xs text-gray-500">Rain Chance</p>
              <p className="text-sm font-medium">{Math.round(weather.precipitation)}%</p>
            </div>
          </div>

          {/* UV Index */}
          <div className="flex items-center space-x-2">
            <Sun className="w-4 h-4 text-yellow-500" />
            <div>
              <p className="text-xs text-gray-500">UV Index</p>
              <p className="text-sm font-medium">{weather.uvIndex}</p>
            </div>
          </div>
        </div>

        {/* Weather Advice */}
        {showAdvice && (
          <div className="pt-3 border-t border-gray-100">
            <p className="text-xs text-gray-600 bg-blue-50 p-2 rounded-md">
              💡 {getWeatherAdvice(weather.condition, weather.temperature.max)}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
} 