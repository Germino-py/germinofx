import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { LandingPage } from "./pages/LandingPage";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import Journal from "./pages/Journal";
import Analytics from "./pages/Analytics";
import Calendar from "./pages/Calendar";
import NotFound from "./pages/NotFound";
import ResetPassword from "./pages/ResetPassword";
import UpdatePassword from "./pages/UpdatePassword";
import { SpeedInsights } from "@vercel/speed-insights/react";

const queryClient = new QueryClient();

// Ce composant interne gère la logique de routage et peut utiliser des hooks
const AppRouter = () => {
  const { isPasswordRecovery } = useAuth();
  const location = useLocation();

  // Si l'utilisateur est en mode récupération de mot de passe, on le force vers la page de mise à jour
  if (isPasswordRecovery && location.pathname !== "/tradecopilot/update-password") {
    return <Navigate to="/tradecopilot/update-password" replace />;
  }

  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/tradecopilot" element={<Index />} />
      <Route path="/tradecopilot/dashboard" element={<Dashboard />} />
      <Route path="/tradecopilot/journal" element={<Journal />} />
      <Route path="/tradecopilot/analytics" element={<Analytics />} />
      <Route path="/tradecopilot/calendar" element={<Calendar />} />
      <Route path="/tradecopilot/reset-password" element={<ResetPassword />} />
      <Route path="/tradecopilot/update-password" element={<UpdatePassword />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AppRouter />
        </BrowserRouter>
        <SpeedInsights /> 
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;