import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import ThemeToggle from "./ThemeToggle";
import { Button } from "./ui/button";
import { LogOut } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

const Navigation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  const links = [
    { href: "/", label: "Home" },
    { href: "/llm-scanner", label: "Scans" },
    { href: "/llm-results", label: "Results" },
    { href: "/datasets", label: "Datasets" },
    { href: "/augment-prompt", label: "Augmentation" },
    { href: "/fine-tuning", label: "Fine-tuning" },
  ];

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
      <div className="flex flex-col md:flex-row h-auto md:h-16 items-start md:items-center px-4">
        <div className="flex flex-col md:flex-row items-start md:items-center space-y-2 md:space-y-0 md:space-x-6 my-4 md:my-0 w-full md:w-auto">
          {links.map((link) => (
            <Link
              key={link.href}
              to={link.href}
              className={cn(
                "text-sm font-medium transition-colors hover:text-primary whitespace-nowrap",
                location.pathname === link.href
                  ? "text-foreground"
                  : "text-muted-foreground"
              )}
            >
              {link.label}
            </Link>
          ))}
        </div>
        <div className="flex items-center space-x-4 ml-0 md:ml-auto mb-4 md:mb-0">
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