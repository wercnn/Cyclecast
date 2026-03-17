import { useState, FormEvent } from "react";
import { useNavigate } from "react-router";
import { Search, MapPin, Cloud } from "lucide-react";
import imgImage22 from "./assets/01c46dafbcb4e6239b234bcb42b1b4c0ee010652.png";
import imgImage25 from "./assets/675ccc47da7011520feb6ac194cf5d3b711440a0.png";

export default function CitySelection() {
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  const handleSearch = (e: FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/weather/${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <div className="relative size-full min-h-screen flex items-center justify-center">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-400 via-blue-500 to-blue-600 overflow-clip">
        {/* Background Image with overlay */}
        <div className="absolute h-full left-1/2 top-0 -translate-x-1/2 w-[150%] min-w-[600px] opacity-80">
          <img 
            alt="Blue sky background" 
            className="absolute inset-0 max-w-none object-cover pointer-events-none size-full" 
            src={imgImage22} 
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-blue-500/20 to-blue-600/40" />
      </div>

      <div className="relative z-10 w-full max-w-md mx-auto px-6">
        {/* Enhanced Title with Icon */}
        <div className="text-center mb-12 animate-fade-in">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="bg-white/20 backdrop-blur-sm rounded-full p-3">
              <Cloud className="size-10 text-white" />
            </div>
          </div>
          <h1 className="font-['Inter:Bold',sans-serif] font-bold text-[56px] text-white mb-3 drop-shadow-lg">
            CycleCast
          </h1>
          <p className="font-['Inter:Regular',sans-serif] text-lg text-white/90 drop-shadow">
            Weather forecasts designed for cyclists
          </p>
        </div>

        {/* Enhanced Search Card */}
        <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl p-8 transform transition-all hover:scale-[1.02] duration-300">
          <div className="flex items-center justify-center gap-2 mb-6">
            <MapPin className="size-5 text-blue-600" />
            <p className="font-['Inter:Medium',sans-serif] font-medium text-xl text-gray-800">
              Find Your Location
            </p>
          </div>
          
          <form onSubmit={handleSearch} className="space-y-4">
            <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-gray-400 group-focus-within:text-blue-600 transition-colors" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Enter city or airport..."
                className="bg-gray-50 border-2 border-gray-200 h-14 rounded-xl w-full pl-12 pr-4 font-['Inter:Regular',sans-serif] text-base text-gray-800 placeholder:text-gray-400 focus:outline-none focus:border-blue-500 focus:bg-white transition-all"
              />
            </div>
            
            <button 
              type="submit"
              disabled={!searchQuery.trim()}
              className="w-full h-14 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-['Inter:Medium',sans-serif] font-medium text-lg rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <span>Get Weather Forecast</span>
              <img 
                alt="Search" 
                className="size-5 brightness-0 invert" 
                src={imgImage25} 
              />
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-center text-sm text-gray-600">
              Get cycling-specific weather insights including safety scores, wind alerts, and road conditions
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}