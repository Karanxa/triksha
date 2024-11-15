import { Link, useLocation } from "react-router-dom";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import { Button } from "@/components/ui/button";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import { Settings } from "lucide-react";

const Navigation = () => {
  const location = useLocation();
  const supabase = useSupabaseClient();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="border-b">
      <div className="container flex h-16 items-center justify-between">
        <NavigationMenu>
          <NavigationMenuList className="gap-6">
            <NavigationMenuItem>
              <Link
                to="/"
                className={`${navigationMenuTriggerStyle()} ${
                  isActive("/") ? "bg-accent" : ""
                }`}
              >
                Home
              </Link>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <Link
                to="/llm-scanner"
                className={`${navigationMenuTriggerStyle()} ${
                  isActive("/llm-scanner") ? "bg-accent" : ""
                }`}
              >
                LLM Scanner
              </Link>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <Link
                to="/llm-results"
                className={`${navigationMenuTriggerStyle()} ${
                  isActive("/llm-results") ? "bg-accent" : ""
                }`}
              >
                Results
              </Link>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <Link
                to="/datasets"
                className={`${navigationMenuTriggerStyle()} ${
                  isActive("/datasets") ? "bg-accent" : ""
                }`}
              >
                Datasets
              </Link>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <Link
                to="/augment-prompt"
                className={`${navigationMenuTriggerStyle()} ${
                  isActive("/augment-prompt") ? "bg-accent" : ""
                }`}
              >
                Prompt Augmentation
              </Link>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <Link
                to="/fine-tuning"
                className={`${navigationMenuTriggerStyle()} ${
                  isActive("/fine-tuning") ? "bg-accent" : ""
                }`}
              >
                Fine-tuning
              </Link>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>

        <div className="flex items-center gap-4">
          <Link
            to="/settings"
            className={`${navigationMenuTriggerStyle()} ${
              isActive("/settings") ? "bg-accent" : ""
            }`}
          >
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Link>
          <Button variant="outline" onClick={handleSignOut}>
            Sign Out
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Navigation;