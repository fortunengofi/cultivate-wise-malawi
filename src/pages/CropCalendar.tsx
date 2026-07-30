import { Link } from "react-router-dom";
import { Check, ArrowRight, Bell } from "lucide-react";
import { toast } from "sonner";
import PageHeader from "@/components/PageHeader";
import CropLocationPicker from "@/components/CropLocationPicker";
import { useFarm } from "@/contexts/FarmContext";

const CropCalendar = () => {
  const { timeline, crop } = useFarm();
  const { stages, current, next, progress, plan } = timeline;

  const remind = () => {
    const target = next ?? current;
    const key = "farmlink-reminders";
    const saved = JSON.parse(localStorage.getItem(key) || "[]");
    const entry = { crop, task: target.name, window: target.window };
    localStorage.setItem(key, JSON.stringify([...saved.filter((s: typeof entry) => !(s.crop === crop && s.task === target.name)), entry]));
    if ("Notification" in window && Notification.permission === "default") Notification.requestPermission();
    toast.success(`Reminder saved: ${target.name} for ${crop} (${target.window})`);
  };

  return (
    <div className="flex flex-col max-w-5xl mx-auto">
      <PageHeader title="Smart Crop Calendar" subtitle="Know what to do, and when" />

      <div className="px-4 sm:px-0 mt-6 space-y-6 pb-10">
        <CropLocationPicker showLocation={false} />

        <section className="bg-card rounded-xl p-5 shadow-card border border-border">
          <p className="text-2xl font-bold text-foreground font-serif">{plan.emoji} {crop}</p>
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
          <button onClick={remind} className="mt-4 w-full h-11 rounded-lg gradient-earth text-primary-foreground font-bold flex items-center justify-center gap-2">
            <Bell size={16} /> Remind me about this task
          </button>
        </section>

        <section>
          <h2 className="text-lg font-bold font-serif text-foreground mb-3">Farming timeline</h2>
          <div className="space-y-2">
            {stages.map((s) => (
              <div key={s.name} className={`rounded-xl p-4 border ${s.status === "current" ? "bg-primary/10 border-primary" : "bg-card border-border"}`}>
                <div className="flex items-start gap-3">
                  <div className={`w-7 h-7 shrink-0 rounded-full flex items-center justify-center text-xs font-bold ${s.status === "done" ? "bg-primary text-primary-foreground" : s.status === "current" ? "bg-secondary text-secondary-foreground" : "bg-muted text-muted-foreground"}`}>
                    {s.status === "done" ? <Check size={14} /> : s.status === "current" ? "→" : "○"}
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-foreground">{s.icon} {s.name}
                      {s.status === "current" && <span className="ml-2 text-xs font-bold text-secondary uppercase">Due now</span>}
                      {s.status === "upcoming" && <span className="ml-2 text-xs font-semibold text-muted-foreground uppercase">Upcoming</span>}
                    </p>
                    <p className="text-xs font-semibold text-muted-foreground">{s.window}</p>
                    <p className="text-sm text-muted-foreground mt-1 leading-relaxed">{s.advice}</p>
                  </div>
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
