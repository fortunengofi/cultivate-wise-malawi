import { createContext, useContext, useEffect, useMemo, useState, ReactNode } from "react";
import {
  CROPS, LOCATIONS, getWeather, getFarmAlerts, getCropTimeline, getIrrigationAdvice, getMarketPrices, bestMarket,
  Moisture, SimSettings, DEFAULT_SIM, simNow, IrrigationProfile,
} from "@/services/farmData";

interface FarmCtx {
  crop: string;
  setCrop: (c: string) => void;
  locationId: string;
  setLocationId: (l: string) => void;
  moistureOverride?: Moisture;
  setMoistureOverride: (m?: Moisture) => void;
  profile: IrrigationProfile;
  setProfile: (p: IrrigationProfile) => void;
  sim: SimSettings;
  setSim: (s: SimSettings) => void;
  today: Date;
  weather: ReturnType<typeof getWeather>;
  alerts: ReturnType<typeof getFarmAlerts>;
  timeline: ReturnType<typeof getCropTimeline>;
  irrigation: ReturnType<typeof getIrrigationAdvice>;
  prices: ReturnType<typeof getMarketPrices>;
  best: ReturnType<typeof bestMarket>;
}

const Ctx = createContext<FarmCtx | undefined>(undefined);

const loadProfile = (): IrrigationProfile => {
  try { return JSON.parse(localStorage.getItem("farmlink-irrigation-profile") || "{}"); } catch { return {}; }
};

export const FarmProvider = ({ children }: { children: ReactNode }) => {
  const [crop, setCropState] = useState<string>(() => localStorage.getItem("farmlink-crop") || "Maize");
  const [locationId, setLocState] = useState<string>(() => localStorage.getItem("farmlink-location") || "lilongwe");
  const [moistureOverride, setMoistureOverride] = useState<Moisture | undefined>(undefined);
  const [profile, setProfile] = useState<IrrigationProfile>(loadProfile);
  const [sim, setSim] = useState<SimSettings>(DEFAULT_SIM);

  useEffect(() => { localStorage.setItem("farmlink-crop", crop); }, [crop]);
  useEffect(() => { localStorage.setItem("farmlink-location", locationId); }, [locationId]);
  useEffect(() => { localStorage.setItem("farmlink-irrigation-profile", JSON.stringify(profile)); }, [profile]);

  const value = useMemo(() => {
    const safeCrop = CROPS.includes(crop) ? crop : "Maize";
    const safeLoc = LOCATIONS.some((l) => l.id === locationId) ? locationId : "lilongwe";
    const loc = LOCATIONS.find((l) => l.id === safeLoc)!;
    const weather = getWeather(safeLoc, sim);
    const today = simNow(sim);
    const prices = getMarketPrices(safeCrop);
    return {
      crop: safeCrop,
      setCrop: setCropState,
      locationId: safeLoc,
      setLocationId: setLocState,
      moistureOverride,
      setMoistureOverride,
      profile,
      setProfile,
      sim,
      setSim,
      today,
      weather,
      alerts: getFarmAlerts(weather),
      timeline: getCropTimeline(safeCrop, today, loc.shiftWeeks),
      irrigation: getIrrigationAdvice(weather, safeCrop, moistureOverride, profile),
      prices,
      best: bestMarket(prices),
    };
  }, [crop, locationId, moistureOverride, profile, sim]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
};

export const useFarm = () => {
  const c = useContext(Ctx);
  if (!c) throw new Error("useFarm must be used within FarmProvider");
  return c;
};
