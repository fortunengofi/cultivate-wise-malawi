import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Leaf, Cpu, Building2, BookOpen, ShoppingCart, Sun, CloudRain, TrendingUp, MessageCircle, Compass, ArrowRight } from "lucide-react";
import HeroSlideshow from "@/components/HeroSlideshow";
import { useLanguage } from "@/contexts/LanguageContext";
import { useFarm } from "@/contexts/FarmContext";
import { conditionIcon } from "@/pages/Weather";

const Index = () => {
  const { t } = useLanguage();
  const { weather, timeline, irrigation, best, prices, crop } = useFarm();
  const weatherInfo = { temp: `${weather.current.temp}°C`, humidity: `${weather.current.humidity}%` };
  const smartCards = [
    { to: "/weather", emoji: "🌦️", title: t("navWeather"), line1: `${weather.current.temp}°C | ${weather.current.condition}`, line2: `Rain probability: ${weather.current.rainChance}%` },
    { to: "/calendar", emoji: "🌱", title: "Today's Farm Task", line1: `${timeline.current.name} — ${crop}`, line2: `Due now • ${timeline.current.window}` },
    { to: "/irrigation", emoji: "💧", title: t("navIrrigation"), line1: `${irrigation.moisture} soil moisture`, line2: irrigation.headline.replace(/^[^\w]+/, "") },
    { to: "/prices", emoji: "📈", title: "Market", line1: `${crop} — best price`, line2: `MWK ${best.price.toLocaleString()}/${prices.unit} • ${best.market}` },
  ];
  const quickActions = [
    { to: "/soil", icon: Leaf, label: t("soilAI"), description: t("soilAIDesc"), color: "gradient-earth" },
    { to: "/insights", icon: TrendingUp, label: t("profitInsights"), description: t("profitInsightsDesc"), color: "gradient-harvest" },
    { to: "/market", icon: ShoppingCart, label: t("navMarket"), description: t("marketDesc"), color: "gradient-earth" },
    { to: "/messages", icon: MessageCircle, label: t("navMessages"), description: t("messagesDesc"), color: "gradient-sky" },
    { to: "/records", icon: BookOpen, label: t("navRecords"), description: t("recordsDesc"), color: "gradient-earth" },
    { to: "/agritech", icon: Cpu, label: t("navAgriTech"), description: t("agritechDesc"), color: "gradient-harvest" },
    { to: "/services", icon: Building2, label: t("navServices"), description: t("servicesDesc"), color: "gradient-sky" },
  ];
  return (
    <div className="flex flex-col max-w-6xl mx-auto">
      {/* Hero Slideshow */}
      <HeroSlideshow />

      {/* Weather Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mx-4 sm:mx-0 -mt-8 relative z-10"
      >
        <div className="bg-card rounded-xl p-4 shadow-card border border-border">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full gradient-sky flex items-center justify-center text-2xl">
                {conditionIcon(weather.current.condition)}
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{weatherInfo.temp}</p>
                <p className="text-xs text-muted-foreground font-medium">{weather.current.condition}</p>
              </div>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-1 text-muted-foreground">
                <CloudRain size={14} />
                <span className="text-xs font-semibold">{t("humidity")}: {weatherInfo.humidity}</span>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">{t("goodPlanting")}</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Today at a glance */}
      <div className="px-4 sm:px-0 mt-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-foreground font-serif">{t("todayAtGlance")}</h2>
          <Link to="/plan" className="text-sm font-bold text-primary flex items-center gap-1">
            <Compass size={14} /> {t("openFullPlan")}
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {smartCards.map((c) => (
            <Link
              key={c.to}
              to={c.to}
              className="bg-card rounded-xl p-4 border border-border shadow-soft hover:shadow-card transition-all active:scale-[0.98] flex items-start gap-3"
            >
              <span className="text-2xl leading-none">{c.emoji}</span>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">{c.title}</p>
                <p className="font-bold text-foreground text-sm mt-0.5">{c.line1}</p>
                <p className="text-xs text-muted-foreground leading-snug">{c.line2}</p>
              </div>
              <ArrowRight size={16} className="text-primary shrink-0 mt-1" />
            </Link>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="px-4 sm:px-0 mt-8">
        <h2 className="text-lg font-bold text-foreground mb-4 font-serif">{t("quickActions")}</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {quickActions.map((action, index) => (
            <motion.div
              key={action.to}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + index * 0.06 }}
            >
              <Link
                to={action.to}
                className="flex flex-col items-start p-4 rounded-xl bg-card border border-border shadow-soft hover:shadow-card transition-all hover:-translate-y-0.5 active:scale-[0.98] group"
              >
                <div className={`w-10 h-10 rounded-lg ${action.color} flex items-center justify-center mb-3`}>
                  <action.icon size={20} className="text-primary-foreground" />
                </div>
                <h3 className="font-bold text-sm text-foreground">{action.label}</h3>
                <p className="text-xs text-muted-foreground mt-0.5 leading-snug">{action.description}</p>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Tips Section */}
      <div className="px-4 sm:px-0 mt-8 mb-8">
        <h2 className="text-lg font-bold text-foreground mb-4 font-serif">{t("todaysTip")}</h2>
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.6 }}
          className="gradient-earth rounded-xl p-5 shadow-card"
        >
          <div className="flex items-start gap-3">
            <div className="text-3xl">🌱</div>
            <div>
              <h3 className="font-bold text-primary-foreground text-sm">{t("maizeTip")}</h3>
              <p className="text-primary-foreground/80 text-xs mt-1 leading-relaxed">
                {t("maizeTipBody")}
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Index;
