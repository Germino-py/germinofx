import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { LoginForm } from "@/components/auth/LoginForm";
import { RegisterForm } from "@/components/auth/RegisterForm";
import { AppLayout } from "@/components/layout/AppLayout";
import { PositionCalculator } from "@/components/calculator/PositionCalculator";
import { useToast } from "@/hooks/use-toast";

const Index = () => {
  const { isAuthenticated, login, register, loading } = useAuth();
  const [isLoginMode, setIsLoginMode] = useState(true);
  const { toast } = useToast();

  const handleLogin = async (email: string, password: string) => {
    const result = await login(email, password);
    if (result.success) {
      toast({
        title: "Connexion réussie",
        description: "Bienvenue dans TradeCopilot",
      });
    } else {
      toast({
        title: "Erreur de connexion",
        description: result.error || "Email ou mot de passe incorrect",
        variant: "destructive"
      });
    }
  };

  const handleRegister = async (email: string, password: string, confirmPassword: string) => {
    const result = await register(email, password, confirmPassword);
    if (result.success) {
      toast({
        title: "Inscription réussie",
        description: "Vérifiez votre email pour confirmer votre compte",
      });
    } else {
      toast({
        title: "Erreur d'inscription",
        description: result.error || "Vérifiez vos informations et réessayez",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Chargement...</p>
        </div>
      </div>
    );
  }

  // Si l'utilisateur est authentifié, on affiche l'application normalement
  if (isAuthenticated) {
    return (
      <AppLayout>
        <PositionCalculator />
      </AppLayout>
    );
  }

  // Si non authentifié, on affiche la page de connexion/inscription avec le fond 3D
  return (
    <div className="auth-page-container">
      <div className="auth-background">
        <div className="grid-container"></div>
      </div>
      
      <div className="auth-form-wrapper">
        {isLoginMode ? (
          <LoginForm 
            onLogin={handleLogin}
            onSwitchToRegister={() => setIsLoginMode(false)}
          />
        ) : (
          <RegisterForm 
            onRegister={handleRegister}
            onSwitchToLogin={() => setIsLoginMode(true)}
          />
        )}
      </div>
    </div>
  );
};

export default Index;