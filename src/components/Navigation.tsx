import { Link, useLocation, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import ThemeToggle from "./ThemeToggle";
import { Button } from "./ui/button";
import { LogOut } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { MobileNav } from "./navigation/MobileNav";
import { NavLinks } from "./navigation/NavLinks";

const Navigation = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      toast.success("Logged out successfully");
      navigate("/login");
    } catch (error) {
      toast.error("Error logging out");
    }
  };

  return (
    <nav className="border-b">
      <div className="h-16 px-4 flex items-center justify-between">
        <MobileNav />

        <div className="hidden md:flex items-center space-x-6">
          <NavLinks />
        </div>

        <div className="flex items-center space-x-4">
          <div className="hidden md:block">
            <Link
              to="/settings"
              className={cn(
                "text-sm font-medium transition-colors hover:text-primary",
                location.pathname === "/settings"
                  ? "text-foreground"
                  : "text-muted-foreground"
              )}
            >
              Keys
            </Link>
          </div>
          <ThemeToggle />
          <Button 
            variant="ghost" 
            size="icon"
            onClick={handleLogout}
            className="text-muted-foreground hover:text-foreground"
          >
            <LogOut className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;