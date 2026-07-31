/**
 * Farm Link data service layer.
 * -----------------------------------------------------------------
 * DEMO DATA: everything below is realistic Malawi-focused sample data.
 * Swap the `getWeather` / `getMarketPrices` implementations for real API
 * calls later — the returned shapes are what the UI depends on.
 */

export const IS_DEMO_DATA = true;

export interface Location {
  id: string;
  name: string;
  region: string;
  baseTemp: number;
  rainBias: number;
  /** Planting calendar shift in weeks vs. the national reference calendar (+ = later). */
  shiftWeeks: number;
  /** Typical dominant soil in the district — used to personalise irrigation guidance. */
  soil: SoilType;
}

export type SoilType = "Sandy" | "Loam" | "Clay";

/** All 28 districts of Malawi. */
export const LOCATIONS: Location[] = [
  // Northern Region
  { id: "chitipa", name: "Chitipa", region: "Northern", baseTemp: 22, rainBias: 0.5, shiftWeeks: 2, soil: "Loam" },
  { id: "karonga", name: "Karonga", region: "Northern", baseTemp: 31, rainBias: 0.28, shiftWeeks: -1, soil: "Sandy" },
  { id: "rumphi", name: "Rumphi", region: "Northern", baseTemp: 23, rainBias: 0.48, shiftWeeks: 2, soil: "Loam" },
  { id: "mzimba", name: "Mzimba (incl. Mzuzu)", region: "Northern", baseTemp: 23, rainBias: 0.5, shiftWeeks: 2, soil: "Loam" },
  { id: "nkhatabay", name: "Nkhata Bay", region: "Northern", baseTemp: 27, rainBias: 0.52, shiftWeeks: 0, soil: "Sandy" },
  { id: "likoma", name: "Likoma", region: "Northern", baseTemp: 28, rainBias: 0.4, shiftWeeks: 0, soil: "Sandy" },
  // Central Region
  { id: "kasungu", name: "Kasungu", region: "Central", baseTemp: 26, rainBias: 0.33, shiftWeeks: 1, soil: "Sandy" },
  { id: "nkhotakota", name: "Nkhotakota", region: "Central", baseTemp: 29, rainBias: 0.42, shiftWeeks: 0, soil: "Sandy" },
  { id: "ntchisi", name: "Ntchisi", region: "Central", baseTemp: 25, rainBias: 0.38, shiftWeeks: 1, soil: "Loam" },
  { id: "dowa", name: "Dowa", region: "Central", baseTemp: 24, rainBias: 0.36, shiftWeeks: 1, soil: "Loam" },
  { id: "salima", name: "Salima", region: "Central", baseTemp: 29, rainBias: 0.3, shiftWeeks: -1, soil: "Sandy" },
  { id: "lilongwe", name: "Lilongwe", region: "Central", baseTemp: 27, rainBias: 0.35, shiftWeeks: 0, soil: "Loam" },
  { id: "mchinji", name: "Mchinji", region: "Central", baseTemp: 26, rainBias: 0.36, shiftWeeks: 1, soil: "Loam" },
  { id: "dedza", name: "Dedza", region: "Central", baseTemp: 22, rainBias: 0.42, shiftWeeks: 2, soil: "Clay" },
  { id: "ntcheu", name: "Ntcheu", region: "Central", baseTemp: 22, rainBias: 0.4, shiftWeeks: 2, soil: "Clay" },
  // Southern Region
  { id: "balaka", name: "Balaka", region: "Southern", baseTemp: 29, rainBias: 0.24, shiftWeeks: -1, soil: "Sandy" },
  { id: "machinga", name: "Machinga", region: "Southern", baseTemp: 28, rainBias: 0.28, shiftWeeks: -1, soil: "Sandy" },
  { id: "mangochi", name: "Mangochi", region: "Southern", baseTemp: 30, rainBias: 0.22, shiftWeeks: -2, soil: "Sandy" },
  { id: "zomba", name: "Zomba", region: "Southern", baseTemp: 25, rainBias: 0.4, shiftWeeks: 0, soil: "Loam" },
  { id: "chiradzulu", name: "Chiradzulu", region: "Southern", baseTemp: 25, rainBias: 0.38, shiftWeeks: 0, soil: "Clay" },
  { id: "blantyre", name: "Blantyre", region: "Southern", baseTemp: 26, rainBias: 0.3, shiftWeeks: 0, soil: "Loam" },
  { id: "mwanza", name: "Mwanza", region: "Southern", baseTemp: 28, rainBias: 0.26, shiftWeeks: -1, soil: "Sandy" },
  { id: "neno", name: "Neno", region: "Southern", baseTemp: 26, rainBias: 0.3, shiftWeeks: 0, soil: "Loam" },
  { id: "thyolo", name: "Thyolo", region: "Southern", baseTemp: 24, rainBias: 0.45, shiftWeeks: 0, soil: "Clay" },
  { id: "mulanje", name: "Mulanje", region: "Southern", baseTemp: 25, rainBias: 0.5, shiftWeeks: 0, soil: "Clay" },
  { id: "phalombe", name: "Phalombe", region: "Southern", baseTemp: 27, rainBias: 0.34, shiftWeeks: -1, soil: "Loam" },
  { id: "chikwawa", name: "Chikwawa", region: "Southern", baseTemp: 33, rainBias: 0.2, shiftWeeks: -2, soil: "Clay" },
  { id: "nsanje", name: "Nsanje", region: "Southern", baseTemp: 34, rainBias: 0.18, shiftWeeks: -2, soil: "Clay" },
];

