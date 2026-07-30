import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import PageHeader from "@/components/PageHeader";
import CropLocationPicker from "@/components/CropLocationPicker";
import { useFarm } from "@/contexts/FarmContext";
import { conditionIcon } from "@/pages/Weather";

const Step = ({ n, title, to, cta, children }: { n: number; title: string; to: string; cta: string; children: React.ReactNode }) => (
  <div className="bg-card rounded-xl p-5 border border-border shadow-soft">
    <div className="flex items-center gap-2">
      <span className="w-6 h-6 rounded-full gradient-earth text-primary-foreground text-xs font-bold flex items-center justify-center">{n}</span>
      <h2 className="font-bold text-foreground font-serif text-lg">{title}</h2>
    </div>
    <div className="mt-2 text-sm text-muted-foreground leading-relaxed">{children}</div>
    <Link to={to} className="mt-3 inline-flex items-center gap-1 text-sm font-bold text-primary">{cta} <ArrowRight size={14} /></Link>
  </div>
);

const FarmPlan = () => {
  const { crop, weather, timeline, irrigation, prices, best } = useFarm();
  const lowest = Math.min(...prices.quotes.map((q) => q.price));
  const exampleYield = 1000; // kg — illustrative
  const grossBest = best.price * exampleYield;

  return (
    <div className="flex flex-col max-w-5xl mx-auto">
      <PageHeader title={`My Farm Plan`} subtitle="One crop, one plan — from field to market" />

      <div className="px-4 sm:px-0 mt-6 space-y-4 pb-10">
        <CropLocationPicker />

        <div className="gradient-earth rounded-xl p-5 shadow-card">
          <p className="text-primary-foreground/80 text-xs font-bold uppercase tracking-wide">Your selection</p>
          <p className="text-2xl font-bold text-primary-foreground">{timeline.plan.emoji} {crop} • {weather.location.name}</p>
        </div>

        <Step n={1} title="Crop Calendar" to="/calendar" cta="Open crop calendar">
          Current stage: <strong className="text-foreground">{timeline.current.name}</strong> ({timeline.current.window}).{" "}
          {timeline.next ? <>Next: <strong className="text-foreground">{timeline.next.name}</strong> ({timeline.next.window}).</> : "You are at the end of the season."}
          <br />{timeline.current.advice}
        </Step>

        <Step n={2} title="Weather Forecast" to="/weather" cta="See 7-day forecast">
          {conditionIcon(weather.current.condition)} {weather.current.temp}°C, {weather.current.condition}. Rain probability today {weather.current.rainChance}%,
          tomorrow {weather.forecast[1].rainChance}%. About {weather.rainLast7Days}mm of rain fell in the last 7 days.
        </Step>

        <Step n={3} title="Irrigation Recommendation" to="/irrigation" cta="Open irrigation assistant">
          <strong className="text-foreground">{irrigation.headline}</strong><br />
          Soil moisture: {irrigation.moisture}. {irrigation.action}
        </Step>

        <Step n={4} title="Market Prices" to="/prices" cta="Compare all markets">
          Best market for {crop}: <strong className="text-foreground">{best.market} — MWK {best.price.toLocaleString()}/{prices.unit}</strong>.
          Lowest quoted market is MWK {lowest.toLocaleString()}/{prices.unit}.
        </Step>

        <Step n={5} title="Profit Insights" to="/insights" cta="Open profit calculator">
          Example: selling {exampleYield.toLocaleString()}kg at the best market would bring about{" "}
          <strong className="text-foreground">MWK {grossBest.toLocaleString()}</strong> before costs. Use the calculator with your own inputs and transport costs.
        </Step>

        <Step n={6} title="Marketplace" to="/market" cta={`List ${crop} for sale`}>
          Post your {crop} with photos, quantity and price, then chat directly with buyers in Messages.
        </Step>

        <p className="text-xs text-muted-foreground">
          Weather and market figures are realistic sample data for demonstration. Farm Link gives decision support — always confirm with your local extension officer.
        </p>
      </div>
    </div>
  );
};

export default FarmPlan;
