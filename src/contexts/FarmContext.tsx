import { createContext, useContext, useEffect, useMemo, useState, ReactNode } from "react";
import { CROPS, LOCATIONS, getWeather, getFarmAlerts, getCropTimeline, getIrrigationAdvice, getMarketPrices, bestMarket, Moisture } from "@/services/farmData";

interface FarmCtx {
  crop: string;
  setCrop: (c: string) => void;
  locationId: string;
  setLocationId: (l: string) => void;
  moistureOverride?: Moisture;
  setMoistureOverride: (m?: Moisture) => void;
  weather: ReturnType<typeof getWeather>;
  alerts: ReturnType<typeof getFarmAlerts>;
  timeline: ReturnType<typeof getCropTimeline>;
  irrigation: ReturnType<typeof getIrrigationAdvice>;
  prices: ReturnType<typeof getMarketPrices>;
  best: ReturnType<typeof bestMarket>;
}

const Ctx = createContext<FarmCtx | undefined>(undefined);

export const FarmProvider = ({ children }: { children: ReactNode }) => {
  const [crop, setCropState] = useState<string>(() => localStorage.getItem("farmlink-crop") || "Maize");
  const [locationId, setLocState] = useState<string>(() => localStorage.getItem("farmlink-location") || "lilongwe");
  const [moistureOverride, setMoistureOverride] = useState<Moisture | undefined>(undefined);

  useEffect(() => { localStorage.setItem("farmlink-crop", crop); }, [crop]);
  useEffect(() => { localStorage.setItem("farmlink-location", locationId); }, [locationId]);

  const value = useMemo(() => {
    const safeCrop = CROPS.includes(crop) ? crop : "Maize";
    const safeLoc = LOCATIONS.some((l) => l.id === locationId) ? locationId : "lilongwe";
    const weather = getWeather(safeLoc);
    const prices = getMarketPrices(safeCrop);
    return {
      crop: safeCrop,
      setCrop: setCropState,
      locationId: safeLoc,
      setLocationId: setLocState,
      moistureOverride,
      setMoistureOverride,
      weather,
      alerts: getFarmAlerts(weather),
      timeline: getCropTimeline(safeCrop),
      irrigation: getIrrigationAdvice(weather, safeCrop, moistureOverride),
      prices,
      best: bestMarket(prices),
    };
  }, [crop, locationId, moistureOverride]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
};

export const useFarm = () => {
  const c = useContext(Ctx);
  if (!c) throw new Error("useFarm must be used within FarmProvider");
  return c;
};
