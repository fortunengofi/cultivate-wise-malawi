import { useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { Home, Leaf, Cpu, Building2, BookOpen, ShoppingCart, Menu, X, MessageCircle, User as UserIcon, LogOut, LogIn } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

const navItems = [
  { to: "/", icon: Home, label: "Home" },
  { to: "/soil", icon: Leaf, label: "Soil AI" },
  { to: "/agritech", icon: Cpu, label: "AgriTech" },
  { to: "/services", icon: Building2, label: "Services" },
  { to: "/records", icon: BookOpen, label: "Records" },
  { to: "/market", icon: ShoppingCart, label: "Market" },
  { to: "/messages", icon: MessageCircle, label: "Chats" },
];

const TopNav = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();

  return (
    <header className="sticky top-0 z-50 bg-card/95 backdrop-blur-lg border-b border-border shadow-soft">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-between h-14">
          {/* Logo */}
          <NavLink to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg gradient-earth flex items-center justify-center">
              <Leaf size={18} className="text-primary-foreground" />
            </div>
            <span className="font-serif font-bold text-foreground text-lg hidden sm:block">
              Ulimi Wanzeru
            </span>
            <span className="font-serif font-bold text-foreground text-base sm:hidden">
              Ulimi
            </span>
          </NavLink>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-1">
            {navItems.map(({ to, icon: Icon, label }) => {
              const isActive = location.pathname === to;
              return (
                <NavLink
                  key={to}
                  to={to}
                  className={`relative flex items-center gap-1.5 px-2.5 py-2 rounded-lg text-sm font-semibold transition-colors ${
                    isActive
                      ? "text-primary"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                  }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="activeDesktopTab"
                      className="absolute inset-0 bg-primary/10 rounded-lg"
                      transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    />
                  )}
                  <Icon size={16} className="relative z-10" strokeWidth={isActive ? 2.5 : 2} />
                  <span className="relative z-10">{label}</span>
                </NavLink>
              );
            })}
          </nav>

          <div className="flex items-center gap-2">
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="w-9 h-9 rounded-full gradient-earth flex items-center justify-center text-primary-foreground font-bold text-sm">
                    {(user.email?.[0] || "F").toUpperCase()}
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-52">
                  <div className="px-2 py-1.5 text-xs text-muted-foreground truncate">{user.email}</div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate("/profile")}>
                    <UserIcon size={14} className="mr-2" /> My Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate("/messages")}>
                    <MessageCircle size={14} className="mr-2" /> Messages
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate("/records")}>
                    <BookOpen size={14} className="mr-2" /> My Records
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={async () => { await signOut(); navigate("/"); }}>
                    <LogOut size={14} className="mr-2" /> Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button size="sm" onClick={() => navigate("/auth")} className="gradient-earth text-primary-foreground border-0 font-bold h-8">
                <LogIn size={14} className="mr-1" /> Sign In
              </Button>
            )}

            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="lg:hidden p-2 rounded-lg hover:bg-muted/50 transition-colors text-foreground"
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Dropdown */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden overflow-hidden border-t border-border bg-card"
          >
            <nav className="px-4 py-3 space-y-1">
              {navItems.map(({ to, icon: Icon, label }) => {
                const isActive = location.pathname === to;
                return (
                  <NavLink
                    key={to}
                    to={to}
                    onClick={() => setMobileOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold transition-colors ${
                      isActive
                        ? "text-primary bg-primary/10"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                    }`}
                  >
                    <Icon size={18} strokeWidth={isActive ? 2.5 : 2} />
                    <span>{label}</span>
                  </NavLink>
                );
              })}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default TopNav;
