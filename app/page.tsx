"use client"
import { WeatherSearch } from "@/components/weather-search"
import { CurrentWeather } from "@/components/current-weather"
import { WeatherForecast } from "@/components/weather-forecast"
import { WeatherProvider } from "@/components/weather-provider"
import { ThemeProvider } from "@/components/theme-provider"
import { WeatherSettings } from "@/components/weather-settings"

export default function WeatherDashboard() {
  return (
    <WeatherProvider>
      <div className="min-h-screen transition-all duration-1000">
          <div className="container mx-auto px-4 py-8">
            <div className="flex justify-between items-center mb-8">
              <div className="text-center flex-1">
                <h1 className="text-4xl font-bold mb-2">Weather Dashboard</h1>
                <p className="text-muted-foreground">Real-time weather data and forecasts</p>
              </div>
              <WeatherSettings />
            </div>

            <div className="max-w-4xl mx-auto space-y-8">
              <WeatherSearch />
              <CurrentWeather />
              <WeatherForecast />
            </div>
          </div>
        </div>
    </WeatherProvider>
  )
}
