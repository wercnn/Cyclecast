import { useState, FormEvent } from "react";
import { useNavigate } from "react-router";
import { Search, MapPin, Cloud } from "lucide-react";
const imgImage22 = "/assets/background.png";

/**
 * City Selection Component
 * 
 * Landing page that allows the user to search for a city to view a cyclist, especially univeristy commuter cyclist, tailored information
 * 
 * It has a backround image for visual purposes and a search form  
 * 
 * */
export default function CitySelection() {
  // Management for the search input field 
  const [searchQuery, setSearchQuery] = useState("");
  // React router hook for navigation 
  const navigate = useNavigate();
  
  /**
   * Handles form submisson for city searching
   * 
   * @param e : the form event from the search form
   * 
   * Prevents default form submisson behaviour and navigates to the weather page with the searched city as a URL parameter
   * 
   */
  const handleSearch = (e: FormEvent) => {
    e.preventDefault();
    // Only navigate if there is input in the search field 
    if (searchQuery.trim()) {
      navigate(`/weather/${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <div className="relative size-full min-h-screen flex items-center justify-center">

      {/* Background Layer: Gradient and image */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-400 via-blue-500 to-blue-600 overflow-clip">
        {/* Background image */}
        <div className="absolute h-full left-1/2 top-0 -translate-x-1/2 w-[150%] min-w-[600px] opacity-80">
          <img 
            alt="Blue sky background" 
            className="absolute inset-0 max-w-none object-cover pointer-events-none size-full" 
            src={imgImage22} 
          />
        </div>

         {/* Gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-blue-500/20 to-blue-600/40" />
      </div>
      
       {/* Content layer */}
      <div className="relative z-10 w-full max-w-md mx-auto px-6">

         {/* Header section */}
        <div className="text-center mb-12 animate-fade-in">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="bg-white/20 backdrop-blur-sm rounded-full p-3">
              <Cloud className="size-10 text-white" />
            </div>
          </div>
           {/* App name */}
          <h1 className="font-['Inter:Bold',sans-serif] font-bold text-[56px] text-white mb-3 drop-shadow-lg">
            CycleCast
          </h1>
           {/* App tagline */}
          <p className="font-['Inter:Regular',sans-serif] text-lg text-white/90 drop-shadow">
            Weather forecasts designed for cyclists
          </p>
        </div>

        {/* Search card */}
        <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl p-8 transform transition-all hover:scale-[1.02] duration-300">
          <div className="flex items-center justify-center gap-2 mb-6">
            <MapPin className="size-5 text-blue-600" />
            <p className="font-['Inter:Medium',sans-serif] font-medium text-xl text-gray-800">
              Find Your Location
            </p>
          </div>
          
          {/* Search form */}
          <form onSubmit={handleSearch} className="space-y-4">
             {/* Input field with search icon */}
            <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-gray-400 group-focus-within:text-blue-600 transition-colors" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Enter city..."
                className="bg-gray-50 border-2 border-gray-200 h-14 rounded-xl w-full pl-12 pr-4 font-['Inter:Regular',sans-serif] text-base text-gray-800 placeholder:text-gray-400 focus:outline-none focus:border-blue-500 focus:bg-white transition-all"
              />
            </div>
            
             {/* Submit button: Disabled when no search query is entered */}
            <button 
              type="submit"
              disabled={!searchQuery.trim()}
              className="w-full h-14 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-['Inter:Medium',sans-serif] font-medium text-lg rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <span>Get Weather Forecast</span>
            </button>
          </form>

          {/* App explanation*/}
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