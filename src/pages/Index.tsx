import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Leaf, Cpu, Building2, BookOpen, ShoppingCart, MapPin, Sun, CloudRain } from "lucide-react";
import heroImage from "@/assets/hero-farm.jpg";

const quickActions = [
  { to: "/soil", icon: Leaf, label: "Soil AI", description: "Analyze soil & get crop tips", color: "gradient-earth" },
  { to: "/agritech", icon: Cpu, label: "AgriTech", description: "Modern farming tech", color: "gradient-harvest" },
  { to: "/services", icon: Building2, label: "Services", description: "Agencies & support", color: "gradient-sky" },
  { to: "/records", icon: BookOpen, label: "Records", description: "Track expenses & budgets", color: "gradient-earth" },
  { to: "/market", icon: ShoppingCart, label: "Market", description: "Buy & sell produce", color: "gradient-harvest" },
];

const weatherInfo = {
  temp: "28°C",
  condition: "Partly Cloudy",
  location: "Lilongwe, Malawi",
  humidity: "65%",
};

const Index = () => {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <div className="relative h-64 overflow-hidden">
        <img src={heroImage} alt="Malawian farmland" className="w-full h-full object-cover" />
        <div className="absolute inset-0 gradient-hero" />
        <div className="absolute inset-0 flex flex-col justify-end p-5">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex items-center gap-1.5 text-primary-foreground/80 text-xs mb-2">
              <MapPin size={12} />
              <span className="font-medium">{weatherInfo.location}</span>
            </div>
            <h1 className="text-3xl font-bold text-primary-foreground leading-tight">
              Ulimi Wanzeru
            </h1>
            <p className="text-primary-foreground/80 text-sm mt-1 font-medium">
              Smart Farming for Malawi 🌾
            </p>
          </motion.div>
        </div>
      </div>

      {/* Weather Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mx-4 -mt-6 relative z-10"
      >
        <div className="bg-card rounded-xl p-4 shadow-card border border-border">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full gradient-sky flex items-center justify-center">
                <Sun size={24} className="text-sky-foreground" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{weatherInfo.temp}</p>
                <p className="text-xs text-muted-foreground font-medium">{weatherInfo.condition}</p>
              </div>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-1 text-muted-foreground">
                <CloudRain size={14} />
                <span className="text-xs font-semibold">Humidity: {weatherInfo.humidity}</span>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">Good planting weather</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Quick Actions */}
      <div className="px-4 mt-6">
        <h2 className="text-lg font-bold text-foreground mb-3 font-serif">Quick Actions</h2>
        <div className="grid grid-cols-2 gap-3">
          {quickActions.map((action, index) => (
            <motion.div
              key={action.to}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + index * 0.08 }}
            >
              <Link
                to={action.to}
                className="flex flex-col items-start p-4 rounded-xl bg-card border border-border shadow-soft hover:shadow-card transition-all active:scale-[0.98] group"
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
      <div className="px-4 mt-6 mb-6">
        <h2 className="text-lg font-bold text-foreground mb-3 font-serif">Today's Tip</h2>
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.6 }}
          className="gradient-earth rounded-xl p-5 shadow-card"
        >
          <div className="flex items-start gap-3">
            <div className="text-3xl">🌱</div>
            <div>
              <h3 className="font-bold text-primary-foreground text-sm">Maize Planting Season</h3>
              <p className="text-primary-foreground/80 text-xs mt-1 leading-relaxed">
                The rainy season is starting — prepare your fields with compost and ensure proper spacing 
                of 75cm between rows for optimal maize growth. Consider intercropping with legumes for 
                soil nitrogen fixation.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Index;
