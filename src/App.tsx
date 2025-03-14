
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Deudores from "./pages/Deudores";
import DeudorForm from "./pages/DeudorForm";
import Pagos from "./pages/Pagos";
import PagoForm from "./pages/PagoForm";
import Informes from "./pages/Informes";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

// Componente para rutas protegidas
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="flex h-screen items-center justify-center">Cargando...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

const AppRoutes = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/deudores" element={<ProtectedRoute><Deudores /></ProtectedRoute>} />
        <Route path="/deudores/nuevo" element={<ProtectedRoute><DeudorForm /></ProtectedRoute>} />
        <Route path="/deudores/:id" element={<ProtectedRoute><DeudorForm /></ProtectedRoute>} />
        <Route path="/pagos" element={<ProtectedRoute><Pagos /></ProtectedRoute>} />
        <Route path="/pagos/nuevo" element={<ProtectedRoute><PagoForm /></ProtectedRoute>} />
        <Route path="/pagos/:id" element={<ProtectedRoute><PagoForm /></ProtectedRoute>} />
        <Route path="/informes" element={<ProtectedRoute><Informes /></ProtectedRoute>} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <AppRoutes />
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