/** Live simulation controls — lets a farmer (or a demo) explore "what if" conditions. */
export interface SimSettings {
  enabled: boolean;
  dayOffset: number;   // shift the date forward/backward in days
  tempAdjust: number;  // °C added to every forecast day
  rainAdjust: number;  // percentage points added to rain chance
}

export const DEFAULT_SIM: SimSettings = { enabled: false, dayOffset: 0, tempAdjust: 0, rainAdjust: 0 };

export function simNow(sim?: SimSettings, base = new Date()) {
  if (!sim?.enabled || !sim.dayOffset) return base;
  return new Date(base.getTime() + sim.dayOffset * 86400000);
}

export type Condition = "Sunny" | "Partly Cloudy" | "Cloudy" | "Light Rain" | "Heavy Rain" | "Thunderstorms";

export interface DayForecast {
  date: string;      // ISO date
  label: string;     // Mon, Tue ...
  condition: Condition;
  tempMax: number;
  tempMin: number;
  humidity: number;
  rainChance: number; // 0-100
  windKph: number;
}

export interface WeatherData {
  location: Location;
  current: {
    temp: number;
    condition: Condition;
    humidity: number;
    windKph: number;
    windDir: string;
    rainChance: number;
    feelsLike: number;
  };
  sunrise: string;
  sunset: string;
  forecast: DayForecast[];
  rainLast7Days: number; // mm
}

// small deterministic pseudo-random so the demo is stable within a day
function seeded(seed: string) {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) { h ^= seed.charCodeAt(i); h = Math.imul(h, 16777619); }
  return () => { h += 0x6d2b79f5; let t = h; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}

const CONDITIONS: Condition[] = ["Sunny", "Partly Cloudy", "Cloudy", "Light Rain", "Heavy Rain", "Thunderstorms"];

/** Rainy season roughly Nov–Apr in Malawi. */
export function isRainySeason(d = new Date()) {
  const m = d.getMonth(); // 0-11
  return m >= 10 || m <= 3;
}

