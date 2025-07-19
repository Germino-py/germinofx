import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { User as SupabaseUser, Session } from "@supabase/supabase-js";

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

  useEffect(() => {
    setLoading(true);
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
        if (session?.user) {
          setUser({
            id: session.user.id,
            email: session.user.email || '',
            name: session.user.email?.split('@')[0] || ''
          });
        } else {
          setUser(null);
        }
        setLoading(false);
      }
    );

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        return { success: false, error: error.message };
      }

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
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/`
        }
      });

      if (error) {
        // Gère l'erreur spécifique de Supabase pour un utilisateur déjà existant
        if (error.message.includes("User already registered")) {
            return { success: false, error: "Un compte avec cette adresse e-mail existe déjà. Veuillez vous connecter ou réinitialiser votre mot de passe." };
        }
        return { success: false, error: error.message };
      }
      
      // Gère le cas où la confirmation par e-mail est activée
      if (data.user && !data.session) {
         return { success: true };
      }

      return { success: true };
    } catch (error) {
      return { success: false, error: "Une erreur inattendue s'est produite" };
    }
  };
  
  const sendPasswordResetEmail = async (email: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/update-password`,
      });

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      return { success: false, error: "Une erreur inattendue s'est produite" };
    }
  };

  const updatePassword = async (password: string): Promise<{ success: boolean; error?: string }> => {
    try {
        const { error } = await supabase.auth.updateUser({ password });

        if (error) {
            return { success: false, error: error.message };
        }

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
    <AuthContext.Provider value={{
      user,
      session,
      login,
      register,
      logout,
      sendPasswordResetEmail,
      updatePassword,
      isAuthenticated,
      loading
    }}>
      {children}
    </AuthContext.Provider>
  );
};