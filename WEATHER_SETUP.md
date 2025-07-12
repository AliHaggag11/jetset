# Weather Integration Setup

The JetSet app now includes weather integration for itinerary pages. This feature shows weather forecasts for each day of your trip.

## Setup Instructions

### ✅ No Setup Required!

The weather integration uses the **Open-Meteo API**, which is completely free and requires:
- ❌ No registration
- ❌ No API keys
- ❌ No credit card
- ❌ No account creation

The weather feature works out of the box with no configuration needed!

### How It Works

1. **Automatic Location Detection**: The app automatically finds coordinates for your trip destination
2. **Free Weather Data**: Fetches weather forecasts from Open-Meteo's free API
3. **Real-time Updates**: Gets current weather data for your exact travel dates
4. **Fallback Support**: Shows mock data if the API is temporarily unavailable

## Features

### Weather Overview
- Shows average temperature, humidity, wind speed, and rainy days for the entire trip
- Displays the most common weather condition
- Provides a 5-day forecast preview

### Daily Weather Cards
- Individual weather cards for each day of the trip
- Shows temperature range, conditions, humidity, wind speed, precipitation chance, and UV index
- Provides weather-based advice for travelers

### Weather Integration
- Weather data is fetched when you click "Show Weather" button
- Data is cached during the session
- Falls back to mock data if API is unavailable

## API Information

The Open-Meteo API provides:
- ✅ 7-day weather forecast
- ✅ Unlimited API calls
- ✅ No rate limits
- ✅ Global coverage
- ✅ High accuracy data
- ✅ Multiple weather parameters

## Troubleshooting

### Weather Not Loading
1. Check your internet connection
2. Verify the location name is correct
3. Check browser console for any errors
4. Try refreshing the page

### Mock Data Showing
If you see mock weather data instead of real data:
- The Open-Meteo service might be temporarily unavailable
- Your location might not be found in their database
- There might be a network connectivity issue

## Customization

You can customize the weather integration by modifying:
- `lib/weather.ts` - Weather API logic and data processing
- `components/weather-card.tsx` - Individual day weather display
- `components/weather-overview.tsx` - Trip weather summary 