/** DEMO implementation — replace with a real weather API call. */
export function getWeather(locationId: string, sim?: SimSettings): WeatherData {
  const loc = LOCATIONS.find((l) => l.id === locationId) ?? LOCATIONS[0];
  const active = sim?.enabled ? sim : undefined;
  const today = simNow(active);
  const key = `${loc.id}-${today.toDateString()}`;
  const rnd = seeded(key);
  const rainy = isRainySeason(today);
  const rainBoost = rainy ? 0.35 : -0.1;

  const mkDay = (i: number): DayForecast => {
    const r1 = rnd(), r2 = rnd(), r3 = rnd();
    const rainChance = Math.max(0, Math.min(100, Math.round((loc.rainBias + rainBoost + (r1 - 0.5) * 0.5) * 100) + (active?.rainAdjust ?? 0)));
    let condition: Condition;
    if (rainChance > 75) condition = r2 > 0.6 ? "Thunderstorms" : "Heavy Rain";
    else if (rainChance > 50) condition = "Light Rain";
    else if (rainChance > 32) condition = "Cloudy";
    else if (rainChance > 16) condition = "Partly Cloudy";
    else condition = "Sunny";
    const tempMax = Math.round(loc.baseTemp + (rainy ? 1 : 2) + (r3 - 0.5) * 6) + (active?.tempAdjust ?? 0);
    const date = new Date(today.getTime() + i * 86400000);
    return {
      date: date.toISOString().slice(0, 10),
      label: i === 0 ? "Today" : date.toLocaleDateString("en-GB", { weekday: "short" }),
      condition,
      tempMax,
      tempMin: tempMax - Math.round(7 + r1 * 4),
      humidity: Math.round(45 + rainChance * 0.45 + r2 * 10),
      rainChance,
      windKph: Math.round(6 + r3 * 18),
    };
  };

  const forecast = Array.from({ length: 7 }, (_, i) => mkDay(i));
  const t0 = forecast[0];
  const rainLast7Days = Math.max(0, Math.round((rainy ? 30 : 4) + rnd() * (rainy ? 60 : 12) + (active?.rainAdjust ?? 0) * 0.5));

  return {
    location: loc,
    current: {
      temp: t0.tempMax - 1,
      condition: t0.condition,
      humidity: t0.humidity,
      windKph: t0.windKph,
      windDir: ["N", "NE", "E", "SE", "S", "SW", "W", "NW"][Math.floor(rnd() * 8)],
      rainChance: t0.rainChance,
      feelsLike: t0.tempMax + (t0.humidity > 70 ? 2 : 0),
    },
    sunrise: rainy ? "05:15" : "05:50",
    sunset: rainy ? "18:15" : "17:45",
    forecast,
    rainLast7Days,
  };
}

export interface FarmAlert { id: string; level: "info" | "warn" | "danger" | "good"; icon: string; title: string; body: string; }

export function getFarmAlerts(w: WeatherData): FarmAlert[] {
  const alerts: FarmAlert[] = [];
  const next3 = w.forecast.slice(1, 4);
  const heavy = next3.find((d) => d.condition === "Heavy Rain" || d.condition === "Thunderstorms");
  const maxTemp = Math.max(...w.forecast.slice(0, 3).map((d) => d.tempMax));
  const weekRain = w.forecast.reduce((s, d) => s + d.rainChance, 0) / w.forecast.length;

  if (heavy) alerts.push({ id: "rain", level: "warn", icon: "🌧️", title: `Heavy rain expected ${heavy.label}`, body: "Consider delaying irrigation and fertiliser application. Check drainage in your field so water does not stand around the roots." });
  if (weekRain < 25) alerts.push({ id: "dry", level: "warn", icon: "🏜️", title: "Low rainfall expected this week", body: "Monitor soil moisture, especially on sandy soils. Mulching helps keep moisture in the ground." });
  if (maxTemp >= 32) alerts.push({ id: "heat", level: "danger", icon: "🌡️", title: `High temperatures (up to ${maxTemp}°C)`, body: "Check crops for water stress — wilting leaves in the morning is a warning sign. Water early morning or late afternoon." });
  if (w.current.windKph >= 20) alerts.push({ id: "wind", level: "info", icon: "💨", title: "Windy conditions", body: "Avoid spraying pesticides today — the spray can drift away from the target crop." });
  if (weekRain >= 35 && weekRain <= 70 && maxTemp < 32) alerts.push({ id: "plant", level: "good", icon: "🌱", title: "Good conditions for planting", body: "Soil moisture and temperature look favourable. Plant with correct spacing and apply basal fertiliser at planting." });
  if (w.current.humidity > 80) alerts.push({ id: "fungal", level: "info", icon: "🍄", title: "High humidity — watch for disease", body: "Humid conditions favour fungal diseases and armyworm. Scout your field twice this week." });

  if (!alerts.length) alerts.push({ id: "ok", level: "good", icon: "✅", title: "No major weather risks", body: "Conditions look normal. Continue with your planned farm activities." });
  return alerts;
}

