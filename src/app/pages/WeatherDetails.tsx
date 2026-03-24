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
  ForecastResult,
} from "../../services/weatherServices";
import svgPaths from "../../imports/svg-hw15znepw5";
import imgImage13 from "./assets/e5ac59210cdbb29fa9c15cba66918e93793cebbc.png";
import imgImage11 from "./assets/8a534b23ffc71d15108235d8a88771d778fadec9.png";
import imgImage15 from "./assets/686df2101d42f56c6b48dbb77f2f421b384d2c43.png";
import imgTick1 from "./assets/1a74f8c655f4959ec564a48f9a1cdb3d0fe4a696.png";
import imgImage14 from "./assets/f51d5fcfda4ed4003bc820499a94e98d1d4f22de.png";
import imgImage6 from "./assets/877ace712fc7f1a2033ef33f8cfdb72008f64b9e.png";
import img3DRenderWeatherIconsSetSunShiningClouds261 from "./assets/05847c1d65e4c4cc4033202b0db79c191f71fd0d.png";
import img3DRenderWeatherIconsSetSunShiningClouds2151 from "./assets/9b04625cceb5b50bd060708fbb44e90a1e0edc49.png";
import imgTempLow from "./assets/8a3e163177512278267a9a78130f02a5e2a9d2bd.png";
import imgGreenBycle from "./assets/f58c7f9d20a128c4b0c21b92ad8c999b78d5c56b.png";
import { imgImage22, imgTick } from "../../imports/svg-by301";

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

