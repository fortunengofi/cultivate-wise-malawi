import { useCallback, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  Play, Pause, Camera as CameraIcon, RefreshCw, Zap, ZapOff, Mic, MicOff, X,
  ChevronUp, ChevronDown, AlertTriangle, Sparkles, History, WifiOff, Volume2, Plus, Minus, Square,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { useLiveVoice, VoiceLang, langLabels } from "@/hooks/useLiveVoice";
import {
  Detection, FrameAnalysis, ScanRecord, VoiceTurn, offlineEstimate, saveScan, subjectMeta,
} from "@/services/liveScan";

const statusColor = (s?: string) =>
  s === "bad" ? "border-destructive text-destructive" : s === "warn" ? "border-harvest text-harvest" : "border-primary text-primary";
const statusDot = (s?: string) => (s === "bad" ? "🔴" : s === "warn" ? "🟡" : "🟢");

const Row = ({ label, value }: { label: string; value?: unknown }) =>
  value === undefined || value === null || value === "" ? null : (
    <div className="flex justify-between gap-3 py-1.5 border-b border-border/50 last:border-0">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="text-xs font-semibold text-foreground text-right max-w-[60%]">{String(value)}</span>
    </div>
  );

const Bullets = ({ title, items }: { title: string; items?: string[] }) =>
  !items?.length ? null : (
    <div className="space-y-1">
      <p className="text-xs font-bold text-primary">{title}</p>
      <ul className="space-y-1">
        {items.map((i, k) => (
          <li key={k} className="text-xs text-foreground/90 flex gap-2">
            <span className="text-primary">•</span>
            <span>{i}</span>
          </li>
        ))}
      </ul>
    </div>
  );

const LiveScan = () => {
  const navigate = useNavigate();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const busyRef = useRef(false);
  const lastSpokenRef = useRef("");

  const [ready, setReady] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [facing, setFacing] = useState<"environment" | "user">("environment");
  const [torch, setTorch] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [zoomRange, setZoomRange] = useState<{ min: number; max: number } | null>(null);
  const [analysis, setAnalysis] = useState<FrameAnalysis | null>(null);
  const [thinking, setThinking] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(true);
  const [tab, setTab] = useState<"analysis" | "advice" | "guide" | "talk">("analysis");
  const [lang, setLang] = useState<VoiceLang>(() => ((localStorage.getItem("farmlink-voice-lang") as VoiceLang) || "en"));
  const [turns, setTurns] = useState<VoiceTurn[]>([]);
  const [autoSpeak, setAutoSpeak] = useState(true);
  const [online, setOnline] = useState(navigator.onLine);
  const [snapshot, setSnapshot] = useState<string | null>(null);

  const voice = useLiveVoice(lang);

  useEffect(() => { localStorage.setItem("farmlink-voice-lang", lang); }, [lang]);
  useEffect(() => {
    const up = () => setOnline(navigator.onLine);
    window.addEventListener("online", up);
    window.addEventListener("offline", up);
    return () => { window.removeEventListener("online", up); window.removeEventListener("offline", up); };
  }, []);

  /* ---------- camera ---------- */
  const startCamera = useCallback(async (mode: "environment" | "user") => {
    try {
      streamRef.current?.getTracks().forEach((t) => t.stop());
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: mode }, width: { ideal: 1280 }, height: { ideal: 720 }, frameRate: { ideal: 30 } },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play().catch(() => {});
      }
      const caps = (stream.getVideoTracks()[0]?.getCapabilities?.() ?? {}) as any;
      setZoomRange(caps.zoom ? { min: caps.zoom.min ?? 1, max: caps.zoom.max ?? 3 } : null);
      setZoom(1);
      setTorch(false);
      setReady(true);
    } catch {
      setReady(false);
      toast({ title: "Camera unavailable", description: "Allow camera access to use the live scanner.", variant: "destructive" });
    }
  }, []);

  useEffect(() => {
    startCamera(facing);
    return () => streamRef.current?.getTracks().forEach((t) => t.stop());
  }, [facing, startCamera]);

  const applyTrack = async (constraint: Record<string, unknown>) => {
    const track = streamRef.current?.getVideoTracks()[0];
    if (!track) return false;
    try { await track.applyConstraints({ advanced: [constraint] } as MediaTrackConstraints); return true; }
    catch { return false; }
  };

  const toggleTorch = async () => {
    const next = !torch;
    const ok = await applyTrack({ torch: next });
    if (!ok) { toast({ title: "Flashlight not supported on this device" }); return; }
    setTorch(next);
  };

  const changeZoom = async (dir: 1 | -1) => {
    if (!zoomRange) { toast({ title: "Zoom not supported on this device" }); return; }
    const step = (zoomRange.max - zoomRange.min) / 5;
    const next = Math.min(zoomRange.max, Math.max(zoomRange.min, zoom + dir * step));
    if (await applyTrack({ zoom: next })) setZoom(next);
  };

  /* ---------- frames ---------- */
  const grabFrame = (maxW = 640): { dataUrl: string; canvas: HTMLCanvasElement } | null => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas || !video.videoWidth) return null;
    const scale = Math.min(1, maxW / video.videoWidth);
    canvas.width = Math.round(video.videoWidth * scale);
    canvas.height = Math.round(video.videoHeight * scale);
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    return { dataUrl: canvas.toDataURL("image/jpeg", 0.7), canvas };
  };

  const analyseFrame = useCallback(async () => {
    if (busyRef.current) return;
    const frame = grabFrame();
    if (!frame) return;
    busyRef.current = true;
    setThinking(true);
    try {
      if (!navigator.onLine) {
        setAnalysis(offlineEstimate(frame.canvas));
        return;
      }
      const { data, error } = await supabase.functions.invoke("farm-live", {
        body: { mode: "frame", imageBase64: frame.dataUrl, lang },
      });
      if (error || data?.error) {
        const msg = data?.error || "Live analysis failed";
        setAnalysis(offlineEstimate(frame.canvas));
        toast({ title: "AI busy", description: msg, variant: "destructive" });
        return;
      }
      const result = data.data as FrameAnalysis;
      setAnalysis(result);
      if (autoSpeak && result.spoken && result.spoken !== lastSpokenRef.current && !voice.listening) {
        lastSpokenRef.current = result.spoken;
        voice.speak(result.spoken);
      }
    } finally {
      busyRef.current = false;
      setThinking(false);
    }
  }, [autoSpeak, lang, voice]);

  useEffect(() => {
    if (!scanning || !ready) return;
    analyseFrame();
    const id = setInterval(analyseFrame, 5000);
    return () => clearInterval(id);
  }, [scanning, ready, analyseFrame]);

  /* ---------- snapshot / save ---------- */
  const captureSnapshot = async () => {
    const frame = grabFrame(900);
    if (!frame) return;
    setSnapshot(frame.dataUrl);
    let location: ScanRecord["location"] = null;
    try {
      location = await new Promise((resolve) => {
        if (!navigator.geolocation) return resolve(null);
        navigator.geolocation.getCurrentPosition(
          (p) => resolve({ lat: +p.coords.latitude.toFixed(4), lon: +p.coords.longitude.toFixed(4) }),
          () => resolve(null),
          { timeout: 4000 },
        );
      });
    } catch { location = null; }

    const current = analysis ?? offlineEstimate(frame.canvas);
    saveScan({
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      subject: current.subject ?? "unknown",
      headline: current.headline ?? "Scan saved",
      snapshot: frame.dataUrl,
      analysis: current,
      conversation: turns,
      location,
      synced: navigator.onLine,
    });
    toast({ title: "Snapshot saved to Farm History" });
    setTimeout(() => setSnapshot(null), 900);
  };

  /* ---------- voice ---------- */
  const ask = async (question: string) => {
    const history = [...turns, { role: "user" as const, content: question }];
    setTurns(history);
    setTab("talk");
    setSheetOpen(true);
    if (!navigator.onLine) {
      const offlineReply = "I am offline right now. Save this scan and I will give full advice once you have internet.";
      setTurns([...history, { role: "assistant", content: offlineReply }]);
      voice.speak(offlineReply);
      return;
    }
    setThinking(true);
    const { data, error } = await supabase.functions.invoke("farm-live", {
      body: { mode: "chat", question, lang, history: turns, context: analysis },
    });
    setThinking(false);
    const reply = error || data?.error ? data?.error || "I could not reach the assistant. Try again." : (data.reply as string);
    setTurns([...history, { role: "assistant", content: reply }]);
    voice.speak(reply);
  };

  const micPress = () => {
    if (voice.speaking) { voice.stopSpeaking(); return; }
    if (voice.listening) { voice.stopListening(); return; }
    if (!voice.supported) {
      toast({ title: "Voice not supported", description: "This browser cannot listen. Type in the Talk tab instead.", variant: "destructive" });
      setTab("talk"); setSheetOpen(true);
      return;
    }
    voice.startListening((text) => ask(text));
  };

  const detections: Detection[] = analysis?.detections ?? [];
  const alertLevel = analysis?.alert?.level;
  const meta = subjectMeta[analysis?.subject ?? "unknown"];

  return (
    <div className="fixed inset-0 z-50 bg-black text-white overflow-hidden">
      {/* video */}
      <video ref={videoRef} playsInline muted autoPlay className="absolute inset-0 w-full h-full object-cover" />
      <canvas ref={canvasRef} className="hidden" />
      {!ready && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-black/80 px-8 text-center">
          <CameraIcon size={40} className="text-primary animate-pulse" />
          <p className="text-sm text-white/80">Starting camera… allow access when your phone asks.</p>
          <Button variant="secondary" onClick={() => startCamera(facing)}>Retry</Button>
        </div>
      )}

      {/* bounding boxes */}
      <AnimatePresence>
        {scanning && detections.map((d, i) => {
          const [x, y, w, h] = d.box ?? [0.15, 0.2, 0.7, 0.55];
          return (
            <motion.div
              key={`${d.label}-${i}`}
              initial={{ opacity: 0, scale: 0.94 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              className={`absolute rounded-2xl border-2 ${statusColor(d.status)} shadow-[0_0_25px_rgba(0,0,0,0.35)]`}
              style={{ left: `${x * 100}%`, top: `${y * 100}%`, width: `${w * 100}%`, height: `${h * 100}%` }}
            >
              <span className="absolute -top-8 left-0 whitespace-nowrap rounded-full bg-black/70 backdrop-blur-md px-3 py-1 text-[11px] font-bold text-white">
                {statusDot(d.status)} {d.label} ({Math.round(d.confidence)}%)
              </span>
            </motion.div>
          );
        })}
      </AnimatePresence>

      {/* scan sweep */}
      {scanning && (
        <motion.div
          className="pointer-events-none absolute left-0 right-0 h-24 bg-gradient-to-b from-transparent via-primary/25 to-transparent"
          animate={{ top: ["8%", "72%", "8%"] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        />
      )}

      {/* top bar */}
      <div className="absolute top-0 left-0 right-0 flex items-center gap-2 p-3 pt-4 bg-gradient-to-b from-black/70 to-transparent">
        <button onClick={() => navigate(-1)} className="rounded-full bg-white/15 backdrop-blur-md p-2"><X size={18} /></button>
        <div className="flex-1">
          <p className="text-sm font-bold flex items-center gap-1.5">
            <Sparkles size={14} className="text-primary" /> Live Farm AI
          </p>
          <p className="text-[11px] text-white/70">
            {online ? (thinking ? "Analysing frame…" : scanning ? `Scanning • ${meta.label}` : "Ready") : "Offline mode — basic on-device analysis"}
          </p>
        </div>
        {!online && <WifiOff size={16} className="text-harvest" />}
        <select
          value={lang}
          onChange={(e) => setLang(e.target.value as VoiceLang)}
          className="rounded-full bg-white/15 backdrop-blur-md px-3 py-1.5 text-[11px] font-semibold outline-none"
        >
          {(Object.keys(langLabels) as VoiceLang[]).map((l) => (
            <option key={l} value={l} className="text-black">{langLabels[l]}</option>
          ))}
        </select>
        <button onClick={() => navigate("/history")} className="rounded-full bg-white/15 backdrop-blur-md p-2"><History size={18} /></button>
      </div>

      {/* emergency alert */}
      <AnimatePresence>
        {alertLevel && alertLevel !== "none" && (
          <motion.div
            initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className={`absolute top-20 left-3 right-3 rounded-2xl p-3 backdrop-blur-md border ${
              alertLevel === "urgent" ? "bg-destructive/85 border-destructive" : "bg-harvest/80 border-harvest"
            }`}
          >
            <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide">
              <AlertTriangle size={14} /> {alertLevel === "urgent" ? "Urgent action needed" : "Watch closely"}
            </p>
            <p className="text-xs mt-1">{analysis?.alert?.message}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* headline chip */}
      {analysis?.headline && (
        <div className="absolute left-3 right-3 bottom-[calc(env(safe-area-inset-bottom)+15.5rem)] rounded-2xl bg-black/55 backdrop-blur-md px-4 py-2.5">
          <p className="text-xs font-semibold">{meta.emoji} {analysis.headline}</p>
        </div>
      )}

      {/* side controls */}
      <div className="absolute right-3 top-1/2 -translate-y-1/2 flex flex-col gap-2">
        <button onClick={() => setFacing(facing === "environment" ? "user" : "environment")} className="rounded-full bg-white/15 backdrop-blur-md p-3"><RefreshCw size={18} /></button>
        <button onClick={toggleTorch} className="rounded-full bg-white/15 backdrop-blur-md p-3">{torch ? <Zap size={18} className="text-harvest" /> : <ZapOff size={18} />}</button>
        <button onClick={() => changeZoom(1)} className="rounded-full bg-white/15 backdrop-blur-md p-3"><Plus size={18} /></button>
        <button onClick={() => changeZoom(-1)} className="rounded-full bg-white/15 backdrop-blur-md p-3"><Minus size={18} /></button>
        <button onClick={() => setAutoSpeak(!autoSpeak)} className={`rounded-full backdrop-blur-md p-3 ${autoSpeak ? "bg-primary/80" : "bg-white/15"}`}><Volume2 size={18} /></button>
      </div>

      {/* snapshot flash */}
      <AnimatePresence>
        {snapshot && <motion.div initial={{ opacity: 0.9 }} animate={{ opacity: 0 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-white" />}
      </AnimatePresence>

      {/* bottom sheet */}
      <motion.div
        animate={{ y: sheetOpen ? 0 : "calc(100% - 8.5rem)" }}
        transition={{ type: "spring", stiffness: 260, damping: 30 }}
        className="absolute left-0 right-0 bottom-0 max-h-[68vh] rounded-t-3xl bg-background/92 backdrop-blur-xl text-foreground border-t border-border shadow-2xl flex flex-col"
      >
        <button onClick={() => setSheetOpen(!sheetOpen)} className="flex items-center justify-center gap-1 py-2 text-xs text-muted-foreground">
          {sheetOpen ? <ChevronDown size={16} /> : <ChevronUp size={16} />} {sheetOpen ? "Hide" : "AI recommendations"}
        </button>

        {/* controls */}
        <div className="flex items-center justify-center gap-3 px-4 pb-3">
          <Button
            onClick={() => setScanning(!scanning)}
            className={`flex-1 h-12 rounded-2xl font-bold ${scanning ? "bg-destructive hover:bg-destructive/90" : ""}`}
          >
            {scanning ? <><Pause size={18} className="mr-2" /> Pause scan</> : <><Play size={18} className="mr-2" /> Start live scan</>}
          </Button>
          <button onClick={captureSnapshot} className="h-12 w-12 rounded-2xl border-2 border-primary flex items-center justify-center"><CameraIcon size={20} className="text-primary" /></button>
          <button
            onClick={micPress}
            className={`h-12 w-12 rounded-2xl flex items-center justify-center text-primary-foreground ${
              voice.listening ? "bg-destructive animate-pulse" : voice.speaking ? "bg-harvest" : "bg-primary"
            }`}
          >
            {voice.listening ? <MicOff size={20} /> : voice.speaking ? <Square size={18} /> : <Mic size={20} />}
          </button>
        </div>
        {(voice.listening || voice.transcript) && (
          <p className="px-5 pb-2 text-xs text-muted-foreground italic truncate">
            {voice.listening ? "Listening… " : ""}{voice.transcript}
          </p>
        )}

        {/* tabs */}
        <div className="flex gap-1 px-4">
          {(["analysis", "advice", "guide", "talk"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex-1 rounded-xl py-2 text-[11px] font-bold capitalize ${tab === t ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}
            >
              {t === "talk" ? "Talk to AI" : t}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4 pb-[calc(env(safe-area-inset-bottom)+1rem)]">
          {tab === "analysis" && (
            <>
              {!analysis && <p className="text-xs text-muted-foreground">Press “Start live scan” and point the camera at soil, a crop, a pest or an animal. The AI works out what it is looking at on its own.</p>}
              {analysis?.soil && (
                <div>
                  <p className="text-sm font-bold mb-1">🪱 Soil analysis</p>
                  <Row label="Soil type" value={analysis.soil.soil_type} />
                  <Row label="Texture" value={analysis.soil.texture} />
                  <Row label="Moisture" value={analysis.soil.moisture} />
                  <Row label="Organic matter" value={analysis.soil.organic_matter} />
                  <Row label="Colour" value={analysis.soil.color} />
                  <Row label="pH estimate" value={analysis.soil.ph_estimate} />
                  <Row label="Fertility" value={analysis.soil.fertility} />
                  <Row label="Soil health" value={analysis.soil.health} />
                </div>
              )}
              {analysis?.crop && (
                <div>
                  <p className="text-sm font-bold mb-1">🌱 Crop analysis</p>
                  <Row label="Crop" value={analysis.crop.crop} />
                  <Row label="Health score" value={analysis.crop.health_score ? `${analysis.crop.health_score}%` : ""} />
                  <Row label="Growth stage" value={analysis.crop.growth_stage} />
                  <Row label="Nutrient deficiency" value={analysis.crop.nutrient_deficiency} />
                  <Row label="Disease" value={analysis.crop.disease} />
                  <Row label="Water stress" value={analysis.crop.water_stress} />
                  <Row label="Weeds" value={analysis.crop.weeds} />
                </div>
              )}
              {analysis?.pest && (
                <div>
                  <p className="text-sm font-bold mb-1">🐛 Pest / disease</p>
                  <Row label="Name" value={(analysis.pest as any).name} />
                  <Row label="Confidence" value={(analysis.pest as any).confidence ? `${(analysis.pest as any).confidence}%` : ""} />
                  <Row label="Severity" value={(analysis.pest as any).severity} />
                  <Row label="Affected crops" value={(analysis.pest as any).affected_crops?.join?.(", ")} />
                  <Row label="Treatment" value={(analysis.pest as any).treatment} />
                </div>
              )}
              {analysis?.livestock && (
                <div>
                  <p className="text-sm font-bold mb-1">🐐 Livestock health</p>
                  <Row label="Animal" value={analysis.livestock.animal} />
                  <Row label="Body condition" value={analysis.livestock.body_condition} />
                  <Row label="Wounds" value={analysis.livestock.wounds} />
                  <Row label="Skin disease" value={analysis.livestock.skin_disease} />
                  <Row label="Parasites" value={analysis.livestock.parasites} />
                  <Row label="Weight estimate" value={analysis.livestock.weight_estimate} />
                  <Row label="Hydration" value={analysis.livestock.hydration} />
                  <Row label="Behaviour" value={analysis.livestock.behaviour} />
                  <Row label="General health" value={analysis.livestock.health} />
                </div>
              )}
            </>
          )}

          {tab === "advice" && (
            <>
              {!analysis?.recommendations && <p className="text-xs text-muted-foreground">Recommendations appear here as soon as the camera detects something.</p>}
              <Bullets title="Fertilizer" items={analysis?.recommendations?.fertilizer} />
              <Bullets title="Irrigation" items={analysis?.recommendations?.irrigation} />
              <Bullets title="Organic solutions" items={analysis?.recommendations?.organic} />
              <Bullets title="Chemical treatments" items={analysis?.recommendations?.chemical} />
              <Bullets title="Preventive measures" items={analysis?.recommendations?.prevention} />
            </>
          )}

          {tab === "guide" && (
            <>
              {!analysis?.guidance && <p className="text-xs text-muted-foreground">When a disease, pest or health problem is detected, a full step-by-step guide shows here.</p>}
              {analysis?.guidance && (
                <div className="space-y-2">
                  {[
                    ["Problem", analysis.guidance.problem],
                    ["Cause", analysis.guidance.cause],
                    ["Severity", analysis.guidance.severity],
                    ["Recommended treatment", analysis.guidance.treatment],
                    ["Organic solution", analysis.guidance.organic_solution],
                    ["Chemical solution", analysis.guidance.chemical_solution],
                    ["Safety precautions", analysis.guidance.safety],
                    ["Prevention tips", analysis.guidance.prevention],
                    ["Estimated recovery time", analysis.guidance.recovery_time],
                  ].map(([k, v]) =>
                    v ? (
                      <div key={k as string} className="rounded-xl bg-muted/50 p-3">
                        <p className="text-[11px] font-bold text-primary uppercase tracking-wide">{k}</p>
                        <p className="text-xs mt-0.5">{v as string}</p>
                      </div>
                    ) : null,
                  )}
                </div>
              )}
            </>
          )}

          {tab === "talk" && (
            <div className="space-y-3">
              {!turns.length && (
                <p className="text-xs text-muted-foreground">
                  Tap the microphone and just talk — try “Is this maize healthy?” or “What pesticide should I use?”. The AI remembers what you discussed and what the camera saw.
                </p>
              )}
              {turns.map((t, i) => (
                <div key={i} className={t.role === "user" ? "text-right" : ""}>
                  <span
                    className={`inline-block max-w-[85%] rounded-2xl px-3 py-2 text-xs ${
                      t.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted text-foreground"
                    }`}
                  >
                    {t.content}
                  </span>
                </div>
              ))}
              {thinking && <p className="text-xs text-muted-foreground animate-pulse">Thinking…</p>}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const input = (e.currentTarget.elements.namedItem("q") as HTMLInputElement);
                  if (input.value.trim()) { ask(input.value.trim()); input.value = ""; }
                }}
                className="flex gap-2 pt-1"
              >
                <input name="q" placeholder="Or type your question…" className="flex-1 rounded-xl border border-border bg-background px-3 py-2 text-xs outline-none" />
                <Button type="submit" size="sm" className="rounded-xl">Ask</Button>
              </form>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default LiveScan;
