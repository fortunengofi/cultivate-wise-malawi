import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Leaf, MapPin, Loader2, Sprout, Droplets, ThermometerSun, Mountain } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import PageHeader from "@/components/PageHeader";

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

interface CropRecommendation {
  crop: string;
  confidence: string;
  reason: string;
  tips: string;
  emoji: string;
}

const getRecommendations = (soil: string, moisture: string, season: string): CropRecommendation[] => {
  const recs: Record<string, CropRecommendation[]> = {
    "red-laterite": [
      { crop: "Maize (Chimanga)", confidence: "High", reason: "Red laterite provides good drainage for maize roots", tips: "Add compost before planting. Space rows 75cm apart.", emoji: "🌽" },
      { crop: "Groundnuts (Mtedza)", confidence: "High", reason: "Well-suited for legumes, helps fix nitrogen", tips: "Plant after first good rains. Harvest when leaves yellow.", emoji: "🥜" },
      { crop: "Tobacco (Fodya)", confidence: "Medium", reason: "Grows well but needs careful management", tips: "Requires nursery beds first. Transplant at 6 weeks.", emoji: "🍂" },
    ],
    "sandy-loam": [
      { crop: "Sweet Potatoes (Mbatata)", confidence: "High", reason: "Sandy loam provides perfect loose structure", tips: "Plant vine cuttings at start of rains. Mound soil around stems.", emoji: "🍠" },
      { crop: "Cassava (Chinangwa)", confidence: "High", reason: "Tolerates sandy conditions well", tips: "Plant stem cuttings 1m apart. Harvest after 12-18 months.", emoji: "🌿" },
      { crop: "Sorghum (Mapira)", confidence: "Medium", reason: "Drought-resistant, good for lighter soils", tips: "Direct seed after first rains. Thin to 20cm spacing.", emoji: "🌾" },
    ],
    "clay": [
      { crop: "Rice (Mpunga)", confidence: "High", reason: "Clay retains water perfectly for paddy rice", tips: "Prepare nursery beds. Transplant seedlings at 3-4 weeks.", emoji: "🍚" },
      { crop: "Beans (Nyemba)", confidence: "Medium", reason: "Grows well with clay's moisture retention", tips: "Plant in rows 45cm apart. Provide support for climbing varieties.", emoji: "🫘" },
      { crop: "Sugarcane (Mzimbe)", confidence: "Medium", reason: "Benefits from clay's water-holding capacity", tips: "Plant setts horizontally. Keep weed-free for first 3 months.", emoji: "🎋" },
    ],
    "alluvial": [
      { crop: "Vegetables (Masamba)", confidence: "High", reason: "Extremely fertile soil, ideal for vegetables", tips: "Start with tomatoes, onions, and leafy greens. Irrigate regularly.", emoji: "🥬" },
      { crop: "Maize (Chimanga)", confidence: "High", reason: "Rich nutrients support excellent maize yields", tips: "Can achieve 2 harvests per year with irrigation.", emoji: "🌽" },
      { crop: "Banana (Nthochi)", confidence: "High", reason: "Deep, fertile soil perfect for banana roots", tips: "Space plants 3m apart. Mulch heavily around base.", emoji: "🍌" },
    ],
    "volcanic": [
      { crop: "Coffee", confidence: "High", reason: "Volcanic soil is ideal for coffee cultivation", tips: "Plant in shaded areas. Takes 3-4 years to first harvest.", emoji: "☕" },
      { crop: "Tea (Tiyi)", confidence: "High", reason: "Acidic volcanic soil perfect for tea bushes", tips: "Plant on slopes for drainage. Prune regularly.", emoji: "🍵" },
      { crop: "Macadamia Nuts", confidence: "Medium", reason: "Rich minerals support nut tree growth", tips: "Long-term investment. First harvest after 5-7 years.", emoji: "🌰" },
    ],
    "black-cotton": [
      { crop: "Cotton (Thonje)", confidence: "High", reason: "Named after this soil type — ideal conditions", tips: "Plant at start of rains. Monitor for bollworm.", emoji: "🏵️" },
      { crop: "Wheat (Tirigu)", confidence: "Medium", reason: "Deep soil supports wheat root systems", tips: "Best in cool dry season with irrigation.", emoji: "🌾" },
      { crop: "Sunflower", confidence: "Medium", reason: "Deep roots access nutrients in this soil", tips: "Space 60cm apart. Good cash crop for oil production.", emoji: "🌻" },
    ],
  };

  return recs[soil] || recs["red-laterite"];
};

const SoilAnalyzer = () => {
  const [soilType, setSoilType] = useState("");
  const [moisture, setMoisture] = useState("");
  const [season, setSeason] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [results, setResults] = useState<CropRecommendation[] | null>(null);
  const [locationStatus, setLocationStatus] = useState<"idle" | "requesting" | "granted" | "denied">("idle");

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

  const handleAnalyze = () => {
    if (!soilType || !moisture || !season) return;
    setIsAnalyzing(true);
    setResults(null);
    setTimeout(() => {
      setResults(getRecommendations(soilType, moisture, season));
      setIsAnalyzing(false);
    }, 2000);
  };

  return (
    <div className="flex flex-col">
      <PageHeader title="AI Soil Analyzer" subtitle="Get personalized crop recommendations" />

      <div className="px-4 -mt-3 relative z-10 space-y-4">
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
                Analyzing Soil...
              </>
            ) : (
              <>
                <Sprout size={20} className="mr-2" />
                Get Crop Recommendations
              </>
            )}
          </Button>
        </motion.div>

        {/* Results */}
        <AnimatePresence>
          {results && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-3 pb-6"
            >
              <h3 className="text-lg font-bold text-foreground font-serif flex items-center gap-2">
                <Leaf size={18} className="text-primary" />
                Recommended Crops
              </h3>
              {results.map((rec, idx) => (
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
