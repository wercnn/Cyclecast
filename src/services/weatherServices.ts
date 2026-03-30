/** API layer for OpenWeatherMap integration
 * 
 * API key is safely pulled from the .env file.
 * 
 * Grabs current weather data via the free open weather map endpoint
 * Grabs hourly forecasts data via the pro open weather map endpoint
 * 
 * All temperatures are returned in Celsius 
 * Wind speed is returned in m/s by the API and is converted using msToKmh() before display
  */
const API_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY;
const BASE_URL = "https://api.openweathermap.org/data/2.5/weather";
const HOURLY_URL = "https://pro.openweathermap.org/data/2.5/forecast/hourly"; // Requires a pro API key

// Converts wind speed from meters per second to kilometers per hour
// 1 m/s = 3.6 km/h
export function msToKmh(ms: number): number {
  return Math.round(ms * 3.6);
}

// The API returns all timestamps as UTC unix seconds 
// Cities have a timezone field which is their UTC offset in seconds
// To display the times in the city's local time, the offset is applied manually
// This is so the city's local timezone not the browsers
export function formatLocalHour(dt: number, tzOffset: number): string {
  const date = new Date((dt + tzOffset) * 1000); // The pattern used
  const hours = date.getUTCHours().toString().padStart(2, "0");
  const minutes = date.getUTCMinutes().toString().padStart(2, "0");
  return `${hours}:${minutes}`;
}

// Formats a UTC unix timestamp as a full HH:MM, for example "09:00", time string in the city's local time
export function formatLocalTimeFull(dt: number, tzOffset: number): string {
  const localDate = new Date((dt + tzOffset) * 1000);
  const h = String(localDate.getUTCHours()).padStart(2, "0");
  const m = String(localDate.getUTCMinutes()).padStart(2, "0");
  return `${h}:${m}`;
}

// Returns a YYYY-MM-DD date string of the city's local calender date
export function localDateString(dt: number, tzOffset: number): string {
  const localDate = new Date((dt + tzOffset) * 1000);
  const y = localDate.getUTCFullYear();
  const mo = String(localDate.getUTCMonth() + 1).padStart(2, "0");
  const d = String(localDate.getUTCDate()).padStart(2, "0");
  return `${y}-${mo}-${d}`;
}

// The weather response format from the free weather endpoint
// This only has the features CycleCast uses, not the full API response
export interface WeatherData {
  main: { temp: number; humidity: number; feels_like: number }; // Temperature and humidity 
  weather: Array<{ description: string; icon: string; main: string }>; // Weather icon and description
  wind: { speed: number; deg: number }; // Wind, in m/s as stated
  rain?: { "1h"?: number }; // Rainfall volume in the past hour
  coord: { lat: number; lon: number }; // Latitude of the city. longitude of the city 
  name: string; // City name
}

// An hourly slot from the pro hourly forecast endpoint
// Each slot is for an hour
export interface HourlyForecastItem {
  dt: number; // UTC unix timestep for this hour
  main: { temp: number };
  weather: Array<{ main: string; icon: string }>;
  wind: { speed: number; deg: number }; 
  rain?: { "1h"?: number };
  pop: number; 
}

//  The filtered forecast slots get bundled with the city's timezone
export interface ForecastResult {
  slots: HourlyForecastItem[]; // Hourly forecast slots 
  tzOffset: number; // City's UTC offset in seconds
}

// Grabs current weather conditions for a city by name
export const getWeatherData = async (city: string): Promise<WeatherData> => {
  const response = await fetch(
    `${BASE_URL}?q=${city}&appid=${API_KEY}&units=metric`
  );
  if (!response.ok) {
    throw new Error(`Weather API Error: ${response.status} ${response.statusText}`);
  }
  return response.json();
};

// Grabs up to 96 hours of hourly forecast data for a city
// Only includes future slots
export const getHourlyForecast = async (city: string): Promise<ForecastResult> => {
  const response = await fetch(
    `${HOURLY_URL}?q=${city}&appid=${API_KEY}&units=metric&cnt=96`
  );
  if (!response.ok) {
    throw new Error(`Forecast API Error: ${response.status} ${response.statusText}`);
  }
  const data = await response.json();

  const tzOffset: number = data.city.timezone;

  const nowSeconds = Math.floor(Date.now() / 1000);
  const slots: HourlyForecastItem[] = data.list.filter(
    (item: HourlyForecastItem) => item.dt >= nowSeconds
  );

  return { slots, tzOffset };
};
