import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { TrendingUp, Calculator, Calendar, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import PageHeader from "@/components/PageHeader";
import { supabase } from "@/integrations/supabase/client";

interface MarketPrice {
  id: string;
  product: string;
  unit: string;
  min_price: number;
  max_price: number;
  market: string;
}

const seasons = [
  { month: "Oct - Dec", crops: "Maize, Groundnuts, Soya, Beans", phase: "Planting (rainy season)" },
  { month: "Jan - Mar", crops: "Weeding, top-dressing fertilizer", phase: "Growing" },
  { month: "Apr - Jun", crops: "Harvest maize, beans, groundnuts", phase: "Harvest" },
  { month: "Jul - Sep", crops: "Irrigated tomatoes, vegetables, winter maize", phase: "Dry season / dimba" },
];

const Insights = () => {
  const [prices, setPrices] = useState<MarketPrice[]>([]);
  const [loading, setLoading] = useState(true);

  // Profit calculator
  const [revenue, setRevenue] = useState("");
  const [costs, setCosts] = useState("");
  const profit = (parseFloat(revenue || "0") || 0) - (parseFloat(costs || "0") || 0);
  const margin = parseFloat(revenue) > 0 ? (profit / parseFloat(revenue)) * 100 : 0;

  useEffect(() => {
    supabase.from("market_prices").select("*").order("product").then(({ data }) => {
      setPrices(data || []);
      setLoading(false);
    });
  }, []);

  return (
    <div className="flex flex-col max-w-5xl mx-auto">
      <PageHeader title="Profit Insights" subtitle="Make smarter decisions, earn more" />

      <div className="px-4 sm:px-0 mt-6 space-y-6 pb-8">
        {/* Market prices */}
        <section>
          <h2 className="text-lg font-bold font-serif text-foreground mb-3 flex items-center gap-2">
            <TrendingUp size={20} className="text-primary" /> Today's Market Prices
          </h2>
          {loading ? (
            <div className="flex justify-center py-6"><Loader2 className="animate-spin text-primary" /></div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {prices.map((p, i) => (
                <motion.div
                  key={p.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className="bg-card rounded-xl p-4 shadow-soft border border-border"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-bold text-foreground">{p.product}</p>
                      <p className="text-xs text-muted-foreground">{p.market} • per {p.unit}</p>
                    </div>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-semibold">Live</span>
                  </div>
                  <p className="text-lg font-bold text-secondary mt-2">
                    MK {p.min_price.toLocaleString()} – {p.max_price.toLocaleString()}
                  </p>
                </motion.div>
              ))}
            </div>
          )}
        </section>

        {/* Profit calculator */}
        <section>
          <h2 className="text-lg font-bold font-serif text-foreground mb-3 flex items-center gap-2">
            <Calculator size={20} className="text-primary" /> Profit Calculator
          </h2>
          <div className="bg-card rounded-xl p-5 shadow-card border border-border space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Expected revenue (MK)</Label>
                <Input type="number" value={revenue} onChange={(e) => setRevenue(e.target.value)} placeholder="e.g. 500000" />
              </div>
              <div className="space-y-1.5">
                <Label>Total costs (MK)</Label>
                <Input type="number" value={costs} onChange={(e) => setCosts(e.target.value)} placeholder="e.g. 200000" />
              </div>
            </div>
            <div className={`rounded-lg p-4 ${profit >= 0 ? "bg-primary/10" : "bg-destructive/10"}`}>
              <p className="text-xs font-semibold text-muted-foreground">Estimated profit</p>
              <p className={`text-2xl font-bold ${profit >= 0 ? "text-primary" : "text-destructive"}`}>
                MK {profit.toLocaleString()}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">Margin: {margin.toFixed(1)}%</p>
            </div>
          </div>
        </section>

        {/* Planting calendar */}
        <section>
          <h2 className="text-lg font-bold font-serif text-foreground mb-3 flex items-center gap-2">
            <Calendar size={20} className="text-primary" /> Malawi Planting Calendar
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {seasons.map((s, i) => (
              <motion.div
                key={s.month}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="bg-card rounded-xl p-4 shadow-soft border border-border"
              >
                <p className="text-xs font-bold text-secondary uppercase tracking-wide">{s.month}</p>
                <p className="font-bold text-foreground mt-1">{s.phase}</p>
                <p className="text-sm text-muted-foreground mt-1">{s.crops}</p>
              </motion.div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default Insights;