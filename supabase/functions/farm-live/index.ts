import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const AI_URL = "https://ai.gateway.lovable.dev/v1/chat/completions";
const MODEL = "google/gemini-2.5-flash";

const LANGS: Record<string, string> = {
  en: "English",
  ny: "Chichewa (Chinyanja)",
  tum: "Tumbuka",
  yao: "Yao (Chiyao)",
};

function cleanJson(raw: string) {
  let s = (raw || "").trim();
  if (s.startsWith("```")) s = s.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "");
  const a = s.indexOf("{");
  const b = s.lastIndexOf("}");
  if (a > 0 || b < s.length - 1) s = s.slice(a === -1 ? 0 : a, b === -1 ? undefined : b + 1);
  return s;
}

function err(msg: string, status = 500) {
  return new Response(JSON.stringify({ error: msg }), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

async function callAI(messages: unknown[], apiKey: string) {
  const res = await fetch(AI_URL, {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({ model: MODEL, messages }),
  });
  if (!res.ok) {
    const text = await res.text();
    console.error("AI gateway error", res.status, text);
    const msg =
      res.status === 429
        ? "Too many scans right now — pause for a moment and try again."
        : res.status === 402
        ? "AI usage limit reached. Please add credits to continue."
        : "AI request failed";
    return { ok: false as const, status: res.status, msg };
  }
  const data = await res.json();
  return { ok: true as const, content: data.choices?.[0]?.message?.content || "" };
}

const FRAME_SYSTEM = (lang: string) => `You are an expert Malawian agricultural extension officer looking through a farmer's phone camera in real time. Identify WITHOUT being told whether the frame shows soil, a crop, a pest/disease, livestock, or something irrelevant.

Respond with ONLY valid JSON in this exact shape (omit sections that do not apply, use null):
{
 "subject": "soil|crop|pest|livestock|unknown",
 "headline": "one short sentence in ${lang}",
 "spoken": "1-2 short sentences in ${lang}, natural spoken style, what a farmer needs to hear now",
 "alert": {"level":"none|watch|urgent","message":"short ${lang} text"},
 "detections": [{"label":"Healthy Maize","confidence":96,"status":"good|warn|bad","box":[0.1,0.2,0.4,0.5]}],
 "soil": {"soil_type":"","texture":"","moisture":"","organic_matter":"","color":"","health":"","ph_estimate":"","fertility":""},
 "crop": {"crop":"","growth_stage":"","health_score":85,"nutrient_deficiency":"","disease":"","water_stress":"","weeds":""},
 "pest": {"name":"","confidence":90,"severity":"Mild|Moderate|Severe","affected_crops":["..."],"treatment":""},
 "livestock": {"animal":"","body_condition":"","wounds":"","skin_disease":"","parasites":"","weight_estimate":"","hydration":"","behaviour":"","health":""},
 "recommendations": {"fertilizer":["..."],"irrigation":["..."],"organic":["..."],"chemical":["..."],"prevention":["..."]},
 "guidance": {"problem":"","cause":"","severity":"","treatment":"","organic_solution":"","chemical_solution":"","safety":"","prevention":"","recovery_time":""}
}
Rules: box values are normalised 0-1 as [x,y,width,height] of the visible object. Give 1-4 detections max. Only include "guidance" when a real disease/pest/health problem is visible. Prefer affordable locally available Malawian solutions (neem, ash, soap spray, compost, crop rotation) before chemicals. All human-readable text must be in ${lang}. Be concise.`;

const CHAT_SYSTEM = (lang: string) => `You are Farm Link's voice farming assistant — a warm, practical Malawian agricultural extension officer. You can see the farmer's camera (the latest analysis is given to you as JSON) and you remember the conversation.
Answer in ${lang}, in 1-3 short spoken sentences. No markdown, no lists, no emojis — this text is read aloud. Give concrete, affordable, locally-available advice. If pesticides are involved, remind about following label instructions and the pre-harvest interval. If you are not sure what is on camera, say so briefly and ask the farmer to move closer.`;

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const apiKey = Deno.env.get("LOVABLE_API_KEY");
    if (!apiKey) return err("LOVABLE_API_KEY not configured");

    const body = await req.json();
    const { mode, imageBase64, lang, question, history, context } = body ?? {};
    const language = LANGS[lang] ?? LANGS.en;

    if (mode === "frame") {
      if (typeof imageBase64 !== "string" || !imageBase64.startsWith("data:image/")) {
        return err("A camera frame image is required", 400);
      }
      const r = await callAI(
        [
          { role: "system", content: FRAME_SYSTEM(language) },
          {
            role: "user",
            content: [
              { type: "text", text: "Analyse this live camera frame from a Malawian smallholder farm." },
              { type: "image_url", image_url: { url: imageBase64 } },
            ],
          },
        ],
        apiKey,
      );
      if (!r.ok) return err(r.msg, r.status);
      let data;
      try {
        data = JSON.parse(cleanJson(r.content));
      } catch {
        return err("Could not read that frame — hold the camera steady and try again.", 422);
      }
      return new Response(JSON.stringify({ data }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (mode === "chat") {
      if (typeof question !== "string" || !question.trim()) return err("A question is required", 400);
      const msgs: unknown[] = [{ role: "system", content: CHAT_SYSTEM(language) }];
      if (context) {
        msgs.push({
          role: "system",
          content: `Latest live camera analysis (JSON): ${JSON.stringify(context).slice(0, 4000)}`,
        });
      }
      if (Array.isArray(history)) {
        for (const m of history.slice(-12)) {
          if (m && (m.role === "user" || m.role === "assistant") && typeof m.content === "string") {
            msgs.push({ role: m.role, content: m.content.slice(0, 1500) });
          }
        }
      }
      msgs.push({ role: "user", content: question.slice(0, 1500) });

      const r = await callAI(msgs, apiKey);
      if (!r.ok) return err(r.msg, r.status);
      return new Response(JSON.stringify({ reply: r.content.trim() }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return err("Unknown mode", 400);
  } catch (e) {
    console.error("farm-live error", e);
    return err(e instanceof Error ? e.message : "Unknown error");
  }
});
