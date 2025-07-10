"use client"

import type React from "react"

import { useState } from "react"
import { Search, MapPin } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { useWeather } from "@/components/weather-provider"

export function WeatherSearch() {
  const [city, setCity] = useState("")
  const { searchWeather, loading } = useWeather()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await searchWeather(city)
  }

  const handleQuickSearch = async (cityName: string) => {
    setCity(cityName)
    await searchWeather(cityName)
  }

  const popularCities = ["New York", "London", "Tokyo", "Paris", "Sydney", "Dubai"]

  return (
    <Card className="p-6 backdrop-blur-sm bg-background/80">
      <form onSubmit={handleSubmit} className="flex gap-2 mb-4">
        <div className="relative flex-1">
          <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            type="text"
            placeholder="Enter city name..."
            value={city}
            onChange={(e) => setCity(e.target.value)}
            className="pl-10"
            disabled={loading}
          />
        </div>
        <Button type="submit" disabled={loading || !city.trim()}>
          {loading ? (
            <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
          ) : (
            <Search className="w-4 h-4" />
          )}
        </Button>
      </form>

      <div className="space-y-2">
        <p className="text-sm text-muted-foreground">Popular cities:</p>
        <div className="flex flex-wrap gap-2">
          {popularCities.map((cityName) => (
            <Button
              key={cityName}
              variant="outline"
              size="sm"
              onClick={() => handleQuickSearch(cityName)}
              disabled={loading}
              className="text-xs"
            >
              {cityName}
            </Button>
          ))}
        </div>
      </div>
    </Card>
  )
}
