import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import PageHeader from "@/components/PageHeader";
import CropLocationPicker from "@/components/CropLocationPicker";
import SimulationControl from "@/components/SimulationControl";
import { useFarm } from "@/contexts/FarmContext";
import { Moisture, estimateMoisture, SoilType, IrrigationMethod } from "@/services/farmData";

const LEVELS: Moisture[] = ["Low", "Moderate", "Good"];
const SOILS: SoilType[] = ["Sandy", "Loam", "Clay"];
const METHODS: IrrigationMethod[] = ["Watering cans", "Treadle pump", "Motor pump / hose", "Drip kit", "Rain-fed only"];
const barColor = { Low: "bg-destructive", Moderate: "bg-secondary", Good: "bg-primary" } as const;
const toneBg = { good: "bg-primary/10 border-primary/40", warn: "bg-secondary/15 border-secondary/50", info: "bg-muted border-border" } as const;

const Irrigation = () => {
  const { weather, irrigation, crop, moistureOverride, setMoistureOverride, profile, setProfile } = useFarm();
  const auto = estimateMoisture(weather);
  const p = irrigation.plan;

  return (
    <div className="flex flex-col max-w-5xl mx-auto">
      <PageHeader title="Smart Irrigation Assistant" subtitle="Decision support for watering your field" />

      <div className="px-4 sm:px-0 mt-6 space-y-6 pb-10">
        <CropLocationPicker />

        <section className="bg-card rounded-xl p-5 shadow-card border border-border">
          <h2 className="text-sm font-bold uppercase tracking-wide text-muted-foreground">Irrigation status</h2>
          <div className="grid grid-cols-3 gap-3 mt-3">
            <div className="rounded-lg bg-muted/60 p-3">
              <p className="text-xs text-muted-foreground">Soil moisture</p>
              <p className="font-bold text-foreground">{irrigation.moisture}</p>
            </div>
            <div className="rounded-lg bg-muted/60 p-3">
              <p className="text-xs text-muted-foreground">Rain probability</p>
              <p className="font-bold text-foreground">{weather.current.rainChance}%</p>
            </div>
            <div className="rounded-lg bg-muted/60 p-3">
              <p className="text-xs text-muted-foreground">Temperature</p>
              <p className="font-bold text-foreground">{weather.current.temp}°C</p>
            </div>
          </div>

          <div className="mt-4">
            <div className="flex justify-between text-xs font-semibold text-muted-foreground mb-1">
              <span>Soil moisture indicator</span><span>{irrigation.moisture}</span>
            </div>
            <div className="h-3 rounded-full bg-muted overflow-hidden">
              <div className={`h-full ${barColor[irrigation.moisture]}`} style={{ width: irrigation.moisture === "Low" ? "25%" : irrigation.moisture === "Moderate" ? "60%" : "90%" }} />
            </div>
          </div>

          <div className={`mt-4 rounded-lg p-4 border ${toneBg[irrigation.tone]}`}>
            <p className="text-lg font-bold text-foreground">{irrigation.headline}</p>
            <p className="text-sm text-muted-foreground mt-1">{irrigation.action}</p>
          </div>

          <div className="mt-4">
            <p className="text-sm font-bold text-foreground">Why this advice?</p>
            <ul className="mt-1 space-y-1">
              {irrigation.reasons.map((r) => (
                <li key={r} className="text-sm text-muted-foreground flex gap-2"><span className="text-primary">•</span>{r}</li>
              ))}
            </ul>
          </div>
        </section>

        {/* Personalised watering plan */}
        <section className="bg-card rounded-xl p-5 shadow-card border border-border">
          <h2 className="font-bold text-foreground font-serif text-lg">Your watering plan</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Based on {crop} on {p.sizeHa} ha of {p.soil.toLowerCase()} soil in {weather.location.name}, using {p.method.toLowerCase()}.
          </p>
          {p.mm === 0 ? (
            <p className="mt-3 rounded-lg bg-primary/10 border border-primary/40 p-4 text-sm font-semibold text-foreground">{p.howMuch}</p>
          ) : (
            <>
              <div className="grid grid-cols-3 gap-3 mt-3">
                <div className="rounded-lg bg-muted/60 p-3">
                  <p className="text-xs text-muted-foreground">Apply</p>
                  <p className="font-bold text-foreground">{p.mm}mm</p>
                </div>
                <div className="rounded-lg bg-muted/60 p-3">
                  <p className="text-xs text-muted-foreground">Total water</p>
                  <p className="font-bold text-foreground">{p.litres.toLocaleString()}L</p>
                </div>
                <div className="rounded-lg bg-muted/60 p-3">
                  <p className="text-xs text-muted-foreground">How often</p>
                  <p className="font-bold text-foreground">{p.timesPerWeek}x / week</p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground mt-3">{p.howMuch}</p>
              <p className="text-sm text-muted-foreground">Best time to water: <strong className="text-foreground">{p.bestTime}</strong>.</p>
            </>
          )}
        </section>

        {/* Personalise */}
        <section className="bg-card rounded-xl p-5 border border-border shadow-soft space-y-4">
          <div>
            <p className="font-bold text-foreground">Make this advice yours</p>
            <p className="text-sm text-muted-foreground mt-1">Tell Farm Link about your field. Your answers are saved on this phone.</p>
          </div>

          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Soil type</p>
            <div className="grid grid-cols-4 gap-2 mt-2">
              {SOILS.map((s) => (
                <button key={s} onClick={() => setProfile({ ...profile, soil: s })}
                  className={`h-11 rounded-lg border font-semibold text-sm ${profile.soil === s ? "border-primary bg-primary/10 text-primary" : "border-border bg-card text-foreground"}`}>{s}</button>
              ))}
              <button onClick={() => setProfile({ ...profile, soil: undefined })}
                className={`h-11 rounded-lg border font-semibold text-xs ${!profile.soil ? "border-primary bg-primary/10 text-primary" : "border-border bg-card text-foreground"}`}>
                District ({weather.location.soil})
              </button>
            </div>
          </div>

          <label className="block">
            <span className="text-xs font-bold uppercase tracking-wide text-muted-foreground">How do you water?</span>
            <select value={profile.method ?? "Watering cans"} onChange={(e) => setProfile({ ...profile, method: e.target.value as IrrigationMethod })}
              className="mt-1 w-full h-11 rounded-lg border border-border bg-card px-3 text-base font-semibold text-foreground">
              {METHODS.map((m) => <option key={m} value={m}>{m}</option>)}
            </select>
          </label>

          <label className="block">
            <span className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Field size (hectares)</span>
            <input type="number" min={0.05} step={0.05} value={profile.fieldSizeHa ?? 0.4}
              onChange={(e) => setProfile({ ...profile, fieldSizeHa: Number(e.target.value) })}
              className="mt-1 w-full h-11 rounded-lg border border-border bg-card px-3 text-base font-semibold text-foreground" />
            <span className="text-xs text-muted-foreground">1 hectare is about 2.5 acres.</span>
          </label>
        </section>

        <section className="bg-card rounded-xl p-5 border border-border shadow-soft">
          <p className="font-bold text-foreground">Check your own soil</p>
          <p className="text-sm text-muted-foreground mt-1">Dig about 10cm and squeeze a handful of soil. Then tell Farm Link what you found — the advice updates.</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-3">
            {LEVELS.map((l) => (
              <button key={l} onClick={() => setMoistureOverride(l)}
                className={`h-11 rounded-lg border font-semibold text-sm ${moistureOverride === l ? "border-primary bg-primary/10 text-primary" : "border-border bg-card text-foreground"}`}>
                {l === "Low" ? "Dry / crumbles" : l === "Moderate" ? "Slightly damp" : "Moist / holds shape"}
              </button>
            ))}
            <button onClick={() => setMoistureOverride(undefined)}
              className={`h-11 rounded-lg border font-semibold text-sm ${!moistureOverride ? "border-primary bg-primary/10 text-primary" : "border-border bg-card text-foreground"}`}>
              Estimate for me ({auto})
            </button>
          </div>
        </section>

        <SimulationControl />

        <p className="text-xs text-muted-foreground">
          This is decision-support guidance for {crop} based on weather patterns and your input — not a replacement for advice from an extension officer or agronomist.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Link to="/weather" className="flex items-center justify-between bg-card rounded-xl p-4 border border-border shadow-soft">
            <span className="font-bold text-foreground">🌦️ 7-day forecast</span><ArrowRight size={18} className="text-primary" />
          </Link>
          <Link to="/agritech" className="flex items-center justify-between bg-card rounded-xl p-4 border border-border shadow-soft">
            <span className="font-bold text-foreground">🚜 Irrigation technologies</span><ArrowRight size={18} className="text-primary" />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Irrigation;
