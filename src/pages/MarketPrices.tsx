import { Link } from "react-router-dom";
import { ArrowRight, Loader2 } from "lucide-react";
import PageHeader from "@/components/PageHeader";
import CropLocationPicker from "@/components/CropLocationPicker";
import DemoBadge from "@/components/DemoBadge";
import { useFarm } from "@/contexts/FarmContext";
import { allCropPrices } from "@/services/marketApi";

const fmtDate = (iso?: string) =>
  iso ? new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : "—";

const Prices = () => {
  const { prices, best, crop, pricesLoading, marketRows } = useFarm();
  const sorted = [...prices.quotes].sort((a, b) => b.price - a.price);
  const all = allCropPrices(marketRows);
  const hasData = prices.quotes.length > 0;
  const lowest = hasData ? Math.min(...prices.quotes.map((q) => q.price)) : 0;

  return (
    <div className="flex flex-col max-w-5xl mx-auto">
      <PageHeader title="Market Prices" subtitle="Find the best market for your harvest" />

      <div className="px-4 sm:px-0 mt-6 space-y-6 pb-10">
        <CropLocationPicker showLocation={false} />

        {pricesLoading ? (
          <div className="flex justify-center py-10"><Loader2 className="animate-spin text-primary" /></div>
        ) : (
          <>
            {/* Best market */}
            {hasData ? (
              <section className="gradient-earth rounded-xl p-5 shadow-card">
                <p className="text-xs font-bold uppercase tracking-wide text-primary-foreground/80">Best recorded market</p>
                <p className="text-2xl font-bold text-primary-foreground mt-1">{prices.emoji} {crop} — {best.market}</p>
                <p className="text-3xl font-bold text-primary-foreground mt-1">MWK {best.price.toLocaleString()}/{prices.unit}</p>
                <p className="text-primary-foreground/80 text-sm mt-2">
                  {sorted.length > 1
                    ? `That is MWK ${(best.price - lowest).toLocaleString()} more per ${prices.unit} than the lowest recorded market. `
                    : ""}
                  Recorded {fmtDate(prices.updatedAt)}. Always subtract transport costs before deciding.
                </p>
              </section>
            ) : (
              <section className="bg-card rounded-xl p-5 border border-border shadow-soft">
                <p className="font-bold text-foreground">No price records for {crop} yet</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Farm Link only shows prices that have actually been recorded from markets. Choose another crop, or ask your
                  cooperative to submit today's {crop.toLowerCase()} price.
                </p>
              </section>
            )}

            {/* Comparison */}
            {hasData && (
              <section>
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-lg font-bold font-serif text-foreground">Recorded market prices</h2>
                  <DemoBadge label="Market records" />
                </div>
                <div className="space-y-2">
                  {sorted.map((q) => (
                    <div key={q.market} className={`bg-card rounded-xl p-4 border shadow-soft flex items-center justify-between ${q.market === best.market ? "border-primary" : "border-border"}`}>
                      <div>
                        <p className="font-bold text-foreground">{q.market}</p>
                        <p className="text-xs text-muted-foreground">average price per {prices.unit}</p>
                      </div>
                      <p className="text-lg font-bold text-foreground">MWK {q.price.toLocaleString()}</p>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground mt-3">
                  Prices come from recorded market surveys, last updated {fmtDate(prices.updatedAt)}. Local prices can change quickly.
                </p>
              </section>
            )}

            {/* All crops */}
            {all.length > 0 && (
              <section>
                <h2 className="text-lg font-bold font-serif text-foreground mb-3">Recorded prices by product</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {all.map((a) => (
                    <div key={a.product} className="bg-card rounded-xl p-3 border border-border flex items-center justify-between gap-2">
                      <span className="font-semibold text-foreground">{a.product}</span>
                      <span className="text-sm font-bold text-secondary text-right">
                        MWK {a.minPrice.toLocaleString()}–{a.maxPrice.toLocaleString()}/{a.unit} • {a.market}
                      </span>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </>
        )}

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