function getCyclingScore(
  weather: WeatherData
): { score: number; label: string } {
  const rain = weather.rain?.["1h"] ?? 0;
  const score = slotScore(weather.main.temp, weather.wind.speed, rain);
  const label =
    score >= 70 ? "SAFE" : score >= 40 ? "CAUTION" : "UNSAFE";
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

function HazardWarning({ windMs }: { windMs: number }) {
  // wind.speed from OpenWeather is always m/s — convert correctly
  const kmh = msToKmh(windMs);
  const isGusty = kmh > 36;
  return (
    <div className="absolute contents left-[75px] top-[589px]" data-name="Hazard Warning">
      <div className="absolute bg-[#ffbe54] h-[36px] left-[75px] rounded-[8px] top-[589px] w-[251px]" />
      <div className="absolute left-[81px] size-[28px] top-[593px]" data-name="image 6">
        <img
          alt=""
          className="absolute inset-0 max-w-none object-cover pointer-events-none size-full"
          src={imgImage6}
        />
      </div>
      <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[normal] left-[112px] not-italic text-[11px] text-black top-[600px] whitespace-nowrap">
        {isGusty
          ? `Strong winds: ${kmh} km/h — take care`
          : `Wind: ${kmh} km/h — safe to ride`}
      </p>
    </div>
  );
}

function ClothingRecommendations({
  tempC,
  rainMm,
  windMs,
  pop,
}: {
  tempC: number;
  rainMm: number;
  windMs: number;
  pop: number;
}) {
  const kmh = msToKmh(windMs);
  const items: string[] = [];

  if (tempC < 5) items.push("Heavy insulated jacket");
  else if (tempC < 12) items.push("Windproof jacket");
  else if (tempC < 18) items.push("Light cycling jacket");

  if (rainMm > 0 || pop >= 0.4) items.push("Waterproof overjacket");

  if (tempC < 5) items.push("Insulated gloves");
  else if (tempC < 12) items.push("Light gloves");

  if (tempC < 10) items.push("Thermal tights");
  else if (tempC < 16) items.push("Cycling tights");

  if (kmh > 30 && tempC >= 12) items.push("Gilet / wind vest");

  if (tempC >= 18 && items.length === 0) items.push("Jersey + shorts");

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
  return (
    <div className="absolute contents left-[23px] top-[467px]" data-name="Temp info">
      <div className="absolute bg-white h-[85px] left-[23px] rounded-[8px] shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)] top-[467px] w-[173px]" />
      <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[normal] left-[83px] not-italic text-[24px] text-black top-[485px] whitespace-nowrap">
        Temp
      </p>
      <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[normal] left-[89px] not-italic text-[13px] text-black top-[512px] whitespace-nowrap">
        {temp}°{unit}
      </p>
    </div>
  );
}

function RainInfo({ rainMm, pop }: { rainMm: number; pop: number }) {
  let label: string;
  // Use pop as a fallback — if there's a 40%+ chance of rain, show it
  // even if rainMm is 0 (i.e. not actively raining at the exact moment)
  if (rainMm > 7) label = "Heavy rain";
  else if (rainMm > 2) label = "Moderate rain";
  else if (rainMm > 0.5) label = "Light rain";
  else if (rainMm > 0 || pop >= 0.4) label = "Light drizzle";
  else if (pop >= 0.2) label = "Low rain chance";
  else label = "No rain";

  return (
    <div className="absolute contents left-[23px] top-[366px]" data-name="Rain Info">
      <div className="absolute bg-white h-[85px] left-[23px] rounded-[8px] shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)] top-[366px] w-[173px]" />
      <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[normal] left-[87px] not-italic text-[24px] text-black top-[390px] whitespace-nowrap">
        Rain
      </p>
      <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[normal] left-[88px] not-italic text-[13px] text-black top-[419px] whitespace-nowrap">
        {label}
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
  if (tempC <= 0) status = "Ice Risk!";
  else if (tempC <= 2) status = "Frost possible";
  else if (rainMm > 2) status = "Wet roads";
  else if (rainMm > 0) status = "Damp roads";
  else status = "No Ice Risk";

  return (
    <div className="absolute contents left-[206px] top-[467px]" data-name="Roads info">
      <div className="absolute bg-white h-[85px] left-[206px] rounded-[8px] shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)] top-[467px] w-[173px]" />
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
      <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[normal] left-[39px] not-italic text-[16px] text-black top-[61px] whitespace-nowrap">
        {city}
      </p>
      <button
        onClick={() => navigate("/")}
        className="absolute flex items-center justify-center left-[10px] size-[21px] top-[60px]"
      >
        <div className="-scale-y-100 flex-none rotate-180">
          <div className="relative size-[21px]">
            <img
              alt="Back"
              className="absolute inset-0 max-w-none object-cover pointer-events-none size-full"
              src={imgImage11}
            />
          </div>
        </div>
      </button>
      <button
        onClick={onToggleUnit}
        className="absolute left-[366px] size-[25px] top-[58px] flex items-center justify-center bg-gray-200 text-black rounded-full font-['Inter:Bold',sans-serif] font-bold text-[12px] hover:bg-gray-800 hover:text-white transition-colors"
      >
        °{unit}
      </button>
    </div>
  );
}

function MaskGroup7() {
  return (
    <div className="absolute contents left-[188px] top-[304px]" data-name="Mask group">
      <div
        className="absolute h-[25px] left-[186px] mask-alpha mask-intersect mask-no-clip mask-no-repeat mask-position-[2px_1px] mask-size-[23px_23px] top-[303px] w-[27px]"
        style={{ maskImage: `url('${imgTick}')` }}
      >
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <img
            alt=""
            className="absolute h-[129%] left-[-10.71%] max-w-none top-[-14.5%] w-[120.71%]"
            src={imgTick1}
          />
        </div>
      </div>
    </div>
  );
}

function SuitabilityScore({
  score,
  label,
}: {
  score: number;
  label: string;
}) {
  const color =
    score >= 70 ? "#1ba100" : score >= 40 ? "#e08800" : "#cc0000";
  const bgColor =
    score >= 70
      ? "rgba(0, 255, 0, 0.2)"
      : score >= 40
      ? "rgba(255, 200, 0, 0.2)"
      : "rgba(255, 0, 0, 0.2)";
  return (
    <div className="absolute contents left-[17px] top-[141px]" data-name="Suitability Score">
      <div
        className="absolute h-[193.907px] left-[17px] rounded-[8px] shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)] top-[141px] w-[367px]"
        style={{
          backgroundImage: `linear-gradient(180.361deg, rgba(255, 255, 255, 0.2) 58.941%, ${bgColor} 77.619%, ${bgColor} 99.411%), linear-gradient(90deg, rgb(255, 255, 255) 0%, rgb(255, 255, 255) 100%)`,
        }}
      />
      <p className="absolute font-['Inter:Regular',sans-serif] font-normal h-[17px] leading-[normal] left-[142px] not-italic text-[14px] text-black top-[169px] w-[140px]">
        Cycling Conditions
      </p>
      <p
        className="absolute font-['Inter:Bold',sans-serif] font-bold h-[52.585px] leading-[normal] left-[146.27px] not-italic text-[40px] top-[213.3px] w-[109.552px]"
        style={{ color }}
      >
        {label}
      </p>
      <p
        className="absolute font-['Inter:Regular',sans-serif] font-normal h-[31.77px] leading-[normal] left-[157px] not-italic text-[24px] top-[269px] w-[87.642px]"
        style={{ color }}
      >
        {score}/100
      </p>
      <div className="absolute left-[82px] size-[56px] top-[150px]">
        <img
          alt=""
          className="absolute inset-0 max-w-none object-cover pointer-events-none size-full"
          src={imgImage15}
        />
      </div>
      <MaskGroup7 />
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
          ? `${formatLocalTimeFull(best[0].departDt, tzOffset)} Dep — ${formatLocalTimeFull(best[0].arriveDt, tzOffset)} Arr`
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
      <div className="absolute h-[34.51px] left-[77px] top-[933px] w-[220px]">
        <svg
          className="absolute block size-full"
          fill="none"
          preserveAspectRatio="none"
          viewBox="0 0 220 34.5098"
        >
          <path
            d={svgPaths.p7105000}
            fill="var(--fill-0, #EEEEEE)"
            id="Rectangle 17"
            opacity="0.65"
          />
        </svg>
      </div>
      <p className="absolute font-['Inter:Regular',sans-serif] font-normal h-[14px] leading-[normal] left-[96px] not-italic text-[12px] text-black top-[943px] w-[198px]">
        {best[1]
          ? `${formatLocalTimeFull(best[1].departDt, tzOffset)} Dep — ${formatLocalTimeFull(best[1].arriveDt, tzOffset)} Arr`
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

function TempLow({ className }: { className?: string }) {
  return (
    <div
      className={className || "absolute h-[57px] left-[504px] top-[351px] w-[40px]"}
      data-name="Temp Low"
    >
      <div className="absolute inset-0 overflow-hidden pointer-events-none" />
    </div>
  );
}

function TempLow1({ className }: { className?: string }) {
  return (
    <div
      className={className || "absolute h-[59px] left-[31px] top-[477px] w-[39px]"}
      data-name="Temp Low"
    >
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <img
          alt=""
          className="absolute h-[106.74%] left-[-217.09%] max-w-none top-[-0.51%] w-[316.95%]"
          src={imgTempLow}
        />
      </div>
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
        setError(err.message);
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
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#f3f3f3] gap-4">
        <p className="text-red-500 text-lg">{error ?? "Something went wrong."}</p>
        <button onClick={() => navigate("/")} className="text-blue-600 underline">
          Go back
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

  return (
    <div
      className="bg-[#f3f3f3] relative size-full overflow-x-hidden overflow-y-auto"
      data-name="iPhone 17 - 1"
    >
      <div className="relative min-h-[1200px] w-full max-w-[420px] mx-auto bg-white overflow-hidden">

        {/* Hourly forecast — height is dynamic so label is placed just above it */}
        <HourlyForecast unit={unit} forecast={forecast} tzOffset={tzOffset} />

        <HazardWarning windMs={weather.wind.speed} />
        <ClothingRecommendations
            tempC={weather.main.temp}
            rainMm={rainMm}
            windMs={weather.wind.speed}
            pop={rainPop}
          />
        <TempInfo unit={unit} tempC={weather.main.temp} />
        <RainInfo rainMm={rainMm} pop={rainPop} />
        <WindInfo windMs={weather.wind.speed} />
        <RoadsInfo tempC={weather.main.temp} rainMm={rainMm} />
        <Location city={displayCity} unit={unit} onToggleUnit={toggleUnit} />
        <SuitabilityScore score={score} label={label} />
        <CommuteTimes forecast={forecast} tzOffset={tzOffset} />

        <div className="absolute left-[27px] size-[60px] top-[375px]">
          <img
            alt=""
            className="absolute inset-0 max-w-none object-cover pointer-events-none size-full"
            src={img3DRenderWeatherIconsSetSunShiningClouds261}
          />
        </div>
        <div className="absolute left-[210px] size-[60px] top-[377px]">
          <img
            alt=""
            className="absolute inset-0 max-w-none object-cover pointer-events-none size-full"
            src={img3DRenderWeatherIconsSetSunShiningClouds2151}
          />
        </div>

        <TempLow />
        <div className="absolute left-[213px] size-[57px] top-[479px]">
          <img
            alt=""
            className="absolute inset-0 max-w-none object-cover pointer-events-none size-full"
            src={imgGreenBycle}
          />
        </div>
        <TempLow1 />
      </div> 
    </div> 
  );
}
