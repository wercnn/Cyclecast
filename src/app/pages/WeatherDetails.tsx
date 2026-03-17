import { useParams, useNavigate } from "react-router";
import { ArrowLeft } from "lucide-react";
import { useState, useEffect } from "react";
import { getWeatherData, getHourlyForecast, HourlyForecastItem } from "../../services/weatherServices";
import svgPaths from "../../imports/svg-hw15znepw5";
import imgImage21 from "./assets/bc8749ec86bfed7e8616d13f584015e6e9d698f8.png";
import imgImage23 from "./assets/9fefa5beabcf1318e4aaeed496cc3cf2df8aed22.png";
import imgImage6 from "./assets/877ace712fc7f1a2033ef33f8cfdb72008f64b9e.png";
import imgImage13 from "./assets/e5ac59210cdbb29fa9c15cba66918e93793cebbc.png";
import imgImage11 from "./assets/8a534b23ffc71d15108235d8a88771d778fadec9.png";
import imgImage12 from "./assets/fef5b547394b70ffc87c75c7606c232d7df4a7f9.png";
import imgImage17 from "./assets/4956d6c49427d1dfb7d80c4a08a6ce2edf962a92.png";
import imgImage15 from "./assets/686df2101d42f56c6b48dbb77f2f421b384d2c43.png";
import imgTick1 from "./assets/1a74f8c655f4959ec564a48f9a1cdb3d0fe4a696.png";
import imgImage14 from "./assets/f51d5fcfda4ed4003bc820499a94e98d1d4f22de.png";
import img3DRenderWeatherIconsSetSunShiningClouds1 from "./assets/34e52827ea3370436100b8d64ef2cbc28a43c41d.png";
import img3DRenderWeatherIconsSetSunShiningClouds261 from "./assets/05847c1d65e4c4cc4033202b0db79c191f71fd0d.png";
import img3DRenderWeatherIconsSetSunShiningClouds2151 from "./assets/9b04625cceb5b50bd060708fbb44e90a1e0edc49.png";
import imgTempLow from "./assets/8a3e163177512278267a9a78130f02a5e2a9d2bd.png";
import imgGreenBycle from "./assets/f58c7f9d20a128c4b0c21b92ad8c999b78d5c56b.png";
import { imgImage20, imgImage22, imgTick } from "../../imports/svg-by301";

// Extended WeatherData interface to cover all fields we use
interface WeatherData {
  main: {
    temp: number;
    humidity: number;
    feels_like: number;
  };
  weather: Array<{ description: string; icon: string; main: string }>;
  wind: { speed: number; deg: number };
  rain?: { "1h"?: number };
  name: string;
}

function Group() {
  return (
    <div className="absolute contents left-[18px] top-[50px]">
      <div className="absolute bg-[#eee] h-[87px] left-[97px] opacity-65 rounded-[8px] top-[50px] w-[60px]" />
      <div className="absolute bg-[#eee] h-[87px] left-[175px] opacity-65 rounded-[8px] top-[50px] w-[61px]" />
      <div className="absolute bg-[#eee] h-[87px] left-[254px] opacity-65 rounded-[8px] top-[50px] w-[60px]" />
      <div className="absolute bg-[#eee] h-[87px] left-[332px] opacity-65 rounded-[8px] top-[50px] w-[60px]" />
      <div className="absolute bg-[#eee] h-[87px] left-[410px] opacity-65 rounded-[8px] top-[50px] w-[60px]" />
      <div className="absolute bg-[#eee] h-[87px] left-[488px] opacity-65 rounded-[8px] top-[50px] w-[60px]" />
      <div className="absolute bg-[#eee] h-[87px] left-[18px] opacity-65 rounded-[8px] top-[50px] w-[61px]" />
    </div>
  );
}

