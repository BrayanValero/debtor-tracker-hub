
import { Link, useLocation, useNavigate } from "react-router-dom";
import { 
  LayoutDashboard, 
  Users, 
  CreditCard, 
  BarChart3, 
  LogOut,
  Menu,
  X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { useState } from "react";
import { cn } from "@/lib/utils";

const Navbar = () => {
  const { signOut, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate("/login");
  };

  const navItems = [
    { name: "Dashboard", path: "/dashboard", icon: <LayoutDashboard className="h-5 w-5" /> },
    { name: "Deudores", path: "/deudores", icon: <Users className="h-5 w-5" /> },
    { name: "Pagos", path: "/pagos", icon: <CreditCard className="h-5 w-5" /> },
    { name: "Informes", path: "/informes", icon: <BarChart3 className="h-5 w-5" /> },
  ];

  if (!user) return null;

  return (
    <div className="sticky top-0 z-50 w-full bg-white/80 backdrop-blur-md border-b border-border shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center">
            <Link to="/dashboard" className="flex items-center space-x-2">
              <CreditCard className="h-6 w-6 text-primary" />
              <span className="font-bold text-xl">Préstamos</span>
            </Link>
          </div>

          {/* Desktop navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "flex items-center gap-1.5 text-sm font-medium transition-colors hover:text-primary smooth-transition",
                  location.pathname === item.path ? "text-primary" : "text-muted-foreground"
                )}
              >
                {item.icon}
                {item.name}
              </Link>
            ))}
          </nav>

          {/* User menu & mobile menu button */}
          <div className="flex items-center gap-4">
            <div className="hidden md:flex">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleSignOut}
                className="gap-1.5"
              >
                <LogOut className="h-4 w-4" />
                Salir
              </Button>
            </div>

            <div className="md:hidden">
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setIsMenuOpen(!isMenuOpen)}
              >
                {isMenuOpen ? (
                  <X className="h-5 w-5" />
                ) : (
                  <Menu className="h-5 w-5" />
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile navigation */}
      {isMenuOpen && (
        <div className="md:hidden bg-white border-t border-border animate-fade-in">
          <div className="container mx-auto py-3 px-4">
            <nav className="flex flex-col space-y-3">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={cn(
                    "flex items-center gap-2 py-2 px-3 rounded-md text-sm font-medium transition-colors",
                    location.pathname === item.path 
                      ? "bg-primary/10 text-primary" 
                      : "text-foreground hover:bg-muted"
                  )}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.icon}
                  {item.name}
                </Link>
              ))}
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleSignOut}
                className="gap-1.5 w-full justify-start"
              >
                <LogOut className="h-4 w-4" />
                Cerrar sesión
              </Button>
            </nav>
          </div>
        </div>
      )}
    </div>
  );
};

export default Navbar;
