import { useState } from "react";
import { Link } from "react-router-dom";
import { Check, ArrowRight, Bell, BellRing, Trash2 } from "lucide-react";
import { toast } from "sonner";
import PageHeader from "@/components/PageHeader";
import CropLocationPicker from "@/components/CropLocationPicker";
import SimulationControl from "@/components/SimulationControl";
import { useFarm } from "@/contexts/FarmContext";
import { useReminders } from "@/hooks/useReminders";
import { stageDueDate, StageStatus } from "@/services/farmData";

const fmt = (d: Date) => d.toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short", year: "numeric" });

const CropCalendar = () => {
  const { timeline, crop, weather, today } = useFarm();
  const { stages, current, next, progress, plan } = timeline;
  const district = weather.location;
  const { reminders, addReminder, removeReminder, permission, requestPermission, testNotification } = useReminders();
  const [busy, setBusy] = useState(false);

  const shiftText =
    district.shiftWeeks === 0
      ? "matches the national reference calendar"
      : `${Math.abs(district.shiftWeeks)} week${Math.abs(district.shiftWeeks) > 1 ? "s" : ""} ${district.shiftWeeks > 0 ? "later" : "earlier"} than the national reference calendar`;

  const remind = async (stage: StageStatus) => {
    setBusy(true);
    let perm = permission;
    if (perm === "default") perm = await requestPermission();
    const due = stageDueDate(stage, district.shiftWeeks, today);
    addReminder({ crop, task: stage.name, window: stage.window, dueAt: due.getTime() });
    setBusy(false);
    if (perm === "granted") toast.success(`Reminder set: ${stage.name} — ${fmt(due)}`);
    else if (perm === "denied") toast.warning(`Reminder saved for ${fmt(due)}, but phone notifications are blocked. You will still see it here.`);
    else toast.success(`Reminder saved: ${stage.name} — ${fmt(due)}`);
  };

  return (
    <div className="flex flex-col max-w-5xl mx-auto">
      <PageHeader title="Smart Crop Calendar" subtitle="Know what to do, and when — tuned to your district" />

      <div className="px-4 sm:px-0 mt-6 space-y-6 pb-10">
        <CropLocationPicker />

        <section className="bg-card rounded-xl p-5 shadow-card border border-border">
          <p className="text-2xl font-bold text-foreground font-serif">{plan.emoji} {crop}</p>
          <p className="text-sm text-muted-foreground mt-1">
            Tuned for <strong className="text-foreground">{district.name}</strong> ({district.region} Region) — this district {shiftText}. Typical soil: {district.soil.toLowerCase()}.
          </p>
          <div className="mt-3">
            <div className="flex justify-between text-xs font-semibold text-muted-foreground mb-1">
              <span>Season progress</span><span>{progress}%</span>
            </div>
            <div className="h-3 rounded-full bg-muted overflow-hidden">
              <div className="h-full gradient-earth rounded-full" style={{ width: `${progress}%` }} />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
            <div className="rounded-lg bg-primary/10 p-3">
              <p className="text-xs font-bold uppercase text-primary">Current stage</p>
              <p className="font-bold text-foreground">{current.icon} {current.name}</p>
              <p className="text-xs text-muted-foreground">{current.window}</p>
            </div>
            <div className="rounded-lg bg-muted/60 p-3">
              <p className="text-xs font-bold uppercase text-muted-foreground">Upcoming task</p>
              <p className="font-bold text-foreground">{next ? `${next.icon} ${next.name}` : "🌾 End of season — plan storage & sales"}</p>
              <p className="text-xs text-muted-foreground">{next ? next.window : "Prepare for the next cycle"}</p>
            </div>
          </div>
          <button disabled={busy} onClick={() => remind(next ?? current)} className="mt-4 w-full h-11 rounded-lg gradient-earth text-primary-foreground font-bold flex items-center justify-center gap-2 disabled:opacity-60">
            <Bell size={16} /> Remind me about this task
          </button>
        </section>

        {/* Reminders */}
        <section className="bg-card rounded-xl p-5 border border-border shadow-soft">
          <div className="flex items-center justify-between gap-3">
            <h2 className="font-bold text-foreground font-serif text-lg flex items-center gap-2"><BellRing size={18} className="text-primary" /> My reminders</h2>
            {permission === "granted" ? (
              <button onClick={() => { testNotification(); toast.success("Test notification sent"); }} className="text-xs font-bold text-primary">Send test</button>
            ) : permission === "unsupported" ? (
              <span className="text-xs text-muted-foreground">Not supported on this device</span>
            ) : (
              <button onClick={async () => { const p = await requestPermission(); toast[p === "granted" ? "success" : "warning"](p === "granted" ? "Notifications switched on" : "Notifications not allowed"); }} className="text-xs font-bold text-primary">
                Turn on notifications
              </button>
            )}
          </div>

          {reminders.length === 0 ? (
            <p className="text-sm text-muted-foreground mt-2">No reminders yet. Tap the bell on any farming stage below and Farm Link will alert you when it is time.</p>
          ) : (
            <ul className="mt-3 space-y-2">
              {reminders.sort((a, b) => a.dueAt - b.dueAt).map((r) => (
                <li key={r.id} className="flex items-start gap-3 rounded-lg bg-muted/60 p-3">
                  <span className="text-lg">{r.notified ? "🔔" : "⏰"}</span>
                  <div className="min-w-0 flex-1">
                    <p className="font-bold text-foreground text-sm">{r.crop} — {r.task}</p>
                    <p className="text-xs text-muted-foreground">{fmt(new Date(r.dueAt))}{r.notified ? " • alerted" : ""}</p>
                  </div>
                  <button onClick={() => { removeReminder(r.id); toast.success("Reminder removed"); }} aria-label={`Remove reminder for ${r.task}`} className="text-muted-foreground hover:text-destructive">
                    <Trash2 size={16} />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>

        <SimulationControl />

        <section>
          <h2 className="text-lg font-bold font-serif text-foreground mb-3">Farming timeline for {district.name}</h2>
          <div className="space-y-2">
            {stages.map((s) => (
              <div key={s.name} className={`rounded-xl p-4 border ${s.status === "current" ? "bg-primary/10 border-primary" : "bg-card border-border"}`}>
                <div className="flex items-start gap-3">
                  <div className={`w-7 h-7 shrink-0 rounded-full flex items-center justify-center text-xs font-bold ${s.status === "done" ? "bg-primary text-primary-foreground" : s.status === "current" ? "bg-secondary text-secondary-foreground" : "bg-muted text-muted-foreground"}`}>
                    {s.status === "done" ? <Check size={14} /> : s.status === "current" ? "→" : "○"}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-bold text-foreground">{s.icon} {s.name}
                      {s.status === "current" && <span className="ml-2 text-xs font-bold text-secondary uppercase">Due now</span>}
                      {s.status === "upcoming" && <span className="ml-2 text-xs font-semibold text-muted-foreground uppercase">Upcoming</span>}
                    </p>
                    <p className="text-xs font-semibold text-muted-foreground">{s.window}</p>
                    <p className="text-sm text-muted-foreground mt-1 leading-relaxed">{s.advice}</p>
                  </div>
                  <button disabled={busy} onClick={() => remind(s)} aria-label={`Remind me about ${s.name}`}
                    className="shrink-0 w-9 h-9 rounded-lg border border-border bg-card flex items-center justify-center text-primary disabled:opacity-60">
                    <Bell size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
          <p className="text-xs text-muted-foreground mt-3">{plan.note}</p>
        </section>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Link to="/weather" className="flex items-center justify-between bg-card rounded-xl p-4 border border-border shadow-soft">
            <span className="font-bold text-foreground">🌦️ Check the weather first</span><ArrowRight size={18} className="text-primary" />
          </Link>
          <Link to="/plan" className="flex items-center justify-between bg-card rounded-xl p-4 border border-border shadow-soft">
            <span className="font-bold text-foreground">🧭 Full plan for {crop}</span><ArrowRight size={18} className="text-primary" />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default CropCalendar;