function MaskGroup() {
  return (
    <div className="absolute contents left-[39px] top-[84px]" data-name="Mask group">
      <div className="absolute h-[23.467px] left-[35.9px] mask-alpha mask-intersect mask-no-clip mask-no-repeat mask-position-[2.595px_1.773px] mask-size-[20px_20.146px] top-[81.58px] w-[26.4px]" data-name="image 20" style={{ maskImage: `url('${imgImage20}')` }}>
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <img alt="" className="absolute h-[100.78%] left-0 max-w-none top-[-0.39%] w-full" src={imgImage21} />
        </div>
      </div>
    </div>
  );
}

function MaskGroup1() {
  return (
    <div className="absolute contents left-[115px] top-[84px]" data-name="Mask group">
      <div className="absolute h-[23.467px] left-[111.9px] mask-alpha mask-intersect mask-no-clip mask-no-repeat mask-position-[2.595px_1.773px] mask-size-[20px_20.146px] top-[81.58px] w-[26.4px]" data-name="image 20" style={{ maskImage: `url('${imgImage20}')` }}>
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <img alt="" className="absolute h-[100.78%] left-0 max-w-none top-[-0.39%] w-full" src={imgImage21} />
        </div>
      </div>
    </div>
  );
}

function MaskGroup2() {
  return (
    <div className="absolute contents left-[196px] top-[85px]" data-name="Mask group">
      <div className="absolute h-[23.467px] left-[192.9px] mask-alpha mask-intersect mask-no-clip mask-no-repeat mask-position-[2.595px_1.773px] mask-size-[20px_20.146px] top-[82.58px] w-[26.4px]" data-name="image 20" style={{ maskImage: `url('${imgImage20}')` }}>
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <img alt="" className="absolute h-[100.78%] left-0 max-w-none top-[-0.39%] w-full" src={imgImage21} />
        </div>
      </div>
    </div>
  );
}

function MaskGroup3() {
  return (
    <div className="absolute contents left-[274px] top-[85px]" data-name="Mask group">
      <div className="absolute h-[23.467px] left-[270.9px] mask-alpha mask-intersect mask-no-clip mask-no-repeat mask-position-[2.595px_1.773px] mask-size-[20px_20.146px] top-[82.58px] w-[26.4px]" data-name="image 20" style={{ maskImage: `url('${imgImage20}')` }}>
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <img alt="" className="absolute h-[100.78%] left-0 max-w-none top-[-0.39%] w-full" src={imgImage21} />
        </div>
      </div>
    </div>
  );
}

function MaskGroup4() {
  return (
    <div className="absolute contents left-[349px] top-[83px]" data-name="Mask group">
      <div className="absolute h-[26.599px] left-[346.27px] mask-alpha mask-intersect mask-no-clip mask-no-repeat mask-position-[2.226px_1.231px] mask-size-[29.188px_23px] top-[81.27px] w-[34.138px]" data-name="image 21" style={{ maskImage: `url('${imgImage22}')` }}>
        <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none size-full" src={imgImage23} />
      </div>
    </div>
  );
}

function MaskGroup5() {
  return (
    <div className="absolute contents left-[504px] top-[84px]" data-name="Mask group">
      <div className="absolute h-[26.599px] left-[501.27px] mask-alpha mask-intersect mask-no-clip mask-no-repeat mask-position-[2.226px_1.231px] mask-size-[29.188px_23px] top-[82.27px] w-[34.138px]" data-name="image 21" style={{ maskImage: `url('${imgImage22}')` }}>
        <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none size-full" src={imgImage23} />
      </div>
    </div>
  );
}

function MaskGroup6() {
  return (
    <div className="absolute contents left-[426px] top-[83px]" data-name="Mask group">
      <div className="absolute h-[26.599px] left-[423.27px] mask-alpha mask-intersect mask-no-clip mask-no-repeat mask-position-[2.226px_1.231px] mask-size-[29.188px_23px] top-[81.27px] w-[34.138px]" data-name="image 21" style={{ maskImage: `url('${imgImage22}')` }}>
        <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none size-full" src={imgImage23} />
      </div>
    </div>
  );
}

