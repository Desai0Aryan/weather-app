"use client"

import { Droplets, Wind, Eye, Gauge, Sunrise, Sunset, RefreshCw, Sun } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useWeather } from "@/components/weather-provider"

export function CurrentWeather() {
  const { currentWeather, loading, error, convertTemperature, formatTime, temperatureUnit, refreshWeather } =
    useWeather()

  if (loading) {
    return (
      <Card className="backdrop-blur-sm bg-background/80 border">
        <CardContent className="p-6">
          <div className="flex items-center justify-center h-48">
            <div className="w-8 h-8 border-4 border-current border-t-transparent rounded-full animate-spin" />
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="backdrop-blur-sm bg-background/80 border">
        <CardContent className="p-6">
          <div className="text-center text-destructive">
            <p className="text-lg font-semibold">Error</p>
            <p className="text-sm">{error}</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!currentWeather) {
    return (
      <Card className="backdrop-blur-sm bg-background/80 border">
        <CardContent className="p-6">
          <div className="text-center text-muted-foreground">
            <p className="text-lg">Search for a city to see current weather</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  const tempSymbol = temperatureUnit === "celsius" ? "°C" : "°F"

  return (
    <Card className="backdrop-blur-sm bg-background/80 border">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">{currentWeather.name}</h2>
            <p className="text-muted-foreground">{currentWeather.country}</p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-lg px-3 py-1">
              {Math.round(convertTemperature(currentWeather.temp))}
              {tempSymbol}
            </Badge>
            <Button variant="ghost" size="icon" onClick={refreshWeather} className="h-8 w-8">
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center gap-4">
          <img
            src={`https://openweathermap.org/img/wn/${currentWeather.weather.icon}@2x.png`}
            alt={currentWeather.weather.description}
            className="w-16 h-16"
          />
          <div>
            <p className="text-xl font-semibold capitalize">{currentWeather.weather.description}</p>
            <p className="text-muted-foreground">
              Feels like {Math.round(convertTemperature(currentWeather.feels_like))}
              {tempSymbol}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div className="flex items-center gap-2">
            <Droplets className="w-4 h-4 text-blue-500" />
            <div>
              <p className="text-sm text-muted-foreground">Humidity</p>
              <p className="font-semibold">{currentWeather.humidity}%</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Wind className="w-4 h-4 text-gray-500" />
            <div>
              <p className="text-sm text-muted-foreground">Wind</p>
              <p className="font-semibold">{Math.round(currentWeather.wind_speed * 3.6)} km/h</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Gauge className="w-4 h-4 text-orange-500" />
            <div>
              <p className="text-sm text-muted-foreground">Pressure</p>
              <p className="font-semibold">{currentWeather.pressure} hPa</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Eye className="w-4 h-4 text-purple-500" />
            <div>
              <p className="text-sm text-muted-foreground">Visibility</p>
              <p className="font-semibold">{(currentWeather.visibility / 1000).toFixed(1)} km</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Sunrise className="w-4 h-4 text-yellow-500" />
            <div>
              <p className="text-sm text-muted-foreground">Sunrise</p>
              <p className="font-semibold">{formatTime(currentWeather.sunrise, currentWeather.timezone)}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Sunset className="w-4 h-4 text-red-500" />
            <div>
              <p className="text-sm text-muted-foreground">Sunset</p>
              <p className="font-semibold">{formatTime(currentWeather.sunset, currentWeather.timezone)}</p>
            </div>
          </div>

          {currentWeather.uv_index && (
            <div className="flex items-center gap-2 md:col-span-3">
              <Sun className="w-4 h-4 text-yellow-600" />
              <div>
                <p className="text-sm text-muted-foreground">UV Index</p>
                <p className="font-semibold">{currentWeather.uv_index}</p>
              </div>
            </div>
          )}
        </div>

        <div className="text-xs text-muted-foreground text-center">Last updated: {new Date().toLocaleTimeString()}</div>
      </CardContent>
    </Card>
  )
}