/* ----------------------------- MARKET PRICES ----------------------------- */

export interface MarketQuote { market: string; price: number; trend: "up" | "down" | "flat"; changePct: number; }
export interface CropPrices { crop: string; emoji: string; unit: string; quotes: MarketQuote[]; history: number[]; }

const MARKETS = ["Lilongwe", "Blantyre", "Mzuzu", "Zomba", "Mangochi"];

const BASE_PRICES: Record<string, { emoji: string; base: number; unit: string }> = {
  Maize: { emoji: "🌽", base: 900, unit: "kg" },
  Rice: { emoji: "🍚", base: 2200, unit: "kg" },
  Groundnuts: { emoji: "🥜", base: 2800, unit: "kg" },
  Beans: { emoji: "🫘", base: 2400, unit: "kg" },
  Tomatoes: { emoji: "🍅", base: 1100, unit: "kg" },
  Soybeans: { emoji: "🌱", base: 1500, unit: "kg" },
  Potatoes: { emoji: "🥔", base: 950, unit: "kg" },
};

export const CROPS = Object.keys(BASE_PRICES);

/** DEMO implementation — replace with a real market-price API/feed. */
export function getMarketPrices(crop: string): CropPrices {
  const meta = BASE_PRICES[crop] ?? BASE_PRICES.Maize;
  const rnd = seeded(`${crop}-${new Date().toDateString()}`);
  const quotes: MarketQuote[] = MARKETS.map((market) => {
    const delta = (rnd() - 0.45) * 0.18;
    const price = Math.round((meta.base * (1 + delta)) / 10) * 10;
    const changePct = Math.round((rnd() - 0.4) * 120) / 10;
    return { market, price, trend: changePct > 0.5 ? "up" : changePct < -0.5 ? "down" : "flat", changePct };
  });
  const history = Array.from({ length: 6 }, (_, i) => Math.round((meta.base * (0.88 + rnd() * 0.22) * (1 + i * 0.012)) / 10) * 10);
  return { crop, emoji: meta.emoji, unit: meta.unit, quotes, history };
}

export function bestMarket(p: CropPrices): MarketQuote {
  return p.quotes.reduce((a, b) => (b.price > a.price ? b : a));
}

export function getAllBestPrices() {
  return CROPS.map((c) => { const p = getMarketPrices(c); return { crop: c, emoji: p.emoji, unit: p.unit, best: bestMarket(p) }; });
}

/* ----------------------------- CROP CALENDAR ----------------------------- */

export interface CropStage { name: string; startMonth: number; endMonth: number; advice: string; icon: string; }
export interface CropPlan { crop: string; emoji: string; note: string; stages: CropStage[]; waterNeed: number; }

