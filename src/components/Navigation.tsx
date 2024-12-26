import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Button } from "./ui/button";
import { LogOut, Menu } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

const Navigation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  const links = [
    { href: "/", label: "Home" },
    { href: "/llm-scanner", label: "Scans" },
    { href: "/llm-results", label: "Results" },
    { href: "/datasets", label: "Datasets" },
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

  const NavLinks = () => (
    <>
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
    </>
  );

  return (
    <nav className="border-b">
      <div className="h-16 px-4 flex items-center justify-between">
        <Sheet>
          <SheetTrigger asChild className="md:hidden">
            <Button variant="ghost" size="icon">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[240px] sm:w-[280px]">
            <div className="flex flex-col space-y-4 py-4">
              <NavLinks />
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
          </SheetContent>
        </Sheet>

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