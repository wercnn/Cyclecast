/** Complete weather details for a searched 
 * 
 * Grabs current weather data as well as 96 hour forecast data and fits it into a 400 px page with:
 * Cycling suitability score, hazard warnings, wind/temperature/road conditions, clothing recommendations, ideal commute times and hourly forecasts
 * 
 */

import { useParams, useNavigate } from "react-router";
import { useState, useEffect } from "react";
import {
  getWeatherData,
  getHourlyForecast,
  msToKmh,
  formatLocalHour,
  formatLocalTimeFull,
  localDateString,
  WeatherData,
  HourlyForecastItem,
} from "../../services/weatherServices";

// Static assest imports
const imgImage13 = "/assets/cloths.png";
const imgImage11 = "/assets/pin.png";
const imgImage15 = "/assets/bike.png";
const imgImage14 = "/assets/clock.png";
const imgImage6 = "/assets/warning.png";
const imgWindy = "/assets/windy.png";
const imgGreenBycle = "/assets/green_bike.png";

const imgTempLow2 = "/assets/temp_low.png";
const imgTempMid = "/assets/temp_mid.png";
const imgTempHigh = "/assets/temp_high.png";
const imgIcyRoad = "/assets/Icy_Road.png";

// Helper Functions

// Converts a Celsius temperature to the current display unit
// The returned integer is rounded for a cleaner UI
function toDisplay(tempC: number, unit: "C" | "F"): number {
  return unit === "C" ? Math.round(tempC) : Math.round((tempC * 9) / 5 + 32);
}

// Returns a day label that a person can read the a forecast slot 
// Relative to the city's local calender, not the browsers 
function formatDayLabel(dt: number, tzOffset: number): string {
  const cityDateStr = localDateString(dt, tzOffset);
  const todayStr = localDateString(Math.floor(Date.now() / 1000), tzOffset);
  const tomorrowTs = Math.floor(Date.now() / 1000) + 86400;
  const tomorrowStr = localDateString(tomorrowTs, tzOffset);

  // Today and Tomorrow 
  if (cityDateStr === todayStr) return "Today";
  if (cityDateStr === tomorrowStr) return "Tomorrow";

  // Days of the week label for the rest of the days
  const cityDate = new Date((dt + tzOffset) * 1000);
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  return `${days[cityDate.getUTCDay()]} ${cityDate.getUTCDate()}`;
}

// Group slots by city's local calander
function groupByDay(
  slots: HourlyForecastItem[],
  tzOffset: number
): Array<{ label: string; slots: HourlyForecastItem[] }> {
  const map: Record<string, HourlyForecastItem[]> = {};
  const order: string[] = [];
  for (const item of slots) {
    const key = localDateString(item.dt, tzOffset);
    if (!map[key]) { map[key] = []; order.push(key); } // insertion order is tracked so days are in chronological order
    map[key].push(item);
  }
  return order.map((key) => ({
    label: formatDayLabel(map[key][0].dt, tzOffset),
    slots: map[key],
  }));
}

// Cycling Score Helpers 

// Scores a single forecast hour for cycling suitability (0-100)
// Used by getBestCommuteTimes to rank the best departure slots 
function slotScore(tempC: number, windMs: number, rainMm: number): number {
  let score = 100; // Inital score with no deductions
  const kmh = msToKmh(windMs);
  // Wind deductions
  if (kmh > 50) score -= 40;
  else if (kmh > 35) score -= 25;
  else if (kmh > 20) score -= 10;
  // Temperature deductions
  if (tempC < 0) score -= 30;
  else if (tempC < 5) score -= 15;
  else if (tempC > 35) score -= 20;
  // Rain deductions
  if (rainMm > 5) score -= 35;
  else if (rainMm > 1) score -= 20;
  else if (rainMm > 0) score -= 8;
  return Math.max(0, score);
}

