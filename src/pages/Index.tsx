
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

const Index = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading) {
      // En modo de desarrollo, redirige directamente al dashboard
      // cuando faltan las credenciales de Supabase
      if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) {
        navigate("/dashboard");
        return;
      }
      
      if (user) {
        navigate("/dashboard");
      } else {
        navigate("/login");
      }
    }
  }, [user, loading, navigate]);

  return (
    <div className="flex h-screen items-center justify-center">
      <div className="animate-pulse text-center">
        <h2 className="text-2xl font-medium">Cargando...</h2>
      </div>
    </div>
  );
};

export default Index;
