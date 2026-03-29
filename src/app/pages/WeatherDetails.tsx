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

// ─── Helpers ──────────────────────────────────────────────────────────────────

function toDisplay(tempC: number, unit: "C" | "F"): number {
  return unit === "C" ? Math.round(tempC) : Math.round((tempC * 9) / 5 + 32);
}

// formatDayLabel uses city-local date for Today/Tomorrow comparison
function formatDayLabel(dt: number, tzOffset: number): string {
  const cityDateStr = localDateString(dt, tzOffset);
  const todayStr = localDateString(Math.floor(Date.now() / 1000), tzOffset);
  const tomorrowTs = Math.floor(Date.now() / 1000) + 86400;
  const tomorrowStr = localDateString(tomorrowTs, tzOffset);

  if (cityDateStr === todayStr) return "Today";
  if (cityDateStr === tomorrowStr) return "Tomorrow";

  // Short weekday label using city local date
  const cityDate = new Date((dt + tzOffset) * 1000);
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  return `${days[cityDate.getUTCDay()]} ${cityDate.getUTCDate()}`;
}

// Group slots by city-local calendar day
function groupByDay(
  slots: HourlyForecastItem[],
  tzOffset: number
): Array<{ label: string; slots: HourlyForecastItem[] }> {
  const map: Record<string, HourlyForecastItem[]> = {};
  const order: string[] = [];
  for (const item of slots) {
    const key = localDateString(item.dt, tzOffset);
    if (!map[key]) { map[key] = []; order.push(key); }
    map[key].push(item);
  }
  return order.map((key) => ({
    label: formatDayLabel(map[key][0].dt, tzOffset),
    slots: map[key],
  }));
}

// Score a single weather moment for cycling suitability
function slotScore(tempC: number, windMs: number, rainMm: number): number {
  let score = 100;
  const kmh = msToKmh(windMs);
  if (kmh > 50) score -= 40;
  else if (kmh > 35) score -= 25;
  else if (kmh > 20) score -= 10;
  if (tempC < 0) score -= 30;
  else if (tempC < 5) score -= 15;
  else if (tempC > 35) score -= 20;
  if (rainMm > 5) score -= 35;
  else if (rainMm > 1) score -= 20;
  else if (rainMm > 0) score -= 8;
  return Math.max(0, score);
}

function getCyclingScore(weather: WeatherData): { score: number; label: string } {
  let score = 100;

  // ── RAIN (highest priority — up to 55 points) ──
  const rain = weather.rain?.["1h"] ?? weather.rain?.["3h"] ?? 0;
  if (rain <= 0)          score -= 0;   // dry — no penalty
  else if (rain <= 0.3)   score -= 5;   // negligible drizzle
  else if (rain <= 1)     score -= 15;  // light drizzle
  else if (rain <= 2.5)   score -= 28;  // light rain
  else if (rain <= 5)     score -= 40;  // moderate rain
  else if (rain <= 8)     score -= 50;  // heavy rain
  else                    score -= 55;  // very heavy rain

  // ── WIND (second priority — up to 45 points) ──
  const kmh = msToKmh(weather.wind.speed);
  if (kmh <= 15)        score -= 0;   // calm
  else if (kmh <= 25)   score -= 10;  // noticeable
  else if (kmh <= 35)   score -= 22;  // difficult for casual riders
  else if (kmh <= 45)   score -= 33;  // hard, tiring
  else if (kmh <= 55)   score -= 40;  // dangerous
  else                  score -= 45;  // extreme

  // ── WEATHER CONDITIONS (third priority — up to 30 points) ──
  const id = weather.weather?.[0]?.id ?? 800;
  if (id < 300)         score -= 30;  // thunderstorm
  else if (id < 400)    score -= 8;   // drizzle codes
  else if (id < 600)    score -= 15;  // rain codes
  else if (id < 700)    score -= 25;  // snow/sleet
  else if (id === 741)  score -= 18;  // fog
  else if (id === 721)  score -= 8;   // haze
  else if (id === 781)  score -= 30;  // tornado

  // ── TEMPERATURE (lowest priority — up to 20 points) ──
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
  else if (t >= -15 && t < -10) score -= 55;  // extreme cold — should be UNSAFE
  else if (t < -15)             score -= 65;  // life-threatening

  // ── HUMIDITY (minor comfort factor) ──
  const hum = weather.main.humidity;
  if (hum > 90 && t > 22)      score -= 5;
  else if (hum > 80 && t > 28) score -= 3;

  score = Math.max(0, Math.min(100, score));
  const label = score >= 70 ? "SAFE" : score >= 40 ? "CAUTION" : "UNSAFE";
  return { score, label };
}
// Pick the 2 best commute departure slots from today's forecast (city local time)
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

  const sorted = [...scored].sort((a, b) => b.score - a.score);
  const picks: typeof scored = [];
  for (const c of sorted) {
    const tooClose = picks.some((p) => Math.abs(p.dt - c.dt) < 3 * 3600);
    if (!tooClose) {
      picks.push(c);
      if (picks.length === 2) break;
    }
  }
  picks.sort((a, b) => a.dt - b.dt);

  return picks.map((p) => ({
    departDt: p.dt,
    arriveDt: p.dt + 3600,
    icon: p.icon,
  }));
}