// Calculates the total cycling suitability score for current conditions
// Returns a 0-100 score and a label: Safe, Caution, Unsafe.
// Rain, wind, and weather conditions and temperature depending on the condition, get the most deductions, followed by humidity
// 70 and above score is safe, 40 and above is caution and below 40 is unsafe conditions
function getCyclingScore(weather: WeatherData): { score: number; label: string } {
  let score = 100;

  // Rain: Up to 55 point deductions possible for severity 
  const rain = weather.rain?.["1h"] ?? weather.rain?.["3h"] ?? 0;
  if (rain <= 0)          score -= 0;   // dry: no deductions 
  else if (rain <= 0.3)   score -= 5;   // negligible drizzle
  else if (rain <= 1)     score -= 15;  // light drizzle
  else if (rain <= 2.5)   score -= 28;  // light rain
  else if (rain <= 5)     score -= 40;  // moderate rain
  else if (rain <= 8)     score -= 50;  // heavy rain
  else                    score -= 55;  // very heavy rain, most deductions 

  // Wind: Up to 45 point deductions possible for severity 
  const kmh = msToKmh(weather.wind.speed);
  if (kmh <= 15)        score -= 0;   // calm winds
  else if (kmh <= 25)   score -= 10;  // noticeable winds
  else if (kmh <= 35)   score -= 22;  // difficult for casual riders
  else if (kmh <= 45)   score -= 33;  // hard, tiring winds
  else if (kmh <= 55)   score -= 40;  // dangerous winds
  else                  score -= 45;  // extreme winds

  // Weather Conditions: Up to 65 point deductions possible for severity 
  const id = weather.weather?.[0]?.id ?? 800;
  if (id < 300)         score -= 55;  // thunderstorm
  else if (id < 400)    score -= 8;   // drizzle codes
  else if (id < 600)    score -= 15;  // rain codes
  else if (id < 700)    score -= 25;  // snow/sleet
  else if (id === 741)  score -= 18;  // fog
  else if (id === 721)  score -= 8;   // haze
  else if (id === 781)  score -= 65;  // tornado

  // Temperature: Up to 65 point deductions possible for severity 
  const t = weather.main.temp;
  if (t >= 12 && t <= 28)       score -= 0;
  else if (t >= 8 && t < 12)    score -= 3;
  else if (t > 28 && t <= 33)   score -= 3;
  else if (t > 33 && t <= 38)   score -= 8;
  else if (t > 38)              score -= 14;
  else if (t >= 3 && t < 8)     score -= 8;
  else if (t >= 0 && t < 3)     score -= 14;
  else if (t >= -5 && t < 0)    score -= 25;  // freezing
  else if (t >= -10 && t < -5)  score -= 40;  // severe cold
  else if (t >= -15 && t < -10) score -= 55;  // extreme cold: Unsafe
  else if (t < -15)             score -= 65;  // life threatening condition

  // Humidity: Mostly a comfort factor
  const hum = weather.main.humidity;
  if (hum > 90 && t > 22)      score -= 5;
  else if (hum > 80 && t > 28) score -= 3;

  // Labelling the score as stated
  score = Math.max(0, Math.min(100, score));
  const label = score >= 70 ? "SAFE" : score >= 40 ? "CAUTION" : "UNSAFE";
  return { score, label };
}
// Pick the 2 best commuting departure slots from today's forecast depending on the city's local time

/**
 * 1. Filter slots to todays local city calander 
 * 2. Score each slot with slotScore()
 * 3. Sort in descending order, and make sure to pick slots that are at at least 3 hours apaprt to avoid clustering
 * 4. Sort the final chosen two in ascending order so the closest to the current time in the city displays on top, in order
 * 
 * Returns an empty array if no slots exist, for example if it is late at night
 */
function getBestCommuteTimes(
  forecast: HourlyForecastItem[],
  tzOffset: number
): Array<{ departDt: number; arriveDt: number; icon: string }> {
  const nowSeconds = Math.floor(Date.now() / 1000);
  const todayStr = localDateString(nowSeconds, tzOffset);
  const todaySlots = forecast.filter(
    (item) => localDateString(item.dt, tzOffset) === todayStr
  );
  if (todaySlots.length === 0) return [];

  const scored = todaySlots.map((item) => ({
    dt: item.dt,
    icon: item.weather[0]?.icon ?? "01d",
    score: slotScore(
      item.main.temp,
      item.wind?.speed ?? 0,
      item.rain?.["1h"] ?? 0
    ),
  }));

  // Pick best score first greedily, skip within 3 hour slots to the picked one 
  const sorted = [...scored].sort((a, b) => b.score - a.score);
  const picks: typeof scored = [];
  for (const c of sorted) {
    const tooClose = picks.some((p) => Math.abs(p.dt - c.dt) < 3 * 3600);
    if (!tooClose) {
      picks.push(c);
      if (picks.length === 2) break;
    }
  }

  // Sort again for chronological display
  picks.sort((a, b) => a.dt - b.dt);

  return picks.map((p) => ({
    departDt: p.dt,
    arriveDt: p.dt + 3600,
    icon: p.icon,
  }));
}

// Other components 

/** 
 * Hourly Forecast
 * 
 * Horicontally scrollable component of hourly weather slots, grouped by the city's local calender day.
 * Shows up to 4 days so 96 hours in the selection tab
 * 
 * Each card has: local time, weather icon, temperature 
 * 
 */
