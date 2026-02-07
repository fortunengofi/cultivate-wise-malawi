import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { imageBase64, soilType, moisture, season } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    // If image is provided, analyze it to detect soil type
    if (imageBase64) {
      const imageAnalysisResponse = await fetch(
        "https://ai.gateway.lovable.dev/v1/chat/completions",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${LOVABLE_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "google/gemini-2.5-flash",
            messages: [
              {
                role: "system",
                content: `You are an expert agricultural soil scientist specializing in Malawian soils. Analyze the soil photo and respond with ONLY valid JSON (no markdown, no code blocks). The JSON must have this structure:
{
  "detected_soil_type": "one of: red-laterite, sandy-loam, clay, alluvial, volcanic, black-cotton",
  "confidence": "High, Medium, or Low",
  "soil_description": "Brief description of what you see",
  "color_observed": "The color of the soil",
  "texture_observed": "The texture you can identify",
  "additional_notes": "Any relevant observations for Malawian farming"
}`
              },
              {
                role: "user",
                content: [
                  {
                    type: "text",
                    text: "Analyze this soil photo. Identify the soil type, color, texture, and provide agricultural recommendations relevant to Malawi."
                  },
                  {
                    type: "image_url",
                    image_url: {
                      url: imageBase64
                    }
                  }
                ]
              }
            ],
          }),
        }
      );

      if (!imageAnalysisResponse.ok) {
        if (imageAnalysisResponse.status === 429) {
          return new Response(
            JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }),
            { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
        if (imageAnalysisResponse.status === 402) {
          return new Response(
            JSON.stringify({ error: "AI usage limit reached. Please add credits." }),
            { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
        const errorText = await imageAnalysisResponse.text();
        console.error("AI gateway error:", imageAnalysisResponse.status, errorText);
        throw new Error("Failed to analyze image");
      }

      const imageData = await imageAnalysisResponse.json();
      const rawContent = imageData.choices?.[0]?.message?.content || "";
      
      // Clean the response - remove markdown code blocks if present
      let cleanContent = rawContent.trim();
      if (cleanContent.startsWith("```")) {
        cleanContent = cleanContent.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "");
      }

      let soilAnalysis;
      try {
        soilAnalysis = JSON.parse(cleanContent);
      } catch {
        soilAnalysis = {
          detected_soil_type: "red-laterite",
          confidence: "Low",
          soil_description: rawContent,
          color_observed: "Unable to determine",
          texture_observed: "Unable to determine",
          additional_notes: "Could not fully analyze the image. Please try with a clearer photo."
        };
      }

      return new Response(JSON.stringify({ type: "soil_detection", data: soilAnalysis }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // If soil type + conditions provided, get AI crop recommendations
    if (soilType && moisture && season) {
      const recResponse = await fetch(
        "https://ai.gateway.lovable.dev/v1/chat/completions",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${LOVABLE_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "google/gemini-2.5-flash",
            messages: [
              {
                role: "system",
                content: `You are an expert Malawian agricultural advisor. Given soil type, moisture, and season, recommend the top 3 crops. Include local Chichewa names. Respond with ONLY valid JSON (no markdown, no code blocks):
[
  {
    "crop": "Crop Name (Chichewa Name)",
    "confidence": "High or Medium",
    "reason": "Why this crop suits these conditions",
    "tips": "Practical planting and care tips for Malawian farmers",
    "emoji": "relevant emoji"
  }
]`
              },
              {
                role: "user",
                content: `Soil type: ${soilType}, Moisture: ${moisture}, Season: ${season}. Recommend the best crops for a smallholder farmer in Malawi.`
              }
            ],
          }),
        }
      );

      if (!recResponse.ok) {
        if (recResponse.status === 429) {
          return new Response(
            JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }),
            { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
        if (recResponse.status === 402) {
          return new Response(
            JSON.stringify({ error: "AI usage limit reached. Please add credits." }),
            { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
        const errorText = await recResponse.text();
        console.error("AI gateway error:", recResponse.status, errorText);
        throw new Error("Failed to get recommendations");
      }

      const recData = await recResponse.json();
      const rawRecs = recData.choices?.[0]?.message?.content || "[]";
      
      let cleanRecs = rawRecs.trim();
      if (cleanRecs.startsWith("```")) {
        cleanRecs = cleanRecs.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "");
      }

      let recommendations;
      try {
        recommendations = JSON.parse(cleanRecs);
      } catch {
        recommendations = [];
      }

      return new Response(JSON.stringify({ type: "recommendations", data: recommendations }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "Missing required parameters" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("analyze-soil error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
