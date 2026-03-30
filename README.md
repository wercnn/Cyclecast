# 🚴 CycleCast

> **Status: Beta** — ECS522U GUI Coursework · Group 19

CycleCast is a cycling-focused weather web app designed for university students who commute by bike. Rather than showing generic forecasts, it surfaces cyclist-specific information — a **Cycling Suitability Score**, rain probability during commute hours, wind speed, road conditions, clothing recommendations, and real-time hazard alerts — all at a glance, before you leave the house.

---

## 📸 Screenshots / Demo

> _Add your screenshots here. Drag and drop images directly into GitHub's README editor to upload them._

| Home Screen | Dashboard |
|---|---|
| ![Home](./public/screenshots/home.png) | ![Dashboard](./public/screenshots/dashboard.png) |

---

## ✨ Features

- 🟢 **Cycling Suitability Score** — instant Safe / Caution / Avoid rating based on real-time conditions
- 🌧️ **Commute-hour forecasts** — rain probability and wind speed focused on your departure and arrival windows
- 🧊 **Road condition alerts** — ice risk and hazard warnings
- 👕 **Clothing recommendations** — tailored suggestions based on current weather
- ⏰ **Ideal commute times** — suggested departure windows with weather icons
- 📊 **Hourly forecast** — horizontally scrollable temperature and condition timeline
- ⚡ **Real-time alerts** — push warnings for sudden wind gusts and approaching rain

---

## 🛠️ Tech Stack

| Technology | Version |
|---|---|
| React | 18.3.1 |
| TypeScript | ^5.9.3 |
| Vite | 6.3.5 |
| Tailwind CSS | 4.1.12 |
| MUI (Material UI) | 7.3.5 |
| Radix UI | Various |
| React Router | 7.13.0 |
| Recharts | 2.15.2 |
| Lucide React | 0.487.0 |
| Motion | 12.23.24 |

Weather data is powered by the [OpenWeather API](https://openweathermap.org/api).

---

## 🚀 Installation

### Prerequisites

- [Node.js](https://nodejs.org/) v18 or higher
- [npm](https://www.npmjs.com/) or [pnpm](https://pnpm.io/)
- A free [OpenWeather API key](https://home.openweathermap.org/users/sign_up)

### Steps

1. **Clone the repository**

   ```bash
   git clone https://github.com/wercnn/Cyclecast.git
   cd Cyclecast
   ```

2. **Install dependencies**

   ```bash
   npm i
   ```

3. **Set up environment variables**

   ```bash
   cp .env.example .env
   ```

   Open `.env` and add your API key:

   ```env
   VITE_OPENWEATHER_API_KEY=your_api_key_here
   ```

4. **Start the development server**

   ```bash
   npm run dev
   ```

   The app will be available at `http://localhost:5173`.

### Build for Production

```bash
npm run build
```

---

## 🌦️ Weather Icons

CycleCast uses the same icon naming convention as OpenWeather (e.g. `01d.png`, `01n.png`).

- [OpenWeather Icon List](https://openweathermap.org/weather-conditions#Icon-list)
- [Icon assets via Freepik](https://www.freepik.com/free-photo/3d-render-weather-icons-set-sun-shining-clouds_35583427.htm)

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).

---

## 🙏 Acknowledgements

- Designed on [Figma community](https://www.figma.com/design/TVeTFoKarshehUeogMQYjB/Implement-weather-app-homepage) and created UI compenents with Figma Make 
- Weather data powered by [OpenWeather](https://openweathermap.org/)
- ECS522U GUI Programming — Queen Mary University of London
