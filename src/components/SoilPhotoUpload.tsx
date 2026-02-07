import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { Camera, Upload, Loader2, X, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SoilDetectionResult {
  detected_soil_type: string;
  confidence: string;
  soil_description: string;
  color_observed: string;
  texture_observed: string;
  additional_notes: string;
}

interface SoilPhotoUploadProps {
  onDetected: (result: SoilDetectionResult, soilTypeValue: string) => void;
  isDetecting: boolean;
  onUpload: (base64: string) => void;
  soilDetection: SoilDetectionResult | null;
}

const soilTypeMap: Record<string, string> = {
  "red-laterite": "Red Laterite",
  "sandy-loam": "Sandy Loam",
  "clay": "Clay Soil",
  "alluvial": "Alluvial",
  "volcanic": "Volcanic Ash",
  "black-cotton": "Black Cotton",
};

const SoilPhotoUpload = ({ onDetected, isDetecting, onUpload, soilDetection }: SoilPhotoUploadProps) => {
  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      setPreview(base64);
      onUpload(base64);
    };
    reader.readAsDataURL(file);
  };

  const clearPhoto = () => {
    setPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card rounded-xl p-4 shadow-card border border-border space-y-3"
    >
      <div className="flex items-center gap-2">
        <Camera size={18} className="text-primary" />
        <h3 className="font-bold text-sm text-foreground">Upload Soil Photo</h3>
        <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full font-semibold">AI Powered</span>
      </div>

      <p className="text-xs text-muted-foreground">
        Take a photo of your soil and our AI will detect the type instantly
      </p>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFileChange}
        className="hidden"
      />

      {!preview ? (
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            className="flex-1 border-dashed border-2 border-primary/30 h-20 flex-col gap-1"
          >
            <Camera size={20} className="text-primary" />
            <span className="text-xs">Take Photo</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              if (fileInputRef.current) {
                fileInputRef.current.removeAttribute("capture");
                fileInputRef.current.click();
                fileInputRef.current.setAttribute("capture", "environment");
              }
            }}
            className="flex-1 border-dashed border-2 border-primary/30 h-20 flex-col gap-1"
          >
            <Upload size={20} className="text-primary" />
            <span className="text-xs">Upload Image</span>
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="relative rounded-lg overflow-hidden">
            <img src={preview} alt="Soil sample" className="w-full h-40 object-cover rounded-lg" />
            <button
              onClick={clearPhoto}
              className="absolute top-2 right-2 bg-background/80 backdrop-blur-sm rounded-full p-1"
            >
              <X size={16} className="text-foreground" />
            </button>
            {isDetecting && (
              <div className="absolute inset-0 bg-background/60 backdrop-blur-sm flex items-center justify-center">
                <div className="text-center space-y-2">
                  <Loader2 size={28} className="animate-spin text-primary mx-auto" />
                  <p className="text-xs font-bold text-foreground">AI Analyzing Soil...</p>
                </div>
              </div>
            )}
          </div>

          {soilDetection && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-primary/5 border border-primary/20 rounded-lg p-3 space-y-2"
            >
              <div className="flex items-center gap-2">
                <CheckCircle size={16} className="text-primary" />
                <span className="font-bold text-sm text-foreground">AI Detection Result</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-muted-foreground">Soil Type:</span>
                  <p className="font-bold text-foreground">
                    {soilTypeMap[soilDetection.detected_soil_type] || soilDetection.detected_soil_type}
                  </p>
                </div>
                <div>
                  <span className="text-muted-foreground">Confidence:</span>
                  <p className={`font-bold ${soilDetection.confidence === "High" ? "text-primary" : "text-secondary"}`}>
                    {soilDetection.confidence}
                  </p>
                </div>
                <div className="col-span-2">
                  <span className="text-muted-foreground">Color:</span>
                  <p className="font-semibold text-foreground">{soilDetection.color_observed}</p>
                </div>
                <div className="col-span-2">
                  <span className="text-muted-foreground">Texture:</span>
                  <p className="font-semibold text-foreground">{soilDetection.texture_observed}</p>
                </div>
              </div>
              {soilDetection.additional_notes && (
                <p className="text-xs text-muted-foreground mt-1">💡 {soilDetection.additional_notes}</p>
              )}
            </motion.div>
          )}
        </div>
      )}
    </motion.div>
  );
};

export default SoilPhotoUpload;
