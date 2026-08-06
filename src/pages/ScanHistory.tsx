import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Search, Trash2, MapPin, Camera, Sprout, Bug, HeartPulse, CloudSun, RefreshCw, Sparkles } from "lucide-react";
import PageHeader from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { deleteScan, loadScans, markSynced, ScanRecord, subjectMeta } from "@/services/liveScan";
import { useFarm } from "@/contexts/FarmContext";

const ScanHistory = () => {
  const [scans, setScans] = useState<ScanRecord[]>([]);
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<"all" | "soil" | "crop" | "pest" | "livestock">("all");
  const [open, setOpen] = useState<string | null>(null);
  const { alerts, weather } = useFarm();

  useEffect(() => { setScans(loadScans()); }, []);

  const today = new Date().toDateString();
  const stats = useMemo(() => {
    const todays = scans.filter((s) => new Date(s.createdAt).toDateString() === today);
    const healthy = scans.filter((s) => Number((s.analysis.crop as any)?.health_score ?? 0) >= 75).length;
    const diseases = scans.filter((s) => s.subject === "pest" || (s.analysis.crop as any)?.disease).length;
    const livestock = scans.filter((s) => s.subject === "livestock").length;
    const treatments = scans.filter((s) => s.analysis.guidance?.treatment).length;
    return { todays: todays.length, healthy, diseases, livestock, treatments };
  }, [scans, today]);

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return scans.filter((s) => {
      if (filter !== "all" && s.subject !== filter) return false;
      if (!needle) return true;
      return JSON.stringify({ h: s.headline, a: s.analysis, c: s.conversation, d: s.createdAt }).toLowerCase().includes(needle);
    });
  }, [scans, q, filter]);

  const sync = () => {
    const pending = scans.filter((s) => !s.synced).map((s) => s.id);
    if (!navigator.onLine || !pending.length) return;
    setScans(markSynced(pending));
  };
  useEffect(() => {
    window.addEventListener("online", sync);
    return () => window.removeEventListener("online", sync);
  });

  const cards = [
    { icon: Camera, label: "Today's scans", value: stats.todays },
    { icon: Sprout, label: "Healthy crops", value: stats.healthy },
    { icon: Bug, label: "Diseases detected", value: stats.diseases },
    { icon: HeartPulse, label: "Livestock checks", value: stats.livestock },
  ];

  return (
    <div className="pb-24">
      <PageHeader title="Farm AI Dashboard" subtitle="Every scan, conversation and recommendation — saved on your phone">
        <Link to="/live">
          <Button className="mt-4 rounded-xl font-bold"><Sparkles size={16} className="mr-2" /> Open Live AI Scan</Button>
        </Link>
      </PageHeader>

      <div className="px-4 sm:px-8 mt-5 grid grid-cols-2 gap-3">
        {cards.map((c) => (
          <div key={c.label} className="rounded-2xl bg-card border border-border p-4 shadow-card">
            <c.icon size={18} className="text-primary" />
            <p className="text-2xl font-bold mt-2">{c.value}</p>
            <p className="text-[11px] text-muted-foreground">{c.label}</p>
          </div>
        ))}
      </div>

      <div className="px-4 sm:px-8 mt-3 space-y-3">
        <div className="rounded-2xl bg-card border border-border p-4 shadow-card">
          <p className="text-xs font-bold flex items-center gap-2"><CloudSun size={15} className="text-primary" /> Weather alerts</p>
          {alerts.length ? (
            <ul className="mt-2 space-y-1">
              {alerts.slice(0, 3).map((a, i) => (
                <li key={i} className="text-xs text-muted-foreground">• {a.title}: {a.body}</li>
              ))}
            </ul>
          ) : (
            <p className="text-xs text-muted-foreground mt-1">
              No alerts — {Math.round(weather.current.tempC)}°C in {weather.location.name}.
            </p>
          )}
        </div>
        <div className="rounded-2xl bg-card border border-border p-4 shadow-card">
          <p className="text-xs font-bold">🩺 Upcoming treatments</p>
          <p className="text-xs text-muted-foreground mt-1">
            {stats.treatments ? `${stats.treatments} saved scan${stats.treatments > 1 ? "s" : ""} include a treatment plan — open them below to follow the steps.` : "No treatment plans yet."}
          </p>
        </div>
      </div>

      <div className="px-4 sm:px-8 mt-5 space-y-3">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search scans, pests, crops, advice…" className="pl-9 rounded-xl" />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {(["all", "soil", "crop", "pest", "livestock"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`shrink-0 rounded-full px-3 py-1.5 text-[11px] font-bold capitalize ${filter === f ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}
            >
              {f}
            </button>
          ))}
          {scans.some((s) => !s.synced) && (
            <button onClick={sync} className="shrink-0 rounded-full px-3 py-1.5 text-[11px] font-bold bg-harvest/20 text-harvest flex items-center gap-1">
              <RefreshCw size={12} /> Sync pending
            </button>
          )}
        </div>

        {!filtered.length && <p className="text-xs text-muted-foreground py-6 text-center">No scans yet. Open the Live AI Scan and capture a snapshot.</p>}

        {filtered.map((s) => (
          <motion.div key={s.id} layout className="rounded-2xl bg-card border border-border overflow-hidden shadow-card">
            <button onClick={() => setOpen(open === s.id ? null : s.id)} className="w-full flex gap-3 p-3 text-left">
              {s.snapshot ? (
                <img src={s.snapshot} alt={s.headline} className="w-16 h-16 rounded-xl object-cover" />
              ) : (
                <div className="w-16 h-16 rounded-xl bg-muted flex items-center justify-center text-xl">{subjectMeta[s.subject].emoji}</div>
              )}
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold truncate">{subjectMeta[s.subject].emoji} {s.headline}</p>
                <p className="text-[11px] text-muted-foreground mt-0.5">{new Date(s.createdAt).toLocaleString()}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[10px] rounded-full bg-muted px-2 py-0.5 capitalize">{subjectMeta[s.subject].label}</span>
                  {s.location && (
                    <span className="text-[10px] text-muted-foreground flex items-center gap-0.5"><MapPin size={10} /> {s.location.lat}, {s.location.lon}</span>
                  )}
                  {!s.synced && <span className="text-[10px] text-harvest">pending sync</span>}
                </div>
              </div>
            </button>
            {open === s.id && (
              <div className="px-3 pb-3 space-y-2 border-t border-border pt-3">
                {["soil", "crop", "pest", "livestock"].map((k) => {
                  const section = (s.analysis as any)[k];
                  if (!section) return null;
                  return (
                    <div key={k} className="rounded-xl bg-muted/40 p-3">
                      <p className="text-[11px] font-bold capitalize text-primary">{k}</p>
                      {Object.entries(section).map(([kk, vv]) =>
                        vv ? (
                          <p key={kk} className="text-[11px] text-foreground/90">
                            <span className="text-muted-foreground capitalize">{kk.replace(/_/g, " ")}: </span>
                            {Array.isArray(vv) ? vv.join(", ") : String(vv)}
                          </p>
                        ) : null,
                      )}
                    </div>
                  );
                })}
                {s.analysis.guidance?.treatment && (
                  <div className="rounded-xl bg-muted/40 p-3">
                    <p className="text-[11px] font-bold text-primary">Treatment plan</p>
                    <p className="text-[11px]">{s.analysis.guidance.treatment}</p>
                  </div>
                )}
                {!!s.conversation.length && (
                  <div className="rounded-xl bg-muted/40 p-3 space-y-1">
                    <p className="text-[11px] font-bold text-primary">Voice conversation</p>
                    {s.conversation.map((t, i) => (
                      <p key={i} className="text-[11px]">
                        <span className="font-semibold">{t.role === "user" ? "You" : "AI"}: </span>{t.content}
                      </p>
                    ))}
                  </div>
                )}
                <Button
                  variant="outline" size="sm"
                  onClick={() => { setScans(deleteScan(s.id)); setOpen(null); }}
                  className="text-destructive rounded-xl"
                >
                  <Trash2 size={14} className="mr-1" /> Delete scan
                </Button>
              </div>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default ScanHistory;
