"use client"

import { Moon, Sun, Settings, Thermometer, Clock } from "lucide-react"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useWeather } from "@/components/weather-provider"

export function WeatherSettings() {
  const { theme, setTheme } = useTheme()
  const { temperatureUnit, setTemperatureUnit, timeFormat, setTimeFormat } = useWeather()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon">
          <Settings className="h-4 w-4" />
          <span className="sr-only">Settings</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>Display Settings</DropdownMenuLabel>
        <DropdownMenuSeparator />

        <DropdownMenuItem onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
          {theme === "dark" ? (
            <>
              <Sun className="mr-2 h-4 w-4" />
              Switch to Light Mode
            </>
          ) : (
            <>
              <Moon className="mr-2 h-4 w-4" />
              Switch to Dark Mode
            </>
          )}
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem onClick={() => setTemperatureUnit(temperatureUnit === "celsius" ? "fahrenheit" : "celsius")}>
          <Thermometer className="mr-2 h-4 w-4" />
          {temperatureUnit === "celsius" ? "Switch to °F" : "Switch to °C"}
        </DropdownMenuItem>

        <DropdownMenuItem onClick={() => setTimeFormat(timeFormat === "12h" ? "24h" : "12h")}>
          <Clock className="mr-2 h-4 w-4" />
          {timeFormat === "12h" ? "24-hour format" : "12-hour format"}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
