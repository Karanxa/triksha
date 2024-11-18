import { Link, useLocation, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import ThemeToggle from "./ThemeToggle";
import { Button } from "./ui/button";
import { LogOut } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const Navigation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  const links = [
    { href: "/", label: "Home" },
    { href: "/llm-scanner", label: "Red Teaming" },
    { href: "/llm-results", label: "Results" },
    { href: "/datasets", label: "Datasets" },
    { href: "/augment-prompt", label: "Augment Prompt" },
    { href: "/fine-tuning", label: "Fine Tuning" },
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

  // Don't show navigation links on home page
  const showLinks = location.pathname !== "/";

  return (
    <nav className="border-b">
      <div className="flex h-16 items-center px-4">
        {showLinks && (
          <div className="flex items-center space-x-4 lg:space-x-6 mx-6">
            {links.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className={cn(
                  "text-sm font-medium transition-colors hover:text-primary",
                  location.pathname === link.href
                    ? "text-foreground"
                    : "text-muted-foreground"
                )}
              >
                {link.label}
              </Link>
            ))}
          </div>
        )}
        <div className="ml-auto flex items-center space-x-4">
          <Link
            to="/settings"
            className={cn(
              "text-sm font-medium transition-colors hover:text-primary",
              location.pathname === "/settings"
                ? "text-foreground"
                : "text-muted-foreground"
            )}
          >
            API Keys
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