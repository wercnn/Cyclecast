import { createBrowserRouter } from "react-router";
import CitySelection from "./pages/CitySelection";
import WeatherDetails from "./pages/WeatherDetails";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: CitySelection,
  },
  {
    path: "/weather/:city",
    Component: WeatherDetails,
  },
]);
