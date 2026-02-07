import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import AppLayout from "@/components/AppLayout";
import Index from "./pages/Index";
import SoilAnalyzer from "./pages/SoilAnalyzer";
import AgriTech from "./pages/AgriTech";
import Services from "./pages/Services";
import FarmRecords from "./pages/FarmRecords";
import Marketplace from "./pages/Marketplace";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AppLayout>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/soil" element={<SoilAnalyzer />} />
            <Route path="/agritech" element={<AgriTech />} />
            <Route path="/services" element={<Services />} />
            <Route path="/records" element={<FarmRecords />} />
            <Route path="/market" element={<Marketplace />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AppLayout>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
