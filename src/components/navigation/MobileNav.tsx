import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { NavLinks } from "./NavLinks";

export const MobileNav = () => {
  const location = useLocation();
  
  return (
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
  );
};