
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

const Index = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [isRedirecting, setIsRedirecting] = useState(false);

  useEffect(() => {
    // Only redirect if we've finished loading authentication state
    if (!loading && !isRedirecting) {
      setIsRedirecting(true);
      if (user) {
        console.log("User is authenticated, redirecting to dashboard");
        navigate("/dashboard");
      } else {
        console.log("User is not authenticated, redirecting to login");
        navigate("/login");
      }
    }
  }, [user, loading, navigate, isRedirecting]);

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