function HourlyForecast({ unit }: { unit: 'C' | 'F' }) {
  const temps = [10, 9, 11, 14, 12, 11, 8];
  
  return (
    <div className="absolute bg-white h-[152px] left-[30px] overflow-x-auto overflow-y-clip rounded-[8px] shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)] top-[1007px] w-[341px]" data-name="Hourly forecast">
      <Group />
      <p className="absolute font-['Inter:Regular',sans-serif] font-normal h-[22px] leading-[normal] left-[33px] not-italic text-[14px] text-black top-[62px] w-[31px]">9am</p>
      <p className="absolute font-['Inter:Regular',sans-serif] font-normal h-[22px] leading-[normal] left-[106px] not-italic text-[14px] text-black top-[64px] w-[42px]">10am</p>
      <p className="absolute font-['Inter:Regular',sans-serif] font-normal h-[22px] leading-[normal] left-[189px] not-italic text-[14px] text-black top-[65px] w-[42px]">11am</p>
      <p className="absolute font-['Inter:Regular',sans-serif] font-normal h-[22px] leading-[normal] left-[266px] not-italic text-[14px] text-black top-[64px] w-[42px]">12pm</p>
      <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[normal] left-[348px] not-italic text-[14px] text-black top-[64px] whitespace-nowrap">1pm</p>
      <div className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[normal] left-[501px] not-italic text-[14px] text-black top-[64px] whitespace-nowrap whitespace-pre">
        <p className="mb-0">{`3pm `}</p>
        <p>&nbsp;</p>
      </div>
      <div className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[normal] left-[423px] not-italic text-[14px] text-black top-[64px] whitespace-nowrap whitespace-pre">
        <p className="mb-0">{`2pm `}</p>
        <p>&nbsp;</p>
      </div>
      <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[normal] left-[119px] not-italic text-[13px] text-black top-[107px] whitespace-nowrap">{unit === 'C' ? temps[1] : Math.round(temps[1] * 9/5 + 32)}°</p>
      <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[normal] left-[197px] not-italic text-[13px] text-black top-[107px] whitespace-nowrap">{unit === 'C' ? temps[2] : Math.round(temps[2] * 9/5 + 32)}°</p>
      <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[normal] left-[275px] not-italic text-[13px] text-black top-[107px] whitespace-nowrap">{unit === 'C' ? temps[3] : Math.round(temps[3] * 9/5 + 32)}°</p>
      <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[normal] left-[354px] not-italic text-[13px] text-black top-[107px] whitespace-nowrap">{unit === 'C' ? temps[4] : Math.round(temps[4] * 9/5 + 32)}°</p>
      <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[normal] left-[432px] not-italic text-[13px] text-black top-[107px] whitespace-nowrap">{unit === 'C' ? temps[5] : Math.round(temps[5] * 9/5 + 32)}°</p>
      <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[normal] left-[41px] not-italic text-[13px] text-black top-[107px] whitespace-nowrap">{unit === 'C' ? temps[0] : Math.round(temps[0] * 9/5 + 32)}°</p>
      <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[normal] left-[510px] not-italic text-[13px] text-black top-[107px] whitespace-nowrap">{unit === 'C' ? temps[6] : Math.round(temps[6] * 9/5 + 32)}°</p>
      <MaskGroup />
      <MaskGroup1 />
      <MaskGroup2 />
      <MaskGroup3 />
      <MaskGroup4 />
      <MaskGroup5 />
      <MaskGroup6 />
    </div>
  );
}

function HazardWarning({ windSpeed }: { windSpeed: number }) {
  // Show warning if wind speed > 10 m/s (~36 km/h, considered gusty)
  const isGusty = windSpeed > 36;
  
  return (
    <div className="absolute contents left-[75px] top-[589px]" data-name="Hazard Warning">
      <div className="absolute bg-[#ffbe54] h-[36px] left-[75px] rounded-[8px] top-[589px] w-[251px]" />
      <div className="absolute left-[81px] size-[28px] top-[593px]" data-name="image 6">
        <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none size-full" src={imgImage6} />
      </div>
      <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[normal] left-[112px] not-italic text-[11px] text-black top-[600px] whitespace-nowrap">
        {isGusty ? `Strong winds: ${Math.round(windSpeed)} km/h` : "Gusty winds expected around 9:15 AM"} 
      </p>
    </div>
  );
}

