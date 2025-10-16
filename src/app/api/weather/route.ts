import { NextResponse } from 'next/server'

// Free weather API - OpenWeatherMap (requires API key in production)
// For demo, we'll use a mock service that returns realistic data

const WEATHER_LOCATIONS = [
  { name: 'Kathmandu', lat: 27.7172, lon: 85.3240 },
  { name: 'Pokhara', lat: 28.2096, lon: 83.9856 },
  { name: 'Chitwan', lat: 27.5291, lon: 84.3542 }
]

// Mock weather data generator
function generateWeatherData(location: string) {
  const conditions = ['☀️ Sunny', '⛅ Partly Cloudy', '☁️ Cloudy', '🌧️ Light Rain', '🌤️ Clear']
  const temps = {
    'Kathmandu': Math.floor(Math.random() * 8) + 18, // 18-26°C
    'Pokhara': Math.floor(Math.random() * 7) + 16,   // 16-23°C
    'Chitwan': Math.floor(Math.random() * 10) + 20   // 20-30°C
  }
  
  return {
    temp: `${temps[location as keyof typeof temps] || 22}°C`,
    condition: conditions[Math.floor(Math.random() * conditions.length)]
  }
}

// In production, use this function with a real API key
async function fetchRealWeatherData() {
  const API_KEY = process.env.OPENWEATHERMAP_API_KEY
  
  if (!API_KEY) {
    // Return mock data if no API key
    return WEATHER_LOCATIONS.map(location => ({
      name: location.name.toLowerCase(),
      ...generateWeatherData(location.name)
    }))
  }

  try {
    const weatherPromises = WEATHER_LOCATIONS.map(async (location) => {
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?lat=${location.lat}&lon=${location.lon}&appid=${API_KEY}&units=metric`
      )
      
      if (!response.ok) {
        throw new Error('Weather API request failed')
      }
      
      const data = await response.json()
      
      const conditionMap: { [key: string]: string } = {
        'clear': '☀️ Sunny',
        'clouds': '☁️ Cloudy',
        'rain': '🌧️ Rain',
        'drizzle': '🌦️ Drizzle',
        'thunderstorm': '⛈️ Thunderstorm',
        'snow': '❄️ Snow',
        'mist': '🌫️ Misty',
        'fog': '🌫️ Foggy'
      }
      
      const condition = conditionMap[data.weather[0].main.toLowerCase()] || '⛅ Partly Cloudy'
      
      return {
        name: location.name.toLowerCase(),
        temp: `${Math.round(data.main.temp)}°C`,
        condition: condition
      }
    })

    const weatherData = await Promise.all(weatherPromises)
    return weatherData
    
  } catch (error) {
    console.error('Weather API error:', error)
    // Fallback to mock data
    return WEATHER_LOCATIONS.map(location => ({
      name: location.name.toLowerCase(),
      ...generateWeatherData(location.name)
    }))
  }
}

export async function GET() {
  try {
    const weatherData = await fetchRealWeatherData()
    
    // Convert array to object for easier access
    const weatherObject = weatherData.reduce((acc, location) => {
      acc[location.name] = {
        temp: location.temp,
        condition: location.condition
      }
      return acc
    }, {} as Record<string, { temp: string, condition: string }>)

    return NextResponse.json({
      success: true,
      data: weatherObject,
      lastUpdated: new Date().toISOString()
    })

  } catch (error) {
    console.error('Weather route error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch weather data' },
      { status: 500 }
    )
  }
}