'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Cloud, Thermometer, Droplets, Wind, Sun, Calendar } from 'lucide-react'
import type { WeatherForecast } from '@/lib/weather'
import { getWeatherIcon } from '@/lib/weather'

interface WeatherOverviewProps {
  weather: WeatherForecast
}

export function WeatherOverview({ weather }: WeatherOverviewProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    })
  }

  // Calculate averages
  const avgTemp = Math.round(
    weather.forecast.reduce((sum, day) => sum + day.temperature.max, 0) / weather.forecast.length
  )
  
  const avgHumidity = Math.round(
    weather.forecast.reduce((sum, day) => sum + day.humidity, 0) / weather.forecast.length
  )
  
  const avgWindSpeed = Math.round(
    weather.forecast.reduce((sum, day) => sum + day.windSpeed, 0) / weather.forecast.length
  )

  // Get most common condition
  const conditionCounts = weather.forecast.reduce((acc, day) => {
    acc[day.condition] = (acc[day.condition] || 0) + 1
    return acc
  }, {} as Record<string, number>)
  
  const mostCommonCondition = Object.entries(conditionCounts).reduce((a, b) => 
    conditionCounts[a[0]] > conditionCounts[b[0]] ? a : b
  )[0]

  // Count rainy days
  const rainyDays = weather.forecast.filter(day => 
    day.condition.toLowerCase().includes('rain') || 
    day.condition.toLowerCase().includes('thunderstorm')
  ).length

  const getTemperatureColor = (temp: number) => {
    if (temp >= 30) return 'text-red-600'
    if (temp >= 25) return 'text-orange-600'
    if (temp >= 20) return 'text-yellow-600'
    if (temp >= 15) return 'text-blue-600'
    if (temp >= 10) return 'text-indigo-600'
    return 'text-purple-600'
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Cloud className="w-5 h-5" />
          <span>Weather Overview</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Location and Date Range */}
        <div className="flex items-center justify-between text-sm text-gray-600">
          <span className="font-medium">{weather.location}</span>
          <div className="flex items-center space-x-1">
            <Calendar className="w-4 h-4" />
            <span>
              {formatDate(weather.forecast[0].date)} - {formatDate(weather.forecast[weather.forecast.length - 1].date)}
            </span>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className={`text-2xl font-bold ${getTemperatureColor(avgTemp)}`}>
              {avgTemp}°C
            </div>
            <div className="text-xs text-gray-500">Avg High</div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {avgHumidity}%
            </div>
            <div className="text-xs text-gray-500">Avg Humidity</div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-600">
              {avgWindSpeed} m/s
            </div>
            <div className="text-xs text-gray-500">Avg Wind</div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-500">
              {rainyDays}
            </div>
            <div className="text-xs text-gray-500">Rainy Days</div>
          </div>
        </div>

        {/* Most Common Condition */}
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center space-x-2">
            <span className="text-2xl">{getWeatherIcon(weather.forecast.find(d => d.condition === mostCommonCondition)?.icon || '01d')}</span>
            <div>
              <p className="text-sm font-medium">Most Common</p>
              <p className="text-xs text-gray-500">{mostCommonCondition}</p>
            </div>
          </div>
          <Badge variant="secondary">
            {Math.round((conditionCounts[mostCommonCondition] / weather.forecast.length) * 100)}% of days
          </Badge>
        </div>

        {/* Daily Preview */}
        <div>
          <h4 className="text-sm font-medium mb-2">Daily Forecast</h4>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
            {weather.forecast.slice(0, 5).map((day, index) => (
              <div key={index} className="text-center p-2 bg-gray-50 rounded-lg">
                <div className="text-xs text-gray-500 mb-1">
                  {formatDate(day.date)}
                </div>
                <div className="text-lg mb-1">
                  {getWeatherIcon(day.icon)}
                </div>
                <div className={`text-sm font-medium ${getTemperatureColor(day.temperature.max)}`}>
                  {Math.round(day.temperature.max)}°
                </div>
                <div className="text-xs text-gray-500">
                  {Math.round(day.temperature.min)}°
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
} 