// months are 0-indexed (0 = Jan). Timings follow the main rain-fed season.
export const CROP_PLANS: Record<string, CropPlan> = {
  Maize: { crop: "Maize", emoji: "🌽", waterNeed: 1,
    note: "Timings follow the main rain-fed season. Dates shift by district — confirm with your local extension officer.",
    stages: [
      { name: "Land preparation", icon: "🚜", startMonth: 9, endMonth: 10, advice: "Clear and ridge the field before the first rains. Apply manure or compost while preparing." },
      { name: "Planting", icon: "🌱", startMonth: 10, endMonth: 11, advice: "Plant after the first effective rains (about 25mm). Spacing 75cm x 25cm, one seed per station." },
      { name: "Fertilizing (basal + top)", icon: "🧪", startMonth: 11, endMonth: 0, advice: "Basal NPK at planting; top-dress with Urea about 3-4 weeks after emergence, when soil is moist." },
      { name: "Weeding", icon: "🌿", startMonth: 11, endMonth: 1, advice: "First weeding within 2-3 weeks, second before tasselling. Weeds compete strongly for nitrogen." },
      { name: "Pest & disease monitoring", icon: "🐛", startMonth: 0, endMonth: 2, advice: "Scout weekly for fall armyworm in the funnel of the plant. Act early — hand-picking works on small plots." },
      { name: "Harvesting & drying", icon: "🌾", startMonth: 3, endMonth: 5, advice: "Harvest when husks are dry and grain is hard. Dry to about 13% moisture before storage to avoid aflatoxin." },
    ] },
  Rice: { crop: "Rice", emoji: "🍚", waterNeed: 1.5,
    note: "Suited to wetland/dambo and irrigation schemes such as Bwanje and Limphasa.",
    stages: [
      { name: "Nursery & land preparation", icon: "🚜", startMonth: 10, endMonth: 11, advice: "Prepare the nursery bed and puddle the main field. Level well so water spreads evenly." },
      { name: "Transplanting", icon: "🌱", startMonth: 11, endMonth: 0, advice: "Transplant 21-day-old seedlings, 20cm x 20cm, 2-3 seedlings per hill." },
      { name: "Fertilizing", icon: "🧪", startMonth: 0, endMonth: 1, advice: "Split nitrogen: at tillering and at panicle initiation. Drain slightly before applying." },
      { name: "Weeding & water control", icon: "🌿", startMonth: 0, endMonth: 2, advice: "Keep 3-5cm standing water. Weed twice before flowering." },
      { name: "Pest & disease monitoring", icon: "🐛", startMonth: 1, endMonth: 3, advice: "Watch for stem borers, rice blast and birds at grain filling." },
      { name: "Harvesting", icon: "🌾", startMonth: 3, endMonth: 4, advice: "Harvest when 80-85% of grains are golden. Dry on a clean surface, not bare soil." },
    ] },
  Groundnuts: { crop: "Groundnuts", emoji: "🥜", waterNeed: 0.8,
    note: "A good rotation crop with maize — it fixes nitrogen in the soil.",
    stages: [
      { name: "Land preparation", icon: "🚜", startMonth: 9, endMonth: 10, advice: "Prepare a fine, well-drained seedbed. Groundnuts do poorly in waterlogged soil." },
      { name: "Planting", icon: "🌱", startMonth: 10, endMonth: 11, advice: "Plant on ridges, 75cm x 10cm for CG7. Use certified, undamaged seed." },
      { name: "Soil fertility / gypsum", icon: "🧪", startMonth: 11, endMonth: 0, advice: "Little nitrogen needed. Apply gypsum at flowering on sandy soils to improve pod filling." },
      { name: "Weeding", icon: "🌿", startMonth: 11, endMonth: 1, advice: "Weed early; stop deep weeding once pegs enter the soil to avoid damaging pods." },
      { name: "Pest & disease monitoring", icon: "🐛", startMonth: 0, endMonth: 2, advice: "Look for leaf spot and rosette disease. Remove and destroy affected plants early." },
      { name: "Harvesting & drying", icon: "🌾", startMonth: 3, endMonth: 4, advice: "Lift when inner shell shows dark veins. Dry pods well to prevent aflatoxin." },
    ] },
  Beans: { crop: "Beans", emoji: "🫘", waterNeed: 0.9,
    note: "Short season crop — can be grown in the rains and again in dimba gardens.",
    stages: [
      { name: "Land preparation", icon: "🚜", startMonth: 10, endMonth: 11, advice: "Prepare a well-drained seedbed with compost worked in." },
      { name: "Planting", icon: "🌱", startMonth: 11, endMonth: 11, advice: "Plant 50cm between rows, 10cm within rows. Do not plant too deep." },
      { name: "Fertilizing", icon: "🧪", startMonth: 11, endMonth: 0, advice: "Small basal dose is enough; beans fix their own nitrogen." },
      { name: "Weeding", icon: "🌿", startMonth: 0, endMonth: 0, advice: "Keep clean in the first 4 weeks — beans are weak competitors." },
      { name: "Pest & disease monitoring", icon: "🐛", startMonth: 0, endMonth: 1, advice: "Watch for aphids and bean fly. Rotate fields between seasons." },
      { name: "Harvesting", icon: "🌾", startMonth: 2, endMonth: 3, advice: "Harvest when pods are dry and rattle. Thresh gently to avoid cracked grain." },
    ] },
  Tomatoes: { crop: "Tomatoes", emoji: "🍅", waterNeed: 1.6,
    note: "Mostly grown under irrigation (dimba) in the dry season, when prices are best.",
    stages: [
      { name: "Nursery", icon: "🌱", startMonth: 3, endMonth: 4, advice: "Raise seedlings in a shaded nursery bed for 3-4 weeks." },
      { name: "Land preparation & transplanting", icon: "🚜", startMonth: 4, endMonth: 5, advice: "Transplant in the evening, 60cm x 45cm, and water immediately." },
      { name: "Fertilizing & staking", icon: "🧪", startMonth: 5, endMonth: 6, advice: "Top-dress after establishment; stake plants to keep fruit off the ground." },
      { name: "Weeding & irrigation", icon: "💧", startMonth: 5, endMonth: 7, advice: "Water regularly and evenly — irregular watering causes fruit cracking and blossom-end rot." },
      { name: "Pest & disease monitoring", icon: "🐛", startMonth: 6, endMonth: 8, advice: "Scout for tuta absoluta, whitefly and blight. Remove infected leaves from the field." },
      { name: "Harvesting", icon: "🌾", startMonth: 7, endMonth: 9, advice: "Pick at breaker stage for market. Handle gently and transport in crates, not sacks." },
    ] },
  Soybeans: { crop: "Soybeans", emoji: "🌱", waterNeed: 0.9,
    note: "Strong demand from processors; also improves soil for the next maize crop.",
    stages: [
      { name: "Land preparation", icon: "🚜", startMonth: 9, endMonth: 10, advice: "Prepare a firm, weed-free seedbed." },
      { name: "Planting & inoculation", icon: "🌱", startMonth: 10, endMonth: 11, advice: "Inoculate seed with rhizobium before planting; 50cm rows, 5cm within row." },
      { name: "Fertilizing", icon: "🧪", startMonth: 11, endMonth: 11, advice: "Apply phosphorus at planting. Avoid heavy nitrogen." },
      { name: "Weeding", icon: "🌿", startMonth: 11, endMonth: 0, advice: "Two weedings before flowering keep yields high." },
      { name: "Pest & disease monitoring", icon: "🐛", startMonth: 0, endMonth: 2, advice: "Watch for rust and pod-sucking bugs at pod filling." },
      { name: "Harvesting", icon: "🌾", startMonth: 3, endMonth: 4, advice: "Harvest when leaves drop and pods are brown; avoid shattering losses." },
    ] },
  Potatoes: { crop: "Potatoes", emoji: "🥔", waterNeed: 1.3,
    note: "Common in the highlands (Dedza, Ntcheu, Nyika areas) and under irrigation.",
    stages: [
      { name: "Land preparation", icon: "🚜", startMonth: 9, endMonth: 10, advice: "Deep, loose ridges give better tuber formation." },
      { name: "Planting", icon: "🌱", startMonth: 10, endMonth: 11, advice: "Use clean sprouted seed tubers, 75cm x 30cm." },
      { name: "Fertilizing & earthing up", icon: "🧪", startMonth: 11, endMonth: 0, advice: "Earth up twice to cover tubers and stop greening." },
      { name: "Weeding", icon: "🌿", startMonth: 11, endMonth: 0, advice: "Weed with earthing up to save labour." },
      { name: "Pest & disease monitoring", icon: "🐛", startMonth: 0, endMonth: 1, advice: "Late blight is the main risk in wet weather. Remove infected haulms." },
      { name: "Harvesting", icon: "🌾", startMonth: 1, endMonth: 3, advice: "Harvest 2 weeks after haulms die back; cure tubers in shade before storage." },
    ] },
};

