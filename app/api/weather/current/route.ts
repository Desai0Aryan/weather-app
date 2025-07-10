import { type NextRequest, NextResponse } from "next/server"

const API_KEY = "73ebbacfdff9e651fade5d8a6b050864"

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const city = searchParams.get("city")

  if (!city) {
    return NextResponse.json({ error: "City parameter is required" }, { status: 400 })
  }

  try {
    console.log(`Fetching weather for city: ${city}`)

    // Get current weather using the free 2.5 API
    const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${API_KEY}&units=metric`
    console.log(`Weather API URL: ${weatherUrl}`)

    const weatherResponse = await fetch(weatherUrl, {
      headers: {
        Accept: "application/json",
        "User-Agent": "WeatherDashboard/1.0",
      },
    })

    console.log(`Weather API response status: ${weatherResponse.status}`)
    console.log(`Weather API response headers:`, Object.fromEntries(weatherResponse.headers.entries()))

    // Get response text first to handle non-JSON responses
    const responseText = await weatherResponse.text()
    console.log(`Weather API response text (first 200 chars): ${responseText.substring(0, 200)}`)

    if (!weatherResponse.ok) {
      console.error(`Weather API error response: ${responseText}`)

      // Try to parse as JSON if possible, otherwise use the text
      let errorMessage = "Weather service error"
      try {
        const errorData = JSON.parse(responseText)
        errorMessage = errorData.message || errorData.error || errorMessage
      } catch {
        // If not JSON, use the text response or create a generic message
        if (responseText.includes("Invalid API key")) {
          errorMessage = "Invalid API key. Please check your OpenWeatherMap API key."
        } else if (responseText.includes("city not found")) {
          errorMessage = "City not found. Please check the spelling and try again."
        } else if (weatherResponse.status === 404) {
          errorMessage = "City not found. Please check the spelling and try again."
        } else if (weatherResponse.status === 401) {
          errorMessage = "Invalid API key. Please check your OpenWeatherMap API key."
        } else if (weatherResponse.status === 429) {
          errorMessage = "API rate limit exceeded. Please try again later."
        } else {
          errorMessage = `Weather service error (${weatherResponse.status}). Please try again.`
        }
      }

      return NextResponse.json({ error: errorMessage }, { status: weatherResponse.status })
    }

    // Parse the JSON response
    let weatherData
    try {
      weatherData = JSON.parse(responseText)
    } catch (parseError) {
      console.error("Failed to parse weather response as JSON:", parseError)
      console.error("Response text:", responseText)
      return NextResponse.json({ error: "Invalid response from weather service. Please try again." }, { status: 502 })
    }

    console.log(`Weather data received for: ${weatherData.name}`)

    // Try to get UV index (this is optional and might fail)
    let uvIndex = null
    try {
      const uvUrl = `https://api.openweathermap.org/data/2.5/uvi?lat=${weatherData.coord.lat}&lon=${weatherData.coord.lon}&appid=${API_KEY}`
      const uvResponse = await fetch(uvUrl, {
        headers: {
          Accept: "application/json",
          "User-Agent": "WeatherDashboard/1.0",
        },
      })

      if (uvResponse.ok) {
        const uvText = await uvResponse.text()
        try {
          const uvData = JSON.parse(uvText)
          uvIndex = uvData.value
          console.log(`UV index fetched: ${uvIndex}`)
        } catch {
          console.warn("Failed to parse UV response as JSON")
        }
      } else {
        console.warn(`UV API failed with status: ${uvResponse.status}`)
      }
    } catch (error) {
      console.warn("Failed to fetch UV index:", error)
    }

    const formattedData = {
      name: weatherData.name,
      country: weatherData.sys?.country || "Unknown",
      temp: weatherData.main?.temp || 0,
      feels_like: weatherData.main?.feels_like || 0,
      humidity: weatherData.main?.humidity || 0,
      pressure: weatherData.main?.pressure || 0,
      visibility: weatherData.visibility || 10000,
      wind_speed: weatherData.wind?.speed || 0,
      wind_deg: weatherData.wind?.deg || 0,
      uv_index: uvIndex,
      weather: {
        main: weatherData.weather?.[0]?.main || "Unknown",
        description: weatherData.weather?.[0]?.description || "Unknown",
        icon: weatherData.weather?.[0]?.icon || "01d",
      },
      sunrise: weatherData.sys?.sunrise || 0,
      sunset: weatherData.sys?.sunset || 0,
      timezone: weatherData.timezone || 0,
      coord: weatherData.coord || { lat: 0, lon: 0 },
    }

    return NextResponse.json(formattedData)
  } catch (error) {
    console.error("Weather API error details:", error)

    if (error instanceof TypeError && error.message.includes("fetch")) {
      return NextResponse.json({ error: "Network error. Please check your internet connection." }, { status: 503 })
    }

    return NextResponse.json(
      {
        error: "Failed to fetch weather data. Please try again.",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
