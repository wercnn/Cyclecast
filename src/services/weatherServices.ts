const API_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY;
const BASE_URL = "https://api.openweathermap.org/data/2.5/weather";
const HOURLY_URL = "https://pro.openweathermap.org/data/2.5/forecast/hourly";

// OpenWeather wind.speed is always m/s regardless of units param.
// 1 m/s = 3.6 km/h exactly.
export function msToKmh(ms: number): number {
  return Math.round(ms * 3.6);
}

// Format a UTC unix timestamp into the city's local hour label e.g. "3pm", "12am"
// tzOffset is the city's UTC offset in seconds (from API response city.timezone)
export function formatLocalHour(dt: number, tzOffset: number): string {
  const date = new Date((dt + tzOffset) * 1000);
  const hours = date.getUTCHours().toString().padStart(2, "0");
  const minutes = date.getUTCMinutes().toString().padStart(2, "0");
  return `${hours}:${minutes}`;
}

// Format a UTC unix timestamp into city local HH:MM e.g. "09:00"
export function formatLocalTimeFull(dt: number, tzOffset: number): string {
  const localDate = new Date((dt + tzOffset) * 1000);
  const h = String(localDate.getUTCHours()).padStart(2, "0");
  const m = String(localDate.getUTCMinutes()).padStart(2, "0");
  return `${h}:${m}`;
}

// Get the city-local date string for grouping by day
export function localDateString(dt: number, tzOffset: number): string {
  const localDate = new Date((dt + tzOffset) * 1000);
  // Returns e.g. "2026-03-17" — stable key for grouping
  const y = localDate.getUTCFullYear();
  const mo = String(localDate.getUTCMonth() + 1).padStart(2, "0");
  const d = String(localDate.getUTCDate()).padStart(2, "0");
  return `${y}-${mo}-${d}`;
}

export interface WeatherData {
  main: { temp: number; humidity: number; feels_like: number };
  weather: Array<{ description: string; icon: string; main: string }>;
  wind: { speed: number; deg: number }; // always m/s
  rain?: { "1h"?: number };
  coord: { lat: number; lon: number };
  name: string;
}

export interface HourlyForecastItem {
  dt: number;
  main: { temp: number };
  weather: Array<{ main: string; icon: string }>;
  wind: { speed: number; deg: number }; // always m/s
  rain?: { "1h"?: number };
  pop: number; // probability of precipitation 0–1
}

export interface ForecastResult {
  slots: HourlyForecastItem[];
  tzOffset: number; // city UTC offset in seconds
}

export const getWeatherData = async (city: string): Promise<WeatherData> => {
  const response = await fetch(
    `${BASE_URL}?q=${city}&appid=${API_KEY}&units=metric`
  );
  if (!response.ok) {
    throw new Error(`Weather API Error: ${response.status} ${response.statusText}`);
  }
  return response.json();
};

export const getHourlyForecast = async (city: string): Promise<ForecastResult> => {
  const response = await fetch(
    `${HOURLY_URL}?q=${city}&appid=${API_KEY}&units=metric&cnt=96`
  );
  if (!response.ok) {
    throw new Error(`Forecast API Error: ${response.status} ${response.statusText}`);
  }
  const data = await response.json();

  // city.timezone is the UTC offset in seconds for the searched city
  const tzOffset: number = data.city.timezone;

  // Strip slots already in the past (compare against city local now)
  const nowSeconds = Math.floor(Date.now() / 1000);
  const slots: HourlyForecastItem[] = data.list.filter(
    (item: HourlyForecastItem) => item.dt >= nowSeconds
  );

  return { slots, tzOffset };
};
