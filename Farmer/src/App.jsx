// import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/components/theme-provider";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";
import CropCalendar from "./pages/CropCalender";
import OrganicGuide from "./pages/OrganicFarmingGuide";
import DiseaseClassifier from "./pages/DiseaseClassifier";
import { Navbar } from "./components/navbar";
import { MarketPriceDashboard } from "./pages/MarketPriceDashboard";
import { FeaturesPage } from "./pages/FeaturesPage";
import CropPrediction from "./pages/CropPrediction";
import NPKPrediction from "./pages/NPKPrediction";
import SimplePrediction from "./pages/SimplePrediction";
import Profile from "./pages/Profile";

import MyListings from './pages/MyListings';
import MyOrders from './pages/MyOrders';
import FarmerPanel from './pages/FarmerPanel';

const queryClient = new QueryClient();

import { useEffect } from "react";

const App = () => {
  // Check for token in URL on app load
  useEffect(() => {
    // const urlParams = new URLSearchParams(window.location.search);
    // const token = urlParams.get('token');
    // const userData = urlParams.get('user');

    // if (token && userData) {
    //   // Store in sessionStorage/localStorage for this domain
    //   sessionStorage.setItem('token', token);
    //   sessionStorage.setItem('user', userData);

    //   // Clean up the URL
    //   const cleanUrl = window.location.origin + window.location.pathname;
    //   window.history.replaceState({}, document.title, cleanUrl);
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    const user = params.get('user');

    if (token) {
      // Store in sessionStorage instead of localStorage for security
      sessionStorage.setItem('token', token);
      if (user) {
        sessionStorage.setItem('user', decodeURIComponent(user));
      }
      // Clean URL after storing
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="light" storageKey="agrogyaan-ui-theme">
        <TooltipProvider>
          {/* <Toaster /> */}
          <Sonner />
          <BrowserRouter>
            <Navbar />
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/login" element={<Login />} />
              <Route path="/calendar" element={< CropCalendar />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
              <Route path="/organic" element={<OrganicGuide />} />
              <Route path="/diseaseclassifier" element={<DiseaseClassifier />} />
              <Route path="/pricedashboard" element={<MarketPriceDashboard />} />
              <Route path="/features" element={<FeaturesPage />} />
              <Route path="/crop-prediction" element={<CropPrediction />} />
              <Route path="/npk-prediction" element={<NPKPrediction />} />
              <Route path="/simple-prediction" element={<SimplePrediction />} />
              <Route path="/listings" element={<MyListings />} />
              <Route path="/orders" element={<MyOrders />} />
              <Route path="/farmer-panel" element={<FarmerPanel />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;