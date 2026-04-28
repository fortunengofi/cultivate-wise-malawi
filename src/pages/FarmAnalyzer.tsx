import { useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Leaf, Bug, Stethoscope, Camera, Upload, Loader2, Sprout, Droplets, ThermometerSun, Mountain, X, CheckCircle, AlertTriangle, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import PageHeader from "@/components/PageHeader";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface Tutorial {
  title: string;
  summary: string;
  steps: { title: string; detail: string }[];
}

const soilTypes = [
  { value: "red-laterite", label: "Red Laterite" },
  { value: "sandy-loam", label: "Sandy Loam" },
  { value: "clay", label: "Clay Soil" },
  { value: "alluvial", label: "Alluvial" },
  { value: "volcanic", label: "Volcanic Ash" },
  { value: "black-cotton", label: "Black Cotton" },
];
const moistureLevels = [
  { value: "dry", label: "Dry" },
  { value: "moderate", label: "Moderate" },
  { value: "wet", label: "Wet / Waterlogged" },
];
const seasons = [
  { value: "rainy", label: "Rainy Season (Nov-Apr)" },
  { value: "cool-dry", label: "Cool Dry Season (May-Jul)" },
  { value: "hot-dry", label: "Hot Dry Season (Aug-Oct)" },
];
const animals = ["Chicken", "Goat", "Cattle", "Pig", "Sheep", "Other"];

function readAsBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

const TutorialCard = ({ tutorial }: { tutorial: Tutorial }) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    className="bg-card border border-primary/20 rounded-xl p-4 shadow-card space-y-3"
  >
    <div className="flex items-center gap-2">
      <BookOpen size={18} className="text-primary" />
      <h3 className="font-bold text-foreground">{tutorial.title}</h3>
    </div>
    {tutorial.summary && <p className="text-sm text-muted-foreground">{tutorial.summary}</p>}
    <ol className="space-y-2">
      {tutorial.steps?.map((s, i) => (
        <li key={i} className="bg-muted/40 rounded-lg p-3">
          <div className="flex gap-3">
            <span className="shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center">{i + 1}</span>
            <div>
              <p className="font-semibold text-sm text-foreground">{s.title}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{s.detail}</p>
            </div>
          </div>
        </li>
      ))}
    </ol>
  </motion.div>
);

const PhotoPicker = ({ preview, onPick, onClear, label }: { preview: string | null; onPick: (b64: string) => void; onClear: () => void; label: string }) => {
  const ref = useRef<HTMLInputElement>(null);
  const handle = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (!f.type.startsWith("image/")) { toast({ title: "Invalid file", description: "Please pick an image", variant: "destructive" }); return; }
    if (f.size > 5 * 1024 * 1024) { toast({ title: "Too large", description: "Max 5MB image", variant: "destructive" }); return; }
    onPick(await readAsBase64(f));
  };
  return (
    <div>
      <input ref={ref} type="file" accept="image/*" capture="environment" onChange={handle} className="hidden" />
      {!preview ? (
        <Button variant="outline" onClick={() => ref.current?.click()} className="w-full h-24 border-dashed border-2 border-primary/30 flex-col gap-1">
          <Camera size={22} className="text-primary" />
          <span className="text-xs">{label}</span>
        </Button>
      ) : (
        <div className="relative rounded-lg overflow-hidden">
          <img src={preview} alt="upload" className="w-full h-48 object-cover" />
          <button onClick={() => { onClear(); if (ref.current) ref.current.value = ""; }} className="absolute top-2 right-2 bg-background/80 rounded-full p-1">
            <X size={16} />
          </button>
        </div>
      )}
    </div>
  );
};

