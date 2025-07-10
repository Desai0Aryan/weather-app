## 🌤️ Weather Dashboard
A sleek and modern weather application built with Next.js 13 (App Router), TypeScript, and Tailwind CSS, offering real-time weather data, 5-day forecasts, and customizable units. Powered by the OpenWeatherMap API.

## 🖼️ Preview
<img width="1721" height="916" alt="Screenshot 2025-07-10 191615" src="https://github.com/user-attachments/assets/40a10e5b-2270-4080-8623-9f53f620ee29" />


## 🚀 Features
🔍 Search for current weather by city

🌡️ Toggle between Metric and Imperial units

📅 View 5-day forecast with temperature and condition icons

☁️ Live data powered by OpenWeatherMap API

⚡ Fast and responsive UI with Tailwind and Server Actions

## 🧰 Tech Stack
Framework: Next.js 13 (App Router)

Language: TypeScript

Styling: Tailwind CSS

API: OpenWeatherMap

State Management: React Context (weather-provider.tsx)

Deployment: Vercel-ready

## 🛠️ Setup Instructions
```bash
# Clone the repository
git clone https://github.com/Desai0Aryan/weather-app.git
cd weather-app
```
```bash
# Install dependencies
pnpm install
# or use npm install or yarn install if preferred
```
```bash
# Set up environment variables
# Create a .env.local file and add your OpenWeatherMap API key:
```
```bash
OPENWEATHERMAP_API_KEY=your_api_key_here
```
```bash
# Run the development server
pnpm dev
```
Visit http://localhost:3000 to view the app.
``` bash
📁 Project Structure (Highlights)
bash
Copy
Edit
app/
  ├── api/weather/          # API routes for current & forecast data
  ├── page.tsx              # Main UI entry
  └── globals.css           # Global styling
components/
  ├── current-weather.tsx   # Displays today's weather
  ├── weather-forecast.tsx  # 5-day forecast component
  ├── weather-search.tsx    # Search bar for cities
  ├── weather-settings.tsx  # Unit switcher (°C/°F)
  └── weather-provider.tsx  # Context for weather state
```

## 🌎 API Reference
API is linked already, you can add your own if you download this repo and make changes.


## 📌 To-Do / Future Improvements
Add geolocation support

Enhance error handling and fallback UI

Add animations or transitions

Deploy on Vercel with environment setup instructions
