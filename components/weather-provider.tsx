"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

interface WeatherData {
  name: string
  country: string
  temp: number
  feels_like: number
  humidity: number
  pressure: number
  visibility: number
  wind_speed: number
  wind_deg: number
  uv_index?: number
  weather: {
    main: string
    description: string
    icon: string
  }
  sunrise: number
  sunset: number
  timezone: number
  coord: {
    lat: number
    lon: number
  }
}

interface ForecastData {
  dt: number
  temp: {
    min: number
    max: number
    day: number
    night: number
  }
  weather: {
    main: string
    description: string
    icon: string
  }
  humidity: number
  wind_speed: number
  wind_deg: number
  pop: number // Probability of precipitation
  uvi: number // UV index
}

type TemperatureUnit = "celsius" | "fahrenheit"
type TimeFormat = "12h" | "24h"

interface WeatherContextType {
  currentWeather: WeatherData | null
  forecast: ForecastData[]
  loading: boolean
  error: string | null
  searchWeather: (city: string) => Promise<void>
  weatherTheme: string
  temperatureUnit: TemperatureUnit
  setTemperatureUnit: (unit: TemperatureUnit) => void
  timeFormat: TimeFormat
  setTimeFormat: (format: TimeFormat) => void
  convertTemperature: (temp: number) => number
  formatTime: (timestamp: number, timezone?: number) => string
  refreshWeather: () => Promise<void>
}

const WeatherContext = createContext<WeatherContextType | undefined>(undefined)

export function useWeather() {
  const context = useContext(WeatherContext)
  if (!context) {
    throw new Error("useWeather must be used within WeatherProvider")
  }
  return context
}

const getWeatherTheme = (weatherMain: string): string => {
  switch (weatherMain.toLowerCase()) {
    case "clear":
      return "sunny"
    case "clouds":
      return "cloudy"
    case "rain":
    case "drizzle":
      return "rainy"
    case "thunderstorm":
      return "stormy"
    case "snow":
      return "snowy"
    case "mist":
    case "fog":
    case "haze":
    case "smoke":
    case "dust":
    case "sand":
      return "misty"
    default:
      return "default"
  }
}

export function WeatherProvider({ children }: { children: ReactNode }) {
  const [currentWeather, setCurrentWeather] = useState<WeatherData | null>(null)
  const [forecast, setForecast] = useState<ForecastData[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [weatherTheme, setWeatherTheme] = useState("default")
  const [temperatureUnit, setTemperatureUnit] = useState<TemperatureUnit>("celsius")
  const [timeFormat, setTimeFormat] = useState<TimeFormat>("12h")
  const [lastSearchCity, setLastSearchCity] = useState<string>("")

  const convertTemperature = (temp: number): number => {
    if (temperatureUnit === "fahrenheit") {
      return (temp * 9) / 5 + 32
    }
    return temp
  }

  const formatTime = (timestamp: number, timezone?: number): string => {
    const date = new Date((timestamp + (timezone || 0)) * 1000)
    const options: Intl.DateTimeFormatOptions = {
      hour: "2-digit",
      minute: "2-digit",
      hour12: timeFormat === "12h",
      timeZone: "UTC",
    }
    return date.toLocaleTimeString([], options)
  }

  const searchWeather = async (city: string) => {
    if (!city.trim()) return

    setLoading(true)
    setError(null)
    setLastSearchCity(city)

    try {
      console.log(`Searching weather for: ${city}`)

      // Fetch current weather
      const currentResponse = await fetch(`/api/weather/current?city=${encodeURIComponent(city)}`, {
        headers: {
          Accept: "application/json",
        },
      })

      console.log(`Current weather response status: ${currentResponse.status}`)

      // Handle response properly
      let currentData
      if (!currentResponse.ok) {
        // Try to get error message from response
        let errorMessage = "Failed to fetch current weather"
        try {
          const errorText = await currentResponse.text()
          console.error("Current weather API error response:", errorText)

          // Try to parse as JSON first
          try {
            const errorData = JSON.parse(errorText)
            errorMessage = errorData.error || errorMessage
          } catch {
            // If not JSON, check for common error patterns
            if (errorText.includes("Invalid API key")) {
              errorMessage = "Invalid API key. Please check your OpenWeatherMap API key."
            } else if (errorText.includes("city not found")) {
              errorMessage = "City not found. Please check the spelling and try again."
            } else if (currentResponse.status === 404) {
              errorMessage = "City not found. Please check the spelling and try again."
            } else if (currentResponse.status === 401) {
              errorMessage = "Invalid API key. Please check your OpenWeatherMap API key."
            } else {
              errorMessage = `Weather service error (${currentResponse.status}). Please try again.`
            }
          }
        } catch {
          errorMessage = `Weather service error (${currentResponse.status}). Please try again.`
        }

        throw new Error(errorMessage)
      }

      // Parse successful response
      try {
        const responseText = await currentResponse.text()
        currentData = JSON.parse(responseText)
        console.log("Current weather data received:", currentData.name)
      } catch (parseError) {
        console.error("Failed to parse current weather response:", parseError)
        throw new Error("Invalid response from weather service. Please try again.")
      }

      // Fetch forecast using coordinates for better accuracy
      let forecastData = []
      try {
        const forecastResponse = await fetch(
          `/api/weather/forecast?lat=${currentData.coord.lat}&lon=${currentData.coord.lon}`,
          {
            headers: {
              Accept: "application/json",
            },
          },
        )

        if (forecastResponse.ok) {
          const forecastText = await forecastResponse.text()
          try {
            forecastData = JSON.parse(forecastText)
            console.log(`Forecast data received: ${forecastData.length} days`)
          } catch (parseError) {
            console.warn("Failed to parse forecast response:", parseError)
          }
        } else {
          console.warn(`Forecast API failed with status: ${forecastResponse.status}`)
        }
      } catch (forecastError) {
        console.warn("Forecast fetch failed:", forecastError)
      }

      setCurrentWeather(currentData)
      setForecast(forecastData)

      // Set theme based on current weather
      const theme = getWeatherTheme(currentData.weather.main)
      setWeatherTheme(theme)

      // Apply theme to document
      document.documentElement.setAttribute("data-weather-theme", theme)

      console.log("Weather search completed successfully")
    } catch (err) {
      console.error("Weather search error:", err)
      const errorMessage = err instanceof Error ? err.message : "An unexpected error occurred"
      setError(errorMessage)
      setCurrentWeather(null)
      setForecast([])
      setWeatherTheme("default")
      document.documentElement.setAttribute("data-weather-theme", "default")
    } finally {
      setLoading(false)
    }
  }

  const refreshWeather = async () => {
    if (lastSearchCity) {
      console.log("Refreshing weather data...")
      await searchWeather(lastSearchCity)
    }
  }

  // Auto-refresh weather data every 10 minutes
  useEffect(() => {
    if (!currentWeather) return

    const interval = setInterval(
      () => {
        console.log("Auto-refreshing weather data...")
        refreshWeather()
      },
      10 * 60 * 1000,
    ) // 10 minutes

    return () => clearInterval(interval)
  }, [currentWeather, lastSearchCity])

  return (
    <WeatherContext.Provider
      value={{
        currentWeather,
        forecast,
        loading,
        error,
        searchWeather,
        weatherTheme,
        temperatureUnit,
        setTemperatureUnit,
        timeFormat,
        setTimeFormat,
        convertTemperature,
        formatTime,
        refreshWeather,
      }}
    >
      {children}
    </WeatherContext.Provider>
  )
}
