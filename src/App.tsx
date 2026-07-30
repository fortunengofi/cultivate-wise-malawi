import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import AppLayout from "@/components/AppLayout";
import { AuthProvider } from "@/contexts/AuthContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { FarmProvider } from "@/contexts/FarmContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import Index from "./pages/Index";
import SoilAnalyzer from "./pages/SoilAnalyzer";
import AgriTech from "./pages/AgriTech";
import Services from "./pages/Services";
import FarmRecords from "./pages/FarmRecords";
import Marketplace from "./pages/Marketplace";
import Auth from "./pages/Auth";
import Profile from "./pages/Profile";
import Messages from "./pages/Messages";
import Insights from "./pages/Insights";
import Weather from "./pages/Weather";
import MarketPrices from "./pages/MarketPrices";
import CropCalendar from "./pages/CropCalendar";
import Irrigation from "./pages/Irrigation";
import FarmPlan from "./pages/FarmPlan";
import About from "./pages/About";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <LanguageProvider>
            <FarmProvider>
            <AppLayout>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/soil" element={<SoilAnalyzer />} />
              <Route path="/agritech" element={<AgriTech />} />
              <Route path="/services" element={<Services />} />
              <Route path="/market" element={<Marketplace />} />
              <Route path="/insights" element={<Insights />} />
              <Route path="/weather" element={<Weather />} />
              <Route path="/prices" element={<MarketPrices />} />
              <Route path="/calendar" element={<CropCalendar />} />
              <Route path="/irrigation" element={<Irrigation />} />
              <Route path="/plan" element={<FarmPlan />} />
              <Route path="/about" element={<About />} />
              <Route path="/records" element={<ProtectedRoute><FarmRecords /></ProtectedRoute>} />
              <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
              <Route path="/messages" element={<ProtectedRoute><Messages /></ProtectedRoute>} />
              <Route path="/messages/:conversationId" element={<ProtectedRoute><Messages /></ProtectedRoute>} />
              <Route path="*" element={<NotFound />} />
            </Routes>
            </AppLayout>
            </FarmProvider>
          </LanguageProvider>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