function HourlyForecast({
  unit,
  forecast,
  tzOffset,
}: {
  unit: "C" | "F";
  forecast: HourlyForecastItem[];
  tzOffset: number;
}) {
  const days = groupByDay(forecast, tzOffset).slice(0, 4);
  const [selectedDay, setSelectedDay] = useState(0);
  const slots = days[selectedDay]?.slots ?? [];

  return (
  <div
    className="absolute bg-white left-[30px] rounded-[8px] shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)] top-[1005px] w-[341px] h-[170px] overflow-hidden"
    data-name="Hourly Forecast"
  >
    {/* Makes sure the title of the component stays in the component box */}
    <div className="px-3 pt-2 text-[14px] font-['Inter:Regular',sans-serif] text-black">
      Hourly Forecast
    </div>

    {/* Day selector tabs, filled black when clicked on, grey if not */}
    <div className="flex gap-1 px-3 pt-2 pb-1">
      {days.map((day, i) => (
        <button
          key={i}
          onClick={() => setSelectedDay(i)}
          className={`flex-1 py-[2px] rounded-[6px] text-[10px] transition-colors ${
            selectedDay === i
              ? "bg-black text-white"
              : "bg-[#eee] text-gray-600"
          }`}
        >
          {day.label}
        </button>
      ))}
    </div>

    {/* Hourly slots that are scrollable cards */}
    <div className="flex gap-2 px-3 py-2 overflow-x-auto overflow-y-hidden h-[100px]">
      {slots.length === 0 ? (
        <p className="text-[13px] text-gray-400 py-2 px-1">
          No data available
        </p>
      ) : (
        slots.map((item) => (
          <div
            key={item.dt}
            className="flex flex-col items-center justify-between bg-[#eee] opacity-65 rounded-[8px] shrink-0 w-[60px] h-[80px] pt-1 pb-1"
          >
            <p className="text-[12px] text-black">
              {formatLocalHour(item.dt, tzOffset)}
            </p>

            <img
              src={`/weather-icons/${item.weather[0].icon}.png`}
              alt={item.weather[0].main}
              className="size-[28px] weather-icon"
            />

            <p className="text-[12px] text-black">
              {toDisplay(item.main.temp, unit)}°
            </p>
          </div>
        ))
      )}
    </div>
  </div>
);
}

/**
 * Hazard Warning
 * 
 * Looks at the current weather conditions and alerts the most critical alert as a coloured banner:
 * Green for no hazards, orange for moderate hazards such as gusty winds, red for severe and extreme hazards such as a thunderstorm 
 * 
 * The priorty order for multiple hazards is: 
 * tornado > thunderstorm > heavy rain > freezing rain > snow > fog > strong winds > extreme cold > extreme heat
 * 
 * The highest severity one is shown for the moment 
 * 
 * The emojis for alerts were chosen to not collide with the colour coded backround of the alert while also reflecting severity
 */
function HazardWarning({ 
  windMs, 
  weatherId, 
  rainMm,
  tempC
}: { 
  windMs: number;
  weatherId?: number;
  rainMm: number;
  tempC: number;
}) {
  const kmh = msToKmh(windMs);
  const alerts: Array<{ message: string; severity: 'moderate' | 'severe' | 'extreme' }> = [];

  // Check for tornado (OpenWeather code 781)
  if (weatherId === 781) {
    alerts.push({
      severity: 'extreme',
      message: '⚠️ Tornado warning: Seek shelter.'
    });
  }

  // Check for thunderstorms (OpenWeather codes 200-232)
  if (weatherId && weatherId >= 200 && weatherId <= 232) {
    alerts.push({
      severity: 'severe',
      message: '⚠️ Thunderstorm warning: Avoid cycling.'
    });
  }

  // Check for heavy rain (cats and dogs)
  if (rainMm > 30) {
    alerts.push({
      severity: rainMm > 50 ? 'extreme' : 'severe',
      message: rainMm > 50 
        ? '⚠️ Extreme rain: Avoid cycling.' 
        : '⚠️ Heavy rain: Rethink cycling.'
    });
  } else if (rainMm > 15) {
    alerts.push({
      severity: 'moderate',
      message: '🚫 Rain: Be cautious.'
    });
  }

  // Check for icy rain / freezing rain (OpenWeather code 511, 611, 612)
  const isFreezingRain = weatherId === 511 || weatherId === 611 || weatherId === 612;
  if (isFreezingRain || (tempC <= 0 && rainMm > 0)) {
    alerts.push({
      severity: 'extreme',
      message: '⚠️ Ice and rain warning: Avoid cycling.'
    });
  }

  // Check for snow/sleet (OpenWeather codes 600-622)
  if (weatherId && weatherId >= 600 && weatherId <= 622) {
    alerts.push({
      severity: weatherId >= 620 ? 'severe' : 'moderate',
      message: weatherId >= 620 
        ? '⚠️ Heavy snow: Avoid cycling.' 
        : '🚫 Snow: Rethink cycling, be cautious.'
    });
  }

  // Check for fog (OpenWeather code 741)
  if (weatherId === 741) {
    alerts.push({
      severity: 'moderate',
      message: '🚫 Fog warning: Rethink cycling. Use lights.'
    });
  }

  // Check for strong winds (alert for only dangerous levels, no "safe" message)
  if (kmh > 50) {
    alerts.push({
      severity: 'extreme',
      message: `⚠️ Extreme wind: Avoid cycling.`
    });
  } else if (kmh > 35) {
    alerts.push({
      severity: 'severe',
      message: `⚠️ Severe winds: Avoid cycling.`
    });
  } else if (kmh > 25) {
    alerts.push({
      severity: 'moderate',
      message: `🚫 Gusty winds: Rethink cycling, be cautious.`
    });
  }

  // Check for extreme cold
  if (tempC < -10) {
    alerts.push({
      severity: 'extreme',
      message: `⚠️ Extreme cold: Avoid cycling.`
    });
  } else if (tempC < 0) {
    alerts.push({
      severity: 'moderate',
      message: `🚫 Icy roads possible: Rethink cycling, be cautious.`
    });
  }

  // Check for extreme heat
  if (tempC > 35) {
    alerts.push({
      severity: 'severe',
      message: `⚠️ Extreme heat: Avoid cycling.`
    });
  }

  // Determine background color and message based on alerts
  let bgColor: string;
  let displayMessage: string;

  if (alerts.length === 0) {
    // No warnings: show green with safe message
    bgColor = 'bg-[#4caf50]'; // Green
    displayMessage = '☑️ No emergency weather hazard alerts now.';
  } else {
    // Sort by severity and get the most critical alert
    const severityOrder = { extreme: 3, severe: 2, moderate: 1 };
    const primaryAlert = alerts.sort((a, b) => 
      severityOrder[b.severity] - severityOrder[a.severity]
    )[0];
    
    displayMessage = primaryAlert.message;
    
    bgColor = 
      primaryAlert.severity === 'extreme' ? 'bg-[#cc0000]' : // Red
      primaryAlert.severity === 'severe' ? 'bg-[#cc0000]' : // Red
      primaryAlert.severity === 'moderate' ? 'bg-[#ff9900]' : // Orange
      'bg-[#1a9e00]';
  }

  return (
    <div className="absolute contents left-[75px] top-[589px]" data-name="Hazard Warning">
     <div className={`absolute ${bgColor} h-[36px] left-[31px] rounded-[8px] top-[589px] w-[340px]`} />
   <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[normal] left-[37px] not-italic text-[11px] text-white top-[600px] whitespace-nowrap">
      {displayMessage}
    </p>
  </div>
  );
}

