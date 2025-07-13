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
    <Card className="shadow-lg rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
      <CardHeader className="pb-2 border-b border-gray-100 dark:border-gray-800">
        <CardTitle className="flex items-center space-x-2 text-gray-900 dark:text-gray-100 text-lg font-semibold">
          <Cloud className="w-5 h-5 text-blue-400 dark:text-blue-300" />
          <span>Weather Overview</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6 pt-4">
        {/* Location and Date Range */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between text-sm text-gray-500 dark:text-gray-400 gap-1">
          <span className="font-medium text-gray-700 dark:text-gray-200">{weather.location}</span>
          <div className="flex items-center space-x-1">
            <Calendar className="w-4 h-4" />
            <span>
              {formatDate(weather.forecast[0].date)} - {formatDate(weather.forecast[weather.forecast.length - 1].date)}
            </span>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 border-y border-gray-100 dark:border-gray-800 py-4">
          <div className="text-center">
            <div className={`text-2xl font-bold text-gray-900 dark:text-gray-100`}>{avgTemp}°C</div>
            <div className="text-xs text-gray-500 dark:text-gray-400">Avg High</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-700 dark:text-gray-200">{avgHumidity}%</div>
            <div className="text-xs text-gray-500 dark:text-gray-400">Avg Humidity</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-700 dark:text-gray-200">{avgWindSpeed} m/s</div>
            <div className="text-xs text-gray-500 dark:text-gray-400">Avg Wind</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-700 dark:text-gray-200">{rainyDays}</div>
            <div className="text-xs text-gray-500 dark:text-gray-400">Rainy Days</div>
          </div>
        </div>

        {/* Most Common Condition */}
        <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-100 dark:border-gray-800">
          <div className="flex items-center space-x-2">
            <span className="text-2xl">{getWeatherIcon(weather.forecast.find(d => d.condition === mostCommonCondition)?.icon || '01d')}</span>
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Most Common</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">{mostCommonCondition}</p>
            </div>
          </div>
          <Badge variant="secondary" className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 border-none">
            {Math.round((conditionCounts[mostCommonCondition] / weather.forecast.length) * 100)}% of days
          </Badge>
        </div>

        {/* Daily Preview */}
        <div>
          <h4 className="text-sm font-medium mb-2 text-gray-900 dark:text-gray-100">Daily Forecast</h4>
          <div className="flex md:grid md:grid-cols-5 gap-2 overflow-x-auto scrollbar-thin scrollbar-thumb-gray-200 dark:scrollbar-thumb-gray-700 pb-1">
            {weather.forecast.slice(0, 5).map((day, index) => (
              <div key={index} className="min-w-[90px] md:min-w-0 text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-100 dark:border-gray-800 flex-shrink-0">
                <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                  {formatDate(day.date)}
                </div>
                <div className="text-lg mb-1">
                  {getWeatherIcon(day.icon)}
                </div>
                <div className="text-base font-semibold text-gray-900 dark:text-gray-100">
                  {Math.round(day.temperature.max)}°
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
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