import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/contexts/ThemeContext";
import Index from "./pages/Index";
import Marketplace from "./pages/Marketplace";
import Orders from "./pages/Orders";
import PriceTracker from "./pages/PriceTracker";
import Traceability from "./pages/Traceability";
import Messages from "./pages/Messages";
import Settings from "./pages/Settings";
import Notifications from "./pages/Notifications";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

import { useEffect } from "react";

const App = () => {
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    const userData = urlParams.get('user');

    console.log('URL params found:', { token, userData }); // Debug log
    
    if (token && userData) {
      try {
        // Parse the user data from JSON string
        const user = JSON.parse(decodeURIComponent(userData));
        
        // Store in sessionStorage for this domain
        sessionStorage.setItem('token', token);
        sessionStorage.setItem('user', JSON.stringify(user));
        
        console.log('Authentication data stored:', { token, user }); // Debug log
        
        // Clean up the URL (remove token parameters)
        const cleanUrl = window.location.origin + window.location.pathname;
        window.history.replaceState({}, document.title, cleanUrl);
        
        console.log('URL cleaned up');
      } catch (error) {
        console.error('Error processing URL authentication data:', error);
      }
    } else {
      console.log('No authentication data found in URL'); // Debug log
    }
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/marketplace" element={<Marketplace />} />
              <Route path="/orders" element={<Orders />} />
              <Route path="/price-tracker" element={<PriceTracker />} />
              <Route path="/traceability" element={<Traceability />} />
              <Route path="/messages" element={<Messages />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/notifications" element={<Notifications />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;
