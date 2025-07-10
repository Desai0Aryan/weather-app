"use client"

import { Calendar, Droplets, Wind, Umbrella, Sun } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useWeather } from "@/components/weather-provider"

export function WeatherForecast() {
  const { forecast, loading, currentWeather, convertTemperature, temperatureUnit } = useWeather()

  if (loading || !currentWeather) {
    return null
  }

  if (forecast.length === 0) {
    return null
  }

  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleDateString([], {
      weekday: "short",
      month: "short",
      day: "numeric",
    })
  }

  const tempSymbol = temperatureUnit === "celsius" ? "°C" : "°F"

  return (
    <Card className="backdrop-blur-sm bg-background/80 border">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="w-5 h-5" />
          7-Day Forecast
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4">
          {forecast.map((day, index) => (
            <div
              key={day.dt}
              className="flex items-center justify-between p-4 rounded-lg border bg-background/50 hover:bg-background/70 transition-colors"
            >
              <div className="flex items-center gap-4 flex-1">
                <div className="text-sm font-medium min-w-[80px]">{index === 0 ? "Today" : formatDate(day.dt)}</div>
                <img
                  src={`https://openweathermap.org/img/wn/${day.weather.icon}.png`}
                  alt={day.weather.description}
                  className="w-10 h-10"
                />
                <div className="flex-1">
                  <p className="font-medium capitalize">{day.weather.description}</p>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Droplets className="w-3 h-3" />
                      {day.humidity}%
                    </span>
                    <span className="flex items-center gap-1">
                      <Wind className="w-3 h-3" />
                      {Math.round(day.wind_speed * 3.6)} km/h
                    </span>
                    <span className="flex items-center gap-1">
                      <Umbrella className="w-3 h-3" />
                      {Math.round(day.pop * 100)}%
                    </span>
                    <span className="flex items-center gap-1">
                      <Sun className="w-3 h-3" />
                      {day.uvi.toFixed(1)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="text-right">
                <div className="flex items-center gap-2">
                  <span className="text-lg font-semibold">
                    {Math.round(convertTemperature(day.temp.max))}
                    {tempSymbol}
                  </span>
                  <span className="text-muted-foreground">
                    {Math.round(convertTemperature(day.temp.min))}
                    {tempSymbol}
                  </span>
                </div>
                <div className="text-xs text-muted-foreground">
                  Day: {Math.round(convertTemperature(day.temp.day))}
                  {tempSymbol} • Night: {Math.round(convertTemperature(day.temp.night))}
                  {tempSymbol}
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
