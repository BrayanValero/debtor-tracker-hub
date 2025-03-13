
import React, { createContext, useContext, useEffect, useState } from "react";
import { type Session, type User } from "@supabase/supabase-js";
import { supabase } from "../lib/supabase";
import { toast } from "sonner";

type AuthContextType = {
  session: Session | null;
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log("AuthProvider initializing...");
    
    // Get initial session
    const initializeAuth = async () => {
      try {
        console.log("Getting initial session...");
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error("Error getting session:", error.message);
          toast.error("Error de autenticación");
        } else {
          console.log("Session data:", data.session ? "Session exists" : "No session");
          setSession(data.session);
          setUser(data.session?.user ?? null);
        }
      } catch (error) {
        console.error("Error initializing auth:", error);
      } finally {
        setLoading(false);
        console.log("Auth initialization complete");
      }
    };

    initializeAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("Auth state changed:", event);
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      console.log("Attempting sign in with:", email);
      
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      
      if (error) {
        console.error("Sign in error:", error.message);
        toast.error("Error al iniciar sesión: " + error.message);
        throw error;
      }
      
      console.log("Sign in successful");
      toast.success("Inicio de sesión exitoso");
    } catch (error) {
      console.error("Error al iniciar sesión:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setLoading(true);
      console.log("Signing out...");
      
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error("Sign out error:", error.message);
        toast.error("Error al cerrar sesión: " + error.message);
      } else {
        console.log("Sign out successful");
        toast.success("Sesión cerrada");
      }
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
      toast.error("Error al cerrar sesión");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ session, user, loading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth debe ser usado dentro de un AuthProvider");
  }
  return context;
};
