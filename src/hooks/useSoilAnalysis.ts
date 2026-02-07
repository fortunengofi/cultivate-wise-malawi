import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface SoilDetectionResult {
  detected_soil_type: string;
  confidence: string;
  soil_description: string;
  color_observed: string;
  texture_observed: string;
  additional_notes: string;
}

interface CropRecommendation {
  crop: string;
  confidence: string;
  reason: string;
  tips: string;
  emoji: string;
}

export function useSoilAnalysis() {
  const [isDetecting, setIsDetecting] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [soilDetection, setSoilDetection] = useState<SoilDetectionResult | null>(null);
  const [recommendations, setRecommendations] = useState<CropRecommendation[] | null>(null);

  const detectSoilFromPhoto = useCallback(async (imageBase64: string) => {
    setIsDetecting(true);
    setSoilDetection(null);
    try {
      const { data, error } = await supabase.functions.invoke("analyze-soil", {
        body: { imageBase64 },
      });

      if (error) {
        toast({ title: "Error", description: "Failed to analyze soil photo. Please try again.", variant: "destructive" });
        console.error("Soil detection error:", error);
        return null;
      }

      if (data?.error) {
        toast({ title: "Error", description: data.error, variant: "destructive" });
        return null;
      }

      const result = data?.data as SoilDetectionResult;
      setSoilDetection(result);
      toast({ title: "Soil Detected! 🌍", description: `Identified as ${result.soil_description || result.detected_soil_type}` });
      return result;
    } catch (err) {
      console.error("Detection error:", err);
      toast({ title: "Error", description: "Something went wrong. Please try again.", variant: "destructive" });
      return null;
    } finally {
      setIsDetecting(false);
    }
  }, []);

  const getRecommendations = useCallback(async (soilType: string, moisture: string, season: string) => {
    setIsAnalyzing(true);
    setRecommendations(null);
    try {
      const { data, error } = await supabase.functions.invoke("analyze-soil", {
        body: { soilType, moisture, season },
      });

      if (error) {
        toast({ title: "Error", description: "Failed to get recommendations. Please try again.", variant: "destructive" });
        console.error("Recommendation error:", error);
        return null;
      }

      if (data?.error) {
        toast({ title: "Error", description: data.error, variant: "destructive" });
        return null;
      }

      const recs = data?.data as CropRecommendation[];
      setRecommendations(recs);
      return recs;
    } catch (err) {
      console.error("Recommendation error:", err);
      toast({ title: "Error", description: "Something went wrong. Please try again.", variant: "destructive" });
      return null;
    } finally {
      setIsAnalyzing(false);
    }
  }, []);

  return {
    isDetecting,
    isAnalyzing,
    soilDetection,
    recommendations,
    detectSoilFromPhoto,
    getRecommendations,
    setSoilDetection,
    setRecommendations,
  };
}