export interface StageStatus extends CropStage { status: "done" | "current" | "upcoming"; window: string; }

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function inWindow(month: number, start: number, end: number) {
  return start <= end ? month >= start && month <= end : month >= start || month <= end;
}

function shiftLabel(month: number, shiftWeeks: number, edge: "start" | "end") {
  const m = MONTHS[((month % 12) + 12) % 12];
  if (shiftWeeks >= 2) return `${edge === "start" ? "mid" : "late"} ${m}`;
  if (shiftWeeks <= -2) return `${edge === "start" ? "early" : "mid"} ${m}`;
  return m;
}

export function getCropTimeline(crop: string, now = new Date(), shiftWeeks = 0) {
  const plan = CROP_PLANS[crop] ?? CROP_PLANS.Maize;
  // A district that plants later effectively "runs behind" the national calendar.
  const adjusted = new Date(now.getTime() - shiftWeeks * 7 * 86400000);
  const m = adjusted.getMonth();
  let currentIdx = plan.stages.findIndex((s) => inWindow(m, s.startMonth, s.endMonth));
  if (currentIdx === -1) {
    // between cycles: the next stage that starts soonest
    const gaps = plan.stages.map((s, i) => ({ i, d: (s.startMonth - m + 12) % 12 }));
    currentIdx = gaps.sort((a, b) => a.d - b.d)[0].i;
  }
  const stages: StageStatus[] = plan.stages.map((s, i) => ({
    ...s,
    status: i < currentIdx ? "done" : i === currentIdx ? "current" : "upcoming",
    window: `${shiftLabel(s.startMonth, shiftWeeks, "start")} – ${shiftLabel(s.endMonth, shiftWeeks, "end")}`,
  }));
  const progress = Math.round(((currentIdx + 0.5) / plan.stages.length) * 100);
  return { plan, stages, current: stages[currentIdx], next: stages[currentIdx + 1], progress, shiftWeeks };
}

