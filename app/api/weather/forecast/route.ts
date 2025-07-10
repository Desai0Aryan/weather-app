import { type NextRequest, NextResponse } from "next/server"

const API_KEY = "73ebbacfdff9e651fade5d8a6b050864"

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const lat = searchParams.get("lat")
  const lon = searchParams.get("lon")

  if (!lat || !lon) {
    return NextResponse.json({ error: "Latitude and longitude parameters are required" }, { status: 400 })
  }

  try {
    console.log(`Fetching forecast for coordinates: ${lat}, ${lon}`)

    // Use the free 5-day forecast API (available in free tier)
    const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`
    console.log(`Forecast API URL: ${forecastUrl}`)

    const forecastResponse = await fetch(forecastUrl, {
      headers: {
        Accept: "application/json",
        "User-Agent": "WeatherDashboard/1.0",
      },
    })

    console.log(`Forecast API response status: ${forecastResponse.status}`)

    // Get response text first to handle non-JSON responses
    const responseText = await forecastResponse.text()
    console.log(`Forecast API response text (first 200 chars): ${responseText.substring(0, 200)}`)

    if (!forecastResponse.ok) {
      console.error(`Forecast API error response: ${responseText}`)

      // Try to parse as JSON if possible, otherwise use the text
      let errorMessage = "Forecast service error"
      try {
        const errorData = JSON.parse(responseText)
        errorMessage = errorData.message || errorData.error || errorMessage
      } catch {
        if (responseText.includes("Invalid API key")) {
          errorMessage = "Invalid API key for forecast service."
        } else if (forecastResponse.status === 401) {
          errorMessage = "Invalid API key for forecast service."
        } else if (forecastResponse.status === 429) {
          errorMessage = "Forecast API rate limit exceeded. Please try again later."
        } else {
          errorMessage = `Forecast service error (${forecastResponse.status}). Please try again.`
        }
      }

      return NextResponse.json({ error: errorMessage }, { status: forecastResponse.status })
    }

    // Parse the JSON response
    let forecastData
    try {
      forecastData = JSON.parse(responseText)
    } catch (parseError) {
      console.error("Failed to parse forecast response as JSON:", parseError)
      console.error("Response text:", responseText)
      return NextResponse.json({ error: "Invalid response from forecast service. Please try again." }, { status: 502 })
    }

    console.log(`Forecast data received, ${forecastData.list?.length || 0} entries`)

    if (!forecastData.list || !Array.isArray(forecastData.list)) {
      console.error("Invalid forecast data structure:", forecastData)
      return NextResponse.json({ error: "Invalid forecast data received. Please try again." }, { status: 502 })
    }

    // Process 5-day forecast data into daily summaries
    const dailyForecasts = []
    const processedDates = new Set()

    for (const item of forecastData.list) {
      if (!item || !item.dt) continue

      const date = new Date(item.dt * 1000).toDateString()

      if (!processedDates.has(date) && dailyForecasts.length < 7) {
        processedDates.add(date)

        // Find all entries for this date to calculate min/max temps
        const dayItems = forecastData.list.filter(
          (listItem: any) => listItem && listItem.dt && new Date(listItem.dt * 1000).toDateString() === date,
        )

        if (dayItems.length === 0) continue

        const temps = dayItems.map((dayItem: any) => dayItem.main?.temp || 0).filter((temp) => temp !== 0)
        const minTemp = temps.length > 0 ? Math.min(...temps) : 0
        const maxTemp = temps.length > 0 ? Math.max(...temps) : 0

        // Find the entry closest to noon for day temperature
        const noonTime = new Date(item.dt * 1000)
        noonTime.setHours(12, 0, 0, 0)
        const dayItem = dayItems.reduce((closest, current) => {
          if (!current || !current.dt) return closest
          const currentTime = new Date(current.dt * 1000)
          const closestTime = new Date(closest.dt * 1000)
          return Math.abs(currentTime.getTime() - noonTime.getTime()) <
            Math.abs(closestTime.getTime() - noonTime.getTime())
            ? current
            : closest
        })

        // Find the entry closest to midnight for night temperature
        const nightTime = new Date(item.dt * 1000)
        nightTime.setHours(0, 0, 0, 0)
        nightTime.setDate(nightTime.getDate() + 1) // Next day midnight
        const nightItem = dayItems.reduce((closest, current) => {
          if (!current || !current.dt) return closest
          const currentTime = new Date(current.dt * 1000)
          const closestTime = new Date(closest.dt * 1000)
          return Math.abs(currentTime.getTime() - nightTime.getTime()) <
            Math.abs(closestTime.getTime() - nightTime.getTime())
            ? current
            : closest
        })

        dailyForecasts.push({
          dt: item.dt,
          temp: {
            min: minTemp,
            max: maxTemp,
            day: dayItem.main?.temp || 0,
            night: nightItem.main?.temp || 0,
          },
          weather: {
            main: dayItem.weather?.[0]?.main || "Unknown",
            description: dayItem.weather?.[0]?.description || "Unknown",
            icon: dayItem.weather?.[0]?.icon || "01d",
          },
          humidity: dayItem.main?.humidity || 0,
          wind_speed: dayItem.wind?.speed || 0,
          wind_deg: dayItem.wind?.deg || 0,
          pop: dayItem.pop || 0, // Probability of precipitation
          uvi: 0, // Not available in free 5-day forecast
        })
      }
    }

    console.log(`Processed ${dailyForecasts.length} daily forecasts`)
    return NextResponse.json(dailyForecasts)
  } catch (error) {
    console.error("Forecast API error details:", error)

    if (error instanceof TypeError && error.message.includes("fetch")) {
      return NextResponse.json({ error: "Network error. Please check your internet connection." }, { status: 503 })
    }

    return NextResponse.json(
      {
        error: "Failed to fetch forecast data. Please try again.",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
