
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

const Index = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading) {
      if (user) {
        navigate("/dashboard");
      } else {
        navigate("/login");
      }
    }
  }, [user, loading, navigate]);

  // Show a loading indicator while checking authentication status
  return (
    <div className="flex h-screen items-center justify-center">
      <div className="animate-pulse text-center">
        <h2 className="text-2xl font-medium">Cargando...</h2>
      </div>
    </div>
  );
};

export default Index;