// ─── Sub-components ───────────────────────────────────────────────────────────

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
    {/* Title INSIDE the box */}
    <div className="px-3 pt-2 text-[14px] font-['Inter:Regular',sans-serif] text-black">
      Hourly Forecast
    </div>

    {/* Day selector tabs */}
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

    {/* Hourly slots */}
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
      message: 'Tornado warning: Seek shelter.'
    });
  }

  // Check for thunderstorms (OpenWeather codes 200-232)
  if (weatherId && weatherId >= 200 && weatherId <= 232) {
    alerts.push({
      severity: 'severe',
      message: 'Thunderstorm warning: Avoid cycling.'
    });
  }

  // Check for heavy rain (cats and dogs)
  if (rainMm > 30) {
    alerts.push({
      severity: rainMm > 50 ? 'extreme' : 'severe',
      message: rainMm > 50 
        ? 'Extreme rain: Avoid cycling.' 
        : 'Heavy rain: Rethink cycling.'
    });
  } else if (rainMm > 15) {
    alerts.push({
      severity: 'moderate',
      message: 'Rain: Be catious.'
    });
  }

  // Check for icy rain / freezing rain (OpenWeather code 511, 611, 612)
  const isFreezingRain = weatherId === 511 || weatherId === 611 || weatherId === 612;
  if (isFreezingRain || (tempC <= 0 && rainMm > 0)) {
    alerts.push({
      severity: 'extreme',
      message: 'Ice and rain warning: Avoid cycling.'
    });
  }

  // Check for snow/sleet (OpenWeather codes 600-622)
  if (weatherId && weatherId >= 600 && weatherId <= 622) {
    alerts.push({
      severity: weatherId >= 620 ? 'severe' : 'moderate',
      message: weatherId >= 620 
        ? 'Heavy snow: Avoid cycling' 
        : 'Snow: Rethink cycling, be catious.'
    });
  }

  // Check for fog (OpenWeather code 741)
  if (weatherId === 741) {
    alerts.push({
      severity: 'moderate',
      message: 'Fog warning: Rethink cycling. Use lights.'
    });
  }

  // Check for strong winds (only dangerous levels, no "safe" message)
  if (kmh > 50) {
    alerts.push({
      severity: 'extreme',
      message: `Extreme wind: Avoid cycling`
    });
  } else if (kmh > 35) {
    alerts.push({
      severity: 'severe',
      message: `Severe winds: Avoid cycling`
    });
  } else if (kmh > 25) {
    alerts.push({
      severity: 'moderate',
      message: `Gusty winds:  Rethink cycling, be catious.`
    });
  }

  // Check for extreme cold
  if (tempC < -10) {
    alerts.push({
      severity: 'extreme',
      message: `Extreme cold: Avoid cycling.`
    });
  } else if (tempC < 0) {
    alerts.push({
      severity: 'moderate',
      message: `Icy roads possible: avoid cycling, be catious.`
    });
  }

  // Check for extreme heat
  if (tempC > 35) {
    alerts.push({
      severity: 'severe',
      message: `Extreme heat: Rethink cycling.`
    });
  }

    // Determine background color and message based on alerts
  let bgColor: string;
  let displayMessage: string;

  if (alerts.length === 0) {
    // No warnings - show green with safe message
    bgColor = 'bg-[#4caf50]'; // Green
    displayMessage = 'No emergency weather hazard alerts now.';
  } else {
    // Sort by severity and get the most critical alert
    const severityOrder = { extreme: 3, severe: 2, moderate: 1 };
    const primaryAlert = alerts.sort((a, b) => 
      severityOrder[b.severity] - severityOrder[a.severity]
    )[0];
    
    displayMessage = primaryAlert.message;
    
    bgColor = 
      primaryAlert.severity === 'extreme' ? 'bg-[#cc0000]' :
      primaryAlert.severity === 'severe' ? 'bg-[#cc0000]' :
      primaryAlert.severity === 'moderate' ? 'bg-[#ff9900]' :
      'bg-[#1a9e00]';
  }

  return (
    <div className="absolute contents left-[75px] top-[589px]" data-name="Hazard Warning">
     <div className={`absolute ${bgColor} h-[36px] left-[31px] rounded-[8px] top-[589px] w-[340px]`} />
       {alerts.length > 0 && (
     <div className="absolute left-[41px] size-[28px] top-[593px]" data-name="image 6">
        <img
          alt=""
          className="absolute inset-0 max-w-none object-cover pointer-events-none size-full"
          src={imgImage6}
        />
      </div>
    )}
   <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[normal] left-[77px] not-italic text-[11px] text-white top-[600px] whitespace-nowrap">
      {displayMessage}
    </p>
  </div>
  );
}

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

  // ── Temperature-based layers ──
  if (tempC < -10) items.push("Insulated jacket, thermal layers");
  else if (tempC < 0) items.push("Thick heavy jacket");
  else if (tempC < 5) items.push("Thick jacket");
  else if (tempC < 12) items.push("Windproof jacket");
  else if (tempC < 18) items.push("Light jacket");
  else if (tempC > 35) items.push("Breathable jacket");

  // ── Rain protection ──
  if (rainMm > 5 || pop >= 0.6) items.push("Waterproof jacket, pants");
  else if (rainMm > 0 || pop >= 0.4) items.push("Waterproof jacket");

  // ── Snow/ice gear ──
  if (weatherId && weatherId >= 600 && weatherId <= 622) {
    items.push("Spiked ice tires");
  }

  // ── Hand protection ──
  if (tempC < -10) items.push("Insulated gloves");
  else if (tempC < 0) items.push("Winter gloves");
  else if (tempC < 5) items.push("Warm gloves");
  else if (tempC < 12) items.push("Light gloves");

  // ── Leg protection ──
  if (tempC < 0) items.push("Thermal tights, leg warmers");
  else if (tempC < 10) items.push("Thermal tights");
  else if (tempC < 16) items.push("Cycling tights");

  // ── Wind protection ──
  if (kmh > 40) items.push("Wind jacket");
  else if (kmh > 30 && tempC >= 12) items.push("Wind vest");

  // ── Visibility/safety gear ──
  if (weatherId === 741) items.push("Front, rear lights");
  if (rainMm > 2) items.push("Rain jacket/vest");

  // ── Heat protection ──
  if (tempC > 30) items.push("Sunscreen, cap");

  // ── Default for perfect weather ──
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
      sublabel: pop >= 0.3 ? "Rain possible" : "Sunny"
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
          src={isIcy ? imgIcyRoad : imgGreenBycle}
          
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

      <button
        onClick={onToggleUnit}
        className="absolute right-[10px] size-[25px] top-[58px] flex items-center justify-center bg-gray-200 text-black rounded-full font-['Inter:Bold',sans-serif] font-bold text-[12px] hover:bg-gray-800 hover:text-white transition-colors"
      >
        °{unit}
      </button>
    </div>
  );
}


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

      {/* Row 1 */}
      <div className="absolute bg-[#eee] h-[34.646px] left-[77px] opacity-65 rounded-[6.929px] top-[881px] w-[220px]" />
      <p className="absolute font-['Inter:Regular',sans-serif] font-normal h-[14px] leading-[normal] left-[96px] not-italic text-[12px] text-black top-[891px] w-[194px]">
        {best[0]
          ? `${formatLocalTimeFull(best[0].departDt, tzOffset)} Departure - ${formatLocalTimeFull(best[0].arriveDt, tzOffset)} Arrival`
          : "No ideal window found"}
      </p>
      {best[0] && (
        <img
          src={`/weather-icons/${best[0].icon}.png`}
          alt="weather icon"
          className="absolute left-[303px] top-[874px] size-[44px] weather-icon"
        />
      )}

      {/* Row 2 */}
      <div className="absolute bg-[#eee] h-[34.51px] left-[77px] opacity-65 rounded-[6.929px] top-[933px] w-[220px]" />
        
      <p className="absolute font-['Inter:Regular',sans-serif] font-normal h-[14px] leading-[normal] left-[96px] not-italic text-[12px] text-black top-[943px] w-[198px]">
        {best[1]
          ? `${formatLocalTimeFull(best[1].departDt, tzOffset)} Departure - ${formatLocalTimeFull(best[1].arriveDt, tzOffset)} Arrival`
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


// ─── Main component ───────────────────────────────────────────────────────────

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
    Promise.all([getWeatherData(decoded), getHourlyForecast(decoded)])
      .then(([weatherData, forecastResult]) => {
        setWeather(weatherData);
        setForecast(forecastResult.slots);
        setTzOffset(forecastResult.tzOffset);
        setLoading(false);
      })
      .catch((err) => {
        // Check if it's a 404 / city not found error
        const msg = err.message?.toLowerCase() ?? "";
        if (msg.includes("404") || msg.includes("not found") || msg.includes("city not found")) {
          setError(`City "${decoded}" not found. Please check the spelling and try again.`);
        } else {
          setError("Something went wrong. Please try again.");
        }
        setLoading(false);
      });
  }, [city]);

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

  const displayCity =
    weather.name ||
    decodeURIComponent(city)
      .split(" ")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");

  const toggleUnit = () => setUnit(unit === "C" ? "F" : "C");
  const { score, label } = getCyclingScore(weather);
  const firstSlot = forecast[0];
  const rainMm = firstSlot?.rain?.["1h"] ?? 0;
  const rainPop = firstSlot?.pop ?? 0; 
  const weatherId = weather.weather?.[0]?.id;

  return (
    <div
      className="bg-[#f3f3f3] min-h-screen flex justify-center overflow-x-hidden overflow-y-auto"
      data-name="iPhone 17 - 1"
    >
      <div className="relative min-h-[1200px] w-[400px] flex-shrink-0 bg-white overflow-hidden">

        {/* Hourly forecast — height is dynamic so label is placed just above it */}
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
