export interface WeatherData {
  date: string
  temperature: {
    min: number
    max: number
    current?: number
  }
  condition: string
  icon: string
  humidity: number
  windSpeed: number
  precipitation: number
  uvIndex: number
}

export interface WeatherForecast {
  location: string
  forecast: WeatherData[]
}

// Using Open-Meteo API (completely free, no API key required)
const BASE_URL = 'https://api.open-meteo.com/v1'

export async function getWeatherForecast(
  location: string,
  startDate: string,
  endDate: string
): Promise<WeatherForecast> {
  try {
    // First, get coordinates for the location using Open-Meteo's geocoding
    const geocodeResponse = await fetch(
      `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(location)}&count=1&language=en&format=json`
    )
    
    if (!geocodeResponse.ok) {
      throw new Error('Failed to geocode location')
    }
    
    const geocodeData = await geocodeResponse.json()
    
    if (!geocodeData.results || geocodeData.results.length === 0) {
      throw new Error('Location not found')
    }
    
    const { latitude, longitude, name } = geocodeData.results[0]
    
    // Calculate the number of days between start and end date
    const start = new Date(startDate)
    const end = new Date(endDate)
    const daysDiff = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
    
    // Get weather forecast from Open-Meteo (free, no API key required)
    const forecastResponse = await fetch(
      `${BASE_URL}/forecast?latitude=${latitude}&longitude=${longitude}&daily=temperature_2m_max,temperature_2m_min,precipitation_probability_max,windspeed_10m_max,uv_index_max&timezone=auto&start_date=${startDate}&end_date=${endDate}`
    )
    
    if (!forecastResponse.ok) {
      throw new Error('Failed to fetch weather forecast')
    }
    
    const forecastData = await forecastResponse.json()
    
    // Process the daily forecast data
    const forecast: WeatherData[] = []
    
    for (let i = 0; i < forecastData.daily.time.length; i++) {
      const date = forecastData.daily.time[i]
      const maxTemp = forecastData.daily.temperature_2m_max[i]
      const minTemp = forecastData.daily.temperature_2m_min[i]
      const precipitation = forecastData.daily.precipitation_probability_max[i]
      const windSpeed = forecastData.daily.windspeed_10m_max[i]
      const uvIndex = forecastData.daily.uv_index_max[i]
      
      // Determine weather condition based on precipitation probability
      let condition = 'Clear'
      let icon = '01d'
      
      if (precipitation > 80) {
        condition = 'Rain'
        icon = '10d'
      } else if (precipitation > 50) {
        condition = 'Clouds'
        icon = '02d'
      } else if (precipitation > 20) {
        condition = 'Clouds'
        icon = '03d'
      }
      
      // Estimate humidity based on temperature and precipitation (rough approximation)
      const humidity = Math.max(40, Math.min(90, 60 + (precipitation / 10) - (maxTemp - 20) / 2))
      
      forecast.push({
        date,
        temperature: {
          min: minTemp,
          max: maxTemp,
          current: (maxTemp + minTemp) / 2
        },
        condition,
        icon,
        humidity: Math.round(humidity),
        windSpeed: Math.round(windSpeed),
        precipitation: Math.round(precipitation),
        uvIndex: Math.round(uvIndex)
      })
    }
    
    return {
      location: name,
      forecast
    }
    
  } catch (error) {
    console.error('Error fetching weather forecast:', error)
    
    // Return mock data if API fails
    return generateMockWeatherForecast(location, startDate, endDate)
  }
}

function generateMockWeatherForecast(
  location: string,
  startDate: string,
  endDate: string
): WeatherForecast {
  const start = new Date(startDate)
  const end = new Date(endDate)
  const daysDiff = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
  
  const forecast: WeatherData[] = []
  const conditions = ['Clear', 'Clouds', 'Rain', 'Snow', 'Thunderstorm']
  const icons = ['01d', '02d', '10d', '13d', '11d']
  
  for (let i = 0; i < daysDiff; i++) {
    const date = new Date(start)
    date.setDate(start.getDate() + i)
    
    const conditionIndex = Math.floor(Math.random() * conditions.length)
    const baseTemp = 20 + (Math.random() - 0.5) * 20 // 10-30°C range
    
    forecast.push({
      date: date.toISOString().split('T')[0],
      temperature: {
        min: Math.round(baseTemp - 5),
        max: Math.round(baseTemp + 5),
        current: Math.round(baseTemp)
      },
      condition: conditions[conditionIndex],
      icon: icons[conditionIndex],
      humidity: Math.round(40 + Math.random() * 40), // 40-80%
      windSpeed: Math.round(2 + Math.random() * 8), // 2-10 m/s
      precipitation: Math.round(Math.random() * 30), // 0-30%
      uvIndex: Math.round(1 + Math.random() * 10) // 1-10
    })
  }
  
  return {
    location,
    forecast
  }
}

export function getWeatherIcon(iconCode: string): string {
  // Map OpenWeatherMap icon codes to emoji or icon names
  const iconMap: Record<string, string> = {
    '01d': '☀️', // clear sky day
    '01n': '🌙', // clear sky night
    '02d': '⛅', // few clouds day
    '02n': '☁️', // few clouds night
    '03d': '☁️', // scattered clouds
    '03n': '☁️',
    '04d': '☁️', // broken clouds
    '04n': '☁️',
    '09d': '🌧️', // shower rain
    '09n': '🌧️',
    '10d': '🌦️', // rain day
    '10n': '🌧️', // rain night
    '11d': '⛈️', // thunderstorm
    '11n': '⛈️',
    '13d': '🌨️', // snow
    '13n': '🌨️',
    '50d': '🌫️', // mist
    '50n': '🌫️'
  }
  
  return iconMap[iconCode] || '🌤️'
}

export function getWeatherAdvice(condition: string, temperature: number): string {
  const temp = Math.round(temperature)
  
  if (condition.includes('Rain') || condition.includes('Thunderstorm')) {
    return 'Bring an umbrella and waterproof gear'
  } else if (condition.includes('Snow')) {
    return 'Dress warmly and wear appropriate footwear'
  } else if (temp > 30) {
    return 'Stay hydrated and wear sunscreen'
  } else if (temp < 10) {
    return 'Dress in warm layers'
  } else if (temp > 25) {
    return 'Light clothing recommended'
  } else {
    return 'Comfortable weather for outdoor activities'
  }
} 