/* --------------------------- IRRIGATION ASSISTANT -------------------------- */

export type Moisture = "Low" | "Moderate" | "Good";

export interface IrrigationResult {
  moisture: Moisture;
  score: number;
  action: string;
  headline: string;
  tone: "good" | "warn" | "info";
  reasons: string[];
}

export function estimateMoisture(w: WeatherData): Moisture {
  const recent = w.rainLast7Days;
  if (recent > 35) return "Good";
  if (recent > 12) return "Moderate";
  return "Low";
}

export type IrrigationMethod = "Watering cans" | "Treadle pump" | "Motor pump / hose" | "Drip kit" | "Rain-fed only";

export interface IrrigationProfile {
  soil?: SoilType;
  method?: IrrigationMethod;
  fieldSizeHa?: number;
}

/** Litres per hectare per mm of water applied. */
const MM_TO_LITRES_PER_HA = 10000;

export function getIrrigationAdvice(
  w: WeatherData,
  crop: string,
  moistureOverride?: Moisture,
  profile: IrrigationProfile = {},
): IrrigationResult {
  const plan = CROP_PLANS[crop] ?? CROP_PLANS.Maize;
  const moisture = moistureOverride ?? estimateMoisture(w);
  const rainSoon = Math.max(w.current.rainChance, w.forecast[1]?.rainChance ?? 0);
  const temp = w.current.temp;
  const soil = profile.soil ?? w.location.soil;
  const method = profile.method ?? "Watering cans";
  const sizeHa = profile.fieldSizeHa && profile.fieldSizeHa > 0 ? profile.fieldSizeHa : 0.4;

  let score = 0;
  const reasons: string[] = [];

  if (moisture === "Low") { score += 3; reasons.push(`Soil moisture is low (about ${w.rainLast7Days}mm of rain in the last 7 days).`); }
  else if (moisture === "Moderate") { score += 1; reasons.push("Soil moisture is moderate — the topsoil may be drying out."); }
  else { score -= 2; reasons.push("Soil moisture looks good after recent rainfall."); }

  if (rainSoon >= 60) { score -= 3; reasons.push(`Rain is likely soon (${rainSoon}% chance) — natural watering is expected.`); }
  else if (rainSoon >= 35) { score -= 1; reasons.push(`Some chance of rain (${rainSoon}%).`); }
  else { score += 1; reasons.push(`Little rain expected (${rainSoon}% chance).`); }

  if (temp >= 31) { score += 2; reasons.push(`High temperature (${temp}°C) increases water loss from soil and leaves.`); }
  else if (temp <= 22) { score -= 1; reasons.push(`Cooler temperature (${temp}°C) means slower water loss.`); }

  if (plan.waterNeed >= 1.3) { score += 1; reasons.push(`${plan.crop} is a thirsty crop and needs steady watering.`); }
  else if (plan.waterNeed < 0.9) { score -= 1; reasons.push(`${plan.crop} tolerates drier conditions than most crops.`); }

  if (soil === "Sandy") { score += 1; reasons.push("Sandy soil drains fast — it needs smaller amounts of water, more often."); }
  else if (soil === "Clay") { score -= 1; reasons.push("Clay soil holds water longer — avoid over-watering or the roots will suffocate."); }
  else reasons.push("Loam soil holds moisture well — water deeply but less often.");

  if (method === "Rain-fed only") reasons.push("You depend on rainfall, so focus on mulching and ridging to keep the water you already have.");
  else if (method === "Drip kit") reasons.push("With a drip kit you can apply water slowly and lose very little to evaporation.");

  let headline: string, action: string, tone: IrrigationResult["tone"];
  if (score >= 4) { headline = "💧 Irrigation recommended today"; action = "Water in the early morning or late afternoon to reduce evaporation."; tone = "warn"; }
  else if (score >= 2) { headline = "🌤️ Light irrigation may help"; action = "Check the soil at about 10cm depth. If it is dry in your hand, apply a light watering."; tone = "info"; }
  else { headline = "✅ Irrigation may not be necessary today"; action = "Soil moisture and expected rain look sufficient. Check again tomorrow."; tone = "good"; }

  // Personalised water plan
  const baseMm = score >= 4 ? 20 : score >= 2 ? 10 : 0;
  const soilFactor = soil === "Sandy" ? 0.8 : soil === "Clay" ? 1.2 : 1;
  const mm = Math.round(baseMm * plan.waterNeed * soilFactor);
  const litres = Math.round(mm * MM_TO_LITRES_PER_HA * sizeHa);
  const cansPerRound = Math.round(litres / 20);
  const timesPerWeek = mm === 0 ? 0 : soil === "Sandy" ? 3 : soil === "Clay" ? 1 : 2;
  const bestTime = temp >= 30 ? "05:00 – 07:00 or after 16:30" : "early morning";
  const plans: Record<IrrigationMethod, string> = {
    "Watering cans": `About ${cansPerRound.toLocaleString()} cans (20L) per round on ${sizeHa} ha.`,
    "Treadle pump": `About ${Math.max(1, Math.round(litres / 3000))} hour(s) of pumping per round.`,
    "Motor pump / hose": `About ${Math.max(1, Math.round(litres / 12000))} hour(s) of pumping per round.`,
    "Drip kit": `Run the drip lines about ${Math.max(1, Math.round(litres / 4000))} hour(s) per round.`,
    "Rain-fed only": "No irrigation equipment — mulch heavily and make box ridges to trap the rain.",
  };

  return {
    moisture, score, action, headline, tone, reasons,
    plan: mm === 0
      ? { mm, litres: 0, timesPerWeek: 0, bestTime, method, soil, sizeHa, howMuch: "Hold off watering for now and re-check tomorrow." }
      : { mm, litres, timesPerWeek, bestTime, method, soil, sizeHa, howMuch: plans[method] },
  };
}
