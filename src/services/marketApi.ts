/**
 * REAL market price data for Farm Link.
 * Source: the `market_prices` table in the project backend — records published
 * from actual market surveys. No generated/random figures.
 */
import { supabase } from "@/integrations/supabase/client";
import { CropPrices, MarketQuote, CROP_PLANS } from "./farmData";

export interface MarketPriceRow {
  id: string;
  product: string;
  market: string;
  unit: string;
  min_price: number;
  max_price: number;
  updated_at: string;
}

/** Crop names in the app → product names as recorded in the market table. */
const PRODUCT_ALIASES: Record<string, string[]> = {
  Maize: ["maize"],
  Rice: ["rice", "paddy"],
  Groundnuts: ["groundnuts", "groundnut"],
  Beans: ["beans", "bean"],
  Tomatoes: ["tomatoes", "tomato"],
  Soybeans: ["soya beans", "soybeans", "soya"],
  Potatoes: ["sweet potatoes", "potatoes", "irish potatoes"],
};

export interface LivePrices extends CropPrices {
  source: "market_records" | "none";
  updatedAt?: string;
}

export async function fetchMarketRows(): Promise<MarketPriceRow[]> {
  const { data, error } = await supabase
    .from("market_prices")
    .select("id,product,market,unit,min_price,max_price,updated_at")
    .order("product");
  if (error) return [];
  return (data || []) as MarketPriceRow[];
}

const matches = (crop: string, product: string) =>
  (PRODUCT_ALIASES[crop] ?? [crop.toLowerCase()]).includes(product.trim().toLowerCase());

export function pricesForCrop(crop: string, rows: MarketPriceRow[]): LivePrices {
  const emoji = CROP_PLANS[crop]?.emoji ?? "🌾";
  const mine = rows.filter((r) => matches(crop, r.product));
  if (!mine.length) {
    return { crop, emoji, unit: "kg", quotes: [], history: [], source: "none" };
  }
  const quotes: MarketQuote[] = mine.map((r) => ({
    market: r.market,
    price: Math.round((r.min_price + r.max_price) / 2),
    trend: "flat",
    changePct: 0,
  }));
  const updatedAt = mine.map((r) => r.updated_at).sort().reverse()[0];
  return { crop, emoji, unit: mine[0].unit, quotes, history: [], source: "market_records", updatedAt };
}

export function allCropPrices(rows: MarketPriceRow[]) {
  const byProduct = new Map<string, MarketPriceRow[]>();
  rows.forEach((r) => {
    const key = r.product.trim();
    byProduct.set(key, [...(byProduct.get(key) || []), r]);
  });
  return Array.from(byProduct.entries()).map(([product, list]) => {
    const best = list.reduce((a, b) => (b.max_price > a.max_price ? b : a));
    return {
      product,
      unit: best.unit,
      market: best.market,
      minPrice: Math.min(...list.map((l) => l.min_price)),
      maxPrice: best.max_price,
      updatedAt: best.updated_at,
    };
  });
}