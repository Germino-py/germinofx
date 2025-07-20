import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Session } from "@supabase/supabase-js";
import { useToast } from "@/hooks/use-toast";

interface User {
  id: string;
  email: string;
  name: string;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (email: string, password: string, confirmPassword: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  sendPasswordResetEmail: (email: string) => Promise<{ success: boolean; error?: string }>;
  updatePassword: (password: string) => Promise<{ success: boolean; error?: string }>;
  isAuthenticated: boolean;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    setLoading(true);
    let previousSession: Session | null = null;

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, newSession) => {
        if (event === "SIGNED_IN" && previousSession === null) {
          toast({
            title: "Email confirmé !",
            description: "Votre compte a été vérifié. Bienvenue !",
          });
        }
        
        setSession(newSession);
        if (newSession?.user) {
          setUser({
            id: newSession.user.id,
            email: newSession.user.email || '',
            name: newSession.user.email?.split('@')[0] || ''
          });
        } else {
          setUser(null);
        }
        setLoading(false);
        previousSession = newSession;
      }
    );

    return () => {
      subscription?.unsubscribe();
    };
  }, [toast]);

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) return { success: false, error: error.message };
      return { success: true };
    } catch (error) {
      return { success: false, error: "Une erreur inattendue s'est produite" };
    }
  };

  const register = async (email: string, password: string, confirmPassword: string): Promise<{ success: boolean; error?: string }> => {
    if (password !== confirmPassword) {
      return { success: false, error: "Les mots de passe ne correspondent pas" };
    }

    try {
      // Simplification : On ne spécifie plus emailRedirectTo.
      // Supabase utilisera l'URL configurée dans le dashboard.
      const { error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) {
        if (error.message.includes("User already registered")) {
            return { success: false, error: "Un compte avec cette adresse e-mail existe déjà." };
        }
        return { success: false, error: error.message };
      }
      
      return { success: true };
    } catch (error) {
      return { success: false, error: "Une erreur inattendue s'est produite" };
    }
  };
  
  const sendPasswordResetEmail = async (email: string): Promise<{ success: boolean; error?: string }> => {
    try {
      // Simplification : Supabase ajoutera l'URL du site automatiquement.
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: '/tradecopilot/update-password',
      });
      if (error) return { success: false, error: error.message };
      return { success: true };
    } catch (error) {
      return { success: false, error: "Une erreur inattendue s'est produite" };
    }
  };

  const updatePassword = async (password: string): Promise<{ success: boolean; error?: string }> => {
    try {
        const { error } = await supabase.auth.updateUser({ password });
        if (error) return { success: false, error: error.message };
        return { success: true };
    } catch (error) {
        return { success: false, error: "Une erreur inattendue s'est produite" };
    }
  };

  const logout = async (): Promise<void> => {
    await supabase.auth.signOut();
  };

  const isAuthenticated = !!session;

  return (
    <AuthContext.Provider value={{ user, session, login, register, logout, sendPasswordResetEmail, updatePassword, isAuthenticated, loading }}>
      {children}
    </AuthContext.Provider>
  );
};