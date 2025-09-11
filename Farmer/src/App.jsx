// import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/components/theme-provider";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import CropCalendar from "./pages/CropCalender";
import OrganicGuide from "./pages/OrganicFarmingGuide";
import DiseaseClassifier from "./pages/DiseaseClassifier";
import { Navbar } from "./components/navbar";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider defaultTheme="light" storageKey="agrogyaan-ui-theme">
      <TooltipProvider>
        {/* <Toaster /> */}
        <Sonner />
        <BrowserRouter>
        <Navbar/>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/calendar" element={< CropCalendar/>} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
            <Route path="/organic" element={<OrganicGuide />} />
            <Route path="/diseaseclassifier" element={<DiseaseClassifier />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;