function ClothingRecommendations({ tempC }: { tempC: number }) {
  // Derive clothing suggestions from temperature
  const items: string[] = [];
  if (tempC < 5) {
    items.push("Heavy Winter Jacket", "Thermal layers", "Warm gloves");
  } else if (tempC < 12) {
    items.push("Waterproof Jacket", "Light gloves", "Standard layers");
  } else if (tempC < 18) {
    items.push("Light Jacket", "Base layer", "Cycling tights");
  } else {
    items.push("Jersey", "Shorts", "Sun protection");
  }

  return (
    <div className="absolute contents left-[31px] top-[655px]" data-name="Clothing Recommendations">
      <div className="absolute bg-white h-[153px] left-[31px] rounded-[8px] shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)] top-[655px] w-[340px]" />
      <p className="absolute font-['Inter:Regular',sans-serif] font-normal h-[16px] leading-[normal] left-[123px] not-italic text-[14px] text-black top-[677px] w-[197px]">Recommended Clothing:</p>
      <div className="absolute h-[70px] left-[48px] top-[699px] w-[109px]" data-name="image 13">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <img alt="" className="absolute h-[167.86%] left-[-32.18%] max-w-none top-[-25%] w-[162.07%]" src={imgImage13} />
        </div>
      </div>
      <ul className="absolute block font-['Inter:Regular',sans-serif] font-normal h-[56px] leading-[0] left-[163px] list-disc not-italic text-[15px] text-black top-[713px] w-[159px]">
        {items.map((item, i) => (
          <li key={i} className="mb-0 ms-[22.5px]">
            <span className="leading-[normal]">{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function TempInfo({ unit, tempC }: { unit: 'C' | 'F'; tempC: number }) {
  const temp = unit === 'C' ? Math.round(tempC) : Math.round(tempC * 9/5 + 32);
  
  return (
    <div className="absolute contents left-[23px] top-[467px]" data-name="Temp info">
      <div className="absolute bg-white h-[85px] left-[23px] rounded-[8px] shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)] top-[467px] w-[173px]" />
      <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[normal] left-[83px] not-italic text-[24px] text-black top-[485px] whitespace-nowrap">Temp</p>
      <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[normal] left-[89px] not-italic text-[13px] text-black top-[512px] whitespace-nowrap">{temp}°{unit}</p>
    </div>
  );
}

function RainInfo({ rainMm }: { rainMm: number }) {
  const rainPercent = Math.min(100, Math.round(rainMm * 100));
  const label = rainMm > 0 ? `${rainPercent}% chance` : "No rain";

  return (
    <div className="absolute contents left-[23px] top-[366px]" data-name="Rain Info">
      <div className="absolute bg-white h-[85px] left-[23px] rounded-[8px] shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)] top-[366px] w-[173px]" />
      <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[normal] left-[87px] not-italic text-[24px] text-black top-[390px] whitespace-nowrap">Rain</p>
      <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[normal] left-[88px] not-italic text-[13px] text-black top-[419px] whitespace-nowrap">{label}</p>
    </div>
  );
}

function WindInfo({ windSpeedMs }: { windSpeedMs: number }) {
  const kmh = Math.round(windSpeedMs);
  const level = kmh < 20 ? "Light" : kmh < 40 ? "Moderate" : "Strong";

  return (
    <div className="absolute contents left-[206px] top-[366px]" data-name="Wind info">
      <div className="absolute bg-white h-[85px] left-[206px] rounded-[8px] shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)] top-[366px] w-[173px]" />
      <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[normal] left-[274px] not-italic text-[24px] text-black top-[390px] whitespace-nowrap">Wind</p>
      <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[0] left-[274px] not-italic text-[0px] text-black top-[419px] whitespace-nowrap">
        <span className="leading-[normal] text-[13px]">{`${kmh} km/h `}</span>
        <span className="leading-[normal] text-[10px]">{level}</span>
      </p>
    </div>
  );
}

function RoadsInfo({ tempC }: { tempC: number }) {
  const iceRisk = tempC <= 2;

  return (
    <div className="absolute contents left-[206px] top-[467px]" data-name="Roads info">
      <div className="absolute bg-white h-[85px] left-[206px] rounded-[8px] shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)] top-[467px] w-[173px]" />
      <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[normal] left-[274px] not-italic text-[24px] text-black top-[485px] whitespace-nowrap">Roads</p>
      <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[normal] left-[274px] not-italic text-[13px] text-black top-[512px] whitespace-nowrap">
        {iceRisk ? "Ice Risk!" : "No Ice Risk"}
      </p>
    </div>
  );
}

function Location({ city, unit, onToggleUnit }: { city: string; unit: 'C' | 'F'; onToggleUnit: () => void }) {
  const navigate = useNavigate();
  
  return (
    <div className="absolute contents left-0 top-0" data-name="Location">
      <div className="absolute bg-white h-[94px] left-0 shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)] top-0 w-full" />
      <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[normal] left-[39px] not-italic text-[16px] text-black top-[61px] whitespace-nowrap">{city}</p>
      <button
        onClick={() => navigate("/")}
        className="absolute flex items-center justify-center left-[10px] size-[21px] top-[60px]"
      >
        <div className="-scale-y-100 flex-none rotate-180">
          <div className="relative size-[21px]" data-name="image 11">
            <img alt="Back" className="absolute inset-0 max-w-none object-cover pointer-events-none size-full" src={imgImage11} />
          </div>
        </div>
      </button>
      <div className="absolute left-[326px] size-[38px] top-[52px]" data-name="image 12">
      </div>
      <button
        onClick={onToggleUnit}
        className="absolute left-[366px] size-[25px] top-[58px] flex items-center justify-center bg-black text-white rounded-full font-['Inter:Bold',sans-serif] font-bold text-[12px] hover:bg-gray-800 transition-colors"
        data-name="temp toggle"
      >
        °{unit}
      </button>
    </div>
  );
}

function MaskGroup7() {
  return (
    <div className="absolute contents left-[188px] top-[304px]" data-name="Mask group">
      <div className="absolute h-[25px] left-[186px] mask-alpha mask-intersect mask-no-clip mask-no-repeat mask-position-[2px_1px] mask-size-[23px_23px] top-[303px] w-[27px]" data-name="Tick" style={{ maskImage: `url('${imgTick}')` }}>
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <img alt="" className="absolute h-[129%] left-[-10.71%] max-w-none top-[-14.5%] w-[120.71%]" src={imgTick1} />
        </div>
      </div>
    </div>
  );
}

function SuitabilityScore({ score, label }: { score: number; label: string }) {
  const color = score >= 70 ? "#1ba100" : score >= 40 ? "#e08800" : "#cc0000";
  const bgColor = score >= 70 ? "rgba(0, 255, 0, 0.2)" : score >= 40 ? "rgba(255, 200, 0, 0.2)" : "rgba(255, 0, 0, 0.2)";

  return (
    <div className="absolute contents left-[17px] top-[141px]" data-name="Suitability Score">
      <div
        className="absolute h-[193.907px] left-[17px] rounded-[8px] shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)] top-[141px] w-[367px]"
        style={{ backgroundImage: `linear-gradient(180.361deg, rgba(255, 255, 255, 0.2) 58.941%, ${bgColor} 77.619%, ${bgColor} 99.411%), linear-gradient(90deg, rgb(255, 255, 255) 0%, rgb(255, 255, 255) 100%)` }}
      />
      <p className="absolute font-['Inter:Regular',sans-serif] font-normal h-[17px] leading-[normal] left-[142px] not-italic text-[14px] text-black top-[169px] w-[140px]">Cycling Conditions</p>
      <p className="absolute font-['Inter:Bold',sans-serif] font-bold h-[52.585px] leading-[normal] left-[146.27px] not-italic text-[40px] top-[213.3px] w-[109.552px]" style={{ color }}>{label}</p>
      <p className="absolute font-['Inter:Regular',sans-serif] font-normal h-[31.77px] leading-[normal] left-[157px] not-italic text-[24px] top-[269px] w-[87.642px]" style={{ color }}>{score}/100</p>
      <div className="absolute left-[82px] size-[56px] top-[150px]" data-name="image 15">
        <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none size-full" src={imgImage15} />
      </div>
      <MaskGroup7 />
    </div>
  );
}

function MorningDepartureExample() {
  return (
    <div className="absolute contents left-[77px] top-[877px]" data-name="Morning Departure example">
      <div className="absolute bg-[#eee] h-[34.646px] left-[77px] opacity-65 rounded-[6.929px] top-[881px] w-[220px]" />
      <p className="absolute font-['Inter:Regular',sans-serif] font-normal h-[14px] leading-[normal] left-[96px] not-italic text-[12px] text-black top-[891px] w-[194px]">{`11 AM Departure - 12 PM Arrival `}</p>
      <div className="absolute flex h-[41.053px] items-center justify-center left-[303px] top-[877px] w-[46.702px]" style={{ "--transform-inner-width": "1200", "--transform-inner-height": "19" } as React.CSSProperties}>
        <div className="flex-none rotate-[-0.44deg]">
          <div className="h-[40.702px] relative w-[46.394px]" data-name="3d-render-weather-icons-set-sun-shining-clouds 1">
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              <img alt="" className="absolute h-[299.5%] left-[-27.03%] max-w-none top-[-37.48%] w-[1036.12%]" src={img3DRenderWeatherIconsSetSunShiningClouds1} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function AfternoonDepartureExample() {
  return (
    <div className="absolute contents left-[77px] top-[928px]" data-name="Afternoon Departure example">
      <div className="absolute h-[34.51px] left-[77px] top-[933px] w-[220px]">
        <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 220 34.5098">
          <path d={svgPaths.p7105000} fill="var(--fill-0, #EEEEEE)" id="Rectangle 17" opacity="0.65" />
        </svg>
      </div>
      <p className="absolute font-['Inter:Regular',sans-serif] font-normal h-[14px] leading-[normal] left-[96px] not-italic text-[12px] text-black top-[943px] w-[198px]">{`12 PM Departure - 1 PM Arrival `}</p>
      <div className="absolute h-[43px] left-[303px] top-[928px] w-[51px]" data-name="3d-render-weather-icons-set-sun-shining-clouds 3">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <img alt="" className="absolute h-[309.04%] left-[-127.62%] max-w-none top-[-36.42%] w-[1014.32%]" src={img3DRenderWeatherIconsSetSunShiningClouds1} />
        </div>
      </div>
    </div>
  );
}

function CommuteTimes() {
  return (
    <div className="absolute contents left-[31px] top-[832px]" data-name="Commute Times">
      <div className="absolute bg-white h-[152px] left-[31px] rounded-[8px] shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)] top-[832px] w-[340px]" />
      <div className="absolute left-[48px] size-[28px] top-[844px]" data-name="image 11">
        <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none size-full" src={imgImage14} />
      </div>
      <p className="absolute font-['Inter:Regular',sans-serif] font-normal h-[18px] leading-[normal] left-[88px] not-italic text-[14px] text-black top-[849px] w-[180px]">Ideal Commute Times</p>
      <MorningDepartureExample />
      <AfternoonDepartureExample />
    </div>
  );
}

function TempLow({ className }: { className?: string }) {
  return (
    <div className={className || "absolute h-[57px] left-[504px] top-[351px] w-[40px]"} data-name="Temp Low">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
      </div>
    </div>
  );
}

function TempLow1({ className }: { className?: string }) {
  return (
    <div className={className || "absolute h-[59px] left-[31px] top-[477px] w-[39px]"} data-name="Temp Low">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <img alt="" className="absolute h-[106.74%] left-[-217.09%] max-w-none top-[-0.51%] w-[316.95%]" src={imgTempLow} />
      </div>
    </div>
  );
}

// Derive a cycling suitability score from weather data
function getCyclingScore(weather: WeatherData): { score: number; label: string } {
  let score = 100;
  const windKmh = weather.wind.speed * 3.6;
  const temp = weather.main.temp;
  const rain = weather.rain?.["1h"] ?? 0;

  if (windKmh > 50) score -= 40;
  else if (windKmh > 30) score -= 20;
  else if (windKmh > 20) score -= 10;

  if (temp < 0) score -= 30;
  else if (temp < 5) score -= 15;
  else if (temp > 35) score -= 20;

  if (rain > 5) score -= 30;
  else if (rain > 1) score -= 15;
  else if (rain > 0) score -= 5;

  score = Math.max(0, score);

  const label = score >= 70 ? "SAFE" : score >= 40 ? "CAUTION" : "UNSAFE";
  return { score, label };
}

export default function WeatherDetails() {
  const { city } = useParams<{ city: string }>();
  const navigate = useNavigate();
  const [unit, setUnit] = useState<'C' | 'F'>('C');
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!city) {
      navigate("/");
      return;
    }
    getWeatherData(decodeURIComponent(city))
      .then((data) => {
        setWeather(data);
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
        <button onClick={() => navigate("/")} className="text-blue-600 underline">Go back</button>
      </div>
    );
  }

  const displayCity = weather.name || decodeURIComponent(city)
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

  const toggleUnit = () => setUnit(unit === 'C' ? 'F' : 'C');
  const { score, label } = getCyclingScore(weather);
  const rainMm = weather.rain?.["1h"] ?? 0;

  return (
    <div className="bg-[#f3f3f3] relative size-full overflow-x-hidden overflow-y-auto" data-name="iPhone 17 - 1">
      <div className="relative min-h-[1200px] w-full max-w-[420px] mx-auto bg-white overflow-hidden">
        <HourlyForecast unit={unit} />
        <p className="absolute font-['Inter:Regular',sans-serif] font-normal h-[20px] leading-[normal] left-[48px] not-italic text-[14px] text-black top-[1026px] w-[141px]">Hourly Forecast</p>
        <HazardWarning windSpeed={weather.wind.speed} />
        <ClothingRecommendations tempC={weather.main.temp} />
        <TempInfo unit={unit} tempC={weather.main.temp} />
        <RainInfo rainMm={rainMm} />
        <WindInfo windSpeedMs={weather.wind.speed} />
        <RoadsInfo tempC={weather.main.temp} />
        <Location city={displayCity} unit={unit} onToggleUnit={toggleUnit} />
        <SuitabilityScore score={score} label={label} />
        <CommuteTimes />
        <div className="absolute left-[27px] size-[60px] top-[375px]" data-name="3d-render-weather-icons-set-sun-shining-clouds 2 (6) 1">
          <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none size-full" src={img3DRenderWeatherIconsSetSunShiningClouds261} />
        </div>
        <div className="absolute left-[210px] size-[60px] top-[377px]" data-name="3d-render-weather-icons-set-sun-shining-clouds 2 (15) 1">
          <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none size-full" src={img3DRenderWeatherIconsSetSunShiningClouds2151} />
        </div>
        <TempLow />
        <div className="absolute left-[213px] size-[57px] top-[479px]" data-name="Green bycle">
          <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none size-full" src={imgGreenBycle} />
        </div>
        <TempLow1 />
      </div>
    </div>
  );
}
