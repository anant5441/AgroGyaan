import { Toaster as Sonner } from "./components/ui/sonner";
import { TooltipProvider } from "./components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "./contexts/ThemeContext";
import { Toaster } from "./components/ui/toaster";
import { DashboardOverview } from "./pages/DashboardOverview";
import { AddEquipment } from "./pages/AddEquipments";
import { ViewEquipment } from "./pages/ViewEquipment";
import { Orders } from "./pages/Orders";
import { Notifications } from "./pages/Notifications";
import { SellerProfile } from "./pages/SellerProfile";
import NotFound from "./pages/NotFound";
import { DashboardLayout } from "./components/dashboard_Layout";

const queryClient = new QueryClient();

import React, { useEffect } from "react";

const App = () => {
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    const userData = urlParams.get('user');
    
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
              <Route path="/" element={<DashboardLayout />}>
                <Route index element={<DashboardOverview />} />
                <Route path="add-equipment" element={<AddEquipment />} />
                <Route path="equipment" element={<ViewEquipment />} />
                <Route path="browse-type" element={<DashboardOverview />} />
                <Route path="delete-equipment" element={<DashboardOverview />} />
                <Route path="orders" element={<Orders />} />
                <Route path="messages" element={<DashboardOverview />} />
                <Route path="notifications" element={<Notifications />} />
                <Route path="profile" element={<SellerProfile />} />
                <Route path="market-trends" element={<DashboardOverview />} />
              </Route>
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