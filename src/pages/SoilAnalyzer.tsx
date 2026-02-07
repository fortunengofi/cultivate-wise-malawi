import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Leaf, MapPin, Loader2, Sprout, Droplets, ThermometerSun, Mountain } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import PageHeader from "@/components/PageHeader";
import SoilPhotoUpload from "@/components/SoilPhotoUpload";
import { useSoilAnalysis } from "@/hooks/useSoilAnalysis";

const soilTypes = [
  { value: "red-laterite", label: "Red Laterite", desc: "Common in central Malawi, iron-rich" },
  { value: "sandy-loam", label: "Sandy Loam", desc: "Light, well-draining soil" },
  { value: "clay", label: "Clay Soil", desc: "Heavy, moisture-retaining" },
  { value: "alluvial", label: "Alluvial", desc: "Found near rivers, very fertile" },
  { value: "volcanic", label: "Volcanic Ash", desc: "Nutrient-rich, found near highlands" },
  { value: "black-cotton", label: "Black Cotton", desc: "Deep, dark soil with high clay" },
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

const SoilAnalyzer = () => {
  const [soilType, setSoilType] = useState("");
  const [moisture, setMoisture] = useState("");
  const [season, setSeason] = useState("");
  const [locationStatus, setLocationStatus] = useState<"idle" | "requesting" | "granted" | "denied">("idle");

  const {
    isDetecting,
    isAnalyzing,
    soilDetection,
    recommendations,
    detectSoilFromPhoto,
    getRecommendations,
  } = useSoilAnalysis();

  const requestLocation = () => {
    setLocationStatus("requesting");
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        () => setLocationStatus("granted"),
        () => setLocationStatus("denied")
      );
    } else {
      setLocationStatus("denied");
    }
  };

  const handlePhotoUpload = async (base64: string) => {
    const result = await detectSoilFromPhoto(base64);
    if (result?.detected_soil_type) {
      setSoilType(result.detected_soil_type);
    }
  };

  const handleAnalyze = async () => {
    if (!soilType || !moisture || !season) return;
    const soilLabel = soilTypes.find(s => s.value === soilType)?.label || soilType;
    await getRecommendations(soilLabel, moisture, season);
  };

  return (
    <div className="flex flex-col max-w-3xl mx-auto">
      <PageHeader title="AI Soil Analyzer" subtitle="Get personalized crop recommendations" />

      <div className="px-4 sm:px-0 mt-6 space-y-4">
        {/* Location Access */}
        {locationStatus === "idle" && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-card rounded-xl p-4 shadow-card border border-border"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full gradient-sky flex items-center justify-center shrink-0">
                <MapPin size={20} className="text-sky-foreground" />
              </div>
              <div className="flex-1">
                <p className="font-bold text-sm text-foreground">Enable Location</p>
                <p className="text-xs text-muted-foreground">Get weather-based recommendations for your area</p>
              </div>
              <Button size="sm" onClick={requestLocation} className="gradient-earth text-primary-foreground border-0">
                Allow
              </Button>
            </div>
          </motion.div>
        )}

        {locationStatus === "granted" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2 px-1">
            <MapPin size={14} className="text-primary" />
            <span className="text-xs text-primary font-semibold">📍 Location enabled — using local weather data</span>
          </motion.div>
        )}

        {/* AI Photo Upload */}
        <SoilPhotoUpload
          onDetected={() => {}}
          isDetecting={isDetecting}
          onUpload={handlePhotoUpload}
          soilDetection={soilDetection}
        />

        {/* Divider */}
        <div className="flex items-center gap-3">
          <div className="flex-1 h-px bg-border" />
          <span className="text-xs text-muted-foreground font-semibold">OR SELECT MANUALLY</span>
          <div className="flex-1 h-px bg-border" />
        </div>

        {/* Soil Type Selection */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <label className="text-sm font-bold text-foreground flex items-center gap-2 mb-2">
            <Mountain size={16} className="text-earth" />
            Soil Type
          </label>
          <Select value={soilType} onValueChange={setSoilType}>
            <SelectTrigger className="bg-card border-border">
              <SelectValue placeholder="Select your soil type" />
            </SelectTrigger>
            <SelectContent>
              {soilTypes.map((s) => (
                <SelectItem key={s.value} value={s.value}>
                  <div>
                    <span className="font-semibold">{s.label}</span>
                    <span className="text-xs text-muted-foreground ml-2">— {s.desc}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </motion.div>

        {/* Moisture Level */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <label className="text-sm font-bold text-foreground flex items-center gap-2 mb-2">
            <Droplets size={16} className="text-sky" />
            Moisture Level
          </label>
          <Select value={moisture} onValueChange={setMoisture}>
            <SelectTrigger className="bg-card border-border">
              <SelectValue placeholder="How moist is the soil?" />
            </SelectTrigger>
            <SelectContent>
              {moistureLevels.map((m) => (
                <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </motion.div>

        {/* Season */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <label className="text-sm font-bold text-foreground flex items-center gap-2 mb-2">
            <ThermometerSun size={16} className="text-secondary" />
            Current Season
          </label>
          <Select value={season} onValueChange={setSeason}>
            <SelectTrigger className="bg-card border-border">
              <SelectValue placeholder="Select the current season" />
            </SelectTrigger>
            <SelectContent>
              {seasons.map((s) => (
                <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </motion.div>

        {/* Analyze Button */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <Button
            onClick={handleAnalyze}
            disabled={!soilType || !moisture || !season || isAnalyzing}
            className="w-full gradient-earth text-primary-foreground border-0 h-12 text-base font-bold shadow-card"
          >
            {isAnalyzing ? (
              <>
                <Loader2 size={20} className="animate-spin mr-2" />
                AI Analyzing Soil...
              </>
            ) : (
              <>
                <Sprout size={20} className="mr-2" />
                Get AI Crop Recommendations
              </>
            )}
          </Button>
        </motion.div>

        {/* Results */}
        <AnimatePresence>
          {recommendations && recommendations.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-3 pb-8"
            >
              <h3 className="text-lg font-bold text-foreground font-serif flex items-center gap-2">
                <Leaf size={18} className="text-primary" />
                AI Recommended Crops
              </h3>
              {recommendations.map((rec, idx) => (
                <motion.div
                  key={rec.crop}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.15 }}
                  className="bg-card rounded-xl p-4 shadow-card border border-border"
                >
                  <div className="flex items-start gap-3">
                    <span className="text-3xl">{rec.emoji}</span>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h4 className="font-bold text-foreground">{rec.crop}</h4>
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                          rec.confidence === "High" ? "bg-primary/10 text-primary" : "bg-secondary/10 text-secondary"
                        }`}>
                          {rec.confidence} Match
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">{rec.reason}</p>
                      <div className="mt-2 bg-leaf-light rounded-lg p-2.5">
                        <p className="text-xs font-semibold text-primary">💡 {rec.tips}</p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default SoilAnalyzer;
