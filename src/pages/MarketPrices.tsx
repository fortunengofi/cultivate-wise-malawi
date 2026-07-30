import { Link } from "react-router-dom";
import { TrendingUp, TrendingDown, Minus, ArrowRight } from "lucide-react";
import PageHeader from "@/components/PageHeader";
import CropLocationPicker from "@/components/CropLocationPicker";
import DemoBadge from "@/components/DemoBadge";
import { useFarm } from "@/contexts/FarmContext";
import { getAllBestPrices } from "@/services/farmData";

const Prices = () => {
  const { prices, best, crop } = useFarm();
  const sorted = [...prices.quotes].sort((a, b) => b.price - a.price);
  const all = getAllBestPrices();
  const maxH = Math.max(...prices.history);
  const minH = Math.min(...prices.history);

  return (
    <div className="flex flex-col max-w-5xl mx-auto">
      <PageHeader title="Market Prices" subtitle="Find the best market for your harvest" />

      <div className="px-4 sm:px-0 mt-6 space-y-6 pb-10">
        <CropLocationPicker showLocation={false} />

        {/* Best market */}
        <section className="gradient-earth rounded-xl p-5 shadow-card">
          <p className="text-xs font-bold uppercase tracking-wide text-primary-foreground/80">Best market today</p>
          <p className="text-2xl font-bold text-primary-foreground mt-1">{prices.emoji} {crop} — {best.market}</p>
          <p className="text-3xl font-bold text-primary-foreground mt-1">MWK {best.price.toLocaleString()}/{prices.unit}</p>
          <p className="text-primary-foreground/80 text-sm mt-2">
            That is MWK {(best.price - Math.min(...prices.quotes.map((q) => q.price))).toLocaleString()} more per {prices.unit} than the lowest market. Remember to subtract transport costs before deciding.
          </p>
        </section>

        {/* Comparison */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-bold font-serif text-foreground">Price comparison</h2>
            <DemoBadge />
          </div>
          <div className="space-y-2">
            {sorted.map((q) => (
              <div key={q.market} className={`bg-card rounded-xl p-4 border shadow-soft flex items-center justify-between ${q.market === best.market ? "border-primary" : "border-border"}`}>
                <div>
                  <p className="font-bold text-foreground">{q.market}</p>
                  <p className="text-xs text-muted-foreground">per {prices.unit}</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-foreground">MWK {q.price.toLocaleString()}</p>
                  <p className={`text-xs font-semibold flex items-center justify-end gap-1 ${q.trend === "up" ? "text-primary" : q.trend === "down" ? "text-destructive" : "text-muted-foreground"}`}>
                    {q.trend === "up" ? <TrendingUp size={12} /> : q.trend === "down" ? <TrendingDown size={12} /> : <Minus size={12} />}
                    {q.changePct > 0 ? "+" : ""}{q.changePct}% this week
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Trend */}
        <section className="bg-card rounded-xl p-5 border border-border shadow-soft">
          <h2 className="text-lg font-bold font-serif text-foreground mb-3">6-month price trend</h2>
          <div className="flex items-end gap-2 h-32">
            {prices.history.map((v, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <span className="text-[10px] font-semibold text-muted-foreground">{v.toLocaleString()}</span>
                <div className="w-full rounded-t-md bg-primary/70" style={{ height: `${20 + ((v - minH) / Math.max(1, maxH - minH)) * 80}px` }} />
                <span className="text-[10px] text-muted-foreground">M{i + 1}</span>
              </div>
            ))}
          </div>
          <p className="text-xs text-muted-foreground mt-3">Prices are indicative sample data for demonstration and can change quickly at local markets.</p>
        </section>

        {/* All crops */}
        <section>
          <h2 className="text-lg font-bold font-serif text-foreground mb-3">Best price by crop</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {all.map((a) => (
              <div key={a.crop} className="bg-card rounded-xl p-3 border border-border flex items-center justify-between">
                <span className="font-semibold text-foreground">{a.emoji} {a.crop}</span>
                <span className="text-sm font-bold text-secondary">MWK {a.best.price.toLocaleString()}/{a.unit} • {a.best.market}</span>
              </div>
            ))}
          </div>
        </section>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Link to="/insights" className="flex items-center justify-between bg-card rounded-xl p-4 border border-border shadow-soft">
            <span className="font-bold text-foreground">📈 Estimate your profit</span><ArrowRight size={18} className="text-primary" />
          </Link>
          <Link to="/market" className="flex items-center justify-between bg-card rounded-xl p-4 border border-border shadow-soft">
            <span className="font-bold text-foreground">🛒 List {crop} for sale</span><ArrowRight size={18} className="text-primary" />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Prices;