/* ---------- SOIL TAB ---------- */
const SoilTab = () => {
  const [preview, setPreview] = useState<string | null>(null);
  const [detection, setDetection] = useState<any>(null);
  const [soilType, setSoilType] = useState("");
  const [moisture, setMoisture] = useState("");
  const [season, setSeason] = useState("");
  const [detecting, setDetecting] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<{ recommendations: any[]; tutorial: Tutorial | null } | null>(null);

  const detect = async (b64: string) => {
    setPreview(b64); setDetecting(true); setDetection(null);
    const { data, error } = await supabase.functions.invoke("analyze-farm", { body: { mode: "soil-detect", imageBase64: b64 } });
    setDetecting(false);
    if (error || data?.error) { toast({ title: "Error", description: data?.error || "Failed to analyze", variant: "destructive" }); return; }
    setDetection(data.data);
    if (data.data?.detected_soil_type) setSoilType(data.data.detected_soil_type);
    toast({ title: "Soil detected 🌍", description: data.data?.soil_description || "" });
  };

  const analyze = async () => {
    if (!soilType || !moisture || !season) return;
    setAnalyzing(true); setResult(null);
    const label = soilTypes.find(s => s.value === soilType)?.label || soilType;
    const { data, error } = await supabase.functions.invoke("analyze-farm", { body: { mode: "soil-recommend", soilType: label, moisture, season } });
    setAnalyzing(false);
    if (error || data?.error) { toast({ title: "Error", description: data?.error || "Failed", variant: "destructive" }); return; }
    setResult(data.data);
  };

  return (
    <div className="space-y-4">
      <div className="bg-card rounded-xl p-4 border border-border space-y-3">
        <div className="flex items-center gap-2">
          <Camera size={18} className="text-primary" />
          <h3 className="font-bold text-sm">Upload Soil Photo (AI Detect)</h3>
        </div>
        <PhotoPicker preview={preview} onPick={detect} onClear={() => { setPreview(null); setDetection(null); }} label="Take or upload soil photo" />
        {detecting && <div className="flex items-center gap-2 text-sm text-muted-foreground"><Loader2 className="animate-spin" size={16} /> AI analyzing soil...</div>}
        {detection && (
          <div className="bg-primary/5 border border-primary/20 rounded-lg p-3 text-xs space-y-1">
            <div className="flex items-center gap-2"><CheckCircle size={14} className="text-primary" /><strong>{detection.soil_description}</strong></div>
            <p><span className="text-muted-foreground">Color:</span> {detection.color_observed}</p>
            <p><span className="text-muted-foreground">Texture:</span> {detection.texture_observed}</p>
            {detection.additional_notes && <p className="text-muted-foreground">💡 {detection.additional_notes}</p>}
          </div>
        )}
      </div>

      <div className="grid sm:grid-cols-3 gap-3">
        <div>
          <label className="text-xs font-bold flex items-center gap-1 mb-1"><Mountain size={14} /> Soil</label>
          <Select value={soilType} onValueChange={setSoilType}>
            <SelectTrigger><SelectValue placeholder="Soil type" /></SelectTrigger>
            <SelectContent>{soilTypes.map(s => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        <div>
          <label className="text-xs font-bold flex items-center gap-1 mb-1"><Droplets size={14} /> Moisture</label>
          <Select value={moisture} onValueChange={setMoisture}>
            <SelectTrigger><SelectValue placeholder="Moisture" /></SelectTrigger>
            <SelectContent>{moistureLevels.map(m => <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        <div>
          <label className="text-xs font-bold flex items-center gap-1 mb-1"><ThermometerSun size={14} /> Season</label>
          <Select value={season} onValueChange={setSeason}>
            <SelectTrigger><SelectValue placeholder="Season" /></SelectTrigger>
            <SelectContent>{seasons.map(s => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}</SelectContent>
          </Select>
        </div>
      </div>

      <Button onClick={analyze} disabled={!soilType || !moisture || !season || analyzing} className="w-full gradient-earth text-primary-foreground border-0 h-11 font-bold">
        {analyzing ? <><Loader2 className="animate-spin mr-2" size={18} /> Analyzing...</> : <><Sprout className="mr-2" size={18} /> Get Crops & Tutorial</>}
      </Button>

      <AnimatePresence>
        {result && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
            {result.recommendations?.length > 0 && (
              <div className="space-y-2">
                <h3 className="font-bold flex items-center gap-2"><Leaf size={16} className="text-primary" /> Recommended Crops</h3>
                {result.recommendations.map((r: any, i: number) => (
                  <div key={i} className="bg-card rounded-xl p-3 border border-border flex gap-3">
                    <span className="text-3xl">{r.emoji}</span>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h4 className="font-bold text-sm">{r.crop}</h4>
                        <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-primary/10 text-primary">{r.confidence}</span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">{r.reason}</p>
                      <p className="text-xs text-primary font-semibold mt-1">💡 {r.tips}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
            {result.tutorial && <TutorialCard tutorial={result.tutorial} />}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

/* ---------- PEST TAB ---------- */
const PestTab = () => {
  const [preview, setPreview] = useState<string | null>(null);
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const analyze = async () => {
    if (!preview) { toast({ title: "Photo required", description: "Upload a photo of the pest or affected plant" }); return; }
    setLoading(true); setResult(null);
    const { data, error } = await supabase.functions.invoke("analyze-farm", { body: { mode: "pest", imageBase64: preview, notes } });
    setLoading(false);
    if (error || data?.error) { toast({ title: "Error", description: data?.error || "Failed", variant: "destructive" }); return; }
    setResult(data.data);
  };

  return (
    <div className="space-y-4">
      <div className="bg-card rounded-xl p-4 border border-border space-y-3">
        <div className="flex items-center gap-2"><Bug size={18} className="text-secondary" /><h3 className="font-bold text-sm">Pest & Disease Diagnosis</h3></div>
        <p className="text-xs text-muted-foreground">Photograph the affected leaf, plant, or insect. AI will identify it and create a control tutorial.</p>
        <PhotoPicker preview={preview} onPick={setPreview} onClear={() => setPreview(null)} label="Take or upload pest/plant photo" />
        <Textarea placeholder="Optional: describe what you're seeing (e.g. holes in maize leaves, white spots)..." value={notes} onChange={e => setNotes(e.target.value)} rows={3} />
        <Button onClick={analyze} disabled={!preview || loading} className="w-full gradient-earth text-primary-foreground border-0 h-11 font-bold">
          {loading ? <><Loader2 className="animate-spin mr-2" size={18} /> Diagnosing...</> : <><Bug className="mr-2" size={18} /> Diagnose & Get Tutorial</>}
        </Button>
      </div>

      {result && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
          <div className="bg-card rounded-xl p-4 border border-border space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-2xl">{result.emoji || "🐛"}</span>
              <div className="flex-1">
                <h3 className="font-bold">{result.pest_or_disease}</h3>
                <div className="flex gap-2 text-xs mt-0.5">
                  <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary font-bold">{result.confidence} confidence</span>
                  <span className={`px-2 py-0.5 rounded-full font-bold ${result.severity === "Severe" ? "bg-destructive/10 text-destructive" : "bg-secondary/10 text-secondary"}`}>{result.severity}</span>
                </div>
              </div>
            </div>
            {result.symptoms_observed && <p className="text-xs text-muted-foreground">{result.symptoms_observed}</p>}
            {result.affected_crops?.length > 0 && <p className="text-xs"><strong>Affects:</strong> {result.affected_crops.join(", ")}</p>}
            {result.treatments && (
              <div className="grid sm:grid-cols-3 gap-2 mt-2 text-xs">
                {(["organic", "chemical", "prevention"] as const).map(k => result.treatments[k]?.length > 0 && (
                  <div key={k} className="bg-muted/40 rounded-lg p-2">
                    <p className="font-bold capitalize mb-1">{k}</p>
                    <ul className="list-disc list-inside space-y-0.5 text-muted-foreground">{result.treatments[k].map((t: string, i: number) => <li key={i}>{t}</li>)}</ul>
                  </div>
                ))}
              </div>
            )}
          </div>
          {result.tutorial && <TutorialCard tutorial={result.tutorial} />}
        </motion.div>
      )}
    </div>
  );
};

/* ---------- ANIMAL TAB ---------- */
const AnimalTab = () => {
  const [preview, setPreview] = useState<string | null>(null);
  const [animalType, setAnimalType] = useState("");
  const [symptoms, setSymptoms] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const analyze = async () => {
    if (!animalType && !preview) { toast({ title: "Add details", description: "Select an animal or upload a photo" }); return; }
    setLoading(true); setResult(null);
    const { data, error } = await supabase.functions.invoke("analyze-farm", { body: { mode: "animal", imageBase64: preview, animalType, symptoms } });
    setLoading(false);
    if (error || data?.error) { toast({ title: "Error", description: data?.error || "Failed", variant: "destructive" }); return; }
    setResult(data.data);
  };

  return (
    <div className="space-y-4">
      <div className="bg-card rounded-xl p-4 border border-border space-y-3">
        <div className="flex items-center gap-2"><Stethoscope size={18} className="text-sky" /><h3 className="font-bold text-sm">Livestock Health Check</h3></div>
        <p className="text-xs text-muted-foreground">Get an AI vet check for your animals with a personalized care tutorial.</p>
        <div>
          <label className="text-xs font-bold mb-1 block">Animal</label>
          <Select value={animalType} onValueChange={setAnimalType}>
            <SelectTrigger><SelectValue placeholder="Select animal" /></SelectTrigger>
            <SelectContent>{animals.map(a => <SelectItem key={a} value={a}>{a}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        <Textarea placeholder="Describe symptoms (e.g. not eating, coughing, swollen leg, diarrhea, weight loss)..." value={symptoms} onChange={e => setSymptoms(e.target.value)} rows={3} />
        <PhotoPicker preview={preview} onPick={setPreview} onClear={() => setPreview(null)} label="Optional: upload animal photo" />
        <Button onClick={analyze} disabled={loading || (!animalType && !preview)} className="w-full gradient-earth text-primary-foreground border-0 h-11 font-bold">
          {loading ? <><Loader2 className="animate-spin mr-2" size={18} /> Diagnosing...</> : <><Stethoscope className="mr-2" size={18} /> Diagnose & Care Tutorial</>}
        </Button>
      </div>

      {result && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
          <div className="bg-card rounded-xl p-4 border border-border space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-2xl">{result.emoji || "🐓"}</span>
              <div className="flex-1">
                <h3 className="font-bold">{result.likely_condition}</h3>
                <div className="flex gap-2 text-xs mt-0.5 flex-wrap">
                  <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary font-bold">{result.confidence}</span>
                  <span className={`px-2 py-0.5 rounded-full font-bold ${result.severity === "Severe" ? "bg-destructive/10 text-destructive" : "bg-secondary/10 text-secondary"}`}>{result.severity}</span>
                  {result.urgent_vet && <span className="px-2 py-0.5 rounded-full bg-destructive/10 text-destructive font-bold flex items-center gap-1"><AlertTriangle size={12} /> See vet</span>}
                </div>
              </div>
            </div>
            {result.signs_to_watch?.length > 0 && (
              <div className="text-xs"><strong>Watch for:</strong>
                <ul className="list-disc list-inside text-muted-foreground">{result.signs_to_watch.map((s: string, i: number) => <li key={i}>{s}</li>)}</ul>
              </div>
            )}
            {result.home_care?.length > 0 && (
              <div className="text-xs"><strong>Home care:</strong>
                <ul className="list-disc list-inside text-muted-foreground">{result.home_care.map((s: string, i: number) => <li key={i}>{s}</li>)}</ul>
              </div>
            )}
            {result.feeding_advice && <p className="text-xs"><strong>Feeding:</strong> <span className="text-muted-foreground">{result.feeding_advice}</span></p>}
          </div>
          {result.tutorial && <TutorialCard tutorial={result.tutorial} />}
        </motion.div>
      )}
    </div>
  );
};

/* ---------- MAIN ---------- */
const FarmAnalyzer = () => {
  return (
    <div className="flex flex-col max-w-3xl mx-auto pb-8">
      <PageHeader title="AI Farm Analyzer" subtitle="Soil, pests, and animal health — with step-by-step tutorials" />
      <div className="px-4 sm:px-0 mt-4">
        <Tabs defaultValue="soil" className="w-full">
          <TabsList className="grid grid-cols-3 w-full">
            <TabsTrigger value="soil" className="gap-1.5"><Leaf size={14} /> Soil</TabsTrigger>
            <TabsTrigger value="pest" className="gap-1.5"><Bug size={14} /> Pest</TabsTrigger>
            <TabsTrigger value="animal" className="gap-1.5"><Stethoscope size={14} /> Animal</TabsTrigger>
          </TabsList>
          <TabsContent value="soil" className="mt-4"><SoilTab /></TabsContent>
          <TabsContent value="pest" className="mt-4"><PestTab /></TabsContent>
          <TabsContent value="animal" className="mt-4"><AnimalTab /></TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default FarmAnalyzer;