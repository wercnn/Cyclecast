const API_KEY = "b1195828baf052a3a32ecf44acf44348";
const BASE_URL = "https://api.openweathermap.org/data/2.5/weather";
const UNITS = "metric";

// Optional: Define what the response looks like
interface WeatherData {
  main: {
    temp: number;
    humidity: number;
  };
  weather: Array<{ description: string; icon: string }>;
  name: string;
}

export const getWeatherData = async (city: string): Promise<WeatherData> => {
  try {
    const response = await fetch(
      `${BASE_URL}?q=${city}&appid=${API_KEY}&units=${UNITS}`
    );
    console.log(`Fetching weather data for: ${city}`);

    if (!response.ok) {
      // Improved error logging to see WHY it failed (e.g., 401 Unauthorized)
      throw new Error(`Weather API Error: ${response.status} ${response.statusText}`);
    }

    const data: WeatherData = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching weather data:", error);
    throw error;
  }
};

const FORECAST_URL = "https://api.openweathermap.org/data/2.5/forecast";

export interface HourlyForecastItem {
  dt: number;           // Unix timestamp
  main: { temp: number };
  weather: Array<{ main: string; icon: string }>;
  rain?: { "3h"?: number };
}

export const getHourlyForecast = async (city: string): Promise<HourlyForecastItem[]> => {
  const response = await fetch(
    `${FORECAST_URL}?q=${city}&appid=${API_KEY}&units=metric&cnt=96`
  );
  if (!response.ok) {
    throw new Error(`Forecast API Error: ${response.status} ${response.statusText}`);
  }
  const data = await response.json();
  return data.list; // returns up to 8 x 3-hour slots
};