/**
 * Clothing Recommendations 
 * 
 * Gets a list of gear and outfit suggestions from current conditions
 *  
 * Priority of gear and clothes:
 * Temperature layers > rain protection > snow gear > gloves > leg warmers > wind protection > visibility > heat protection
 * 
 * Displays the most critical items. Priority list made by the biggest suprise weather factors such as rain and forgettable gears being given higher priorty
 * 
 * Default is shirt and pants for perfect weather 
 */

function ClothingRecommendations({
  tempC,
  rainMm,
  windMs,
  pop,
  weatherId,
}: {
  tempC: number;
  rainMm: number;
  windMs: number;
  pop: number;
  weatherId?: number;
}) {
  const kmh = msToKmh(windMs);
  const items: string[] = [];

  // Recommenations for temperature 
  if (tempC < -10) items.push("Insulated jacket, thermal layers");
  else if (tempC < 0) items.push("Thick heavy jacket");
  else if (tempC < 5) items.push("Thick jacket");
  else if (tempC < 12) items.push("Windproof jacket");
  else if (tempC < 18) items.push("Light jacket");
  else if (tempC > 35) items.push("Breathable jacket");

  // Recommenations for rain and rain probability 
  if (rainMm > 5 || pop >= 0.6) items.push("Waterproof jacket, pants");
  else if (rainMm > 0 || pop >= 0.4) items.push("Waterproof jacket");

  // Recommenations for ice tires (codes 600-622)
  if (weatherId && weatherId >= 600 && weatherId <= 622) {
    items.push("Spiked ice tires");
  }

  // Recommenations for hand protection
  if (tempC < -10) items.push("Insulated gloves");
  else if (tempC < 0) items.push("Winter gloves");
  else if (tempC < 5) items.push("Warm gloves");
  else if (tempC < 12) items.push("Light gloves");

  // Recommenations for leg protection
  if (tempC < 0) items.push("Thermal tights, leg warmers");
  else if (tempC < 10) items.push("Thermal tights");
  else if (tempC < 16) items.push("Cycling tights");

  // Recommenations for wind 
  if (kmh > 40) items.push("Wind jacket");
  else if (kmh > 30 && tempC >= 12) items.push("Wind vest");

  // Gear for visibility and safety 
  if (weatherId === 741) items.push("Front, rear lights"); // For fog 
  if (rainMm > 2) items.push("Rain jacket/vest");

  // Recommenations for heat 
  if (tempC > 30) items.push("Sunscreen, cap");

  // Default for perfect conditions 
  if (tempC >= 18 && tempC <= 30 && items.length === 0) {
    items.push("Shirt, pants");
  }

  // Show top 3 most critical items
  const display = items.slice(0, 3);

  return (
    <div className="absolute contents left-[31px] top-[655px]" data-name="Clothing Recommendations">
      <div className="absolute bg-white h-[153px] left-[31px] rounded-[8px] shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)] top-[655px] w-[340px]" />
      <p className="absolute font-['Inter:Regular',sans-serif] font-normal h-[16px] leading-[normal] left-[123px] not-italic text-[14px] text-black top-[677px] w-[197px]">
        Recommended Clothing:
      </p>
      <div className="absolute h-[70px] left-[48px] top-[699px] w-[109px]" data-name="image 13">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <img
            alt=""
            className="absolute h-[167.86%] left-[-32.18%] max-w-none top-[-25%] w-[162.07%]"
            src={imgImage13}
          />
        </div>
      </div>
      <ul className="absolute block font-['Inter:Regular',sans-serif] font-normal h-[56px] leading-[0] left-[163px] list-disc not-italic text-[15px] text-black top-[713px] w-[159px]">
        {display.map((item, i) => (
          <li key={i} className="mb-0 ms-[22.5px]">
            <span className="leading-[normal]">{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/**
 * Temperature Information
 * 
 * Displays the current temperature for Celsius with an icon:
 * Red and high for hotter, grey and middle for moderate, and blue and low for colder temperatures 
 * 
 */
function TempInfo({ unit, tempC }: { unit: "C" | "F"; tempC: number }) {
  const temp = toDisplay(tempC, unit);

  const tempIcon =
    tempC >= 25 ? imgTempHigh :
    tempC >= 10 ? imgTempMid :
    imgTempLow2;

  return (
    <div className="absolute contents left-[23px] top-[467px]" data-name="Temp info">
      <div className="absolute bg-white h-[85px] left-[23px] rounded-[8px] shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)] top-[467px] w-[173px]" />
      <div className="absolute h-[59px] left-[31px] top-[477px] w-[39px]">
        <img
          alt="Temperature"
          className="absolute inset-0 max-w-none object-cover pointer-events-none size-full"
          src={tempIcon}
        />
      </div>
      <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[normal] left-[83px] not-italic text-[24px] text-black top-[485px] whitespace-nowrap">
        Temp
      </p>
      <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[normal] left-[89px] not-italic text-[13px] text-black top-[512px] whitespace-nowrap">
        {temp}°{unit}
      </p>
    </div>
  );
}

/**
 * Weather Conditions
 * 
 * An open weather condition ID is mapped to a label and a sublabel, such as Thunderstorm label and Do not ride sublabel
 * 
 * The icon changes accordingly to the weather condition to reflect it best
 * 
 * pop is used for probable and ambiguous state guessing, such as Rain possible
 *  
 */
function WeatherCondition({ conditionId, icon, rainMm, pop }: {
  conditionId: number;
  icon: string;
  rainMm: number;
  pop: number;
}) {
  const getCondition = (): { label: string; sublabel: string } => {
    if (conditionId < 300) return { label: "Thunderstorm", sublabel: "Do not ride" };
    if (conditionId < 400) return { label: "Drizzle", sublabel: "Light drizzle" };
    if (conditionId < 600) return {
      label: "Rain",
      sublabel: rainMm > 5 ? "Heavy rain" : rainMm > 2 ? "Moderate" : "Light rain"
    };
    if (conditionId < 700) return { label: "Snow", sublabel: "Slippery roads" };
    if (conditionId === 741) return { label: "Foggy", sublabel: "Low visibility" };
    if (conditionId >= 700 && conditionId < 800) return { label: "Hazy", sublabel: "Poor visibility" };
    if (conditionId === 800) return {
      label: "Clear",
      sublabel: pop >= 0.3 ? "Rain possible" : "Clear"
    };
    if (conditionId <= 802) return {
      label: "Partly Cloudy",
      sublabel: pop >= 0.4 ? "Rain chance" : "Mostly fine"
    };
    return {
      label: "Cloudy",
      sublabel: pop >= 0.4 ? "Rain chance" : "Overcast"
    };
  };

  const { label, sublabel } = getCondition();

  return (
    <div className="absolute contents left-[23px] top-[366px]" data-name="Weather Condition">
      <div className="absolute bg-white h-[85px] left-[23px] rounded-[8px] shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)] top-[366px] w-[173px]" />
      <img
        src={`/weather-icons/${icon}.png`}
        alt={label}
        className="absolute left-[27px] size-[60px] top-[375px] weather-icon"
      />
      <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[normal] left-[87px] not-italic text-[18px] text-black top-[385px] whitespace-nowrap">
        {label}
      </p>
      <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[normal] left-[88px] not-italic text-[11px] text-black top-[410px] whitespace-nowrap">
        {sublabel}
      </p>
    </div>
  );
}

/**
 * Wind Information
 * 
 * Shows wind speed in km/h with a readable label such as light
 * 
 * Always converts from m/s
 * 
 * Levels:
 * Lower than 20 is light, between 20 and 39 is moderate and 40 and above is strong winds
 * 
 */
function WindInfo({ windMs }: { windMs: number }) {
  // wind.speed from OpenWeather is always m/s — 1 m/s = 3.6 km/h
  const kmh = msToKmh(windMs);
  const level = kmh < 20 ? "Light" : kmh < 40 ? "Moderate" : "Strong";
  return (
    <div className="absolute contents left-[206px] top-[366px]" data-name="Wind info">
      <div className="absolute bg-white h-[85px] left-[206px] rounded-[8px] shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)] top-[366px] w-[173px]" />
      <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[normal] left-[274px] not-italic text-[24px] text-black top-[390px] whitespace-nowrap">
        Wind
      </p>
      <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[0] left-[274px] not-italic text-[0px] text-black top-[419px] whitespace-nowrap">
        <span className="leading-[normal] text-[13px]">{`${kmh} km/h `}</span>
        <span className="leading-[normal] text-[10px]">{level}</span>
      </p>
    </div>
  );
}

/**
 * Road's Information
 * 
 * Shows road sruface status based on temperature and rain fall
 * 
 * An icy road image is displayed when ice is likely, else a regular bike icon is displayed
 * 
 * Flagging for ice is for lower than 0 degree Celcius or lower than 2 degrees Celsius when combined with rainfall
 * 
 * */

function RoadsInfo({ tempC, rainMm }: { tempC: number; rainMm: number }) {
  let status: string;
  const isIcy = tempC <= 0 || (tempC <= 2 && rainMm > 0);

  if (tempC <= 0) status = "Ice Risk!";
  else if (tempC <= 2) status = "Frost possible";
  else if (rainMm > 2) status = "Wet roads";
  else if (rainMm > 0) status = "Damp roads";
  else status = "No Ice Risk";

  return (
    <div className="absolute contents left-[206px] top-[467px]" data-name="Roads info">
      <div className="absolute bg-white h-[85px] left-[206px] rounded-[8px] shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)] top-[467px] w-[173px]" />
      <div className="absolute left-[210px] size-[57px] top-[483px]">
        <img
          alt="Roads"
          className="absolute inset-0 max-w-none object-cover pointer-events-none size-full"
          src={isIcy ? imgIcyRoad : imgGreenBycle} // Green to signal okay
          
        />
      </div>
      <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[normal] left-[274px] not-italic text-[24px] text-black top-[485px] whitespace-nowrap">
        Roads
      </p>
      <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[normal] left-[274px] not-italic text-[13px] text-black top-[512px] whitespace-nowrap">
        {status}
      </p>
    </div>
  );
}

/**
 * Location
 * 
 * Top bar with a city name and two buttons:
 * Back arrow on the left to navigate to the input city page, and a Celsius to Fahrenheit toggle button that calls onToggleUnit
 * 
 * The city label uses pointer events none so its does not intercept any clicks for buttons behind it
 * 
 */
function Location({
  city,
  unit,
  onToggleUnit,
}: {
  city: string;
  unit: "C" | "F";
  onToggleUnit: () => void;
}) {
  const navigate = useNavigate();
  return (
    <div className="absolute contents left-0 top-0" data-name="Location">
      <div className="absolute bg-white h-[94px] left-0 shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)] top-0 w-full" />

      {/* Left back button to navigate: The colour inverts when hovered on */}
      <button
        onClick={() => navigate("/")}
        className="absolute left-[10px] size-[25px] top-[58px] flex items-center justify-center bg-gray-200 text-black rounded-full hover:bg-gray-800 hover:text-white transition-colors group"
      >
        <span
          className="size-[13px] bg-black group-hover:bg-white transition-colors"
          style={{
            maskImage: "url('/assets/back-arrow.svg')",
            maskSize: "contain",
            maskRepeat: "no-repeat",
            maskPosition: "center",
          }}
        />
      </button>

       {/* Center city label: pointer events none prevents blocking button clicks */}
      <div className="absolute left-0 w-full top-[55px] flex items-center justify-center gap-[6px] pointer-events-none">
        <div className="-scale-y-100 flex-none rotate-180">
          <div className="relative size-[21px]">
            <img
              alt=""
              className="absolute inset-0 max-w-none object-cover pointer-events-none size-full"
              src={imgImage11}
            />
          </div>
        </div>
        <p className="font-['Inter:Regular',sans-serif] font-normal leading-[normal] not-italic text-[16px] text-black whitespace-nowrap">
          {city}
        </p>
      </div>
      
      {/* Unit toggle: displays the active unit */}
      <button
        onClick={onToggleUnit}
        className="absolute right-[10px] size-[25px] top-[58px] flex items-center justify-center bg-gray-200 text-black rounded-full font-['Inter:Bold',sans-serif] font-bold text-[12px] hover:bg-gray-800 hover:text-white transition-colors"
      >
        °{unit}
      </button>
    </div>
  );
}

/**
 *  Suitability Score
 * 
 * Large top centre component showing the cycling score.
 * 
 * The backround graident and text colour reflect the score level:
 * Green for safe and 70 and over, orange for caution and 40 and over, red for unsafe and below 40
 * 
 *  */
function SuitabilityScore({ score, label }: { score: number; label: string }) {
  const color =
    score >= 70 ? "#1a9e00" : score >= 40 ? "#ff9900" : "#cc0000";
  const bgColor =
    score >= 70
      ? "rgba(0, 200, 0, 0.25)"
      : score >= 40
      ? "rgba(255, 180, 0, 0.25)"
      : "rgba(220, 0, 0, 0.25)";

  return (
    <div className="absolute contents left-[17px] top-[141px]" data-name="Suitability Score">
      <div
        className="absolute h-[193.907px] left-[17px] rounded-[8px] shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)] top-[141px] w-[367px]"
        style={{
          backgroundImage: `linear-gradient(180deg, rgba(255,255,255,0.2) 50%, ${bgColor} 100%), linear-gradient(90deg, #fff 0%, #fff 100%)`,
        }}
      />
      <p className="absolute font-['Inter:Regular',sans-serif] font-normal h-[17px] leading-[normal] left-[142px] not-italic text-[14px] text-black top-[169px] w-[140px]">
        Cycling Conditions
      </p>
      <p
        className="absolute font-['Inter:Bold',sans-serif] font-bold h-[52.585px] leading-[normal] not-italic text-[40px] top-[213.3px] w-[367px] left-[17px] text-center"
        style={{ color }}
      >
        {label}
      </p>
      <p
        className="absolute font-['Inter:Regular',sans-serif] font-normal h-[31.77px] leading-[normal] not-italic text-[24px] top-[269px] w-[367px] left-[17px] text-center"
        style={{ color }}
      >
        {score}%
      </p>
      <div className="absolute left-[82px] size-[56px] top-[150px]">
        <img
          alt=""
          className="absolute inset-0 max-w-none object-cover pointer-events-none size-full"
          src={imgImage15}
        />
      </div>
    </div>
  );
}

/**
 * Commute Times 
 * 
 * Shows the top 2 deperature times for today from getBestCommuteTimes()
 * 
 * Each row has a deperature time and a weather icon for that slot
 * 
 * It shows a single message if fewer than 2 windows are available for the time being
 * It shows no messages if no windows are found, for example for late at night times when the day is soon to be over
 * 
 *  
 */
function CommuteTimes({
  forecast,
  tzOffset,
}: {
  forecast: HourlyForecastItem[];
  tzOffset: number;
}) {
  const best = getBestCommuteTimes(forecast, tzOffset);
  return (
    <div className="absolute contents left-[31px] top-[832px]" data-name="Commute Times">
      <div className="absolute bg-white h-[152px] left-[31px] rounded-[8px] shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)] top-[832px] w-[340px]" />
      <div className="absolute left-[48px] size-[28px] top-[844px]">
        <img
          alt=""
          className="absolute inset-0 max-w-none object-cover pointer-events-none size-full"
          src={imgImage14}
        />
      </div>
      <p className="absolute font-['Inter:Regular',sans-serif] font-normal h-[18px] leading-[normal] left-[88px] not-italic text-[14px] text-black top-[849px] w-[180px]">
        Ideal Commute Times
      </p>

      {/* Row 1: The best window */}
      <div className="absolute bg-[#eee] h-[34.646px] left-[77px] opacity-65 rounded-[6.929px] top-[881px] w-[220px]" />
      <p className="absolute font-['Inter:Regular',sans-serif] font-normal h-[14px] leading-[normal] left-[96px] not-italic text-[12px] text-black top-[891px] w-[194px]">
        {best[0]
          ? `${formatLocalTimeFull(best[0].departDt, tzOffset)} Departure`
          : "No ideal window found"}
      </p>
      {best[0] && (
        <img
          src={`/weather-icons/${best[0].icon}.png`}
          alt="weather icon"
          className="absolute left-[303px] top-[874px] size-[44px] weather-icon"
        />
      )}

      {/* Row 2: The second best window */}
      <div className="absolute bg-[#eee] h-[34.51px] left-[77px] opacity-65 rounded-[6.929px] top-[933px] w-[220px]" />
        
      <p className="absolute font-['Inter:Regular',sans-serif] font-normal h-[14px] leading-[normal] left-[96px] not-italic text-[12px] text-black top-[943px] w-[198px]">
        {best[1]
          ? `${formatLocalTimeFull(best[1].departDt, tzOffset)} Departure`
          : "No second window found"}
      </p>
      {best[1] && (
        <img
          src={`/weather-icons/${best[1].icon}.png`}
          alt="weather icon"
          className="absolute left-[303px] top-[925px] size-[44px] weather-icon"
        />
      )}
    </div>
  );
}


// Main Component 

/**
 * Weather Details which is the default export 
 * 
 * Both API's are fired in parallel so current weather and forecast arrive together 
 * 
 * Errors are labeled as the city not found error and the rest of the errors, both are handled with graceful messages
 * 
 * The rain information comes from the first hourly forecast rather than the current weather, as it is more powerful and better for cycling descisions
 * 
 * displayCity prefers the API resolved name, not the URL
 * 
 */

export default function WeatherDetails() {
  const { city } = useParams<{ city: string }>();
  const navigate = useNavigate();
  const [unit, setUnit] = useState<"C" | "F">("C");
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [forecast, setForecast] = useState<HourlyForecastItem[]>([]);
  const [tzOffset, setTzOffset] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!city) { navigate("/"); return; }
    const decoded = decodeURIComponent(city);

    // Both requests are fired
    Promise.all([getWeatherData(decoded), getHourlyForecast(decoded)])
      .then(([weatherData, forecastResult]) => {
        setWeather(weatherData);
        setForecast(forecastResult.slots);
        setTzOffset(forecastResult.tzOffset);
        setLoading(false);
      })
      .catch((err) => {
        // Check if it's a 404/city not found error
        const msg = err.message?.toLowerCase() ?? "";
        if (msg.includes("404") || msg.includes("not found") || msg.includes("city not found")) {
          setError(`City "${decoded}" not found. Please check the spelling and try again.`);
        } else {
          setError("Something went wrong. Please try again.");
        }
        setLoading(false);
      });
  }, [city]);

  // City input is needed, check again for safety 
  if (!city) return null;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#f3f3f3]">
        <p className="text-gray-500 text-lg">Loading weather...</p>
      </div>
    );
  }

  if (error || !weather) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-white gap-10 px-10">
        <div className="relative size-[121px]">
            <img
              alt="Location not found"
              className="absolute inset-0 max-w-none object-cover pointer-events-none size-full"
              src={imgImage11}
            />
          </div>
        <p className="text-red-500 text-[30px] font-medium text-center">{error ?? "Something went wrong."}</p>
        <button
          onClick={() => navigate("/")}
          className="mt-2 px-6 py-2 bg-black text-white rounded-full text-[30px] hover:bg-gray-800 transition-colors"
        >
          Search again
        </button>
      </div>
    );
  }

  // Use API's city name
  const displayCity =
    weather.name ||
    decodeURIComponent(city)
      .split(" ")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");

  const toggleUnit = () => setUnit(unit === "C" ? "F" : "C");
  const { score, label } = getCyclingScore(weather);

  // First forecast slot gives the rain information and probability for volume and precipitiation 
  const firstSlot = forecast[0];
  const rainMm = firstSlot?.rain?.["1h"] ?? 0;
  const rainPop = firstSlot?.pop ?? 0; 
  const weatherId = weather.weather?.[0]?.id;

  return (
    <div
      className="bg-[#f3f3f3] min-h-screen flex justify-center overflow-x-hidden overflow-y-auto"
      data-name="iPhone 17 - 1"
    > {/* Fixed Width */}
      <div className="relative min-h-[1200px] w-[400px] flex-shrink-0 bg-white overflow-hidden">

        <HourlyForecast unit={unit} forecast={forecast} tzOffset={tzOffset} />

        <HazardWarning 
          windMs={weather.wind.speed}
          weatherId={weatherId}
          rainMm={rainMm}
          tempC={weather.main.temp}
/>
        <ClothingRecommendations
            tempC={weather.main.temp}
            rainMm={rainMm}
            windMs={weather.wind.speed}
            pop={rainPop}
            weatherId={weatherId}
          />
        <TempInfo unit={unit} tempC={weather.main.temp} />
        <WeatherCondition
            conditionId={weather.weather?.[0]?.id ?? 800}
            icon={weather.weather?.[0]?.icon ?? "01d"}
            rainMm={rainMm}
            pop={rainPop}
          />
        <WindInfo windMs={weather.wind.speed} />
        <RoadsInfo tempC={weather.main.temp} rainMm={rainMm} />
        <Location city={displayCity} unit={unit} onToggleUnit={toggleUnit} />
        <SuitabilityScore score={score} label={label} />
        <CommuteTimes forecast={forecast} tzOffset={tzOffset} />
        
         {/* Decorative icon for visuals only */}
        <div className="absolute left-[210px] size-[60px] top-[377px]">
          <img
            alt=""
            className="absolute inset-0 max-w-none object-cover pointer-events-none size-full"
            src={imgWindy}
          />
        </div>
      </div> 
    </div> 
  );
}
