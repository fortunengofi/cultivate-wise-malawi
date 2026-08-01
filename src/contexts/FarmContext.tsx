import { createContext, useContext, useEffect, useMemo, useState, ReactNode } from "react";
import {
  CROPS, LOCATIONS, getWeather, getFarmAlerts, getCropTimeline, getIrrigationAdvice, bestMarket,
  Moisture, SimSettings, DEFAULT_SIM, simNow, IrrigationProfile,
} from "@/services/farmData";
import { fetchLiveWeather, LiveWeather } from "@/services/weatherApi";
import { fetchMarketRows, pricesForCrop, MarketPriceRow, LivePrices } from "@/services/marketApi";

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
  weather: LiveWeather;
  weatherLoading: boolean;
  alerts: ReturnType<typeof getFarmAlerts>;
  timeline: ReturnType<typeof getCropTimeline>;
  irrigation: ReturnType<typeof getIrrigationAdvice>;
  prices: LivePrices;
  pricesLoading: boolean;
  marketRows: MarketPriceRow[];
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
  const [liveWeather, setLiveWeather] = useState<LiveWeather | null>(null);
  const [weatherLoading, setWeatherLoading] = useState(true);
  const [marketRows, setMarketRows] = useState<MarketPriceRow[]>([]);
  const [pricesLoading, setPricesLoading] = useState(true);

  useEffect(() => { localStorage.setItem("farmlink-crop", crop); }, [crop]);
  useEffect(() => { localStorage.setItem("farmlink-location", locationId); }, [locationId]);
  useEffect(() => { localStorage.setItem("farmlink-irrigation-profile", JSON.stringify(profile)); }, [profile]);

  // Real weather from Open-Meteo for the selected district.
  useEffect(() => {
    let cancelled = false;
    setWeatherLoading(true);
    fetchLiveWeather(locationId, sim).then((w) => {
      if (!cancelled) { setLiveWeather(w); setWeatherLoading(false); }
    });
    return () => { cancelled = true; };
  }, [locationId, sim.enabled, sim.tempAdjust, sim.rainAdjust]);

  // Real market price records from the backend.
  useEffect(() => {
    let cancelled = false;
    fetchMarketRows().then((rows) => {
      if (!cancelled) { setMarketRows(rows); setPricesLoading(false); }
    });
    return () => { cancelled = true; };
  }, []);

  const value = useMemo(() => {
    const safeCrop = CROPS.includes(crop) ? crop : "Maize";
    const safeLoc = LOCATIONS.some((l) => l.id === locationId) ? locationId : "lilongwe";
    const loc = LOCATIONS.find((l) => l.id === safeLoc)!;
    const weather: LiveWeather =
      liveWeather && liveWeather.location.id === safeLoc
        ? liveWeather
        : { ...getWeather(safeLoc, sim), source: "estimate", fetchedAt: new Date().toISOString() };
    const today = simNow(sim);
    const prices = pricesForCrop(safeCrop, marketRows);
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
      weatherLoading,
      alerts: getFarmAlerts(weather),
      timeline: getCropTimeline(safeCrop, today, loc.shiftWeeks),
      irrigation: getIrrigationAdvice(weather, safeCrop, moistureOverride, profile),
      prices,
      pricesLoading,
      marketRows,
      best: bestMarket(prices),
    };
  }, [crop, locationId, moistureOverride, profile, sim, liveWeather, weatherLoading, marketRows, pricesLoading]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
};

export const useFarm = () => {
  const c = useContext(Ctx);
  if (!c) throw new Error("useFarm must be used within FarmProvider");
  return c;
};
