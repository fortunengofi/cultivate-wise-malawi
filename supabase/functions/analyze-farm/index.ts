import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const LOVABLE_AI_URL = "https://ai.gateway.lovable.dev/v1/chat/completions";

function cleanJson(raw: string) {
  let s = (raw || "").trim();
  if (s.startsWith("```")) s = s.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "");
  return s;
}

async function callAI(body: unknown, apiKey: string) {
  const res = await fetch(LOVABLE_AI_URL, {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const status = res.status;
    const text = await res.text();
    console.error("AI gateway error:", status, text);
    const msg =
      status === 429
        ? "Rate limit exceeded. Please try again in a moment."
        : status === 402
        ? "AI usage limit reached. Please add credits to your Lovable AI workspace."
        : "AI request failed";
    return { ok: false as const, status, msg };
  }
  const data = await res.json();
  return { ok: true as const, content: data.choices?.[0]?.message?.content || "" };
}

function err(msg: string, status = 500) {
  return new Response(JSON.stringify({ error: msg }), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const body = await req.json();
    const { mode, imageBase64, soilType, moisture, season, notes, animalType, symptoms } = body;
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) return err("LOVABLE_API_KEY not configured");

    // ============ SOIL: image detection ============
    if (mode === "soil-detect" && imageBase64) {
      const r = await callAI(
        {
          model: "google/gemini-2.5-flash",
          messages: [
            {
              role: "system",
              content: `You are an expert agricultural soil scientist for Malawi. Analyze the soil photo and respond with ONLY valid JSON:
{"detected_soil_type":"red-laterite|sandy-loam|clay|alluvial|volcanic|black-cotton","confidence":"High|Medium|Low","soil_description":"...","color_observed":"...","texture_observed":"...","additional_notes":"..."}`,
            },
            {
              role: "user",
              content: [
                { type: "text", text: "Analyze this soil photo for a Malawian farmer." },
                { type: "image_url", image_url: { url: imageBase64 } },
              ],
            },
          ],
        },
        LOVABLE_API_KEY,
      );
      if (!r.ok) return err(r.msg, r.status);
      let data;
      try { data = JSON.parse(cleanJson(r.content)); } catch { data = { detected_soil_type: "red-laterite", confidence: "Low", soil_description: r.content, color_observed: "", texture_observed: "", additional_notes: "Try a clearer photo." }; }
      return new Response(JSON.stringify({ data }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // ============ SOIL: recommendations + tutorial ============
    if (mode === "soil-recommend" && soilType && moisture && season) {
      const r = await callAI(
        {
          model: "google/gemini-2.5-flash",
          messages: [
            {
              role: "system",
              content: `You are a Malawian agricultural advisor. Respond with ONLY valid JSON:
{"recommendations":[{"crop":"Name (Chichewa)","confidence":"High|Medium","reason":"...","tips":"...","emoji":"🌽"}],"tutorial":{"title":"...","summary":"...","steps":[{"title":"...","detail":"..."}]}}
The tutorial must be a step-by-step practical guide (5-7 steps) tailored to these conditions for a smallholder farmer. Use simple language.`,
            },
            { role: "user", content: `Soil: ${soilType}, Moisture: ${moisture}, Season: ${season}. Recommend top 3 crops and a planting tutorial.` },
          ],
        },
        LOVABLE_API_KEY,
      );
      if (!r.ok) return err(r.msg, r.status);
      let data;
      try { data = JSON.parse(cleanJson(r.content)); } catch { data = { recommendations: [], tutorial: null }; }
      return new Response(JSON.stringify({ data }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // ============ PEST: image diagnosis + tutorial ============
    if (mode === "pest" && imageBase64) {
      const r = await callAI(
        {
          model: "google/gemini-2.5-flash",
          messages: [
            {
              role: "system",
              content: `You are a crop protection expert for Malawian smallholder farms. The farmer uploaded a photo of an affected plant or insect. Respond with ONLY valid JSON:
{"pest_or_disease":"Common name (scientific name if known)","confidence":"High|Medium|Low","affected_crops":["..."],"symptoms_observed":"...","severity":"Mild|Moderate|Severe","emoji":"🐛","treatments":{"organic":["..."],"chemical":["..."],"prevention":["..."]},"tutorial":{"title":"How to control ...","summary":"...","steps":[{"title":"...","detail":"..."}]}}
The tutorial must be 5-7 practical, locally-actionable steps. Prefer affordable, locally-available solutions (neem, ash, soap spray, crop rotation) before chemicals.`,
            },
            {
              role: "user",
              content: [
                { type: "text", text: `Diagnose this pest or crop disease. Notes: ${notes || "none"}` },
                { type: "image_url", image_url: { url: imageBase64 } },
              ],
            },
          ],
        },
        LOVABLE_API_KEY,
      );
      if (!r.ok) return err(r.msg, r.status);
      let data;
      try { data = JSON.parse(cleanJson(r.content)); } catch { data = null; }
      if (!data) return err("Could not parse AI response. Please try a clearer photo.");
      return new Response(JSON.stringify({ data }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // ============ ANIMAL HEALTH: image + symptoms + tutorial ============
    if (mode === "animal") {
      if (!animalType && !imageBase64) return err("Provide animal type or photo", 400);
      const userContent: any[] = [
        {
          type: "text",
          text: `Animal: ${animalType || "unknown"}. Observed symptoms: ${symptoms || "see photo"}. Diagnose likely conditions and provide a care tutorial for a Malawian smallholder farmer.`,
        },
      ];
      if (imageBase64) userContent.push({ type: "image_url", image_url: { url: imageBase64 } });

      const r = await callAI(
        {
          model: "google/gemini-2.5-flash",
          messages: [
            {
              role: "system",
              content: `You are a veterinary advisor for Malawian smallholder livestock (chickens, goats, cattle, pigs, sheep). Respond with ONLY valid JSON:
{"likely_condition":"...","confidence":"High|Medium|Low","severity":"Mild|Moderate|Severe","urgent_vet":true|false,"signs_to_watch":["..."],"home_care":["..."],"feeding_advice":"...","emoji":"🐓","tutorial":{"title":"Care guide for ...","summary":"...","steps":[{"title":"...","detail":"..."}]}}
The tutorial must have 5-7 practical steps using locally available resources. If urgent_vet is true, emphasize visiting a vet officer.`,
            },
            { role: "user", content: userContent },
          ],
        },
        LOVABLE_API_KEY,
      );
      if (!r.ok) return err(r.msg, r.status);
      let data;
      try { data = JSON.parse(cleanJson(r.content)); } catch { data = null; }
      if (!data) return err("Could not parse AI response. Please try again.");
      return new Response(JSON.stringify({ data }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    return err("Missing or invalid parameters", 400);
  } catch (e) {
    console.error("analyze-farm error:", e);
    return err(e instanceof Error ? e.message : "Unknown error");
  }
});