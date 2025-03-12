
import React, { createContext, useContext, useEffect, useState } from "react";
import { type Session, type User } from "@supabase/supabase-js";
import { supabase, mockAuth } from "../lib/supabase";
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
  const isDemoMode = !import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY;

  useEffect(() => {
    // Si estamos en modo demo, revisamos localStorage
    if (isDemoMode) {
      const storedUser = localStorage.getItem('demo_user');
      if (storedUser) {
        // Crear un usuario simulado
        const mockUser = {
          id: '1',
          email: mockAuth.demoCredentials.email,
          role: 'admin',
        } as User;
        
        setUser(mockUser);
        // No establecemos session porque no lo usamos directamente en la UI
      }
      setLoading(false);
      return;
    }

    // Si tenemos credenciales de Supabase, usamos la autenticación real
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => {
      if (!isDemoMode && subscription) {
        subscription.unsubscribe();
      }
    };
  }, [isDemoMode]);

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      
      // En modo demo, verificamos las credenciales contra nuestros valores fijos
      if (isDemoMode) {
        if (mockAuth.validateCredentials(email, password)) {
          // Crear un usuario simulado
          const mockUser = {
            id: '1',
            email: email,
            role: 'admin',
          } as User;
          
          setUser(mockUser);
          // Guardamos en localStorage para mantener la sesión
          localStorage.setItem('demo_user', JSON.stringify(mockUser));
          toast.success("Inicio de sesión exitoso (modo demo)");
          return;
        } else {
          toast.error("Credenciales incorrectas. En modo demo, use: admin@ejemplo.com / contraseña");
          throw new Error("Credenciales incorrectas");
        }
      }
      
      // En modo normal, usamos Supabase
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      
      if (error) {
        toast.error("Error al iniciar sesión: " + error.message);
        throw error;
      }
      
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
      
      // En modo demo, simplemente limpiamos el localStorage
      if (isDemoMode) {
        localStorage.removeItem('demo_user');
        setUser(null);
        toast.success("Sesión cerrada (modo demo)");
        return;
      }
      
      // En modo normal, usamos Supabase
      await supabase.auth.signOut();
      toast.success("Sesión cerrada");
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
