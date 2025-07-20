import { useState, useEffect, useRef, Suspense } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { LoginForm } from "@/components/auth/LoginForm";
import { RegisterForm } from "@/components/auth/RegisterForm";
import { AppLayout } from "@/components/layout/AppLayout";
import { PositionCalculator } from "@/components/calculator/PositionCalculator";
import { useToast } from "@/hooks/use-toast";
import { Scene } from "@/components/3d/Scene";

const Index = () => {
  const { isAuthenticated, login, register, loading } = useAuth();
  const [isLoginMode, setIsLoginMode] = useState(true);
  const { toast } = useToast();
  const cursorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => { if (cursorRef.current) { cursorRef.current.style.left = `${e.clientX}px`; cursorRef.current.style.top = `${e.clientY}px`; } };
    const handleMouseOver = (e: MouseEvent) => { if ((e.target as HTMLElement).closest('button, a, input, select')) { cursorRef.current?.classList.add('hover'); } };
    const handleMouseOut = (e: MouseEvent) => { if ((e.target as HTMLElement).closest('button, a, input, select')) { cursorRef.current?.classList.remove('hover'); } };
    
    if (!isAuthenticated) {
      window.addEventListener('mousemove', handleMouseMove);
      document.body.addEventListener('mouseover', handleMouseOver);
      document.body.addEventListener('mouseout', handleMouseOut);
    }
    
    return () => { 
      window.removeEventListener('mousemove', handleMouseMove); 
      document.body.removeEventListener('mouseover', handleMouseOver); 
      document.body.removeEventListener('mouseout', handleMouseOut); 
    };
  }, [isAuthenticated]);

  const handleLogin = async (email: string, password: string) => {
    const result = await login(email, password);
    if (!result.success) {
      toast({ title: "Erreur de connexion", description: result.error || "Email ou mot de passe incorrect", variant: "destructive" });
    }
  };

  const handleRegister = async (email: string, password: string, confirmPassword: string) => {
    const result = await register(email, password, confirmPassword);
    if (result.success) {
      toast({ title: "Inscription réussie", description: "Vérifiez votre email pour confirmer votre compte" });
    } else {
      toast({ title: "Erreur d'inscription", description: result.error || "Vérifiez vos informations", variant: "destructive" });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
      </div>
    );
  }

  if (isAuthenticated) {
    return <AppLayout><PositionCalculator /></AppLayout>;
  }

  return (
    <div className="auth-page-container-3d">
      <div ref={cursorRef} className="custom-cursor hidden md:block"></div>
      <div className="auth-background-3d">
        <Suspense fallback={null}>
          <Scene />
        </Suspense>
      </div>
      <div className="relative z-10">
        {isLoginMode ? <LoginForm onLogin={handleLogin} onSwitchToRegister={() => setIsLoginMode(false)} /> : <RegisterForm onRegister={handleRegister} onSwitchToLogin={() => setIsLoginMode(true)} />}
      </div>
    </div>
  );
};

export default Index;