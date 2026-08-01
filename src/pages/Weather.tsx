import { Link } from "react-router-dom";
import { Droplets, Wind, Sunrise, Sunset, CloudRain, ArrowRight } from "lucide-react";
import PageHeader from "@/components/PageHeader";
import CropLocationPicker from "@/components/CropLocationPicker";
import DemoBadge from "@/components/DemoBadge";
import SimulationControl from "@/components/SimulationControl";
import { useFarm } from "@/contexts/FarmContext";
import { Condition } from "@/services/farmData";

export const conditionIcon = (c: Condition) =>
  ({ Sunny: "☀️", "Partly Cloudy": "⛅", Cloudy: "☁️", "Light Rain": "🌦️", "Heavy Rain": "🌧️", Thunderstorms: "⛈️" }[c]);

const toneClass = {
  good: "bg-primary/10 border-primary/30",
  info: "bg-muted border-border",
  warn: "bg-secondary/15 border-secondary/40",
  danger: "bg-destructive/10 border-destructive/30",
} as const;

const Weather = () => {
  const { weather, alerts, weatherLoading } = useFarm();
  const { current, forecast, location } = weather;

  return (
    <div className="flex flex-col max-w-5xl mx-auto">
      <PageHeader title="Weather & Farming Alerts" subtitle="Plan your week around the weather" />

      <div className="px-4 sm:px-0 mt-6 space-y-6 pb-10">
        <CropLocationPicker showCrop={false} />

        <SimulationControl />

        {/* Current conditions */}
        <section className="bg-card rounded-xl p-5 shadow-card border border-border">
          <div className="flex items-center justify-between">
            <p className="font-bold text-foreground">{location.name} <span className="text-muted-foreground font-medium text-sm">• {location.region} Region</span></p>
            {weatherLoading ? (
              <DemoBadge label="Updating…" />
            ) : weather.source === "live" ? (
              <DemoBadge label="Live • Open-Meteo" />
            ) : (
              <DemoBadge label="Offline estimate" />
            )}
          </div>
          <div className="flex items-center gap-4 mt-3">
            <div className="text-5xl">{conditionIcon(current.condition)}</div>
            <div>
              <p className="text-4xl font-bold text-foreground">{current.temp}°C</p>
              <p className="text-sm text-muted-foreground font-medium">{current.condition} • feels like {current.feelsLike}°C</p>
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
            <div className="rounded-lg bg-muted/60 p-3">
              <p className="text-xs text-muted-foreground flex items-center gap-1"><Droplets size={13} /> Humidity</p>
              <p className="font-bold text-foreground">{current.humidity}%</p>
            </div>
            <div className="rounded-lg bg-muted/60 p-3">
              <p className="text-xs text-muted-foreground flex items-center gap-1"><CloudRain size={13} /> Rain chance</p>
              <p className="font-bold text-foreground">{current.rainChance}%</p>
            </div>
            <div className="rounded-lg bg-muted/60 p-3">
              <p className="text-xs text-muted-foreground flex items-center gap-1"><Wind size={13} /> Wind</p>
              <p className="font-bold text-foreground">{current.windKph} km/h {current.windDir}</p>
            </div>
            <div className="rounded-lg bg-muted/60 p-3">
              <p className="text-xs text-muted-foreground flex items-center gap-1"><Sunrise size={13} /> Sun</p>
              <p className="font-bold text-foreground text-sm">{weather.sunrise} <Sunset size={12} className="inline" /> {weather.sunset}</p>
            </div>
          </div>
        </section>

        {/* Forecast */}
        <section>
          <h2 className="text-lg font-bold font-serif text-foreground mb-3">7-Day Forecast</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
            {forecast.map((d) => (
              <div key={d.date} className="bg-card rounded-xl p-3 border border-border shadow-soft text-center">
                <p className="text-xs font-bold text-muted-foreground uppercase">{d.label}</p>
                <div className="text-2xl my-1">{conditionIcon(d.condition)}</div>
                <p className="text-sm font-bold text-foreground">{d.tempMax}° <span className="text-muted-foreground font-medium">{d.tempMin}°</span></p>
                <p className="text-xs text-sky-foreground/80 text-primary font-semibold mt-1">💧 {d.rainChance}%</p>
              </div>
            ))}
          </div>
        </section>

        {/* Alerts */}
        <section>
          <h2 className="text-lg font-bold font-serif text-foreground mb-3">Farming Alerts</h2>
          <div className="space-y-3">
            {alerts.map((a) => (
              <div key={a.id} className={`rounded-xl p-4 border ${toneClass[a.level]}`}>
                <p className="font-bold text-foreground flex items-start gap-2"><span className="text-lg leading-none">{a.icon}</span> {a.title}</p>
                <p className="text-sm text-muted-foreground mt-1 leading-relaxed">{a.body}</p>
              </div>
            ))}
          </div>
        </section>

        <Link to="/irrigation" className="flex items-center justify-between bg-card rounded-xl p-4 border border-border shadow-soft">
          <span className="font-bold text-foreground">💧 See irrigation guidance for your crop</span>
          <ArrowRight size={18} className="text-primary" />
        </Link>
      </div>
    </div>
  );
};

export default Weather;
