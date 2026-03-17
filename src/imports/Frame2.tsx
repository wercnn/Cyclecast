import imgImage22 from "figma:asset/01c46dafbcb4e6239b234bcb42b1b4c0ee010652.png";
import imgImage25 from "figma:asset/675ccc47da7011520feb6ac194cf5d3b711440a0.png";

function Frame() {
  return (
    <div className="absolute bg-white h-[874px] left-0 overflow-clip top-0 w-[401px]">
      <div className="absolute h-[888px] left-[-113px] top-[-14px] w-[589px]" data-name="image 22">
        <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none size-full" src={imgImage22} />
      </div>
      <div className="absolute bg-white h-[126px] left-[43px] rounded-[8px] top-[367px] w-[315px]" />
      <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[normal] left-[73px] not-italic text-[20px] text-black top-[392px] whitespace-nowrap">Search for a city or airport:</p>
      <div className="absolute bg-[#dadada] h-[43px] left-[87px] opacity-46 rounded-[8px] top-[434px] w-[195px]" />
      <p className="absolute font-['Inter:Regular',sans-serif] font-normal h-[15px] leading-[normal] left-[97px] not-italic opacity-56 text-[12px] text-black top-[448px] w-[174px]">Enter your location...</p>
      <p className="-translate-x-1/2 absolute font-['Inter:Medium',sans-serif] font-medium h-[83px] leading-[normal] left-[calc(50%-0.5px)] not-italic text-[40px] text-center text-white top-[245px] w-[378px]">CycleCast</p>
      <div className="absolute h-[27px] left-[286px] top-[442px] w-[41px]" data-name="image 25">
        <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none size-full" src={imgImage25} />
      </div>
    </div>
  );
}

export default function Frame1() {
  return (
    <div className="relative size-full">
      <Frame />
    </div>
  );
}