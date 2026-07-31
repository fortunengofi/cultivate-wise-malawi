import { useState } from "react";
import { FlaskConical, RotateCcw, ChevronDown } from "lucide-react";
import { useFarm } from "@/contexts/FarmContext";
import { DEFAULT_SIM } from "@/services/farmData";

const Slider = ({ label, value, min, max, step, suffix, onChange }: { label: string; value: number; min: number; max: number; step: number; suffix: string; onChange: (v: number) => void }) => (
  <label className="block">
    <span className="flex justify-between text-xs font-semibold text-muted-foreground">
      <span>{label}</span>
      <span className="text-foreground">{value > 0 ? "+" : ""}{value}{suffix}</span>
    </span>
    <input type="range" min={min} max={max} step={step} value={value} onChange={(e) => onChange(Number(e.target.value))}
      className="mt-1 w-full accent-primary" />
  </label>
);

const SimulationControl = () => {
  const { sim, setSim, today } = useFarm();
  const [open, setOpen] = useState(false);

  return (
    <section className="rounded-xl border border-border bg-card shadow-soft overflow-hidden">
      <button onClick={() => setOpen((o) => !o)} className="w-full flex items-center gap-2 p-4 text-left">
        <FlaskConical size={18} className="text-secondary shrink-0" />
        <span className="flex-1 min-w-0">
          <span className="block font-bold text-foreground text-sm">Live simulation</span>
          <span className="block text-xs text-muted-foreground truncate">
            {sim.enabled ? `Simulating ${today.toLocaleDateString("en-GB", { day: "numeric", month: "short" })} • ${sim.tempAdjust > 0 ? "+" : ""}${sim.tempAdjust}°C • ${sim.rainAdjust > 0 ? "+" : ""}${sim.rainAdjust}% rain` : "Try “what if” weather and dates"}
          </span>
        </span>
        {sim.enabled && <span className="text-[10px] font-bold uppercase bg-secondary/20 text-secondary px-2 py-0.5 rounded-full">On</span>}
        <ChevronDown size={16} className={`text-muted-foreground transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="px-4 pb-4 space-y-4 border-t border-border pt-4">
          <label className="flex items-center justify-between">
            <span className="text-sm font-bold text-foreground">Enable simulation</span>
            <input type="checkbox" checked={sim.enabled} onChange={(e) => setSim({ ...sim, enabled: e.target.checked })}
              className="w-5 h-5 accent-primary" />
          </label>

          <div className={sim.enabled ? "space-y-4" : "space-y-4 opacity-50 pointer-events-none"}>
            <Slider label="Move the date" value={sim.dayOffset} min={-90} max={180} step={1} suffix=" days" onChange={(v) => setSim({ ...sim, dayOffset: v })} />
            <Slider label="Temperature change" value={sim.tempAdjust} min={-10} max={10} step={1} suffix="°C" onChange={(v) => setSim({ ...sim, tempAdjust: v })} />
            <Slider label="Rain change" value={sim.rainAdjust} min={-60} max={60} step={5} suffix="%" onChange={(v) => setSim({ ...sim, rainAdjust: v })} />
            <button onClick={() => setSim(DEFAULT_SIM)} className="inline-flex items-center gap-2 text-sm font-bold text-primary">
              <RotateCcw size={14} /> Reset to real conditions
            </button>
          </div>

          <p className="text-xs text-muted-foreground">
            Simulation changes the weather, alerts, irrigation advice and crop calendar across the whole app so you can plan ahead. It does not change your saved records.
          </p>
        </div>
      )}
    </section>
  );
};

export default SimulationControl;
