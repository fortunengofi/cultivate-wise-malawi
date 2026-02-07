import { NavLink, useLocation } from "react-router-dom";
import { Home, Leaf, Cpu, Building2, BookOpen, ShoppingCart } from "lucide-react";
import { motion } from "framer-motion";

const navItems = [
  { to: "/", icon: Home, label: "Home" },
  { to: "/soil", icon: Leaf, label: "Soil AI" },
  { to: "/agritech", icon: Cpu, label: "AgriTech" },
  { to: "/services", icon: Building2, label: "Services" },
  { to: "/records", icon: BookOpen, label: "Records" },
  { to: "/market", icon: ShoppingCart, label: "Market" },
];

const BottomNav = () => {
  const location = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-lg border-t border-border safe-bottom shadow-elevated">
      <div className="flex items-center justify-around px-1 py-1.5">
        {navItems.map(({ to, icon: Icon, label }) => {
          const isActive = location.pathname === to;
          return (
            <NavLink
              key={to}
              to={to}
              className="flex flex-col items-center gap-0.5 py-1 px-2 rounded-lg min-w-[52px] transition-colors relative"
            >
              {isActive && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute inset-0 gradient-earth rounded-lg opacity-10"
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                />
              )}
              <Icon
                size={20}
                className={`transition-colors ${isActive ? "text-primary" : "text-muted-foreground"}`}
                strokeWidth={isActive ? 2.5 : 1.8}
              />
              <span
                className={`text-[10px] font-semibold leading-tight transition-colors ${
                  isActive ? "text-primary" : "text-muted-foreground"
                }`}
              >
                {label}
              </span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;
