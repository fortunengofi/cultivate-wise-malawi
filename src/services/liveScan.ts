/** Types + local (offline-first) store for Live AI Farm Assistant scans. */

export type Subject = "soil" | "crop" | "pest" | "livestock" | "unknown";

export interface Detection {
  label: string;
  confidence: number;
  status?: "good" | "warn" | "bad";
  box?: [number, number, number, number];
}

export interface FrameAnalysis {
  subject: Subject;
  headline?: string;
  spoken?: string;
  alert?: { level: "none" | "watch" | "urgent"; message?: string } | null;
  detections?: Detection[];
  soil?: Record<string, string> | null;
  crop?: Record<string, string | number> | null;
  pest?: Record<string, unknown> | null;
  livestock?: Record<string, string> | null;
  recommendations?: Record<string, string[]> | null;
  guidance?: Record<string, string> | null;
}

export interface VoiceTurn {
  role: "user" | "assistant";
  content: string;
}

export interface ScanRecord {
  id: string;
  createdAt: string;
  subject: Subject;
  headline: string;
  snapshot?: string;
  analysis: FrameAnalysis;
  conversation: VoiceTurn[];
  location?: { lat: number; lon: number } | null;
  synced: boolean;
}

const KEY = "farmlink-scans";
const MAX = 60;

export function loadScans(): ScanRecord[] {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as ScanRecord[]) : [];
  } catch {
    return [];
  }
}

export function saveScan(record: ScanRecord): ScanRecord[] {
  const next = [record, ...loadScans()].slice(0, MAX);
  try {
    localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    /* storage full — keep newest only */
    try { localStorage.setItem(KEY, JSON.stringify(next.slice(0, 10))); } catch { /* ignore */ }
  }
  return next;
}

export function deleteScan(id: string): ScanRecord[] {
  const next = loadScans().filter((s) => s.id !== id);
  localStorage.setItem(KEY, JSON.stringify(next));
  return next;
}

export function markSynced(ids: string[]) {
  const next = loadScans().map((s) => (ids.includes(s.id) ? { ...s, synced: true } : s));
  localStorage.setItem(KEY, JSON.stringify(next));
  return next;
}

export const subjectMeta: Record<Subject, { label: string; emoji: string }> = {
  soil: { label: "Soil", emoji: "🪱" },
  crop: { label: "Crop", emoji: "🌱" },
  pest: { label: "Pest / Disease", emoji: "🐛" },
  livestock: { label: "Livestock", emoji: "🐐" },
  unknown: { label: "Scan", emoji: "🔍" },
};

/** Lightweight on-device heuristic used when there is no internet. */
export function offlineEstimate(canvas: HTMLCanvasElement): FrameAnalysis {
  const ctx = canvas.getContext("2d");
  const analysis: FrameAnalysis = {
    subject: "unknown",
    headline: "Offline estimate",
    spoken: "",
    detections: [],
  };
  if (!ctx) return analysis;
  const { width: w, height: h } = canvas;
  const data = ctx.getImageData(0, 0, w, h).data;
  let r = 0, g = 0, b = 0, n = 0;
  for (let i = 0; i < data.length; i += 4 * 16) {
    r += data[i]; g += data[i + 1]; b += data[i + 2]; n++;
  }
  r /= n; g /= n; b /= n;
  const greenish = g > r * 1.08 && g > b * 1.08;
  const brightness = (r + g + b) / 3;
  if (greenish) {
    const score = Math.max(40, Math.min(95, Math.round((g / (r + 1)) * 60)));
    analysis.subject = "crop";
    analysis.headline = `Green vegetation detected — estimated vigour ${score}%`;
    analysis.crop = { crop: "Green crop", growth_stage: "Unknown (offline)", health_score: score };
    analysis.detections = [{ label: "Vegetation", confidence: 70, status: score > 65 ? "good" : "warn", box: [0.15, 0.2, 0.7, 0.6] }];
  } else if (r > g && r > b) {
    analysis.subject = "soil";
    analysis.headline = brightness < 90 ? "Dark reddish soil — likely moist laterite" : "Reddish soil surface detected";
    analysis.soil = {
      soil_type: "Reddish / laterite (offline estimate)",
      moisture: brightness < 90 ? "Likely moist" : "Likely dry",
      color: `RGB ${Math.round(r)},${Math.round(g)},${Math.round(b)}`,
    };
    analysis.detections = [{ label: "Soil surface", confidence: 65, status: "warn", box: [0.1, 0.3, 0.8, 0.6] }];
  } else {
    analysis.headline = "Offline mode — connect to internet for full AI analysis";
  }
  analysis.spoken = analysis.headline;
  return analysis;
}
