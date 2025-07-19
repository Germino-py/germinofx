import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import Journal from "./pages/Journal";
import Analytics from "./pages/Analytics";
import Calendar from "./pages/Calendar";
import NotFound from "./pages/NotFound";
import ResetPassword from "./pages/ResetPassword";
import UpdatePassword from "./pages/UpdatePassword";
import { SpeedInsights } from "@vercel/speed-insights/react"; // CORRECTION ICI

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/journal" element={<Journal />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/calendar" element={<Calendar />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/update-password" element={<UpdatePassword />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
        <SpeedInsights /> 
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;