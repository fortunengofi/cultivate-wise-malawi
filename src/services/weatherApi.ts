/**
 * REAL weather data for Farm Link.
 * Source: Open-Meteo (https://open-meteo.com) — free, no API key required.
 * Falls back to the offline estimate in farmData.ts when the network fails.
 */
import { Condition, DayForecast, LOCATIONS, SimSettings, WeatherData, getWeather } from "./farmData";

/** Real coordinates of every Malawi district headquarters. */
export const DISTRICT_COORDS: Record<string, { lat: number; lon: number }> = {
  chitipa: { lat: -9.702, lon: 33.27 },
  karonga: { lat: -9.933, lon: 33.933 },
  rumphi: { lat: -11.019, lon: 33.858 },
  mzimba: { lat: -11.9, lon: 33.6 },
  nkhatabay: { lat: -11.606, lon: 34.294 },
  likoma: { lat: -12.069, lon: 34.735 },
  kasungu: { lat: -13.033, lon: 33.483 },
  nkhotakota: { lat: -12.928, lon: 34.295 },
  ntchisi: { lat: -13.371, lon: 33.917 },
  dowa: { lat: -13.653, lon: 33.933 },
  salima: { lat: -13.783, lon: 34.457 },
  lilongwe: { lat: -13.983, lon: 33.783 },
  mchinji: { lat: -13.798, lon: 32.88 },
  dedza: { lat: -14.378, lon: 34.333 },
  ntcheu: { lat: -14.82, lon: 34.638 },
  balaka: { lat: -14.98, lon: 34.951 },
  machinga: { lat: -15.169, lon: 35.301 },
  mangochi: { lat: -14.478, lon: 35.264 },
  zomba: { lat: -15.386, lon: 35.319 },
  chiradzulu: { lat: -15.7, lon: 35.145 },
  blantyre: { lat: -15.786, lon: 35.006 },
  mwanza: { lat: -15.598, lon: 34.518 },
  neno: { lat: -15.398, lon: 34.653 },
  thyolo: { lat: -16.068, lon: 35.141 },
  mulanje: { lat: -16.03, lon: 35.508 },
  phalombe: { lat: -15.806, lon: 35.653 },
  chikwawa: { lat: -16.034, lon: 34.8 },
  nsanje: { lat: -16.92, lon: 35.262 },
};

/** WMO weather interpretation codes → app conditions. */
function codeToCondition(code: number): Condition {
  if (code === 0) return "Sunny";
  if (code === 1 || code === 2) return "Partly Cloudy";
  if (code === 3 || code === 45 || code === 48) return "Cloudy";
  if (code >= 95) return "Thunderstorms";
  if ([61, 63, 65, 80, 81, 82].includes(code)) return code === 65 || code === 82 ? "Heavy Rain" : "Light Rain";
  if ([51, 53, 55, 56, 57, 66, 67].includes(code)) return "Light Rain";
  if (code >= 71 && code <= 86) return "Heavy Rain";
  return "Partly Cloudy";
}

const DIRS = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
const dirFromDeg = (deg: number) => DIRS[Math.round((deg % 360) / 45) % 8];
const hhmm = (iso: string) => (iso?.includes("T") ? iso.split("T")[1].slice(0, 5) : "—");
const clamp = (n: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, n));

export interface LiveWeather extends WeatherData {
  source: "live" | "estimate";
  fetchedAt: string;
}

/** Fetch the real current conditions + 7-day forecast for a district. */
export async function fetchLiveWeather(locationId: string, sim?: SimSettings): Promise<LiveWeather> {
  const loc = LOCATIONS.find((l) => l.id === locationId) ?? LOCATIONS[0];
  const coords = DISTRICT_COORDS[loc.id] ?? DISTRICT_COORDS.lilongwe;
  const tempAdjust = sim?.enabled ? sim.tempAdjust : 0;
  const rainAdjust = sim?.enabled ? sim.rainAdjust : 0;

  const url =
    `https://api.open-meteo.com/v1/forecast?latitude=${coords.lat}&longitude=${coords.lon}` +
    `&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m,wind_direction_10m` +
    `&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,precipitation_sum,wind_speed_10m_max,sunrise,sunset` +
    `&past_days=7&forecast_days=7&timezone=Africa%2FBlantyre`;

  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`weather api ${res.status}`);
    const j = await res.json();
    const d = j.daily;
    const past = 7; // first 7 daily entries are the past week

    const forecast: DayForecast[] = d.time.slice(past, past + 7).map((iso: string, i: number) => {
      const k = past + i;
      const date = new Date(`${iso}T00:00:00`);
      const rainChance = clamp(Math.round(d.precipitation_probability_max?.[k] ?? 0) + rainAdjust, 0, 100);
      return {
        date: iso,
        label: i === 0 ? "Today" : date.toLocaleDateString("en-GB", { weekday: "short" }),
        condition: codeToCondition(d.weather_code[k]),
        tempMax: Math.round(d.temperature_2m_max[k]) + tempAdjust,
        tempMin: Math.round(d.temperature_2m_min[k]) + tempAdjust,
        humidity: clamp(Math.round(45 + rainChance * 0.45), 20, 100),
        rainChance,
        windKph: Math.round(d.wind_speed_10m_max?.[k] ?? 0),
      };
    });

    const rainLast7Days = Math.round(
      (d.precipitation_sum ?? []).slice(0, past).reduce((s: number, v: number) => s + (v || 0), 0),
    );

    const c = j.current;
    return {
      location: loc,
      current: {
        temp: Math.round(c.temperature_2m) + tempAdjust,
        condition: codeToCondition(c.weather_code),
        humidity: Math.round(c.relative_humidity_2m),
        windKph: Math.round(c.wind_speed_10m),
        windDir: dirFromDeg(c.wind_direction_10m ?? 0),
        rainChance: forecast[0]?.rainChance ?? 0,
        feelsLike: Math.round(c.apparent_temperature) + tempAdjust,
      },
      sunrise: hhmm(d.sunrise?.[past]),
      sunset: hhmm(d.sunset?.[past]),
      forecast,
      rainLast7Days: Math.max(0, rainLast7Days),
      source: "live",
      fetchedAt: new Date().toISOString(),
    };
  } catch {
    // Offline / API unreachable — keep the app usable with the local estimate.
    return { ...getWeather(locationId, sim), source: "estimate", fetchedAt: new Date().toISOString() };
  }
}